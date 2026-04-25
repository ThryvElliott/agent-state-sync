import { readFileSync } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import {
  openAgentStateDb,
  type AgentStateDb,
  type SqlParams,
} from './client.js';

const schemaSql = readFileSync(
  new URL('./schema.sql', import.meta.url),
  'utf8',
);
const NOW = '2026-04-24T12:00:00.000Z';

function createDb() {
  const db = openAgentStateDb({
    filename: ':memory:',
    schemaSql,
  });

  db.migrate();
  return db;
}

function insertProject(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO projects (
        id,
        slug,
        name,
        root_path,
        default_branch,
        external_ref,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @slug,
        @name,
        @root_path,
        @default_branch,
        @external_ref,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'project:marketing-center',
      slug: 'marketing-center',
      name: 'Marketing Center',
      root_path: '/Users/klaase01/projects/Marketing-Center',
      default_branch: 'main',
      external_ref: 'claude-project',
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertThread(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO threads (
        id,
        project_id,
        slug,
        title,
        summary,
        status,
        branch,
        priority,
        context,
        external_ref,
        last_active_at,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @project_id,
        @slug,
        @title,
        @summary,
        @status,
        @branch,
        @priority,
        @context,
        @external_ref,
        @last_active_at,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'thread:marketing-center:multi-location-auth-hotfix',
      project_id: 'project:marketing-center',
      slug: 'multi-location-auth-hotfix',
      title: 'Multi-location auth hotfix',
      summary: 'Hotfix authentication context drift.',
      status: 'active',
      branch: 'hotfix/multi-location-loginWithRedirect',
      priority: 1,
      context: 'Hotfix thread context',
      external_ref: 'claude-thread',
      last_active_at: NOW,
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertThreadItem(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO thread_items (
        id,
        thread_id,
        kind,
        content,
        position,
        is_done,
        external_ref,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @thread_id,
        @kind,
        @content,
        @position,
        @is_done,
        @external_ref,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'thread-item:1',
      thread_id: 'thread:marketing-center:multi-location-auth-hotfix',
      kind: 'next_step',
      content: 'Verify hotfix in production.',
      position: 0,
      is_done: 0,
      external_ref: 'claude-thread-item',
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertMemory(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO memories (
        id,
        project_id,
        thread_id,
        kind,
        title,
        body,
        summary,
        external_ref,
        recorded_at,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @project_id,
        @thread_id,
        @kind,
        @title,
        @body,
        @summary,
        @external_ref,
        @recorded_at,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'memory:journal:1',
      project_id: 'project:marketing-center',
      thread_id: 'thread:marketing-center:multi-location-auth-hotfix',
      kind: 'journal',
      title: 'Daily journal',
      body: 'Worked on the multi-location auth hotfix.',
      summary: 'Auth hotfix progress.',
      external_ref: 'claude-journal-entry',
      recorded_at: NOW,
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertSkill(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO skills (
        id,
        slug,
        name,
        description,
        kind,
        body,
        version,
        external_ref,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @slug,
        @name,
        @description,
        @kind,
        @body,
        @version,
        @external_ref,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'skill:cursor:babysit',
      slug: 'babysit',
      name: 'Babysit',
      description: 'Keep a PR merge-ready.',
      kind: 'skill',
      body: 'Skill body',
      version: '1',
      external_ref: 'cursor-skill',
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertSession(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO sessions (
        id,
        project_id,
        thread_id,
        agent,
        title,
        summary,
        external_ref,
        started_at,
        ended_at,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @project_id,
        @thread_id,
        @agent,
        @title,
        @summary,
        @external_ref,
        @started_at,
        @ended_at,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'session:claude:1',
      project_id: 'project:marketing-center',
      thread_id: 'thread:marketing-center:multi-location-auth-hotfix',
      agent: 'claude',
      title: 'Claude planning session',
      summary: 'Discussed db schema.',
      external_ref: 'claude-session',
      started_at: NOW,
      ended_at: NOW,
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertSessionArtifact(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO session_artifacts (
        id,
        session_id,
        kind,
        path,
        content,
        created_at
      )
      VALUES (
        @id,
        @session_id,
        @kind,
        @path,
        @content,
        @created_at
      )
    `,
    {
      id: 'session-artifact:1',
      session_id: 'session:claude:1',
      kind: 'transcript',
      path: '/tmp/session.md',
      content: 'Transcript content',
      created_at: NOW,
      ...overrides,
    },
  );
}

function insertArtifact(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO artifacts (
        id,
        project_id,
        thread_id,
        kind,
        title,
        path,
        content,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @project_id,
        @thread_id,
        @kind,
        @title,
        @path,
        @content,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'artifact:plan:1',
      project_id: 'project:marketing-center',
      thread_id: 'thread:marketing-center:multi-location-auth-hotfix',
      kind: 'plan',
      title: 'Phase 1 plan',
      path: '/tmp/plan.md',
      content: 'Plan content',
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertSource(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO sources (
        id,
        agent,
        label,
        root_path,
        is_enabled,
        created_at,
        updated_at
      )
      VALUES (
        @id,
        @agent,
        @label,
        @root_path,
        @is_enabled,
        @created_at,
        @updated_at
      )
    `,
    {
      id: 'source:claude-home',
      agent: 'claude',
      label: 'Claude Home',
      root_path: '/Users/klaase01/.claude',
      is_enabled: 1,
      created_at: NOW,
      updated_at: NOW,
      ...overrides,
    },
  );
}

function insertSourceRecord(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO source_records (
        id,
        source_id,
        canonical_table,
        canonical_id,
        source_type,
        source_path,
        source_key,
        source_hash,
        source_updated_at,
        ingested_at
      )
      VALUES (
        @id,
        @source_id,
        @canonical_table,
        @canonical_id,
        @source_type,
        @source_path,
        @source_key,
        @source_hash,
        @source_updated_at,
        @ingested_at
      )
    `,
    {
      id: 'source-record:1',
      source_id: 'source:claude-home',
      canonical_table: 'threads',
      canonical_id: 'thread:marketing-center:multi-location-auth-hotfix',
      source_type: 'state-file',
      source_path:
        '/Users/klaase01/.claude/project-states/marketing-center/state.json',
      source_key: 'threads.multi-location-auth-hotfix',
      source_hash: 'abc123',
      source_updated_at: NOW,
      ingested_at: NOW,
      ...overrides,
    },
  );
}

function insertIngestRun(db: AgentStateDb, overrides: SqlParams = {}) {
  db.run(
    `
      INSERT INTO ingest_runs (
        id,
        source_id,
        started_at,
        finished_at,
        status,
        records_seen,
        records_written,
        error_text
      )
      VALUES (
        @id,
        @source_id,
        @started_at,
        @finished_at,
        @status,
        @records_seen,
        @records_written,
        @error_text
      )
    `,
    {
      id: 'ingest-run:1',
      source_id: 'source:claude-home',
      started_at: NOW,
      finished_at: NOW,
      status: 'running',
      records_seen: 1,
      records_written: 1,
      error_text: null,
      ...overrides,
    },
  );
}

function getCount(db: AgentStateDb, tableName: string) {
  const result = db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM ${tableName}`,
  );

  return result?.count ?? 0;
}

describe('openAgentStateDb', () => {
  let db: AgentStateDb;

  beforeEach(() => {
    db = createDb();
  });

  afterEach(() => {
    db.close();
  });

  describe('migration bootstrap', () => {
    it('creates all expected tables on first migrate', () => {
      expect(db.hasTable('projects')).toBe(true);
      expect(db.hasTable('threads')).toBe(true);
      expect(db.hasTable('thread_items')).toBe(true);
      expect(db.hasTable('memories')).toBe(true);
      expect(db.hasTable('skills')).toBe(true);
      expect(db.hasTable('sessions')).toBe(true);
      expect(db.hasTable('session_artifacts')).toBe(true);
      expect(db.hasTable('artifacts')).toBe(true);
      expect(db.hasTable('sources')).toBe(true);
      expect(db.hasTable('source_records')).toBe(true);
      expect(db.hasTable('ingest_runs')).toBe(true);
    });

    it('creates all expected indexes on first migrate', () => {
      expect(db.hasIndex('idx_threads_project_id')).toBe(true);
      expect(db.hasIndex('idx_threads_status')).toBe(true);
      expect(db.hasIndex('idx_thread_items_thread_id_kind')).toBe(true);
      expect(db.hasIndex('idx_thread_items_unique_position')).toBe(true);
      expect(db.hasIndex('idx_memories_project_id')).toBe(true);
      expect(db.hasIndex('idx_memories_thread_id')).toBe(true);
      expect(db.hasIndex('idx_sessions_project_id')).toBe(true);
      expect(db.hasIndex('idx_sessions_agent')).toBe(true);
      expect(db.hasIndex('idx_source_records_lookup')).toBe(true);
      expect(db.hasIndex('idx_ingest_runs_source_id_started_at')).toBe(true);
    });

    it('sets schema user_version to 1 after first migrate', () => {
      expect(db.getUserVersion()).toBe(1);
    });

    it('can run migrate twice without error', () => {
      db.migrate();

      expect(db.getUserVersion()).toBe(1);
      expect(db.hasTable('projects')).toBe(true);
    });

    it('throws when the database schema version is newer than supported', () => {
      db.setUserVersion(99);

      expect(() => db.migrate()).toThrow(/newer than supported version/i);
    });

    it('enables foreign key enforcement', () => {
      expect(() => insertThread(db)).toThrow();
    });
  });

  describe('generic query helpers', () => {
    it('supports exec for raw SQL batches and all for result lists', () => {
      db.exec(`
        INSERT INTO projects (
          id,
          slug,
          name,
          root_path,
          default_branch,
          external_ref,
          created_at,
          updated_at
        )
        VALUES
          (
            'project:one',
            'project-one',
            'Project One',
            '/tmp/project-one',
            'main',
            'raw-1',
            '${NOW}',
            '${NOW}'
          ),
          (
            'project:two',
            'project-two',
            'Project Two',
            '/tmp/project-two',
            'main',
            'raw-2',
            '${NOW}',
            '${NOW}'
          );
      `);

      const projects = db.all<{ slug: string }>(
        'SELECT slug FROM projects ORDER BY slug ASC',
      );

      expect(projects).toEqual([
        { slug: 'project-one' },
        { slug: 'project-two' },
      ]);
    });

    it('supports named object parameters and positional array parameters', () => {
      db.run(
        `
          INSERT INTO projects (
            id,
            slug,
            name,
            root_path,
            default_branch,
            external_ref,
            created_at,
            updated_at
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          'project:cursor',
          'cursor-project',
          'Cursor Project',
          '/tmp/cursor-project',
          'main',
          'cursor',
          NOW,
          NOW,
        ],
      );

      const result = db.get<{ name: string }>(
        'SELECT name FROM projects WHERE id = @id',
        { id: 'project:cursor' },
      );

      expect(result).toEqual({ name: 'Cursor Project' });
    });

    it('rejects negative schema versions', () => {
      expect(() => db.setUserVersion(-1)).toThrow(/non-negative integer/i);
    });
  });

  describe('projects', () => {
    it('inserts a valid project row', () => {
      insertProject(db);

      const project = db.get<{ slug: string; name: string }>(
        'SELECT slug, name FROM projects WHERE id = ?',
        ['project:marketing-center'],
      );

      expect(project).toEqual({
        slug: 'marketing-center',
        name: 'Marketing Center',
      });
    });

    it('rejects duplicate project slug', () => {
      insertProject(db);

      expect(() =>
        insertProject(db, {
          id: 'project:duplicate',
          name: 'Duplicate',
        }),
      ).toThrow();
    });
  });

  describe('threads', () => {
    it('inserts a valid thread row for an existing project', () => {
      insertProject(db);
      insertThread(db);

      const thread = db.get<{ slug: string; status: string }>(
        'SELECT slug, status FROM threads WHERE id = ?',
        ['thread:marketing-center:multi-location-auth-hotfix'],
      );

      expect(thread).toEqual({
        slug: 'multi-location-auth-hotfix',
        status: 'active',
      });
    });

    it('rejects invalid thread status', () => {
      insertProject(db);

      expect(() =>
        insertThread(db, {
          id: 'thread:bad-status',
          slug: 'bad-status',
          status: 'todo',
        }),
      ).toThrow();
    });

    it('enforces unique project slug combinations', () => {
      insertProject(db);
      insertThread(db);

      expect(() =>
        insertThread(db, {
          id: 'thread:duplicate',
          title: 'Duplicate thread',
        }),
      ).toThrow();
    });

    it('allows the same thread slug in different projects', () => {
      insertProject(db);
      insertProject(db, {
        id: 'project:marketing-center-backend',
        slug: 'marketing-center-backend',
        name: 'Marketing Center Backend',
      });

      insertThread(db);
      insertThread(db, {
        id: 'thread:backend:multi-location-auth-hotfix',
        project_id: 'project:marketing-center-backend',
        slug: 'multi-location-auth-hotfix',
        title: 'Backend thread',
      });

      expect(getCount(db, 'threads')).toBe(2);
    });

    it('deletes threads when the parent project is deleted', () => {
      insertProject(db);
      insertThread(db);

      db.run('DELETE FROM projects WHERE id = ?', ['project:marketing-center']);

      expect(getCount(db, 'threads')).toBe(0);
    });
  });

  describe('thread_items', () => {
    it('inserts valid thread items for each supported kind', () => {
      insertProject(db);
      insertThread(db);

      insertThreadItem(db, {
        id: 'thread-item:next-step',
        kind: 'next_step',
        position: 0,
      });
      insertThreadItem(db, {
        id: 'thread-item:blocker',
        kind: 'blocker',
        position: 0,
      });
      insertThreadItem(db, {
        id: 'thread-item:gotcha',
        kind: 'gotcha',
        position: 0,
      });
      insertThreadItem(db, {
        id: 'thread-item:decision',
        kind: 'decision',
        position: 0,
      });

      expect(getCount(db, 'thread_items')).toBe(4);
    });

    it('rejects invalid thread item kinds', () => {
      insertProject(db);
      insertThread(db);

      expect(() =>
        insertThreadItem(db, {
          kind: 'note',
        }),
      ).toThrow();
    });

    it('rejects duplicate positions for the same thread item kind', () => {
      insertProject(db);
      insertThread(db);
      insertThreadItem(db);

      expect(() =>
        insertThreadItem(db, {
          id: 'thread-item:duplicate-position',
          content: 'Duplicate next step',
        }),
      ).toThrow();
    });

    it('cascades delete from threads to thread items', () => {
      insertProject(db);
      insertThread(db);
      insertThreadItem(db);

      db.run('DELETE FROM threads WHERE id = ?', [
        'thread:marketing-center:multi-location-auth-hotfix',
      ]);

      expect(getCount(db, 'thread_items')).toBe(0);
    });
  });

  describe('memories', () => {
    it('inserts a valid memory linked to a project and thread', () => {
      insertProject(db);
      insertThread(db);
      insertMemory(db);

      const memory = db.get<{ project_id: string; thread_id: string }>(
        'SELECT project_id, thread_id FROM memories WHERE id = ?',
        ['memory:journal:1'],
      );

      expect(memory).toEqual({
        project_id: 'project:marketing-center',
        thread_id: 'thread:marketing-center:multi-location-auth-hotfix',
      });
    });

    it('rejects invalid memory kinds', () => {
      insertProject(db);
      insertThread(db);

      expect(() =>
        insertMemory(db, {
          kind: 'summary',
        }),
      ).toThrow();
    });

    it('sets thread_id to null when a thread is deleted', () => {
      insertProject(db);
      insertThread(db);
      insertMemory(db);

      db.run('DELETE FROM threads WHERE id = ?', [
        'thread:marketing-center:multi-location-auth-hotfix',
      ]);

      const memory = db.get<{ thread_id: string | null }>(
        'SELECT thread_id FROM memories WHERE id = ?',
        ['memory:journal:1'],
      );

      expect(memory).toEqual({ thread_id: null });
    });

    it('sets project_id to null when a project is deleted', () => {
      insertProject(db);
      insertMemory(db, {
        thread_id: null,
      });

      db.run('DELETE FROM projects WHERE id = ?', ['project:marketing-center']);

      const memory = db.get<{ project_id: string | null }>(
        'SELECT project_id FROM memories WHERE id = ?',
        ['memory:journal:1'],
      );

      expect(memory).toEqual({ project_id: null });
    });
  });

  describe('skills', () => {
    it('inserts a valid skill row', () => {
      insertSkill(db);

      const skill = db.get<{ slug: string; kind: string }>(
        'SELECT slug, kind FROM skills WHERE id = ?',
        ['skill:cursor:babysit'],
      );

      expect(skill).toEqual({
        slug: 'babysit',
        kind: 'skill',
      });
    });

    it('rejects invalid skill kinds', () => {
      expect(() =>
        insertSkill(db, {
          kind: 'macro',
        }),
      ).toThrow();
    });

    it('enforces unique slug and kind combinations', () => {
      insertSkill(db);

      expect(() =>
        insertSkill(db, {
          id: 'skill:duplicate',
          name: 'Duplicate',
        }),
      ).toThrow();
    });

    it('allows the same slug across different kinds', () => {
      insertSkill(db);
      insertSkill(db, {
        id: 'workflow:review',
        slug: 'babysit',
        kind: 'workflow',
        name: 'Babysit workflow',
      });

      expect(getCount(db, 'skills')).toBe(2);
    });
  });

  describe('sessions', () => {
    it('inserts a valid session row', () => {
      insertProject(db);
      insertThread(db);
      insertSession(db);

      const session = db.get<{ agent: string; title: string }>(
        'SELECT agent, title FROM sessions WHERE id = ?',
        ['session:claude:1'],
      );

      expect(session).toEqual({
        agent: 'claude',
        title: 'Claude planning session',
      });
    });

    it('rejects invalid session agents', () => {
      insertProject(db);
      insertThread(db);

      expect(() =>
        insertSession(db, {
          agent: 'copilot',
        }),
      ).toThrow();
    });

    it('sets thread_id to null when a thread is deleted', () => {
      insertProject(db);
      insertThread(db);
      insertSession(db);

      db.run('DELETE FROM threads WHERE id = ?', [
        'thread:marketing-center:multi-location-auth-hotfix',
      ]);

      const session = db.get<{ thread_id: string | null }>(
        'SELECT thread_id FROM sessions WHERE id = ?',
        ['session:claude:1'],
      );

      expect(session).toEqual({ thread_id: null });
    });

    it('sets project_id to null when a project is deleted', () => {
      insertProject(db);
      insertSession(db, {
        thread_id: null,
      });

      db.run('DELETE FROM projects WHERE id = ?', ['project:marketing-center']);

      const session = db.get<{ project_id: string | null }>(
        'SELECT project_id FROM sessions WHERE id = ?',
        ['session:claude:1'],
      );

      expect(session).toEqual({ project_id: null });
    });
  });

  describe('session_artifacts', () => {
    it('inserts a valid session artifact row', () => {
      insertProject(db);
      insertThread(db);
      insertSession(db);
      insertSessionArtifact(db);

      const artifact = db.get<{ kind: string }>(
        'SELECT kind FROM session_artifacts WHERE id = ?',
        ['session-artifact:1'],
      );

      expect(artifact).toEqual({ kind: 'transcript' });
    });

    it('rejects invalid session artifact kinds', () => {
      insertProject(db);
      insertThread(db);
      insertSession(db);

      expect(() =>
        insertSessionArtifact(db, {
          kind: 'memory',
        }),
      ).toThrow();
    });

    it('cascades delete from sessions to session artifacts', () => {
      insertProject(db);
      insertThread(db);
      insertSession(db);
      insertSessionArtifact(db);

      db.run('DELETE FROM sessions WHERE id = ?', ['session:claude:1']);

      expect(getCount(db, 'session_artifacts')).toBe(0);
    });
  });

  describe('artifacts', () => {
    it('inserts a valid artifact row', () => {
      insertProject(db);
      insertThread(db);
      insertArtifact(db);

      const artifact = db.get<{ kind: string }>(
        'SELECT kind FROM artifacts WHERE id = ?',
        ['artifact:plan:1'],
      );

      expect(artifact).toEqual({ kind: 'plan' });
    });

    it('rejects invalid artifact kinds', () => {
      insertProject(db);
      insertThread(db);

      expect(() =>
        insertArtifact(db, {
          kind: 'export',
        }),
      ).toThrow();
    });

    it('sets project_id to null when a project is deleted', () => {
      insertProject(db);
      insertArtifact(db, {
        thread_id: null,
      });

      db.run('DELETE FROM projects WHERE id = ?', ['project:marketing-center']);

      const artifact = db.get<{ project_id: string | null }>(
        'SELECT project_id FROM artifacts WHERE id = ?',
        ['artifact:plan:1'],
      );

      expect(artifact).toEqual({ project_id: null });
    });
  });

  describe('sources', () => {
    it('inserts a valid source row', () => {
      insertSource(db);

      const source = db.get<{ agent: string; label: string }>(
        'SELECT agent, label FROM sources WHERE id = ?',
        ['source:claude-home'],
      );

      expect(source).toEqual({
        agent: 'claude',
        label: 'Claude Home',
      });
    });

    it('rejects invalid source agents', () => {
      expect(() =>
        insertSource(db, {
          agent: 'github',
        }),
      ).toThrow();
    });

    it('rejects invalid source enabled flags', () => {
      expect(() =>
        insertSource(db, {
          is_enabled: 2,
        }),
      ).toThrow();
    });
  });

  describe('source_records', () => {
    it('inserts a valid source record', () => {
      insertSource(db);
      insertSourceRecord(db);

      const record = db.get<{ canonical_table: string }>(
        'SELECT canonical_table FROM source_records WHERE id = ?',
        ['source-record:1'],
      );

      expect(record).toEqual({ canonical_table: 'threads' });
    });

    it('rejects duplicate source record mappings', () => {
      insertSource(db);
      insertSourceRecord(db);

      expect(() =>
        insertSourceRecord(db, {
          id: 'source-record:duplicate',
          source_hash: 'def456',
        }),
      ).toThrow();
    });

    it('rejects duplicate source record mappings with empty source locators', () => {
      insertSource(db);
      insertSourceRecord(db, {
        source_key: '',
        source_path: '',
      });

      expect(() =>
        insertSourceRecord(db, {
          id: 'source-record:duplicate',
          source_hash: 'def456',
          source_key: '',
          source_path: '',
        }),
      ).toThrow();
    });

    it('cascades delete from sources to source records', () => {
      insertSource(db);
      insertSourceRecord(db);

      db.run('DELETE FROM sources WHERE id = ?', ['source:claude-home']);

      expect(getCount(db, 'source_records')).toBe(0);
    });
  });

  describe('ingest_runs', () => {
    it('inserts a valid ingest run', () => {
      insertSource(db);
      insertIngestRun(db);

      const run = db.get<{ status: string }>(
        'SELECT status FROM ingest_runs WHERE id = ?',
        ['ingest-run:1'],
      );

      expect(run).toEqual({ status: 'running' });
    });

    it('rejects invalid ingest run statuses', () => {
      insertSource(db);

      expect(() =>
        insertIngestRun(db, {
          status: 'queued',
        }),
      ).toThrow();
    });

    it('cascades delete from sources to ingest runs', () => {
      insertSource(db);
      insertIngestRun(db);

      db.run('DELETE FROM sources WHERE id = ?', ['source:claude-home']);

      expect(getCount(db, 'ingest_runs')).toBe(0);
    });
  });

  describe('transactions', () => {
    it('rolls back all writes when a transaction fails', () => {
      expect(() =>
        db.withTransaction(() => {
          insertProject(db);
          insertThread(db, {
            id: 'thread:bad-status',
            slug: 'bad-status',
            status: 'todo',
          });
        }),
      ).toThrow();

      expect(getCount(db, 'projects')).toBe(0);
      expect(getCount(db, 'threads')).toBe(0);
    });

    it('commits all writes when a transaction succeeds', () => {
      db.withTransaction(() => {
        insertProject(db);
        insertThread(db);
      });

      expect(getCount(db, 'projects')).toBe(1);
      expect(getCount(db, 'threads')).toBe(1);
    });
  });
});
