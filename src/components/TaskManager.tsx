import { Clock3, Play, RefreshCw } from 'lucide-react';

import type { MissionSummary, MissionStatus, ScheduledJob } from '../../shared/mission';

interface TaskManagerProps {
  summary: MissionSummary | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  onTriggerJob: (jobId: string) => void;
}

function toneClass(tone: MissionSummary['kpis'][number]['tone']) {
  if (tone === 'green') return 'text-green-400';
  if (tone === 'yellow') return 'text-yellow-400';
  if (tone === 'blue') return 'text-sky-400';
  if (tone === 'red') return 'text-rose-400';
  return 'text-white';
}

function statusBadge(status: MissionStatus) {
  if (status === 'active' || status === 'running') {
    return 'border-green-500/20 bg-green-500/10 text-green-400';
  }
  if (status === 'idle' || status === 'standby' || status === 'queued') {
    return 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400';
  }
  if (status === 'completed') {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
  }
  if (status === 'error' || status === 'inactive') {
    return 'border-rose-500/20 bg-rose-500/10 text-rose-400';
  }
  return 'border-[#383838] bg-[#171717] text-gray-400';
}

function modelTagClass(tag: string) {
  if (tag.includes('opus') || tag.includes('claude')) {
    return 'border-blue-500/20 bg-blue-500/10 text-blue-300';
  }
  if (tag.includes('gpt')) {
    return 'border-purple-500/20 bg-purple-500/10 text-purple-300';
  }
  return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
}

function teamTag(job: ScheduledJob) {
  if (job.team === 'LAB') return 'border-green-500/20 bg-green-500/10 text-green-400';
  if (job.team === 'BRAIN') return 'border-blue-500/20 bg-blue-500/10 text-blue-400';
  if (job.team === 'COMMUNITY') return 'border-purple-500/20 bg-purple-500/10 text-purple-400';
  return 'border-gray-500/20 bg-gray-500/10 text-gray-300';
}

