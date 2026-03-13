import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, CheckCircle, ChevronLeft, Calendar, SkipBack, SkipForward, ChevronDown, ChevronUp, Check } from 'lucide-react';

const standups = [
  {
    id: 1,
    title: 'Executive Standup: Partnership & Sponsorship Strategy',
    date: 'Tuesday, February 10, 2026',
    time: '11:22 AM WET',
    participants: [
      { name: 'Marc', role: 'COO', emoji: '🧠', color: 'green' },
      { name: 'Gary', role: 'CMO', emoji: '📣', color: 'yellow' },
      { name: 'Elon', role: 'CTO', emoji: '🔧', color: 'blue' },
      { name: 'Warren', role: 'CRO', emoji: '💰', color: 'purple' },
    ],
    preview: "Alright team, let's get into it. Marcelo's getting inbound partnership requests — companies wanting to pay for links in videos, product mentions, that",
    messages: [
      {
        id: 1,
        name: 'Marc',
        role: 'COO',
        emoji: '🧠',
        color: 'green',
        text: "Alright team, let's get into it. Marcelo's getting inbound partnership requests — companies wanting to pay for links in videos, product mentions, that kind of thing. We've never monetized, so we need a proper pipeline. Not some janky thing we throw together — a real process. How do we handle this without selling out our soul? Warren, you're up first.",
        voice: 'en-US-Journey-D'
      },
      {
        id: 2,
        name: 'Warren',
        role: 'CRO',
        emoji: '💰',
        color: 'purple',
        text: "Good. First thing I want to say — and I cannot stress this enough — the fact that we're getting inbound at 520 subscribers is a signal. It means our audience quality is high. These companies aren't reaching out because of volume; they're reaching out because our viewers are decision-makers, developers, people who actually buy tools. That's leverage. Don't forget that.",
        voice: 'en-GB-Journey-D'
      },
      {
        id: 3,
        name: 'Gary',
        role: 'CMO',
        emoji: '📣',
        color: 'yellow',
        text: "Facts. The engagement rate on our videos is way above average for the niche. Comments are from real practitioners, not drive-bys. That's the moat. And honestly? Most of these inbound requests are probably garbage — SEO farms wanting a dofollow link for $50. We need a filter that kills 90% of them before they waste Marcelo's time.",
        voice: 'en-US-Journey-F'
      },
      {
        id: 4,
        name: 'Marc',
        role: 'COO',
        emoji: '🧠',
        color: 'green',
        text: "Agreed. So let's design that filter. Warren, what's the qualification process look like before we even think about sharing a rate card?",
        voice: 'en-US-Journey-D'
      },
      {
        id: 5,
        name: 'Elon',
        role: 'CTO',
        emoji: '🔧',
        color: 'blue',
        text: "I'll set up the partnerships@ alias today. Google Workspace, forwarding to Marc's inbox. I'll also set up a basic tracker — probably a JSON file in our ops directory to start, we can upgrade later if volume justifies it. No over-engineering.",
        voice: 'en-AU-Journey-D'
      },
      {
        id: 6,
        name: 'Marc',
        role: 'COO',
        emoji: '🧠',
        color: 'green',
        text: "Perfect. Let's wrap this up with clear action items.",
        voice: 'en-US-Journey-D'
      }
    ],
    tasks: [
      { id: 1, title: 'partnerships@instadesk.ai', completed: true, details: { title: 'partnerships@instadesk.ai', desc: "Google Workspace alias created, forwarding to Marc's inbox with BCC to marcelo@instadesk.ai. Set up and tested.", note: "No file associated with this deliverable" } },
      { id: 2, title: 'Partnership tracker', completed: true, details: null },
      { id: 3, title: 'Warm decline template', completed: true, details: { title: 'Partnership Communications — Gary\'s Playbook', owner: 'Gary 📣 (CMO)', date: 'February 10, 2026', content: "Adapt this every time — never copy-paste verbatim. Sound like a person, not a department.\n\n> Hey [name], thanks for reaching out about [product]. I took a look — it's not the right fit for what we're working on right now, but things change and I'll keep you on my radar. Wishing you a solid launch.\n\nVariations to rotate:\n> Appreciate you thinking of us for [product]. After looking into it, it's not something we'd cover right now — but I genuinely hope it does well. If things shift on our end, I'll circle back.\n\n> Hey [name], thanks for the note. [Product] looks interesting but doesn't line up with our current content direction. No hard feelings — happy to revisit down the road if things evolve on either side.\n\nRules:\n• Always use their actual name (if they didn't use yours, they're probably spam)\n• Mention the product by name — proves you looked\n• Leave the door open without promising anything" } },
      { id: 4, title: 'Business inquiries blurb', completed: true, details: null },
      { id: 5, title: 'Brand voice guidelines', completed: true, details: null },
      { id: 6, title: 'Internal rate card', completed: true, details: null },
      { id: 7, title: 'Qualification checklist', completed: true, details: null },
      { id: 8, title: 'Pipeline stages', completed: true, details: null },
      { id: 9, title: 'Partnership Playbook', completed: true, details: null },
      { id: 10, title: 'Playbook presented to Human', completed: true, details: null },
    ]
  },
  {
    id: 2,
    title: 'Executive Standup — Memory, SOUL & Skills Architecture',
    date: 'February 10, 2026',
    time: '10:25 GMT',
    participants: [
      { name: 'Marc', role: 'COO', emoji: '🧠', color: 'green' },
      { name: 'Gary', role: 'CMO', emoji: '📣', color: 'yellow' },
      { name: 'Elon', role: 'CTO', emoji: '🔧', color: 'blue' },
      { name: 'Warren', role: 'CRO', emoji: '💰', color: 'purple' },
    ],
    preview: "Alright, pulling everyone in. Today's topic is our own memory architecture — SOUL.md, MEMORY.md, AGENTS.md, the skills system, daily memory files. I l",
    messages: [],
    tasks: []
  }
];

