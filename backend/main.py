from fastapi import FastAPI, Depends, HTTPException, status, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import Optional, List, Union, Any
import httpx
import os
import traceback
from datetime import datetime
from dotenv import load_dotenv

from database import SessionLocal, engine, Base
from models import User, Onboarding, University, ShortlistedUniversity, LockedUniversity, Todo, ApplicationDocument
from schemas import (
    UserCreate, UserResponse, Token, OnboardingCreate, OnboardingResponse, GoogleAuthRequest,
    UniversityResponse, ShortlistRequest, LockRequest, TodoCreate, TodoResponse, TodoUpdate,
    AICounsellorMessage, AICounsellorResponse, ApplicationDocumentResponse, ApplicationDocumentUpdate
)
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from ai_counsellor import AICounsellorService
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

load_dotenv()

Base.metadata.create_all(bind=engine)

# Ensure google_id column exists (Simple Migration)
try:
    with engine.connect() as conn:
        # Check if google_id column exists
        from sqlalchemy import text
        conn.execute(text("ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR UNIQUE"))
        # Ensure hashed_password is nullable
        conn.execute(text("ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL"))
        conn.commit()
except Exception as e:
    print(f"Migration note: {e}")

# Seed database if empty
from seed_db import seed_universities
try:
    seed_universities()
except Exception as e:
    print(f"Seed note: {e}")

app = FastAPI(title="AI Counsellor API", version="1.0.0")

