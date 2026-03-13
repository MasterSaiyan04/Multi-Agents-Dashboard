import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Circle, X, Sparkles } from 'lucide-react';

const orgStats = [
  { label: 'Chiefs', value: '5', color: 'text-yellow-500', border: 'border-yellow-500/30' },
  { label: 'Total Agents', value: '18', color: 'text-white', border: 'border-white/20' },
  { label: 'Active', value: '15', color: 'text-green-500', border: 'border-green-500/30', icon: <Check size={16} className="text-green-500 inline mr-1" /> },
  { label: 'Scaffolded', value: '3', color: 'text-yellow-500', border: 'border-yellow-500/30', icon: <Circle size={12} fill="currentColor" className="text-yellow-500 inline mr-1" /> },
  { label: 'Deprecated', value: '0', color: 'text-green-500', border: 'border-green-500/30', icon: <Check size={16} className="text-green-500 inline mr-1" /> },
];

const orgData = [
  {
    id: 'sales',
    chiefName: 'CRO AI',
    chiefModel: 'Claude Sonnet 4.6',
    chiefRole: 'Ventas',
    chiefColor: 'border-t-[#7F77DD]',
    chiefEmoji: '💼',
    description: 'Pipeline de adquisición MX + USA',
    departments: [
      {
        id: 'sales-0',
        title: 'Ventas',
        description: 'Pipeline de adquisición MX + USA',
        agents: [
          { name: 'The Lead Hunter', role: 'Scraping y calificación de leads', emoji: '🔍', status: 'Active', models: ['Gemini Lite'], frequency: 'Cada 6h', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The Demo Crafter', role: 'Scripts y propuestas por industria', emoji: '📝', status: 'Active', models: ['Gemini Flash'], frequency: 'Batch nocturno', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The Sales Closer', role: 'Negociación y manejo de objeciones', emoji: '🤝', status: 'Active', models: ['Claude Sonnet'], frequency: 'Reactivo', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The Follow-Up Agent', role: 'Seguimiento de leads fríos', emoji: '📞', status: 'Active', models: ['Gemini Lite'], frequency: 'Diario', markets: ['MX', 'USA'], isLLM: true }
        ]
      }
    ]
  },
  {
    id: 'dev',
    chiefName: 'CTO AI',
    chiefModel: 'Claude Sonnet 4.6',
    chiefRole: 'Dev & Infraestructura',
    chiefColor: 'border-t-[#1D9E75]',
    chiefEmoji: '⚙️',
    description: 'Construcción, automatización y estabilidad del sistema',
    departments: [
      {
        id: 'dev-0',
        title: 'Dev & Infraestructura',
        description: 'Construcción, automatización y estabilidad del sistema',
        agents: [
          { name: 'Workflow Engineer', role: 'Automaciones n8n y workflows', emoji: '🔄', status: 'Active', models: ['Claude Sonnet'], frequency: 'Bajo demanda', isLLM: true },
          { name: 'The Web Builder', role: 'Landing pages y assets digitales', emoji: '🌐', status: 'Active', models: ['Claude Sonnet'], frequency: 'Bajo demanda', isLLM: true },
          { name: 'The QA Pro', role: 'Testing y regression post-deploy', emoji: '🛡️', status: 'Active', models: ['Gemini Flash'], frequency: 'Post-deploy', isLLM: true },
          { name: 'The SRE', role: 'Monitoreo de servicios 24/7', emoji: '📈', status: 'Active', models: ['Gemini Lite'], frequency: 'Cada 30 min', isLLM: true },
          { name: 'The Systems Medic', role: 'Diagnóstico y respuesta incidentes', emoji: '🚑', status: 'Active', models: ['Claude Sonnet'], frequency: 'Reactivo', isLLM: true },
          { name: 'Security Module', role: 'Auditoría y checks de seguridad', emoji: '🔒', status: 'Scaffolded', models: ['— (sin LLM)'], frequency: 'n8n cron', isLLM: false }
        ]
      }
    ]
  },
  {
    id: 'cs',
    chiefName: 'CCO AI',
    chiefModel: 'Gemini Flash',
    chiefRole: 'Customer Success',
    chiefColor: 'border-t-[#378ADD]',
    chiefEmoji: '🎧',
    description: 'Onboarding, soporte y retención de clientes activos',
    departments: [
      {
        id: 'cs-0',
        title: 'Customer Success',
        description: 'Onboarding, soporte y retención de clientes activos',
        agents: [
          { name: 'The Router', role: 'Clasificación y enrutamiento tickets', emoji: '🔀', status: 'Active', models: ['Gemini Flash'], frequency: 'Tiempo real', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The Guide', role: 'Onboarding de clientes nuevos', emoji: '🗺️', status: 'Active', models: ['Gemini Flash'], frequency: '×4 por cliente', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The CS Agent', role: 'Soporte, retención y escalaciones', emoji: '💬', status: 'Active', models: ['Claude Sonnet'], frequency: '×10 por cliente', markets: ['MX', 'USA'], isLLM: true }
        ]
      }
    ]
  },
  {
    id: 'marketing',
    chiefName: 'CMO AI',
    chiefModel: 'Gemini Flash',
    chiefRole: 'Marketing & Contenido',
    chiefColor: 'border-t-[#D85A30]',
    chiefEmoji: '📣',
    description: 'Copy, posicionamiento e inteligencia de mercado',
    departments: [
      {
        id: 'marketing-0',
        title: 'Marketing & Contenido',
        description: 'Copy, posicionamiento e inteligencia de mercado',
        agents: [
          { name: 'The Copywriter', role: 'Copy, propuestas, LinkedIn, FAQ', emoji: '✍️', status: 'Active', models: ['Gemini Flash'], frequency: 'Bajo demanda', markets: ['MX', 'USA'], isLLM: true },
          { name: 'The Market Scout', role: 'Inteligencia competitiva', emoji: '🕵️', status: 'Active', models: ['Gemini Lite'], frequency: 'Semanal', markets: ['MX', 'USA'], isLLM: true }
        ]
      }
    ]
  },
  {
    id: 'finance',
    chiefName: 'CFO AI',
    chiefModel: 'Gemini Flash',
    chiefRole: 'Finance & Analytics',
    chiefColor: 'border-t-[#BA7517]',
    chiefEmoji: '📊',
    description: 'Revenue, métricas y control de costos',
    departments: [
      {
        id: 'finance-0',
        title: 'Finance & Analytics',
        description: 'Revenue, métricas y control de costos',
        agents: [
          { name: 'The Analyst', role: 'P&L · MRR · KPIs · Reporte a CEO', emoji: '📈', status: 'Active', models: ['Gemini Flash'], frequency: 'Diario', isLLM: true },
          { name: 'Analytics Pipeline', role: 'SQL, métricas y dashboards automáticos', emoji: '⚙️', status: 'Scaffolded', models: ['— (sin LLM)'], frequency: 'Cron diario', isLLM: false },
          { name: 'Token Monitor', role: 'Alertas de costo API en tiempo real', emoji: '🪙', status: 'Scaffolded', models: ['— (sin LLM)'], frequency: 'Webhook RT', isLLM: false }
        ]
      }
    ]
  }
];

const allDeptIds = orgData.flatMap(chief => chief.departments.map(d => d.id));

export default function OrgChart() {
  const [expanded, setExpanded] = useState<string[]>([]);
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'MX' | 'USA'>('ALL');

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

      {/* Market Filter */}
      <div className="flex justify-center gap-3 mb-10">
        <button 
          onClick={() => setMarketFilter('ALL')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-colors ${marketFilter === 'ALL' ? 'bg-gray-200/20 text-gray-200 border-gray-200/30' : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:border-gray-500'}`}
        >
          All Markets
        </button>
        <button 
          onClick={() => setMarketFilter('MX')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-colors ${marketFilter === 'MX' ? 'bg-green-500/20 text-green-500 border-green-500/30' : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:border-green-500/50'}`}
        >
          MX
        </button>
        <button 
          onClick={() => setMarketFilter('USA')}
          className={`px-4 py-1.5 rounded-md text-xs font-bold border transition-colors ${marketFilter === 'USA' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' : 'bg-[#1a1a1a] text-gray-500 border-[#333] hover:border-blue-500/50'}`}
        >
          USA
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Human */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#1a1a1a] border border-yellow-500/30 rounded-xl p-4 w-72 text-center relative z-10 shadow-[0_0_15px_rgba(234,179,8,0.1)] hover:border-yellow-500/60 transition-colors cursor-pointer">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-yellow-500 font-bold tracking-widest">Human CEO</div>
            <div className="w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2 mt-3 flex items-center justify-center text-2xl">👨🏻‍💻</div>
            <h3 className="font-semibold text-gray-200">Mijito</h3>
            <p className="text-xs text-gray-500 mt-1">Visión · Aprobaciones finales · Cierre de ventas clave</p>
          </div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
        </div>

        {/* COO */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#0a1f14] border border-[#5DCAA5]/30 rounded-xl p-4 w-80 text-center relative z-10 shadow-[0_0_15px_rgba(93,202,165,0.1)] hover:border-[#5DCAA5]/60 transition-colors cursor-pointer">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-[#5DCAA5] font-bold tracking-widest">Chief of Staff / AI Orchestrator</div>
            <div className="w-12 h-12 bg-[#5DCAA5]/20 rounded-full mx-auto mb-2 mt-3 flex items-center justify-center text-2xl">🔵</div>
            <h3 className="font-semibold text-gray-200">COO AI</h3>
            <p className="text-xs text-gray-500 mt-1">Delegación · Coordinación C-Suite · Reporte semanal</p>
            <div className="mt-2 flex justify-center gap-2 flex-wrap">
              <ModelBadge model="Claude Sonnet 4.6" />
            </div>
          </div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
        </div>

        {/* THE STRATEGIST (Direct Report) */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#111111] border-2 border-dashed border-[#5DCAA5]/50 rounded-xl p-4 w-72 text-center relative z-10 shadow-[0_0_15px_rgba(93,202,165,0.1)] hover:border-[#5DCAA5]/80 transition-colors cursor-pointer">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-[#5DCAA5] font-bold tracking-widest">Direct Report</div>
            <div className="w-10 h-10 bg-[#5DCAA5]/20 rounded-full mx-auto mb-2 mt-3 flex items-center justify-center text-xl">♟️</div>
            <h3 className="font-semibold text-gray-200">THE STRATEGIST</h3>
            <p className="text-xs text-gray-400 mt-1">Estrategia & Roadmap</p>
            <div className="mt-2 flex justify-center gap-2 flex-wrap">
              <ModelBadge model="Claude Sonnet 4.6" />
              <span className="text-[10px] px-1.5 py-0.5 rounded-md border bg-gray-800/50 text-gray-400 border-gray-700/50">Semanal + demanda</span>
            </div>
          </div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
          <div className="w-px h-6 bg-yellow-500/50"></div>
        </div>

        <div className="w-[1100px] h-px bg-yellow-500/50"></div>

        {/* Chiefs */}
        <div className="flex justify-between w-[1150px] mt-0 gap-4">
          {orgData.map((chief) => (
            <div key={chief.id} className="flex-1 flex flex-col items-center">
              <div className="w-px h-6 bg-yellow-500/50 mb-0"></div>
              <div className={`bg-[#111111] border-t-2 ${chief.chiefColor} border-x border-b border-[#333] rounded-xl p-4 w-full mb-4 shadow-lg hover:border-gray-500/50 transition-colors cursor-pointer`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-3xl">{chief.chiefEmoji}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg text-gray-200">{chief.chiefName}</h3>
                    </div>
                    <div className="text-[10px] text-yellow-500 font-bold tracking-widest mt-0.5">{chief.chiefRole}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed mb-3">{chief.description}</p>
                <ModelBadge model={chief.chiefModel} />
              </div>
              
              <div className="w-full space-y-3">
                {chief.departments.map(dept => (
                  <Department key={dept.id} {...dept} isExpanded={expanded.includes(dept.id)} onToggle={toggle} marketFilter={marketFilter} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center space-y-1">
        <p className="text-xs text-gray-500">Una empresa · Dos mercados · InstaDesk MX + RingVault USA</p>
        <p className="text-[10px] text-gray-600">Market context inyectado por agente — lógica condicional por mercado</p>
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

function Department({ id, title, description, count, agents, isExpanded, onToggle, marketFilter }: any) {
  return (
    <div className="bg-[#111111] border border-[#222] rounded-xl overflow-hidden shadow-sm hover:border-yellow-500/30 transition-colors">
      <div 
        className="flex justify-between items-center p-3 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
        onClick={() => onToggle(id)}
      >
        <h4 className="text-sm font-medium text-gray-200">{title}</h4>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-500">{agents?.length || count} agents</span>
          {isExpanded ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-[#222]">
          {description && <p className="text-xs text-gray-500 mb-4 mt-2 leading-relaxed">{description}</p>}
          <div className="space-y-2">
            {agents.map((agent: any, i: number) => {
              const isDimmed = marketFilter !== 'ALL' && (!agent.markets || !agent.markets.includes(marketFilter));
              return (
              <div key={i} className={`bg-[#1a1a1a] border ${agent.isLLM === false ? 'border-dashed border-gray-600/50' : 'border-[#333]'} rounded-lg p-3 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer ${isDimmed ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-xl">{agent.emoji}</div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div className="text-sm font-medium text-gray-200">{agent.name}</div>
                      <MarketBadge markets={agent.markets} />
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{agent.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={agent.status} />
                  {agent.models.map((m: string) => <ModelBadge key={m} model={m} isLLM={agent.isLLM} />)}
                  {agent.frequency && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md border bg-gray-800/30 text-gray-400 border-gray-700/50">
                      {agent.frequency}
                    </span>
                  )}
                </div>
              </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function MarketBadge({ markets }: { markets?: ('MX' | 'USA')[] }) {
  if (!markets || markets.length === 0) return null;
  
  if (markets.includes('MX') && markets.includes('USA')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30">MX · USA</span>;
  }
  if (markets.includes('MX')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-green-500/20 text-green-500 border border-green-500/30">MX</span>;
  }
  if (markets.includes('USA')) {
    return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-500 border border-blue-500/30">USA</span>;
  }
  return null;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'Active') return <span className="flex items-center gap-1 text-[10px] text-green-400 bg-green-500/10 border border-green-500/20 px-1.5 py-0.5 rounded-md"><Check size={10} /> Active</span>;
  if (status === 'Scaffolded') return <span className="flex items-center gap-1 text-[10px] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-md"><Circle size={8} fill="currentColor" /> Scaffolded</span>;
  if (status === 'Deprecated') return <span className="flex items-center gap-1 text-[10px] text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-md"><X size={10} /> Deprecated</span>;
  if (status === 'Future') return <span className="flex items-center gap-1 text-[10px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-1.5 py-0.5 rounded-md"><Sparkles size={10} /> Future</span>;
  return null;
}

function ModelBadge({ model, isLLM = true }: { model: string, isLLM?: boolean }) {
  if (isLLM === false || model === '— (sin LLM)') {
    return <span className="text-[10px] px-1.5 py-0.5 rounded-md border border-dashed bg-[#2a2a2a] text-[#9ca3af] border-gray-600/50">Sin LLM</span>;
  }

  let colorClass = 'bg-gray-500/20 text-gray-400 border-gray-700/50';
  if (model.includes('Claude Sonnet 4.6') || model === 'Claude Sonnet') colorClass = 'bg-[#1a3a5c] text-[#60a5fa] border-blue-800/50';
  else if (model.includes('Gemini Flash')) colorClass = 'bg-[#1a3d1f] text-[#4ade80] border-green-800/50';
  else if (model.includes('Gemini Lite')) colorClass = 'bg-[#1a3d1f] text-[#86efac] border-green-800/50';
  else if (model.includes('Opus')) colorClass = 'bg-orange-900/40 text-orange-400 border-orange-800/50';
  else if (model.includes('Codex')) colorClass = 'bg-purple-900/40 text-purple-400 border-purple-800/50';
  else if (model.includes('Sonnet')) colorClass = 'bg-teal-900/40 text-teal-400 border-teal-800/50';
  else if (model.includes('Haiku')) colorClass = 'bg-pink-900/40 text-pink-400 border-pink-800/50';
  else if (model.includes('Gemini Pro')) colorClass = 'bg-blue-800/40 text-blue-300 border-blue-700/50';
  else if (model.includes('Nano Banana Pro')) colorClass = 'bg-yellow-900/40 text-yellow-400 border-yellow-800/50';
  else if (model.includes('Minimax')) colorClass = 'bg-red-900/40 text-red-400 border-red-800/50';
  else if (model.includes('Kimi')) colorClass = 'bg-stone-800/40 text-stone-300 border-stone-700/50';
  else if (model.includes('Deepseek') || model.includes('DeepSeek')) colorClass = 'bg-indigo-900/40 text-indigo-400 border-indigo-800/50';
  else if (model.includes('Qwen')) colorClass = 'bg-emerald-900/40 text-emerald-400 border-emerald-800/50';

  return <span className={`text-[10px] px-1.5 py-0.5 rounded-md border ${colorClass}`}>{model}</span>;
}
