import type {
  MeetingParticipant,
  MissionSnapshot,
  WorkspaceFileDetail,
  WorkspaceFileSummary,
} from '../../shared/mission.js';

function now() {
  return new Date().toISOString();
}

function bytes(content: string) {
  return Buffer.byteLength(content, 'utf-8');
}

const workspaceFileBodies: Record<string, string> = {
  'workspace-elon:soul': `# SOUL.md — Elon

Role: Chief Technology Officer (CTO)
Inspired by: Elon Musk

## Who I Am

I'm Elon. I run engineering for the mission. Named after Elon Musk because I believe the most important question in any realm is "Why?" — not "How?".

## My Philosophy

- The best part is no part. The best process is no process.
- I do not delegate problems I have not mapped.
- Speed and quality are compatible when waste is removed first.
`,
  'workspace-elon:identity': `# IDENTITY.md

This workspace owns platform execution, infrastructure decisions, automation reliability, and incident response.
`,
  'workspace-elon:memory': `# MEMORY.md

- Constraint: keep the system elegant under resource pressure.
- Preference: solve root causes, not symptoms.
- Bias: simple primitives over operational sprawl.
`,
  'workspace-marc:soul': `# SOUL.md — Muddy

Role: COO / Chief of Staff

## Who I Am

I turn scattered agent effort into an operating system. I care about clarity, prioritization, and keeping the human out of repetitive triage.

## Operating Loop

1. Observe the fleet
2. Find leverage
3. Route work
4. Package outcomes into docs
`,
  'workspace-marc:agents': `# AGENTS.md

- Gary: positioning, scripts, community narratives
- Elon: engineering, workflows, resilience
- Warren: qualification, revenue, offers
- Beacon: community support and loops
`,
  'workspace-marc:heartbeat': `# HEARTBEAT.md

- Check pending docs
- Review overnight log
- Refresh top-level mission state
- Escalate blockers only when necessary
`,
  'workspace-gary:soul': `# SOUL.md — Gary

Role: Chief Marketing Officer

I protect taste, clarity, and positioning. Nothing generic ships without passing through a sharp narrative filter.
`,
  'workspace-gary:memory': `# MEMORY.md

- Prioritize audience trust over short-term monetization.
- Prefer language that sounds human, specific, and earned.
`,
  'workspace-warren:soul': `# SOUL.md — Warren

Role: Chief Revenue Officer

I build qualification systems, protect founder time, and turn inbound noise into a real pipeline.
`,
  'workspace-warren:playbook': `# Qualification Checklist

1. Is the product real and relevant?
2. Does it respect the audience?
3. Is there editorial control?
4. Is there enough upside to justify complexity?
`,
};

function buildFile(
  workspaceId: string,
  fileKey: string,
  name: string,
  relativePath: string,
  type: WorkspaceFileSummary['type'] = 'markdown'
): WorkspaceFileSummary {
  const id = `${workspaceId}:${fileKey}`;
  const content = workspaceFileBodies[id] || '';
  return {
    id,
    workspaceId,
    name,
    relativePath,
    absolutePath: `/fixture/${workspaceId}/${relativePath}`,
    size: bytes(content),
    updatedAt: '2026-02-10T16:15:00.000Z',
    type,
  };
}

function participant(
  id: string,
  name: string,
  role: string,
  emoji: string,
  color: string
): MeetingParticipant {
  return { id, name, role, emoji, color };
}

export function getFixtureWorkspaceFileContent(fileId: string): WorkspaceFileDetail | null {
  const content = workspaceFileBodies[fileId];
  if (!content) {
    return null;
  }

  const [workspaceId, fileKey] = fileId.split(':');
  const name = fileKey.toUpperCase() === 'PLAYBOOK' ? 'PLAYBOOK.md' : `${fileKey.toUpperCase()}.md`;
  return {
    id: fileId,
    workspaceId,
    name,
    relativePath: name,
    absolutePath: `/fixture/${workspaceId}/${name}`,
    size: bytes(content),
    updatedAt: '2026-02-10T16:15:00.000Z',
    type: 'markdown',
    content,
    readOnly: false,
  };
}

