from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import University
import random

def seed_universities():
    db = SessionLocal()
    try:
        # Check if already seeded
        if db.query(University).count() > 0:
            print("Database already has universities. Skipping seed.")
            return

        print("Seeding diverse university data...")
        
        universities = [
            # USA
            {"name": "Stanford University", "country": "USA", "degree_type": "Master's", "field_of_study": "Computer Science", "tuition_fee": 55000, "acceptance_rate": 0.04, "ranking": 3},
            {"name": "MIT", "country": "USA", "degree_type": "Master's", "field_of_study": "Engineering", "tuition_fee": 58000, "acceptance_rate": 0.07, "ranking": 1},
            {"name": "Harvard University", "country": "USA", "degree_type": "Master's", "field_of_study": "Business", "tuition_fee": 75000, "acceptance_rate": 0.05, "ranking": 5},
            {"name": "UC Berkeley", "country": "USA", "degree_type": "Master's", "field_of_study": "Data Science", "tuition_fee": 45000, "acceptance_rate": 0.17, "ranking": 15},
            {"name": "University of Texas at Austin", "country": "USA", "degree_type": "Master's", "field_of_study": "AI", "tuition_fee": 38000, "acceptance_rate": 0.32, "ranking": 40},
            
            # UK
            {"name": "University of Oxford", "country": "UK", "degree_type": "Master's", "field_of_study": "Philosophy", "tuition_fee": 42000, "acceptance_rate": 0.15, "ranking": 2},
            {"name": "University of Cambridge", "country": "UK", "degree_type": "Master's", "field_of_study": "Mathematics", "tuition_fee": 45000, "acceptance_rate": 0.20, "ranking": 4},
            {"name": "Imperial College London", "country": "UK", "degree_type": "Master's", "field_of_study": "Physics", "tuition_fee": 40000, "acceptance_rate": 0.18, "ranking": 10},
            {"name": "University College London (UCL)", "country": "UK", "degree_type": "Master's", "field_of_study": "Architecture", "tuition_fee": 35000, "acceptance_rate": 0.25, "ranking": 18},
            
            # Canada
            {"name": "University of Toronto", "country": "Canada", "degree_type": "Master's", "field_of_study": "Medicine", "tuition_fee": 35000, "acceptance_rate": 0.43, "ranking": 25},
            {"name": "University of British Columbia", "country": "Canada", "degree_type": "Master's", "field_of_study": "Sustainability", "tuition_fee": 32000, "acceptance_rate": 0.50, "ranking": 35},
            {"name": "McGill University", "country": "Canada", "degree_type": "Master's", "field_of_study": "Law", "tuition_fee": 30000, "acceptance_rate": 0.45, "ranking": 40},
            
            # Australia
            {"name": "University of Melbourne", "country": "Australia", "degree_type": "Master's", "field_of_study": "Education", "tuition_fee": 33000, "acceptance_rate": 0.70, "ranking": 33},
            {"name": "University of Sydney", "country": "Australia", "degree_type": "Master's", "field_of_study": "Marketing", "tuition_fee": 35000, "acceptance_rate": 0.30, "ranking": 41},
            {"name": "Australian National University", "country": "Australia", "degree_type": "Master's", "field_of_study": "International Relations", "tuition_fee": 32000, "acceptance_rate": 0.35, "ranking": 30},
            
            # Germany
            {"name": "Technical University of Munich", "country": "Germany", "degree_type": "Master's", "field_of_study": "Robotics", "tuition_fee": 500, "acceptance_rate": 0.15, "ranking": 50},
            {"name": "LMU Munich", "country": "Germany", "degree_type": "Master's", "field_of_study": "Natural Sciences", "tuition_fee": 300, "acceptance_rate": 0.20, "ranking": 60},
            
            # France
            {"name": "HEC Paris", "country": "France", "degree_type": "MBA", "field_of_study": "Management", "tuition_fee": 80000, "acceptance_rate": 0.10, "ranking": 20},
            {"name": "Sorbonne University", "country": "France", "degree_type": "Master's", "field_of_study": "Humanities", "tuition_fee": 400, "acceptance_rate": 0.30, "ranking": 80},
        ]

        for u_data in universities:
            uni = University(
                name=u_data["name"],
                country=u_data["country"],
                degree_type=u_data["degree_type"],
                field_of_study=u_data["field_of_study"],
                tuition_fee=u_data["tuition_fee"],
                acceptance_rate=u_data["acceptance_rate"],
                ranking=u_data["ranking"],
                description=f"Premier institution located in {u_data['country']}, known for excellence in {u_data['field_of_study']}."
            )
            db.add(uni)
        
        db.commit()
        print(f"Successfully seeded {len(universities)} universities.")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_universities()
