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
uv run python -m uvicorn app.main:app --reload
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

> **Auth credentials are required.** Docker Compose reads `AUTH_PASSWORD_HASH` and `AUTH_SECRET_KEY` from the `.env` file at the project root. Make sure your `.env` contains these values before running `docker compose up`. See the [Authentication](#authentication) section for how to generate them.

## Configuration

Edit `.env` at the project root:

```env
DATA_DIR=/home/you/job_data      # where resumes and jobs are stored
FRONTEND_ORIGIN=http://localhost:5173
```

`DATA_DIR` is created automatically on first run. All data lives there — back it up to keep your records.

### Authentication

AppTrail requires a username and password to log in. Credentials are set in `.env` — there is no registration system.

**Initial setup**

Add these three variables to `.env`:

```env
AUTH_USERNAME=admin
AUTH_PASSWORD_HASH=<generate below>
AUTH_SECRET_KEY=<generate below>
```

Generate a bcrypt hash for your chosen password (run from the `backend/` directory):

```bash
uv run python -c "import bcrypt; print(bcrypt.hashpw(b'your-password', bcrypt.gensalt()).decode())"
```

Generate a random secret key for signing tokens:

```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**Changing your password**

Re-run the hash command with the new password, paste the output into `AUTH_PASSWORD_HASH` in `.env`, then restart the backend. No database records need updating.

**Token expiry**

Tokens expire after 24 hours — just log in again. To change the window, set `AUTH_TOKEN_EXPIRE_HOURS` in `.env` (e.g. `AUTH_TOKEN_EXPIRE_HOURS=168` for 7 days).

**API access**

All `/api/v1/*` endpoints require `Authorization: Bearer <token>`. Obtain a token by posting to `POST /api/v1/auth/token` with form fields `username` and `password`. Interactive docs at `http://localhost:8000/docs` include an Authorize button for this.

> **Docker:** Add `AUTH_USERNAME`, `AUTH_PASSWORD_HASH`, and `AUTH_SECRET_KEY` to the backend service's `environment:` block in `docker-compose.yml`, or switch to `env_file: - .env` on that service.

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
