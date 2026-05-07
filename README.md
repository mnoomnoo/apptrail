# AppTrail

A local web app for tracking job applications, resumes, and their statuses.

## Stack

- **Backend:** Python 3 / FastAPI — REST API, file-based storage (JSON + .docx)
- **Frontend:** React + TypeScript / Chakra UI v3 / TanStack Query

## Running

You need two terminals.

**Terminal 1 — backend**
```bash
cd backend
uvicorn app.main:app --reload
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install   # first time only
npm run dev
```

Open `http://localhost:5173`.

## Docker

Prefer a single-command setup? Docker Compose runs both services with no separate terminals needed.

**Start**
```bash
docker compose up --build -d
```

Open `http://localhost`.

**Stop**
```bash
docker compose down
```

Data is stored in `~/job_data` on your host machine — the same location used by the manual setup, so the two approaches share data.

> Environment variables (`DATA_DIR`, `FRONTEND_ORIGIN`) are already configured in `docker-compose.yml`. No `.env` file is needed when using Docker.

## Configuration

Edit `.env` at the project root:

```env
DATA_DIR=/home/you/job_data      # where resumes and jobs are stored
FRONTEND_ORIGIN=http://localhost:5173
```

`DATA_DIR` is created automatically on first run. All data lives there — back it up to keep your records.

### Changing the frontend port (Docker)

The frontend nginx container listens on port 80 by default. To change it:

1. Edit `frontend/nginx.conf` — update the `listen` directive:
   ```nginx
   listen 3000;
   ```

2. Edit `docker-compose.yml` — update `FRONTEND_ORIGIN` on the backend service to match:
   ```yaml
   - FRONTEND_ORIGIN=http://localhost:3000
   ```

3. Rebuild and restart:
   ```bash
   docker compose up --build -d
   ```

## Features

### Jobs
- Track jobs with URL, company, position, description, notes, and source (LinkedIn, Indeed, etc.)
- Filter the list by status or source, or search by company/title/notes
- Associate a resume with each job at creation or later
- Progress through statuses as your application moves forward

**Status flow:**

```
Saved → Applied → Screening → Interviewing → Offer → Accepted
                                                    ↘ Rejected
                                                    ↘ Withdrawn
```

Any status can also transition directly to Rejected or Withdrawn. Terminal statuses (Accepted, Rejected, Withdrawn) cannot be changed.

When a job moves to Applied, the date is recorded automatically.

### Resumes
- Create a resume from a blank template (generates a .docx with placeholder sections)
- Or copy an existing resume's .docx as a starting point
- Upload a .docx after editing it in Word or LibreOffice
- Download any resume's .docx at any time
- Edit name, target role, and notes

## Data layout

```
$DATA_DIR/
├── resumes/
│   ├── index.json        # resume metadata
│   └── files/
│       └── {id}.docx
└── jobs/
    └── index.json        # job metadata
```

## API

Interactive docs available at `http://localhost:8000/docs` while the backend is running.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/resumes` | List resumes |
| POST | `/api/v1/resumes` | Create resume |
| PATCH | `/api/v1/resumes/{id}` | Update resume metadata |
| DELETE | `/api/v1/resumes/{id}` | Delete resume |
| POST | `/api/v1/resumes/{id}/upload` | Upload .docx |
| GET | `/api/v1/resumes/{id}/download` | Download .docx |
| GET | `/api/v1/jobs` | List jobs (`?status=` `?source=`) |
| POST | `/api/v1/jobs` | Create job |
| PATCH | `/api/v1/jobs/{id}` | Update job / advance status |
| DELETE | `/api/v1/jobs/{id}` | Delete job |
