from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from auth import router as auth_router
from teams import router as teams_router
from admin_auth import router as admin_auth_router
from admin_dashboard import router as dashboard_router

app = FastAPI()

# Add CORS middleware
# Allow all origins, methods, and headers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router from auth.py
app.include_router(auth_router)
app.include_router(teams_router)
app.include_router(admin_auth_router)
app.include_router(dashboard_router)

# Root route
@app.get("/")
def read_root():
    return {
        "message": "HackVote Backend Running"
    }