import { startTransition, useEffect, useState } from 'react';

import type { DocEntry, MeetingRun, MissionSummary, OrgChartPayload, WorkspaceSnapshot } from '../shared/mission';
import Docs from './components/Docs';
import OrgChart from './components/OrgChart';
import Sidebar from './components/Sidebar';
import Standup from './components/Standup';
import TaskManager from './components/TaskManager';
import TopNav, { type MissionTab } from './components/TopNav';
import Workspace from './components/Workspace';
import {
  fetchDocs,
  fetchMeetings,
  fetchMissionSummary,
  fetchOrgChart,
  fetchWorkspaces,
  syncMission,
  triggerJob,
} from './lib/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<MissionTab>('Task Manager');
  const [summary, setSummary] = useState<MissionSummary | null>(null);
  const [orgChart, setOrgChart] = useState<OrgChartPayload | null>(null);
  const [meetings, setMeetings] = useState<MeetingRun[]>([]);
  const [workspaces, setWorkspaces] = useState<WorkspaceSnapshot[]>([]);
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [banner, setBanner] = useState<string | null>(null);
  const [workspaceFocus, setWorkspaceFocus] = useState<string | null>(null);
  const [docsWorkspaceFocus, setDocsWorkspaceFocus] = useState<string | null>(null);

  async function loadMissionState(options?: { syncFirst?: boolean; quiet?: boolean }) {
    if (!options?.quiet) {
      setIsRefreshing(true);
      setBanner(null);
    }

    try {
      if (options?.syncFirst) {
        const syncResult = await syncMission();
        setBanner(
          syncResult.usedFixture
            ? 'Mission state refreshed with fixture fallback because the live workspace is incomplete.'
            : `Mission state refreshed from ${syncResult.source}.`
        );
      }

      const [nextSummary, nextOrgChart, nextMeetings, nextWorkspaces, nextDocs] = await Promise.all([
        fetchMissionSummary(),
        fetchOrgChart(),
        fetchMeetings(),
        fetchWorkspaces(),
        fetchDocs(),
      ]);

      startTransition(() => {
        setSummary(nextSummary);
        setOrgChart(nextOrgChart);
        setMeetings(nextMeetings);
        setWorkspaces(nextWorkspaces);
        setDocs(nextDocs);
      });
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Unable to load mission control data.');
    } finally {
      if (!options?.quiet) {
        setIsRefreshing(false);
      }
    }
  }

  useEffect(() => {
    void loadMissionState();
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      void loadMissionState({ quiet: true });
    }, 8000);

    return () => window.clearInterval(interval);
  }, []);

  async function handleRefresh() {
    await loadMissionState({ syncFirst: true });
  }

  async function handleTriggerJob(jobId: string) {
    try {
      const result = await triggerJob(jobId);
      setBanner(`Job queued. Runner session: ${result.jobRunId}`);
      await loadMissionState({ quiet: true });
    } catch (error) {
      setBanner(error instanceof Error ? error.message : 'Unable to trigger job.');
    }
  }

  function openWorkspace(workspaceId: string | null | undefined) {
    setWorkspaceFocus(workspaceId || null);
    setActiveTab('Workspace');
  }

  function openDocs(workspaceId: string | null | undefined) {
    setDocsWorkspaceFocus(workspaceId || null);
    setActiveTab('Docs');
  }

  return (
    <div className="flex min-h-screen bg-[#090909] text-white">
      <Sidebar activeAgents={orgChart?.agents.length || 0} activeWorkspaces={workspaces.length} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onRefresh={() => void handleRefresh()}
          isRefreshing={isRefreshing}
          lastSyncedAt={summary?.lastSyncedAt || null}
          usedFixture={summary?.usedFixture ?? true}
        />

        {banner ? (
          <div className="border-b border-[#232323] bg-[#101010] px-5 py-3 text-sm text-amber-300">{banner}</div>
        ) : null}

        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">
          {activeTab === 'Task Manager' ? (
            <TaskManager
              summary={summary}
              isRefreshing={isRefreshing}
              onRefresh={() => void handleRefresh()}
              onTriggerJob={(jobId) => void handleTriggerJob(jobId)}
            />
          ) : null}

          {activeTab === 'Org Chart' ? (
            <OrgChart
              payload={orgChart}
              onOpenWorkspace={openWorkspace}
              onOpenDocs={openDocs}
              onOpenStandup={() => setActiveTab('Standup')}
            />
          ) : null}

          {activeTab === 'Standup' ? (
            <Standup meetings={meetings} agents={orgChart?.agents || []} workspaces={workspaces} />
          ) : null}

          {activeTab === 'Workspace' ? (
            <Workspace workspaces={workspaces} initialWorkspaceId={workspaceFocus} />
          ) : null}

          {activeTab === 'Docs' ? <Docs docs={docs} initialWorkspaceId={docsWorkspaceFocus} /> : null}
        </main>
      </div>
    </div>
  );
}
