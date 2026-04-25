import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

export interface AgentStateSourceConfig {
  enabled: boolean;
  rootPath: string;
}

export interface AgentStateSyncConfig {
  bundleRoot: string;
  canonicalRoot: string;
  databasePath: string;
  historyRoot: string;
  sources: {
    claude: AgentStateSourceConfig;
    codex: AgentStateSourceConfig;
    cursor: AgentStateSourceConfig;
  };
}

export interface LoadConfigOptions {
  configPath?: string;
  fileExists?: (path: string) => boolean;
  homeDir?: string;
  readFile?: (path: string) => string;
}

type DeepPartialConfig = Partial<
  Omit<AgentStateSyncConfig, 'sources'> & {
    sources: Partial<
      Record<
        keyof AgentStateSyncConfig['sources'],
        Partial<AgentStateSourceConfig>
      >
    >;
  }
>;

export function resolveHomePath(inputPath: string, homeDir: string): string {
  if (inputPath === '~') {
    return homeDir;
  }

  if (inputPath.startsWith('~/')) {
    return join(homeDir, inputPath.slice(2));
  }

  return inputPath;
}

export function getDefaultConfig(homeDir: string): AgentStateSyncConfig {
  const canonicalRoot = join(homeDir, '.agent-state-sync');

  return {
    bundleRoot: join(canonicalRoot, 'bundles'),
    canonicalRoot,
    databasePath: join(canonicalRoot, 'state.db'),
    historyRoot: join(canonicalRoot, 'history'),
    sources: {
      claude: {
        enabled: true,
        rootPath: join(homeDir, '.claude'),
      },
      codex: {
        enabled: true,
        rootPath: join(homeDir, '.codex'),
      },
      cursor: {
        enabled: true,
        rootPath: join(homeDir, '.cursor'),
      },
    },
  };
}

export function normalizeConfigPaths(
  config: AgentStateSyncConfig,
  homeDir: string,
): AgentStateSyncConfig {
  return {
    ...config,
    bundleRoot: resolveHomePath(config.bundleRoot, homeDir),
    canonicalRoot: resolveHomePath(config.canonicalRoot, homeDir),
    databasePath: resolveHomePath(config.databasePath, homeDir),
    historyRoot: resolveHomePath(config.historyRoot, homeDir),
    sources: {
      claude: {
        ...config.sources.claude,
        rootPath: resolveHomePath(config.sources.claude.rootPath, homeDir),
      },
      codex: {
        ...config.sources.codex,
        rootPath: resolveHomePath(config.sources.codex.rootPath, homeDir),
      },
      cursor: {
        ...config.sources.cursor,
        rootPath: resolveHomePath(config.sources.cursor.rootPath, homeDir),
      },
    },
  };
}

function mergeConfig(
  baseConfig: AgentStateSyncConfig,
  overrideConfig: DeepPartialConfig,
): AgentStateSyncConfig {
  return {
    bundleRoot: overrideConfig.bundleRoot ?? baseConfig.bundleRoot,
    canonicalRoot: overrideConfig.canonicalRoot ?? baseConfig.canonicalRoot,
    databasePath: overrideConfig.databasePath ?? baseConfig.databasePath,
    historyRoot: overrideConfig.historyRoot ?? baseConfig.historyRoot,
    sources: {
      claude: {
        ...baseConfig.sources.claude,
        ...overrideConfig.sources?.claude,
      },
      codex: {
        ...baseConfig.sources.codex,
        ...overrideConfig.sources?.codex,
      },
      cursor: {
        ...baseConfig.sources.cursor,
        ...overrideConfig.sources?.cursor,
      },
    },
  };
}

export function loadConfig(
  options: LoadConfigOptions = {},
): AgentStateSyncConfig {
  const homeDir = options.homeDir ?? homedir();
  const defaultConfig = getDefaultConfig(homeDir);
  const configPath =
    options.configPath ?? join(defaultConfig.canonicalRoot, 'config.json');
  const fileExists = options.fileExists ?? existsSync;
  const readFile =
    options.readFile ?? ((path: string) => readFileSync(path, 'utf8'));

  if (!fileExists(configPath)) {
    return defaultConfig;
  }

  const parsedConfig = JSON.parse(readFile(configPath)) as DeepPartialConfig;
  const mergedConfig = mergeConfig(defaultConfig, parsedConfig);

  return normalizeConfigPaths(mergedConfig, homeDir);
}
