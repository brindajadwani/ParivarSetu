from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.api_router import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="One Family – One ID: Scheme Benefit Tracking System API for Government of Gujarat",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permits local Vite frontend & client access
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "ParivarSetu Backend API",
        "version": "1.0.0",
        "state": "Government of Gujarat - One Family One ID (ParivarSetu)"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to ParivarSetu API (One Family - One ID)",
        "docs": "/docs",
        "health": "/health"
    }
