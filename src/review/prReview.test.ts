import { describe, expect, it } from 'vitest';

import {
  buildPullRequestReviewPrompt,
  formatReviewComment,
  formatReviewMarker,
  truncateDiff,
} from './prReview.js';

describe('prReview helpers', () => {
  it('returns the original diff when it is already within the limit', () => {
    expect(truncateDiff('small diff', 100)).toBe('small diff');
  });

  it('truncates oversized diffs and appends a notice', () => {
    const result = truncateDiff('abcdef', 3);

    expect(result).toContain('abc');
    expect(result).toContain('[diff truncated to 3 characters]');
  });

  it('builds a review prompt with metadata and the diff', () => {
    const prompt = buildPullRequestReviewPrompt({
      baseRef: 'main',
      body: 'Adds the initial db layer.',
      diff: 'diff --git a/src/db/client.ts b/src/db/client.ts',
      headRef: 'feat/phase-1-db-foundation',
      modelLabel: 'Claude Opus',
      prNumber: 42,
      repository: 'eklaassen/agent-state-sync',
      title: 'Build db foundation',
    });

    expect(prompt).toContain('pull request #42');
    expect(prompt).toContain('Reviewing model: Claude Opus.');
    expect(prompt).toContain('Title: Build db foundation');
    expect(prompt).toContain('Base branch: main');
    expect(prompt).toContain('Head branch: feat/phase-1-db-foundation');
    expect(prompt).toContain('Adds the initial db layer.');
    expect(prompt).toContain('```diff');
    expect(prompt).toContain('diff --git a/src/db/client.ts');
  });

  it('fills in a fallback description when the PR body is blank', () => {
    const prompt = buildPullRequestReviewPrompt({
      baseRef: 'main',
      body: '   ',
      diff: 'small diff',
      headRef: 'feat/review',
      modelLabel: 'GPT 5.4',
      prNumber: 5,
      repository: 'eklaassen/agent-state-sync',
      title: 'Review workflow',
    });

    expect(prompt).toContain('Description: No PR description provided.');
  });

  it('formats a review comment with a stable marker header', () => {
    const comment = formatReviewComment(
      'GPT 5.4',
      '## Findings\n- severity: medium',
    );

    expect(comment).toContain('<!-- agent-state-sync:gpt-5.4 -->');
    expect(comment).toContain('## GPT 5.4 Review');
    expect(comment).toContain('## Findings');
  });

  it('formats the marker from the model label', () => {
    expect(formatReviewMarker('Claude Opus')).toBe(
      '<!-- agent-state-sync:claude-opus -->',
    );
  });
});
