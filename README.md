# Multi-Agents Dashboard

Functional mission control for an OpenClaw-style AI team.

This project started from the original frontend prototype inspired by the reference video and screenshots, and is now wired into a real app architecture:

- `React 19 + Vite` frontend
- `Express` mission-control server
- `SQLite` cache + audit store
- `OpenClaw` workspace adapter
- standup/job runners
- workspace file editor
- docs timeline
- optional `Edge TTS` audio generation

## Screenshots

<p align="center">
  <img src="./docs/readme/task-manager.png" alt="Task Manager" width="48%" />
  <img src="./docs/readme/standup.png" alt="Standup" width="48%" />
</p>

<p align="center">
  <img src="./docs/readme/overnight-log.png" alt="Overnight Log" width="48%" />
  <img src="./docs/readme/meeting-archive.png" alt="Meeting Archive" width="48%" />
</p>

## What works now

### Task Manager

- Live KPI cards from SQLite-backed mission state
- Model fleet cards
- Session feed with logs, token counts, and spend
- Cron/job monitor with manual trigger buttons
- Overnight log pulled from docs + generated artifacts

### Org Chart

- Role lanes and agent hierarchy from mission data
- Chiefs, direct reports, workspace ownership, model assignment
- Quick actions to jump into workspace, docs, or standup views

### Standup

- Meeting archive backed by the database
- Create and run new standups from the UI
- Transcript generation and artifact persistence
- Playback state endpoint
- Audio playback when `edge-tts` is available
- Browser voice fallback when generated audio is not available

### Workspace

- Workspace index from the adapter/cache
- File list per workspace
- Real file loading
- Real file saving
- Markdown saves are re-indexed into the docs timeline

### Docs

- Timeline of living docs + overnight logs
- Filter by doc type and workspace
- Preview of the indexed markdown body

## Architecture

### Frontend

The UI lives in `src/` and talks to the local mission server through `/api/mission/*`.

### Backend

The backend lives in `server/` and provides:

- sync from OpenClaw-style filesystem sources
- fixture fallback when the live workspace is incomplete
- SQLite persistence for agents, models, sessions, jobs, meetings, docs, workspaces, and sync state
- mission runners for standups and manual job triggers
- audio generation hooks for `edge-tts`

### Shared contracts

The client and server both use the types in `shared/mission.ts`.

## Project structure

```text
src/
  App.tsx
  lib/api.ts
  components/
    Sidebar.tsx
    TopNav.tsx
    TaskManager.tsx
    OrgChart.tsx
    Standup.tsx
    Workspace.tsx
    Docs.tsx

server/
  index.ts
  lib/
    db.ts
    migrations.ts
    fixture.ts
    openclaw.ts
    service.ts
  types/
    better-sqlite3.d.ts

shared/
  mission.ts
```

## Environment variables

Copy `.env.example` to `.env` or `.env.local` and configure what you need.

Core mission-control variables:

- `PORT=8787`
- `APP_URL=http://localhost:3000`
- `DATABASE_PATH=./data/mission-control.db`
- `OPENCLAW_WORKSPACE_PATH=`
- `OPENCLAW_GATEWAY_URL=`
- `OPENCLAW_GATEWAY_TOKEN=`
- `OPENCLAW_MEMORY_DB_PATH=`
- `MISSION_DOCS_ROOT=./data/mission-docs`
- `MISSION_AUDIO_OUTPUT_PATH=./data/mission-audio`
- `EDGE_TTS_VOICE_MAP={"default":"en-US-AndrewNeural"}`
- `MISSION_REFRESH_INTERVAL_MS=300000`

Notes:

- If `OPENCLAW_WORKSPACE_PATH` points to a real workspace, the adapter will try to read models, jobs, org chart, docs, and workspace files.
- If the workspace is incomplete or missing, the app falls back to the built-in mission fixture so the dashboard still works.
- `EDGE_TTS_VOICE_MAP` is optional. If `edge-tts` is not installed, standups still run and the UI falls back to browser speech.

## Local development

Install dependencies:

```bash
npm install
```

Start both frontend and backend:

```bash
npm run dev
```

That launches:

- Vite client on `http://localhost:3000`
- Express server on `http://localhost:8787`

The Vite dev server proxies `/api` calls to the backend automatically.

## Production build

Build client + server:

```bash
npm run build
```

Start the compiled server:

```bash
npm run start
```

The production server serves both the built frontend and the mission APIs.

## API surfaces

Implemented endpoints:

- `GET /api/mission/summary`
- `GET /api/mission/sessions`
- `GET /api/mission/jobs`
- `POST /api/mission/jobs/:id/trigger`
- `GET /api/mission/meetings`
- `POST /api/mission/meetings`
- `GET /api/mission/meetings/:id`
- `POST /api/mission/meetings/:id/run`
- `GET /api/mission/meetings/:id/playback`
- `GET /api/mission/org-chart`
- `GET /api/mission/workspaces`
- `GET /api/mission/workspaces/:id/file?fileId=...`
- `PUT /api/mission/workspaces/:id/file?fileId=...`
- `GET /api/mission/docs`
- `POST /api/mission/sync`

## OpenClaw adapter behavior

The adapter currently looks for filesystem-style sources such as:

- `.openclaw/openclaw.json`
- `agents/main/agent/models.json`
- `.openclaw/cron/jobs.json`
- `org-chart.json`
- `.openclaw/org-chart.json`
- `agents.json`
- markdown docs under the workspace or configured docs root

When those sources are found, they are normalized and cached in SQLite.

## Data flow

1. The UI requests `/api/mission/*`.
2. The server ensures the cache is fresh.
3. `server/lib/openclaw.ts` loads live workspace data or falls back to `server/lib/fixture.ts`.
4. `server/lib/service.ts` writes the normalized snapshot into SQLite.
5. The UI renders the cached mission state and can trigger new standups/jobs.
6. Generated artifacts are written to disk and also indexed back into the docs timeline.

## Standup runner

When you create and run a standup:

1. A meeting row is created in SQLite.
2. A runner session is created in the session feed.
3. The mission runner generates meeting turns.
4. Action items and playbook artifacts are written as markdown files.
5. Those artifacts are inserted into `doc_entries`.
6. If `edge-tts` works, an `.mp3` is created and exposed through the playback endpoint.

## Notes

- This repo is no longer just a UI mock. It now contains the full mission-control app shell, server, data layer, and runners.
- The OpenClaw adapter is intentionally filesystem-first so it can live in the same Ubuntu VM as the agent workspace.
- If your exact workspace structure differs from the current adapter assumptions, extend `server/lib/openclaw.ts` with your real paths and formats.
