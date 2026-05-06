import uuid
from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class JobStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEWING = "interviewing"
    OFFER = "offer"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class JobSource(str, Enum):
    LINKEDIN = "linkedin"
    ZIPRECRUITER = "ziprecruiter"
    INDEED = "indeed"
    GLASSDOOR = "glassdoor"
    COMPANY_SITE = "company_site"
    REFERRAL = "referral"
    OTHER = "other"


class JobBase(BaseModel):
    url: Optional[str] = None
    company: str
    title: str
    description: Optional[str] = None
    notes: Optional[str] = None
    source: JobSource = JobSource.OTHER


class JobCreate(JobBase):
    resume_id: Optional[str] = None


class JobUpdate(BaseModel):
    url: Optional[str] = None
    company: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    notes: Optional[str] = None
    source: Optional[JobSource] = None
    status: Optional[JobStatus] = None
    resume_id: Optional[str] = None


class JobRecord(JobBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    status: JobStatus = JobStatus.SAVED
    resume_id: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    applied_at: Optional[datetime] = None


class JobList(BaseModel):
    data: list[JobRecord]
    count: int
