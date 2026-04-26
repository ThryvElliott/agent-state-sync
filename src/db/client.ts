import Database from 'better-sqlite3';

export type SqlValue = string | number | null;
export type SqlParams = Record<string, SqlValue> | SqlValue[];

export interface OpenAgentStateDbOptions {
  filename: string;
  schemaSql: string;
  readonly?: boolean;
  fileMustExist?: boolean;
}

export interface AgentStateDb {
  readonly filename: string;

  migrate(): void;
  close(): void;

  exec(sql: string): void;
  run(sql: string, params?: SqlParams): Database.RunResult;
  get<T>(sql: string, params?: SqlParams): T | undefined;
  all<T>(sql: string, params?: SqlParams): T[];

  withTransaction<T>(fn: () => T): T;

  hasTable(name: string): boolean;
  hasIndex(name: string): boolean;

  getUserVersion(): number;
  setUserVersion(version: number): void;
}

const CURRENT_SCHEMA_VERSION = 1;

export function openAgentStateDb(
  options: OpenAgentStateDbOptions,
): AgentStateDb {
  const db = new Database(options.filename, {
    fileMustExist: options.fileMustExist ?? false,
    readonly: options.readonly ?? false,
  });

  db.pragma('foreign_keys = ON');

  function prepareStatement(sql: string) {
    return db.prepare(sql);
  }

  function bindParams(params?: SqlParams) {
    if (params === undefined) {
      return [];
    }

    return [params] as const;
  }

  return {
    filename: options.filename,

    migrate() {
      const version = Number(db.pragma('user_version', { simple: true }));

      if (version > CURRENT_SCHEMA_VERSION) {
        throw new Error(
          `Database schema version ${version} is newer than supported version ${CURRENT_SCHEMA_VERSION}.`,
        );
      }

      if (version === 0) {
        db.transaction(() => {
          db.exec(options.schemaSql);
          db.pragma(`user_version = ${CURRENT_SCHEMA_VERSION}`);
        })();
      }
    },

    close() {
      db.close();
    },

    exec(sql: string) {
      db.exec(sql);
    },

    run(sql: string, params?: SqlParams) {
      const statement = prepareStatement(sql);
      return statement.run(...bindParams(params));
    },

    get<T>(sql: string, params?: SqlParams) {
      const statement = prepareStatement(sql);
      return statement.get(...bindParams(params)) as T | undefined;
    },

    all<T>(sql: string, params?: SqlParams) {
      const statement = prepareStatement(sql);
      return statement.all(...bindParams(params)) as T[];
    },

    withTransaction<T>(fn: () => T) {
      const transaction = db.transaction(() => fn());
      return transaction();
    },

    hasTable(name: string) {
      const result = db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'table' AND name = ?
          `,
        )
        .get(name) as { name: string } | undefined;

      return result !== undefined;
    },

    hasIndex(name: string) {
      const result = db
        .prepare(
          `
            SELECT name
            FROM sqlite_master
            WHERE type = 'index' AND name = ?
          `,
        )
        .get(name) as { name: string } | undefined;

      return result !== undefined;
    },

    getUserVersion() {
      return Number(db.pragma('user_version', { simple: true }));
    },

    setUserVersion(version: number) {
      if (!Number.isInteger(version) || version < 0) {
        throw new Error('user_version must be a non-negative integer.');
      }

      db.pragma(`user_version = ${version}`);
    },
  };
}
