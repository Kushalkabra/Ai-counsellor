import requests
import json
import os
import re
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Onboarding, University, ShortlistedUniversity, LockedUniversity, Todo, User
from schemas import AIAction, AICounsellorResponse

load_dotenv()

class AICounsellorService:
    def __init__(self):
        # Try Groq first (free and fast), fallback to Gemini if available
        self.groq_api_key = os.getenv("GROQ_API_KEY")
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        
        if self.groq_api_key:
            self.provider = "groq"
            self.api_key = self.groq_api_key
            # Groq API endpoint - using Llama 3.3 70B (free tier)
            self.base_url = "https://api.groq.com/openai/v1/chat/completions"
            self.model = "llama-3.3-70b-versatile"
        elif self.gemini_api_key:
            self.provider = "gemini"
            self.api_key = self.gemini_api_key
            self.base_url = "https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent"
            self.model = "gemini-2.0-flash"
        else:
            raise ValueError("No API key found. Set either GROQ_API_KEY or GEMINI_API_KEY in .env file")
    
    async def get_response(
        self,
        user_message: str,
        user_profile: Onboarding,
        shortlisted_universities: List[int],
        locked_universities: List[int],
        db: Session,
        current_user: User
    ) -> Dict[str, Any]:
        
        # 1. Determine Current Stage
        current_stage = self._determine_stage(shortlisted_universities, locked_universities)
        
        # 2. Build Context
        profile_context = self._build_profile_context(user_profile)
        university_context = self._build_university_context(shortlisted_universities, locked_universities, db)
        available_universities = self._build_available_universities(db, user_profile)
        
        # 3. Construct System Prompt (Strict JSON)
        system_prompt = f"""You are an expert AI Study Abroad Counsellor. Your goal is to guide the student towards admission by taking CONCRETE ACTIONS.
        
You are NOT a simple chatbot. You are a Proactive Decision Engine and Academic Analyst.
Your output must be strict JSON. Do not output markdown blocks or plain text.

==== MISSION ====
1. ANALYZE the student's profile (GPA, Degree, Budget) against available universities.
2. RECOMMEND specific universities by their FULL NAME. Do NOT use "ID:" prefixes in your message to the student.
3. TAKE ACTIONS: Automatically shortlist universities ONLY if the user EXPLICITLY shows interest (e.g., "Add to my list", "I like this"), and lock a university when they decide to apply. Use the University ID for the JSON action payload.

==== STUDENT PROFILE ====
{profile_context}

==== CURRENT STAGE: {current_stage} ====
Context-aware guidance:
- UNIVERSITY_DISCOVERY: Focus on finding the best fit. Suggest shortlisting 3-5 options.
- UNIVERSITY_FINALIZATION: Help the user compare their shortlist and pick ONE to lock.
- APPLICATION_PREPARATION: Focus on the locked university. Generate tasks for SOP, LORs, etc.

==== CURRENT STATUS ====
{university_context}

==== AVAILABLE UNIVERSITIES (MATCHED TO PROFILE) ====
{available_universities}

==== AVAILABLE ACTIONS (USE SPARINGLY BUT DECISIVELY) ====
1. shortlist_university: Save a university to the student's list. 
   Payload: {{"university_id": <int>}}
2. lock_university: Set a university as a final application target. You can lock multiple universities if the student wants to apply to several.
   Payload: {{"university_id": <int>}}
3. create_task: Add a custom to-do for the student.
   Payload: {{"title": "<string>", "description": "<string>"}}
4. none: Use this ONLY if you are just answering a general question without needing a system action.

==== RESPONSE FORMAT (JSON ONLY) ====
{{
  "message": "Your response in Markdown. Use university names, not IDs. Be concise but analytical. If recommending, explain WHY based on GPA/Budget (format currency nicely as $XX,XXX). If shortlisting/locking, confirm it clearly.",
  "actions": [
    {{
      "type": "shortlist_university | lock_university | create_task | none",
      "payload": {{ ... }}
    }}
  ],
  "reasoning": "Brief internal logic for your decision"
}}

==== CRITICAL RULES ====
- NEVER show "ID:" or numeric IDs in the 'message' field. Use the university's Name instead.
- If the user says anything like 'Analyze universities for me' or 'What are my options?', pick from the available universities list and provide a detailed analysis.
- Do NOT shortlist universities just because you are recommending them. Only shortlist if the user says 'I like [Uni]', 'Add [Uni]', or similar.
- If the user says 'I want to apply to [Uni]', use 'lock_university'.

==== USER INPUT ====
{user_message}
"""

        # 3. Call AI
        try:
            response_text = self._call_llm(system_prompt)
            print(f"DEBUG: Raw LLM Response: {response_text}") # Debug log
            
            # 4. Parse JSON
            parsed_response = self._parse_json_response(response_text)
        except Exception as e:
            # Fallback for LLM failure
            return {
                "message": f"I'm having trouble thinking right now. Error: {str(e)}",
                "actions": [],
                "reasoning": "LLM Failure",
                "updated_stage": current_stage
            }
            
        # 5. Execute Action
        self._execute_actions(parsed_response.get("actions", []), current_stage, db, current_user)
        
        # 6. Fetch Updated State
        updated_state = self._get_updated_state(db, current_user)
        
        # 7. Construct Final Response
        return {
            "message": parsed_response.get("message"),
            "actions": parsed_response.get("actions"),
            "reasoning": parsed_response.get("reasoning"),
            **updated_state # Merges updated lists
        }

    def _call_llm(self, prompt: str) -> str:
        """Handles API call to Groq or Gemini"""
        try:
            if self.provider == "groq":
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                }
                payload = {
                    "model": self.model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3, # Lower temperature for valid JSON
                    "response_format": {"type": "json_object"} 
                }
                response = requests.post(self.base_url, headers=headers, json=payload, timeout=30)
                
                if response.status_code != 200:
                    raise Exception(f"Groq Error: {response.text}")
                    
                return response.json()['choices'][0]['message']['content']
                
            else: # Gemini
                headers = {"Content-Type": "application/json"}
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"response_mime_type": "application/json"}
                }
                response = requests.post(f"{self.base_url}?key={self.api_key}", headers=headers, json=payload, timeout=30)
                
                if response.status_code != 200:
                    raise Exception(f"Gemini Error: {response.text}")
                    
                return response.json()['candidates'][0]['content']['parts'][0]['text']
        except Exception as e:
            raise e

    def _parse_json_response(self, raw_text: str) -> Dict[str, Any]:
        """Robuts JSON parsing from LLM output"""
        try:
            # Remove markdown code blocks if present
            clean_text = re.sub(r'```json\s*', '', raw_text)
            clean_text = re.sub(r'```\s*', '', clean_text)
            return json.loads(clean_text)
        except json.JSONDecodeError:
            # Fallback if invalid JSON
            return {
                "message": raw_text,
                "actions": [{"type": "none", "payload": {}}],
                "reasoning": "Failed to parse structured response"
            }

    def _execute_actions(self, actions: List[Dict[str, Any]], stage: str, db: Session, user: User):
        """Executes a list of actions on the database"""
        if not actions:
            return

        # Ensure actions is a list (handle legacy singular format if LLM messes up)
        if isinstance(actions, dict):
            actions = [actions]
            
        for action in actions:
            if not action or action.get("type") == "none":
                continue
                
            action_type = action.get("type")
            payload = action.get("payload", {})
            
            # STAGE ENFORCEMENT & LOGIC
            if action_type == "shortlist_university":
                # Allowed in DISCOVERY
                # Logic: Add to shortlist
                uni_id = payload.get("university_id")
                if uni_id:
                    existing = db.query(ShortlistedUniversity).filter_by(user_id=user.id, university_id=uni_id).first()
                    if not existing:
                        db.add(ShortlistedUniversity(user_id=user.id, university_id=uni_id))
                        db.commit()

            elif action_type == "lock_university":
                # Allowed in FINALIZATION
                uni_id = payload.get("university_id")
                if uni_id:
                     # Check if ALREADY locked (this specific one)
                    existing_lock = db.query(LockedUniversity).filter_by(user_id=user.id, university_id=uni_id).first()
                    
                    if existing_lock:
                         # Already locked, do nothing
                        continue
                    
                    # Add new lock (Multiple Auto-lock allowed now)
                    db.add(LockedUniversity(user_id=user.id, university_id=uni_id))
                    
                    # Also ensure it is shortlisted
                    short = db.query(ShortlistedUniversity).filter_by(user_id=user.id, university_id=uni_id).first()
                    if not short:
                        db.add(ShortlistedUniversity(user_id=user.id, university_id=uni_id))
                    
                    # Trigger auto-tasks
                    from services import generate_application_todos
                    generate_application_todos(user.id, uni_id, db)
                    db.commit()

            elif action_type == "create_task":
                 # Allowed in PREPARATION
                 title = payload.get("title")
                 desc = payload.get("description", "")
                 if title:
                     db.add(Todo(user_id=user.id, title=title, description=desc))
                     db.commit()

    async def generate_sop(self, user_profile: Onboarding, university: University) -> str:
        """Generates a tailored Statement of Purpose"""
        prompt = f"""
        ACT AS: An expert study abroad consultant and professional writer.
        TASK: Write a compelling Statement of Purpose (SOP) for a student applying to {university.name}.
        
        STUDENT PROFILE:
        - Degree: {user_profile.current_education_level}
        - GPA: {user_profile.gpa}
        - Target Intake: {user_profile.target_intake_year}
        
        UNIVERSITY DETAILS:
        - Name: {university.name}
        - Country: {university.country}
        - Program: {university.field_of_study} ({university.degree_type})
        
        INSTRUCTIONS:
        1. Write a structured 500-word SOP.
        2. Introduction: Hook the reader, mention passion for {university.field_of_study}.
        3. Academic Background: Highlight GPA and relevant skills.
        4. Why This University: specific reasons (curriculum, research, faculty).
        5. Future Goals: How this degree helps career.
        6. Conclusion: Strong closing.
        7. OUTPUT FORMAT: Plain text, well-structured paragraphs. No JSON.
        """
        
        try:
            # We need to force non-JSON response for SOP if possible, or just extract content
            # The _call_llm method currently forces JSON format for Groq/Gemini.
            # We should probably modify _call_llm or override it here. 
            # For simplicity, let's ask for JSON with a "content" field to keep _call_llm compatible.
            
            json_prompt = prompt + '\n\nRESPONSE FORMAT: JSON with a single field "sop_content" containing the full text.'
            
            response_json = self._call_llm(json_prompt)
            parsed = self._parse_json_response(response_json)
            return parsed.get("sop_content", "Failed to generate SOP content.")
            
        except Exception as e:
            return f"Error generating SOP: {str(e)}"
    async def generate_strategy(self, user_profile: Onboarding, university: University) -> List[str]:
        """Generates 4 personalized admission strategy points"""
        prompt = f"""
        ACT AS: An expert study abroad consultant.
        TASK: Create a winning admission strategy for a student applying to {university.name}.
        
        STUDENT PROFILE:
        - Degree: {user_profile.current_education_level} in {user_profile.degree_major} ({user_profile.graduation_year})
        - GPA: {user_profile.gpa}
        - Target Intake: {user_profile.target_intake_year}
        - Experience: {user_profile.sop_status} (SOP status implies progress)
        
        UNIVERSITY DETAILS:
        - Name: {university.name}
        - Country: {university.country}
        - Program: {university.field_of_study} ({university.degree_type})
        - Selectivity: {university.acceptance_rate}
        
        INSTRUCTIONS:
        1. Generate EXACTLY 4 distinct, actionable strategy points.
        2. Points should be specific to the university's values (research, leadership, diversity) and the student's profile (highlighting strengths, mitigating weaknesses).
        3. Do NOT include generic advice like "study hard". 
        4. Focus on SOP angles, LOR selection, unique profile pitching, or specific things to mention in application.
        5. OUTPUT FORMAT: JSON with a single field "strategy_points" which is a list of 4 strings.
        """
        
        try:
            response_json = self._call_llm(prompt)
            parsed = self._parse_json_response(response_json)
            points = parsed.get("strategy_points", [])
            # Fallback if list is empty or wrong format
            if not points or not isinstance(points, list):
                return [
                    f"Tailor your SOP to match {university.name}'s specific research in {university.field_of_study}.",
                    "Secure LORs that highlight your technical project experience.",
                    "Demonstrate leadership impacting your local community.",
                    "Submit your application early to show strong interest."
                ]
            return points[:4] # Ensure max 4
            
        except Exception as e:
            print(f"Error generating strategy: {e}")
            return [
                "Tailor your SOP to the program's specific strengths.",
                "Highlight relevant academic projects.",
                "Ensure your LORs are from credible academic sources.",
                "Review the specific admission requirements carefully."
            ]

    async def generate_university_details(self, user_profile: Onboarding, university: University) -> Dict[str, Any]:
        """Generates a comprehensive AI analysis for a dynamic university details page"""
        prompt = f"""
        ACT AS: An elite Study Abroad Strategist and Senior Academic Analyst.
        TASK: Generate a high-end, personalized analysis of {university.name} for a student.
        
        STUDENT PROFILE:
        - Degree: {user_profile.current_education_level} in {user_profile.degree_major} ({user_profile.graduation_year})
        - GPA: {user_profile.gpa}
        - Budget: ${user_profile.budget_per_year}/yr
        - Field: {user_profile.field_of_study}
        - Tests: IELTS/TOEFL {user_profile.ielts_toefl_score}, GRE/GMAT {user_profile.gre_gmat_score}
        
        UNIVERSITY DATA:
        - Name: {university.name}
        - Country: {university.country}
        - Acceptance Rate: {university.acceptance_rate}%
        - Tuition: ${university.tuition_fee}/yr
        - Ranking: #{university.ranking}
        - Degree: {university.degree_type} in {university.field_of_study}
        
        REQUIRED OUTPUT JSON (Fields must match exactly):
        1. "city": Based on real data for this university.
        2. "founded": Year founded (integer).
        3. "students": Student population (e.g., "15,000+").
        4. "programs": 6 major/popular program names.
        5. "requirements": List of objects {{"name": "...", "status": "met"|"partial"|"pending"}}. 
           - Map them reasonably against student profile (GPA, Score, SOP status).
        6. "deadlines": 2 objects {{"intake": "...", "deadline": "..."}} (Based on typical cycles).
        7. "personal_match_analysis": {{
            "status": "Dream", "Target", or "Safe",
            "chance": "Low", "Medium", or "High",
            "reason": "Sophisticated 2-sentence link between student profile and uni academic standing."
           }}
        8. "ai_insights": 4 bullet points of high-level advice unique to this student/uni pair.
        9. "campus_culture": Vivid, premium 3-sentence description of the life, spirit, and research environment.
        10. "tuition_display": e.g., "$55k/year".
        11. "acceptance_rate_display": e.g., "{university.acceptance_rate}%".

        OUTPUT FORMAT: Strict JSON only.
        """
        
        try:
            response_json = self._call_llm(prompt)
            data = self._parse_json_response(response_json)
            # Ensure basic fields are present to prevent frontend crashes
            defaults = {
                "city": university.country,
                "founded": 1900,
                "students": "10,000+",
                "programs": ["CS", "Engineering", "Business"],
                "requirements": [{"name": "GPA Check", "status": "met"}],
                "deadlines": [{"intake": "Fall 2025", "deadline": "Jan 1st"}],
                "personal_match_analysis": {"status": "Target", "chance": "Medium", "reason": "Good match."},
                "ai_insights": ["Keep your GPA high.", "Focus on your SOP."],
                "campus_culture": "A great campus environment.",
                "tuition_display": f"${university.tuition_fee}/yr",
                "acceptance_rate_display": f"{university.acceptance_rate}%"
            }
            for k, v in defaults.items():
                if k not in data:
                    data[k] = v
            return data
        except Exception as e:
            print(f"Error generating details: {e}")
            return {
                "city": university.country,
                "founded": 1900,
                "students": "10,000+",
                "programs": ["Information Technology", "Business", "Arts"],
                "requirements": [
                    {"name": "GPA 3.0+", "status": "met"},
                    {"name": "IELTS 6.5+", "status": "partial"},
                    {"name": "SOP", "status": "pending"}
                ],
                "deadlines": [{"intake": "Fall 2025", "deadline": "March 15, 2025"}],
                "personal_match_analysis": {
                    "status": "Target",
                    "chance": "Medium",
                    "reason": "This university's standards match your academic background well."
                },
                "ai_insights": [
                    "Focus on your personal statement",
                    "Consider research opportunities",
                    "Location offers good internship prospects"
                ],
                "campus_culture": "A vibrant academic environment focused on excellence and innovation.",
                "tuition_display": f"${university.tuition_fee}/yr",
                "acceptance_rate_display": f"{university.acceptance_rate}%"
            }
    
    def _determine_stage(self, shortlisted: List[int], locked: List[int]) -> str:
        if locked: return "APPLICATION_PREPARATION"
        if shortlisted: return "UNIVERSITY_FINALIZATION"
        return "UNIVERSITY_DISCOVERY"

    def _get_updated_state(self, db: Session, user: User) -> Dict[str, Any]:
        shortlisted = db.query(ShortlistedUniversity).filter_by(user_id=user.id).all()
        locked = db.query(LockedUniversity).filter_by(user_id=user.id).all()
        tasks = db.query(Todo).filter_by(user_id=user.id).all()
        
        return {
            "updated_stage": self._determine_stage([s.university_id for s in shortlisted], [l.university_id for l in locked]),
            "shortlisted_universities": [s.university_id for s in shortlisted],
            "locked_universities": [l.university_id for l in locked],
            "tasks": [{"id": t.id, "title": t.title, "status": "done" if t.completed else "pending"} for t in tasks]
        }

    # Helpers
    def _build_profile_context(self, profile: Onboarding) -> str:
        return f"""GPA: {profile.gpa}, Degree: {profile.intended_degree}, Field: {profile.field_of_study}, 
        Budget: ${profile.budget_per_year}, Exams: {profile.ielts_toefl_status}"""
        
    def _build_university_context(self, short: List[int], locked: List[int], db: Session) -> str:
        s_objs = db.query(University).filter(University.id.in_(short)).all() if short else []
        l_objs = db.query(University).filter(University.id.in_(locked)).all() if locked else []
        
        return f"""Shortlisted: {', '.join([u.name for u in s_objs])}
        Locked: {', '.join([u.name for u in l_objs])}"""

    def _build_available_universities(self, db: Session, profile: Onboarding) -> str:
        # Fetch universities that match user's preferred countries
        query = db.query(University)
        
        pref_countries = []
        if profile.preferred_countries:
            pref_countries = [c.strip() for c in profile.preferred_countries.split(",")]
            # Filter specifically for these countries
            query = query.filter(University.country.in_(pref_countries))
        
        # Get matching unis
        matches = query.limit(20).all()
        
        # If we don't have enough matches, add some generic top ones
        if len(matches) < 10:
            others = db.query(University).filter(~University.id.in_([u.id for u in matches])).limit(10).all()
            matches.extend(others)
            
        return "\n".join([
            f"ID: {u.id} | {u.name} | {u.country} | Cost: ${u.tuition_fee}/yr | Acceptance: {u.acceptance_rate}% | Ranking: #{u.ranking}" 
            for u in matches
        ])
