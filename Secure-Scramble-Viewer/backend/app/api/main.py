from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db.database import init_db
from app.api import routes

app = FastAPI(title="SecureScramble Viewer API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
@app.on_event("startup")
async def startup_event():
    init_db()

# Include routes
app.include_router(routes.router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "SecureScramble Viewer API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
