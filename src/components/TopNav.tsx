import { BookOpen, CheckSquare, Folder, Mic, Network, RefreshCw } from 'lucide-react';

export type MissionTab = 'Task Manager' | 'Org Chart' | 'Standup' | 'Workspace' | 'Docs';

const tabs: Array<{ name: MissionTab; icon: typeof CheckSquare }> = [
  { name: 'Task Manager', icon: CheckSquare },
  { name: 'Org Chart', icon: Network },
  { name: 'Standup', icon: Mic },
  { name: 'Workspace', icon: Folder },
  { name: 'Docs', icon: BookOpen },
];

interface TopNavProps {
  activeTab: MissionTab;
  setActiveTab: (tab: MissionTab) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  lastSyncedAt: string | null;
  usedFixture: boolean;
}

function formatRelativeTime(value: string | null) {
  if (!value) {
    return 'Never synced';
  }

  const date = new Date(value);
  return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  })}`;
}

export default function TopNav({
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  lastSyncedAt,
  usedFixture,
}: TopNavProps) {
  return (
    <div className="border-b border-[#2a2a2a] bg-[#111111]/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="mr-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-500/30 bg-amber-500/10 text-xl text-amber-300">
              🛰️
            </div>
            <div>
              <div className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-300">
                Muddy-OS
              </div>
              <div className="text-xs text-gray-500">Mission control for OpenClaw operators</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.name;

              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-sm transition-colors ${
                    isActive
                      ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                      : 'border-transparent bg-[#181818] text-gray-400 hover:border-[#333] hover:text-gray-100'
                  }`}
                >
                  <Icon size={15} />
                  {tab.name}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col items-start gap-2 text-xs text-gray-500 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-center gap-2 rounded-full border border-[#2b2b2b] bg-[#151515] px-3 py-1.5">
            <span className={`h-2 w-2 rounded-full ${usedFixture ? 'bg-yellow-400' : 'bg-green-400'}`} />
            {usedFixture ? 'Fixture fallback active' : 'Live workspace connected'}
          </div>
          <div>{formatRelativeTime(lastSyncedAt)}</div>
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-md border border-[#2e2e2e] bg-[#181818] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-amber-400/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Syncing' : 'Refresh'}
          </button>
        </div>
      </div>
    </div>
  );
}
