import React from 'react';

export default function Docs() {
  return (
    <div className="flex h-full gap-6">
      <div className="w-64 flex-shrink-0 border-r border-[#333] pr-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Documentation</h3>
        <ul className="space-y-2 text-sm text-gray-400">
          <li className="text-yellow-500 font-medium">Overview</li>
          <li className="hover:text-gray-200 cursor-pointer">Architecture</li>
          <li className="hover:text-gray-200 cursor-pointer">Agent Framework</li>
          <li className="hover:text-gray-200 cursor-pointer">Memory System</li>
          <li className="hover:text-gray-200 cursor-pointer">Deployment</li>
        </ul>
      </div>
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold mb-6">MARC OS Overview</h1>
        <p className="text-gray-300 mb-4 leading-relaxed">
          MARC OS is an internal AI operations dashboard built to manage a team of autonomous agents. 
          It provides a single pane of glass for task tracking, organizational structure, agent memory, and inter-agent communication.
        </p>
        <h2 className="text-xl font-semibold mt-8 mb-4">Tech Stack</h2>
        <ul className="list-disc pl-5 text-gray-300 space-y-2">
          <li><strong>Frontend:</strong> React 19, TypeScript, Vite, Tailwind CSS</li>
          <li><strong>Agent Framework:</strong> OpenClaw</li>
          <li><strong>Voice/TTS:</strong> Edge TTS (Microsoft)</li>
          <li><strong>Infrastructure:</strong> Ubuntu VM, Markdown files for storage</li>
        </ul>
      </div>
    </div>
  );
}
