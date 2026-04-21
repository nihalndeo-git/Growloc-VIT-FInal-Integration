# Growloc

Minimal scaffold for an AI-powered plant monitoring web app: Next.js (App Router) frontend with API routes and a separate FastAPI inference service. ML models are mocked; plug real weights into `ai-service` without changing the overall flow.

## Layout

- `frontend/` — Next.js + Tailwind + shadcn/ui
- `ai-service/` — FastAPI (`POST /analyze`)

## Prerequisites

- **Node.js 18.17+** (Next.js 14 supports Node 18)
- Python 3.11+ with `uvicorn` on your `PATH` (e.g. activate your conda env and `pip install -r ai-service/requirements.txt`)

## Run locally

Start the AI service in one terminal:

```bash
cd ai-service
uvicorn main:app --reload --host 127.0.0.1 --port 8001
```

Start the frontend in another terminal:

```bash
cd frontend
npm install
npm run dev
```

Then open http://localhost:3000 to upload images and see canopy metrics.

You can also `cd frontend` and run `npm run dev` there. **Do not** run `npm` from `ai-service/` — that folder has no `package.json` (Python only). Use `growloc/` or `frontend/` for npm commands.

Open [http://localhost:3000](http://localhost:3000). Upload an image; the app calls `POST /api/analyze`, which stores the file in MinIO, calls the AI service, persists metrics in MongoDB, and returns JSON for the UI.

**Run pieces manually (optional):** start MongoDB + MinIO yourself, set `DEV_SKIP_INFRA=1`, then in one terminal `cd ai-service && uvicorn main:app --reload --port 8001` and in another `cd frontend && npm run dev:next`.

## API contract

- **Next.js** `POST /api/analyze` — multipart field `file`
- **FastAPI** `POST /analyze` — multipart field `file`

AI JSON response:

```json
{
  "canopy_height": 0.0,
  "canopy_width": 0.0,
  "canopy_area": 0.0
}
```

## Extending ML

- Implement real loading in `ai-service/inference.py` (`load_models`, `run_inference`, `extract_metrics`).
- Add weights or configs under `ai-service/models/` as needed.
