# Parts Platform – Phase 1 MVP

AI-based parts identification and inventory system. Phase 1 is web-only: upload images, manage parts library, view scan results (only unrecognized/low-confidence boxed), adjust inventory, and generate invoices.

<img width="1905" height="942" alt="image" src="https://github.com/user-attachments/assets/3e4fa0c5-e007-4e6a-92ad-6651b1a76f45" />

## Tech stack

- **Frontend**: Next.js 14 (React), TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript, MongoDB (Mongoose)
- **Vision**: Python FastAPI stub (optional; backend uses stub detections if service not running)

## Color palette (theme)

- `#1B211A` – Dark (header, text)
- `#628141` – Primary (buttons, accents)
- `#8BAE66` – Secondary (hover, badges)
- `#EBD5AB` – Light (background, content)

## Setup

### 1. MongoDB

Run MongoDB locally (e.g. `mongod`) or set `MONGODB_URI` (e.g. Atlas).

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on http://localhost:4000. Copy `backend/.env.example` to `backend/.env` and set:

- `PORT` (default 4000)
- `MONGODB_URI` (default `mongodb://localhost:27017/parts-platform`)
- `OPENAI_API_KEY` (optional) – when set, scan images are analyzed with OpenAI Vision (GPT-4o) to identify parts against the TerreMax camlock catalog. **Do not commit the key**; use `.env` only.
- `OPENAI_VISION_MODEL` (optional, default `gpt-4o`)
- `VISION_SERVICE_URL` (optional, e.g. `http://localhost:5000`) – Python vision service; used only if `OPENAI_API_KEY` is not set.
- `UPLOAD_DIR` (default `./uploads`)

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on http://localhost:3000. API calls are proxied to the backend via Next.js rewrites (`/api-backend/*` → backend `/api/*`).

### 4. Vision service (optional)

```bash
cd vision
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

If not running and `OPENAI_API_KEY` is not set, the backend returns stub detections.

### 5. TerreMax catalog (AI recognition)

The app includes a TerreMax camlock catalog (see [terremax.us/camlock-couplings](https://terremax.us/camlock-couplings/)). To seed the Parts library from it:

```bash
curl -X POST http://localhost:4000/api/parts/seed-terremax
```

Then set `OPENAI_API_KEY` in `backend/.env`. When you upload a scan image, the backend sends it to OpenAI Vision with the catalog context; the model returns recognized part IDs (e.g. `100A`, `200B`) or marks parts as unrecognized with guidance (retake, rotate, flip).

## Features (Phase 1)

- **Parts Library**: Add/edit/delete parts and size variants (name, unit price).
- **Scan**: Upload images → backend calls vision (or stub) → session with detections. Only unrecognized or low-confidence parts are boxed; guidance (e.g. rotate, retake) shown for those.
- **Inventory**: List and adjust quantity on hand per part/size.
- **Invoices**: List invoices; generate from scan session (decrements inventory); create manual invoice (POST with line items).

## Scan behavior

- Recognized parts are **not** boxed.
- Only unrecognized or confidence &lt; 0.7 are boxed/highlighted with optional guidance.
- No part is silently skipped or guessed.
