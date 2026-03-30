from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import json
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
import os

router = APIRouter()

SECRET_KEY = "hackvote_secret"
ALGORITHM = "HS256"

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DB_FILE = "admin_db.json"


class AdminSignup(BaseModel):
    email: str
    password: str


class AdminLogin(BaseModel):
    email: str
    password: str


def load_admins():
    if not os.path.exists(DB_FILE):
        with open(DB_FILE, "w") as f:
            json.dump([], f)

    with open(DB_FILE, "r") as f:
        return json.load(f)

def save_admins(admins):
    with open(DB_FILE, "w") as f:
        json.dump(admins, f, indent=2)


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_token(email):
    payload = {
        "sub": email,
        "exp": datetime.utcnow() + timedelta(hours=6)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


@router.post("/admin/signup")
def admin_signup(admin: AdminSignup):

    admins = load_admins()

    for a in admins:
        if a["email"] == admin.email:
            raise HTTPException(status_code=400, detail="Admin already exists")

    hashed = hash_password(admin.password)

    admins.append({
        "email": admin.email,
        "password": hashed
    })

    save_admins(admins)

    return {"message": "Admin created successfully"}


@router.post("/admin/login")
def admin_login(admin: AdminLogin):

    admins = load_admins()

    for a in admins:
        if a["email"] == admin.email:

            if verify_password(admin.password, a["password"]):

                token = create_token(admin.email)

                return {
                    "access_token": token,
                    "token_type": "bearer"
                }

            raise HTTPException(status_code=401, detail="Invalid password")

    raise HTTPException(status_code=404, detail="Admin not found")