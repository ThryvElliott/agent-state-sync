import { describe, expect, it } from 'vitest';

import {
  AGENT_KINDS,
  ARTIFACT_KINDS,
  INGEST_STATUSES,
  MEMORY_KINDS,
  SESSION_ARTIFACT_KINDS,
  SKILL_KINDS,
  THREAD_ITEM_KINDS,
  THREAD_STATUSES,
  isAgentKind,
  isArtifactKind,
  isIngestStatus,
  isMemoryKind,
  isSessionArtifactKind,
  isSkillKind,
  isThreadItemKind,
  isThreadStatus,
  type ProjectRow,
  type ThreadRow,
} from './canonical.js';

describe('canonical schema helpers', () => {
  it('exports the expected canonical enum values', () => {
    expect(THREAD_STATUSES).toEqual([
      'active',
      'blocked',
      'paused',
      'completed',
    ]);
    expect(THREAD_ITEM_KINDS).toEqual([
      'next_step',
      'blocker',
      'gotcha',
      'decision',
    ]);
    expect(MEMORY_KINDS).toEqual([
      'journal',
      'durable_note',
      'work_log',
      'reference',
    ]);
    expect(SKILL_KINDS).toEqual(['skill', 'rule', 'prompt', 'workflow']);
    expect(AGENT_KINDS).toEqual(['claude', 'cursor', 'codex', 'other']);
    expect(SESSION_ARTIFACT_KINDS).toEqual([
      'transcript',
      'bundle',
      'plan',
      'log',
      'diff',
    ]);
    expect(ARTIFACT_KINDS).toEqual([
      'plan',
      'bundle_markdown',
      'bundle_json',
      'snapshot',
      'report',
    ]);
    expect(INGEST_STATUSES).toEqual([
      'running',
      'success',
      'partial',
      'failed',
    ]);
  });

  it('accepts valid values through the type guards', () => {
    expect(isThreadStatus('active')).toBe(true);
    expect(isThreadItemKind('decision')).toBe(true);
    expect(isMemoryKind('journal')).toBe(true);
    expect(isSkillKind('workflow')).toBe(true);
    expect(isAgentKind('cursor')).toBe(true);
    expect(isSessionArtifactKind('bundle')).toBe(true);
    expect(isArtifactKind('bundle_json')).toBe(true);
    expect(isIngestStatus('partial')).toBe(true);
  });

  it('rejects invalid values through the type guards', () => {
    expect(isThreadStatus('todo')).toBe(false);
    expect(isThreadItemKind('note')).toBe(false);
    expect(isMemoryKind('summary')).toBe(false);
    expect(isSkillKind('macro')).toBe(false);
    expect(isAgentKind('copilot')).toBe(false);
    expect(isSessionArtifactKind('memory')).toBe(false);
    expect(isArtifactKind('export')).toBe(false);
    expect(isIngestStatus('queued')).toBe(false);
  });

  it('keeps the row interfaces aligned with the expected field shapes', () => {
    const projectRow: ProjectRow = {
      id: 'project:marketing-center',
      slug: 'marketing-center',
      name: 'Marketing Center',
      root_path: '/Users/klaase01/projects/Marketing-Center',
      default_branch: 'main',
      external_ref: null,
      created_at: '2026-04-24T12:00:00.000Z',
      updated_at: '2026-04-24T12:00:00.000Z',
    };

    const threadRow: ThreadRow = {
      id: 'thread:marketing-center:phase-1',
      project_id: 'project:marketing-center',
      slug: 'phase-1',
      title: 'Phase 1',
      summary: null,
      status: 'active',
      branch: 'feat/phase-1',
      priority: 1,
      context: null,
      external_ref: null,
      last_active_at: null,
      created_at: '2026-04-24T12:00:00.000Z',
      updated_at: '2026-04-24T12:00:00.000Z',
    };

    expect(projectRow.slug).toBe('marketing-center');
    expect(threadRow.status).toBe('active');
  });
});
