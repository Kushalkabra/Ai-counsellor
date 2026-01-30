"""
Quick test script to verify database connection
"""
from database import engine, SessionLocal
from sqlalchemy import text

try:
    # Test connection
    with engine.connect() as conn:
        result = conn.execute(text("SELECT version()"))
        version = result.fetchone()[0]
        print("SUCCESS: Database connection successful!")
        print(f"PostgreSQL version: {version[:50]}...")
        
    # Test session
    db = SessionLocal()
    db.execute(text("SELECT 1"))
    db.close()
    print("SUCCESS: Database session test successful!")
    
except Exception as e:
    print(f"ERROR: Database connection failed: {e}")
    print("\nPlease check:")
    print("1. PostgreSQL service is running")
    print("2. DATABASE_URL in .env is correct")
    print("3. Database 'ai_counsellor' exists")
