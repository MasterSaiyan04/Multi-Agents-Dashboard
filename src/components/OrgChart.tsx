import React from 'react';

const orgStats = [
  { label: 'Chiefs', value: '3', color: 'text-yellow-500' },
  { label: 'Total Agents', value: '25', color: 'text-white' },
  { label: 'Active', value: '21', color: 'text-green-500' },
  { label: 'Scaffolded', value: '1', color: 'text-orange-500' },
  { label: 'Deprecated', value: '7', color: 'text-red-500' },
];

export default function OrgChart() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Organization Chart</h2>
          <p className="text-sm text-gray-500">Clearmud Labs - Operational Structure</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-[#2a2a2a] text-sm rounded-md hover:bg-[#333] transition-colors">Expand All</button>
          <button className="px-4 py-1.5 bg-[#2a2a2a] text-sm rounded-md hover:bg-[#333] transition-colors">Collapse All</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {orgStats.map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold mb-1 ${stat.color}`}>{stat.value}</span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center mt-12">
        {/* Human */}
        <div className="bg-[#1a1a1a] border border-blue-500/30 rounded-xl p-4 w-64 text-center relative z-10">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2 flex items-center justify-center text-blue-400 font-bold text-xl">M</div>
          <h3 className="font-semibold">Marcelo Oliveira</h3>
          <p className="text-xs text-gray-400 mt-1">Vision - Strategy - Final Decisions</p>
        </div>
        
        <div className="w-px h-8 bg-[#333]"></div>

        {/* COO */}
        <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-4 w-64 text-center relative z-10">
          <div className="absolute top-2 left-2 text-[10px] bg-[#222] px-1.5 py-0.5 rounded text-gray-400">COO</div>
          <div className="w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2 flex items-center justify-center text-green-400 font-bold text-xl">M</div>
          <h3 className="font-semibold">Muddy</h3>
          <p className="text-xs text-gray-400 mt-1">Research - Delegation - Execution - Orchestration</p>
        </div>

        <div className="w-px h-8 bg-[#333]"></div>
        <div className="w-[800px] h-px bg-[#333]"></div>

        {/* Chiefs */}
        <div className="flex justify-between w-[900px] mt-8 gap-6">
          {/* Elon */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-[#333] -mt-8 mb-0"></div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 w-full mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold">E</div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">Elon <span className="text-[10px] bg-[#222] px-1.5 py-0.5 rounded text-gray-400">CTO</span></h3>
                  <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded inline-block mt-1">Opus 4.6</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Technical execution, architecture decisions, code quality, infrastructure, and security posture</p>
            </div>
            
            {/* Departments */}
            <div className="w-full space-y-4">
              <Department title="Backend & Security" count={2} agents={[
                { name: 'Anvil', role: 'Backend Engineer', model: 'Codex 5.3', status: 'Active' },
                { name: 'Cipher', role: 'Security Engineer', model: 'Codex 5.3', status: 'Active' }
              ]} />
              <Department title="Frontend & DevOps" count={2} agents={[
                { name: 'Pixel', role: 'Frontend Engineer', model: 'Opus 4.6', status: 'Active' },
                { name: 'Sentry', role: 'DevOps Engineer', model: 'Opus 4.6', status: 'Active' }
              ]} />
            </div>
          </div>

          {/* Gary */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-[#333] -mt-8 mb-0"></div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 w-full mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-pink-500/20 rounded-full flex items-center justify-center text-pink-400 font-bold">G</div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">Gary <span className="text-[10px] bg-[#222] px-1.5 py-0.5 rounded text-gray-400">CMO</span></h3>
                  <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded inline-block mt-1">Opus 4.6</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Content strategy, brand voice, creative direction, media, and multi-platform distribution</p>
            </div>

            <div className="w-full space-y-4">
              <Department title="Content" count={3} agents={[
                { name: 'Rex', role: 'YouTube Script Writer', model: 'Opus 4.6', status: 'Active' },
                { name: 'Sage', role: 'Research & Analysis', model: 'Opus 4.6', status: 'Active' },
                { name: 'Hype', role: 'Social Media Manager', model: 'Sonnet 4.5', status: 'Active' }
              ]} />
              <Department title="Creative" count={2} agents={[
                { name: 'Fame', role: 'Thumbnail Designer', model: 'Opus 4.6', status: 'Active' },
                { name: 'Motion', role: 'Video Editor', model: 'Gemini 3 Pro', status: 'Active' }
              ]} />
            </div>
          </div>

          {/* Warren */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-8 bg-[#333] -mt-8 mb-0"></div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 w-full mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center text-yellow-400 font-bold">W</div>
                <div>
                  <h3 className="font-semibold flex items-center gap-2">Warren <span className="text-[10px] bg-[#222] px-1.5 py-0.5 rounded text-gray-400">CRO</span></h3>
                  <div className="text-[10px] text-yellow-500 bg-yellow-500/10 px-1.5 py-0.5 rounded inline-block mt-1">Opus 4.6</div>
                </div>
              </div>
              <p className="text-xs text-gray-400">Revenue operations, growth metrics, community health, and product-market fit</p>
            </div>

            <div className="w-full space-y-4">
              <Department title="Products" count={2} agents={[
                { name: 'Scout', role: 'Product Intelligence', model: 'Opus 4.6', status: 'Active' },
                { name: 'Herald', role: 'Product Launches', model: 'Sonnet 4.5', status: 'Active' }
              ]} />
              <Department title="Growth" count={2} agents={[
                { name: 'Beacon', role: 'SEO Optimization', model: 'Opus 4.6', status: 'Active' },
                { name: 'Pulse', role: 'Analytics', model: 'Opus 4.6', status: 'Active' }
              ]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Department({ title, count, agents }: { title: string, count: number, agents: any[] }) {
  return (
    <div className="bg-[#141414] border border-[#222] rounded-lg p-3">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-medium text-gray-300">{title}</h4>
        <span className="text-[10px] text-gray-500">{count} agents</span>
      </div>
      <div className="space-y-2">
        {agents.map((agent, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded p-2 flex justify-between items-center hover:border-gray-500 transition-colors cursor-pointer">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-[#2a2a2a] flex items-center justify-center text-[10px] font-bold text-gray-400">
                {agent.name.charAt(0)}
              </div>
              <div>
                <div className="text-xs font-medium text-gray-200">{agent.name}</div>
                <div className="text-[9px] text-gray-500">{agent.role}</div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-[9px] text-yellow-500 bg-yellow-500/10 px-1 rounded">{agent.model}</div>
              <div className="flex items-center gap-1 text-[9px] text-green-500">
                <span className="w-1 h-1 rounded-full bg-green-500"></span>
                Active
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
