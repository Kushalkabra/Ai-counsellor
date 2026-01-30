# Fixing Python Package Installation Error on Windows

## The Error
```
ERROR: Could not install packages due to an OSError: [WinError 2] The system cannot find the file specified
```

This is a common Windows issue with pip installations.

## Solutions (Try in Order)

### Solution 1: Run PowerShell as Administrator (Most Common Fix)

1. **Close your current terminal**
2. **Right-click on PowerShell** → **Run as Administrator**
3. **Navigate to your project:**
   ```powershell
   cd "C:\Users\Kushal\Desktop\AI Counsellor\backend"
   ```
4. **Activate your virtual environment:**
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
5. **Try installing again:**
   ```powershell
   pip install -r requirements.txt
   ```

### Solution 2: Use --user Flag (Install to User Directory)

If Solution 1 doesn't work, install packages to your user directory:

```powershell
pip install --user -r requirements.txt
```

### Solution 3: Upgrade pip and setuptools First

```powershell
python -m pip install --upgrade pip setuptools wheel
pip install -r requirements.txt
```

### Solution 4: Install Packages One by One

Sometimes installing all at once fails. Try installing critical packages first:

```powershell
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-dotenv
pip install python-jose[cryptography] passlib[bcrypt] python-multipart
pip install google-generativeai
pip install alembic pydantic-settings
```

### Solution 5: Disable Antivirus Temporarily

Sometimes antivirus software blocks file operations:
1. Temporarily disable Windows Defender or your antivirus
2. Try installing again
3. Re-enable antivirus after installation

### Solution 6: Use --no-cache-dir Flag

```powershell
pip install --no-cache-dir -r requirements.txt
```

### Solution 7: Check Python Installation

Make sure Python is properly installed:

```powershell
python --version
pip --version
```

If these don't work, you may need to reinstall Python.

### Solution 8: Create Fresh Virtual Environment

If nothing works, create a new virtual environment:

```powershell
# Remove old venv
Remove-Item -Recurse -Force venv

# Create new venv
python -m venv venv

# Activate
.\venv\Scripts\Activate.ps1

# Upgrade pip
python -m pip install --upgrade pip

# Install packages
pip install -r requirements.txt
```

## Recommended Approach

**Start with Solution 1 (Run as Administrator)** - this fixes the issue 90% of the time on Windows.

If that doesn't work, try Solution 4 (install packages one by one) to identify which specific package is causing issues.
