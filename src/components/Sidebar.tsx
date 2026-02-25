import { Terminal, Settings, Database, LayoutDashboard } from 'lucide-react';

export default function Sidebar() {
  return (
    <div className="w-16 bg-[#1a1a1a] border-r border-[#333] flex flex-col items-center py-4 gap-6">
      <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center text-yellow-500 mb-4">
        <Terminal size={24} />
      </div>
      <button className="text-yellow-500 bg-[#2a2a2a] p-2 rounded-lg">
        <LayoutDashboard size={20} />
      </button>
      <button className="text-gray-500 hover:text-gray-300 p-2 rounded-lg transition-colors">
        <Database size={20} />
      </button>
      <button className="text-gray-500 hover:text-gray-300 p-2 rounded-lg transition-colors mt-auto">
        <Settings size={20} />
      </button>
    </div>
  );
}
