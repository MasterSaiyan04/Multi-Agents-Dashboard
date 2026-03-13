import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Circle, X, Sparkles } from 'lucide-react';

const orgStats = [
  { label: 'Chiefs', value: '3', color: 'text-yellow-500', border: 'border-yellow-500/30' },
  { label: 'Total Agents', value: '25', color: 'text-white', border: 'border-white/20' },
  { label: 'Active', value: '21', color: 'text-green-500', border: 'border-green-500/30', icon: <Check size={16} className="text-green-500 inline mr-1" /> },
  { label: 'Scaffolded', value: '1', color: 'text-yellow-500', border: 'border-yellow-500/30', icon: <Circle size={12} fill="currentColor" className="text-yellow-500 inline mr-1" /> },
  { label: 'Deprecated', value: '7', color: 'text-red-500', border: 'border-red-500/30', icon: <X size={16} className="text-red-500 inline mr-1" /> },
];

const orgData = {
  elon: [
    {
      id: 'elon-0',
      title: 'Backend & Automation',
      description: 'Workflows, APIs, webhooks, integrations, and runtime orchestration',
      agents: [
        { name: 'Automation Builder', role: 'n8n · OpenClaw · Integrations', emoji: '⚙️', status: 'Active', models: ['Qwen3-Coder-Flash'] },
        { name: 'Integrations Agent', role: 'APIs · Webhooks · CRM Connectors', emoji: '🔒', status: 'Active', models: ['Qwen3-Coder-Flash'] }
      ]
    },
    {
      id: 'elon-1',
      title: 'Frontend & DevOps',
      description: 'UI/UX implementation, design systems, CI/CD, deployments, and infrastructure',
      agents: [
        { name: 'Frontend Dashboard Agent', role: 'React · TS · Tailwind UI', emoji: '🎨', status: 'Active', models: ['Qwen3-Coder-Flash'] },
        { name: 'QA & Observability Agent', role: 'Testing · Logs · Regression Checks', emoji: '🛡️', status: 'Active', models: ['Gemini 2.5 Flash-Lite'] }
      ]
    },
    {
      id: 'elon-2',
      title: 'QA',
      description: 'Code review, bug detection, regression testing, and quality benchmarks',
      agents: [
        { name: 'Audit', role: 'QA Engineer', emoji: '🐛', status: 'Active', models: ['Opus 4.6'] }
      ]
    }
  ],
  gary: [
    {
      id: 'gary-0',
      title: 'Demo & Messaging',
      description: 'Demo scripts, landing copy, outreach copy, and offer positioning',
      agents: [
        { name: 'Demo Story Agent', role: 'Demo Scripts · Positioning · Offers', emoji: '🎬', status: 'Active', models: ['DeepSeek-Chat', 'Claude Sonnet 4.5'] },
        { name: 'Content / Copy Agent', role: 'Landing Copy · Outreach Copy · FAQ', emoji: '🧠', status: 'Active', models: ['DeepSeek-Chat'] },
        { name: 'Docs & Memory Agent', role: 'Living Docs · SOPs · Memory Summaries', emoji: '📰', status: 'Active', models: ['DeepSeek-Chat'] },
        { name: 'Hype', role: 'Content Cascade Engine', emoji: '📣', status: 'Active', models: ['Sonnet 4.5'] }
      ]
    },
    {
      id: 'gary-1',
      title: 'Creative',
      description: 'Thumbnails, graphics, infographics, and motion design',
      agents: [
        { name: 'Frame', role: 'Thumbnails & Graphics', emoji: '🖼️', status: 'Active', models: ['Opus 4.6'] },
        { name: 'Motion', role: 'Video Editor', emoji: '🎞️', status: 'Active', models: ['Gemini 3 Pro'] }
      ]
    }
  ],
  warren: [
    {
      id: 'warren-0',
      title: 'Lead Gen & Outreach',
      description: 'Product intelligence, go-to-market strategy, and launch campaigns',
      agents: [
        { name: 'Scout', role: 'Product Intelligence', emoji: '🔭', status: 'Active', models: ['Opus 4.6', 'Sonnet 4.5'] },
        { name: 'Herald', role: 'Product Launches & Announcements', emoji: '🎺', status: 'Active', models: ['Sonnet 4.5'] }
      ]
    },
    {
      id: 'warren-1',
      title: 'CRM Operations',
      description: 'SEO optimization, analytics, partnership outreach, and audience growth',
      agents: [
        { name: 'Beacon', role: 'SEO & Growth', emoji: '🚀', status: 'Active', models: ['Sonnet 4.5'] },
        { name: 'Pulse', role: 'Analytics Agent', emoji: '📊', status: 'Scaffolded', models: ['Sonnet 4.5'] }
      ]
    },
    {
      id: 'warren-2',
      title: 'Pipeline / Client Ops',
      description: 'Community engagement, support, and moderation',
      agents: [
        { name: 'CRM Ops Agent', role: 'Pipeline Hygiene · Stages · Dedupe', emoji: '💬', status: 'Active', models: ['Qwen-Flash'] },
        { name: 'Outreach & Appointment Setter', role: 'Email · WhatsApp · Demo Booking', emoji: '🔗', status: 'Active', models: ['Qwen-Flash'] },
        { name: 'Vibe', role: 'Vibe Check', emoji: '✨', status: 'Active', models: ['Gemini Flash'] }
      ]
    }
  ]
};

