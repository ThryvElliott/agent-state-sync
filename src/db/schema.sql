PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  root_path TEXT,
  default_branch TEXT,
  external_ref TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS threads (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('active', 'blocked', 'paused', 'completed')
  ),
  branch TEXT,
  priority INTEGER,
  context TEXT,
  external_ref TEXT,
  last_active_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  UNIQUE (project_id, slug)
);

CREATE TABLE IF NOT EXISTS thread_items (
  id TEXT PRIMARY KEY,
  thread_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (
    kind IN ('next_step', 'blocker', 'gotcha', 'decision')
  ),
  content TEXT NOT NULL,
  position INTEGER NOT NULL,
  is_done INTEGER NOT NULL DEFAULT 0 CHECK (is_done IN (0, 1)),
  external_ref TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  thread_id TEXT,
  kind TEXT NOT NULL CHECK (
    kind IN ('journal', 'durable_note', 'work_log', 'reference')
  ),
  title TEXT,
  body TEXT NOT NULL,
  summary TEXT,
  external_ref TEXT,
  recorded_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS skills (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  kind TEXT NOT NULL CHECK (
    kind IN ('skill', 'rule', 'prompt', 'workflow')
  ),
  body TEXT,
  version TEXT,
  external_ref TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (slug, kind)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  thread_id TEXT,
  agent TEXT NOT NULL CHECK (
    agent IN ('claude', 'cursor', 'codex', 'other')
  ),
  title TEXT,
  summary TEXT,
  external_ref TEXT,
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS session_artifacts (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL,
  kind TEXT NOT NULL CHECK (
    kind IN ('transcript', 'bundle', 'plan', 'log', 'diff')
  ),
  path TEXT,
  content TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  project_id TEXT,
  thread_id TEXT,
  kind TEXT NOT NULL CHECK (
    kind IN (
      'plan',
      'bundle_markdown',
      'bundle_json',
      'snapshot',
      'report'
    )
  ),
  title TEXT,
  path TEXT,
  content TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
  FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS sources (
  id TEXT PRIMARY KEY,
  agent TEXT NOT NULL CHECK (
    agent IN ('claude', 'cursor', 'codex', 'other')
  ),
  label TEXT NOT NULL,
  root_path TEXT NOT NULL,
  is_enabled INTEGER NOT NULL DEFAULT 1 CHECK (is_enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS source_records (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  canonical_table TEXT NOT NULL,
  canonical_id TEXT NOT NULL,
  source_type TEXT NOT NULL,
  source_path TEXT NOT NULL DEFAULT '',
  source_key TEXT NOT NULL DEFAULT '',
  source_hash TEXT,
  source_updated_at TEXT,
  ingested_at TEXT NOT NULL,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE,
  UNIQUE (
    source_id,
    canonical_table,
    canonical_id,
    source_type,
    source_path,
    source_key
  )
);

CREATE TABLE IF NOT EXISTS ingest_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  finished_at TEXT,
  status TEXT NOT NULL CHECK (
    status IN ('running', 'success', 'partial', 'failed')
  ),
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_written INTEGER NOT NULL DEFAULT 0,
  error_text TEXT,
  FOREIGN KEY (source_id) REFERENCES sources(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_threads_project_id
  ON threads(project_id);

CREATE INDEX IF NOT EXISTS idx_threads_status
  ON threads(status);

CREATE INDEX IF NOT EXISTS idx_thread_items_thread_id_kind
  ON thread_items(thread_id, kind);

CREATE UNIQUE INDEX IF NOT EXISTS idx_thread_items_unique_position
  ON thread_items(thread_id, kind, position);

CREATE INDEX IF NOT EXISTS idx_memories_project_id
  ON memories(project_id);

CREATE INDEX IF NOT EXISTS idx_memories_thread_id
  ON memories(thread_id);

CREATE INDEX IF NOT EXISTS idx_sessions_project_id
  ON sessions(project_id);

CREATE INDEX IF NOT EXISTS idx_sessions_agent
  ON sessions(agent);

CREATE INDEX IF NOT EXISTS idx_source_records_lookup
  ON source_records(source_id, canonical_table, canonical_id);

CREATE INDEX IF NOT EXISTS idx_ingest_runs_source_id_started_at
  ON ingest_runs(source_id, started_at);
