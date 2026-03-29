import pandas as pd
import os

DB_DIR = "database"
DB_FILE = os.path.join(DB_DIR, "students.csv")

def initialize_database():
    """If database/students.csv does not exist, create it with required columns."""
    if not os.path.exists(DB_DIR):
        os.makedirs(DB_DIR)
    
    if not os.path.exists(DB_FILE):
        df = pd.DataFrame(columns=["name", "branch", "year", "password"])
        df.to_csv(DB_FILE, index=False)

def get_students():
    """Return the dataframe from students.csv."""
    if not os.path.exists(DB_FILE):
        initialize_database()
    return pd.read_csv(DB_FILE)

def save_students(df):
    """Write dataframe back to students.csv."""
    df.to_csv(DB_FILE, index=False)
