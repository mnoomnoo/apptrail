import io
import re
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, UploadFile
from pydantic import BaseModel

from app.models.resume import ResumeCreate, ResumeList, ResumeRecord, ResumeUpdate, WorkExperience
from app.services import resume_service

router = APIRouter()


class ParsedResume(BaseModel):
    name: str = ""
    email: str = ""
    phone: str = ""
    linkedin_url: str = ""
    github_url: str = ""
    professional_statement: str = ""
    work_experiences: list[WorkExperience] = []
    skills: list[str] = []
    degree_type: str = ""
    degree_field: str = ""
    school: str = ""
    graduation_year: Optional[int] = None


_MONTH = (
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?"
    r"|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
)
_DATE_RANGE = re.compile(
    rf"(?:{_MONTH}\s+)?\d{{4}}\s*[-–—]\s*(?:{_MONTH}\s+\d{{4}}|{_MONTH}|\d{{4}}|Present|Current)",
    re.I,
)


def _preprocess(text: str) -> str:
    """Join 'December\n2025' → 'December 2025' (PDF line-wrap artefact)."""
    month_tail = re.compile(rf"{_MONTH}\s*$", re.I)
    year_only = re.compile(r"^\d{4}$")
    lines = text.split("\n")
    out, i = [], 0
    while i < len(lines):
        line = lines[i]
        if (
            i + 1 < len(lines)
            and month_tail.search(line.rstrip())
            and year_only.match(lines[i + 1].strip())
        ):
            out.append(line.rstrip() + " " + lines[i + 1].strip())
            i += 2
        else:
            out.append(line)
            i += 1
    return "\n".join(out)


def _parse_work_experiences(text: str) -> list[WorkExperience]:
    experiences: list[WorkExperience] = []
    current: Optional[WorkExperience] = None
    for raw in text.split("\n"):
        line = raw.strip()
        if not line:
            continue
        is_bullet = bool(re.match(r"^[•\-\*–—·]\s", line))
        date_m = _DATE_RANGE.search(line)
        if is_bullet:
            if current is None:
                current = WorkExperience()
            desc = re.sub(r"^[•\-\*–—·]\s*", "", line).strip()
            if desc:
                current.descriptions.append(desc)
        elif date_m:
            if current:
                experiences.append(current)
            date_str = date_m.group().strip()
            remainder = (line[: date_m.start()] + line[date_m.end():]).strip().strip(",").strip()
            parts = re.split(r",\s*", remainder, maxsplit=1)
            current = WorkExperience(
                company=parts[0].strip(),
                position=parts[1].strip() if len(parts) > 1 else "",
                years=date_str,
            )
        else:
            # continuation of a wrapped bullet line
            if current and current.descriptions:
                current.descriptions[-1] += " " + line
    if current:
        experiences.append(current)
    return experiences


