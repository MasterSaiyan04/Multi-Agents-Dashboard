import React, { useState } from 'react';
import { Play, Pause, CheckCircle } from 'lucide-react';

export default function Standup() {
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center border-b border-[#333] pb-4">
        <h2 className="text-2xl font-semibold">Executive Standup</h2>
        <div className="flex gap-2">
          <button className="px-4 py-1.5 bg-yellow-500/10 text-yellow-500 text-sm rounded-md font-medium">Meeting Archive</button>
          <button className="px-4 py-1.5 bg-[#2a2a2a] text-sm rounded-md hover:bg-[#333] transition-colors">+ New Standup</button>
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#333]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">Executive Standup: Partnership & Sponsorship Strategy</h3>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center text-[10px]">M</div> Marc</span>
                <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center text-[10px]">W</div> Warren</span>
                <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-pink-500/20 text-pink-500 flex items-center justify-center text-[10px]">G</div> Gary</span>
                <span className="flex items-center gap-1"><div className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-[10px]">E</div> Elon</span>
              </div>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>Tuesday, February 24, 2026</div>
              <div>11:15 AM EST</div>
            </div>
          </div>
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-md font-medium hover:bg-yellow-400 transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
        </div>

        <div className="p-6 space-y-6 bg-[#141414]">
          <ChatMessage 
            name="Marc" 
            role="COO" 
            color="green" 
            message="Alright team, let's get into it. Marcelo's getting inbound partnership requests — companies wanting to pay for links in videos, product mentions, that kind of thing. We've never monetized, so we need a proper pipeline. Not some janky thing we throw together — a real process. How do we handle this without selling out our soul? Warren, you're up first."
          />
          <ChatMessage 
            name="Warren" 
            role="CRO" 
            color="yellow" 
            message="Good. First thing I want to say — and I cannot stress this enough — The fact that we're getting inbound at 520 subscribers is a signal. It means our audience quality is high. These companies aren't reaching out because of volume; they're reaching out because our viewers are decision-makers, developers, people who actually buy tools. That's leverage. Don't forget that."
          />
          <ChatMessage 
            name="Gary" 
            role="CMO" 
            color="pink" 
            message="Facts. The engagement rate on our videos is way above average for the niche. Comments are from real practitioners, not drive-bys. That's the moat. And honestly? Most of these inbound requests are probably garbage — SEO farms wanting a dofollow link for $50. We need a filter that kills 90% of them before they waste Marcelo's time."
          />
          <ChatMessage 
            name="Marc" 
            role="COO" 
            color="green" 
            message="Agreed. So let's design that filter. Warren, what's the qualification process look like before we even think about sharing a rate card?"
          />
        </div>
      </div>

      <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <CheckCircle size={18} className="text-green-500" />
          Action Items
        </h3>
        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-sm text-gray-300">
            <input type="checkbox" defaultChecked className="mt-1 accent-yellow-500" />
            <span>Create `partnerships@instadesk.ai` alias in Google Workspace, forwarding to Marc's inbox with BCC to Marcelo.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-300">
            <input type="checkbox" defaultChecked className="mt-1 accent-yellow-500" />
            <span>Set up a partnership tracker JSON in our app directory to track status, company, product, dates, and outcome.</span>
          </li>
          <li className="flex items-start gap-3 text-sm text-gray-300">
            <input type="checkbox" className="mt-1 accent-yellow-500" />
            <span>Draft a "Warm Decline" template for SEO link farmers and irrelevant products.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function ChatMessage({ name, role, color, message }: { name: string, role: string, color: string, message: string }) {
  const colorMap: Record<string, string> = {
    green: 'text-green-400 bg-green-500/20',
    yellow: 'text-yellow-400 bg-yellow-500/20',
    pink: 'text-pink-400 bg-pink-500/20',
    blue: 'text-blue-400 bg-blue-500/20',
  };

  return (
    <div className="flex gap-4">
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm ${colorMap[color]}`}>
        {name.charAt(0)}
      </div>
      <div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="font-medium text-gray-200">{name}</span>
          <span className="text-[10px] text-gray-500 bg-[#222] px-1.5 py-0.5 rounded">{role}</span>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
