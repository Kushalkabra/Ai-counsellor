# Quick Setup Guide - Interactive

## Option 1: Automated Setup (Recommended)

I've created a Python script that will guide you through the setup interactively:

```bash
python setup_env.py
```

This script will:
- ✅ Ask you for your PostgreSQL credentials
- ✅ Generate a secure SECRET_KEY automatically
- ✅ Ask for your Gemini API key
- ✅ Create both backend/.env and frontend/.env.local files

**Just run it and follow the prompts!**

---

## Option 2: Manual Setup

### Step 1: PostgreSQL Database

**Create the database using one of these methods:**

#### Method A: Command Line
```bash
psql -U postgres
```
Then in PostgreSQL:
```sql
CREATE DATABASE ai_counsellor;
\q
```

#### Method B: pgAdmin (GUI)
1. Open pgAdmin
2. Right-click "Databases" → Create → Database
3. Name: `ai_counsellor`
4. Save

#### Method C: Docker
```bash
docker run --name postgres-ai-counsellor -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_counsellor -p 5432:5432 -d postgres
```

**Note your credentials:**
- Username: `postgres` (or your custom username)
- Password: (your PostgreSQL password)
- Host: `localhost`
- Port: `5432`
- Database: `ai_counsellor`

---

### Step 2: Get Gemini API Key

1. **Visit:** https://makersuite.google.com/app/apikey
2. **Sign in** with your Google account
3. **Click "Create API Key"**
4. **Copy the key** (looks like: `AIzaSy...`)
5. **Save it** - you'll need it in the next step!

---

### Step 3: Create Backend .env File

1. **Navigate to backend folder:**
   ```bash
   cd backend
   ```

2. **Create .env file:**
   
   **Windows PowerShell:**
   ```powershell
   New-Item .env
   ```
   
   **Windows CMD:**
   ```cmd
   type nul > .env
   ```
   
   **macOS/Linux:**
   ```bash
   touch .env
   ```

3. **Open .env in a text editor** and paste this template:

   ```env
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_counsellor
   SECRET_KEY=YOUR_SECRET_KEY_HERE
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
   ```

4. **Replace the values:**
   - `YOUR_PASSWORD`: Your PostgreSQL password
   - `YOUR_SECRET_KEY_HERE`: Generate one using:
     ```bash
     python -c "import secrets; print(secrets.token_urlsafe(32))"
     ```
   - `YOUR_GEMINI_API_KEY_HERE`: The API key from Step 2

**Example of completed .env:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/ai_counsellor
SECRET_KEY=EfGd28srAyHKj0FXgUhBGIjsziVxP95hs7s2f4Pqnhg
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

---

### Step 4: Create Frontend .env.local File

1. **Navigate to frontend folder:**
   ```bash
   cd frontend
   ```

2. **Create .env.local file:**
   
   **Windows PowerShell:**
   ```powershell
   New-Item .env.local
   ```
   
   **Windows CMD:**
   ```cmd
   type nul > .env.local
   ```
   
   **macOS/Linux:**
   ```bash
   touch .env.local
   ```

3. **Open .env.local in a text editor** and add:

   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Save the file**

---

## Verification

### Check Backend .env
```bash
cd backend
# Windows PowerShell:
Get-Content .env
# macOS/Linux:
cat .env
```

You should see all 5 variables filled in.

### Check Frontend .env.local
```bash
cd frontend
# Windows PowerShell:
Get-Content .env.local
# macOS/Linux:
cat .env.local
```

You should see `NEXT_PUBLIC_API_URL`.

---

## Common Issues

### "psql: command not found"
- PostgreSQL is not in your PATH
- Use pgAdmin GUI instead
- Or add PostgreSQL bin folder to PATH

### "password authentication failed"
- Check your PostgreSQL password
- Make sure it matches in DATABASE_URL

### "database does not exist"
- Run: `CREATE DATABASE ai_counsellor;` in PostgreSQL

### "GEMINI_API_KEY not found"
- Make sure .env is in the `backend` folder
- No spaces or quotes around the API key
- File must be named exactly `.env` (not `.env.txt`)

---

## Next Steps After Setup

1. ✅ Database created
2. ✅ Gemini API key obtained  
3. ✅ .env files configured

**Now you can:**
```bash
# Install backend dependencies
cd backend
pip install -r requirements.txt

# Install frontend dependencies
cd ../frontend
npm install

# Start backend (in one terminal)
cd ../backend
uvicorn main:app --reload

# Seed database (in another terminal)
cd backend
python seed_data.py

# Start frontend (in another terminal)
cd frontend
npm run dev
```

Visit: http://localhost:3000 🚀
