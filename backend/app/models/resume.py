import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator

ResumeStatus = Literal["active", "draft", "archived"]


class WorkExperience(BaseModel):
    company: str = ""
    position: str = ""
    years: str = ""
    descriptions: list[str] = []


class ResumeBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    professional_statement: Optional[str] = None
    work_experiences: Optional[list[WorkExperience]] = None
    skills: Optional[list[str]] = None
    status: Optional[ResumeStatus] = None
    degree_type: Optional[str] = None
    degree_field: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[int] = None


class ResumeCreate(ResumeBase):
    pass


class ResumeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    professional_statement: Optional[str] = None
    work_experiences: Optional[list[WorkExperience]] = None
    skills: Optional[list[str]] = None
    status: Optional[ResumeStatus] = None
    degree_type: Optional[str] = None
    degree_field: Optional[str] = None
    school: Optional[str] = None
    graduation_year: Optional[int] = None


class ResumeRecord(ResumeBase):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @field_validator("work_experiences", mode="before")
    @classmethod
    def coerce_legacy_strings(cls, v):
        if v is None:
            return v
        result = []
        for item in v:
            if isinstance(item, str):
                result.append({
                    "company": "", "position": "", "years": "",
                    "descriptions": [item] if item.strip() else [],
                })
            else:
                result.append(item)
        return result


class ResumeList(BaseModel):
    data: list[ResumeRecord]
    count: int
