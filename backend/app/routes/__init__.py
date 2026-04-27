"""
Routes package
Exports all API routers
"""
from app.routes.inventory import router as inventory_router
from app.routes.auth import router as auth_router
from app.routes.requests import router as requests_router

# List of all routers to be exported
__all__ = [
    "inventory_router",
    "auth_router",
    "requests_router"
]
