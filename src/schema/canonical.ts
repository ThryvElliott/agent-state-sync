const includes = <T extends string>(values: readonly T[], value: string) =>
  values.includes(value as T);

export const THREAD_STATUSES = [
  'active',
  'blocked',
  'paused',
  'completed',
] as const;

export const THREAD_ITEM_KINDS = [
  'next_step',
  'blocker',
  'gotcha',
  'decision',
] as const;

export const MEMORY_KINDS = [
  'journal',
  'durable_note',
  'work_log',
  'reference',
] as const;

export const SKILL_KINDS = ['skill', 'rule', 'prompt', 'workflow'] as const;

export const AGENT_KINDS = ['claude', 'cursor', 'codex', 'other'] as const;

export const SESSION_ARTIFACT_KINDS = [
  'transcript',
  'bundle',
  'plan',
  'log',
  'diff',
] as const;

export const ARTIFACT_KINDS = [
  'plan',
  'bundle_markdown',
  'bundle_json',
  'snapshot',
  'report',
] as const;

export const INGEST_STATUSES = [
  'running',
  'success',
  'partial',
  'failed',
] as const;

export type ThreadStatus = (typeof THREAD_STATUSES)[number];
export type ThreadItemKind = (typeof THREAD_ITEM_KINDS)[number];
export type MemoryKind = (typeof MEMORY_KINDS)[number];
export type SkillKind = (typeof SKILL_KINDS)[number];
export type AgentKind = (typeof AGENT_KINDS)[number];
export type SessionArtifactKind = (typeof SESSION_ARTIFACT_KINDS)[number];
export type ArtifactKind = (typeof ARTIFACT_KINDS)[number];
export type IngestStatus = (typeof INGEST_STATUSES)[number];

export interface ProjectRow {
  id: string;
  slug: string;
  name: string;
  root_path: string | null;
  default_branch: string | null;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThreadRow {
  id: string;
  project_id: string;
  slug: string;
  title: string;
  summary: string | null;
  status: ThreadStatus;
  branch: string | null;
  priority: number | null;
  context: string | null;
  external_ref: string | null;
  last_active_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ThreadItemRow {
  id: string;
  thread_id: string;
  kind: ThreadItemKind;
  content: string;
  position: number;
  is_done: 0 | 1;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface MemoryRow {
  id: string;
  project_id: string | null;
  thread_id: string | null;
  kind: MemoryKind;
  title: string | null;
  body: string;
  summary: string | null;
  external_ref: string | null;
  recorded_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SkillRow {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  kind: SkillKind;
  body: string | null;
  version: string | null;
  external_ref: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionRow {
  id: string;
  project_id: string | null;
  thread_id: string | null;
  agent: AgentKind;
  title: string | null;
  summary: string | null;
  external_ref: string | null;
  started_at: string | null;
  ended_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionArtifactRow {
  id: string;
  session_id: string;
  kind: SessionArtifactKind;
  path: string | null;
  content: string | null;
  created_at: string;
}

export interface ArtifactRow {
  id: string;
  project_id: string | null;
  thread_id: string | null;
  kind: ArtifactKind;
  title: string | null;
  path: string | null;
  content: string | null;
  created_at: string;
  updated_at: string;
}

export interface SourceRow {
  id: string;
  agent: AgentKind;
  label: string;
  root_path: string;
  is_enabled: 0 | 1;
  created_at: string;
  updated_at: string;
}

export interface SourceRecordRow {
  id: string;
  source_id: string;
  canonical_table: string;
  canonical_id: string;
  source_type: string;
  source_path: string | null;
  source_key: string | null;
  source_hash: string | null;
  source_updated_at: string | null;
  ingested_at: string;
}

export interface IngestRunRow {
  id: string;
  source_id: string;
  started_at: string;
  finished_at: string | null;
  status: IngestStatus;
  records_seen: number;
  records_written: number;
  error_text: string | null;
}

export function isThreadStatus(value: string): value is ThreadStatus {
  return includes(THREAD_STATUSES, value);
}

export function isThreadItemKind(value: string): value is ThreadItemKind {
  return includes(THREAD_ITEM_KINDS, value);
}

export function isMemoryKind(value: string): value is MemoryKind {
  return includes(MEMORY_KINDS, value);
}

export function isSkillKind(value: string): value is SkillKind {
  return includes(SKILL_KINDS, value);
}

export function isAgentKind(value: string): value is AgentKind {
  return includes(AGENT_KINDS, value);
}

export function isSessionArtifactKind(
  value: string,
): value is SessionArtifactKind {
  return includes(SESSION_ARTIFACT_KINDS, value);
}

export function isArtifactKind(value: string): value is ArtifactKind {
  return includes(ARTIFACT_KINDS, value);
}

export function isIngestStatus(value: string): value is IngestStatus {
  return includes(INGEST_STATUSES, value);
}
