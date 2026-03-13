import React from 'react';
import { Clock, Moon, CheckCircle2, Wrench } from 'lucide-react';

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
  { name: 'GPT 5.3-Codex', desc: 'InstaDesk Hub (customer-facing code)', status: 'Active', cost: '$1.20', tokens: '400K' },
  { name: 'Gemini 3 Flash', desc: 'Community agents (Clay, Link, Vibe) - fast, lightweight tasks', status: 'Active', cost: '$0.80', tokens: '1.5M' },
  { name: 'Nano Banana Pro', desc: 'Image generation - gemini 3 pro image preview', status: 'Active', cost: '$1.16', tokens: '200 images' },
];

const activeSessions = [
  { 
    title: 'A new session was started via /new or /reset. Greet the u...', 
    status: 'active', 
    models: ['claude-opus-4-6', 'gemini-3-flash-preview', 'delivery-mirror'], 
    time: '26s ago', 
    tokens: '4.0M', 
    cost: '$56.01',
    log: '<final>HEARTBEAT_OK</final>',
    logTime: 'Feb 10 - 8:40 AM'
  },
  { 
    title: 'Cron: Link Youtube Watcher', 
    status: 'idle', 
    models: ['gemini-3-flash-preview'], 
    time: '3m ago', 
    tokens: '78.3K', 
    cost: '$0.0000',
    log: 'HEARTBEAT_OK',
    logTime: 'Feb 10 - 4:50 PM'
  },
  { 
    title: 'Cron: Link Youtube Watcher', 
    status: 'idle', 
    models: ['gemini-3-flash-preview'], 
    time: '13m ago', 
    tokens: '120.5K', 
    cost: '$0.0000',
    log: 'HEARTBEAT_OK',
    logTime: 'Feb 10 - 4:40 PM'
  },
  { 
    title: 'Cron: Link Youtube Watcher', 
    status: 'idle', 
    models: ['gemini-3-flash-preview', 'claude-opus-4-6'], 
    time: '22m ago', 
    tokens: '139.1K', 
    cost: '$0.330',
    log: "Still SCHEDULED, already in 'scheduled_streams'. No status change. HEARTBEAT_OK",
    logTime: 'Feb 10 - 4:30 PM'
  },
  { 
    title: 'Cron: Link Youtube Watcher', 
    status: 'inactive', 
    models: ['gemini-3-flash-preview'], 
    time: '2h ago', 
    tokens: '78.8K', 
    cost: '$0.0000',
    log: '<final>HEARTBEAT_OK</final>',
    logTime: 'Feb 10 - 2:40 PM'
  },
  { 
    title: 'Cron: Link Youtube Watcher', 
    status: 'inactive', 
    models: ['gemini-3-flash-preview'], 
    time: '2h ago', 
    tokens: '82.3K', 
    cost: '$0.0000',
    log: 'HEARTBEAT_OK',
    logTime: 'Feb 10 - 2:30 PM'
  },
];

