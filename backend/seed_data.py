"""
Script to seed the database with sample university data
Run this after setting up the database.
Now supports incremental updates (checks if name exists before adding).
"""
from database import SessionLocal, engine, Base
from models import University
import sys

# Ensure tables exist
Base.metadata.create_all(bind=engine)

# Expanded university data
universities_data = [
     # --- USA ---
    {
        "name": "Massachusetts Institute of Technology (MIT)",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Engineering",
        "tuition_fee": 57000,
        "acceptance_rate": 0.04,
        "ranking": 1,
        "description": "Global leader in engineering and physical sciences."
    },
    {
        "name": "Stanford University",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Business",
        "tuition_fee": 56000,
        "acceptance_rate": 0.04,
        "ranking": 3,
        "description": "Located in Silicon Valley; known for entrepreneurship."
    },
    {
        "name": "Harvard University",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Business, Law, Medicine",
        "tuition_fee": 54000,
        "acceptance_rate": 0.03,
        "ranking": 4,
        "description": "Oldest higher education institution in the US."
    },
    {
        "name": "Carnegie Mellon University",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, AI",
        "tuition_fee": 52000,
        "acceptance_rate": 0.17,
        "ranking": 28,
        "description": "World-renowned for its School of Computer Science."
    },
    {
        "name": "University of California, Berkeley",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Engineering",
        "tuition_fee": 14000,
        "acceptance_rate": 0.11,
        "ranking": 10,
        "description": "Top public research university with rigorous academics."
    },
    {
        "name": "Georgia Institute of Technology",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Computer Science",
        "tuition_fee": 29000,
        "acceptance_rate": 0.21,
        "ranking": 38,
        "description": "Leading technological research university in Atlanta."
    },
    {
        "name": "University of Washington",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Medicine",
        "tuition_fee": 39000,
        "acceptance_rate": 0.56,
        "ranking": 80,
        "description": "Premier research university in the Pacific Northwest."
    },
    {
        "name": "New York University (NYU)",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Business, Arts, Law",
        "tuition_fee": 58000,
        "acceptance_rate": 0.13,
        "ranking": 39,
        "description": "Private university with a campus in the heart of Manhattan."
    },
    {
        "name": "University of Texas at Austin",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Business",
        "tuition_fee": 40000,
        "acceptance_rate": 0.32,
        "ranking": 67,
        "description": "Major public research university with a strong endowment."
    },
    {
        "name": "University of Illinois Urbana-Champaign",
        "country": "USA",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Computer Science",
        "tuition_fee": 36000,
        "acceptance_rate": 0.60,
        "ranking": 82,
        "description": "Pioneering research powerhouse in engineering."
    },

    # --- UK ---
    {
        "name": "University of Oxford",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Humanities, Sciences",
        "tuition_fee": 38000,
        "acceptance_rate": 0.17,
        "ranking": 1,
        "description": "Oldest university in the English-speaking world."
    },
    {
        "name": "University of Cambridge",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Engineering",
        "tuition_fee": 39000,
        "acceptance_rate": 0.21,
        "ranking": 2,
        "description": "Collegiate research university with global prestige."
    },
    {
        "name": "Imperial College London",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Science, Engineering, Medicine",
        "tuition_fee": 36000,
        "acceptance_rate": 0.14,
        "ranking": 6,
        "description": "Focuses exclusively on science, engineering, medicine, and business."
    },
    {
        "name": "University College London (UCL)",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Architecture, Law, Medicine",
        "tuition_fee": 32000,
        "acceptance_rate": 0.63,
        "ranking": 8,
        "description": "London's global university; multidisciplinary strength."
    },
    {
        "name": "University of Edinburgh",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Informatics, Humanities",
        "tuition_fee": 30000,
        "acceptance_rate": 0.10,
        "ranking": 15,
        "description": "Historic university in Scotland's capital."
    },
    {
        "name": "King's College London",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Medicine, Law, Humanities",
        "tuition_fee": 31000,
        "acceptance_rate": 0.13,
        "ranking": 35,
        "description": "Prestigious research university in central London."
    },
    {
        "name": "University of Manchester",
        "country": "UK",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Business",
        "tuition_fee": 28000,
        "acceptance_rate": 0.56,
        "ranking": 27,
        "description": "One of the largest single-site universities in the UK."
    },

    # --- Canada ---
    {
        "name": "University of Toronto",
        "country": "Canada",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, AI",
        "tuition_fee": 45000,
        "acceptance_rate": 0.43,
        "ranking": 18,
        "description": "Top Canadian university known for AI research."
    },
    {
        "name": "University of British Columbia",
        "country": "Canada",
        "degree_type": "Master's",
        "field_of_study": "Environment, Business",
        "tuition_fee": 42000,
        "acceptance_rate": 0.52,
        "ranking": 34,
        "description": "Stunning campus in Vancouver; strong global outlook."
    },
    {
        "name": "McGill University",
        "country": "Canada",
        "degree_type": "Master's",
        "field_of_study": "Medicine, Law",
        "tuition_fee": 38000,
        "acceptance_rate": 0.46,
        "ranking": 31,
        "description": "Montreal-based university with international reputation."
    },
    {
        "name": "University of Waterloo",
        "country": "Canada",
        "degree_type": "Master's",
        "field_of_study": "Computer Science, Engineering",
        "tuition_fee": 40000,
        "acceptance_rate": 0.53,
        "ranking": 149,
        "description": "Famous for its cooperative education programs and STEM."
    },
    {
        "name": "University of Alberta",
        "country": "Canada",
        "degree_type": "Master's",
        "field_of_study": "Energy, Environment",
        "tuition_fee": 25000,
        "acceptance_rate": 0.58,
        "ranking": 126,
        "description": "Leading research university in Edmonton."
    },

    # --- Australia ---
    {
        "name": "University of Melbourne",
        "country": "Australia",
        "degree_type": "Master's",
        "field_of_study": "Law, Business, Medicine",
        "tuition_fee": 42000,
        "acceptance_rate": 0.70,
        "ranking": 33,
        "description": "Australia's leading comprehensive research university."
    },
    {
        "name": "Australian National University (ANU)",
        "country": "Australia",
        "degree_type": "Master's",
        "field_of_study": "Politics, Science",
        "tuition_fee": 44000,
        "acceptance_rate": 0.35,
        "ranking": 27,
        "description": "Located in Canberra; strong focus on research."
    },
    {
        "name": "University of Sydney",
        "country": "Australia",
        "degree_type": "Master's",
        "field_of_study": "Arts, Engineering",
        "tuition_fee": 41000,
        "acceptance_rate": 0.30,
        "ranking": 41,
        "description": "Oldest university in Australia; vibrant campus life."
    },
    {
        "name": "University of New South Wales (UNSW)",
        "country": "Australia",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Business",
        "tuition_fee": 43000,
        "acceptance_rate": 0.60,
        "ranking": 45,
        "description": "Known for strong links with industry and technology."
    },
    {
        "name": "University of Queensland",
        "country": "Australia",
        "degree_type": "Master's",
        "field_of_study": "Science, Mining",
        "tuition_fee": 38000,
        "acceptance_rate": 0.40,
        "ranking": 50,
        "description": "Research-intensive university in Brisbane."
    },

    # --- Germany ---
    {
        "name": "Technical University of Munich (TUM)",
        "country": "Germany",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Technology",
        "tuition_fee": 3000,
        "acceptance_rate": 0.08,
        "ranking": 50,
        "description": "Top German university for engineering and technology."
    },
    {
        "name": "RWTH Aachen University",
        "country": "Germany",
        "degree_type": "Master's",
        "field_of_study": "Mechanical Engineering",
        "tuition_fee": 1000,
        "acceptance_rate": 0.10,
        "ranking": 165,
        "description": "Largest technical university in Germany."
    },
    {
        "name": "Ludwig Maximilian University of Munich (LMU)",
        "country": "Germany",
        "degree_type": "Master's",
        "field_of_study": "Physics, Humanities",
        "tuition_fee": 300,
        "acceptance_rate": 0.15,
        "ranking": 64,
        "description": "One of Europe's premier academic and research institutions."
    },
    {
        "name": "Heidelberg University",
        "country": "Germany",
        "degree_type": "Master's",
        "field_of_study": "Medicine, Law",
        "tuition_fee": 3000,
        "acceptance_rate": 0.17,
        "ranking": 42,
        "description": "Germany's oldest university; strong in life sciences."
    },

    # --- Ireland ---
    {
        "name": "Trinity College Dublin",
        "country": "Ireland",
        "degree_type": "Master's",
        "field_of_study": "Literature, Computer Science",
        "tuition_fee": 25000,
        "acceptance_rate": 0.33,
        "ranking": 101,
        "description": "Ireland's most prestigious university."
    },
    {
        "name": "University College Dublin (UCD)",
        "country": "Ireland",
        "degree_type": "Master's",
        "field_of_study": "Business, Agriculture",
        "tuition_fee": 22000,
        "acceptance_rate": 0.20,
        "ranking": 173,
        "description": "Large, modern university in Dublin."
    },

    # --- Singapore ---
    {
        "name": "National University of Singapore (NUS)",
        "country": "Singapore",
        "degree_type": "Master's",
        "field_of_study": "Computing, Asian Studies",
        "tuition_fee": 38000,
        "acceptance_rate": 0.05,
        "ranking": 11,
        "description": "Top-ranked university in Asia."
    },
    {
        "name": "Nanyang Technological University (NTU)",
        "country": "Singapore",
        "degree_type": "Master's",
        "field_of_study": "Engineering, Materials Science",
        "tuition_fee": 36000,
        "acceptance_rate": 0.35,
        "ranking": 19,
        "description": "Fast-rising young university with beautiful campus."
    },
    
    # --- Switzerland ---
    {
        "name": "ETH Zurich",
        "country": "Switzerland",
        "degree_type": "Master's",
        "field_of_study": "Physics, Engineering",
        "tuition_fee": 1600,
        "acceptance_rate": 0.27,
        "ranking": 9,
        "description": "Continental Europe's top university."
    },
    {
        "name": "EPFL",
        "country": "Switzerland",
        "degree_type": "Master's",
        "field_of_study": "Technology, Science",
        "tuition_fee": 1600,
        "acceptance_rate": 0.20,
        "ranking": 40,
        "description": "Cosmopolitan technical university in Lausanne."
    },

    # --- Netherlands ---
    {
        "name": "University of Amsterdam",
        "country": "Netherlands",
        "degree_type": "Master's",
        "field_of_study": "Communication, Psychology",
        "tuition_fee": 15000,
        "acceptance_rate": 0.04,
        "ranking": 55,
        "description": "Major research university in the city center."
    },
    {
        "name": "Delft University of Technology",
        "country": "Netherlands",
        "degree_type": "Master's",
        "field_of_study": "Architecture, Engineering",
        "tuition_fee": 19000,
        "acceptance_rate": 0.65,
        "ranking": 57,
        "description": "Oldest and largest Dutch public technical university."
    },

     # --- New Zealand ---
    {
        "name": "University of Auckland",
        "country": "New Zealand",
        "degree_type": "Master's",
        "field_of_study": "Business, Science",
        "tuition_fee": 35000,
        "acceptance_rate": 0.45,
        "ranking": 81,
        "description": "New Zealand's leading university."
    },
    {
        "name": "University of Otago",
        "country": "New Zealand",
        "degree_type": "Master's",
        "field_of_study": "Health Sciences",
        "tuition_fee": 32000,
        "acceptance_rate": 0.58,
        "ranking": 184,
        "description": "New Zealand's first university, located in Dunedin."
    },
     # --- France ---
    {
        "name": "Sorbonne University",
        "country": "France",
        "degree_type": "Master's",
        "field_of_study": "Humanities, Science",
        "tuition_fee": 300,
        "acceptance_rate": 0.20,
        "ranking": 72,
        "description": "Historic and prestigious university in Paris."
    },
    {
        "name": "École Polytechnique",
        "country": "France",
        "degree_type": "Master's",
        "field_of_study": "Science, Engineering",
        "tuition_fee": 12000,
        "acceptance_rate": 0.10,
        "ranking": 61,
        "description": "Leading French engineering school."
    },
]

def seed_universities():
    db = SessionLocal()
    try:
        count_added = 0
        count_skipped = 0
        
        print(f"Checking {len(universities_data)} universities...")
        
        for uni_data in universities_data:
            # Check if university already exists by name
            existing = db.query(University).filter(University.name == uni_data["name"]).first()
            
            if existing:
                count_skipped += 1
                # Optional: Update existing record?
                # existing.ranking = uni_data["ranking"]
                # existing.tuition_fee = uni_data["tuition_fee"]
                continue
                
            university = University(**uni_data)
            db.add(university)
            count_added += 1
        
        db.commit()
        print(f"Finished Seeding: Added {count_added}, Skipped {count_skipped} (already existed).")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    seed_universities()
