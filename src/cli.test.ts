import { describe, expect, it, vi } from 'vitest';

import {
  formatHelp,
  isDirectExecution,
  parseCliArgs,
  runCli,
  runCliFromProcess,
  isCommandName,
} from './cli.js';

describe('cli', () => {
  it('recognizes valid command names', () => {
    expect(isCommandName('pull')).toBe(true);
    expect(isCommandName('status')).toBe(true);
    expect(isCommandName('unknown')).toBe(false);
  });

  it('shows help when no arguments are provided', () => {
    expect(parseCliArgs([])).toEqual({
      args: [],
      showHelp: true,
    });
  });

  it('parses a valid command and trailing arguments', () => {
    expect(parseCliArgs(['bundle', 'marketing-center'])).toEqual({
      args: ['marketing-center'],
      command: 'bundle',
      showHelp: false,
    });
  });

  it('returns help plus an error for unknown commands', () => {
    expect(parseCliArgs(['explode', 'now'])).toEqual({
      args: ['now'],
      error: 'Unknown command: explode',
      showHelp: true,
    });
  });

  it('formats the help output with the supported commands', () => {
    const helpText = formatHelp();

    expect(helpText).toContain('agent-sync');
    expect(helpText).toContain('pull');
    expect(helpText).toContain('status');
    expect(helpText).toContain('diff');
    expect(helpText).toContain('bundle');
    expect(helpText).toContain('apply');
  });

  it('detects when the module is being run directly', () => {
    expect(
      isDirectExecution(
        '/Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
        'file:///Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
      ),
    ).toBe(true);

    expect(
      isDirectExecution(
        '/Users/klaase01/projects/agent-state-sync/dist/src/index.js',
        'file:///Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
      ),
    ).toBe(false);
  });

  it('prints help and exits 0 when invoked with --help', async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(['--help'], {
      stderr,
      stdout,
    });

    expect(exitCode).toBe(0);
    expect(stderr).not.toHaveBeenCalled();
    expect(stdout).toHaveBeenCalledWith(formatHelp());
  });

  it('dispatches to the matching command handler', async () => {
    const handler = vi.fn().mockResolvedValue(0);

    const exitCode = await runCli(['status', '--json'], {
      handlers: {
        status: handler,
      },
      stderr: vi.fn(),
      stdout: vi.fn(),
    });

    expect(exitCode).toBe(0);
    expect(handler).toHaveBeenCalledWith(['--json']);
  });

  it('returns 1 for unknown commands and prints help', async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(['explode'], {
      stderr,
      stdout,
    });

    expect(exitCode).toBe(1);
    expect(stderr).toHaveBeenCalledWith('Unknown command: explode');
    expect(stdout).toHaveBeenCalledWith(formatHelp());
  });

  it('returns 2 when a command is recognized but not implemented', async () => {
    const stdout = vi.fn();
    const stderr = vi.fn();

    const exitCode = await runCli(['pull'], {
      stderr,
      stdout,
    });

    expect(exitCode).toBe(2);
    expect(stdout).not.toHaveBeenCalled();
    expect(stderr).toHaveBeenCalledWith('Command not implemented yet: pull');
  });

  it('runs from process argv only when invoked as the direct entrypoint', async () => {
    const setExitCode = vi.fn();
    const stdout = vi.fn();
    const handled = await runCliFromProcess(
      'file:///Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
      {
        argv: [
          'node',
          '/Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
          '--help',
        ],
        setExitCode,
        stdout,
      },
    );

    expect(handled).toBe(true);
    expect(setExitCode).toHaveBeenCalledWith(0);
    expect(stdout).toHaveBeenCalledWith(formatHelp());
  });

  it('does not run from process argv when imported by another module', async () => {
    const handled = await runCliFromProcess(
      'file:///Users/klaase01/projects/agent-state-sync/dist/src/cli.js',
      {
        argv: [
          'node',
          '/Users/klaase01/projects/agent-state-sync/dist/src/index.js',
          '--help',
        ],
        setExitCode: vi.fn(),
        stdout: vi.fn(),
      },
    );

    expect(handled).toBe(false);
  });
});
