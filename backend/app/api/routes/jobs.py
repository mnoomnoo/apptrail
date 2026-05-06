from typing import Optional

from fastapi import APIRouter

from app.models.job import JobCreate, JobList, JobRecord, JobUpdate
from app.services import job_service

router = APIRouter()


@router.get("", response_model=JobList)
def list_jobs(status: Optional[str] = None, source: Optional[str] = None):
    data = job_service.list_jobs(status=status, source=source)
    return JobList(data=data, count=len(data))


@router.post("", response_model=JobRecord, status_code=201)
def create_job(body: JobCreate):
    return job_service.create_job(body)


@router.get("/{job_id}", response_model=JobRecord)
def get_job(job_id: str):
    return job_service.get_job(job_id)


@router.patch("/{job_id}", response_model=JobRecord)
def update_job(job_id: str, body: JobUpdate):
    return job_service.update_job(job_id, body)


@router.delete("/{job_id}", status_code=204)
def delete_job(job_id: str):
    job_service.delete_job(job_id)
