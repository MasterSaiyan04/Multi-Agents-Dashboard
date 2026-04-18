import type {
  DocEntry,
  MeetingCreateInput,
  MeetingPlaybackState,
  MeetingRun,
  MeetingRunInput,
  MissionJobRunResult,
  MissionSession,
  MissionSummary,
  MissionSyncResult,
  OrgChartPayload,
  ScheduledJob,
  WorkspaceFileDetail,
  WorkspaceSnapshot,
} from '../../shared/mission';

async function request<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const response = await fetch(input, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    let message = `Request failed with ${response.status}`;
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload.error) {
        message = payload.error;
      }
    } catch {
      // no-op
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export function fetchMissionSummary() {
  return request<MissionSummary>('/api/mission/summary');
}

export function fetchMissionSessions() {
  return request<MissionSession[]>('/api/mission/sessions');
}

export function fetchScheduledJobs() {
  return request<ScheduledJob[]>('/api/mission/jobs');
}

export function triggerJob(jobId: string) {
  return request<MissionJobRunResult>(`/api/mission/jobs/${jobId}/trigger`, {
    method: 'POST',
  });
}

export function fetchMeetings() {
  return request<MeetingRun[]>('/api/mission/meetings');
}

export function createMeeting(input: MeetingCreateInput) {
  return request<MeetingRun>('/api/mission/meetings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMeeting(meetingId: string) {
  return request<MeetingRun>(`/api/mission/meetings/${meetingId}`);
}

export function runMeeting(meetingId: string, input: MeetingRunInput) {
  return request<MissionJobRunResult>(`/api/mission/meetings/${meetingId}/run`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function fetchMeetingPlayback(meetingId: string) {
  return request<MeetingPlaybackState>(`/api/mission/meetings/${meetingId}/playback`);
}

export function fetchOrgChart() {
  return request<OrgChartPayload>('/api/mission/org-chart');
}

export function fetchWorkspaces() {
  return request<WorkspaceSnapshot[]>('/api/mission/workspaces');
}

export function fetchWorkspaceFile(workspaceId: string, fileId: string) {
  return request<WorkspaceFileDetail>(
    `/api/mission/workspaces/${workspaceId}/file?fileId=${encodeURIComponent(fileId)}`
  );
}

export function saveWorkspaceFile(workspaceId: string, fileId: string, content: string) {
  return request<WorkspaceFileDetail>(
    `/api/mission/workspaces/${workspaceId}/file?fileId=${encodeURIComponent(fileId)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }
  );
}

export function fetchDocs() {
  return request<DocEntry[]>('/api/mission/docs');
}

export function syncMission() {
  return request<MissionSyncResult>('/api/mission/sync', {
    method: 'POST',
  });
}