# CORS middleware
# CORS middleware
raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001,http://localhost:5173,http://localhost:8080,https://ai-counsellor-two.vercel.app,https://ai-counsellor-vur1.onrender.com").split(",")
allowed_origins = []
for origin in raw_origins:
    o = origin.strip().rstrip("/")
    if o:
        allowed_origins.append(o)
        # If user forgot http/https, add both automatically
        if not o.startswith("http"):
            allowed_origins.append(f"https://{o}")
            allowed_origins.append(f"http://{o}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print(f"DEBUG: CORS Final Allowed List: {allowed_origins}")

# OAuth2 scheme is defined in auth.py
from auth import oauth2_scheme

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Health check
@app.get("/")
async def root():
    return {"message": "AI Counsellor API is running"}

# Authentication endpoints
@app.post("/api/auth/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@app.post("/api/auth/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/google", response_model=Token)
async def google_auth(auth_data: GoogleAuthRequest, db: Session = Depends(get_db)):
    try:
        # Verify the Google token
        client_id = os.getenv("GOOGLE_CLIENT_ID")
        if not client_id:
            raise HTTPException(status_code=500, detail="GOOGLE_CLIENT_ID not configured")
            
        idinfo = id_token.verify_oauth2_token(
            auth_data.credential, 
            google_requests.Request(), 
            client_id
        )

        email = idinfo['email']
        name = idinfo.get('name', email.split('@')[0])
        google_id = idinfo['sub']

        # Check if user exists
        user = db.query(User).filter((User.email == email) | (User.google_id == google_id)).first()

        if not user:
            # Create new user for social login
            user = User(
                email=email,
                full_name=name,
                google_id=google_id,
                hashed_password=None # No password for Google users
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        elif not user.google_id:
            # Link existing email account to Google ID
            user.google_id = google_id
            db.commit()

        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}

    except Exception as e:
        print("!!! GOOGLE AUTH ERROR !!!")
        traceback.print_exc()
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Google Authentication Internal Error: {str(e)}"
        )

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@app.delete("/api/auth/me")
async def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete user account and all associated data"""
    try:
        # Manual cascade delete to ensure everything goes
        # Import models here to avoid circular dependencies if any, though they are imported at top usually
        from models import Onboarding, ShortlistedUniversity, LockedUniversity, Todo, ApplicationDocument
        
        db.query(ApplicationDocument).filter(ApplicationDocument.user_id == current_user.id).delete()
        db.query(Todo).filter(Todo.user_id == current_user.id).delete()
        db.query(LockedUniversity).filter(LockedUniversity.user_id == current_user.id).delete()
        db.query(ShortlistedUniversity).filter(ShortlistedUniversity.user_id == current_user.id).delete()
        db.query(Onboarding).filter(Onboarding.user_id == current_user.id).delete()
        
        db.delete(current_user)
        db.commit()
        return {"message": "Account deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to delete account: {str(e)}")

# Onboarding endpoints
@app.post("/api/onboarding", response_model=OnboardingResponse)
async def create_onboarding(
    onboarding_data: OnboardingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if onboarding already exists
    existing = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    
    if existing:
        # Update existing onboarding
        for key, value in onboarding_data.dict().items():
            setattr(existing, key, value)
        existing.updated_at = datetime.utcnow()
    else:
        # Create new onboarding
        existing = Onboarding(user_id=current_user.id, **onboarding_data.dict())
        db.add(existing)
    
    db.commit()
    db.refresh(existing)
    
    # NEW: Sync tasks with the updated profile
    sync_tasks_with_onboarding(current_user.id, existing, db)
    
    # Mark user profile as complete
    current_user.profile_complete = True
    db.commit()
    
    return existing

def sync_tasks_with_onboarding(user_id: int, onboarding: Onboarding, db: Session):
    """Automatically mark tasks as completed based on profile status updates"""
    # 1. Test Scores Task
    if onboarding.ielts_toefl_status == "Completed":
        test_task = db.query(Todo).filter(
            Todo.user_id == user_id, 
            Todo.title.ilike("%test score%")
        ).first()
        if test_task and not test_task.completed:
            test_task.completed = True
            test_task.completed_at = datetime.utcnow()
            db.add(test_task)
            
    # 2. SOP Task
    if onboarding.sop_status == "Ready":
        sop_task = db.query(Todo).filter(
            Todo.user_id == user_id, 
            Todo.title.ilike("%SOP%")
        ).first()
        if sop_task and not sop_task.completed:
            sop_task.completed = True
            sop_task.completed_at = datetime.utcnow()
            db.add(sop_task)
            
    db.commit()

@app.get("/api/onboarding", response_model=OnboardingResponse)
async def get_onboarding(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    if not onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Onboarding not completed"
        )
    return onboarding

# Dashboard endpoints
@app.get("/api/dashboard/stage")
async def get_current_stage(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Determine current stage based on user progress"""
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    if not onboarding:
        return {"stage": 0, "stage_name": "Onboarding"}
    
    locked = db.query(LockedUniversity).filter(LockedUniversity.user_id == current_user.id).first()
    if locked:
        return {"stage": 4, "stage_name": "Preparing Applications"}
    
    shortlisted = db.query(ShortlistedUniversity).filter(ShortlistedUniversity.user_id == current_user.id).first()
    if shortlisted:
        return {"stage": 3, "stage_name": "Finalizing Universities"}
    
    return {"stage": 2, "stage_name": "Discovering Universities"}

async def fetch_external_universities(country: Optional[str] = None, name: Optional[str] = None) -> List[dict]:
    """Fetch universities from Hipolabs API"""
    url = "http://universities.hipolabs.com/search"
    params = {}
    if country:
        params["country"] = country
    if name:
        params["name"] = name
        
    headers = {"User-Agent": "AI-Counsellor-App/1.0"}
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params, headers=headers, timeout=10.0)
            if response.status_code == 200:
                data = response.json()
                return data
    except Exception as e:
        print(f"Error fetching external universities: {e}")
    return []

def get_or_create_university(name: str, country: str, db: Session) -> University:
    """Helper to sync external university to local DB"""
    uni = db.query(University).filter(University.name == name).first()
    if not uni:
        uni = University(
            name=name,
            country=country,
            degree_type="Master's", # Default
            field_of_study="General", # Default
            tuition_fee=30000, # Placeholder
            acceptance_rate=0.5, # Placeholder
            ranking=100, # Placeholder
            description=f"Automated entry for {name}"
        )
        db.add(uni)
        db.commit()
        db.refresh(uni)
    return uni

