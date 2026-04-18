const migrations = [
  `
  CREATE TABLE IF NOT EXISTS agent_roles (
    slug TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    lane TEXT NOT NULL,
    color TEXT NOT NULL,
    description TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS agent_profiles (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role_slug TEXT NOT NULL REFERENCES agent_roles(slug),
    chief_id TEXT REFERENCES agent_profiles(id),
    model_key TEXT,
    workspace_id TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    persona TEXT NOT NULL,
    color TEXT NOT NULL,
    emoji TEXT NOT NULL,
    frequency TEXT,
    markets_json TEXT DEFAULT '[]',
    is_llm INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS model_fleet (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    provider TEXT NOT NULL,
    model_id TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    tokens_used INTEGER DEFAULT 0,
    total_cost REAL DEFAULT 0,
    total_sessions INTEGER DEFAULT 0,
    badge TEXT,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    agent_id TEXT REFERENCES agent_profiles(id),
    model_id TEXT,
    workspace_id TEXT,
    summary TEXT NOT NULL,
    log TEXT NOT NULL DEFAULT '',
    log_time TEXT,
    last_heartbeat_at TEXT,
    tokens_used INTEGER DEFAULT 0,
    total_cost REAL DEFAULT 0,
    model_tags_json TEXT DEFAULT '[]',
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS session_events (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    content TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'info',
    created_at TEXT DEFAULT (datetime('now')),
    metadata_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS scheduled_jobs (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    schedule_label TEXT NOT NULL,
    duration_label TEXT NOT NULL,
    job_kind TEXT NOT NULL,
    team TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    last_run_at TEXT,
    next_run_at TEXT,
    actions_json TEXT DEFAULT '[]',
    workspace_id TEXT,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    color TEXT NOT NULL,
    root_path TEXT,
    branch TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    last_sync_at TEXT,
    summary TEXT NOT NULL,
    activity_count INTEGER DEFAULT 0,
    open_items_count INTEGER DEFAULT 0,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS workspace_files (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relative_path TEXT NOT NULL,
    absolute_path TEXT NOT NULL,
    size INTEGER DEFAULT 0,
    updated_at TEXT,
    file_type TEXT NOT NULL DEFAULT 'text',
    content_preview TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now')),
    metadata_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS doc_entries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    owner_role TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    summary TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    file_path TEXT,
    workspace_id TEXT,
    tags_json TEXT DEFAULT '[]',
    source_meeting_id TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    metadata_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS meeting_runs (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    topic TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    date_label TEXT NOT NULL,
    time_label TEXT NOT NULL,
    participants_json TEXT DEFAULT '[]',
    start_at TEXT,
    end_at TEXT,
    voice_enabled INTEGER DEFAULT 0,
    audio_url TEXT,
    audio_duration_sec INTEGER DEFAULT 0,
    summary TEXT NOT NULL DEFAULT '',
    preview TEXT NOT NULL DEFAULT '',
    transcript_text TEXT NOT NULL DEFAULT '',
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS meeting_turns (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL REFERENCES meeting_runs(id) ON DELETE CASCADE,
    turn_index INTEGER NOT NULL,
    speaker_id TEXT,
    speaker_name TEXT NOT NULL,
    speaker_role TEXT NOT NULL,
    content TEXT NOT NULL,
    voice TEXT,
    duration_sec INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    metadata_json TEXT DEFAULT '{}'
  );

  CREATE TABLE IF NOT EXISTS meeting_artifacts (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL REFERENCES meeting_runs(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    artifact_type TEXT NOT NULL,
    owner TEXT NOT NULL,
    summary TEXT NOT NULL,
    body_markdown TEXT NOT NULL,
    file_path TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    sort_order INTEGER DEFAULT 0,
    metadata_json TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS system_stats (
    id TEXT PRIMARY KEY,
    metric_key TEXT NOT NULL,
    metric_label TEXT NOT NULL,
    metric_value REAL NOT NULL,
    tone TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sync_state (
    key TEXT PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'idle',
    last_synced_at TEXT,
    last_error TEXT,
    metadata_json TEXT DEFAULT '{}',
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_agent_profiles_role ON agent_profiles(role_slug);
  CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status, updated_at);
  CREATE INDEX IF NOT EXISTS idx_session_events_session ON session_events(session_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_jobs_status ON scheduled_jobs(status, next_run_at);
  CREATE INDEX IF NOT EXISTS idx_workspace_files_workspace ON workspace_files(workspace_id, name);
  CREATE INDEX IF NOT EXISTS idx_docs_created_at ON doc_entries(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_meeting_turns_meeting ON meeting_turns(meeting_id, turn_index);
  `
];

export function runMigrations(db: any) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      version INTEGER NOT NULL,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const applied = db
    .prepare('SELECT COALESCE(MAX(version), 0) as version FROM _migrations')
    .get() as { version: number };

  for (let index = applied.version; index < migrations.length; index += 1) {
    db.exec(migrations[index]);
    db.prepare('INSERT INTO _migrations (version) VALUES (?)').run(index + 1);
  }
}
