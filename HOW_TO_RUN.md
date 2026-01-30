# How to Run the AI Counsellor Server

## Quick Start

### Backend Server (FastAPI)

1. **Open PowerShell or Terminal**

2. **Navigate to the backend directory:**
   ```powershell
   cd "C:\Users\Kushal\Desktop\AI Counsellor\backend"
   ```

3. **Activate the virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   You should see `(venv)` at the start of your prompt.

4. **Start the server:**
   ```powershell
   uvicorn main:app --reload
   ```

5. **You should see:**
   ```
   INFO:     Will watch for changes in these directories: ['C:\\Users\\Kushal\\Desktop\\AI Counsellor\\backend']
   INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
   INFO:     Started reloader process [xxxx] using WatchFiles
   INFO:     Started server process [xxxx]
   INFO:     Waiting for application startup.
   INFO:     Application startup complete.
   ```

6. **Verify it's working:**
   - Open browser: http://localhost:8000
   - You should see: `{"message":"AI Counsellor API is running"}`
   - API Docs: http://localhost:8000/docs

7. **To stop the server:**
   - Press `Ctrl+C` in the terminal

---

## Complete Setup (First Time Only)

### Before Running the Server

1. **Make sure PostgreSQL is running**
   - Check Windows Services or start it manually

2. **Create the database (if not done):**
   ```powershell
   cd backend
   .\venv\Scripts\Activate.ps1
   python create_database.py
   ```

3. **Set up .env file:**
   - Make sure `backend/.env` exists with:
     - DATABASE_URL
     - SECRET_KEY
     - GEMINI_API_KEY

4. **Seed the database (optional but recommended):**
   ```powershell
   python seed_data.py
   ```

---

## Frontend Server (Next.js)

### In a NEW terminal window:

1. **Navigate to frontend directory:**
   ```powershell
   cd "C:\Users\Kushal\Desktop\AI Counsellor\frontend"
   ```

2. **Install dependencies (first time only):**
   ```powershell
   npm install
   ```

3. **Start the frontend server:**
   ```powershell
   npm run dev
   ```

4. **You should see:**
   ```
   ▲ Next.js 14.0.4
   - Local:        http://localhost:3000
   ```

5. **Open in browser:**
   - Visit: http://localhost:3000

---

## Running Both Servers

You need **TWO terminal windows**:

### Terminal 1 - Backend:
```powershell
cd "C:\Users\Kushal\Desktop\AI Counsellor\backend"
.\venv\Scripts\Activate.ps1
uvicorn main:app --reload
```

### Terminal 2 - Frontend:
```powershell
cd "C:\Users\Kushal\Desktop\AI Counsellor\frontend"
npm run dev
```

---

## Troubleshooting

### "ModuleNotFoundError" or "No module named..."
**Solution:** Make sure virtual environment is activated:
```powershell
.\venv\Scripts\Activate.ps1
```

### "Database connection failed"
**Solution:** 
1. Check PostgreSQL is running
2. Verify `.env` file has correct DATABASE_URL
3. Run `python create_database.py` to create the database

### "Port 8000 already in use"
**Solution:** 
- Another process is using port 8000
- Stop the other process or change port: `uvicorn main:app --reload --port 8001`

### "Cannot activate venv"
**Solution:** 
- Run PowerShell as Administrator
- Or set execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `.\venv\Scripts\Activate.ps1` | Activate virtual environment |
| `uvicorn main:app --reload` | Start backend server |
| `python create_database.py` | Create database |
| `python seed_data.py` | Seed sample data |
| `npm run dev` | Start frontend server |
| `Ctrl+C` | Stop server |

---

## URLs

- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Frontend App:** http://localhost:3000
