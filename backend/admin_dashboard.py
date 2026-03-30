import pandas as pd
from fastapi import APIRouter
import os
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

router = APIRouter()

@router.get("/admin/dashboard")
def dashboard_stats():

    votes = pd.read_csv(os.path.join(BASE_DIR, "database", "votes.csv"))
    teams = pd.read_csv(os.path.join(BASE_DIR, "database", "teams.csv"))

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

    vote_counts = votes.groupby("team_id").size().reset_index(name="votes")

    leaderboard = teams.merge(vote_counts, on="team_id")

    leaderboard = leaderboard.sort_values("votes", ascending=False)

    return leaderboard.head(5).to_dict(orient="records")

@router.get("/admin/project-stats")
def project_stats():

    votes = pd.read_csv("database/votes.csv")
    teams = pd.read_csv("database/teams.csv")

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

    recent_votes = votes.tail(10)

    return recent_votes.to_dict(orient="records")
