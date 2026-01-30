# Complete Setup Guide - Step by Step

This guide will walk you through setting up the AI Counsellor project from scratch.

---

## Step 1: Set Up PostgreSQL Database

### Option A: Using PostgreSQL Command Line (Recommended)

1. **Open Command Prompt or PowerShell** (as Administrator on Windows)

2. **Check if PostgreSQL is installed:**
   ```bash
   psql --version
   ```
   If not installed, download from: https://www.postgresql.org/download/

3. **Start PostgreSQL service:**
   - **Windows**: Open Services (Win+R → `services.msc`), find "postgresql" service, right-click → Start
   - **macOS**: `brew services start postgresql` (if installed via Homebrew)
   - **Linux**: `sudo systemctl start postgresql`

4. **Connect to PostgreSQL:**
   ```bash
   psql -U postgres
   ```
   (You may be prompted for a password - use the password you set during installation)

5. **Create the database:**
   ```sql
   CREATE DATABASE ai_counsellor;
   ```

6. **Verify it was created:**
   ```sql
   \l
   ```
   You should see `ai_counsellor` in the list.

7. **Exit PostgreSQL:**
   ```sql
   \q
   ```

### Option B: Using pgAdmin (GUI Tool)

1. **Download and install pgAdmin** from: https://www.pgadmin.org/download/

2. **Open pgAdmin** and connect to your PostgreSQL server

3. **Right-click on "Databases"** → **Create** → **Database**

4. **Enter database name:** `ai_counsellor`

5. **Click "Save"**

### Option C: Using Docker (If you have Docker installed)

```bash
docker run --name postgres-ai-counsellor -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=ai_counsellor -p 5432:5432 -d postgres
```

**Note your database credentials:**
- **Host**: `localhost`
- **Port**: `5432` (default)
- **Database**: `ai_counsellor`
- **Username**: `postgres` (default, or your custom username)
- **Password**: (the password you set during installation)

---

## Step 2: Get Gemini API Key from Google AI Studio

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in with your Google account:**
   - Use your Gmail account to sign in
   - If you don't have a Google account, create one first

3. **Create API Key:**
   - Click **"Create API Key"** button
   - You may be asked to select a Google Cloud project
     - If you have one, select it
     - If not, click **"Create API Key in new project"**

4. **Copy your API Key:**
   - A popup will show your API key (looks like: `AIzaSy...`)
   - **IMPORTANT**: Copy this key immediately - you won't be able to see it again!
   - Click **"Copy"** or manually select and copy the entire key

