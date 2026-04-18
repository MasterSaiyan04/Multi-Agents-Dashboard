import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';

import { getDb } from './db.js';
import { getFixtureWorkspaceFileContent } from './fixture.js';
import { loadOpenClawMissionSnapshot } from './openclaw.js';
import type {
  AgentProfile,
  AgentRole,
  DocEntry,
  MeetingArtifact,
  MeetingCreateInput,
  MeetingParticipant,
  MeetingPlaybackState,
  MeetingRun,
  MeetingRunInput,
  MeetingTurn,
  MissionCounts,
  MissionJobRunResult,
  MissionKpi,
  MissionSession,
  MissionSnapshot,
  MissionStatus,
  MissionSummary,
  MissionSyncResult,
  ModelFleetCard,
  OrgChartPayload,
  ScheduledJob,
  SessionEvent,
  WorkspaceFileDetail,
  WorkspaceFileSummary,
  WorkspaceSnapshot,
} from '../../shared/mission.js';

const DEFAULT_REFRESH_INTERVAL_MS = Number(process.env.MISSION_REFRESH_INTERVAL_MS || 300000);
const MISSION_SYNC_KEY = 'mission';

declare global {
  // eslint-disable-next-line no-var
  var __missionRunQueue:
    | Map<
        string,
        {
          kind: 'meeting' | 'job';
          promise: Promise<void>;
        }
      >
    | undefined;
}

function getRunQueue() {
  if (!global.__missionRunQueue) {
    global.__missionRunQueue = new Map();
  }
  return global.__missionRunQueue;
}

function isoNow() {
  return new Date().toISOString();
}

function formatDateLabel(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

function formatTimeLabel(value: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(value));
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function compactNumber(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return `${value}`;
}

function compactCurrency(value: number) {
  if (value === 0) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: value < 10 ? 3 : 2,
  }).format(value);
}

function stringifyJson(value: unknown) {
  return JSON.stringify(value ?? {});
}

function parseJson<T>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function excerpt(content: string, limit = 180) {
  const normalized = content.replace(/\s+/g, ' ').trim();
  if (normalized.length <= limit) {
    return normalized;
  }
  return `${normalized.slice(0, limit - 1)}…`;
}

function inferStatusFromText(value: string): MissionStatus {
  const normalized = value.toLowerCase();
  if (normalized.includes('complete')) return 'completed';
  if (normalized.includes('build')) return 'building';
  if (normalized.includes('queue')) return 'queued';
  if (normalized.includes('error') || normalized.includes('fail')) return 'error';
  if (normalized.includes('idle')) return 'idle';
  if (normalized.includes('inactive')) return 'inactive';
  if (normalized.includes('scaffold')) return 'scaffolded';
  return 'active';
}

