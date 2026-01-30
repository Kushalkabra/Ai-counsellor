# AI Counsellor Deployment Guide

This guide will help you deploy the AI Counsellor application to production.

## Prerequisites
- A GitHub account.
- Accounts on [Render](https://render.com/) and [Vercel](https://vercel.com/).
- Groq or Gemini API Key.

---

## Phase 1: Backend Deployment (Render)

1. **Create a PostgreSQL Database**:
   - In Render, create a new **PostgreSQL** instance.
   - Copy the **Internal Database URL** (for backend) or **External Database URL** (for local testing).

2. **Deploy the Web Service**:
   - Create a new **Web Service** on Render and connect your GitHub repository.
   - **Root Directory**: `backend`
   - **Environment**: `Python`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`
   - **Environment Variables**:
     - `DATABASE_URL`: Your Render PostgreSQL URL.
     - `PYTHON_VERSION`: `3.11.9` (Recommended for better compatibility with dependencies).
     - `SECRET_KEY`: A long random string.
     - `GROQ_API_KEY`: Your Groq API key.
     - `ALLOWED_ORIGINS`: `https://your-app-name.vercel.app` (Add yours).

---

## Phase 2: Frontend Deployment (Vercel)

1. **Deploy to Vercel**:
   - Create a new project on Vercel and connect your GitHub repository.
   - **Root Directory**: `New frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Environment Variables**:
     - `VITE_API_URL`: Your Render Web Service URL (e.g., `https://ai-counsellor-api.onrender.com`).

2. **Update CORS on Render**:
   - Once your Vercel URL is generated (e.g., `https://ai-counsellor.vercel.app`), go back to Render and update the `ALLOWED_ORIGINS` variable.

---

## Phase 3: Database Initialization

1. **Seed Data**:
   - If you need to populate the database with initial university data, you can run the seed script locally pointing to the Render database, or use Render's "Shell" to run:
     ```bash
     python seed_data.py
     ```

---

## Verification
- Visit your Vercel URL.
- Signup/Login and verify the AI chat and university discovery are functional.
