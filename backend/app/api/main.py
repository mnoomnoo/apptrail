from fastapi import APIRouter

from app.api.routes import jobs, resumes

api_router = APIRouter()
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
