from fastapi import APIRouter, Depends

from app.api.routes import jobs, resumes, auth
from app.core.security import get_current_user

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth")

protected = APIRouter(dependencies=[Depends(get_current_user)])
protected.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
protected.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(protected)
