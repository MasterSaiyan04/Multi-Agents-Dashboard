import { CheckSquare, Network, Mic, Folder, BookOpen, RefreshCw } from 'lucide-react';

const tabs = [
  { name: 'Task Manager', icon: CheckSquare },
  { name: 'Org Chart', icon: Network },
  { name: 'Standup', icon: Mic },
  { name: 'Workspace', icon: Folder },
  { name: 'Docs', icon: BookOpen },
];

export default function TopNav({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="h-14 bg-[#1a1a1a] border-b border-[#333] flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-200 mr-6 flex items-center gap-2"><span className="text-xl">🧠</span> InstaDesk HQ</span>
        <div className="flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#2a2a2a] text-yellow-500'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#222]'
                }`}
              >
                <Icon size={16} />
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Live
        </div>
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white">
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>
    </div>
  );
}
