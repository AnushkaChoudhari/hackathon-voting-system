from fastapi import APIRouter
from pydantic import BaseModel
import pandas as pd
import os

router = APIRouter()

class VoteData(BaseModel):
    student_name: str
    team_id: int
    rating: str

@router.get("/teams")
def get_teams():
    file_path = "database/teams.csv"
    if not os.path.exists(file_path):
        return {"status": "error", "message": "Teams database not found"}
    
    df = pd.read_csv(file_path)
    
    # Rename columns to match frontend expectations if necessary
    if 'idea_title' in df.columns:
        df = df.rename(columns={'idea_title': 'project_name'})
    
    teams = df.to_dict(orient="records")
    return {
        "status": "success",
        "teams": teams
    }

@router.post("/vote")
def submit_vote(data: VoteData):
    file_path = "database/votes.csv"
    
    # Ensure database directory exists
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    
    # Check if votes.csv exists
    if not os.path.exists(file_path):
        df = pd.DataFrame(columns=["student_name", "team_id", "rating"])
    else:
        df = pd.read_csv(file_path)
    
    # Append the new vote
    new_vote = {
        "student_name": data.student_name,
        "team_id": data.team_id,
        "rating": data.rating
    }
    
    # Using pd.concat for appending
    df = pd.concat([df, pd.DataFrame([new_vote])], ignore_index=True)
    
    # Save back to csv
    df.to_csv(file_path, index=False)
    
    return {
        "status": "success",
        "message": "Vote submitted successfully"
    }