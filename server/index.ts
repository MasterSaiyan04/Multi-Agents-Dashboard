import 'dotenv/config';

import express from 'express';
import path from 'node:path';
import fs from 'node:fs';

import {
  createMeetingRun,
  getMeetingAudioFile,
  getMeetingPlaybackState,
  getMeetingRunDetails,
  getMissionSummary,
  getWorkspaceFileDetail,
  listDocEntries,
  listMeetingRuns,
  listMissionSessions,
  listOrgChart,
  listScheduledJobs,
  listWorkspaces,
  saveWorkspaceFileDetail,
  startMeetingRun,
  syncMissionControl,
  triggerScheduledJob,
} from './lib/service.js';

const app = express();
const port = Number(process.env.PORT || 8787);
const distPath = path.resolve(process.cwd(), 'dist');

app.use(express.json({ limit: '2mb' }));

app.use((_, response, next) => {
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  if (response.req.method === 'OPTIONS') {
    response.status(204).end();
    return;
  }
  next();
});

app.get('/api/mission/summary', async (_request, response, next) => {
  try {
    response.json(await getMissionSummary());
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/sessions', async (_request, response, next) => {
  try {
    response.json(await listMissionSessions());
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/jobs', async (_request, response, next) => {
  try {
    response.json(await listScheduledJobs());
  } catch (error) {
    next(error);
  }
});

app.post('/api/mission/jobs/:id/trigger', async (request, response, next) => {
  try {
    response.json(await triggerScheduledJob(request.params.id));
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/meetings', async (_request, response, next) => {
  try {
    response.json(await listMeetingRuns());
  } catch (error) {
    next(error);
  }
});

app.post('/api/mission/meetings', async (request, response, next) => {
  try {
    response.status(201).json(await createMeetingRun(request.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/meetings/:id', async (request, response, next) => {
  try {
    const meeting = await getMeetingRunDetails(request.params.id);
    if (!meeting) {
      response.status(404).json({ error: 'Meeting not found.' });
      return;
    }
    response.json(meeting);
  } catch (error) {
    next(error);
  }
});

app.post('/api/mission/meetings/:id/run', async (request, response, next) => {
  try {
    response.json(await startMeetingRun(request.params.id, request.body));
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/meetings/:id/playback', async (request, response, next) => {
  try {
    if (request.query.audio === '1') {
      const audio = await getMeetingAudioFile(request.params.id);
      if (!audio) {
        response.status(404).json({ error: 'Audio not found.' });
        return;
      }
      response.setHeader('Content-Type', audio.contentType);
      response.send(audio.bytes);
      return;
    }

    const playback = await getMeetingPlaybackState(request.params.id);
    if (!playback) {
      response.status(404).json({ error: 'Playback state not found.' });
      return;
    }
    response.json(playback);
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/org-chart', async (_request, response, next) => {
  try {
    response.json(await listOrgChart());
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/workspaces', async (_request, response, next) => {
  try {
    response.json(await listWorkspaces());
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/workspaces/:id/file', async (request, response, next) => {
  try {
    const fileId = String(request.query.fileId || '');
    if (!fileId) {
      response.status(400).json({ error: 'fileId is required.' });
      return;
    }

    const detail = await getWorkspaceFileDetail(request.params.id, fileId);
    if (!detail) {
      response.status(404).json({ error: 'File not found.' });
      return;
    }
    response.json(detail);
  } catch (error) {
    next(error);
  }
});

app.put('/api/mission/workspaces/:id/file', async (request, response, next) => {
  try {
    const fileId = String(request.query.fileId || '');
    if (!fileId) {
      response.status(400).json({ error: 'fileId is required.' });
      return;
    }
    if (typeof request.body?.content !== 'string') {
      response.status(400).json({ error: 'content is required.' });
      return;
    }

    const detail = await saveWorkspaceFileDetail(request.params.id, fileId, request.body.content);
    if (!detail) {
      response.status(404).json({ error: 'File not found.' });
      return;
    }
    response.json(detail);
  } catch (error) {
    next(error);
  }
});

app.get('/api/mission/docs', async (_request, response, next) => {
  try {
    response.json(await listDocEntries());
  } catch (error) {
    next(error);
  }
});

app.post('/api/mission/sync', async (_request, response, next) => {
  try {
    response.json(await syncMissionControl(true));
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _request: express.Request, response: express.Response, _next: express.NextFunction) => {
  const message = error instanceof Error ? error.message : 'Unknown server error';
  response.status(500).json({ error: message });
});

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (request, response, next) => {
    if (request.path.startsWith('/api/')) {
      next();
      return;
    }

    response.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Mission control server listening on http://localhost:${port}`);
});