function missionDocsRoot() {
  const configured = process.env.MISSION_DOCS_ROOT || './data/mission-docs';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

function missionAudioRoot() {
  const configured = process.env.MISSION_AUDIO_OUTPUT_PATH || './data/mission-audio';
  return path.isAbsolute(configured) ? configured : path.resolve(process.cwd(), configured);
}

async function ensureDir(targetPath: string) {
  await fs.mkdir(targetPath, { recursive: true });
}

async function pathExists(targetPath: string | null | undefined) {
  if (!targetPath) {
    return false;
  }

  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function buildParticipant(agentName: string, agents: AgentProfile[], roles: AgentRole[]): MeetingParticipant {
  const normalized = agentName.toLowerCase();
  const agent =
    agents.find((candidate) => candidate.id.toLowerCase() === normalized) ||
    agents.find((candidate) => candidate.name.toLowerCase() === normalized) ||
    agents.find((candidate) => candidate.name.toLowerCase().includes(normalized)) ||
    agents.find((candidate) => normalized.includes(candidate.name.toLowerCase()));

  if (!agent) {
    return {
      id: slugify(agentName),
      name: agentName,
      role: 'Chief',
      emoji: '🤖',
      color: 'amber',
    };
  }

  const role = roles.find((candidate) => candidate.slug === agent.roleSlug);
  const defaultColor =
    agent.color === '#5DCAA5'
      ? 'green'
      : agent.color === '#60A5FA'
        ? 'blue'
        : agent.color === '#A855F7'
          ? 'purple'
          : agent.color === '#FBBF24'
            ? 'yellow'
            : 'amber';

  return {
    id: agent.id,
    name: agent.name,
    role: role?.name || 'Chief',
    emoji: agent.emoji,
    color: defaultColor,
  };
}

function parseFrontmatter(markdown: string) {
  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) {
    return {
      title: '',
      owner: '',
      role: '',
      summary: '',
      status: '' as MissionStatus | '',
      type: '',
      tags: [] as string[],
      body: markdown.trim(),
    };
  }

  const values = {
    title: '',
    owner: '',
    role: '',
    summary: '',
    status: '' as MissionStatus | '',
    type: '',
    tags: [] as string[],
  };

  for (const line of match[1].split(/\r?\n/)) {
    const [rawKey, ...rest] = line.split(':');
    if (!rawKey || rest.length === 0) {
      continue;
    }

    const key = rawKey.trim().toLowerCase();
    const value = rest.join(':').trim();
    if (!value) {
      continue;
    }

    if (key === 'owner') values.owner = value;
    if (key === 'role') values.role = value;
    if (key === 'summary') values.summary = value;
    if (key === 'type') values.type = value;
    if (key === 'status') values.status = inferStatusFromText(value);
    if (key === 'tags') {
      values.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return {
    ...values,
    body: markdown.replace(/^---\s*[\s\S]*?\s*---/, '').trim(),
  };
}

function deriveDocMetadata(markdown: string, fallbackTitle: string) {
  const parsed = parseFrontmatter(markdown);
  const lines = parsed.body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const title =
    lines.find((line) => line.startsWith('#'))?.replace(/^#+\s*/, '') ||
    parsed.title ||
    fallbackTitle;
  const summary =
    parsed.summary ||
    lines.find((line) => !line.startsWith('#')) ||
    excerpt(parsed.body, 140) ||
    title;

  return {
    title,
    owner: parsed.owner || 'Mission Control',
    ownerRole: parsed.role || 'Workspace',
    summary,
    status: parsed.status || inferStatusFromText(summary),
    docType:
      parsed.type ||
      (title.toLowerCase().includes('overnight') ? 'overnight-log' : 'living-doc'),
    tags: parsed.tags,
    bodyMarkdown: parsed.body,
  };
}

function getSyncState() {
  return (getDb()
    .prepare('SELECT * FROM sync_state WHERE key = ?')
    .get(MISSION_SYNC_KEY) || null) as
    | {
        key: string;
        status: MissionStatus;
        last_synced_at: string | null;
        last_error: string | null;
        metadata_json: string;
      }
    | null;
}

function setSyncState(input: {
  status: MissionStatus;
  lastSyncedAt?: string | null;
  lastError?: string | null;
  metadata?: Record<string, unknown>;
}) {
  getDb()
    .prepare(
      `INSERT INTO sync_state (key, status, last_synced_at, last_error, metadata_json, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(key) DO UPDATE SET
         status = excluded.status,
         last_synced_at = excluded.last_synced_at,
         last_error = excluded.last_error,
         metadata_json = excluded.metadata_json,
         updated_at = excluded.updated_at`
    )
    .run(
      MISSION_SYNC_KEY,
      input.status,
      input.lastSyncedAt || null,
      input.lastError || null,
      stringifyJson(input.metadata || {}),
      isoNow()
    );
}

function mapRole(row: any): AgentRole {
  return {
    slug: row.slug,
    name: row.name,
    lane: row.lane,
    color: row.color,
    description: row.description,
  };
}

function mapAgent(row: any): AgentProfile {
  return {
    id: row.id,
    name: row.name,
    roleSlug: row.role_slug,
    chiefId: row.chief_id,
    modelKey: row.model_key,
    workspaceId: row.workspace_id,
    status: row.status,
    persona: row.persona,
    color: row.color,
    emoji: row.emoji,
    frequency: row.frequency,
    markets: parseJson<string[]>(row.markets_json, []),
    isLLM: Boolean(row.is_llm),
    sortOrder: row.sort_order,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapModel(row: any): ModelFleetCard {
  return {
    id: row.id,
    name: row.name,
    provider: row.provider,
    modelId: row.model_id,
    description: row.description,
    status: row.status,
    tokensUsed: row.tokens_used,
    totalCost: row.total_cost,
    totalSessions: row.total_sessions,
    badge: row.badge || undefined,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapEvent(row: any): SessionEvent {
  return {
    id: row.id,
    sessionId: row.session_id,
    eventType: row.event_type,
    content: row.content,
    severity: row.severity,
    createdAt: row.created_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapSession(row: any, events: SessionEvent[] = []): MissionSession {
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    agentId: row.agent_id,
    modelId: row.model_id,
    workspaceId: row.workspace_id,
    summary: row.summary,
    log: row.log,
    logTime: row.log_time,
    lastHeartbeatAt: row.last_heartbeat_at,
    tokensUsed: row.tokens_used,
    totalCost: row.total_cost,
    modelTags: parseJson<string[]>(row.model_tags_json, []),
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    events,
  };
}

function mapJob(row: any): ScheduledJob {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    scheduleLabel: row.schedule_label,
    durationLabel: row.duration_label,
    jobKind: row.job_kind,
    team: row.team,
    status: row.status,
    lastRunAt: row.last_run_at,
    nextRunAt: row.next_run_at,
    actions: parseJson<string[]>(row.actions_json, []),
    workspaceId: row.workspace_id,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapWorkspaceFile(row: any): WorkspaceFileSummary {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    name: row.name,
    relativePath: row.relative_path,
    absolutePath: row.absolute_path,
    size: row.size,
    updatedAt: row.updated_at,
    type: row.file_type,
  };
}

function mapWorkspace(row: any, files: WorkspaceFileSummary[]): WorkspaceSnapshot {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    rootPath: row.root_path,
    branch: row.branch,
    status: row.status,
    lastSyncAt: row.last_sync_at,
    summary: row.summary,
    activityCount: row.activity_count,
    openItemsCount: row.open_items_count,
    files,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapDoc(row: any): DocEntry {
  return {
    id: row.id,
    title: row.title,
    docType: row.doc_type,
    owner: row.owner,
    ownerRole: row.owner_role,
    status: row.status,
    summary: row.summary,
    bodyMarkdown: row.body_markdown,
    filePath: row.file_path,
    workspaceId: row.workspace_id,
    tags: parseJson<string[]>(row.tags_json, []),
    sourceMeetingId: row.source_meeting_id,
    createdAt: row.created_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapTurn(row: any): MeetingTurn {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    turnIndex: row.turn_index,
    speakerId: row.speaker_id,
    speakerName: row.speaker_name,
    speakerRole: row.speaker_role,
    content: row.content,
    voice: row.voice,
    durationSec: row.duration_sec,
    createdAt: row.created_at,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapArtifact(row: any): MeetingArtifact {
  return {
    id: row.id,
    meetingId: row.meeting_id,
    title: row.title,
    artifactType: row.artifact_type,
    owner: row.owner,
    summary: row.summary,
    bodyMarkdown: row.body_markdown,
    filePath: row.file_path,
    status: row.status,
    sortOrder: row.sort_order,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
  };
}

function mapMeeting(row: any, turns: MeetingTurn[] = [], artifacts: MeetingArtifact[] = []): MeetingRun {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    topic: row.topic,
    status: row.status,
    dateLabel: row.date_label,
    timeLabel: row.time_label,
    participants: parseJson<MeetingParticipant[]>(row.participants_json, []),
    startAt: row.start_at,
    endAt: row.end_at,
    voiceEnabled: Boolean(row.voice_enabled),
    audioUrl: row.audio_url,
    audioDurationSec: row.audio_duration_sec,
    summary: row.summary,
    preview: row.preview,
    transcriptText: row.transcript_text,
    metadata: parseJson<Record<string, unknown>>(row.metadata_json, {}),
    turns,
    artifacts,
  };
}

function getMissionCounts(): MissionCounts {
  const db = getDb();
  const count = (table: string) =>
    ((db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as { count: number }).count || 0);

  return {
    roles: count('agent_roles'),
    agents: count('agent_profiles'),
    models: count('model_fleet'),
    sessions: count('sessions'),
    jobs: count('scheduled_jobs'),
    meetings: count('meeting_runs'),
    docs: count('doc_entries'),
    workspaces: count('workspaces'),
  };
}

function replaceSyncedMissionData(snapshot: MissionSnapshot) {
  const db = getDb();
  const tx = db.transaction(() => {
    db.exec(`
      DELETE FROM workspace_files;
      DELETE FROM workspaces;
      DELETE FROM scheduled_jobs;
      DELETE FROM session_events WHERE session_id NOT LIKE 'run:%';
      DELETE FROM sessions WHERE id NOT LIKE 'run:%';
      DELETE FROM doc_entries WHERE source_meeting_id IS NULL;
      DELETE FROM model_fleet;
      DELETE FROM agent_profiles;
      DELETE FROM agent_roles;
      DELETE FROM system_stats;
    `);

    const insertRole = db.prepare(
      `INSERT INTO agent_roles (slug, name, lane, color, description, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    );
    for (const role of snapshot.roles) {
      insertRole.run(role.slug, role.name, role.lane, role.color, role.description, isoNow());
    }

    const insertAgent = db.prepare(
      `INSERT INTO agent_profiles
       (id, name, role_slug, chief_id, model_key, workspace_id, status, persona, color, emoji, frequency, markets_json, is_llm, sort_order, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const agent of snapshot.agents) {
      insertAgent.run(
        agent.id,
        agent.name,
        agent.roleSlug,
        agent.chiefId,
        agent.modelKey,
        agent.workspaceId,
        agent.status,
        agent.persona,
        agent.color,
        agent.emoji,
        agent.frequency,
        stringifyJson(agent.markets),
        agent.isLLM ? 1 : 0,
        agent.sortOrder,
        stringifyJson(agent.metadata),
        isoNow(),
        isoNow()
      );
    }

    const insertModel = db.prepare(
      `INSERT INTO model_fleet
       (id, name, provider, model_id, description, status, tokens_used, total_cost, total_sessions, badge, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const model of snapshot.models) {
      insertModel.run(
        model.id,
        model.name,
        model.provider,
        model.modelId,
        model.description,
        model.status,
        model.tokensUsed,
        model.totalCost,
        model.totalSessions,
        model.badge || null,
        stringifyJson(model.metadata),
        isoNow(),
        isoNow()
      );
    }

    const insertSession = db.prepare(
      `INSERT INTO sessions
       (id, title, status, agent_id, model_id, workspace_id, summary, log, log_time, last_heartbeat_at, tokens_used, total_cost, model_tags_json, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertSessionEvent = db.prepare(
      `INSERT INTO session_events
       (id, session_id, event_type, content, severity, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (const session of snapshot.sessions) {
      insertSession.run(
        session.id,
        session.title,
        session.status,
        session.agentId,
        session.modelId,
        session.workspaceId,
        session.summary,
        session.log,
        session.logTime,
        session.lastHeartbeatAt,
        session.tokensUsed,
        session.totalCost,
        stringifyJson(session.modelTags),
        stringifyJson(session.metadata),
        isoNow(),
        isoNow()
      );

      for (const event of session.events || []) {
        insertSessionEvent.run(
          event.id,
          session.id,
          event.eventType,
          event.content,
          event.severity,
          event.createdAt,
          stringifyJson(event.metadata)
        );
      }
    }

    const insertJob = db.prepare(
      `INSERT INTO scheduled_jobs
       (id, title, summary, schedule_label, duration_label, job_kind, team, status, last_run_at, next_run_at, actions_json, workspace_id, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const job of snapshot.jobs) {
      insertJob.run(
        job.id,
        job.title,
        job.summary,
        job.scheduleLabel,
        job.durationLabel,
        job.jobKind,
        job.team,
        job.status,
        job.lastRunAt,
        job.nextRunAt,
        stringifyJson(job.actions),
        job.workspaceId,
        stringifyJson(job.metadata),
        isoNow(),
        isoNow()
      );
    }

    const insertWorkspace = db.prepare(
      `INSERT INTO workspaces
       (id, name, icon, color, root_path, branch, status, last_sync_at, summary, activity_count, open_items_count, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertWorkspaceFile = db.prepare(
      `INSERT INTO workspace_files
       (id, workspace_id, name, relative_path, absolute_path, size, updated_at, file_type, content_preview, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const workspace of snapshot.workspaces) {
      insertWorkspace.run(
        workspace.id,
        workspace.name,
        workspace.icon,
        workspace.color,
        workspace.rootPath,
        workspace.branch,
        workspace.status,
        workspace.lastSyncAt,
        workspace.summary,
        workspace.activityCount,
        workspace.openItemsCount,
        stringifyJson(workspace.metadata),
        isoNow(),
        isoNow()
      );

      for (const file of workspace.files) {
        insertWorkspaceFile.run(
          file.id,
          workspace.id,
          file.name,
          file.relativePath,
          file.absolutePath,
          file.size,
          file.updatedAt,
          file.type,
          '',
          isoNow(),
          stringifyJson({})
        );
      }
    }

    const insertDoc = db.prepare(
      `INSERT INTO doc_entries
       (id, title, doc_type, owner, owner_role, status, summary, body_markdown, file_path, workspace_id, tags_json, source_meeting_id, created_at, updated_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const doc of snapshot.docs) {
      insertDoc.run(
        doc.id,
        doc.title,
        doc.docType,
        doc.owner,
        doc.ownerRole,
        doc.status,
        doc.summary,
        doc.bodyMarkdown,
        doc.filePath,
        doc.workspaceId,
        stringifyJson(doc.tags),
        doc.sourceMeetingId,
        doc.createdAt || isoNow(),
        isoNow(),
        stringifyJson(doc.metadata)
      );
    }

    const insertMeeting = db.prepare(
      `INSERT OR IGNORE INTO meeting_runs
       (id, slug, title, topic, status, date_label, time_label, participants_json, start_at, end_at, voice_enabled, audio_url, audio_duration_sec, summary, preview, transcript_text, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertTurn = db.prepare(
      `INSERT OR IGNORE INTO meeting_turns
       (id, meeting_id, turn_index, speaker_id, speaker_name, speaker_role, content, voice, duration_sec, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertArtifact = db.prepare(
      `INSERT OR IGNORE INTO meeting_artifacts
       (id, meeting_id, title, artifact_type, owner, summary, body_markdown, file_path, status, sort_order, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (const meeting of snapshot.meetings) {
      insertMeeting.run(
        meeting.id,
        meeting.slug,
        meeting.title,
        meeting.topic,
        meeting.status,
        meeting.dateLabel,
        meeting.timeLabel,
        stringifyJson(meeting.participants),
        meeting.startAt,
        meeting.endAt,
        meeting.voiceEnabled ? 1 : 0,
        meeting.audioUrl,
        meeting.audioDurationSec,
        meeting.summary,
        meeting.preview,
        meeting.transcriptText,
        stringifyJson(meeting.metadata),
        isoNow(),
        isoNow()
      );

      for (const turn of meeting.turns || []) {
        insertTurn.run(
          turn.id,
          meeting.id,
          turn.turnIndex,
          turn.speakerId,
          turn.speakerName,
          turn.speakerRole,
          turn.content,
          turn.voice,
          turn.durationSec,
          turn.createdAt,
          stringifyJson(turn.metadata)
        );
      }

      for (const artifact of meeting.artifacts || []) {
        insertArtifact.run(
          artifact.id,
          meeting.id,
          artifact.title,
          artifact.artifactType,
          artifact.owner,
          artifact.summary,
          artifact.bodyMarkdown,
          artifact.filePath,
          artifact.status,
          artifact.sortOrder,
          stringifyJson(artifact.metadata),
          isoNow(),
          isoNow()
        );
      }
    }
  });

  tx();
}

function writeSummaryStats() {
  const db = getDb();
  const activeCount =
    (db
      .prepare("SELECT COUNT(*) as count FROM sessions WHERE status IN ('active', 'running', 'queued')")
      .get() as { count: number }).count || 0;
  const idleCount =
    (db
      .prepare("SELECT COUNT(*) as count FROM model_fleet WHERE status IN ('idle', 'standby')")
      .get() as { count: number }).count || 0;
  const totalSessions =
    (db.prepare('SELECT COUNT(*) as count FROM sessions').get() as { count: number }).count || 0;
  const tokensUsed =
    (db.prepare('SELECT COALESCE(SUM(tokens_used), 0) as total FROM sessions').get() as {
      total: number;
    }).total || 0;
  const totalCost =
    (db.prepare('SELECT COALESCE(SUM(total_cost), 0) as total FROM sessions').get() as {
      total: number;
    }).total || 0;

  db.prepare('DELETE FROM system_stats').run();

  const stats = [
    { id: 'kpi-active', key: 'active', label: 'Active', value: activeCount, tone: 'green' },
    { id: 'kpi-idle', key: 'idle', label: 'Idle', value: idleCount, tone: 'yellow' },
    { id: 'kpi-sessions', key: 'sessions', label: 'Total Sessions', value: totalSessions, tone: 'white' },
    { id: 'kpi-tokens', key: 'tokens', label: 'Tokens Used', value: tokensUsed, tone: 'blue' },
    { id: 'kpi-cost', key: 'cost', label: 'Total Cost', value: totalCost, tone: 'red' },
  ];

  const insertStat = db.prepare(
    `INSERT INTO system_stats (id, metric_key, metric_label, metric_value, tone, created_at)
     VALUES (?, ?, ?, ?, ?, ?)`
  );

  for (const stat of stats) {
    insertStat.run(stat.id, stat.key, stat.label, stat.value, stat.tone, isoNow());
  }
}

export async function syncMissionControl(force = false): Promise<MissionSyncResult> {
  const state = getSyncState();
  const lastSyncAt = state?.last_synced_at ? new Date(state.last_synced_at).getTime() : 0;
  const hasSeedData = getMissionCounts().agents > 0;

  if (!force && hasSeedData && lastSyncAt && Date.now() - lastSyncAt < DEFAULT_REFRESH_INTERVAL_MS) {
    const metadata = parseJson<Record<string, unknown>>(state?.metadata_json, {});
    return {
      syncedAt: state?.last_synced_at || isoNow(),
      usedFixture: Boolean(metadata.usedFixture),
      counts: (metadata.counts as MissionCounts | undefined) || getMissionCounts(),
      source: String(metadata.source || 'sqlite-cache'),
    };
  }

  setSyncState({ status: 'running', lastError: null });

  try {
    const snapshot = await loadOpenClawMissionSnapshot();
    replaceSyncedMissionData(snapshot);
    writeSummaryStats();

    const syncedAt = isoNow();
    const counts = getMissionCounts();
    setSyncState({
      status: 'completed',
      lastSyncedAt: syncedAt,
      lastError: null,
      metadata: {
        counts,
        source: snapshot.meta.source,
        usedFixture: snapshot.meta.usedFixture,
      },
    });

    return {
      syncedAt,
      usedFixture: snapshot.meta.usedFixture,
      counts,
      source: snapshot.meta.source,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown sync error';
    setSyncState({
      status: 'error',
      lastSyncedAt: state?.last_synced_at || null,
      lastError: message,
      metadata: parseJson<Record<string, unknown>>(state?.metadata_json, {}),
    });
    throw error;
  }
}

async function ensureMissionControlData() {
  const counts = getMissionCounts();
  const state = getSyncState();
  if (counts.agents === 0 || !state?.last_synced_at) {
    await syncMissionControl(true);
    return;
  }

  const lastSyncAt = new Date(state.last_synced_at).getTime();
  if (Date.now() - lastSyncAt > DEFAULT_REFRESH_INTERVAL_MS) {
    await syncMissionControl(true);
  }
}

function listSessionEvents(sessionId: string) {
  return (getDb()
    .prepare('SELECT * FROM session_events WHERE session_id = ? ORDER BY created_at ASC')
    .all(sessionId) as any[]).map(mapEvent);
}

export async function listMissionSessions(limit?: number) {
  await ensureMissionControlData();
  const sql = limit
    ? 'SELECT * FROM sessions ORDER BY datetime(updated_at) DESC LIMIT ?'
    : 'SELECT * FROM sessions ORDER BY datetime(updated_at) DESC';
  const rows = (limit
    ? getDb().prepare(sql).all(limit)
    : getDb().prepare(sql).all()) as any[];

  return rows.map((row) => mapSession(row, listSessionEvents(row.id)));
}

export async function listScheduledJobs() {
  await ensureMissionControlData();
  const rows = getDb()
    .prepare(
      "SELECT * FROM scheduled_jobs ORDER BY CASE status WHEN 'running' THEN 0 WHEN 'active' THEN 1 WHEN 'building' THEN 2 ELSE 3 END, datetime(next_run_at) ASC"
    )
    .all() as any[];
  return rows.map(mapJob);
}

export async function listDocEntries() {
  await ensureMissionControlData();
  const rows = getDb()
    .prepare('SELECT * FROM doc_entries ORDER BY datetime(COALESCE(created_at, updated_at)) DESC')
    .all() as any[];
  return rows.map(mapDoc);
}

export async function listOrgChart(): Promise<OrgChartPayload> {
  await ensureMissionControlData();
  const roles = (getDb()
    .prepare('SELECT * FROM agent_roles ORDER BY lane ASC, name ASC')
    .all() as any[]).map(mapRole);
  const agents = (getDb()
    .prepare('SELECT * FROM agent_profiles ORDER BY sort_order ASC, name ASC')
    .all() as any[]).map(mapAgent);
  return { roles, agents };
}

export async function listWorkspaces() {
  await ensureMissionControlData();
  const rows = getDb()
    .prepare('SELECT * FROM workspaces ORDER BY name ASC')
    .all() as any[];

  return rows.map((row) => {
    const files = (getDb()
      .prepare('SELECT * FROM workspace_files WHERE workspace_id = ? ORDER BY name ASC')
      .all(row.id) as any[]).map(mapWorkspaceFile);
    return mapWorkspace(row, files);
  });
}

function listMeetingTurns(meetingId: string) {
  return (getDb()
    .prepare('SELECT * FROM meeting_turns WHERE meeting_id = ? ORDER BY turn_index ASC')
    .all(meetingId) as any[]).map(mapTurn);
}

function listMeetingArtifacts(meetingId: string) {
  return (getDb()
    .prepare('SELECT * FROM meeting_artifacts WHERE meeting_id = ? ORDER BY sort_order ASC, created_at ASC')
    .all(meetingId) as any[]).map(mapArtifact);
}

export async function listMeetingRuns() {
  await ensureMissionControlData();
  const rows = getDb()
    .prepare(
      'SELECT * FROM meeting_runs ORDER BY datetime(COALESCE(start_at, created_at, updated_at)) DESC'
    )
    .all() as any[];

  return rows.map((row) => mapMeeting(row, listMeetingTurns(row.id), listMeetingArtifacts(row.id)));
}

export async function getMeetingRunDetails(meetingId: string) {
  await ensureMissionControlData();
  const row = getDb().prepare('SELECT * FROM meeting_runs WHERE id = ?').get(meetingId) as any;
  if (!row) {
    return null;
  }

  return mapMeeting(row, listMeetingTurns(meetingId), listMeetingArtifacts(meetingId));
}

function getWorkspaceById(workspaceId: string) {
  const row = getDb().prepare('SELECT * FROM workspaces WHERE id = ?').get(workspaceId) as any;
  if (!row) {
    return null;
  }

  const files = (getDb()
    .prepare('SELECT * FROM workspace_files WHERE workspace_id = ? ORDER BY name ASC')
    .all(workspaceId) as any[]).map(mapWorkspaceFile);
  return mapWorkspace(row, files);
}

async function resolveWritableWorkspaceBase(workspaceId: string | null | undefined) {
  const workspace = workspaceId ? getWorkspaceById(workspaceId) : null;
  if (workspace?.rootPath && (await pathExists(workspace.rootPath))) {
    return workspace.rootPath;
  }

  const fallback = path.join(missionDocsRoot(), 'workspaces', workspaceId || 'command-center');
  await ensureDir(fallback);
  return fallback;
}

async function upsertDocEntryFromFile(input: {
  workspaceId: string;
  absolutePath: string;
  relativePath: string;
  content: string;
}) {
  const workspace = getWorkspaceById(input.workspaceId);
  if (!workspace || !input.relativePath.toLowerCase().endsWith('.md')) {
    return;
  }

  const derived = deriveDocMetadata(input.content, path.basename(input.relativePath));
  const existing = getDb()
    .prepare('SELECT id FROM doc_entries WHERE file_path = ? LIMIT 1')
    .get(input.absolutePath) as { id: string } | undefined;
  const docId = existing?.id || `doc:${input.workspaceId}:${slugify(input.relativePath)}`;

  getDb()
    .prepare(
      `INSERT INTO doc_entries
       (id, title, doc_type, owner, owner_role, status, summary, body_markdown, file_path, workspace_id, tags_json, source_meeting_id, created_at, updated_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         doc_type = excluded.doc_type,
         owner = excluded.owner,
         owner_role = excluded.owner_role,
         status = excluded.status,
         summary = excluded.summary,
         body_markdown = excluded.body_markdown,
         file_path = excluded.file_path,
         workspace_id = excluded.workspace_id,
         tags_json = excluded.tags_json,
         updated_at = excluded.updated_at,
         metadata_json = excluded.metadata_json`
    )
    .run(
      docId,
      derived.title,
      derived.docType,
      derived.owner,
      derived.ownerRole,
      derived.status,
      derived.summary,
      derived.bodyMarkdown,
      input.absolutePath,
      input.workspaceId,
      stringifyJson(derived.tags),
      null,
      isoNow(),
      isoNow(),
      stringifyJson({
        source: 'workspace-editor',
        relativePath: input.relativePath,
      })
    );
}

export async function getWorkspaceFileDetail(workspaceId: string, fileId: string) {
  await ensureMissionControlData();

  const fixture = getFixtureWorkspaceFileContent(fileId);
  if (fixture && fixture.workspaceId === workspaceId) {
    return fixture;
  }

  const row = getDb()
    .prepare('SELECT * FROM workspace_files WHERE id = ? AND workspace_id = ?')
    .get(fileId, workspaceId) as any;
  if (!row) {
    return null;
  }

  let content = '';
  try {
    content = await fs.readFile(row.absolute_path, 'utf-8');
  } catch {
    content = row.content_preview || '';
  }

  const detail: WorkspaceFileDetail = {
    ...mapWorkspaceFile(row),
    content,
    readOnly: false,
  };
  return detail;
}

export async function saveWorkspaceFileDetail(
  workspaceId: string,
  fileId: string,
  content: string
) {
  await ensureMissionControlData();

  const fixture = getFixtureWorkspaceFileContent(fileId);
  const existing = getDb()
    .prepare('SELECT * FROM workspace_files WHERE id = ? AND workspace_id = ?')
    .get(fileId, workspaceId) as any;

  if (!existing && !fixture) {
    return null;
  }

  const relativePath = existing?.relative_path || fixture?.relativePath || `${slugify(fileId)}.md`;
  const fileName = existing?.name || fixture?.name || path.basename(relativePath);
  const basePath = await resolveWritableWorkspaceBase(workspaceId);
  const targetPath =
    existing && existing.absolute_path && (await pathExists(existing.absolute_path))
      ? existing.absolute_path
      : path.join(basePath, relativePath);

  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, 'utf-8');

  getDb()
    .prepare(
      `INSERT INTO workspace_files
       (id, workspace_id, name, relative_path, absolute_path, size, updated_at, file_type, content_preview, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         name = excluded.name,
         relative_path = excluded.relative_path,
         absolute_path = excluded.absolute_path,
         size = excluded.size,
         updated_at = excluded.updated_at,
         file_type = excluded.file_type,
         content_preview = excluded.content_preview,
         metadata_json = excluded.metadata_json`
    )
    .run(
      fileId,
      workspaceId,
      fileName,
      relativePath,
      targetPath,
      Buffer.byteLength(content, 'utf-8'),
      isoNow(),
      relativePath.toLowerCase().endsWith('.md')
        ? 'markdown'
        : relativePath.toLowerCase().endsWith('.json')
          ? 'json'
          : 'text',
      excerpt(content, 400),
      isoNow(),
      stringifyJson({
        source: fixture ? 'fixture-promoted' : 'workspace-editor',
      })
    );

  await upsertDocEntryFromFile({
    workspaceId,
    absolutePath: targetPath,
    relativePath,
    content,
  });

  return getWorkspaceFileDetail(workspaceId, fileId);
}

function getKpis() {
  const rows = getDb()
    .prepare('SELECT * FROM system_stats ORDER BY rowid ASC')
    .all() as any[];

  return rows.map<MissionKpi>((row) => ({
    id: row.metric_key,
    label: row.metric_label,
    value: row.metric_value,
    displayValue:
      row.metric_key === 'cost'
        ? compactCurrency(row.metric_value)
        : row.metric_key === 'tokens'
          ? compactNumber(row.metric_value)
          : `${row.metric_value}`,
    tone: row.tone,
  }));
}

export async function getMissionSummary(): Promise<MissionSummary> {
  await ensureMissionControlData();

  const state = getSyncState();
  const metadata = parseJson<Record<string, unknown>>(state?.metadata_json, {});
  const sessions = await listMissionSessions(6);
  const jobs = await listScheduledJobs();
  const docs = await listDocEntries();
  const models = (getDb()
    .prepare('SELECT * FROM model_fleet ORDER BY total_cost DESC, tokens_used DESC')
    .all() as any[]).map(mapModel);

  return {
    generatedAt: isoNow(),
    lastSyncedAt: state?.last_synced_at || null,
    usedFixture: Boolean(metadata.usedFixture),
    kpis: getKpis(),
    modelFleet: models,
    activeSessions: sessions,
    scheduledJobs: jobs,
    overnightLog: docs.slice(0, 8),
  };
}

function buildFrontmatter(input: {
  owner: string;
  role: string;
  status: MissionStatus;
  type: string;
  summary: string;
  tags: string[];
}) {
  return [
    '---',
    `owner: ${input.owner}`,
    `role: ${input.role}`,
    `status: ${input.status}`,
    `type: ${input.type}`,
    `summary: ${input.summary}`,
    `tags: [${input.tags.join(', ')}]`,
    '---',
    '',
  ].join('\n');
}

async function persistMarkdownArtifact(artifact: MeetingArtifact, meeting: MeetingRun, workspaceId: string | null) {
  const basePath = await resolveWritableWorkspaceBase(workspaceId);
  const docsPath = path.join(basePath, 'docs');
  await ensureDir(docsPath);

  const targetPath =
    artifact.filePath ||
    path.join(docsPath, `${meeting.slug}-${slugify(artifact.title)}.md`);
  const content = `${buildFrontmatter({
    owner: artifact.owner,
    role: 'Mission Runner',
    status: artifact.status,
    type: artifact.artifactType === 'playbook' ? 'living-doc' : 'overnight-log',
    summary: artifact.summary,
    tags: ['generated', 'standup'],
  })}${artifact.bodyMarkdown}\n`;

  await ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, 'utf-8');
  return targetPath;
}

function createRunSession(input: {
  title: string;
  summary: string;
  workspaceId?: string | null;
  modelId?: string | null;
}) {
  const id = `run:${slugify(input.title)}:${Date.now().toString(36)}`;
  getDb()
    .prepare(
      `INSERT INTO sessions
       (id, title, status, agent_id, model_id, workspace_id, summary, log, log_time, last_heartbeat_at, tokens_used, total_cost, model_tags_json, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      input.title,
      'queued',
      null,
      input.modelId || null,
      input.workspaceId || null,
      input.summary,
      'Queued',
      formatTimeLabel(isoNow()),
      isoNow(),
      0,
      0,
      stringifyJson([]),
      stringifyJson({ source: 'mission-runner' }),
      isoNow(),
      isoNow()
    );

  writeSummaryStats();
  return id;
}

function appendRunEvent(
  sessionId: string,
  input: {
    eventType: string;
    content: string;
    severity?: SessionEvent['severity'];
    summary?: string;
    log?: string;
    tokensUsed?: number;
    totalCost?: number;
    status?: MissionStatus;
    metadata?: Record<string, unknown>;
  }
) {
  getDb()
    .prepare(
      `INSERT INTO session_events
       (id, session_id, event_type, content, severity, created_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      randomUUID(),
      sessionId,
      input.eventType,
      input.content,
      input.severity || 'info',
      isoNow(),
      stringifyJson(input.metadata || {})
    );

  getDb()
    .prepare(
      `UPDATE sessions
       SET status = COALESCE(?, status),
           summary = COALESCE(?, summary),
           log = COALESCE(?, log),
           log_time = ?,
           last_heartbeat_at = ?,
           tokens_used = COALESCE(?, tokens_used),
           total_cost = COALESCE(?, total_cost),
           updated_at = ?
       WHERE id = ?`
    )
    .run(
      input.status || null,
      input.summary || null,
      input.log || input.content,
      formatTimeLabel(isoNow()),
      isoNow(),
      input.tokensUsed ?? null,
      input.totalCost ?? null,
      isoNow(),
      sessionId
    );
}

function updateMeetingRun(
  meetingId: string,
  input: {
    status?: MissionStatus;
    participants?: MeetingParticipant[];
    topic?: string;
    summary?: string;
    preview?: string;
    transcriptText?: string;
    audioUrl?: string | null;
    audioDurationSec?: number;
    startAt?: string | null;
    endAt?: string | null;
    metadata?: Record<string, unknown>;
  }
) {
  const existing = getDb()
    .prepare('SELECT metadata_json FROM meeting_runs WHERE id = ?')
    .get(meetingId) as { metadata_json: string } | undefined;
  const mergedMetadata = {
    ...parseJson<Record<string, unknown>>(existing?.metadata_json, {}),
    ...(input.metadata || {}),
  };

  getDb()
    .prepare(
      `UPDATE meeting_runs
       SET status = COALESCE(?, status),
           topic = COALESCE(?, topic),
           participants_json = COALESCE(?, participants_json),
           summary = COALESCE(?, summary),
           preview = COALESCE(?, preview),
           transcript_text = COALESCE(?, transcript_text),
           audio_url = COALESCE(?, audio_url),
           audio_duration_sec = COALESCE(?, audio_duration_sec),
           start_at = COALESCE(?, start_at),
           end_at = COALESCE(?, end_at),
           updated_at = ?,
           metadata_json = ?
       WHERE id = ?`
    )
    .run(
      input.status || null,
      input.topic || null,
      input.participants ? stringifyJson(input.participants) : null,
      input.summary || null,
      input.preview || null,
      input.transcriptText || null,
      input.audioUrl === undefined ? null : input.audioUrl,
      input.audioDurationSec ?? null,
      input.startAt === undefined ? null : input.startAt,
      input.endAt === undefined ? null : input.endAt,
      isoNow(),
      stringifyJson(mergedMetadata),
      meetingId
    );
}

async function maybeGenerateEdgeTtsAudio(meetingId: string, transcript: string) {
  if (!transcript.trim()) {
    return null;
  }

  const audioRoot = missionAudioRoot();
  await ensureDir(audioRoot);
  const outputPath = path.join(audioRoot, `${meetingId}.mp3`);
  const voiceMap = parseJson<Record<string, string>>(process.env.EDGE_TTS_VOICE_MAP || '{}', {});
  const voice = voiceMap.default || 'en-US-AndrewNeural';

  const directRun = spawnSync('edge-tts', [
    '--voice',
    voice,
    '--text',
    transcript,
    '--write-media',
    outputPath,
  ]);

  if (directRun.status === 0) {
    return outputPath;
  }

  const pythonRun = spawnSync('python', [
    '-m',
    'edge_tts',
    '--voice',
    voice,
    '--text',
    transcript,
    '--write-media',
    outputPath,
  ]);

  if (pythonRun.status === 0) {
    return outputPath;
  }

  return null;
}

function buildArtifactSet(meeting: MeetingRun, participants: MeetingParticipant[]) {
  const owners = participants.map((participant) => participant.name).join(', ');
  return [
    {
      id: randomUUID(),
      meetingId: meeting.id,
      title: `${meeting.topic} — Checklist`,
      artifactType: 'deliverable',
      owner: participants[0]?.name || 'Mission Control',
      summary: 'Action items extracted from the standup.',
      bodyMarkdown: [
        '# Action Items',
        '',
        ...participants.map(
          (participant, index) =>
            `${index + 1}. ${participant.name} owns the next move for ${meeting.topic.toLowerCase()}.`
        ),
        '',
        'Ship the outcome into docs before the next overnight review.',
      ].join('\n'),
      filePath: null,
      status: 'completed' as MissionStatus,
      sortOrder: 1,
      metadata: {
        generated: true,
        owners,
      },
    },
    {
      id: randomUUID(),
      meetingId: meeting.id,
      title: `${meeting.topic} — Playbook`,
      artifactType: 'playbook',
      owner: participants[0]?.name || 'Mission Control',
      summary: 'Reusable operating note distilled from the conversation.',
      bodyMarkdown: [
        `# ${meeting.title}`,
        '',
        `Topic: ${meeting.topic}`,
        '',
        '## Decisions',
        '- Keep the human focused on leverage, not repetitive triage.',
        '- Route the work into the right workspace immediately.',
        '- Package the result into durable markdown so future agents inherit context.',
      ].join('\n'),
      filePath: null,
      status: 'completed' as MissionStatus,
      sortOrder: 2,
      metadata: {
        generated: true,
        owners,
      },
    },
  ];
}

async function executeMeetingRun(
  meetingId: string,
  runSessionId: string,
  input: {
    topic: string;
    participants: string[];
    workspaceId: string | null;
    voiceEnabled: boolean;
  }
) {
  const org = await listOrgChart();
  const meeting = await getMeetingRunDetails(meetingId);
  if (!meeting) {
    appendRunEvent(runSessionId, {
      eventType: 'error',
      content: 'Meeting record not found.',
      severity: 'error',
      status: 'error',
      summary: 'Meeting run failed.',
    });
    return;
  }

  const participants = input.participants.map((participant) =>
    buildParticipant(participant, org.agents, org.roles)
  );
  const docs = await listDocEntries();
  const relatedDoc =
    docs.find((doc) => doc.title.toLowerCase().includes(input.topic.toLowerCase().split(' ')[0] || '')) ||
    docs[0] ||
    null;

  getDb().prepare('DELETE FROM meeting_turns WHERE meeting_id = ?').run(meetingId);
  getDb().prepare('DELETE FROM meeting_artifacts WHERE meeting_id = ?').run(meetingId);
  getDb().prepare('DELETE FROM doc_entries WHERE source_meeting_id = ?').run(meetingId);

  updateMeetingRun(meetingId, {
    status: 'running',
    topic: input.topic,
    participants,
    summary: 'Standup in progress.',
    preview: 'Mission runner is coordinating the chiefs.',
    startAt: isoNow(),
    endAt: null,
    transcriptText: '',
    audioUrl: null,
    audioDurationSec: 0,
    metadata: {
      currentTurn: 0,
      totalTurns: participants.length,
      workspaceId: input.workspaceId,
    },
  });

  appendRunEvent(runSessionId, {
    eventType: 'start',
    content: `Standup started for ${meeting.title}.`,
    severity: 'success',
    log: 'Meeting started',
    status: 'running',
    summary: 'Standup is running.',
  });

  const insertTurn = getDb().prepare(
    `INSERT INTO meeting_turns
     (id, meeting_id, turn_index, speaker_id, speaker_name, speaker_role, content, voice, duration_sec, created_at, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const generatedTurns: MeetingTurn[] = [];

  for (let index = 0; index < participants.length; index += 1) {
    const participant = participants[index];
    const agent = org.agents.find((candidate) => candidate.id === participant.id);
    const durationSec = 18 + index * 4;
    const content = [
      `${participant.name} reviews the topic "${input.topic}".`,
      agent?.persona || 'Focuses on the next highest-leverage move.',
      relatedDoc
        ? `Relevant context: ${relatedDoc.title} is already on file.`
        : 'No matching doc was found, so this turn is treated as fresh synthesis.',
      input.workspaceId
        ? `Execution scope is pinned to ${input.workspaceId}.`
        : 'Execution can span the command-center workspace.',
    ].join(' ');

    const turn: MeetingTurn = {
      id: randomUUID(),
      meetingId,
      turnIndex: index + 1,
      speakerId: participant.id,
      speakerName: participant.name,
      speakerRole: participant.role,
      content,
      voice: null,
      durationSec,
      createdAt: isoNow(),
      metadata: {
        color: participant.color,
        generated: true,
      },
    };

    insertTurn.run(
      turn.id,
      turn.meetingId,
      turn.turnIndex,
      turn.speakerId,
      turn.speakerName,
      turn.speakerRole,
      turn.content,
      turn.voice,
      turn.durationSec,
      turn.createdAt,
      stringifyJson(turn.metadata)
    );
    generatedTurns.push(turn);

    appendRunEvent(runSessionId, {
      eventType: 'turn',
      content: `${participant.name} delivered turn ${turn.turnIndex}.`,
      log: `${participant.name} delivered turn ${turn.turnIndex}`,
      status: 'running',
      metadata: {
        currentTurn: turn.turnIndex,
      },
    });

    updateMeetingRun(meetingId, {
      preview: excerpt(turn.content, 150),
      metadata: {
        currentTurn: turn.turnIndex,
        totalTurns: participants.length,
        workspaceId: input.workspaceId,
      },
    });

    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  const transcript = generatedTurns
    .map((turn) => `${turn.speakerName}: ${turn.content}`)
    .join('\n\n');
  const artifacts = buildArtifactSet(meeting, participants);
  const insertArtifact = getDb().prepare(
    `INSERT INTO meeting_artifacts
     (id, meeting_id, title, artifact_type, owner, summary, body_markdown, file_path, status, sort_order, metadata_json, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertDoc = getDb().prepare(
    `INSERT INTO doc_entries
     (id, title, doc_type, owner, owner_role, status, summary, body_markdown, file_path, workspace_id, tags_json, source_meeting_id, created_at, updated_at, metadata_json)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );

  for (const artifact of artifacts) {
    const filePath = await persistMarkdownArtifact(artifact, meeting, input.workspaceId);
    insertArtifact.run(
      artifact.id,
      meetingId,
      artifact.title,
      artifact.artifactType,
      artifact.owner,
      artifact.summary,
      artifact.bodyMarkdown,
      filePath,
      artifact.status,
      artifact.sortOrder,
      stringifyJson(artifact.metadata),
      isoNow(),
      isoNow()
    );

    insertDoc.run(
      `doc:${artifact.id}`,
      artifact.title,
      artifact.artifactType === 'playbook' ? 'living-doc' : 'overnight-log',
      artifact.owner,
      'Mission Runner',
      artifact.status,
      artifact.summary,
      artifact.bodyMarkdown,
      filePath,
      input.workspaceId,
      stringifyJson(['generated', 'standup']),
      meetingId,
      isoNow(),
      isoNow(),
      stringifyJson({
        meetingId,
        generated: true,
      })
    );
  }

  let audioUrl: string | null = null;
  let audioDurationSec = generatedTurns.reduce((total, turn) => total + turn.durationSec, 0);
  if (input.voiceEnabled) {
    const audioPath = await maybeGenerateEdgeTtsAudio(meetingId, transcript);
    if (audioPath) {
      audioUrl = `/api/mission/meetings/${meetingId}/playback?audio=1`;
    }
  }

  updateMeetingRun(meetingId, {
    status: 'completed',
    summary: `Standup completed with ${generatedTurns.length} turns and ${artifacts.length} artifacts.`,
    preview: excerpt(transcript, 150),
    transcriptText: transcript,
    audioUrl,
    audioDurationSec,
    endAt: isoNow(),
    metadata: {
      currentTurn: generatedTurns.length,
      totalTurns: generatedTurns.length,
      workspaceId: input.workspaceId,
    },
  });

  appendRunEvent(runSessionId, {
    eventType: 'complete',
    content: 'Standup finished and deliverables were written to disk.',
    severity: 'success',
    log: 'Standup completed',
    status: 'completed',
    summary: 'Standup completed successfully.',
    tokensUsed: 12000 + generatedTurns.length * 1900,
    totalCost: 0.42,
  });

  writeSummaryStats();
}

async function persistJobDoc(job: ScheduledJob) {
  const basePath = await resolveWritableWorkspaceBase(job.workspaceId);
  const docsPath = path.join(basePath, 'docs');
  await ensureDir(docsPath);
  const filePath = path.join(docsPath, `${slugify(job.title)}-${Date.now().toString(36)}.md`);
  const body = [
    `# ${job.title} Run`,
    '',
    `Summary: ${job.summary}`,
    '',
    '## Actions',
    ...job.actions.map((action) => `- ${action}`),
  ].join('\n');
  await fs.writeFile(
    filePath,
    `${buildFrontmatter({
      owner: job.team,
      role: 'Mission Runner',
      status: 'completed',
      type: 'overnight-log',
      summary: job.summary,
      tags: ['job-run', 'manual-trigger'],
    })}${body}\n`,
    'utf-8'
  );

  getDb()
    .prepare(
      `INSERT INTO doc_entries
       (id, title, doc_type, owner, owner_role, status, summary, body_markdown, file_path, workspace_id, tags_json, source_meeting_id, created_at, updated_at, metadata_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      `doc:job:${job.id}:${Date.now().toString(36)}`,
      `${job.title} — Run Note`,
      'overnight-log',
      job.team,
      'Mission Runner',
      'completed',
      job.summary,
      body,
      filePath,
      job.workspaceId,
      stringifyJson(['job-run', 'manual-trigger']),
      null,
      isoNow(),
      isoNow(),
      stringifyJson({
        jobId: job.id,
      })
    );
}

async function executeJobRun(jobId: string, runSessionId: string) {
  const job = (await listScheduledJobs()).find((candidate) => candidate.id === jobId);
  if (!job) {
    appendRunEvent(runSessionId, {
      eventType: 'error',
      content: 'Scheduled job not found.',
      severity: 'error',
      status: 'error',
      summary: 'Job run failed.',
    });
    return;
  }

  getDb()
    .prepare('UPDATE scheduled_jobs SET status = ?, last_run_at = ?, updated_at = ? WHERE id = ?')
    .run('running', isoNow(), isoNow(), job.id);

  appendRunEvent(runSessionId, {
    eventType: 'start',
    content: `${job.title} started.`,
    severity: 'success',
    log: `${job.title} started`,
    status: 'running',
    summary: 'Manual job trigger is running.',
  });

  await new Promise((resolve) => setTimeout(resolve, 120));

  appendRunEvent(runSessionId, {
    eventType: 'heartbeat',
    content: 'Mission runner executed the scheduled workflow and refreshed local state.',
    log: 'Workflow heartbeat OK',
    status: 'running',
  });

  await persistJobDoc(job);

  getDb()
    .prepare('UPDATE scheduled_jobs SET status = ?, last_run_at = ?, updated_at = ? WHERE id = ?')
    .run('active', isoNow(), isoNow(), job.id);

  appendRunEvent(runSessionId, {
    eventType: 'complete',
    content: `${job.title} finished successfully.`,
    severity: 'success',
    log: `${job.title} completed`,
    status: 'completed',
    summary: `${job.title} finished successfully.`,
    tokensUsed: 3400,
    totalCost: 0.03,
  });

  writeSummaryStats();
}

function queueMissionRun(runId: string, kind: 'meeting' | 'job', promise: Promise<void>) {
  const queue = getRunQueue();
  queue.set(runId, { kind, promise });
  promise.finally(() => {
    queue.delete(runId);
  });
}

export async function createMeetingRun(input: MeetingCreateInput) {
  await ensureMissionControlData();
  const org = await listOrgChart();
  const createdAt = isoNow();
  const title = input.title?.trim() || `Executive Standup: ${input.topic}`;
  const participants = input.participants.map((participant) =>
    buildParticipant(participant, org.agents, org.roles)
  );
  const id = `meeting-${slugify(title)}-${Date.now().toString(36)}`;

  getDb()
    .prepare(
      `INSERT INTO meeting_runs
       (id, slug, title, topic, status, date_label, time_label, participants_json, start_at, end_at, voice_enabled, audio_url, audio_duration_sec, summary, preview, transcript_text, metadata_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      slugify(title),
      title,
      input.topic,
      'queued',
      formatDateLabel(createdAt),
      formatTimeLabel(createdAt),
      stringifyJson(participants),
      null,
      null,
      input.voiceEnabled ? 1 : 0,
      null,
      0,
      'Queued for mission-runner execution.',
      excerpt(input.topic, 120),
      '',
      stringifyJson({
        workspaceId: input.workspaceId || null,
        createdFromUi: true,
      }),
      createdAt,
      createdAt
    );

  return getMeetingRunDetails(id);
}

export async function startMeetingRun(
  meetingId: string,
  input: MeetingRunInput
): Promise<MissionJobRunResult> {
  await ensureMissionControlData();
  const meeting = await getMeetingRunDetails(meetingId);
  if (!meeting) {
    throw new Error('Meeting not found.');
  }

  const org = await listOrgChart();
  const participantNames =
    input.participants && input.participants.length > 0
      ? input.participants
      : meeting.participants.map((participant) => participant.name);
  const participants = participantNames.map((participant) =>
    buildParticipant(participant, org.agents, org.roles)
  );
  const existingWorkspaceId =
    typeof meeting.metadata.workspaceId === 'string' ? meeting.metadata.workspaceId : null;

  updateMeetingRun(meetingId, {
    topic: input.topic || meeting.topic,
    participants,
    summary: 'Queued for execution.',
    metadata: {
      workspaceId: input.workspaceId || existingWorkspaceId || null,
      requestedVoice: Boolean(input.voiceEnabled ?? meeting.voiceEnabled),
    },
  });

  const runSessionId = createRunSession({
    title: `Standup Run: ${meeting.title}`,
    summary: 'Queued standup execution.',
    workspaceId: input.workspaceId || existingWorkspaceId || null,
    modelId: 'claude-opus-4-6',
  });

  queueMissionRun(
    runSessionId,
    'meeting',
    executeMeetingRun(meetingId, runSessionId, {
      topic: input.topic || meeting.topic,
      participants: participantNames,
      workspaceId: input.workspaceId || existingWorkspaceId || null,
      voiceEnabled: Boolean(input.voiceEnabled ?? meeting.voiceEnabled),
    })
  );

  return {
    meetingRunId: meetingId,
    jobRunId: runSessionId,
    status: 'queued',
  };
}

export async function triggerScheduledJob(jobId: string): Promise<MissionJobRunResult> {
  await ensureMissionControlData();
  const job = (await listScheduledJobs()).find((candidate) => candidate.id === jobId);
  if (!job) {
    throw new Error('Job not found.');
  }

  const runSessionId = createRunSession({
    title: `Job Run: ${job.title}`,
    summary: 'Queued manual job trigger.',
    workspaceId: job.workspaceId,
    modelId: 'gemini-3-flash',
  });

  queueMissionRun(runSessionId, 'job', executeJobRun(job.id, runSessionId));

  return {
    jobRunId: runSessionId,
    status: 'queued',
  };
}

export async function getMeetingPlaybackState(meetingId: string): Promise<MeetingPlaybackState | null> {
  const meeting = await getMeetingRunDetails(meetingId);
  if (!meeting) {
    return null;
  }

  return {
    meetingId: meeting.id,
    status: meeting.status,
    title: meeting.title,
    audioDurationSec: meeting.audioDurationSec,
    hasAudio: Boolean(meeting.audioUrl),
    currentTurn: Number(meeting.metadata.currentTurn || meeting.turns?.length || 0),
    totalTurns: Number(meeting.metadata.totalTurns || meeting.turns?.length || 0),
    transcriptLength: meeting.turns?.length || 0,
  };
}

export async function getMeetingAudioFile(meetingId: string) {
  const filePath = path.join(missionAudioRoot(), `${meetingId}.mp3`);
  if (!(await pathExists(filePath))) {
    return null;
  }

  return {
    contentType: 'audio/mpeg',
    bytes: await fs.readFile(filePath),
  };
}
