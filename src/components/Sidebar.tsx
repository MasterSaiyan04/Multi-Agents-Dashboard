import { Activity, Database, Settings2, TerminalSquare } from 'lucide-react';

interface SidebarProps {
  activeAgents: number;
  activeWorkspaces: number;
}

export default function Sidebar({ activeAgents, activeWorkspaces }: SidebarProps) {
  return (
    <aside className="hidden w-20 flex-col items-center border-r border-[#232323] bg-[#0c0c0c] py-5 lg:flex">
      <div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <TerminalSquare size={24} />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#2d2d2d] bg-[#151515] text-amber-300">
          <Activity size={18} />
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#242424] bg-[#121212] text-gray-500">
          <Database size={18} />
        </div>
      </div>

      <div className="mt-8 flex w-full flex-col gap-3 px-3 text-center">
        <div className="rounded-xl border border-[#232323] bg-[#131313] px-2 py-3">
          <div className="text-lg font-semibold text-white">{activeAgents}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Agents</div>
        </div>
        <div className="rounded-xl border border-[#232323] bg-[#131313] px-2 py-3">
          <div className="text-lg font-semibold text-white">{activeWorkspaces}</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-gray-500">Spaces</div>
        </div>
      </div>

      <button className="mt-auto flex h-11 w-11 items-center justify-center rounded-xl border border-[#242424] bg-[#121212] text-gray-500 transition-colors hover:text-gray-200">
        <Settings2 size={18} />
      </button>
    </aside>
  );
}
