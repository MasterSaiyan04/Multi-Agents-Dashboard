import { FolderOpen, Mic, Network, ScrollText } from 'lucide-react';
import { useState } from 'react';

import type { AgentProfile, OrgChartPayload } from '../../shared/mission';

interface OrgChartProps {
  payload: OrgChartPayload | null;
  onOpenWorkspace: (workspaceId: string | null | undefined) => void;
  onOpenDocs: (workspaceId: string | null | undefined) => void;
  onOpenStandup: () => void;
}

function borderTint(color: string) {
  if (color === '#5DCAA5') return 'border-emerald-400/30';
  if (color === '#60A5FA') return 'border-sky-400/30';
  if (color === '#A855F7') return 'border-violet-400/30';
  if (color === '#FBBF24') return 'border-amber-400/30';
  return 'border-[#2e2e2e]';
}

function glowTint(color: string) {
  if (color === '#5DCAA5') return 'shadow-[0_0_24px_rgba(93,202,165,0.08)]';
  if (color === '#60A5FA') return 'shadow-[0_0_24px_rgba(96,165,250,0.08)]';
  if (color === '#A855F7') return 'shadow-[0_0_24px_rgba(168,85,247,0.08)]';
  if (color === '#FBBF24') return 'shadow-[0_0_24px_rgba(251,191,36,0.08)]';
  return '';
}

function statusClass(status: AgentProfile['status']) {
  if (status === 'active' || status === 'running') return 'bg-green-500';
  if (status === 'scaffolded' || status === 'queued') return 'bg-yellow-500';
  if (status === 'inactive' || status === 'error') return 'bg-rose-500';
  return 'bg-gray-500';
}

