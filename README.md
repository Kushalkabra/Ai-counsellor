# AI Counsellor - Hackathon Project

A guided, stage-based platform designed to help students make confident and informed study-abroad decisions.

## Project Structure

```
AI Counsellor/
├── frontend/          # Next.js frontend application
├── backend/           # FastAPI backend application
├── database/          # PostgreSQL schema and migrations
└── README.md
```

## Tech Stack

- **Frontend**: Next.js 14 (React) with TypeScript
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL
- **AI**: Google Gemini API
- **Styling**: Tailwind CSS

## Prerequisites

- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- Google Gemini API key (get one from [Google AI Studio](https://makersuite.google.com/app/apikey))

## Setup Instructions

### 1. Database Setup

Create a PostgreSQL database:
```sql
CREATE DATABASE ai_counsellor;
```

### 2. Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables:
```bash
# Copy the example file
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL: postgresql://user:password@localhost:5432/ai_counsellor
# - SECRET_KEY: Generate a random secret key
# - GEMINI_API_KEY: Your Google Gemini API key
```

5. Start the server:
```bash
uvicorn main:app --reload
```

6. Seed sample university data (in a new terminal):
```bash
cd backend
python seed_data.py
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`

### 3. Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Quick Start

1. Start PostgreSQL database
2. Start backend server (port 8000)
3. Seed university data: `python backend/seed_data.py`
4. Start frontend server (port 3000)
5. Visit `http://localhost:3000`
6. Sign up for a new account
7. Complete onboarding
8. Start exploring universities and chatting with the AI Counsellor!

## Features

- ✅ Landing Page
- ✅ Authentication (Signup/Login)
- ✅ Mandatory Onboarding
- ✅ Dashboard with Stage Indicators
- ✅ AI Counsellor Chat Interface
- ✅ University Discovery & Shortlisting
- ✅ University Locking
- ✅ Application Guidance & To-Dos
- ✅ Profile Management

## API Endpoints

See `backend/README.md` for detailed API documentation.
