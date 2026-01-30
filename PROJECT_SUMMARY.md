# AI Counsellor - Project Summary

## ✅ Completed Features

### 1. Landing Page
- Clean, modern design with clear CTAs
- "Get Started" and "Login" buttons
- Product description and branding

### 2. Authentication
- User signup with email, name, and password
- User login with email and password
- JWT token-based authentication
- Protected routes with automatic redirect

### 3. Mandatory Onboarding
- 4-step onboarding flow:
  1. Academic Background
  2. Study Goals
  3. Budget & Funding
  4. Exams & Readiness
- Progress indicator
- Blocks access to AI Counsellor until completed
- Data powers all recommendations

### 4. Dashboard
- Profile summary display
- Profile strength indicators (Academics, Exams, SOP)
- Current stage indicator with progress bar
- AI-generated to-do list
- Quick navigation to key features

### 5. AI Counsellor (Core Feature)
- Chat interface with Gemini AI integration
- Understands user profile and current stage
- Can explain profile strengths and gaps
- Recommends universities (Dream/Target/Safe)
- Can take actions:
  - Shortlist universities
  - Lock universities
  - Create tasks
- Real-time chat with message history

### 6. University Discovery
- Browse universities with filtering:
  - By country
  - By degree type
  - Search by name
- University cards show:
  - Name, country, tuition
  - Acceptance rate
  - Acceptance chance (High/Medium/Low)
  - Category (Dream/Target/Safe)
- Shortlist functionality
- Lock functionality with confirmation

### 7. University Locking
- Must shortlist before locking
- Confirmation dialog before locking
- Auto-generates application tasks when locked
- Can unlock with warning
- Blocks application guidance until locked

### 8. Application Guidance
- Shows locked universities
- Required documents list
- Timeline information
- Action items (to-dos) for each university
- Mark tasks as complete/incomplete
- Click to toggle task status

### 9. Profile Management
- Edit all onboarding fields
- Updates trigger recommendation recalculation
- Clean, organized form layout
- Save changes with validation

## 🏗️ Architecture

### Backend (FastAPI)
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT tokens with OAuth2
- **AI Integration**: Google Gemini API
- **API Structure**: RESTful endpoints
- **Data Models**: User, Onboarding, University, ShortlistedUniversity, LockedUniversity, Todo

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: React hooks
- **API Client**: Axios with interceptors
- **UI Components**: Custom components with Lucide icons

## 📁 Project Structure

```
AI Counsellor/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── auth.py              # Authentication utilities
│   ├── ai_counsellor.py     # AI Counsellor service
│   ├── database.py          # Database configuration
│   ├── seed_data.py         # Seed script for universities
│   ├── requirements.txt     # Python dependencies
│   └── README.md            # Backend documentation
├── frontend/
│   ├── app/                 # Next.js app directory
│   │   ├── page.tsx         # Landing page
│   │   ├── login/           # Login page
│   │   ├── signup/          # Signup page
│   │   ├── onboarding/     # Onboarding flow
│   │   ├── dashboard/      # Dashboard
│   │   ├── ai-counsellor/   # AI Counsellor chat
│   │   ├── universities/   # University discovery
│   │   ├── applications/   # Application guidance
│   │   └── profile/        # Profile management
│   ├── components/          # React components
│   ├── lib/                 # Utilities
│   │   └── api.ts          # API client
│   └── README.md            # Frontend documentation
└── README.md                # Main project README
```

## 🔑 Key Features Implementation

### Stage-Based Flow
- Stage 0: Onboarding (blocks AI Counsellor)
- Stage 1: Building Profile
- Stage 2: Discovering Universities
- Stage 3: Finalizing Universities (after shortlisting)
- Stage 4: Preparing Applications (after locking)

### AI Counsellor Actions
The AI can parse actions from its responses:
- `ACTION: shortlist_university:<id>` - Shortlists a university
- `ACTION: lock_university:<id>` - Locks a university
- `ACTION: create_task:<title>:<description>` - Creates a task

### University Categorization
- **Dream**: Tuition > 120% of budget
- **Target**: Tuition within 80-120% of budget
- **Safe**: Tuition < 80% of budget

### Acceptance Chance Calculation
- Based on university acceptance rate
- High: > 70%
- Medium: 40-70%
- Low: < 40%

## 🚀 Getting Started

See `README.md` for detailed setup instructions.

## 📝 Notes

- This is a functional prototype, not production-ready
- Uses dummy/research-based university data
- AI responses are simplified but demonstrate the concept
- All core flows are implemented and working
- Database auto-creates tables on first run
- Sample universities are seeded via `seed_data.py`

## 🎯 Hackathon Requirements Met

✅ Complete user flow from landing to applications
✅ Mandatory onboarding with profile data collection
✅ AI Counsellor that guides and takes actions
✅ University discovery with filtering
✅ University locking with commitment step
✅ Application guidance with to-dos
✅ Profile management
✅ Stage-based progression
✅ Responsive design
✅ Working end-to-end prototype
