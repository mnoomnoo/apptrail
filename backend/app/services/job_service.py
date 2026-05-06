from datetime import datetime
from typing import Optional

from fastapi import HTTPException

from app.core.storage import jobs_index_path, load_json, save_json
from app.models.job import JobCreate, JobRecord, JobStatus, JobUpdate

VALID_TRANSITIONS: dict[JobStatus, set[JobStatus]] = {
    JobStatus.SAVED: {JobStatus.APPLIED, JobStatus.WITHDRAWN, JobStatus.REJECTED},
    JobStatus.APPLIED: {
        JobStatus.SCREENING,
        JobStatus.INTERVIEWING,
        JobStatus.OFFER,
        JobStatus.REJECTED,
        JobStatus.WITHDRAWN,
    },
    JobStatus.SCREENING: {
        JobStatus.INTERVIEWING,
        JobStatus.OFFER,
        JobStatus.REJECTED,
        JobStatus.WITHDRAWN,
    },
    JobStatus.INTERVIEWING: {
        JobStatus.OFFER,
        JobStatus.REJECTED,
        JobStatus.WITHDRAWN,
    },
    JobStatus.OFFER: {
        JobStatus.ACCEPTED,
        JobStatus.REJECTED,
        JobStatus.WITHDRAWN,
    },
    JobStatus.ACCEPTED: set(),
    JobStatus.REJECTED: set(),
    JobStatus.WITHDRAWN: set(),
}


def _load() -> list[JobRecord]:
    return [JobRecord(**j) for j in load_json(jobs_index_path())]


def _save(records: list[JobRecord]) -> None:
    save_json(jobs_index_path(), [r.model_dump() for r in records])


def list_jobs(
    status: Optional[str] = None,
    source: Optional[str] = None,
) -> list[JobRecord]:
    records = _load()
    if status:
        records = [r for r in records if r.status == status]
    if source:
        records = [r for r in records if r.source == source]
    return records


def get_job(job_id: str) -> JobRecord:
    for j in _load():
        if j.id == job_id:
            return j
    raise HTTPException(status_code=404, detail="Job not found")


def create_job(data: JobCreate) -> JobRecord:
    record = JobRecord(**data.model_dump())
    records = _load()
    records.append(record)
    _save(records)
    return record


def update_job(job_id: str, data: JobUpdate) -> JobRecord:
    records = _load()
    for i, j in enumerate(records):
        if j.id != job_id:
            continue

        updates = {k: v for k, v in data.model_dump().items() if v is not None}

        if "status" in updates and updates["status"] != j.status:
            new_status = JobStatus(updates["status"])
            if new_status not in VALID_TRANSITIONS[j.status]:
                raise HTTPException(
                    status_code=409,
                    detail=f"Invalid status transition from '{j.status}' to '{new_status}'",
                )
            if new_status == JobStatus.APPLIED and j.applied_at is None:
                updates["applied_at"] = datetime.utcnow()

        updated = j.model_copy(update=updates)
        updated.updated_at = datetime.utcnow()
        records[i] = updated
        _save(records)
        return updated

    raise HTTPException(status_code=404, detail="Job not found")


def delete_job(job_id: str) -> None:
    records = _load()
    original_count = len(records)
    records = [j for j in records if j.id != job_id]
    if len(records) == original_count:
        raise HTTPException(status_code=404, detail="Job not found")
    _save(records)


def nullify_resume_on_jobs(resume_id: str) -> None:
    records = _load()
    changed = False
    for j in records:
        if j.resume_id == resume_id:
            j.resume_id = None
            j.updated_at = datetime.utcnow()
            changed = True
    if changed:
        _save(records)