const allDeptIds = [
  ...orgData.elon.map(d => d.id),
  ...orgData.gary.map(d => d.id),
  ...orgData.warren.map(d => d.id)
];

export default function OrgChart() {
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const expandAll = () => setExpanded(allDeptIds);
  const collapseAll = () => setExpanded([]);

  return (
    <div className="max-w-[1200px] mx-auto space-y-8 pb-12 bg-grid min-h-full p-4 rounded-xl">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-semibold mb-1">Organization Chart</h2>
          <p className="text-sm text-gray-500">InstaDesk - Operational Structure</p>
        </div>
        <div className="flex gap-2">
          <button onClick={expandAll} className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333] text-sm rounded-md hover:bg-[#222] transition-colors">Expand All</button>
          <button onClick={collapseAll} className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333] text-sm rounded-md hover:bg-[#222] transition-colors">Collapse All</button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-12">
        {orgStats.map((stat, i) => (
          <div key={i} className={`bg-[#111111] border ${stat.border} rounded-xl p-4 flex flex-col items-center justify-center shadow-lg`}>
            <span className={`text-3xl font-bold mb-1 ${stat.color}`}>
              {stat.icon}{stat.value}
            </span>
            <span className="text-xs text-gray-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center">
        {/* Human */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-4 w-72 text-center relative z-10 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-500/60 transition-colors cursor-pointer">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-yellow-500 font-bold tracking-widest">Human CEO</div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2 mt-3 flex items-center justify-center text-2xl">👨🏻‍💻</div>
            <h3 className="font-semibold text-gray-200">YOU</h3>
            <p className="text-xs text-gray-500 mt-1">Vision · Sales · Final Decisions</p>
          </div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
        </div>

        {/* COO */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#0a1f14] border border-green-500/30 rounded-xl p-4 w-80 text-center relative z-10 shadow-[0_0_15px_rgba(34,197,94,0.1)] hover:border-green-500/60 transition-colors cursor-pointer">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-yellow-500 font-bold tracking-widest">Chief of Staff / AI Orchestrator</div>
            <div className="w-12 h-12 bg-blue-600/20 rounded-full mx-auto mb-2 mt-3 flex items-center justify-center text-2xl">🔵</div>
            <h3 className="font-semibold text-gray-200">COO AI</h3>
            <p className="text-xs text-gray-500 mt-1">Research · Delegation · Execution · Orchestration · Qwen3.5-Plus</p>
          </div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
        </div>

        <div className="w-[800px] h-px bg-yellow-500/50"></div>

        {/* Chiefs */}
        <div className="flex justify-between w-[900px] mt-0 gap-6">
          {/* Elon */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-6 bg-yellow-500/50 mb-0"></div>
            <div className="bg-[#111111] border-t-2 border-t-blue-500 border-x border-b border-[#333] rounded-xl p-4 w-full mb-4 shadow-lg hover:border-blue-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🤖</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-200">CTO AI</h3>
                    <ModelBadge model="DeepSeek-Reasoner" />
                  </div>
                  <div className="text-[10px] text-yellow-500 font-bold tracking-widest mt-0.5">CTO</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Technical architecture, delivery, integrations, reliability, and QA gate</p>
            </div>
            
            <div className="w-full space-y-3">
              {orgData.elon.map(dept => (
                <Department key={dept.id} {...dept} isExpanded={expanded.includes(dept.id)} onToggle={toggle} />
              ))}
            </div>
          </div>

          {/* Gary */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-6 bg-yellow-500/50 mb-0"></div>
            <div className="bg-[#111111] border-t-2 border-t-orange-500 border-x border-b border-[#333] rounded-xl p-4 w-full mb-4 shadow-lg hover:border-orange-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🔴</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-200">CMO AI</h3>
                    <ModelBadge model="Qwen3.5-Plus" />
                  </div>
                  <div className="text-[10px] text-yellow-500 font-bold tracking-widest mt-0.5">CMO</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Demo storytelling, messaging, positioning, and marketing support</p>
            </div>

            <div className="w-full space-y-3">
              {orgData.gary.map(dept => (
                <Department key={dept.id} {...dept} isExpanded={expanded.includes(dept.id)} onToggle={toggle} />
              ))}
            </div>
          </div>

          {/* Warren */}
          <div className="flex-1 flex flex-col items-center">
            <div className="w-px h-6 bg-yellow-500/50 mb-0"></div>
            <div className="bg-[#111111] border-t-2 border-t-green-500 border-x border-b border-[#333] rounded-xl p-4 w-full mb-4 shadow-lg hover:border-green-500/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">🟡</div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-lg text-gray-200">CRO AI</h3>
                    <ModelBadge model="Qwen3.5-Plus" />
                  </div>
                  <div className="text-[10px] text-yellow-500 font-bold tracking-widest mt-0.5">CRO</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">Revenue operations, lead pipeline, outreach flow, and CRM hygiene</p>
            </div>

            <div className="w-full space-y-3">
              {orgData.warren.map(dept => (
                <Department key={dept.id} {...dept} isExpanded={expanded.includes(dept.id)} onToggle={toggle} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Deprecated Agents */}
      <div className="mt-8 bg-[#1a0f0f] border border-red-900/50 rounded-xl p-3 flex justify-between items-center cursor-pointer hover:bg-[#2a1515] transition-colors">
        <div className="flex items-center gap-2 text-red-500">
          <X size={16} />
          <span className="font-medium text-sm">Deprecated Agents (7)</span>
        </div>
        <ChevronDown size={16} className="text-red-500/50" />
      </div>

      {/* Legend */}
      <div className="mt-4 bg-[#111111] border border-[#333] rounded-xl p-4">
        <h4 className="text-xs font-bold text-gray-500 tracking-widest uppercase mb-4">Legend</h4>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400">Status:</span>
            <StatusBadge status="Active" />
            <StatusBadge status="Scaffolded" />
            <StatusBadge status="Future" />
            <StatusBadge status="Deprecated" />
          </div>
          <div className="w-px h-6 bg-[#333] hidden md:block"></div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-400">Model:</span>
            <ModelBadge model="Opus" />
            <ModelBadge model="Codex" />
            <ModelBadge model="Sonnet" />
            <ModelBadge model="Haiku" />
            <ModelBadge model="Gemini Flash" />
            <ModelBadge model="Gemini Pro" />
            <ModelBadge model="Nano Banana Pro" />
            <ModelBadge model="Minimax" />
            <ModelBadge model="Kimi" />
            <ModelBadge model="Deepseek" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Department({ id, title, description, count, agents, isExpanded, onToggle }: any) {
  return (
    <div className="bg-[#111111] border border-[#222] rounded-xl overflow-hidden shadow-sm hover:border-yellow-500/30 transition-colors">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
        onClick={() => onToggle(id)}
      >
        <h4 className="text-sm font-medium text-gray-200">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">{count} agents</span>
          {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-[#222]">
          {description && <p className="text-xs text-gray-500 mb-4 mt-2 leading-relaxed">{description}</p>}
          <div className="space-y-2">
            {agents.map((agent: any, i: number) => (
              <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-lg p-3 hover:border-yellow-500/50 transition-colors cursor-pointer">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-xl">{agent.emoji}</div>
                  <div>
                    <div className="text-sm font-medium text-gray-200">{agent.name}</div>
                    <div className="text-[10px] text-gray-500">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={agent.status} />
                  {agent.models.map((m: string) => <ModelBadge key={m} model={m} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') return <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-md"><Check size={10} /> Active</span>;
  if (status === 'Scaffolded') return <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-md"><Circle size={8} fill="currentColor" /> Scaffolded</span>;
  if (status === 'Deprecated') return <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md"><X size={10} /> Deprecated</span>;
  if (status === 'Future') return <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md"><Sparkles size={10} /> Future</span>;
  return null;
}

function ModelBadge({ model }: { model: string }) {
  let colorClass = 'bg-gray-500/20 text-gray-400 border-gray-700/50';
  if (model.includes('Opus')) colorClass = 'bg-orange-900/40 text-orange-400 border-orange-800/50';
  else if (model.includes('Codex')) colorClass = 'bg-purple-900/40 text-purple-400 border-purple-800/50';
  else if (model.includes('Sonnet')) colorClass = 'bg-teal-900/40 text-teal-400 border-teal-800/50';
  else if (model.includes('Haiku')) colorClass = 'bg-pink-900/40 text-pink-400 border-pink-800/50';
  else if (model.includes('Gemini Flash')) colorClass = 'bg-blue-900/40 text-blue-400 border-blue-800/50';
  else if (model.includes('Gemini Pro')) colorClass = 'bg-blue-800/40 text-blue-300 border-blue-700/50';
  else if (model.includes('Nano Banana Pro')) colorClass = 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50';
  else if (model.includes('Minimax')) colorClass = 'bg-red-900/40 text-red-400 border-red-800/50';
  else if (model.includes('Kimi')) colorClass = 'bg-stone-800/40 text-stone-300 border-stone-700/50';
  else if (model.includes('Deepseek') || model.includes('DeepSeek')) colorClass = 'bg-indigo-900/40 text-indigo-400 border-indigo-800/50';
  else if (model.includes('Qwen')) colorClass = 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50';

  return <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${colorClass}`}>{model}</span>;
}
