from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# User schemas
class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    profile_complete: bool
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class GoogleAuthRequest(BaseModel):
    credential: str

# Onboarding schemas
class OnboardingCreate(BaseModel):
    current_education_level: Optional[str] = None
    degree_major: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None
    intended_degree: Optional[str] = None
    field_of_study: Optional[str] = None
    target_intake_year: Optional[int] = None
    preferred_countries: Optional[str] = None
    budget_per_year: Optional[float] = None
    funding_plan: Optional[str] = None
    ielts_toefl_status: Optional[str] = None
    ielts_toefl_score: Optional[float] = None
    gre_gmat_status: Optional[str] = None
    gre_gmat_score: Optional[float] = None
    sop_status: Optional[str] = None

class OnboardingResponse(BaseModel):
    id: int
    user_id: int
    current_education_level: Optional[str]
    degree_major: Optional[str]
    graduation_year: Optional[int]
    gpa: Optional[float]
    intended_degree: Optional[str]
    field_of_study: Optional[str]
    target_intake_year: Optional[int]
    preferred_countries: Optional[str]
    budget_per_year: Optional[float]
    funding_plan: Optional[str]
    ielts_toefl_status: Optional[str]
    ielts_toefl_score: Optional[float]
    gre_gmat_status: Optional[str]
    gre_gmat_score: Optional[float]
    sop_status: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

from typing import Optional, List, Union

# University schemas
class UniversityResponse(BaseModel):
    id: Union[int, str]
    name: str
    country: str
    degree_type: Optional[str]
    field_of_study: Optional[str]
    tuition_fee: Optional[float]
    acceptance_rate: Optional[float]
    ranking: Optional[int]
    description: Optional[str]
    category: Optional[str] = None  # Dream, Target, Safe
    acceptance_chance: Optional[str] = None  # Low, Medium, High
    why_fits: Optional[str] = None
    
    class Config:
        from_attributes = True

class ShortlistRequest(BaseModel):
    university_id: Union[int, str]

class LockRequest(BaseModel):
    university_id: Union[int, str]

# Todo schemas
class TodoCreate(BaseModel):
    title: str
    description: Optional[str] = None
    university_id: Optional[Union[int, str]] = None

class TodoResponse(BaseModel):
    id: int
    user_id: int
    university_id: Optional[int]
    title: str
    description: Optional[str]
    completed: bool
    completed_at: Optional[datetime]
    created_at: datetime
    
    class Config:
        from_attributes = True

class TodoUpdate(BaseModel):
    completed: bool

# AI Counsellor schemas
class AICounsellorMessage(BaseModel):
    message: str

class AIAction(BaseModel):
    type: str  # shortlist_university, lock_university, create_task, update_task, none
    payload: dict = {}

class AICounsellorResponse(BaseModel):
    message: str
    action: Optional[AIAction] = None
    reasoning: Optional[str] = None
    # System state updates for frontend sync
    updated_stage: Optional[str] = None
    shortlisted_universities: Optional[List[int]] = None
    locked_universities: Optional[List[int]] = None
    tasks: Optional[List[dict]] = None

# Application Document schemas
class ApplicationDocumentResponse(BaseModel):
    id: int
    user_id: int
    university_id: int
    name: str
    is_completed: bool
    
    class Config:
        from_attributes = True

class SOPRequest(BaseModel):
    university_id: Union[int, str]
    
    class Config:
        from_attributes = True

class StrategyRequest(BaseModel):
    university_id: Union[int, str]

class ApplicationDocumentUpdate(BaseModel):
    is_completed: bool
