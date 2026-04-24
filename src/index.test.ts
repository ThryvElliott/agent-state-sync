import { describe, expect, it } from 'vitest';

import * as agentStateSync from './index.js';

describe('index exports', () => {
  it('re-exports the phase 1 public API surface', () => {
    expect(agentStateSync.openAgentStateDb).toBeTypeOf('function');
    expect(agentStateSync.loadConfig).toBeTypeOf('function');
    expect(agentStateSync.parseCliArgs).toBeTypeOf('function');
    expect(agentStateSync.isThreadStatus).toBeTypeOf('function');
  });
});
