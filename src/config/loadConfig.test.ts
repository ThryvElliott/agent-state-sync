import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import {
  getDefaultConfig,
  loadConfig,
  normalizeConfigPaths,
  resolveHomePath,
} from './loadConfig.js';

const HOME = '/Users/klaase01';

describe('loadConfig', () => {
  it('resolves the home directory shortcut', () => {
    expect(resolveHomePath('~', HOME)).toBe(HOME);
    expect(resolveHomePath('~/.agent-state-sync', HOME)).toBe(
      '/Users/klaase01/.agent-state-sync',
    );
    expect(resolveHomePath('/tmp/agent-state-sync', HOME)).toBe(
      '/tmp/agent-state-sync',
    );
  });

  it('builds the expected default config', () => {
    expect(getDefaultConfig(HOME)).toEqual({
      bundleRoot: '/Users/klaase01/.agent-state-sync/bundles',
      canonicalRoot: '/Users/klaase01/.agent-state-sync',
      databasePath: '/Users/klaase01/.agent-state-sync/state.db',
      historyRoot: '/Users/klaase01/.agent-state-sync/history',
      sources: {
        claude: {
          enabled: true,
          rootPath: '/Users/klaase01/.claude',
        },
        codex: {
          enabled: true,
          rootPath: '/Users/klaase01/.codex',
        },
        cursor: {
          enabled: true,
          rootPath: '/Users/klaase01/.cursor',
        },
      },
    });
  });

  it('normalizes home-relative paths throughout the config', () => {
    const normalizedConfig = normalizeConfigPaths(
      {
        bundleRoot: '~/.agent-state-sync/bundles',
        canonicalRoot: '~/.agent-state-sync',
        databasePath: '~/.agent-state-sync/state.db',
        historyRoot: '~/.agent-state-sync/history',
        sources: {
          claude: {
            enabled: true,
            rootPath: '~/.claude',
          },
          codex: {
            enabled: true,
            rootPath: '~/.codex',
          },
          cursor: {
            enabled: true,
            rootPath: '~/.cursor',
          },
        },
      },
      HOME,
    );

    expect(normalizedConfig).toEqual(getDefaultConfig(HOME));
  });

  it('returns the default config when no config file exists', () => {
    const config = loadConfig({
      configPath: '/tmp/missing-config.json',
      fileExists: () => false,
      homeDir: HOME,
    });

    expect(config).toEqual(getDefaultConfig(HOME));
  });

  it('uses default file checks when the default config path is missing', () => {
    const homeDir = mkdtempSync(join(tmpdir(), 'agent-state-sync-home-'));

    try {
      const config = loadConfig({
        homeDir,
      });

      expect(config).toEqual(getDefaultConfig(homeDir));
    } finally {
      rmSync(homeDir, { force: true, recursive: true });
    }
  });

  it('loads an on-disk config with the default file readers', () => {
    const homeDir = mkdtempSync(join(tmpdir(), 'agent-state-sync-home-'));
    const configDir = join(homeDir, '.agent-state-sync');
    const configPath = join(configDir, 'config.json');

    try {
      mkdirSync(configDir, { recursive: true });
      writeFileSync(
        configPath,
        JSON.stringify({
          bundleRoot: '~/.agent-state-sync/custom-bundles',
          sources: {
            claude: {
              enabled: false,
            },
          },
        }),
      );

      const config = loadConfig({
        homeDir,
      });

      expect(config).toEqual({
        ...getDefaultConfig(homeDir),
        bundleRoot: join(homeDir, '.agent-state-sync/custom-bundles'),
        sources: {
          ...getDefaultConfig(homeDir).sources,
          claude: {
            enabled: false,
            rootPath: join(homeDir, '.claude'),
          },
        },
      });
    } finally {
      rmSync(homeDir, { force: true, recursive: true });
    }
  });

  it('merges a file config onto the defaults', () => {
    const config = loadConfig({
      configPath: '/tmp/config.json',
      fileExists: () => true,
      homeDir: HOME,
      readFile: () =>
        JSON.stringify({
          bundleRoot: '~/.agent-state-sync/custom-bundles',
          sources: {
            codex: {
              enabled: false,
            },
            cursor: {
              rootPath: '~/custom-cursor',
            },
          },
        }),
    });

    expect(config).toEqual({
      bundleRoot: '/Users/klaase01/.agent-state-sync/custom-bundles',
      canonicalRoot: '/Users/klaase01/.agent-state-sync',
      databasePath: '/Users/klaase01/.agent-state-sync/state.db',
      historyRoot: '/Users/klaase01/.agent-state-sync/history',
      sources: {
        claude: {
          enabled: true,
          rootPath: '/Users/klaase01/.claude',
        },
        codex: {
          enabled: false,
          rootPath: '/Users/klaase01/.codex',
        },
        cursor: {
          enabled: true,
          rootPath: '/Users/klaase01/custom-cursor',
        },
      },
    });
  });

  it('throws when the config file contains invalid JSON', () => {
    expect(() =>
      loadConfig({
        configPath: '/tmp/config.json',
        fileExists: () => true,
        homeDir: HOME,
        readFile: () => '{invalid json',
      }),
    ).toThrow();
  });
});