function AgentCard({
  agent,
  reports,
  onOpenWorkspace,
  onOpenDocs,
  onOpenStandup,
}: {
  agent: AgentProfile;
  reports: AgentProfile[];
  onOpenWorkspace: (workspaceId: string | null | undefined) => void;
  onOpenDocs: (workspaceId: string | null | undefined) => void;
  onOpenStandup: () => void;
}) {
  return (
    <div className={`rounded-3xl border bg-[#111111] p-5 ${borderTint(agent.color)} ${glowTint(agent.color)}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-2xl"
              style={{ boxShadow: `0 0 20px ${agent.color}20` }}
            >
              {agent.emoji}
            </div>
            <div>
              <div className="text-lg font-semibold text-white">{agent.name}</div>
              <div className="text-xs uppercase tracking-[0.24em] text-gray-500">
                {agent.metadata.chiefTitle ? String(agent.metadata.chiefTitle) : agent.roleSlug}
              </div>
            </div>
          </div>
          <p className="text-sm leading-relaxed text-gray-500">{agent.persona}</p>
        </div>

        <div className="flex items-center gap-2 rounded-full border border-[#2f2f2f] bg-[#151515] px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-gray-400">
          <span className={`h-2 w-2 rounded-full ${statusClass(agent.status)}`} />
          {agent.status}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {agent.modelKey ? (
          <span className="rounded-full border border-[#2f2f2f] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-300">
            {agent.modelKey}
          </span>
        ) : null}
        {agent.frequency ? (
          <span className="rounded-full border border-[#2f2f2f] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400">
            {agent.frequency}
          </span>
        ) : null}
        {agent.markets.map((market) => (
          <span
            key={market}
            className="rounded-full border border-[#2f2f2f] bg-[#171717] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-gray-400"
          >
            {market}
          </span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => onOpenWorkspace(agent.workspaceId)}
          className="flex items-center gap-2 rounded-lg border border-[#2d2d2d] bg-[#171717] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-amber-500/30 hover:text-white"
        >
          <FolderOpen size={14} />
          Workspace
        </button>
        <button
          onClick={() => onOpenDocs(agent.workspaceId)}
          className="flex items-center gap-2 rounded-lg border border-[#2d2d2d] bg-[#171717] px-3 py-2 text-sm text-gray-300 transition-colors hover:border-amber-500/30 hover:text-white"
        >
          <ScrollText size={14} />
          Docs
        </button>
        <button
          onClick={onOpenStandup}
          className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-sm text-amber-300 transition-colors hover:border-amber-400/40"
        >
          <Mic size={14} />
          Standup
        </button>
      </div>

      {reports.length > 0 ? (
        <div className="mt-6 space-y-3 border-t border-[#222] pt-5">
          <div className="text-xs uppercase tracking-[0.24em] text-gray-500">Direct Reports</div>
          <div className="grid gap-3 md:grid-cols-2">
            {reports.map((child) => (
              <div key={child.id} className="rounded-2xl border border-[#252525] bg-[#151515] p-4">
                <div className="flex items-start gap-3">
                  <div className="text-xl">{child.emoji}</div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium text-gray-100">{child.name}</div>
                    <div className="mt-1 text-xs text-gray-500">{child.persona}</div>
                    <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-[0.18em] text-gray-400">
                      {child.modelKey ? (
                        <span className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1">
                          {child.modelKey}
                        </span>
                      ) : null}
                      {child.workspaceId ? (
                        <span className="rounded-full border border-[#2d2d2d] bg-[#171717] px-2 py-1">
                          {child.workspaceId}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default function OrgChart({
  payload,
  onOpenWorkspace,
  onOpenDocs,
  onOpenStandup,
}: OrgChartProps) {
  const [marketFilter, setMarketFilter] = useState<'ALL' | 'MX' | 'USA'>('ALL');

  if (!payload) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="h-12 w-72 animate-pulse rounded-xl bg-[#1d1d1d]" />
      </div>
    );
  }

  const filteredAgents = payload.agents.filter((agent) => {
    if (marketFilter === 'ALL') {
      return true;
    }
    return agent.markets.includes(marketFilter);
  });

  const filteredIds = new Set(filteredAgents.map((agent) => agent.id));
  const roots = filteredAgents.filter((agent) => !agent.chiefId || !filteredIds.has(agent.chiefId));
  const directReports = roots.flatMap((root) =>
    filteredAgents.filter((agent) => agent.chiefId === root.id)
  );

  const activeCount = filteredAgents.filter((agent) => agent.status === 'active').length;
  const scaffoldedCount = filteredAgents.filter((agent) => agent.status === 'scaffolded').length;

  return (
    <div className="mx-auto max-w-6xl space-y-8 rounded-3xl bg-grid pb-12">
      <div className="rounded-3xl border border-[#232323] bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.08),transparent_35%),#101010] p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 text-xs uppercase tracking-[0.28em] text-gray-500">Org Chart</div>
            <h2 className="text-3xl font-semibold text-white">Chief hierarchy and workspace ownership</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Inspect the chain of command, assigned models, frequency loops, and quick links back into
              workspaces, standups, and docs.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'MX', 'USA'] as const).map((market) => (
              <button
                key={market}
                onClick={() => setMarketFilter(market)}
                className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.2em] transition-colors ${
                  marketFilter === market
                    ? 'border-amber-400/40 bg-amber-500/10 text-amber-300'
                    : 'border-[#2f2f2f] bg-[#171717] text-gray-400 hover:text-gray-100'
                }`}
              >
                {market === 'ALL' ? 'All Markets' : market}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[#232323] bg-[#111111] p-4">
            <div className="text-3xl font-semibold text-white">{payload.roles.length}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">Roles</div>
          </div>
          <div className="rounded-2xl border border-[#232323] bg-[#111111] p-4">
            <div className="text-3xl font-semibold text-white">{filteredAgents.length}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">Visible Agents</div>
          </div>
          <div className="rounded-2xl border border-[#232323] bg-[#111111] p-4">
            <div className="text-3xl font-semibold text-green-400">{activeCount}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">Active</div>
          </div>
          <div className="rounded-2xl border border-[#232323] bg-[#111111] p-4">
            <div className="text-3xl font-semibold text-yellow-400">{scaffoldedCount}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gray-500">Scaffolded</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {roots.map((root) => {
          const children = filteredAgents.filter((agent) => agent.chiefId === root.id);
          const grandchildren = (agentId: string) =>
            filteredAgents.filter((agent) => agent.chiefId === agentId);

          return (
            <div key={root.id} className="space-y-5">
              <AgentCard
                agent={root}
                reports={children}
                onOpenWorkspace={onOpenWorkspace}
                onOpenDocs={onOpenDocs}
                onOpenStandup={onOpenStandup}
              />

              {children.length > 0 ? (
                <div className="grid gap-4 xl:grid-cols-2">
                  {children.map((child) => (
                    <div key={child.id}>
                      <AgentCard
                        agent={child}
                        reports={grandchildren(child.id)}
                        onOpenWorkspace={onOpenWorkspace}
                        onOpenDocs={onOpenDocs}
                        onOpenStandup={onOpenStandup}
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-[#232323] bg-[#111111] p-5">
        <div className="mb-3 flex items-center gap-2 text-sm text-gray-400">
          <Network size={16} />
          Role lanes
        </div>
        <div className="flex flex-wrap gap-2">
          {payload.roles.map((role) => (
            <span
              key={role.slug}
              className="rounded-full border border-[#2f2f2f] bg-[#171717] px-3 py-2 text-xs uppercase tracking-[0.18em] text-gray-300"
              style={{ boxShadow: `inset 0 0 0 1px ${role.color}20` }}
            >
              {role.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