5. **Save the key securely:**
   - Paste it somewhere safe temporarily (we'll use it in the next step)
   - Format: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

**Note:** The free tier of Gemini API has generous limits for development/testing. For production, you may need to set up billing.

---

## Step 3: Configure .env Files

### Backend Configuration

1. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```

2. **Create the .env file:**
   
   **On Windows (PowerShell):**
   ```powershell
   New-Item -Path .env -ItemType File
   ```
   
   **On Windows (Command Prompt):**
   ```cmd
   type nul > .env
   ```
   
   **On macOS/Linux:**
   ```bash
   touch .env
   ```

3. **Open the .env file in a text editor** (Notepad, VS Code, etc.)

4. **Add the following content** (replace with your actual values):

   ```env
   # Database Configuration
   DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/ai_counsellor
   
   # Security
   SECRET_KEY=your-super-secret-key-change-this-in-production-min-32-chars
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   
   # Gemini API
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

5. **Replace the values:**
   - **DATABASE_URL**: 
     - Replace `postgres` with your PostgreSQL username (if different)
     - Replace `YOUR_PASSWORD` with your PostgreSQL password
     - Example: `postgresql://postgres:mypassword123@localhost:5432/ai_counsellor`
   
   - **SECRET_KEY**: 
     - Generate a random secret key (minimum 32 characters)
     - You can use this Python command to generate one:
       ```python
       python -c "import secrets; print(secrets.token_urlsafe(32))"
       ```
     - Or use an online generator: https://randomkeygen.com/
     - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6`
   
   - **GEMINI_API_KEY**: 
     - Paste the API key you copied from Google AI Studio
     - Example: `AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567`

6. **Save the file**

**Example of a complete .env file:**
```env
DATABASE_URL=postgresql://postgres:admin123@localhost:5432/ai_counsellor
SECRET_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
GEMINI_API_KEY=AIzaSyAbCdEfGhIjKlMnOpQrStUvWxYz1234567
```

### Frontend Configuration

1. **Navigate to the frontend folder:**
   ```bash
   cd frontend
   ```

2. **Create the .env.local file:**
   
   **On Windows (PowerShell):**
   ```powershell
   New-Item -Path .env.local -ItemType File
   ```
   
   **On Windows (Command Prompt):**
   ```cmd
   type nul > .env.local
   ```
   
   **On macOS/Linux:**
   ```bash
   touch .env.local
   ```

3. **Open the .env.local file in a text editor**

4. **Add the following content:**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

5. **Save the file**

**Note:** If your backend runs on a different port, change `8000` to that port number.

---

## Verification Steps

### Verify Database Connection

1. **Test PostgreSQL connection:**
   ```bash
   psql -U postgres -d ai_counsellor
   ```
   If it connects successfully, your database is ready!

### Verify Backend Configuration

1. **Check your .env file has all required variables:**
   ```bash
   cd backend
   # On Windows PowerShell:
   Get-Content .env
   # On macOS/Linux:
   cat .env
   ```

2. **Make sure you see:**
   - ✅ DATABASE_URL
   - ✅ SECRET_KEY
   - ✅ GEMINI_API_KEY

### Verify Frontend Configuration

1. **Check your .env.local file:**
   ```bash
   cd frontend
   # On Windows PowerShell:
   Get-Content .env.local
   # On macOS/Linux:
   cat .env.local
   ```

2. **Make sure you see:**
   - ✅ NEXT_PUBLIC_API_URL

---

## Common Issues & Solutions

### Issue: "psql: command not found"
**Solution:** PostgreSQL is not in your PATH. Either:
- Add PostgreSQL to your system PATH
- Use the full path to psql (usually in `C:\Program Files\PostgreSQL\XX\bin\` on Windows)
- Use pgAdmin GUI instead

### Issue: "password authentication failed"
**Solution:** 
- Check your PostgreSQL password
- Try resetting it: `ALTER USER postgres PASSWORD 'newpassword';`
- Update your DATABASE_URL in .env

### Issue: "database does not exist"
**Solution:** 
- Make sure you created the database: `CREATE DATABASE ai_counsellor;`
- Check the database name in your DATABASE_URL matches exactly

### Issue: "GEMINI_API_KEY not found"
**Solution:**
- Make sure the .env file is in the `backend` folder
- Check there are no extra spaces or quotes around the API key
- Verify the file is named exactly `.env` (not `.env.txt`)

### Issue: "Connection refused" when starting backend
**Solution:**
- Make sure PostgreSQL service is running
- Check the port in DATABASE_URL (should be 5432)
- Verify your PostgreSQL username and password are correct

---

## Next Steps

Once you've completed these three steps:

1. ✅ PostgreSQL database created
2. ✅ Gemini API key obtained
3. ✅ .env files configured

You're ready to proceed with:
- Installing Python dependencies
- Installing Node.js dependencies
- Starting the backend server
- Starting the frontend server
- Seeding the database with sample universities

See the main `README.md` for the next steps!

---

## Quick Reference

**Database Connection String Format:**
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME
```

**Example:**
```
postgresql://postgres:mypassword@localhost:5432/ai_counsellor
```

**Backend .env Location:**
```
backend/.env
```

**Frontend .env Location:**
```
frontend/.env.local
```