def _parse_resume(text: str) -> ParsedResume:
    text = _preprocess(text)
    r = ParsedResume()

    if m := re.search(r"\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b", text, re.I):
        r.email = m.group()
    if m := re.search(r"\b(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})\b", text):
        r.phone = m.group(1)
    if m := re.search(r"(?:https?://)?(?:www\.)?linkedin\.com/in/[\w-]+", text, re.I):
        u = m.group().rstrip("/")
        r.linkedin_url = u if u.startswith("http") else "https://" + u
    if m := re.search(r"(?:https?://)?(?:www\.)?github\.com/[\w-]+", text, re.I):
        u = m.group().rstrip("/")
        r.github_url = u if u.startswith("http") else "https://" + u

    for line in text.split("\n"):
        s = line.strip()
        if s and not re.search(r"@|\.com/|[-.]?\d{3}[-.]?\d{4}|linkedin|github", s, re.I):
            r.name = s
            break

    def _section(pattern: str) -> Optional[re.Match]:
        return re.search(pattern, text, re.I | re.M)

    work_m = _section(r"^Work\s+Experience\s*:?\s*$") or _section(r"\bWork\s+Experience\s*:")
    skills_m = _section(r"^Skills\s*:?\s*$") or _section(r"\bSkills\s*:")
    edu_m = _section(r"^Education\s*:?\s*$") or _section(r"\bEducation\s*:")

    pos = {
        "work": work_m.end() if work_m else None,
        "skills": skills_m.end() if skills_m else None,
        "edu": edu_m.end() if edu_m else None,
    }

    if work_m:
        stmt = []
        for i, line in enumerate(text[: work_m.start()].split("\n")):
            s = line.strip()
            if not s or re.search(r"@|\.com/|[-.]?\d{3}[-.]?\d{4}|linkedin|github", s, re.I):
                continue
            if i == 0:
                continue
            stmt.append(s)
        r.professional_statement = " ".join(stmt).strip()

    if pos["skills"] is not None:
        end = next(
            (p for k, p in pos.items() if k != "skills" and p and p > pos["skills"]),
            len(text),
        )
        for line in text[pos["skills"]: end].split("\n"):
            s = line.strip()
            if not s:
                continue
            colon = s.find(":")
            if 0 < colon < 30:
                s = s[colon + 1:]
            for part in s.split(","):
                p = part.strip()
                if p and len(p) < 60:
                    r.skills.append(p)

    if pos["edu"] is not None:
        edu_text = text[pos["edu"]:].strip()
        if m := re.search(
            r"\b(Bachelor(?:\s+of\s+\w+)?|Master(?:\s+of\s+\w+)?|Ph\.?D\.?|Doctor(?:ate)?|Associate(?:\s+of\s+\w+)?)",
            edu_text, re.I,
        ):
            r.degree_type = m.group().strip()
        if m := re.search(r"\bin\s+([A-Z][a-zA-Z\s]{3,30}?)(?=\s*(?:,|—|-|\d{4}|\n|$))", edu_text):
            r.degree_field = m.group(1).strip()
        if m := re.search(r"(University\s+of\s+\w+|[A-Z][a-z]+\s+University|[A-Z][a-z]+\s+College)", edu_text):
            r.school = m.group().strip()
        for pat in [r"[-–—]\s*(\d{4})\s*(?:\n|$)", r",\s*(\d{4})\s*(?:\n|$)"]:
            if m := re.search(pat, edu_text):
                r.graduation_year = int(m.group(1))
                break

    if pos["work"] is not None:
        work_end = next(
            (p for k, p in pos.items() if k != "work" and p and p > pos["work"]),
            len(text),
        )
        r.work_experiences = _parse_work_experiences(text[pos["work"]: work_end])

    return r


@router.post("/extract-text", response_model=ParsedResume)
async def extract_resume_text(file: UploadFile):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in {".docx", ".pdf"}:
        raise HTTPException(status_code=400, detail="Only .docx and .pdf files are accepted")
    content = await file.read()
    if ext == ".docx":
        try:
            from docx import Document
            doc = Document(io.BytesIO(content))
            text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupt .docx file")
    else:
        try:
            import pdfplumber
            with pdfplumber.open(io.BytesIO(content)) as pdf:
                pages_text = []
                for page in pdf.pages:
                    # x_tolerance_ratio scales the word-gap threshold proportionally
                    # to each character's size, fixing no-space extraction on tight fonts
                    t = page.extract_text(x_tolerance_ratio=0.15, y_tolerance=3)
                    if t:
                        pages_text.append(t)
                text = "\n".join(pages_text).strip()
                # Collapse any multiple spaces left by layout extraction
                text = re.sub(r" {2,}", " ", text)
        except Exception:
            raise HTTPException(status_code=400, detail="Invalid or corrupt PDF file")
    if not text.strip():
        raise HTTPException(status_code=400, detail="No text could be extracted from file")
    print(f"[PDF EXTRACT] {text[:400]!r}", flush=True)
    return _parse_resume(text)


@router.get("", response_model=ResumeList)
def list_resumes():
    data = resume_service.list_resumes()
    return ResumeList(data=data, count=len(data))


@router.post("", response_model=ResumeRecord, status_code=201)
def create_resume(body: ResumeCreate):
    return resume_service.create_resume(body)


@router.get("/{resume_id}", response_model=ResumeRecord)
def get_resume(resume_id: str):
    return resume_service.get_resume(resume_id)


@router.patch("/{resume_id}", response_model=ResumeRecord)
def update_resume(resume_id: str, body: ResumeUpdate):
    return resume_service.update_resume(resume_id, body)


@router.delete("/{resume_id}", status_code=204)
def delete_resume(resume_id: str):
    resume_service.delete_resume(resume_id)