# University endpoints
@app.get("/api/universities", response_model=list[UniversityResponse])
async def get_universities(
    country: Optional[str] = None,
    degree: Optional[str] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user onboarding for filtering and personalized defaults
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    
    # 1. Fetch from local DB
    local_query = db.query(University)
    if country:
        local_query = local_query.filter(University.country == country)
    
    local_unis = local_query.all()
    
    # 2. Fetch from external API
    external_unis = []
    if country or search:
        # User specified a filter, fetch only that
        external_unis = await fetch_external_universities(country=country, name=search)
    elif len(local_unis) < 5:
        # DB has few results and no search! Fetch some defaults so it doesn't look empty.
        default_search_country = "United States"
        if onboarding and onboarding.preferred_countries:
            # Take the first country from comma separated list
            default_search_country = onboarding.preferred_countries.split(",")[0].strip()
            
        print(f"DEBUG: Local DB empty, fetching default universities for {default_search_country}")
        external_unis = await fetch_external_universities(country=default_search_country)
    
    # Merge and deduplicate by name
    # We prioritize local unis for metadata
    seen_names = {u.name for u in local_unis}
    
    result = []
    
    # Add local unis
    for uni in local_unis:
        uni_dict = {
            "id": uni.id,
            "name": uni.name,
            "country": uni.country,
            "degree_type": uni.degree_type,
            "field_of_study": uni.field_of_study,
            "tuition_fee": uni.tuition_fee,
            "acceptance_rate": uni.acceptance_rate,
            "ranking": uni.ranking,
            "description": uni.description,
        }
        
        if onboarding:
            uni_dict["category"] = "Target"
            uni_dict["acceptance_chance"] = calculate_acceptance_chance(uni, onboarding)
            uni_dict["why_fits"] = f"A solid target school in {uni.country}." # Simple version for merged list
        else:
            uni_dict["category"] = "Target"
            uni_dict["acceptance_chance"] = "Medium"
            uni_dict["why_fits"] = "Complete your profile to get personalized insights."
            
        result.append(uni_dict)
        
    # Add external unis with 'ext:' prefix
    for ext_uni in external_unis:
        if ext_uni["name"] in seen_names:
            continue
            
        result.append({
            "id": f"ext:{ext_uni['name']}",
            "name": ext_uni["name"],
            "country": ext_uni["country"],
            "degree_type": "Master's",
            "field_of_study": "Multiple",
            "tuition_fee": 0,
            "acceptance_rate": 0,
            "ranking": 0,
            "description": f"Website: {ext_uni['web_pages'][0] if ext_uni['web_pages'] else 'N/A'}",
            "category": "External",
            "acceptance_chance": "Medium",
            "why_fits": f"Discovered from global university registry."
        })
        seen_names.add(ext_uni["name"])
        
        # Limit to 100 results for performance
        if len(result) >= 100:
            break
            
    return result

def calculate_acceptance_chance(university: University, onboarding: Onboarding) -> str:
    """Logic to calculate acceptance chance based on GPA and Acceptance Rate"""
    score = 0
    
    # GPA Factor
    if onboarding.gpa:
        if onboarding.gpa >= 3.8:
            score += 3
        elif onboarding.gpa >= 3.5:
            score += 2
        elif onboarding.gpa >= 3.0:
            score += 1
            
    # University Selectivity Factor
    if university.acceptance_rate > 0.7:
        score += 2
    elif university.acceptance_rate > 0.4:
        score += 1
    elif university.acceptance_rate < 0.2:
        score -= 2
        
    # Determine chance
    if score >= 4:
        return "High"
    elif score >= 2:
        return "Medium"
    else:
        return "Low"

@app.post("/api/universities/shortlist")
async def shortlist_university(
    request: ShortlistRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uni_id = request.university_id
    
    # Handle external university
    if isinstance(uni_id, str) and uni_id.startswith("ext:"):
        uni_name = uni_id.replace("ext:", "")
        # For external, we need to know the country. 
        # But wait, ShortlistRequest only has university_id.
        # This is a bit problematic if we don't have country.
        # We can try to find it in the external API again or just placeholder.
        # Actually, let's just use placeholder 'Unknown' if we can't find it.
        uni = get_or_create_university(uni_name, "Unknown", db)
        uni_id = uni.id

    # Check if already shortlisted
    existing = db.query(ShortlistedUniversity).filter(
        ShortlistedUniversity.user_id == current_user.id,
        ShortlistedUniversity.university_id == uni_id
    ).first()
    
    if existing:
        # Toggle behavior: if exists, remove it (Un-shortlist)
        db.delete(existing)
        db.commit()
        return {"message": "University removed from shortlist", "id": None, "toggled": True}
    
    shortlisted = ShortlistedUniversity(
        user_id=current_user.id,
        university_id=uni_id
    )
    db.add(shortlisted)
    
    # Auto-complete "Shortlist Universities" todo if it exists
    todo = db.query(Todo).filter(
        Todo.user_id == current_user.id,
        Todo.title.ilike("%shortlist%")
    ).first()
    
    if todo and not todo.completed:
        todo.completed = True
        db.add(todo)
        
    db.commit()
    db.refresh(shortlisted)
    
    return {"message": "University shortlisted successfully", "id": shortlisted.id, "toggled": False}

@app.get("/api/universities/shortlisted", response_model=list[UniversityResponse])
async def get_shortlisted_universities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    shortlisted = db.query(ShortlistedUniversity).filter(
        ShortlistedUniversity.user_id == current_user.id
    ).all()
    
    result = []
    for item in shortlisted:
        uni = db.query(University).filter(University.id == item.university_id).first()
        if uni:
            result.append({
                "id": uni.id,
                "name": uni.name,
                "country": uni.country,
                "degree_type": uni.degree_type,
                "field_of_study": uni.field_of_study,
                "tuition_fee": uni.tuition_fee,
                "acceptance_rate": uni.acceptance_rate,
                "ranking": uni.ranking,
                "description": uni.description,
                "category": "Shortlisted",
                "acceptance_chance": "Medium"
            })
    
    return result

@app.post("/api/universities/lock")
async def lock_university(
    request: LockRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uni_id = request.university_id
    
    # Handle external university
    if isinstance(uni_id, str) and uni_id.startswith("ext:"):
        uni_name = uni_id.replace("ext:", "")
        uni = get_or_create_university(uni_name, "Unknown", db)
        uni_id = uni.id

    # Check if university is shortlisted
    shortlisted = db.query(ShortlistedUniversity).filter(
        ShortlistedUniversity.user_id == current_user.id,
        ShortlistedUniversity.university_id == uni_id
    ).first()
    
    if not shortlisted:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="University must be shortlisted before locking"
        )
    
    # Check if already locked
    existing = db.query(LockedUniversity).filter(
        LockedUniversity.user_id == current_user.id,
        LockedUniversity.university_id == uni_id
    ).first()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="University already locked"
        )
    
    locked = LockedUniversity(
        user_id=current_user.id,
        university_id=uni_id
    )
    db.add(locked)
    db.commit()
    db.refresh(locked)
    
    # Auto-generate to-dos for locked university
    from services import generate_application_todos
    generate_application_todos(current_user.id, locked.university_id, db)
    
    return {"message": "University locked successfully", "id": locked.id}

@app.delete("/api/universities/lock/{university_id}")
async def unlock_university(
    university_id: Union[int, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    actual_id = university_id
    if isinstance(university_id, str) and university_id.startswith("ext:"):
        uni_name = university_id.replace("ext:", "")
        uni = db.query(University).filter(University.name == uni_name).first()
        if not uni:
             raise HTTPException(status_code=404, detail="External university not found in local DB")
        actual_id = uni.id

    locked = db.query(LockedUniversity).filter(
        LockedUniversity.user_id == current_user.id,
        LockedUniversity.university_id == actual_id
    ).first()
    
    if not locked:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="University not found or not locked"
        )
    
    db.delete(locked)
    db.commit()
    
    return {"message": "University unlocked successfully"}

@app.get("/api/universities/locked", response_model=list[UniversityResponse])
async def get_locked_universities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    locked = db.query(LockedUniversity).filter(
        LockedUniversity.user_id == current_user.id
    ).all()
    
    result = []
    for item in locked:
        uni = db.query(University).filter(University.id == item.university_id).first()
        if uni:
            result.append({
                "id": uni.id,
                "name": uni.name,
                "country": uni.country,
                "degree_type": uni.degree_type,
                "field_of_study": uni.field_of_study,
                "tuition_fee": uni.tuition_fee,
                "acceptance_rate": uni.acceptance_rate,
                "ranking": uni.ranking,
                "description": uni.description,
                "category": "Locked",
                "acceptance_chance": "Medium"
            })
    
    return result


# Todo endpoints
@app.get("/api/todos", response_model=list[TodoResponse])
async def get_todos(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todos = db.query(Todo).filter(Todo.user_id == current_user.id).order_by(Todo.created_at.desc()).all()
    return todos

@app.post("/api/todos", response_model=TodoResponse)
async def create_todo(
    todo_data: TodoCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    uni_id = todo_data.university_id
    if isinstance(uni_id, str) and uni_id.startswith("ext:"):
        uni_name = uni_id.replace("ext:", "")
        uni = db.query(University).filter(University.name == uni_name).first()
        uni_id = uni.id if uni else None

    todo = Todo(
        user_id=current_user.id,
        university_id=uni_id,
        title=todo_data.title,
        description=todo_data.description
    )
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

@app.patch("/api/todos/{todo_id}", response_model=TodoResponse)
async def update_todo(
    todo_id: int,
    completed: bool = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    todo = db.query(Todo).filter(
        Todo.id == todo_id,
        Todo.user_id == current_user.id
    ).first()
    
    if not todo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Todo not found"
        )
    
    todo.completed = completed
    if completed:
        todo.completed_at = datetime.utcnow()
    else:
        todo.completed_at = None
    db.commit()
    db.refresh(todo)
    
    return todo

# Application Document Endpoints
@app.get("/api/applications/{university_id}/documents", response_model=list[ApplicationDocumentResponse])
async def get_application_documents(
    university_id: Union[int, str],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    actual_id = university_id
    if isinstance(university_id, str) and university_id.startswith("ext:"):
        uni_name = university_id.replace("ext:", "")
        uni = db.query(University).filter(University.name == uni_name).first()
        if not uni:
             return [] # Or raise error
        actual_id = uni.id

    # Check if user has locked this university
    locked = db.query(LockedUniversity).filter(
        LockedUniversity.user_id == current_user.id,
        LockedUniversity.university_id == actual_id
    ).first()
    
    if not locked:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="University not locked by user"
        )
        
    # Fetch existing documents
    documents = db.query(ApplicationDocument).filter(
        ApplicationDocument.user_id == current_user.id,
        ApplicationDocument.university_id == university_id
    ).all()
    
    # If no documents exist, generate them based on university country
    if not documents:
        university = db.query(University).filter(University.id == university_id).first()
        if not university:
            raise HTTPException(status_code=404, detail="University not found")
            
        default_docs = [
            "Statement of Purpose (SOP)",
            "Academic Transcripts",
            "Resume/CV"
        ]
        
        country_docs = []
        if university.country == "USA":
            country_docs = [
                "GRE/GMAT Scores",
                "Letters of Recommendation (3)",
                "Financial Proof (I-20)"
            ]
        elif university.country == "UK":
            country_docs = [
                "IELTS/TOEFL Scores",
                "Letters of Recommendation (2)",
                "CAS Letter Request"
            ]
        else:
            country_docs = [
                "Language Proficiency Score",
                "Letters of Recommendation (2)"
            ]
            
        all_docs = default_docs + country_docs
        
        new_documents = []
        for doc_name in all_docs:
            new_doc = ApplicationDocument(
                user_id=current_user.id,
                university_id=university_id,
                name=doc_name,
                is_completed=False
            )
            db.add(new_doc)
            new_documents.append(new_doc)
            
        db.commit()
        # Refresh to get IDs
        for doc in new_documents:
            db.refresh(doc)
            
        documents = new_documents
        
    return documents

@app.patch("/api/applications/documents/{document_id}", response_model=ApplicationDocumentResponse)
async def update_application_document(
    document_id: int,
    update_data: ApplicationDocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    document = db.query(ApplicationDocument).filter(
        ApplicationDocument.id == document_id,
        ApplicationDocument.user_id == current_user.id
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
        
    document.is_completed = update_data.is_completed
    db.commit()
    db.refresh(document)
    
    return document

# AI Counsellor Endpoint
@app.post("/api/ai-counsellor/chat", response_model=AICounsellorResponse)
async def ai_counsellor_chat(
    message_data: AICounsellorMessage,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Get user's onboarding profile
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    
    if not onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Please complete onboarding first"
        )
    
    # Get shortlisted and locked universities
    shortlisted = db.query(ShortlistedUniversity).filter(
        ShortlistedUniversity.user_id == current_user.id
    ).all()
    shortlisted_ids = [s.university_id for s in shortlisted]
    
    locked = db.query(LockedUniversity).filter(
        LockedUniversity.user_id == current_user.id
    ).all()
    locked_ids = [l.university_id for l in locked]
    
    # Initialize AI service and get response
    ai_service = AICounsellorService()
    result = await ai_service.get_response(
        user_message=message_data.message,
        user_profile=onboarding,
        shortlisted_universities=shortlisted_ids,
        locked_universities=locked_ids,
        db=db,
        current_user=current_user
    )
    
    return result

from schemas import SOPRequest

@app.post("/api/ai-counsellor/generate-sop")
async def generate_sop(
    request: SOPRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch resources
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    uni_id = request.university_id
    if isinstance(uni_id, str) and uni_id.startswith("ext:"):
        uni_name = uni_id.replace("ext:", "")
        university = db.query(University).filter(University.name == uni_name).first()
    else:
        university = db.query(University).filter(University.id == uni_id).first()
    
    if not onboarding or not university:
        raise HTTPException(status_code=400, detail="Profile or University not found")
        
    ai_service = AICounsellorService()
    sop_content = await ai_service.generate_sop(onboarding, university)
    
    return {"sop_content": sop_content}

from schemas import StrategyRequest

@app.post("/api/ai-counsellor/generate-strategy")
async def generate_strategy(
    request: StrategyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Fetch resources
    onboarding = db.query(Onboarding).filter(Onboarding.user_id == current_user.id).first()
    uni_id = request.university_id
    if isinstance(uni_id, str) and uni_id.startswith("ext:"):
        uni_name = uni_id.replace("ext:", "")
        university = db.query(University).filter(University.name == uni_name).first()
    else:
        university = db.query(University).filter(University.id == uni_id).first()
    
    if not onboarding or not university:
        raise HTTPException(status_code=400, detail="Profile or University not found")
        
    ai_service = AICounsellorService()
    strategy_points = await ai_service.generate_strategy(onboarding, university)
    
    return {"strategy_points": strategy_points}

# Helper function moved to services.py
from services import generate_application_todos

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