const cronJobs = [
  { title: 'Nightly $1B Research', desc: 'Search for next $1B one-person AI venture. Plan prototype. Delegate build to engineering sub-agent v...', time: '3:00 AM WET', duration: '~15-25 min', tag: 'LAB', tagColor: 'text-green-400 border-green-900/50 bg-green-900/20', actions: ['Research report', 'Prototype (delegated)'] },
  { title: 'InstaDesk HQ Surprise', desc: 'Design a surprise feature for InstaDesk HQ. Delegate build to Pixel/Anvil sub-agent.', time: '4:00 AM WET', duration: '~15-20 min', tag: 'LAB', tagColor: 'text-green-400 border-green-900/50 bg-green-900/20', actions: ['Feature design', 'Build (delegated)'] },
  { title: 'InstaDesk HQ Self-Improvement', desc: 'Identify and design improvements for InstaDesk HQ. Delegate build to engineering sub-agent.', time: '4:30 AM WET', duration: '~15-20 min', tag: 'LAB', tagColor: 'text-green-400 border-green-900/50 bg-green-900/20', actions: ['Improvement design', 'Build (delegated)'] },
  { title: 'GitHub Backup (Every 12h)', desc: 'Git commit and push entire workspace to instadesk/marc-bot. Disaster recovery.', time: '5:00 AM + 5:00 PM WET', duration: '~1-2 min', tag: 'OPS', tagColor: 'text-gray-400 border-gray-700/50 bg-gray-800/20', actions: ['Git commit', 'Push to GitHub'] },
  { title: 'Morning Lab Brief', desc: 'Comprehensive overnight report via email (marcelo@instadesk.ai) + Telegram teaser. Covers ideas, buil...', time: '8:00 AM WET', duration: '~3-5 min', tag: 'BRAIN', tagColor: 'text-blue-400 border-blue-900/50 bg-blue-900/20', actions: ['Email brief', 'Telegram teaser'] },
  { title: 'Link: YouTube Watcher', desc: 'Poll InstaDesk YouTube RSS feed. Post new videos to Discord #youtube-videos + #announcements.', time: 'Every hour', duration: '~1 min', tag: 'COMMUNITY', tagColor: 'text-purple-400 border-purple-900/50 bg-purple-900/20', actions: ['Discord video announcement', 'seen_videos.json update'] },
  { title: 'Beacon: Community Support', desc: 'Check Discord #introductions and #questions. Welcome new members, answer unanswered questions.', time: 'Every 2 hours', duration: '~1 min', tag: 'COMMUNITY', tagColor: 'text-purple-400 border-purple-900/50 bg-purple-900/20', actions: ['Welcome messages', 'Support responses'] },
  { title: 'Vibe: Daily Engagement', desc: 'Post daily engagement prompt in Discord #chat. Rotates through 17 template categories (Tool Tuesday,...', time: '10:00 AM WET', duration: '~1 min', tag: 'COMMUNITY', tagColor: 'text-purple-400 border-purple-900/50 bg-purple-900/20', actions: ['Engagement post in #chat', 'engagement-state.json update'] },
  { title: 'Heartbeat', desc: 'Gateway heartbeat poll. Checks HEARTBEAT.md for pending tasks. Proactive work during quiet hours.', time: 'Every 30 min', duration: '~30 sec', tag: 'OPS', tagColor: 'text-gray-400 border-gray-700/50 bg-gray-800/20', actions: ['HEARTBEAT_OK or task execution'] },
];

const overnightLogs = [
  { 
    icon: '💡', 
    title: 'Org Chart Grid Background — Command Center Polish', 
    tag: 'Self Improvement', 
    status: 'Completed', 
    desc: 'Human requested a grid background for the Org Chart page to give it more command center energy. Implemented phosphor grid backdrop with amber tint (matches Ops module accent), fixed theme logic to properly default to dark mode (MARC OS is dark-first). CSS was already defined but wasn\'t being used in the component — added the necessary classes and backdrop div. Grid uses 40px spacing with subtle amber lines.',
    date: '2026-02-10'
  },
  { 
    icon: '💡', 
    title: 'Script Vault 🗄️ — Browse & Manage YouTube Scripts', 
    tag: 'MARC OS-Feature', 
    status: 'Completed', 
    desc: 'Human writes scripts via /youtube-script command but they were invisible files in youtube/scripts/ with no UI to browse, track status, or link to published videos. This new page transforms the scripts folder into a proper content archive: (1) Grid of script cards with title, date, word count, estimated duration; (2) Status tracking with 5 stages — Draft → Ready to Film → Filming → Published → Scrapped; (3) YouTube linking — connect scripts to published videos, auto-sets status to Published; (4) Search and filter by title, status, date, word count; (5) Sort by newest/oldest, most/least words; (6) Grid/list view toggle; (7) Full preview modal with script content, status controls, YouTube link management; (8) Stats dashboard showing total scripts, published count, drafts, average words, total words; (9) Script metadata parsing — extracts approved title, target length from markdown;',
    date: '2026-02-09'
  },
  { 
    icon: '💡', 
    title: 'Prototype Fleet Dashboard Widget — Quick Prototype Status at a Glance', 
    tag: 'Self Improvement', 
    status: 'Completed', 
    desc: 'Human has 7 prototypes running overnight on ports 7300-7306 but had to navigate to /prototypes page every morning to see status. This improvement adds a compact Prototype Fleet widget to the Dashboard showing: (1) Running/stopped count with green/red status dots and phosphor glow; (2) Compact grid of all prototypes with name and port number; (3) One-click Open links to launch each prototype in new tab; (4) Expandable view (shows 3 by default, click to show all 7); (5) Auto-refresh every 2 minutes; (6) Footer link to full Prototype Lab page. Uses Lab module accent color (matrix green) for styling. Reduces morning review friction by surfacing critical prototype status on the main dashboard.',
    date: '2026-02-07'
  },
  { 
    icon: '💡', 
    title: 'Content Cascade 🌊 — Visual Content Multiplier Tracker', 
    tag: 'MARC OS-Feature', 
    status: 'Completed', 
    desc: 'Every YouTube video should cascade into 14+ content pieces. This new page provides visibility into that process. Features: (1) Source video selector — pick any video to see its cascade; (2) Visual flow diagram with YouTube at top branching to 8 platform types (LinkedIn, X/Twitter, Substack, Newsletter, Blog, Threads, Shorts, Quotes); (3) 5 status states with color coding (Published, Scheduled, In Review, Draft, Pending); (4) Filter pills to see only pending/draft/etc; (5) Progress bars per video showing cascade completion %; (6) Multiplier stat in header (e.g. 7.3x); (7) Platform badges with brand colors; (8) Philosophy card explaining the 14x content strategy. Currently uses mock data — ready for backend integration.',
    date: '2026-02-07'
  },
  { 
    icon: '🔧', 
    title: 'Usage Monitor Dashboard Widget — Claude Code Max Tracking', 
    tag: 'Feature', 
    status: 'Completed', 
    desc: 'Human hit 100% Claude Code Max limit this week and had to fall back to Gemini (lower quality). Added a Usage Monitor component to the Dashboard showing today\'s token usage vs 14% daily cap with progress bar, weekly totals (tokens, cost, requests), and alert state when over 80% of cap. Uses Ops module amber accent with phosphor glow. Auto-refreshes every 5 minutes via /api/usage-monitor endpoint that runs the usage-monitor.py script.',
    date: '2026-02-07'
  },
  { 
    icon: '💡', 
    title: 'Prototype Lab — Visual Prototype Management Dashboard', 
    tag: 'Self Improvement', 
    status: 'Building', 
    desc: 'MARC OS generates $1B idea prototypes overnight that run as systemd services on ports 7300-7399, but there is NO UI to manage them. Human has to check prototypes/registry.json manually, run systemctl commands, and remember port numbers. This improvement adds a dedicated /prototypes page to the Lab module with: (1) Header stats — X running, X/100 ports used, Sunday cleanup countdown; (2) Grid of prototype cards (2-col md, 3-col lg) showing title, port as clickable link (http://192.168.1.112:PORT), status dot (green running, red stopped, yellow pending) via real-time systemctl checks, created date + age, and idea score badge; (3) Quick actions per card — Open (window.open), Restart (POST /api/prototypes/:name/restart), Archive (confirm + stop service + update registry); (4) New nav item in Lab module sidebar. API endpoints check systemctl --user is-active for real-time service status.',
    date: '2026-02-06'
  },
];

