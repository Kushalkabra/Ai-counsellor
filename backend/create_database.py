"""
Script to create the ai_counsellor database if it doesn't exist
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
from dotenv import load_dotenv

load_dotenv()

# Get database URL from .env
database_url = os.getenv("DATABASE_URL", "postgresql://postgres:password@localhost:5432/ai_counsellor")

# Parse the database URL to get connection details
# Format: postgresql://user:password@host:port/database
try:
    # Extract parts from the URL
    url_parts = database_url.replace("postgresql://", "").split("/")
    db_name = url_parts[-1] if len(url_parts) > 1 else "ai_counsellor"
    
    auth_part = url_parts[0].split("@")
    if len(auth_part) == 2:
        user_pass = auth_part[0].split(":")
        username = user_pass[0]
        password = ":".join(user_pass[1:]) if len(user_pass) > 1 else ""
        
        host_port = auth_part[1].split(":")
        host = host_port[0]
        port = int(host_port[1]) if len(host_port) > 1 else 5432
    else:
        raise ValueError("Invalid DATABASE_URL format")
    
    # Connect to PostgreSQL server (not to the specific database)
    # We'll connect to the default 'postgres' database to create our database
    print(f"Connecting to PostgreSQL at {host}:{port} as {username}...")
    conn = psycopg2.connect(
        host=host,
        port=port,
        user=username,
        password=password,
        database="postgres"  # Connect to default postgres database
    )
    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
    
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname = %s", (db_name,))
    exists = cursor.fetchone()
    
    if exists:
        print(f"Database '{db_name}' already exists!")
    else:
        # Create database
        print(f"Creating database '{db_name}'...")
        cursor.execute(f'CREATE DATABASE "{db_name}"')
        print(f"SUCCESS: Database '{db_name}' created successfully!")
    
    cursor.close()
    conn.close()
    
except psycopg2.OperationalError as e:
    print(f"ERROR: Error connecting to PostgreSQL: {e}")
    print("\nPossible issues:")
    print("1. PostgreSQL service is not running")
    print("2. Wrong username/password in DATABASE_URL")
    print("3. Wrong host/port in DATABASE_URL")
    print("\nPlease check your .env file and make sure PostgreSQL is running.")
except Exception as e:
    print(f"ERROR: {e}")
    print("\nPlease check your DATABASE_URL in the .env file.")
