# Fix Gemini API Key Error

## Problem
You're getting: `API key not valid. Please pass a valid API key.`

## Solution

### Step 1: Get a New API Key

1. **Go to Google AI Studio:**
   - Visit: https://makersuite.google.com/app/apikey
   - Or: https://aistudio.google.com/app/apikey

2. **Sign in** with your Google account

3. **Create a new API key:**
   - Click **"Create API Key"** button
   - Select a Google Cloud project (or create a new one)
   - Copy the API key (it starts with `AIzaSy...`)

### Step 2: Update Your .env File

1. **Open the .env file:**
   ```powershell
   cd "C:\Users\Kushal\Desktop\AI Counsellor\backend"
   notepad .env
   ```
   Or open it in any text editor.

2. **Find this line:**
   ```
   GEMINI_API_KEY=AIzaSyCNWjM7v2RxC8IuIeCaqEfWSZCYi8OlCT8
   ```

3. **Replace it with your new API key:**
   ```
   GEMINI_API_KEY=YOUR_NEW_API_KEY_HERE
   ```

4. **Important:**
   - Make sure there are NO spaces around the `=`
   - Make sure there are NO quotes around the API key
   - Make sure the API key is on a single line
   - Don't add any extra characters

5. **Save the file**

### Step 3: Restart the Server

1. **Stop the current server** (Press Ctrl+C in the terminal running uvicorn)

2. **Restart it:**
   ```powershell
   cd "C:\Users\Kushal\Desktop\AI Counsellor\backend"
   .\venv\Scripts\Activate.ps1
   uvicorn main:app --reload
   ```

### Step 4: Test

Try using the AI Counsellor again. It should work now!

---

## Common Issues

### Issue: "API key not found"
**Solution:** Make sure the `.env` file is in the `backend` folder and named exactly `.env` (not `.env.txt`)

### Issue: "API key invalid" even after updating
**Solutions:**
1. Make sure there are no extra spaces: `GEMINI_API_KEY=AIzaSy...` (not `GEMINI_API_KEY = AIzaSy...`)
2. Make sure there are no quotes: `GEMINI_API_KEY=AIzaSy...` (not `GEMINI_API_KEY="AIzaSy..."`)
3. Make sure the API key is complete (should be about 39 characters)
4. Try generating a new API key

### Issue: API key works but has quota limits
**Solution:** 
- Free tier has generous limits for development
- For production, you may need to enable billing in Google Cloud Console

---

## Quick Fix Script

You can also use the setup script to update just the API key:

```powershell
python setup_env.py
```

Then choose to update only the backend configuration and enter your new Gemini API key.
