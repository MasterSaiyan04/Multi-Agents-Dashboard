import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import { getFixtureMissionSnapshot } from './fixture.js';
import type {
  AgentProfile,
  AgentRole,
  DocEntry,
  MissionSession,
  MissionSnapshot,
  MissionStatus,
  ModelFleetCard,
  ScheduledJob,
  WorkspaceFileSummary,
  WorkspaceSnapshot,
} from '../../shared/mission.js';

interface OpenClawRoots {
  workspacePath: string | null;
  openclawHome: string | null;
  docsRoot: string | null;
}

interface ParsedFrontmatter {
  owner?: string;
  role?: string;
  status?: string;
  type?: string;
  summary?: string;
  tags?: string[];
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function isoNow() {
  return new Date().toISOString();
}

function fileExists(targetPath: string | null | undefined) {
  if (!targetPath) {
    return false;
  }
  return fs.existsSync(targetPath);
}

async function readJsonFile<T>(filePath: string | null | undefined): Promise<T | null> {
  if (!fileExists(filePath)) {
    return null;
  }

  try {
    const raw = await fsp.readFile(filePath!, 'utf-8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function statSafe(targetPath: string) {
  try {
    return await fsp.stat(targetPath);
  } catch {
    return null;
  }
}

function inferStatus(value: string | undefined): MissionStatus {
  const normalized = (value || '').toLowerCase();
  if (normalized.includes('complete') || normalized.includes('success')) {
    return 'completed';
  }
  if (normalized.includes('build')) {
    return 'building';
  }
  if (normalized.includes('queue')) {
    return 'queued';
  }
  if (normalized.includes('error') || normalized.includes('fail')) {
    return 'error';
  }
  if (normalized.includes('idle')) {
    return 'idle';
  }
  if (normalized.includes('inactive')) {
    return 'inactive';
  }
  if (normalized.includes('scaffold')) {
    return 'scaffolded';
  }
  return 'active';
}

function parseFrontmatter(markdown: string): ParsedFrontmatter {
  if (!markdown.startsWith('---')) {
    return {};
  }

  const match = markdown.match(/^---\s*([\s\S]*?)\s*---/);
  if (!match) {
    return {};
  }

  const parsed: ParsedFrontmatter = {};
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
    if (key === 'tags') {
      parsed.tags = value
        .replace(/^\[|\]$/g, '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean);
      continue;
    }
    if (key === 'owner') parsed.owner = value;
    if (key === 'role') parsed.role = value;
    if (key === 'status') parsed.status = value;
    if (key === 'type') parsed.type = value;
    if (key === 'summary') parsed.summary = value;
  }
  return parsed;
}

function stripFrontmatter(markdown: string) {
  if (!markdown.startsWith('---')) {
    return markdown.trim();
  }
  return markdown.replace(/^---\s*[\s\S]*?\s*---/, '').trim();
}

function deriveMarkdownMetadata(filePath: string, markdown: string) {
  const frontmatter = parseFrontmatter(markdown);
  const stripped = stripFrontmatter(markdown);
  const lines = stripped
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const heading =
    lines.find((line) => line.startsWith('#'))?.replace(/^#+\s*/, '') ||
    path.basename(filePath, path.extname(filePath));
  const summary =
    frontmatter.summary ||
    lines.find((line) => !line.startsWith('#')) ||
    heading;

  return {
    title: heading,
    summary,
    status: inferStatus(frontmatter.status || summary),
    owner: frontmatter.owner || 'System',
    role: frontmatter.role || 'Knowledge',
    docType:
      frontmatter.type ||
      (filePath.toLowerCase().includes('overnight') ? 'overnight-log' : 'living-doc'),
    tags: frontmatter.tags || [],
    body: stripped,
  };
}

async function collectMarkdownFiles(root: string, limit = 24) {
  const results: string[] = [];

  async function walk(currentPath: string) {
    if (results.length >= limit) {
      return;
    }

    const stats = await statSafe(currentPath);
    if (!stats) {
      return;
    }

    if (stats.isDirectory()) {
      const entries = await fsp.readdir(currentPath, { withFileTypes: true });
      entries.sort((a, b) => a.name.localeCompare(b.name));
      for (const entry of entries) {
        if (results.length >= limit) {
          break;
        }
        if (entry.name === 'node_modules' || entry.name.startsWith('.git')) {
          continue;
        }
        await walk(path.join(currentPath, entry.name));
      }
      return;
    }

    if (currentPath.toLowerCase().endsWith('.md')) {
      results.push(currentPath);
    }
  }

  await walk(root);
  return results;
}

function getRoots(): OpenClawRoots {
  const workspacePath = process.env.OPENCLAW_WORKSPACE_PATH || null;
  const openclawHome =
    workspacePath && path.basename(workspacePath) === 'workspace'
      ? path.dirname(workspacePath)
      : workspacePath
        ? path.join(workspacePath, '.openclaw')
        : null;
  const docsRoot =
    process.env.MISSION_DOCS_ROOT ||
    (workspacePath ? path.join(workspacePath, 'docs') : null);

  return {
    workspacePath: workspacePath && fileExists(workspacePath) ? workspacePath : null,
    openclawHome: openclawHome && fileExists(openclawHome) ? openclawHome : null,
    docsRoot: docsRoot && fileExists(docsRoot) ? docsRoot : null,
  };
}

async function inferGitBranch(rootPath: string) {
  const headPath = path.join(rootPath, '.git', 'HEAD');
  if (!fileExists(headPath)) {
    return null;
  }

  try {
    const raw = await fsp.readFile(headPath, 'utf-8');
    const trimmed = raw.trim();
    if (trimmed.startsWith('ref:')) {
      return trimmed.split('/').at(-1) || 'main';
    }
    return trimmed.slice(0, 7);
  } catch {
    return null;
  }
}

function dedupeBy<T>(items: T[], getKey: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = getKey(item);
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

async function listWorkspaceFiles(workspaceId: string, rootPath: string) {
  const markdownFiles = await collectMarkdownFiles(rootPath, 12);
  return markdownFiles.map<WorkspaceFileSummary>((filePath) => ({
    id: `${workspaceId}:${slugify(path.relative(rootPath, filePath))}`,
    workspaceId,
    name: path.basename(filePath),
    relativePath: path.relative(rootPath, filePath),
    absolutePath: filePath,
    size: fs.statSync(filePath).size,
    updatedAt: fs.statSync(filePath).mtime.toISOString(),
    type: filePath.toLowerCase().endsWith('.md') ? 'markdown' : 'text',
  }));
}

async function readWorkspaceSnapshots(roots: OpenClawRoots): Promise<WorkspaceSnapshot[]> {
  if (!roots.workspacePath) {
    return [];
  }

  const entries = await fsp.readdir(roots.workspacePath, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => path.join(roots.workspacePath!, entry.name));

  const candidates = directories.length > 0 ? directories.slice(0, 8) : [roots.workspacePath];
  const workspaces: WorkspaceSnapshot[] = [];

  for (const candidate of candidates) {
    const stats = await statSafe(candidate);
    if (!stats?.isDirectory()) {
      continue;
    }

    const id = `workspace-${slugify(path.basename(candidate))}`;
    const files = await listWorkspaceFiles(id, candidate);
    workspaces.push({
      id,
      name: path.basename(candidate),
      icon: path.basename(candidate).charAt(0).toUpperCase(),
      color: 'bg-yellow-500/20 text-yellow-500',
      rootPath: candidate,
      branch: await inferGitBranch(candidate),
      status: files.length > 0 ? 'active' : 'idle',
      lastSyncAt: stats.mtime.toISOString(),
      summary:
        files.length > 0
          ? `${files.length} markdown artifacts discovered in workspace.`
          : 'Workspace imported from OpenClaw root.',
      activityCount: files.length,
      openItemsCount: 0,
      files,
      metadata: {
        owners: [],
      },
    });
  }

  return workspaces;
}

async function readDocs(roots: OpenClawRoots, workspaces: WorkspaceSnapshot[]): Promise<DocEntry[]> {
  const searchRoots = [roots.docsRoot, roots.workspacePath].filter(
    (value): value is string => Boolean(value)
  );
  const docs: DocEntry[] = [];

  for (const searchRoot of searchRoots) {
    const markdownFiles = await collectMarkdownFiles(searchRoot, 18);
    for (const filePath of markdownFiles) {
      try {
        const raw = await fsp.readFile(filePath, 'utf-8');
        const derived = deriveMarkdownMetadata(filePath, raw);
        const workspace = workspaces.find((item) =>
          item.rootPath ? filePath.startsWith(item.rootPath) : false
        );
        docs.push({
          id: `doc-${slugify(filePath)}`,
          title: derived.title,
          docType: derived.docType,
          owner: derived.owner,
          ownerRole: derived.role,
          status: derived.status,
          summary: derived.summary,
          bodyMarkdown: derived.body.slice(0, 4000),
          filePath,
          workspaceId: workspace?.id || null,
          tags: derived.tags,
          sourceMeetingId: null,
          createdAt: (await statSafe(filePath))?.mtime.toISOString() || null,
          metadata: {
            source: filePath,
          },
        });
        if (docs.length >= 18) {
          return docs;
        }
      } catch {
        continue;
      }
    }
  }

  return docs;
}

async function readModelFleet(roots: OpenClawRoots): Promise<ModelFleetCard[]> {
  const configCandidates = [
    roots.openclawHome ? path.join(roots.openclawHome, 'openclaw.json') : null,
    roots.openclawHome
      ? path.join(roots.openclawHome, 'agents', 'main', 'agent', 'models.json')
      : null,
  ];

  for (const candidate of configCandidates) {
    const payload = await readJsonFile<Record<string, unknown>>(candidate);
    if (!payload) {
      continue;
    }

    const providers =
      typeof payload.models === 'object' &&
      payload.models &&
      'providers' in payload.models
        ? ((payload.models as Record<string, unknown>).providers as Record<string, unknown>)
        : 'providers' in payload
          ? (payload.providers as Record<string, unknown>)
          : null;
    if (!providers) {
      continue;
    }

    const models: ModelFleetCard[] = [];
    for (const [providerKey, providerValue] of Object.entries(providers)) {
      const providerModels =
        typeof providerValue === 'object' && providerValue && Array.isArray((providerValue as any).models)
          ? ((providerValue as any).models as Array<Record<string, unknown>>)
          : [];
      for (const model of providerModels) {
        const modelId = String(model.id || model.name || providerKey);
        models.push({
          id: slugify(modelId),
          name: String(model.name || modelId),
          provider: providerKey,
          modelId,
          description: 'Imported from OpenClaw model configuration.',
          status: 'active',
          tokensUsed: 0,
          totalCost: 0,
          totalSessions: 0,
          badge: 'Imported',
          metadata: {
            source: candidate,
          },
        });
      }
    }

    if (models.length > 0) {
      return models;
    }
  }

  return [];
}

async function readScheduledJobs(roots: OpenClawRoots): Promise<ScheduledJob[]> {
  const jobsPath = roots.openclawHome ? path.join(roots.openclawHome, 'cron', 'jobs.json') : null;
  const payload = await readJsonFile<Record<string, unknown> | Array<Record<string, unknown>>>(jobsPath);
  const jobs = Array.isArray(payload)
    ? payload
    : Array.isArray((payload as Record<string, unknown> | null)?.jobs)
      ? (((payload as Record<string, unknown>).jobs as Array<Record<string, unknown>>))
      : [];

  return jobs.map((job) => ({
    id: slugify(String(job.id || job.name || job.title || 'job')),
    title: String(job.name || job.title || 'OpenClaw Job'),
    summary: String(job.description || job.prompt || 'Imported from OpenClaw.'),
    scheduleLabel: String(job.schedule || job.rrule || 'Manual'),
    durationLabel: String(job.duration || '~1 min'),
    jobKind: String(job.kind || job.type || 'cron'),
    team: String(job.team || job.owner || 'OPS'),
    status: inferStatus(String(job.status || 'active')),
    lastRunAt: (job.lastRunAt as string) || null,
    nextRunAt: (job.nextRunAt as string) || null,
    actions: Array.isArray(job.actions) ? job.actions.map(String) : [],
    workspaceId: typeof job.cwd === 'string' ? `workspace-${slugify(String(job.cwd))}` : null,
    metadata: {
      source: jobsPath,
    },
  }));
}

async function readMissionSessions(): Promise<MissionSession[]> {
  return [];
}

async function readOrgChart(roots: OpenClawRoots): Promise<{ roles: AgentRole[]; agents: AgentProfile[] }> {
  const candidates = [
    roots.workspacePath ? path.join(roots.workspacePath, 'org-chart.json') : null,
    roots.workspacePath ? path.join(roots.workspacePath, '.openclaw', 'org-chart.json') : null,
    roots.workspacePath ? path.join(roots.workspacePath, 'agents.json') : null,
  ];

  for (const candidate of candidates) {
    const payload = await readJsonFile<Record<string, unknown>>(candidate);
    if (!payload) {
      continue;
    }

    const roles = Array.isArray(payload.roles)
      ? (payload.roles as Array<Record<string, unknown>>).map((role) => ({
          slug: slugify(String(role.slug || role.name || 'role')),
          name: String(role.name || role.slug || 'Role'),
          lane: String(role.lane || role.team || 'Operations'),
          color: String(role.color || '#f6c84c'),
          description: String(role.description || 'Imported from org chart.'),
        }))
      : [];

    const agents = Array.isArray(payload.agents)
      ? (payload.agents as Array<Record<string, unknown>>).map((agent, index) => ({
          id: slugify(String(agent.id || agent.name || `agent-${index + 1}`)),
          name: String(agent.name || `Agent ${index + 1}`),
          roleSlug: slugify(String(agent.roleSlug || agent.role || roles[0]?.slug || 'ops')),
          chiefId: agent.chiefId ? String(agent.chiefId) : null,
          modelKey: agent.modelKey ? String(agent.modelKey) : null,
          workspaceId: agent.workspaceId ? String(agent.workspaceId) : null,
          status: inferStatus(String(agent.status || 'active')),
          persona: String(agent.persona || 'Imported OpenClaw agent.'),
          color: String(agent.color || '#f6c84c'),
          emoji: String(agent.emoji || '🤖'),
          frequency: agent.frequency ? String(agent.frequency) : null,
          markets: Array.isArray(agent.markets) ? agent.markets.map(String) : [],
          isLLM: Boolean(agent.isLLM ?? true),
          sortOrder: Number(agent.sortOrder || index + 1),
          metadata: {
            source: candidate,
          },
        }))
      : [];

    if (roles.length > 0 || agents.length > 0) {
      return { roles, agents };
    }
  }

  return { roles: [], agents: [] };
}

function mergeSnapshot(
  fixture: MissionSnapshot,
  partial: Partial<MissionSnapshot> & { meta?: MissionSnapshot['meta'] }
): MissionSnapshot {
  return {
    meta: {
      generatedAt: partial.meta?.generatedAt || fixture.meta.generatedAt,
      source: partial.meta?.source || fixture.meta.source,
      usedFixture: partial.meta?.usedFixture ?? fixture.meta.usedFixture,
    },
    roles: dedupeBy(partial.roles?.length ? partial.roles : fixture.roles, (item) => item.slug),
    agents: dedupeBy(partial.agents?.length ? partial.agents : fixture.agents, (item) => item.id),
    models: dedupeBy(partial.models?.length ? partial.models : fixture.models, (item) => item.id),
    sessions: dedupeBy(partial.sessions?.length ? partial.sessions : fixture.sessions, (item) => item.id),
    jobs: dedupeBy(partial.jobs?.length ? partial.jobs : fixture.jobs, (item) => item.id),
    workspaces: dedupeBy(
      partial.workspaces?.length ? partial.workspaces : fixture.workspaces,
      (item) => item.id
    ),
    docs: dedupeBy(partial.docs?.length ? partial.docs : fixture.docs, (item) => item.id),
    meetings: dedupeBy(partial.meetings?.length ? partial.meetings : fixture.meetings, (item) => item.id),
  };
}

export async function loadOpenClawMissionSnapshot(): Promise<MissionSnapshot> {
  const fixture = getFixtureMissionSnapshot();
  const roots = getRoots();

  const [models, jobs, workspaces, orgChart] = await Promise.all([
    readModelFleet(roots),
    readScheduledJobs(roots),
    readWorkspaceSnapshots(roots),
    readOrgChart(roots),
  ]);
  const docs = await readDocs(roots, workspaces.length > 0 ? workspaces : fixture.workspaces);
  const sessions = await readMissionSessions();

  return mergeSnapshot(fixture, {
    meta: {
      generatedAt: isoNow(),
      source: roots.workspacePath || fixture.meta.source,
      usedFixture:
        !roots.workspacePath ||
        models.length === 0 ||
        jobs.length === 0 ||
        workspaces.length === 0 ||
        docs.length === 0,
    },
    roles: orgChart.roles,
    agents: orgChart.agents,
    models,
    jobs,
    workspaces,
    docs,
    sessions,
    meetings: fixture.meetings,
  });
}
