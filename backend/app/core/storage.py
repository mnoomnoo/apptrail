import json
import os
from pathlib import Path
from typing import Any

from app.core.config import settings


def get_data_dir() -> Path:
    return settings.DATA_DIR


def ensure_data_dirs() -> None:
    base = get_data_dir()
    (base / "resumes").mkdir(parents=True, exist_ok=True)
    (base / "jobs").mkdir(parents=True, exist_ok=True)


def resumes_index_path() -> Path:
    return get_data_dir() / "resumes" / "index.json"


def jobs_index_path() -> Path:
    return get_data_dir() / "jobs" / "index.json"



def load_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def save_json(path: Path, data: list[dict[str, Any]]) -> None:
    tmp = path.with_suffix(".tmp")
    with open(tmp, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, default=str)
    os.replace(tmp, path)
