# AppTrail

A local web app for tracking job applications, resumes, and their statuses.

## Stack

- **Backend:** Python 3 / FastAPI — REST API, file-based JSON storage
- **Frontend:** React + TypeScript / Chakra UI v3 / TanStack Query

## Getting Started

You need two terminals.

**Terminal 1 — backend**
```bash
cd backend
uv run python -m uvicorn app.main:app --reload
```

**Terminal 2 — frontend**
```bash
cd frontend
npm install   # first time only
npm run dev
```

Open `http://localhost:5173`. On first launch you'll be prompted to create a username and password — no manual configuration needed.

## Docker

Prefer a single-command setup? Docker Compose runs both services with no separate terminals needed.

**Start**
```bash
docker compose up --build -d
```

Open `http://localhost`. On first visit the browser setup page runs as usual — credentials are saved to `~/job_data/auth.json` (the host-mounted data volume) and survive container restarts.

**Stop**
```bash
docker compose down
```

Data is stored in `~/job_data` on your host machine — the same location used by the local setup, so both approaches share data seamlessly.

## Configuration

Edit `.env` at the project root to override defaults:

```env
DATA_DIR=/home/you/job_data      # where all data is stored (created automatically)
FRONTEND_ORIGIN=http://localhost:5173
```

A `.env.example` file at the project root lists every available variable with descriptions.

### Authentication

On first run the app presents a setup page in the browser. Enter a username and password — credentials are hashed with bcrypt and stored in `DATA_DIR/auth.json`. No terminal access required.

**Changing your password**

Log in, go to **Settings**, and use the Change Password section. It generates a new bcrypt hash; copy it to `DATA_DIR/auth.json` (or `AUTH_PASSWORD_HASH` in `.env`) and restart the backend.

**Token expiry**

Login sessions expire after 24 hours. To change the window, add `AUTH_TOKEN_EXPIRE_HOURS=<hours>` to `.env` (e.g. `168` for 7 days).

**Manual credential setup (advanced)**

If you prefer to set credentials via environment variables instead of the browser setup page — for example in an automated deployment — add these to `.env`:

```env
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<bcrypt hash>
AUTH_SECRET_KEY=<64-char hex string>
```

Generate a hash:
```bash
cd backend && uv run python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"
```

Generate a secret key:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

Environment variables take priority over `auth.json`, so the browser setup page is automatically disabled when they are set.

### Changing the frontend port (Docker)

The nginx container listens on port 80 by default. To change it:

1. Edit `frontend/nginx.conf` — update the `listen` directive:
   ```nginx
   listen 3000;
   ```
2. Edit `docker-compose.yml` — update `FRONTEND_ORIGIN` on the backend service:
   ```yaml
   - FRONTEND_ORIGIN=http://localhost:3000
   ```
3. Rebuild: `docker compose up --build -d`

## Features

### Jobs
- Track jobs with URL, company, position, description, notes, and source (LinkedIn, Indeed, etc.)
- Filter by status or source, or search by company / title / notes
- Associate a resume with each job at creation or later
- Progress through statuses as your application moves forward

**Status flow:**

```
Saved → Applied → Screening → Interviewing → Offer → Accepted
                                                    ↘ Rejected
                                                    ↘ Withdrawn
```

Any status can transition directly to Rejected or Withdrawn. Terminal statuses (Accepted, Rejected, Withdrawn) cannot be changed. The date is recorded automatically when a job moves to Applied.

### Resumes
- Create a resume from a blank template (.docx with placeholder sections)
- Copy an existing resume's .docx as a starting point
- Upload a .docx after editing in Word or LibreOffice
- Download any resume at any time
- Edit name, target role, and notes

## Data layout

```
$DATA_DIR/
├── auth.json             # login credentials (written by setup flow)
├── jobs/
│   └── index.json        # job records
└── resumes/
    ├── index.json        # resume metadata
    └── files/
        └── {id}.docx
```

Back up `$DATA_DIR` to keep your records safe.

## API

Interactive docs at `http://localhost:8000/docs` while the backend is running.

**Auth**

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/auth/status` | — | Returns `{"needs_setup": bool}` |
| POST | `/api/v1/auth/setup` | — | First-run credential creation (disabled once configured) |
| POST | `/api/v1/auth/token` | — | Login — returns a Bearer token |
| POST | `/api/v1/auth/generate-credentials` | Required | Generate a new password hash or secret key |

**Jobs**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/jobs` | List jobs (`?status=` `?source=`) |
| POST | `/api/v1/jobs` | Create job |
| PATCH | `/api/v1/jobs/{id}` | Update job / advance status |
| DELETE | `/api/v1/jobs/{id}` | Delete job |

**Resumes**

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/resumes` | List resumes |
| POST | `/api/v1/resumes` | Create resume |
| PATCH | `/api/v1/resumes/{id}` | Update resume metadata |
| DELETE | `/api/v1/resumes/{id}` | Delete resume |
| POST | `/api/v1/resumes/{id}/upload` | Upload .docx |
| GET | `/api/v1/resumes/{id}/download` | Download .docx |

All Jobs and Resumes endpoints require a Bearer token (`Authorization: Bearer <token>`).
