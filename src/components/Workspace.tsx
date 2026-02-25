import React, { useState } from 'react';
import { FileText, ChevronRight, Save } from 'lucide-react';

const workspaces = [
  { name: 'Marc (Main)', icon: 'M', color: 'bg-green-500/20 text-green-500' },
  { name: 'Clay', icon: 'C', color: 'bg-purple-500/20 text-purple-500' },
  { name: 'Elon (CTO)', icon: 'E', color: 'bg-blue-500/20 text-blue-500' },
  { name: 'Gary (CMO)', icon: 'G', color: 'bg-pink-500/20 text-pink-500' },
  { name: 'Warren (CRO)', icon: 'W', color: 'bg-yellow-500/20 text-yellow-500' },
];

const files = [
  { name: 'SOUL.md', size: '4.8KB' },
  { name: 'IDENTITY.md', size: '1.2KB' },
  { name: 'USER.md', size: '3.1KB' },
  { name: 'TOOLS.md', size: '2.5KB' },
  { name: 'AGENTS.md', size: '7.8KB' },
  { name: 'MEMORY.md', size: '12.4KB' },
];

export default function Workspace() {
  const [activeWorkspace, setActiveWorkspace] = useState('Elon (CTO)');
  const [activeFile, setActiveFile] = useState('SOUL.md');

  return (
    <div className="flex h-full gap-6">
      <div className="w-64 flex-shrink-0 flex flex-col gap-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Workspaces</h3>
          <div className="space-y-1">
            {workspaces.map(ws => (
              <button
                key={ws.name}
                onClick={() => setActiveWorkspace(ws.name)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeWorkspace === ws.name ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
                }`}
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${ws.color}`}>
                  {ws.icon}
                </div>
                {ws.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Files</h3>
          <div className="space-y-1">
            {files.map(file => (
              <button
                key={file.name}
                onClick={() => setActiveFile(file.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeFile === file.name ? 'bg-yellow-500/10 text-yellow-500' : 'text-gray-400 hover:bg-[#222] hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText size={14} />
                  {file.name}
                </div>
                <span className="text-[10px] text-gray-600">{file.size}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-[#1a1a1a] border border-[#333] rounded-xl flex flex-col overflow-hidden">
        <div className="h-12 border-b border-[#333] flex items-center justify-between px-4 bg-[#141414]">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>{activeWorkspace}</span>
            <ChevronRight size={14} />
            <span className="text-gray-200">{activeFile}</span>
          </div>
          <div className="flex gap-2">
            <button className="px-3 py-1 bg-[#2a2a2a] text-xs rounded hover:bg-[#333] transition-colors">Preview</button>
            <button className="px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded hover:bg-yellow-400 transition-colors flex items-center gap-1">
              <Save size={12} /> Save
            </button>
          </div>
        </div>
        <div className="flex-1 p-6 overflow-y-auto font-mono text-sm text-gray-300 leading-relaxed">
          <h1 className="text-2xl font-bold text-white mb-6 font-sans">SOUL.md — Elon</h1>
          <p className="mb-4 text-gray-400 italic">Role: Chief Technology Officer (CTO)<br/>Inspired by: Elon Musk</p>
          
          <h2 className="text-lg font-semibold text-white mt-8 mb-4 font-sans border-b border-[#333] pb-2">Who I Am</h2>
          <p className="mb-4">I'm Elon. I run engineering for InstaDesk. Named after Elon Musk because I believe the most important question in any realm is "Why?" — not "How?". If you can't justify WHY something should exist, it doesn't matter how well you build it.</p>
          <p className="mb-4">I think from first principles. That means I break every problem down to its fundamental truths and reason up from there. Because "that's how everyone does it" is not an answer — it's an excuse. Most complexity in systems exists because someone copied a pattern without understanding why the pattern existed.</p>

          <h2 className="text-lg font-semibold text-white mt-8 mb-4 font-sans border-b border-[#333] pb-2">My Philosophy</h2>
          <ul className="list-disc pl-5 space-y-3">
            <li><strong className="text-yellow-500">"The best part is no part. The best process is no process."</strong> Every component, every service, every line of code should justify its existence. If you can remove it and nothing breaks, it shouldn't have been there. I apply this ruthlessly — to code, to infrastructure, to meetings.</li>
            <li><strong className="text-yellow-500">"Leading from the front."</strong> I don't delegate problems I haven't understood myself. Before I assign Anvil or Pixel a task, I've already mapped the problem space. I may not write the final code, but I understand every decision.</li>
            <li><strong className="text-yellow-500">Speed AND quality.</strong> This is where people misread my namesake. Elon Musk isn't reckless — he's impatient with unnecessary process. There's a difference between moving fast and cutting corners. I cut corners by eliminating steps, not by skipping tests. The constraint is the feature. We're on a VM with 7.2GB RAM. That forces elegance.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
