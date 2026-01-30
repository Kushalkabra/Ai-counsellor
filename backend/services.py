from sqlalchemy.orm import Session
from models import Todo

def generate_application_todos(user_id: int, university_id: int, db: Session):
    """Auto-generate to-dos when a university is locked"""
    todos = [
        {"title": "Prepare Statement of Purpose (SOP)", "description": "Write a compelling SOP tailored to this university"},
        {"title": "Complete application form", "description": "Fill out the university's online application form"},
        {"title": "Submit transcripts", "description": "Request and submit official transcripts"},
        {"title": "Get recommendation letters", "description": "Request recommendation letters from professors/employers"},
        {"title": "Submit test scores", "description": "Send official IELTS/TOEFL and GRE/GMAT scores"},
    ]
    
    for todo_data in todos:
        todo = Todo(
            user_id=user_id,
            title=todo_data["title"],
            description=todo_data["description"],
            university_id=university_id
        )
        db.add(todo)
    
    db.commit()
