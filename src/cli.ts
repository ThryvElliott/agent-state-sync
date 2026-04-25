#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

export const COMMAND_NAMES = [
  'pull',
  'status',
  'diff',
  'bundle',
  'apply',
] as const;

export type CommandName = (typeof COMMAND_NAMES)[number];

export interface ParsedCliArgs {
  args: string[];
  command?: CommandName;
  error?: string;
  showHelp: boolean;
}

export interface RunCliDependencies {
  handlers?: Partial<
    Record<CommandName, (args: string[]) => number | Promise<number>>
  >;
  stderr?: (message: string) => void;
  stdout?: (message: string) => void;
}

export interface ProcessCliDependencies extends RunCliDependencies {
  argv?: string[];
  setExitCode?: (code: number) => void;
}

export function isCommandName(value: string): value is CommandName {
  return COMMAND_NAMES.includes(value as CommandName);
}

export function parseCliArgs(argv: string[]): ParsedCliArgs {
  const command = argv[0];

  if (argv.length === 0 || command === '--help' || command === '-h') {
    return {
      args: [],
      showHelp: true,
    };
  }

  const args = argv.slice(1);

  if (!isCommandName(command)) {
    return {
      args,
      error: `Unknown command: ${command}`,
      showHelp: true,
    };
  }

  return {
    args,
    command,
    showHelp: false,
  };
}

export function formatHelp() {
  return [
    'agent-sync',
    '',
    'Usage:',
    '  agent-sync <command> [options]',
    '',
    'Commands:',
    '  pull    Ingest configured sources into the canonical store',
    '  status  Show canonical store health and source freshness',
    '  diff    Compare canonical state against a source or snapshot',
    '  bundle  Generate a Markdown and JSON handoff bundle',
    '  apply   Apply a handoff bundle back into the canonical store',
  ].join('\n');
}

export async function runCli(
  argv: string[],
  dependencies: RunCliDependencies = {},
) {
  const parsedArgs = parseCliArgs(argv);
  const stdout = dependencies.stdout ?? console.log;
  const stderr = dependencies.stderr ?? console.error;

  if (parsedArgs.error !== undefined) {
    stderr(parsedArgs.error);
  }

  if (parsedArgs.showHelp) {
    stdout(formatHelp());
    return parsedArgs.error === undefined ? 0 : 1;
  }

  const command = parsedArgs.command;

  if (command === undefined) {
    stderr('Command parsing failed unexpectedly.');
    return 1;
  }

  const handler = dependencies.handlers?.[command];

  if (handler === undefined) {
    stderr(`Command not implemented yet: ${command}`);
    return 2;
  }

  return await handler(parsedArgs.args);
}

export function isDirectExecution(
  scriptPath: string | undefined,
  moduleUrl: string,
) {
  return (
    scriptPath !== undefined && moduleUrl === pathToFileURL(scriptPath).href
  );
}

export async function runCliFromProcess(
  moduleUrl: string,
  dependencies: ProcessCliDependencies = {},
) {
  const argv = dependencies.argv ?? process.argv;
  const setExitCode =
    dependencies.setExitCode ??
    ((code: number) => void (process.exitCode = code));

  if (!isDirectExecution(argv[1], moduleUrl)) {
    return false;
  }

  const exitCode = await runCli(argv.slice(2), dependencies);
  setExitCode(exitCode);

  return true;
}

await runCliFromProcess(import.meta.url);