export default function TaskManager() {
  return (
    <div className="max-w-[1200px] mx-auto space-y-10 pb-12">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Task Manager</h2>
        <p className="text-sm text-gray-500">Last refreshed: 4:22:03 PM</p>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111111] border border-[#333] rounded-xl p-6 flex flex-col items-center justify-center shadow-lg hover:border-gray-600 transition-colors">
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
            <div key={i} className="bg-[#111111] border border-[#333] rounded-xl p-5 hover:border-yellow-500/50 transition-colors shadow-lg group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-200 group-hover:text-yellow-500 transition-colors">{model.name}</h4>
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
          <span className="text-xl">🛰️</span>
          Active Sessions <span className="text-xs bg-[#222] text-gray-400 px-2 py-0.5 rounded-full ml-1">50</span>
        </h3>
        <div className="space-y-3">
          {activeSessions.map((session, i) => {
            let statusColor = 'bg-gray-500';
            let borderColor = 'border-[#333]';
            let opacity = 'opacity-100';
            
            if (session.status === 'active') {
              statusColor = 'bg-green-500 animate-pulse';
              borderColor = 'border-green-500/30 border-l-2 border-l-green-500';
            } else if (session.status === 'idle') {
              statusColor = 'bg-yellow-500';
              borderColor = 'border-yellow-500/30 border-l-2 border-l-yellow-500';
            } else {
              statusColor = 'bg-gray-500';
              borderColor = 'border-[#333] border-l-2 border-l-gray-500';
              opacity = 'opacity-60';
            }

            return (
              <div key={i} className={`bg-[#111111] ${borderColor} rounded-xl p-4 hover:border-yellow-500/50 hover:bg-[#1a1a1a] transition-colors cursor-pointer ${opacity}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-3 h-3 rounded-full ${statusColor} shadow-[0_0_8px_currentColor]`}></span>
                      <h4 className="font-medium text-gray-200 text-base">{session.title}</h4>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-3 ml-6">
                      <div className="flex gap-2">
                        {session.models.map(m => (
                          <span key={m} className={`px-2 py-0.5 rounded-md border ${m.includes('opus') ? 'bg-blue-900/20 text-blue-400 border-blue-800/30' : 'bg-cyan-900/20 text-cyan-400 border-cyan-800/30'}`}>
                            {m}
                          </span>
                        ))}
                      </div>
                      <span>{session.time}</span>
                    </div>
                  </div>
                  <div className="text-right flex gap-6">
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm text-gray-300 font-bold">{session.tokens}</span>
                      <span className="text-[10px] text-gray-500 tracking-widest uppercase">Tokens</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-mono text-sm text-yellow-500 font-bold">{session.cost}</span>
                      <span className="text-[10px] text-gray-500 tracking-widest uppercase">Cost</span>
                    </div>
                  </div>
                </div>
                <div className="ml-6 mt-3 bg-[#0a0a0a] border border-[#222] rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                    <span>🗂️</span>
                    <span className="truncate max-w-[600px]">{session.log}</span>
                  </div>
                  <span className="text-[10px] text-gray-600 whitespace-nowrap">{session.logTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2 mt-12">
          <span className="text-xl">⏰</span>
          Cron Monitor <span className="text-xs bg-[#222] text-gray-400 px-2 py-0.5 rounded-full ml-1">10</span>
        </h3>
        
        <h4 className="text-sm font-medium text-gray-400 mb-3 mt-6">Daily Jobs</h4>
        <div className="space-y-2">
          {cronJobs.map((job, i) => (
            <div key={i} className="bg-[#111111] border border-[#333] rounded-lg p-3 flex justify-between items-center hover:border-yellow-500/50 transition-colors cursor-pointer group">
              <div className="flex items-start gap-3 flex-1">
                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
                <div>
                  <h4 className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">{job.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[500px]">{job.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex flex-col items-end">
                  <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                    <Clock size={12} className="text-gray-500" />
                    {job.time}
                  </div>
                  <span className="text-[10px] text-gray-600">{job.duration}</span>
                </div>
                <div className={`text-[10px] font-bold tracking-wider px-2 py-1 rounded border ${job.tagColor}`}>
                  {job.tag}
                </div>
                <div className="flex gap-2 w-[240px] justify-end">
                  {job.actions.map((action, j) => (
                    <span key={j} className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#222] px-2 py-1 rounded truncate max-w-[120px]">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <h4 className="text-sm font-medium text-gray-400 mb-3 mt-8">Weekly Jobs</h4>
        <div className="bg-[#111111] border border-[#333] rounded-lg p-3 flex justify-between items-center hover:border-yellow-500/50 transition-colors cursor-pointer group">
          <div className="flex items-start gap-3 flex-1">
            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
            <div>
              <h4 className="font-medium text-gray-200 text-sm group-hover:text-white transition-colors">Weekly Review (Friday)</h4>
              <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[500px]">Comprehensive weekly review: backlog status, idea patterns, prototype cleanup, division health check...</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs text-gray-300 font-medium">
                <Clock size={12} className="text-gray-500" />
                Friday 2:00 PM WET
              </div>
              <span className="text-[10px] text-gray-600">~5-10 min</span>
            </div>
            <div className="text-[10px] font-bold tracking-wider px-2 py-1 rounded border text-blue-400 border-blue-900/50 bg-blue-900/20">
              BRAIN
            </div>
            <div className="flex gap-2 w-[240px] justify-end">
              <span className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#222] px-2 py-1 rounded">Email review</span>
              <span className="text-[10px] text-gray-500 bg-[#1a1a1a] border border-[#222] px-2 py-1 rounded">Telegram teaser</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-6 flex items-center gap-2 mt-12">
          <span className="text-xl">🌙</span>
          Overnight Log <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full ml-1">25</span>
        </h3>
        
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-3 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#333] before:to-transparent">
          {overnightLogs.map((log, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-6 h-6 rounded-full border border-[#333] bg-[#111111] text-gray-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                <div className="w-2 h-2 rounded-full bg-gray-600 group-hover:bg-yellow-500 transition-colors"></div>
              </div>
              
              <div className="w-[calc(100%-3rem)] md:w-[calc(50%-1.5rem)] bg-[#111111] border border-[#333] rounded-xl p-5 hover:border-yellow-500/30 transition-colors shadow-lg group-hover:shadow-[0_0_15px_rgba(234,179,8,0.05)] cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-200 text-sm flex items-center gap-2">
                    <span>{log.icon}</span>
                    {log.title}
                  </h4>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-500">{log.tag}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${log.status === 'Completed' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                      {log.status}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed mt-3">{log.desc}</p>
                <div className="mt-4 text-[10px] text-gray-600 font-mono">{log.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
