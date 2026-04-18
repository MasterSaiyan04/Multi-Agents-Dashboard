import { Calendar, Mic, Pause, Play, RefreshCw, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';

import type { AgentProfile, MeetingPlaybackState, MeetingRun, WorkspaceSnapshot } from '../../shared/mission';
import { createMeeting, fetchMeeting, fetchMeetingPlayback, runMeeting } from '../lib/api';

interface StandupProps {
  meetings: MeetingRun[];
  agents: AgentProfile[];
  workspaces: WorkspaceSnapshot[];
}

function statusClass(status: MeetingRun['status']) {
  if (status === 'completed' || status === 'active') return 'border-green-500/20 bg-green-500/10 text-green-400';
  if (status === 'running' || status === 'queued' || status === 'building') {
    return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  }
  if (status === 'error' || status === 'inactive') return 'border-rose-500/20 bg-rose-500/10 text-rose-400';
  return 'border-[#333] bg-[#171717] text-gray-400';
}

function chipColor(color: string) {
  if (color === 'green') return 'border-green-500/20 bg-green-500/10 text-green-400';
  if (color === 'yellow') return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  if (color === 'blue') return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
  if (color === 'purple') return 'border-purple-500/20 bg-purple-500/10 text-purple-400';
  return 'border-[#333] bg-[#171717] text-gray-300';
}

export default function Standup({ meetings, agents, workspaces }: StandupProps) {
  const defaultParticipants = useMemo(
    () =>
      agents
        .filter((agent) => ['agent-muddy', 'agent-gary', 'agent-elon', 'agent-warren'].includes(agent.id))
        .map((agent) => agent.name),
    [agents]
  );
  const [selectedMeetingId, setSelectedMeetingId] = useState<string | null>(meetings[0]?.id || null);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingRun | null>(null);
  const [playback, setPlayback] = useState<MeetingPlaybackState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [notice, setNotice] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    title: '',
    topic: 'Partnership & Sponsorship Strategy',
    participants: defaultParticipants,
    workspaceId: workspaces[0]?.id || '',
    voiceEnabled: true,
  });

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      synthRef.current?.cancel();
    };
  }, []);

  useEffect(() => {
    if (!selectedMeetingId) {
      setSelectedMeeting(null);
      return;
    }

    async function loadMeeting() {
      setIsLoading(true);
      try {
        const meeting = await fetchMeeting(selectedMeetingId);
        setSelectedMeeting(meeting);
        setCurrentTurnIndex(0);
      } catch (error) {
        setNotice(error instanceof Error ? error.message : 'Unable to load meeting');
      } finally {
        setIsLoading(false);
      }
    }

    void loadMeeting();
  }, [selectedMeetingId]);

  useEffect(() => {
    if (!selectedMeeting || !['queued', 'running', 'building'].includes(selectedMeeting.status)) {
      return;
    }

    const interval = window.setInterval(async () => {
      try {
        const [meeting, playbackState] = await Promise.all([
          fetchMeeting(selectedMeeting.id),
          fetchMeetingPlayback(selectedMeeting.id),
        ]);
        setSelectedMeeting(meeting);
        setPlayback(playbackState);
      } catch {
        // keep quiet during background polling
      }
    }, 1500);

    return () => window.clearInterval(interval);
  }, [selectedMeeting]);

  useEffect(() => {
    if (!meetings.find((meeting) => meeting.id === selectedMeetingId)) {
      setSelectedMeetingId(meetings[0]?.id || null);
    }
  }, [meetings, selectedMeetingId]);

  async function refreshMeeting() {
    if (!selectedMeetingId) {
      return;
    }

    setNotice(null);
    try {
      const [meeting, playbackState] = await Promise.all([
        fetchMeeting(selectedMeetingId),
        fetchMeetingPlayback(selectedMeetingId).catch(() => null),
      ]);
      setSelectedMeeting(meeting);
      setPlayback(playbackState);
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to refresh meeting');
    }
  }

  async function handleCreateAndRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setNotice(null);

    try {
      const created = await createMeeting({
        title: draft.title || undefined,
        topic: draft.topic,
        participants: draft.participants,
        workspaceId: draft.workspaceId || null,
        voiceEnabled: draft.voiceEnabled,
      });
      setSelectedMeetingId(created.id);
      setSelectedMeeting(created);
      await runMeeting(created.id, {
        topic: draft.topic,
        participants: draft.participants,
        workspaceId: draft.workspaceId || null,
        voiceEnabled: draft.voiceEnabled,
      });
      setNotice('Standup queued. Mission runner is now generating the transcript and artifacts.');
      await refreshMeeting();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to create standup');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRunCurrentMeeting() {
    if (!selectedMeeting) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    try {
      await runMeeting(selectedMeeting.id, {
        topic: selectedMeeting.topic,
        participants: selectedMeeting.participants.map((participant) => participant.name),
        workspaceId: String(selectedMeeting.metadata.workspaceId || '') || null,
        voiceEnabled: selectedMeeting.voiceEnabled,
      });
      setNotice('Standup re-queued. Refreshing transcript...');
      await refreshMeeting();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to run standup');
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleParticipant(name: string) {
    setDraft((current) => {
      const exists = current.participants.includes(name);
      return {
        ...current,
        participants: exists
          ? current.participants.filter((participant) => participant !== name)
          : [...current.participants, name],
      };
    });
  }

  function speakTurn(index: number) {
    if (!synthRef.current || !selectedMeeting?.turns?.[index]) {
      setIsSpeaking(false);
      return;
    }

    synthRef.current.cancel();
    const turn = selectedMeeting.turns[index];
    const utterance = new SpeechSynthesisUtterance(`${turn.speakerName}. ${turn.content}`);
    utterance.rate = 1.03;
    utterance.onend = () => {
      const nextIndex = index + 1;
      if (selectedMeeting.turns && nextIndex < selectedMeeting.turns.length) {
        setCurrentTurnIndex(nextIndex);
        speakTurn(nextIndex);
      } else {
        setIsSpeaking(false);
      }
    };

    setCurrentTurnIndex(index);
    setIsSpeaking(true);
    synthRef.current.speak(utterance);
  }

  function toggleTranscriptPlayback() {
    if (isSpeaking) {
      synthRef.current?.cancel();
      setIsSpeaking(false);
      return;
    }

    speakTurn(currentTurnIndex);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-gray-500">
            <Sparkles size={14} />
            Launch new standup
          </div>

          <form onSubmit={handleCreateAndRun} className="space-y-4">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">Title</label>
              <input
                value={draft.title}
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                placeholder="Executive Standup: Topic"
                className="w-full rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-3 text-sm text-gray-100 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">Topic</label>
              <textarea
                value={draft.topic}
                onChange={(event) => setDraft((current) => ({ ...current, topic: event.target.value }))}
                rows={4}
                className="w-full rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-3 text-sm text-gray-100 outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">Participants</label>
              <div className="grid gap-2">
                {agents.map((agent) => (
                  <label
                    key={agent.id}
                    className="flex items-center justify-between rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-2 text-sm text-gray-200"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={draft.participants.includes(agent.name)}
                        onChange={() => toggleParticipant(agent.name)}
                        className="accent-amber-400"
                      />
                      <span>{agent.emoji}</span>
                      <span>{agent.name}</span>
                    </div>
                    <span className="text-xs text-gray-500">{agent.modelKey || 'No model'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs uppercase tracking-[0.18em] text-gray-500">Workspace scope</label>
              <select
                value={draft.workspaceId}
                onChange={(event) => setDraft((current) => ({ ...current, workspaceId: event.target.value }))}
                className="w-full rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-3 text-sm text-gray-100 outline-none"
              >
                {workspaces.map((workspace) => (
                  <option key={workspace.id} value={workspace.id}>
                    {workspace.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-[#2d2d2d] bg-[#171717] px-3 py-3 text-sm text-gray-200">
              <input
                type="checkbox"
                checked={draft.voiceEnabled}
                onChange={(event) => setDraft((current) => ({ ...current, voiceEnabled: event.target.checked }))}
                className="accent-amber-400"
              />
              Generate audio with Edge TTS when available
            </label>

            <button
              type="submit"
              disabled={isSubmitting || draft.participants.length === 0 || !draft.topic.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-300 transition-colors hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Mic size={15} />
              {isSubmitting ? 'Launching standup' : 'Create and run standup'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
          <div className="mb-4 text-xs uppercase tracking-[0.24em] text-gray-500">Meeting archive</div>
          <div className="space-y-2">
            {meetings.map((meeting) => (
              <button
                key={meeting.id}
                onClick={() => setSelectedMeetingId(meeting.id)}
                className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                  selectedMeetingId === meeting.id
                    ? 'border-amber-400/30 bg-amber-500/10'
                    : 'border-[#242424] bg-[#151515] hover:border-[#343434]'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(meeting.status)}`}>
                    {meeting.status}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">{meeting.timeLabel}</span>
                </div>
                <div className="text-sm font-medium text-white">{meeting.title}</div>
                <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{meeting.preview}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="rounded-3xl border border-[#232323] bg-[#111111] p-6">
        {notice ? (
          <div className="mb-4 rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
            {notice}
          </div>
        ) : null}

        {selectedMeeting ? (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(selectedMeeting.status)}`}>
                    {selectedMeeting.status}
                  </span>
                  <span className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                    {selectedMeeting.participants.length} participants
                  </span>
                </div>
                <h2 className="text-3xl font-semibold text-white">{selectedMeeting.title}</h2>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} />
                    {selectedMeeting.dateLabel}
                  </span>
                  <span>{selectedMeeting.timeLabel}</span>
                </div>
                <p className="mt-4 max-w-3xl text-sm leading-relaxed text-gray-500">{selectedMeeting.summary}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => void refreshMeeting()}
                  disabled={isLoading}
                  className="flex items-center gap-2 rounded-xl border border-[#2d2d2d] bg-[#171717] px-4 py-2 text-sm text-gray-300 transition-colors hover:border-amber-500/30 hover:text-white"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                  Refresh
                </button>
                <button
                  onClick={() => void handleRunCurrentMeeting()}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Play size={14} />
                  {isSubmitting ? 'Queueing' : 'Run Standup'}
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {selectedMeeting.participants.map((participant) => (
                <span
                  key={`${selectedMeeting.id}-${participant.id}`}
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.18em] ${chipColor(participant.color)}`}
                >
                  {participant.emoji} {participant.name} · {participant.role}
                </span>
              ))}
            </div>

            <div className="rounded-3xl border border-[#232323] bg-[#151515] p-5">
              <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Playback</div>
                  <div className="mt-2 text-sm text-gray-400">
                    {playback
                      ? `${playback.currentTurn}/${playback.totalTurns} turns indexed`
                      : `${selectedMeeting.turns?.length || 0} turns available`}
                  </div>
                </div>

                {selectedMeeting.audioUrl ? (
                  <audio controls className="w-full max-w-md" src={selectedMeeting.audioUrl} />
                ) : (
                  <button
                    onClick={toggleTranscriptPlayback}
                    disabled={!selectedMeeting.turns?.length}
                    className="flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSpeaking ? <Pause size={14} /> : <Play size={14} />}
                    {isSpeaking ? 'Pause browser voice' : 'Play browser voice'}
                  </button>
                )}
              </div>

              <div className="h-2 rounded-full bg-[#222]">
                <div
                  className="h-full rounded-full bg-amber-300 transition-all"
                  style={{
                    width: `${Math.min(
                      100,
                      ((playback?.currentTurn || currentTurnIndex + 1) /
                        Math.max(playback?.totalTurns || selectedMeeting.turns?.length || 1, 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
              <div className="space-y-3">
                {(selectedMeeting.turns || []).map((turn, index) => {
                  const isActive = index === currentTurnIndex || playback?.currentTurn === turn.turnIndex;
                  return (
                    <button
                      type="button"
                      key={turn.id}
                      onClick={() => {
                        setCurrentTurnIndex(index);
                        if (isSpeaking) {
                          speakTurn(index);
                        }
                      }}
                      className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                        isActive
                          ? 'border-amber-400/30 bg-amber-500/10'
                          : 'border-[#232323] bg-[#151515] hover:border-[#343434]'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${chipColor((turn.metadata.color as string | undefined)?.includes('a855f7') ? 'purple' : 'green')}`}>
                          {turn.speakerName}
                        </span>
                        <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">{turn.speakerRole}</span>
                      </div>
                      <p className="text-sm leading-relaxed text-gray-300">{turn.content}</p>
                    </button>
                  );
                })}
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl border border-[#232323] bg-[#151515] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.24em] text-gray-500">Action items</div>
                  <div className="space-y-3">
                    {(selectedMeeting.artifacts || []).map((artifact) => (
                      <div key={artifact.id} className="rounded-2xl border border-[#232323] bg-[#101010] p-4">
                        <div className="mb-2 flex items-center gap-2">
                          <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusClass(artifact.status)}`}>
                            {artifact.status}
                          </span>
                          <span className="text-[10px] uppercase tracking-[0.18em] text-gray-600">{artifact.artifactType}</span>
                        </div>
                        <div className="text-sm font-medium text-white">{artifact.title}</div>
                        <div className="mt-2 text-xs leading-relaxed text-gray-500">{artifact.summary}</div>
                        <pre className="mt-3 whitespace-pre-wrap font-mono text-[11px] leading-6 text-gray-400">
                          {artifact.bodyMarkdown}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#232323] bg-[#151515] p-4">
                  <div className="mb-3 text-xs uppercase tracking-[0.24em] text-gray-500">Transcript archive</div>
                  <pre className="whitespace-pre-wrap font-mono text-[11px] leading-6 text-gray-400">
                    {selectedMeeting.transcriptText || 'No transcript yet.'}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Select a meeting from the archive or create a new standup.</div>
        )}
      </section>
    </div>
  );
}
