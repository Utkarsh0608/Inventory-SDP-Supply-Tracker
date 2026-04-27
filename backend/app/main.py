"""
Main FastAPI application entry point
This file sets up the FastAPI app, includes routers, and configures basic settings
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import inventory_router, auth_router, requests_router

# Create FastAPI app instance
app = FastAPI(
    title="Inventory & SDP Supply Tracker",
    description="API for managing inventory and service delivery point requests",
    version="1.0.0"
)

# Configure CORS to allow frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins (change in production)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(inventory_router)
app.include_router(auth_router)
app.include_router(requests_router)

# Health check endpoint
@app.get("/")
def root():
    return {"message": "Inventory & SDP Supply Tracker API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
