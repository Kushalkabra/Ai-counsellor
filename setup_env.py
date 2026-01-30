"""
Helper script to create .env files for the AI Counsellor project
Run this script to interactively set up your environment variables
"""
import os
import secrets
import getpass

def generate_secret_key():
    """Generate a secure random secret key"""
    return secrets.token_urlsafe(32)

def create_backend_env():
    """Create backend/.env file"""
    print("\n" + "="*60)
    print("BACKEND ENVIRONMENT SETUP")
    print("="*60)
    
    # Database configuration
    print("\n📊 Database Configuration:")
    db_user = input("PostgreSQL username [postgres]: ").strip() or "postgres"
    db_password = getpass.getpass("PostgreSQL password: ")
    db_host = input("PostgreSQL host [localhost]: ").strip() or "localhost"
    db_port = input("PostgreSQL port [5432]: ").strip() or "5432"
    db_name = input("Database name [ai_counsellor]: ").strip() or "ai_counsellor"
    
    database_url = f"postgresql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    
    # Secret key
    print("\n🔐 Security Configuration:")
    use_generated = input("Generate a random SECRET_KEY? (y/n) [y]: ").strip().lower() or "y"
    if use_generated == "y":
        secret_key = generate_secret_key()
        print(f"✅ Generated SECRET_KEY: {secret_key[:20]}...")
    else:
        secret_key = getpass.getpass("Enter your SECRET_KEY (min 32 chars): ")
    
    # Gemini API key
    print("\n🤖 Gemini API Configuration:")
    print("Get your API key from: https://makersuite.google.com/app/apikey")
    gemini_key = getpass.getpass("Gemini API Key: ")
    
    # Create .env file
    env_content = f"""# Database Configuration
DATABASE_URL={database_url}

# Security
SECRET_KEY={secret_key}
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Gemini API Key
GEMINI_API_KEY={gemini_key}
"""
    
    backend_env_path = os.path.join("backend", ".env")
    with open(backend_env_path, "w") as f:
        f.write(env_content)
    
    print(f"\n✅ Backend .env file created at: {backend_env_path}")
    return True

def create_frontend_env():
    """Create frontend/.env.local file"""
    print("\n" + "="*60)
    print("FRONTEND ENVIRONMENT SETUP")
    print("="*60)
    
    api_url = input("\n🌐 Backend API URL [http://localhost:8000]: ").strip() or "http://localhost:8000"
    
    env_content = f"""# Backend API URL
NEXT_PUBLIC_API_URL={api_url}
"""
    
    frontend_env_path = os.path.join("frontend", ".env.local")
    with open(frontend_env_path, "w") as f:
        f.write(env_content)
    
    print(f"\n✅ Frontend .env.local file created at: {frontend_env_path}")
    return True

def main():
    print("\n" + "="*60)
    print("AI COUNSELLOR - ENVIRONMENT SETUP")
    print("="*60)
    print("\nThis script will help you create the .env files needed for the project.")
    print("Make sure you have:")
    print("  ✅ PostgreSQL installed and running")
    print("  ✅ Database 'ai_counsellor' created")
    print("  ✅ Gemini API key from Google AI Studio")
    print("\nPress Ctrl+C to cancel at any time.\n")
    
    try:
        input("Press Enter to continue...")
        
        # Create backend .env
        if not os.path.exists("backend"):
            print("❌ Error: 'backend' directory not found. Make sure you're in the project root.")
            return
        
        if not os.path.exists("frontend"):
            print("❌ Error: 'frontend' directory not found. Make sure you're in the project root.")
            return
        
        create_backend_env()
        create_frontend_env()
        
        print("\n" + "="*60)
        print("✅ SETUP COMPLETE!")
        print("="*60)
        print("\nNext steps:")
        print("1. Verify your .env files are correct")
        print("2. Install backend dependencies: cd backend && pip install -r requirements.txt")
        print("3. Install frontend dependencies: cd frontend && npm install")
        print("4. Start the backend: cd backend && uvicorn main:app --reload")
        print("5. Seed the database: cd backend && python seed_data.py")
        print("6. Start the frontend: cd frontend && npm run dev")
        print("\n")
        
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user.")
    except Exception as e:
        print(f"\n❌ Error: {e}")

if __name__ == "__main__":
    main()
