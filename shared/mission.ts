export type MissionStatus =
  | 'active'
  | 'idle'
  | 'running'
  | 'queued'
  | 'completed'
  | 'building'
  | 'error'
  | 'standby'
  | 'archived'
  | 'scaffolded'
  | 'inactive';

export interface AgentRole {
  slug: string;
  name: string;
  lane: string;
  color: string;
  description: string;
}

export interface AgentProfile {
  id: string;
  name: string;
  roleSlug: string;
  chiefId: string | null;
  modelKey: string | null;
  workspaceId: string | null;
  status: MissionStatus;
  persona: string;
  color: string;
  emoji: string;
  frequency: string | null;
  markets: string[];
  isLLM: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface ModelFleetCard {
  id: string;
  name: string;
  provider: string;
  modelId: string;
  description: string;
  status: MissionStatus;
  tokensUsed: number;
  totalCost: number;
  totalSessions: number;
  badge?: string;
  metadata: Record<string, unknown>;
}

export interface SessionEvent {
  id: string;
  sessionId: string;
  eventType: string;
  content: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface MissionSession {
  id: string;
  title: string;
  status: MissionStatus;
  agentId: string | null;
  modelId: string | null;
  workspaceId: string | null;
  summary: string;
  log: string;
  logTime: string | null;
  lastHeartbeatAt: string | null;
  tokensUsed: number;
  totalCost: number;
  modelTags: string[];
  metadata: Record<string, unknown>;
  events?: SessionEvent[];
}

export interface ScheduledJob {
  id: string;
  title: string;
  summary: string;
  scheduleLabel: string;
  durationLabel: string;
  jobKind: string;
  team: string;
  status: MissionStatus;
  lastRunAt: string | null;
  nextRunAt: string | null;
  actions: string[];
  workspaceId: string | null;
  metadata: Record<string, unknown>;
}

export interface MeetingParticipant {
  id: string;
  name: string;
  role: string;
  emoji: string;
  color: string;
}

export interface MeetingTurn {
  id: string;
  meetingId: string;
  turnIndex: number;
  speakerId: string | null;
  speakerName: string;
  speakerRole: string;
  content: string;
  voice: string | null;
  durationSec: number;
  createdAt: string;
  metadata: Record<string, unknown>;
}

export interface MeetingArtifact {
  id: string;
  meetingId: string;
  title: string;
  artifactType: string;
  owner: string;
  summary: string;
  bodyMarkdown: string;
  filePath: string | null;
  status: MissionStatus;
  sortOrder: number;
  metadata: Record<string, unknown>;
}

export interface MeetingRun {
  id: string;
  slug: string;
  title: string;
  topic: string;
  status: MissionStatus;
  dateLabel: string;
  timeLabel: string;
  participants: MeetingParticipant[];
  startAt: string | null;
  endAt: string | null;
  voiceEnabled: boolean;
  audioUrl: string | null;
  audioDurationSec: number;
  summary: string;
  preview: string;
  transcriptText: string;
  metadata: Record<string, unknown>;
  turns?: MeetingTurn[];
  artifacts?: MeetingArtifact[];
}

export interface WorkspaceFileSummary {
  id: string;
  workspaceId: string;
  name: string;
  relativePath: string;
  absolutePath: string;
  size: number;
  updatedAt: string | null;
  type: 'markdown' | 'json' | 'text' | 'other';
}

export interface WorkspaceFileDetail extends WorkspaceFileSummary {
  content: string;
  readOnly: boolean;
}

export interface WorkspaceSnapshot {
  id: string;
  name: string;
  icon: string;
  color: string;
  rootPath: string | null;
  branch: string | null;
  status: MissionStatus;
  lastSyncAt: string | null;
  summary: string;
  activityCount: number;
  openItemsCount: number;
  files: WorkspaceFileSummary[];
  metadata: Record<string, unknown>;
}

export interface DocEntry {
  id: string;
  title: string;
  docType: string;
  owner: string;
  ownerRole: string;
  status: MissionStatus;
  summary: string;
  bodyMarkdown: string;
  filePath: string | null;
  workspaceId: string | null;
  tags: string[];
  sourceMeetingId: string | null;
  createdAt: string | null;
  metadata: Record<string, unknown>;
}

export interface MissionKpi {
  id: string;
  label: string;
  value: number;
  displayValue: string;
  tone: 'green' | 'yellow' | 'blue' | 'red' | 'white';
}

export interface MissionSummary {
  generatedAt: string;
  lastSyncedAt: string | null;
  usedFixture: boolean;
  kpis: MissionKpi[];
  modelFleet: ModelFleetCard[];
  activeSessions: MissionSession[];
  scheduledJobs: ScheduledJob[];
  overnightLog: DocEntry[];
}

export interface MissionCounts {
  roles: number;
  agents: number;
  models: number;
  sessions: number;
  jobs: number;
  meetings: number;
  docs: number;
  workspaces: number;
}

export interface MissionSyncResult {
  syncedAt: string;
  usedFixture: boolean;
  counts: MissionCounts;
  source: string;
}

export interface MissionSnapshot {
  meta: {
    generatedAt: string;
    source: string;
    usedFixture: boolean;
  };
  roles: AgentRole[];
  agents: AgentProfile[];
  models: ModelFleetCard[];
  sessions: MissionSession[];
  jobs: ScheduledJob[];
  workspaces: WorkspaceSnapshot[];
  docs: DocEntry[];
  meetings: MeetingRun[];
}

export interface OrgChartPayload {
  roles: AgentRole[];
  agents: AgentProfile[];
}

export interface MeetingCreateInput {
  title?: string;
  topic: string;
  participants: string[];
  workspaceId?: string | null;
  voiceEnabled?: boolean;
}

export interface MeetingRunInput {
  topic?: string;
  participants?: string[];
  workspaceId?: string | null;
  voiceEnabled?: boolean;
}

export interface MissionJobRunResult {
  meetingRunId?: string;
  jobRunId: string;
  status: MissionStatus;
}

export interface MeetingPlaybackState {
  meetingId: string;
  status: MissionStatus;
  title: string;
  audioDurationSec: number;
  hasAudio: boolean;
  currentTurn: number;
  totalTurns: number;
  transcriptLength: number;
}
