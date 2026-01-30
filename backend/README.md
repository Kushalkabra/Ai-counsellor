# AI Counsellor Backend

FastAPI backend for the AI Counsellor application.

## Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Set up PostgreSQL database:**
   - Create a PostgreSQL database named `ai_counsellor`
   - Update the `DATABASE_URL` in `.env` file

3. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Fill in your database credentials and Gemini API key:
     ```
     DATABASE_URL=postgresql://user:password@localhost:5432/ai_counsellor
     SECRET_KEY=your-secret-key-here
     GEMINI_API_KEY=your-gemini-api-key-here
     ```

4. **Initialize database:**
   - The database tables will be created automatically when you run the server
   - Seed sample university data:
     ```bash
     python seed_data.py
     ```

5. **Run the server:**
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Key Endpoints

- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/onboarding` - Complete onboarding
- `GET /api/onboarding` - Get onboarding data
- `GET /api/dashboard/stage` - Get current stage
- `GET /api/universities` - List universities
- `POST /api/universities/shortlist` - Shortlist university
- `POST /api/universities/lock` - Lock university
- `POST /api/ai-counsellor/chat` - Chat with AI counsellor
- `GET /api/todos` - Get todos
- `POST /api/todos` - Create todo
- `PATCH /api/todos/{id}` - Update todo