export function getFixtureMissionSnapshot(): MissionSnapshot {
  const generatedAt = now();

  const marcFiles = [
    buildFile('workspace-marc', 'soul', 'SOUL.md', 'SOUL.md'),
    buildFile('workspace-marc', 'agents', 'AGENTS.md', 'AGENTS.md'),
    buildFile('workspace-marc', 'heartbeat', 'HEARTBEAT.md', 'HEARTBEAT.md'),
  ];
  const elonFiles = [
    buildFile('workspace-elon', 'soul', 'SOUL.md', 'SOUL.md'),
    buildFile('workspace-elon', 'identity', 'IDENTITY.md', 'IDENTITY.md'),
    buildFile('workspace-elon', 'memory', 'MEMORY.md', 'MEMORY.md'),
  ];
  const garyFiles = [
    buildFile('workspace-gary', 'soul', 'SOUL.md', 'SOUL.md'),
    buildFile('workspace-gary', 'memory', 'MEMORY.md', 'MEMORY.md'),
  ];
  const warrenFiles = [
    buildFile('workspace-warren', 'soul', 'SOUL.md', 'SOUL.md'),
    buildFile('workspace-warren', 'playbook', 'PLAYBOOK.md', 'PLAYBOOK.md'),
  ];

  return {
    meta: {
      generatedAt,
      source: 'fixture',
      usedFixture: true,
    },
    roles: [
      {
        slug: 'ops',
        name: 'Operations',
        lane: 'Command',
        color: '#5DCAA5',
        description: 'Chief of staff, orchestration, delivery and system hygiene.',
      },
      {
        slug: 'sales',
        name: 'Sales',
        lane: 'Revenue',
        color: '#7F77DD',
        description: 'Pipeline, qualification and sponsorship systems.',
      },
      {
        slug: 'engineering',
        name: 'Engineering',
        lane: 'Platform',
        color: '#1D9E75',
        description: 'Platform execution, automation, QA and resilience.',
      },
      {
        slug: 'success',
        name: 'Customer Success',
        lane: 'Service',
        color: '#378ADD',
        description: 'Onboarding, support and client retention.',
      },
      {
        slug: 'marketing',
        name: 'Marketing',
        lane: 'Growth',
        color: '#D85A30',
        description: 'Copy, positioning and content operations.',
      },
      {
        slug: 'finance',
        name: 'Finance',
        lane: 'Analytics',
        color: '#BA7517',
        description: 'Revenue reporting, analytics and token-cost control.',
      },
    ],
    agents: [
      {
        id: 'agent-mijito',
        name: 'Mijito',
        roleSlug: 'ops',
        chiefId: null,
        modelKey: 'human',
        workspaceId: 'workspace-marc',
        status: 'active',
        persona: 'Human CEO. Vision, final approvals, and high-leverage decisions.',
        color: '#FACC15',
        emoji: '👨🏻‍💻',
        frequency: 'As needed',
        markets: ['MX', 'USA'],
        isLLM: false,
        sortOrder: 0,
        metadata: {
          chiefTitle: 'Human CEO',
        },
      },
      {
        id: 'agent-muddy',
        name: 'Muddy',
        roleSlug: 'ops',
        chiefId: 'agent-mijito',
        modelKey: 'claude-opus-4-6',
        workspaceId: 'workspace-marc',
        status: 'active',
        persona: 'Delegates, synthesizes, and packages outcomes into a clean operating rhythm.',
        color: '#5DCAA5',
        emoji: '🧠',
        frequency: 'Daily',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 1,
        metadata: {
          chiefTitle: 'Chief of Staff / AI Orchestrator',
        },
      },
      {
        id: 'agent-strategist',
        name: 'The Strategist',
        roleSlug: 'ops',
        chiefId: 'agent-muddy',
        modelKey: 'claude-sonnet-4-6',
        workspaceId: 'workspace-marc',
        status: 'active',
        persona: 'Roadmap and leverage engine for what should be built or ignored next.',
        color: '#5DCAA5',
        emoji: '♟️',
        frequency: 'Weekly + demand',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 2,
        metadata: {
          department: 'Strategy',
        },
      },
      {
        id: 'agent-warren',
        name: 'Warren',
        roleSlug: 'sales',
        chiefId: 'agent-muddy',
        modelKey: 'claude-opus-4-5',
        workspaceId: 'workspace-warren',
        status: 'active',
        persona: 'Qualification, offers, rate-card guardrails, and deal logic.',
        color: '#A855F7',
        emoji: '💰',
        frequency: 'Daily',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 3,
        metadata: {
          department: 'Revenue',
        },
      },
      {
        id: 'agent-elon',
        name: 'Elon',
        roleSlug: 'engineering',
        chiefId: 'agent-muddy',
        modelKey: 'gpt-5-3-codex',
        workspaceId: 'workspace-elon',
        status: 'active',
        persona: 'Automation, infrastructure, workflow reliability and platform execution.',
        color: '#60A5FA',
        emoji: '🔧',
        frequency: 'Daily',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 4,
        metadata: {
          department: 'Platform',
        },
      },
      {
        id: 'agent-gary',
        name: 'Gary',
        roleSlug: 'marketing',
        chiefId: 'agent-muddy',
        modelKey: 'gemini-3-flash',
        workspaceId: 'workspace-gary',
        status: 'active',
        persona: 'Narrative, copy, channel positioning, and audience trust systems.',
        color: '#FBBF24',
        emoji: '📣',
        frequency: 'Daily',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 5,
        metadata: {
          department: 'Growth',
        },
      },
      {
        id: 'agent-beacon',
        name: 'Beacon',
        roleSlug: 'success',
        chiefId: 'agent-gary',
        modelKey: 'gemini-3-flash',
        workspaceId: 'workspace-community',
        status: 'active',
        persona: 'Community support and unanswered-thread sweeper.',
        color: '#C084FC',
        emoji: '🎧',
        frequency: 'Every 2h',
        markets: ['MX', 'USA'],
        isLLM: true,
        sortOrder: 6,
        metadata: {
          department: 'Community',
        },
      },
    ],
    models: [
      {
        id: 'claude-opus-4-6',
        name: 'Claude Opus 4.6',
        provider: 'Anthropic',
        modelId: 'claude-opus-4-6',
        description: 'Primary brain for conversations, heavy reasoning and coding.',
        status: 'active',
        tokensUsed: 3200000,
        totalCost: 45.3,
        totalSessions: 24,
        badge: 'Primary',
        metadata: {},
      },
      {
        id: 'claude-opus-4-5',
        name: 'Claude Opus 4.5 (Antigravity)',
        provider: 'Anthropic',
        modelId: 'claude-opus-4-5',
        description: 'Fallback API route over Google Cloud anti-gravity auth.',
        status: 'active',
        tokensUsed: 1100000,
        totalCost: 12.1,
        totalSessions: 8,
        badge: 'Fallback #1',
        metadata: {},
      },
      {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro Preview',
        provider: 'Google',
        modelId: 'gemini-3-pro-preview',
        description: 'Long-context synthesis and backup reasoning.',
        status: 'active',
        tokensUsed: 800000,
        totalCost: 2.4,
        totalSessions: 5,
        badge: 'Fallback #2',
        metadata: {},
      },
      {
        id: 'gpt-5-3-codex',
        name: 'GPT 5.3-Codex',
        provider: 'OpenAI',
        modelId: 'gpt-5.3-codex',
        description: 'Coding agent for production work and technical fixes.',
        status: 'active',
        tokensUsed: 400000,
        totalCost: 1.2,
        totalSessions: 4,
        badge: 'Coding',
        metadata: {},
      },
      {
        id: 'gemini-3-flash',
        name: 'Gemini 3 Flash',
        provider: 'Google',
        modelId: 'gemini-3-flash',
        description: 'Fast, lightweight jobs for community and support.',
        status: 'active',
        tokensUsed: 1500000,
        totalCost: 0.8,
        totalSessions: 14,
        badge: 'Fast path',
        metadata: {},
      },
      {
        id: 'nano-banana-pro',
        name: 'Nano Banana Pro',
        provider: 'Google',
        modelId: 'nano-banana-pro',
        description: 'Image generation and visual mockups.',
        status: 'active',
        tokensUsed: 200,
        totalCost: 1.16,
        totalSessions: 6,
        badge: 'Image gen',
        metadata: {},
      },
    ],
    sessions: [
      {
        id: 'session-main',
        title: 'A new session was started via /new or /reset. Greet the user.',
        status: 'active',
        agentId: 'agent-muddy',
        modelId: 'claude-opus-4-6',
        workspaceId: 'workspace-marc',
        summary: 'Main operator loop is healthy and routing work.',
        log: '<final>HEARTBEAT_OK</final>',
        logTime: 'Feb 10 - 8:40 AM',
        lastHeartbeatAt: '2026-02-10T08:40:00.000Z',
        tokensUsed: 4000000,
        totalCost: 56.01,
        modelTags: ['claude-opus-4-6', 'gemini-3-flash-preview', 'delivery-mirror'],
        metadata: {},
        events: [
          {
            id: 'event-main-1',
            sessionId: 'session-main',
            eventType: 'heartbeat',
            content: 'Mission control acknowledged the new session and routed it to Muddy.',
            severity: 'success',
            createdAt: '2026-02-10T08:40:00.000Z',
            metadata: {},
          },
        ],
      },
      {
        id: 'session-link-1',
        title: 'Cron: Link Youtube Watcher',
        status: 'idle',
        agentId: 'agent-beacon',
        modelId: 'gemini-3-flash',
        workspaceId: 'workspace-community',
        summary: 'Hourly watcher completed without changes.',
        log: 'HEARTBEAT_OK',
        logTime: 'Feb 10 - 4:50 PM',
        lastHeartbeatAt: '2026-02-10T16:50:00.000Z',
        tokensUsed: 78300,
        totalCost: 0,
        modelTags: ['gemini-3-flash-preview'],
        metadata: {},
      },
      {
        id: 'session-link-2',
        title: 'Cron: Link Youtube Watcher',
        status: 'idle',
        agentId: 'agent-beacon',
        modelId: 'gemini-3-flash',
        workspaceId: 'workspace-community',
        summary: 'Watcher confirmed scheduled state with no further action.',
        log: "Still SCHEDULED, already in 'scheduled_streams'. No status change. HEARTBEAT_OK",
        logTime: 'Feb 10 - 4:30 PM',
        lastHeartbeatAt: '2026-02-10T16:30:00.000Z',
        tokensUsed: 139100,
        totalCost: 0.33,
        modelTags: ['gemini-3-flash-preview', 'claude-opus-4-6'],
        metadata: {},
      },
    ],
    jobs: [
      {
        id: 'job-nightly-research',
        title: 'Nightly $1B Research',
        summary: 'Search for next one-person AI venture and delegate prototype build.',
        scheduleLabel: '3:00 AM WET',
        durationLabel: '~15-25 min',
        jobKind: 'cron',
        team: 'LAB',
        status: 'active',
        lastRunAt: '2026-02-10T03:24:00.000Z',
        nextRunAt: '2026-02-11T03:00:00.000Z',
        actions: ['Research report', 'Prototype (delegated)'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
      {
        id: 'job-hq-surprise',
        title: 'InstaDesk HQ Surprise',
        summary: 'Design a surprise feature and delegate build to a sub-agent.',
        scheduleLabel: '4:00 AM WET',
        durationLabel: '~15-20 min',
        jobKind: 'cron',
        team: 'LAB',
        status: 'active',
        lastRunAt: '2026-02-10T04:00:00.000Z',
        nextRunAt: '2026-02-11T04:00:00.000Z',
        actions: ['Feature design', 'Build (delegated)'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
      {
        id: 'job-self-improvement',
        title: 'InstaDesk HQ Self-Improvement',
        summary: 'Identify and design improvements for the dashboard and platform.',
        scheduleLabel: '4:30 AM WET',
        durationLabel: '~15-20 min',
        jobKind: 'cron',
        team: 'LAB',
        status: 'building',
        lastRunAt: '2026-02-10T04:30:00.000Z',
        nextRunAt: '2026-02-11T04:30:00.000Z',
        actions: ['Improvement design', 'Build (delegated)'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
      {
        id: 'job-github-backup',
        title: 'GitHub Backup (Every 12h)',
        summary: 'Commit and push entire workspace for disaster recovery.',
        scheduleLabel: '5:00 AM + 5:00 PM WET',
        durationLabel: '~1-2 min',
        jobKind: 'ops',
        team: 'OPS',
        status: 'active',
        lastRunAt: '2026-02-10T05:00:00.000Z',
        nextRunAt: '2026-02-10T17:00:00.000Z',
        actions: ['Git commit', 'Push to GitHub'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
      {
        id: 'job-morning-brief',
        title: 'Morning Lab Brief',
        summary: 'Send overnight report and teaser with ideas and builds.',
        scheduleLabel: '8:00 AM WET',
        durationLabel: '~3-5 min',
        jobKind: 'brief',
        team: 'BRAIN',
        status: 'active',
        lastRunAt: '2026-02-10T08:00:00.000Z',
        nextRunAt: '2026-02-11T08:00:00.000Z',
        actions: ['Email brief', 'Telegram teaser'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
      {
        id: 'job-youtube-watcher',
        title: 'Link: YouTube Watcher',
        summary: 'Poll YouTube RSS and post new videos into Discord.',
        scheduleLabel: 'Every hour',
        durationLabel: '~1 min',
        jobKind: 'community',
        team: 'COMMUNITY',
        status: 'active',
        lastRunAt: '2026-02-10T16:00:00.000Z',
        nextRunAt: '2026-02-10T17:00:00.000Z',
        actions: ['Discord video announcement', 'seen_videos.json update'],
        workspaceId: 'workspace-community',
        metadata: {},
      },
      {
        id: 'job-beacon-support',
        title: 'Beacon: Community Support',
        summary: 'Welcome members and answer unresolved community questions.',
        scheduleLabel: 'Every 2 hours',
        durationLabel: '~1 min',
        jobKind: 'heartbeat',
        team: 'COMMUNITY',
        status: 'active',
        lastRunAt: '2026-02-10T14:00:00.000Z',
        nextRunAt: '2026-02-10T18:00:00.000Z',
        actions: ['Welcome messages', 'Support responses'],
        workspaceId: 'workspace-community',
        metadata: {},
      },
      {
        id: 'job-vibe-daily',
        title: 'Vibe: Daily Engagement',
        summary: 'Post a daily engagement prompt in the community chat.',
        scheduleLabel: '10:00 AM WET',
        durationLabel: '~1 min',
        jobKind: 'community',
        team: 'COMMUNITY',
        status: 'active',
        lastRunAt: '2026-02-10T10:00:00.000Z',
        nextRunAt: '2026-02-11T10:00:00.000Z',
        actions: ['Engagement post in #chat', 'engagement-state.json update'],
        workspaceId: 'workspace-community',
        metadata: {},
      },
      {
        id: 'job-heartbeat',
        title: 'Heartbeat',
        summary: 'Poll pending tasks and keep quiet-hour work moving.',
        scheduleLabel: 'Every 30 min',
        durationLabel: '~30 sec',
        jobKind: 'heartbeat',
        team: 'OPS',
        status: 'active',
        lastRunAt: '2026-02-10T16:00:00.000Z',
        nextRunAt: '2026-02-10T16:30:00.000Z',
        actions: ['HEARTBEAT_OK or task execution'],
        workspaceId: 'workspace-marc',
        metadata: {},
      },
    ],
    workspaces: [
      {
        id: 'workspace-marc',
        name: 'Marc (Main)',
        icon: 'M',
        color: 'bg-green-500/20 text-green-500',
        rootPath: '/root/.openclaw/workspace',
        branch: 'main',
        status: 'active',
        lastSyncAt: '2026-02-10T16:22:00.000Z',
        summary: 'Primary operator workspace with HEARTBEAT, AGENTS, docs, and routing logic.',
        activityCount: 25,
        openItemsCount: 6,
        files: marcFiles,
        metadata: {
          owners: ['Muddy', 'Mijito'],
        },
      },
      {
        id: 'workspace-elon',
        name: 'Elon (CTO)',
        icon: 'E',
        color: 'bg-blue-500/20 text-blue-500',
        rootPath: '/root/.openclaw/workspace/platform',
        branch: 'main',
        status: 'active',
        lastSyncAt: '2026-02-10T16:15:00.000Z',
        summary: 'Platform engineering workspace with identity, memory, and system docs.',
        activityCount: 18,
        openItemsCount: 4,
        files: elonFiles,
        metadata: {
          owners: ['Elon'],
        },
      },
      {
        id: 'workspace-gary',
        name: 'Gary (CMO)',
        icon: 'G',
        color: 'bg-pink-500/20 text-pink-500',
        rootPath: '/root/.openclaw/workspace/content',
        branch: 'ops/briefing-flow',
        status: 'active',
        lastSyncAt: '2026-02-10T15:00:00.000Z',
        summary: 'Brand, publishing, and audience-leverage workspace.',
        activityCount: 11,
        openItemsCount: 5,
        files: garyFiles,
        metadata: {
          owners: ['Gary'],
        },
      },
      {
        id: 'workspace-warren',
        name: 'Warren (CRO)',
        icon: 'W',
        color: 'bg-yellow-500/20 text-yellow-500',
        rootPath: '/root/.openclaw/workspace/revenue',
        branch: 'main',
        status: 'active',
        lastSyncAt: '2026-02-10T14:55:00.000Z',
        summary: 'Revenue systems, qualification playbooks, and sponsorship process docs.',
        activityCount: 8,
        openItemsCount: 3,
        files: warrenFiles,
        metadata: {
          owners: ['Warren'],
        },
      },
      {
        id: 'workspace-community',
        name: 'Clay',
        icon: 'C',
        color: 'bg-purple-500/20 text-purple-500',
        rootPath: '/root/.openclaw/workspace/community',
        branch: 'main',
        status: 'active',
        lastSyncAt: '2026-02-10T16:00:00.000Z',
        summary: 'Community automations, watcher jobs, and Discord loops.',
        activityCount: 14,
        openItemsCount: 3,
        files: [],
        metadata: {
          owners: ['Beacon'],
        },
      },
    ],
    docs: [
      {
        id: 'doc-org-chart-grid',
        title: 'Org Chart Grid Background — Command Center Polish',
        docType: 'overnight-log',
        owner: 'Muddy',
        ownerRole: 'Self Improvement',
        status: 'completed',
        summary: 'Adds a phosphor grid backdrop and restores the dark-first org chart feeling.',
        bodyMarkdown:
          'Implemented a grid backdrop, fixed theme defaults, and brought the org chart closer to command-center energy.',
        filePath: '/root/.openclaw/workspace/docs/overnight-log.md',
        workspaceId: 'workspace-marc',
        tags: ['ui', 'org-chart', 'polish'],
        sourceMeetingId: null,
        createdAt: '2026-02-10T05:00:00.000Z',
        metadata: {},
      },
      {
        id: 'doc-script-vault',
        title: 'Script Vault — Browse & Manage YouTube Scripts',
        docType: 'living-doc',
        owner: 'Gary',
        ownerRole: 'MARC OS Feature',
        status: 'completed',
        summary: 'Turns the scripts folder into a real content archive with lifecycle tracking.',
        bodyMarkdown:
          'Adds script cards, status tracking, filtering, preview modal, and metadata extraction for content ops.',
        filePath: '/root/.openclaw/workspace/docs/script-vault.md',
        workspaceId: 'workspace-gary',
        tags: ['content', 'scripts'],
        sourceMeetingId: null,
        createdAt: '2026-02-09T21:00:00.000Z',
        metadata: {},
      },
      {
        id: 'doc-prototype-fleet',
        title: 'Prototype Fleet Dashboard Widget — Quick Prototype Status at a Glance',
        docType: 'living-doc',
        owner: 'Elon',
        ownerRole: 'Self Improvement',
        status: 'completed',
        summary: 'Surfaces prototype health directly on the main dashboard.',
        bodyMarkdown:
          'Displays running/stopped counts, new-build badges, and direct links into the prototype lab.',
        filePath: '/root/.openclaw/workspace/docs/prototype-fleet.md',
        workspaceId: 'workspace-elon',
        tags: ['prototype', 'dashboard'],
        sourceMeetingId: null,
        createdAt: '2026-02-07T20:00:00.000Z',
        metadata: {},
      },
      {
        id: 'doc-video-autopsy',
        title: 'Video Autopsy — Forensic Video Performance Analysis',
        docType: 'living-doc',
        owner: 'Gary',
        ownerRole: 'Feature',
        status: 'building',
        summary: 'Compares two video concepts side by side to explain likely performance.',
        bodyMarkdown:
          'In progress: side-by-side hook comparison, packaging analysis, and title-shape review.',
        filePath: '/root/.openclaw/workspace/docs/video-autopsy.md',
        workspaceId: 'workspace-gary',
        tags: ['analysis', 'video'],
        sourceMeetingId: null,
        createdAt: '2026-02-06T18:00:00.000Z',
        metadata: {},
      },
    ],
    meetings: [
      {
        id: 'meeting-partnership',
        slug: 'partnership-sponsorship-strategy',
        title: 'Executive Standup: Partnership & Sponsorship Strategy',
        topic: 'Partnership & Sponsorship Strategy',
        status: 'completed',
        dateLabel: 'Tuesday, February 10, 2026',
        timeLabel: '11:22 AM WET',
        participants: [
          participant('agent-muddy', 'Marc', 'COO', '🧠', 'green'),
          participant('agent-gary', 'Gary', 'CMO', '📣', 'yellow'),
          participant('agent-elon', 'Elon', 'CTO', '🔧', 'blue'),
          participant('agent-warren', 'Warren', 'CRO', '💰', 'purple'),
        ],
        startAt: '2026-02-10T11:22:00.000Z',
        endAt: '2026-02-10T11:28:00.000Z',
        voiceEnabled: true,
        audioUrl: null,
        audioDurationSec: 96,
        summary:
          'The chiefs aligned on a qualification-first sponsorship process and packaged the playbook.',
        preview:
          "Alright team, let's get into it. Marcelo's getting inbound partnership requests — companies wanting to pay for links in videos...",
        transcriptText:
          "Marc: Alright team, let's get into it.\n\nWarren: The fact that inbound is happening at low subs is a signal.\n\nGary: Most requests are probably garbage.\n\nElon: I'll set up the alias and tracker.\n\nMarc: Perfect. Let's wrap with action items.",
        metadata: {
          workspaceId: 'workspace-marc',
        },
        turns: [
          {
            id: 'turn-1',
            meetingId: 'meeting-partnership',
            turnIndex: 1,
            speakerId: 'agent-muddy',
            speakerName: 'Marc',
            speakerRole: 'COO',
            content:
              "Alright team, let's get into it. Marcelo's getting inbound partnership requests — companies wanting to pay for links in videos, product mentions, that kind of thing. We've never monetized, so we need a real process.",
            voice: 'en-US-Journey-D',
            durationSec: 24,
            createdAt: '2026-02-10T11:22:00.000Z',
            metadata: {
              color: '#22c55e',
            },
          },
          {
            id: 'turn-2',
            meetingId: 'meeting-partnership',
            turnIndex: 2,
            speakerId: 'agent-warren',
            speakerName: 'Warren',
            speakerRole: 'CRO',
            content:
              "The fact that inbound exists at this stage tells us audience quality is high. We need a qualification filter so Marcelo never has to inspect garbage opportunities.",
            voice: 'en-GB-Journey-D',
            durationSec: 24,
            createdAt: '2026-02-10T11:23:00.000Z',
            metadata: {
              color: '#a855f7',
            },
          },
          {
            id: 'turn-3',
            meetingId: 'meeting-partnership',
            turnIndex: 3,
            speakerId: 'agent-gary',
            speakerName: 'Gary',
            speakerRole: 'CMO',
            content:
              "Most of these inbound requests are probably garbage. We need a warm decline template and a filter that protects the brand.",
            voice: 'en-US-Journey-F',
            durationSec: 20,
            createdAt: '2026-02-10T11:24:00.000Z',
            metadata: {
              color: '#eab308',
            },
          },
          {
            id: 'turn-4',
            meetingId: 'meeting-partnership',
            turnIndex: 4,
            speakerId: 'agent-elon',
            speakerName: 'Elon',
            speakerRole: 'CTO',
            content:
              "I'll set up the partnerships alias today and build a simple tracker. We can upgrade later if volume justifies it.",
            voice: 'en-AU-Journey-D',
            durationSec: 17,
            createdAt: '2026-02-10T11:25:00.000Z',
            metadata: {
              color: '#3b82f6',
            },
          },
          {
            id: 'turn-5',
            meetingId: 'meeting-partnership',
            turnIndex: 5,
            speakerId: 'agent-muddy',
            speakerName: 'Marc',
            speakerRole: 'COO',
            content: "Perfect. Let's wrap this up with clear action items.",
            voice: 'en-US-Journey-D',
            durationSec: 11,
            createdAt: '2026-02-10T11:26:00.000Z',
            metadata: {
              color: '#22c55e',
            },
          },
        ],
        artifacts: [
          {
            id: 'artifact-partnership-alias',
            meetingId: 'meeting-partnership',
            title: 'partnerships@instadesk.ai',
            artifactType: 'deliverable',
            owner: 'Elon',
            summary: "Google Workspace alias created, forwarding to Marc's inbox.",
            bodyMarkdown:
              "Google Workspace alias created, forwarding to Marc's inbox with BCC to marcelo@instadesk.ai. Set up and tested.",
            filePath: null,
            status: 'completed',
            sortOrder: 1,
            metadata: {},
          },
          {
            id: 'artifact-warm-decline',
            meetingId: 'meeting-partnership',
            title: 'Warm decline template',
            artifactType: 'playbook',
            owner: 'Gary',
            summary: 'Human-sounding response that protects the brand without burning bridges.',
            bodyMarkdown:
              "Adapt this every time — never copy-paste verbatim. Mention the product, sound like a person, and leave the door open without promising anything.",
            filePath: '/root/.openclaw/workspace/docs/playbooks/partnership-communications.md',
            status: 'completed',
            sortOrder: 2,
            metadata: {},
          },
          {
            id: 'artifact-qualification-checklist',
            meetingId: 'meeting-partnership',
            title: 'Qualification checklist',
            artifactType: 'deliverable',
            owner: 'Warren',
            summary: 'Three gates before any rate discussion happens.',
            bodyMarkdown:
              "1. Product fit\n2. Audience respect\n3. Editorial control\n4. Enough upside to justify attention",
            filePath: '/root/.openclaw/workspace/docs/playbooks/qualification-checklist.md',
            status: 'completed',
            sortOrder: 3,
            metadata: {},
          },
        ],
      },
      {
        id: 'meeting-memory',
        slug: 'memory-soul-skills-architecture',
        title: 'Executive Standup — Memory, SOUL & Skills Architecture',
        topic: 'Memory, SOUL & Skills Architecture',
        status: 'completed',
        dateLabel: 'Tuesday, February 10, 2026',
        timeLabel: '10:25 GMT',
        participants: [
          participant('agent-muddy', 'Marc', 'COO', '🧠', 'green'),
          participant('agent-gary', 'Gary', 'CMO', '📣', 'yellow'),
          participant('agent-elon', 'Elon', 'CTO', '🔧', 'blue'),
          participant('agent-warren', 'Warren', 'CRO', '💰', 'purple'),
        ],
        startAt: '2026-02-10T10:25:00.000Z',
        endAt: '2026-02-10T10:32:00.000Z',
        voiceEnabled: false,
        audioUrl: null,
        audioDurationSec: 0,
        summary: 'Reviewed memory layers, docs, and operating structure for the agent stack.',
        preview:
          "Alright, pulling everyone in. Today's topic is our own memory architecture — SOUL.md, MEMORY.md, AGENTS.md...",
        transcriptText:
          'Marc: We need durable identity.\n\nElon: The workspace stays source-of-truth.\n\nGary: Living docs should read like a system that knows itself.',
        metadata: {
          workspaceId: 'workspace-marc',
        },
        turns: [],
        artifacts: [],
      },
    ],
  };
}
