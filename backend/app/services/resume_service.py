from datetime import datetime

from fastapi import HTTPException

from app.core.storage import (
    load_json,
    resumes_index_path,
    save_json,
)
from app.models.resume import ResumeCreate, ResumeRecord, ResumeUpdate


def _load() -> list[ResumeRecord]:
    return [ResumeRecord(**r) for r in load_json(resumes_index_path())]


def _save(records: list[ResumeRecord]) -> None:
    save_json(resumes_index_path(), [r.model_dump() for r in records])


def list_resumes() -> list[ResumeRecord]:
    return _load()


def get_resume(resume_id: str) -> ResumeRecord:
    for r in _load():
        if r.id == resume_id:
            return r
    raise HTTPException(status_code=404, detail="Resume not found")


def create_resume(data: ResumeCreate) -> ResumeRecord:
    record = ResumeRecord(**data.model_dump())
    records = _load()
    records.append(record)
    _save(records)
    return record


def update_resume(resume_id: str, data: ResumeUpdate) -> ResumeRecord:
    records = _load()
    for i, r in enumerate(records):
        if r.id == resume_id:
            updated = r.model_copy(update=data.model_dump(exclude_unset=True))
            updated.updated_at = datetime.utcnow()
            records[i] = updated
            _save(records)
            return updated
    raise HTTPException(status_code=404, detail="Resume not found")


def delete_resume(resume_id: str) -> None:
    records = _load()
    target = next((r for r in records if r.id == resume_id), None)
    if target is None:
        raise HTTPException(status_code=404, detail="Resume not found")

    records = [r for r in records if r.id != resume_id]
    _save(records)

    from app.services.job_service import nullify_resume_on_jobs
    nullify_resume_on_jobs(resume_id)
