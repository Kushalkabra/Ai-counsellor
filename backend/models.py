from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, unique=True, index=True, nullable=True)
    profile_complete = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    onboarding = relationship("Onboarding", back_populates="user", uselist=False, cascade="all, delete-orphan")
    shortlisted_universities = relationship("ShortlistedUniversity", back_populates="user", cascade="all, delete-orphan")
    locked_universities = relationship("LockedUniversity", back_populates="user", cascade="all, delete-orphan")
    todos = relationship("Todo", back_populates="user", cascade="all, delete-orphan")
    application_documents = relationship("ApplicationDocument", back_populates="user", cascade="all, delete-orphan")

class Onboarding(Base):
    __tablename__ = "onboarding"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    
    # Academic Background
    current_education_level = Column(String)
    degree_major = Column(String)
    graduation_year = Column(Integer)
    gpa = Column(Float)
    
    # Study Goal
    intended_degree = Column(String)  # Bachelor's, Master's, MBA, PhD
    field_of_study = Column(String)
    target_intake_year = Column(Integer)
    preferred_countries = Column(String)  # Comma-separated
    
    # Budget
    budget_per_year = Column(Float)
    funding_plan = Column(String)  # Self-funded, Scholarship-dependent, Loan-dependent
    
    # Exams & Readiness
    ielts_toefl_status = Column(String)  # Not started, In progress, Completed
    ielts_toefl_score = Column(Float, nullable=True)
    gre_gmat_status = Column(String)  # Not started, In progress, Completed
    gre_gmat_score = Column(Float, nullable=True)
    sop_status = Column(String)  # Not started, Draft, Ready
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="onboarding")

class University(Base):
    __tablename__ = "universities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False, index=True)
    degree_type = Column(String)  # Bachelor's, Master's, MBA, PhD
    field_of_study = Column(String)
    tuition_fee = Column(Float)
    acceptance_rate = Column(Float)
    ranking = Column(Integer)
    description = Column(Text)
    
    shortlisted_by = relationship("ShortlistedUniversity", back_populates="university")
    locked_by = relationship("LockedUniversity", back_populates="university")
    todos = relationship("Todo", back_populates="university")

class ShortlistedUniversity(Base):
    __tablename__ = "shortlisted_universities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="shortlisted_universities")
    university = relationship("University", back_populates="shortlisted_by")

class LockedUniversity(Base):
    __tablename__ = "locked_universities"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="locked_universities")
    university = relationship("University", back_populates="locked_by")

class Todo(Base):
    __tablename__ = "todos"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=True)
    title = Column(String, nullable=False)
    description = Column(Text)
    completed = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="todos")
    university = relationship("University", back_populates="todos")

class ApplicationDocument(Base):
    __tablename__ = "application_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    university_id = Column(Integer, ForeignKey("universities.id"), nullable=False)
    name = Column(String, nullable=False)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="application_documents")
    university = relationship("University")
