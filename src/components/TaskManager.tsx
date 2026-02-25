import React from 'react';

const stats = [
  { label: 'Active', value: '0', color: 'text-green-500' },
  { label: 'Idle', value: '4', color: 'text-yellow-500' },
  { label: 'Total Sessions', value: '50', color: 'text-white' },
  { label: 'Tokens Used', value: '7.6M', color: 'text-blue-400' },
  { label: 'Total Cost', value: '$62.96', color: 'text-red-400' },
];

const models = [
  { name: 'Claude Opus 4.6', desc: 'Primary Brain - conversations, research, heavy lifting, coding', status: 'Active', cost: '$45.30', tokens: '3.2M' },
  { name: 'Claude Opus 4.5 (Antigravity)', desc: 'Fallback API - Opus on Google Cloud (GCP) via Anti-Gravity OAuth', status: 'Active', cost: '$12.10', tokens: '1.1M' },
  { name: 'Gemini 3 Pro Preview', desc: 'Fallback #2 - Fast fallback when Claude is struggling', status: 'Active', cost: '$2.40', tokens: '800K' },
  { name: 'GPT 5.3-Codex', desc: 'Clearmud Hub (customer-facing code)', status: 'Active', cost: '$1.20', tokens: '400K' },
  { name: 'Gemini 3 Flash', desc: 'Community agents (Clay, Link, Vibe) - fast, lightweight tasks', status: 'Active', cost: '$0.80', tokens: '1.5M' },
  { name: 'Nano Banana Pro', desc: 'Image generation - gemini 3 pro image preview', status: 'Active', cost: '$1.16', tokens: '200 images' },
];

export default function TaskManager() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Task Manager</h2>
        <p className="text-sm text-gray-500">Last refreshed: 4:22:03 PM</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6 flex flex-col items-center justify-center">
            <span className={`text-4xl font-bold mb-2 ${stat.color}`}>{stat.value}</span>
            <span className="text-sm text-gray-400 uppercase tracking-wider">{stat.label}</span>
          </div>
        ))}
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-yellow-500/20 flex items-center justify-center text-yellow-500 text-xs font-bold">M</span>
          Model Fleet
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {models.map((model, i) => (
            <div key={i} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5 hover:border-gray-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-200">{model.name}</h4>
              </div>
              <p className="text-xs text-gray-500 mb-6 h-8 leading-relaxed">{model.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-green-500 bg-green-500/10 px-2 py-1 rounded font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                  {model.status}
                </div>
                <div className="flex gap-4 text-gray-400 font-mono">
                  <span>{model.tokens}</span>
                  <span>{model.cost}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
         <h3 className="text-lg font-medium mb-4 flex items-center gap-2 mt-8">
          <span className="w-5 h-5 rounded bg-green-500/20 flex items-center justify-center text-green-500 text-xs font-bold">A</span>
          Active Sessions
        </h3>
        <div className="space-y-3">
          <div className="bg-[#1a1a1a] border border-green-500/30 rounded-xl p-4 flex justify-between items-center">
             <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                   <h4 className="font-medium text-gray-200">A new session was started via Json or Jrest. Greet the s...</h4>
                </div>
                <div className="text-xs text-gray-500 flex gap-3 ml-4">
                   <span className="text-green-400">Claude Opus 4.6</span>
                   <span>1m ago</span>
                   <span>delivery-preview</span>
                </div>
             </div>
             <div className="text-right font-mono text-xs text-gray-400">
                <div>4.00</div>
                <div>$16.01</div>
             </div>
          </div>
          
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 flex justify-between items-center opacity-70">
             <div>
                <div className="flex items-center gap-2 mb-1">
                   <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                   <h4 className="font-medium text-gray-200">Cram Link YouTube Watcher</h4>
                </div>
                <div className="text-xs text-gray-500 flex gap-3 ml-4">
                   <span className="text-gray-400">GPT 5.3-Codex</span>
                   <span>1h ago</span>
                </div>
             </div>
             <div className="text-right font-mono text-xs text-gray-400">
                <div>78.2K</div>
                <div>$0.0000</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