export default function TaskManager({
  summary,
  isRefreshing,
  onRefresh,
  onTriggerJob,
}: TaskManagerProps) {
  if (!summary) {
    return (
      <div className="mx-auto max-w-6xl space-y-4 p-6">
        <div className="h-10 w-64 animate-pulse rounded-lg bg-[#1d1d1d]" />
        <div className="grid gap-4 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-2xl border border-[#232323] bg-[#121212]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 pb-12">
      <div className="flex flex-col gap-3 rounded-3xl border border-[#232323] bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_38%),#101010] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-gray-500">Task Manager</div>
            <h2 className="text-3xl font-semibold text-white">Fleet overview and overnight execution</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Monitor model fleet health, inspect recent sessions, trigger jobs on demand, and review the
              overnight log from the same panel.
            </p>
          </div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 self-start rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            {isRefreshing ? 'Refreshing' : 'Refresh Mission State'}
          </button>
        </div>

        <div className="text-xs text-gray-600">
          Generated {new Date(summary.generatedAt).toLocaleTimeString()} ·
          {summary.usedFixture ? ' fixture-backed snapshot' : ' live OpenClaw snapshot'}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {summary.kpis.map((kpi) => (
          <div
            key={kpi.id}
            className="rounded-2xl border border-[#232323] bg-[#111111] px-5 py-6 shadow-[0_0_24px_rgba(0,0,0,0.2)]"
          >
            <div className={`text-4xl font-semibold ${toneClass(kpi.tone)}`}>{kpi.displayValue}</div>
            <div className="mt-2 text-xs uppercase tracking-[0.24em] text-gray-500">{kpi.label}</div>
          </div>
        ))}
      </div>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-xs uppercase tracking-[0.24em] text-amber-300">
            Model Fleet
          </span>
          <span className="text-sm text-gray-500">{summary.modelFleet.length} models tracked</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-3">
          {summary.modelFleet.map((model) => (
            <div
              key={model.id}
              className="rounded-2xl border border-[#232323] bg-[#111111] p-5 transition-colors hover:border-amber-500/30"
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-100">{model.name}</h3>
                  <p className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">{model.provider}</p>
                </div>
                {model.badge ? (
                  <span className="rounded-full border border-[#343434] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">
                    {model.badge}
                  </span>
                ) : null}
              </div>
              <p className="min-h-[60px] text-sm leading-relaxed text-gray-500">{model.description}</p>
              <div className="mt-5 flex items-center justify-between text-xs text-gray-400">
                <span className={`rounded-full border px-2 py-1 ${statusBadge(model.status)}`}>{model.status}</span>
                <div className="flex gap-4 font-mono">
                  <span>{model.totalSessions} sessions</span>
                  <span>${model.totalCost.toFixed(2)}</span>
                  <span>{model.tokensUsed.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-2 py-1 text-xs uppercase tracking-[0.24em] text-sky-300">
            Session Feed
          </span>
          <span className="text-sm text-gray-500">{summary.activeSessions.length} recent sessions</span>
        </div>
        <div className="space-y-3">
          {summary.activeSessions.map((session) => (
            <div
              key={session.id}
              className="rounded-2xl border border-[#232323] bg-[#111111] p-4 transition-colors hover:border-amber-500/20"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-3">
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${statusBadge(session.status)}`}>
                      {session.status}
                    </span>
                    <h3 className="truncate text-base font-medium text-gray-100">{session.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500">{session.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {session.modelTags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${modelTagClass(tag)}`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid min-w-[220px] grid-cols-2 gap-4 text-right text-xs text-gray-500">
                  <div>
                    <div className="font-mono text-sm text-white">{session.tokensUsed.toLocaleString()}</div>
                    <div>Tokens</div>
                  </div>
                  <div>
                    <div className="font-mono text-sm text-amber-300">${session.totalCost.toFixed(2)}</div>
                    <div>Cost</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#1f1f1f] bg-[#0d0d0d] px-3 py-3 text-sm text-gray-400">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="truncate font-mono text-xs">{session.log}</div>
                  <div className="text-[11px] text-gray-600">{session.logTime || 'Waiting for log time'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs uppercase tracking-[0.24em] text-emerald-300">
            Cron Monitor
          </span>
          <span className="text-sm text-gray-500">{summary.scheduledJobs.length} registered jobs</span>
        </div>

        <div className="space-y-3">
          {summary.scheduledJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-2xl border border-[#232323] bg-[#111111] p-4 transition-colors hover:border-amber-500/20"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-medium text-gray-100">{job.title}</h3>
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${teamTag(job)}`}>
                      {job.team}
                    </span>
                    <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${statusBadge(job.status)}`}>
                      {job.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">{job.summary}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {job.actions.map((action) => (
                      <span
                        key={action}
                        className="rounded-full border border-[#2e2e2e] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
                      >
                        {action}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 xl:min-w-[290px] xl:items-end">
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 xl:justify-end">
                    <span className="flex items-center gap-1.5">
                      <Clock3 size={12} />
                      {job.scheduleLabel}
                    </span>
                    <span>{job.durationLabel}</span>
                  </div>
                  <button
                    onClick={() => onTriggerJob(job.id)}
                    className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40 hover:bg-amber-500/15"
                  >
                    <Play size={14} />
                    Trigger Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-xs uppercase tracking-[0.24em] text-purple-300">
            Overnight Log
          </span>
          <span className="text-sm text-gray-500">{summary.overnightLog.length} recent docs and artifacts</span>
        </div>

        <div className="relative space-y-5 before:absolute before:bottom-0 before:left-3 before:top-0 before:w-px before:bg-gradient-to-b before:from-transparent before:via-[#2a2a2a] before:to-transparent">
          {summary.overnightLog.map((doc) => (
            <div key={doc.id} className="relative pl-10">
              <div className="absolute left-0 top-3 h-6 w-6 rounded-full border border-[#2c2c2c] bg-[#111111] shadow-[0_0_18px_rgba(0,0,0,0.2)]">
                <div className="mx-auto mt-[7px] h-2.5 w-2.5 rounded-full bg-amber-300" />
              </div>
              <div className="rounded-2xl border border-[#232323] bg-[#111111] p-5 transition-colors hover:border-amber-500/20">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium text-gray-100">{doc.title}</h3>
                      <span className={`rounded-full border px-2 py-1 text-[10px] uppercase tracking-[0.18em] ${statusBadge(doc.status)}`}>
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-gray-500">{doc.summary}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <div>{doc.owner}</div>
                    <div>{doc.ownerRole}</div>
                  </div>
                </div>
                <div className="mt-4 text-xs text-gray-600">
                  {doc.createdAt ? new Date(doc.createdAt).toLocaleString() : 'No timestamp'} · {doc.docType}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
