import pandas as pd
from fastapi import APIRouter
import os
from pydantic import BaseModel
from typing import Optional

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Team(BaseModel):
    team_id: int
    team_name: str
    idea_title: str
    theme: str

router = APIRouter()

@router.get("/admin/dashboard")
def dashboard_stats():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))
    teams = pd.read_csv(os.path.join(BASE_DIR, "database", "teams.csv"))

    votes["rating"] = votes["rating"].str.lower()
    total_projects = len(teams)
    total_votes = len(votes)

    best_votes = len(votes[votes["rating"] == "best"])

    students_voted = votes["student_name"].nunique()

    return {
        "total_projects": int(total_projects),
        "total_votes": int(total_votes),
        "best_votes": int(best_votes),
        "students_voted": int(students_voted)
    }

@router.get("/admin/voting-mix")
def voting_mix():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))

    votes["rating"] = votes["rating"].str.lower()
    mix = votes["rating"].value_counts()

    return {
        "best": int(mix.get("best", 0)),
        "good": int(mix.get("good", 0)),
        "moderate": int(mix.get("moderate", 0))
    }

@router.get("/admin/leaderboard")
def leaderboard():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))
    teams = pd.read_csv(os.path.join(BASE_DIR, "database", "teams.csv"))

    votes["rating"] = votes["rating"].str.lower()
    vote_counts = votes.groupby("team_id").size().reset_index(name="votes")

    leaderboard = teams.merge(vote_counts, on="team_id")

    leaderboard = leaderboard.sort_values("votes", ascending=False)

    return leaderboard.head(5).to_dict(orient="records")

@router.get("/admin/project-stats")
def project_stats():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))
    teams = pd.read_csv(os.path.join(BASE_DIR, "database", "teams.csv"))

    # normalize rating text
    votes["rating"] = votes["rating"].str.lower()

    stats = votes.pivot_table(
        index="team_id",
        columns="rating",
        aggfunc="size",
        fill_value=0
    )

    stats["total"] = stats.sum(axis=1)

    stats = stats.reset_index()

    merged = teams.merge(stats, on="team_id", how="left").fillna(0)

    return merged.to_dict(orient="records")

@router.get("/admin/live-votes")
def live_votes():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))
    votes["rating"] = votes["rating"].str.lower()
    recent_votes = votes.tail(10)

    return recent_votes.to_dict(orient="records")
@router.post("/admin/teams")
def add_team(team: Team):
    teams_path = os.path.join(BASE_DIR, "database", "teams.csv")
    teams = pd.read_csv(teams_path)

    if team.team_id in teams["team_id"].values:
        return {"error": "Team ID already exists"}

    new_row = {
        "team_id": team.team_id,
        "team_name": team.team_name,
        "idea_title": team.idea_title,
        "theme": team.theme
    }

    teams = pd.concat([teams, pd.DataFrame([new_row])], ignore_index=True)
    teams.to_csv(teams_path, index=False)

    return {"message": "Team added successfully"}

@router.put("/admin/teams/{team_id}")
def update_team(team_id: int, team: Team):
    teams_path = os.path.join(BASE_DIR, "database", "teams.csv")
    teams = pd.read_csv(teams_path)

    if team_id not in teams["team_id"].values:
        return {"error": "Team not found"}

    teams.loc[teams["team_id"] == team_id, ["team_name", "idea_title", "theme"]] = [
        team.team_name, team.idea_title, team.theme
    ]

    # Also update team_id if it changed?
    # For now keep it simple, team_id is the primary key.
    if team.team_id != team_id:
        teams.loc[teams["team_id"] == team_id, "team_id"] = team.team_id

    teams.to_csv(teams_path, index=False)
    return {"message": "Team updated successfully"}

@router.delete("/admin/teams/{team_id}")
def delete_team(team_id: int):
    teams_path = os.path.join(BASE_DIR, "database", "teams.csv")
    teams = pd.read_csv(teams_path)

    if team_id not in teams["team_id"].values:
        return {"error": "Team not found"}

    teams = teams[teams["team_id"] != team_id]
    teams.to_csv(teams_path, index=False)

    return {"message": "Team deleted successfully"}