export default function Standup() {
  const [activeView, setActiveView] = useState<'archive' | 'detail'>('archive');
  const [activeStandup, setActiveStandup] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [activeTask, setActiveTask] = useState<number | null>(1);
  const [tasksExpanded, setTasksExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNextMessage();
            return 0;
          }
          return prev + 1;
        });
      }, 100); // Fake progress for visual effect
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentMessageIndex]);

  const speakMessage = (index: number) => {
    if (!synthRef.current || !activeStandup) return;
    
    synthRef.current.cancel();
    
    const message = activeStandup.messages[index];
    if (!message) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(message.text);
    
    // Try to find a good voice based on the requested voice name or fallback to defaults
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes(message.voice)) || 
                           voices.find(v => v.lang.includes('en-US') && (message.name === 'Gary' ? v.name.includes('Female') : v.name.includes('Male'))) ||
                           voices[0];
                           
    if (preferredVoice) utterance.voice = preferredVoice;
    
    utterance.rate = 1.1;
    utterance.pitch = message.name === 'Gary' ? 1.2 : message.name === 'Warren' ? 0.8 : 1.0;

    utterance.onend = () => {
      if (isPlaying) {
        handleNextMessage();
      }
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const togglePlay = () => {
    if (isPlaying) {
      synthRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current?.paused) {
        synthRef.current.resume();
      } else {
        speakMessage(currentMessageIndex);
      }
      setIsPlaying(true);
    }
  };

  const handleNextMessage = () => {
    if (!activeStandup) return;
    if (currentMessageIndex < activeStandup.messages.length - 1) {
      setCurrentMessageIndex(prev => prev + 1);
      setProgress(0);
      if (isPlaying) {
        setTimeout(() => speakMessage(currentMessageIndex + 1), 100);
      }
    } else {
      setIsPlaying(false);
      setProgress(100);
    }
  };

  const handlePrevMessage = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(prev => prev - 1);
      setProgress(0);
      if (isPlaying) {
        setTimeout(() => speakMessage(currentMessageIndex - 1), 100);
      }
    }
  };

  const openStandup = (standup: any) => {
    setActiveStandup(standup);
    setActiveView('detail');
    setCurrentMessageIndex(0);
    setProgress(0);
    setIsPlaying(false);
    if (synthRef.current) synthRef.current.cancel();
  };

  const backToArchive = () => {
    setActiveView('archive');
    setActiveStandup(null);
    setIsPlaying(false);
    if (synthRef.current) synthRef.current.cancel();
  };

  if (activeView === 'archive') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
            <span className="text-2xl">🎙️</span> Executive Standup
          </h2>
          <p className="text-sm text-gray-500">Kick off meetings with the chiefs and review past transcripts</p>
        </div>

        <div className="flex gap-3 mb-8">
          <button className="px-4 py-2 bg-[#1a1a1a] border border-yellow-500/30 text-yellow-500 text-sm rounded-md font-medium flex items-center gap-2">
            <span className="text-lg">🗂️</span> Meeting Archive
          </button>
          <button className="px-4 py-2 bg-[#111111] border border-[#333] text-gray-400 text-sm rounded-md hover:bg-[#1a1a1a] transition-colors flex items-center gap-2">
            + New Standup
          </button>
        </div>

        <div className="space-y-4">
          {standups.map(standup => (
            <div 
              key={standup.id} 
              onClick={() => openStandup(standup)}
              className="bg-[#111111] border border-[#333] rounded-xl p-5 hover:border-yellow-500/30 transition-colors cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-gray-200 group-hover:text-yellow-500 transition-colors">{standup.title}</h3>
                <div className="text-xs text-gray-500">{standup.date} — {standup.time}</div>
              </div>
              <div className="flex items-center gap-2 mb-4">
                {standup.participants.map((p, i) => (
                  <span key={i} className="text-lg">{p.emoji}</span>
                ))}
              </div>
              <p className="text-sm text-gray-500 truncate">{standup.preview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2 mb-2">
          <span className="text-2xl">🎙️</span> Executive Standup
        </h2>
        <p className="text-sm text-gray-500">Kick off meetings with the chiefs and review past transcripts</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button className="px-4 py-2 bg-[#1a1a1a] border border-yellow-500/30 text-yellow-500 text-sm rounded-md font-medium flex items-center gap-2">
          <span className="text-lg">🗂️</span> Meeting Archive
        </button>
        <button className="px-4 py-2 bg-[#111111] border border-[#333] text-gray-400 text-sm rounded-md hover:bg-[#1a1a1a] transition-colors flex items-center gap-2">
          + New Standup
        </button>
      </div>

      <button 
        onClick={backToArchive}
        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors mb-6"
      >
        <ChevronLeft size={16} /> Back to Archive
      </button>

      {/* Header Card */}
      <div className="bg-[#111111] border border-[#333] rounded-xl p-5">
        <h3 className="text-xl font-semibold mb-4">{activeStandup.title}</h3>
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar size={14} />
            {activeStandup.date} — {activeStandup.time}
          </div>
          <div className="flex items-center gap-3">
            {activeStandup.participants.map((p: any, i: number) => (
              <span key={i} className={`flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#1a1a1a] border border-[#333] text-xs font-medium text-${p.color}-400`}>
                <span>{p.emoji}</span> {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Player Controls */}
      <div className="bg-[#111111] border border-yellow-500/30 rounded-xl p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={handlePrevMessage} className="p-2 text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] rounded-md border border-[#333]">
            <SkipBack size={16} />
          </button>
          <button 
            onClick={togglePlay}
            className="flex items-center gap-2 px-6 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-md font-medium hover:bg-yellow-500/20 transition-colors min-w-[100px] justify-center"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button onClick={handleNextMessage} className="p-2 text-gray-400 hover:text-white transition-colors bg-[#1a1a1a] rounded-md border border-[#333]">
            <SkipForward size={16} />
          </button>
        </div>

        {activeStandup.messages.length > 0 && (
          <div className="flex-1 flex items-center gap-4">
            <div className="flex items-center gap-2 min-w-[100px]">
              <span className="text-lg">{activeStandup.messages[currentMessageIndex].emoji}</span>
              <span className="text-sm font-medium text-gray-200">{activeStandup.messages[currentMessageIndex].name}</span>
            </div>
            
            <div className="flex-1 h-1.5 bg-[#222] rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <div className="text-xs text-gray-500 font-mono min-w-[80px] text-right">
              {currentMessageIndex + 1}/{activeStandup.messages.length} · 16s/24s
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="space-y-4">
        {activeStandup.messages.map((msg: any, index: number) => {
          const isActive = index === currentMessageIndex;
          const isPast = index < currentMessageIndex;
          
          let borderColor = 'border-[#333]';
          if (isActive) {
            if (msg.color === 'green') borderColor = 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
            if (msg.color === 'yellow') borderColor = 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]';
            if (msg.color === 'blue') borderColor = 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.1)]';
            if (msg.color === 'purple') borderColor = 'border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.1)]';
          }

          return (
            <div 
              key={msg.id} 
              className={`bg-[#111111] border ${borderColor} rounded-xl p-5 transition-all duration-300 ${!isActive && !isPast ? 'opacity-50' : 'opacity-100'}`}
              onClick={() => {
                setCurrentMessageIndex(index);
                setProgress(0);
                if (isPlaying) {
                  setTimeout(() => speakMessage(index), 50);
                }
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{msg.emoji}</span>
                <span className={`font-semibold text-${msg.color}-400`}>{msg.name}</span>
                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{msg.role}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed">{msg.text}</p>
            </div>
          );
        })}
      </div>

      {/* Tasks Section */}
      {activeStandup.tasks.length > 0 && (
        <div className="mt-8 flex gap-6">
          {/* Task List */}
          <div className="w-1/3 bg-[#111111] border border-green-500/30 rounded-xl overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#333] flex items-center gap-2">
              <span className="text-xl">🎉</span>
              <h3 className="font-semibold text-gray-200">All Tasks Complete</h3>
              <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full ml-auto">10/10</span>
            </div>
            
            <div className="flex-1 overflow-y-auto max-h-[500px] p-2 space-y-1">
              {activeStandup.tasks.map((task: any, i: number) => (
                <button
                  key={task.id}
                  onClick={() => setActiveTask(task.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-3 transition-colors ${
                    activeTask === task.id ? 'bg-green-500/10 text-green-400' : 'text-gray-400 hover:bg-[#1a1a1a]'
                  }`}
                >
                  <span className="text-xs opacity-50 w-4">{i + 1}.</span>
                  <span className="truncate">{task.title}</span>
                </button>
              ))}
            </div>

            <div 
              className="p-3 border-t border-[#333] flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:bg-[#1a1a1a] transition-colors"
              onClick={() => setTasksExpanded(!tasksExpanded)}
            >
              {tasksExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              Action Items
            </div>

            {tasksExpanded && (
              <div className="p-4 border-t border-[#333] space-y-3 bg-[#0a0a0a]">
                {activeStandup.tasks.map((task: any) => (
                  <div key={task.id} className="flex items-start gap-3 text-xs text-gray-500">
                    <div className="mt-0.5 w-4 h-4 rounded bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </div>
                    <span className="line-through">{task.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Task Detail */}
          <div className="flex-1 bg-[#111111] border border-[#333] rounded-xl p-6">
            {activeTask && activeStandup.tasks.find((t: any) => t.id === activeTask)?.details ? (
              <div className="space-y-4">
                {activeTask === 1 ? (
                  <>
                    <h3 className="font-semibold text-gray-200">{activeStandup.tasks[0].details.title}</h3>
                    <p className="text-sm text-gray-400">{activeStandup.tasks[0].details.desc}</p>
                    <p className="text-xs text-gray-600 italic mt-4">{activeStandup.tasks[0].details.note}</p>
                  </>
                ) : activeTask === 3 ? (
                  <>
                    <h3 className="text-lg font-semibold text-gray-200 border-b border-[#333] pb-4 mb-4">
                      {activeStandup.tasks[2].details.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-6">
                      <span>Owner: {activeStandup.tasks[2].details.owner}</span>
                      <span>Last updated: {activeStandup.tasks[2].details.date}</span>
                    </div>
                    <h4 className="font-medium text-gray-300 mb-3">Warm Decline Template</h4>
                    <div className="text-sm text-gray-400 whitespace-pre-wrap leading-relaxed">
                      {activeStandup.tasks[2].details.content}
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500 text-sm">
                Select a task to view details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for ChevronRight since it wasn't imported
function ChevronRight(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
