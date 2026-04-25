const DEFAULT_MAX_DIFF_CHARS = 40_000;

export interface PullRequestReviewContext {
  baseRef: string;
  body: string;
  diff: string;
  headRef: string;
  modelLabel: string;
  prNumber: number;
  repository: string;
  title: string;
}

export function truncateDiff(diff: string, maxChars = DEFAULT_MAX_DIFF_CHARS) {
  if (diff.length <= maxChars) {
    return diff;
  }

  return `${diff.slice(0, maxChars)}\n\n[diff truncated to ${maxChars} characters]`;
}

export function buildPullRequestReviewPrompt(
  context: PullRequestReviewContext,
  maxDiffChars = DEFAULT_MAX_DIFF_CHARS,
) {
  const body =
    context.body.trim() === '' ? 'No PR description provided.' : context.body;
  const truncatedDiff = truncateDiff(context.diff, maxDiffChars);

  return [
    `You are reviewing pull request #${context.prNumber} for ${context.repository}.`,
    `Reviewing model: ${context.modelLabel}.`,
    '',
    'Focus on the highest-signal review feedback only:',
    '- Functional bugs or regressions',
    '- Risky assumptions or edge cases',
    '- Missing or weak tests',
    '- Dangerous migrations, state changes, or API contract drift',
    '',
    'Avoid praise, repetition, or nitpicks unless they materially affect correctness.',
    'If there are no meaningful issues, say that clearly and mention any residual risk.',
    '',
    'Return Markdown with these sections in order:',
    '1. `## Findings`',
    '2. `## Open Questions`',
    '3. `## Residual Risk`',
    '',
    'Inside `## Findings`, use flat bullet points. Each finding should include:',
    '- severity: high | medium | low',
    '- area or file path',
    '- concrete risk',
    '- why it matters',
    '- what to test or change',
    '',
    'Pull request metadata:',
    `- Title: ${context.title}`,
    `- Base branch: ${context.baseRef}`,
    `- Head branch: ${context.headRef}`,
    `- Description: ${body}`,
    '',
    'Git diff:',
    '```diff',
    truncatedDiff,
    '```',
  ].join('\n');
}

export function formatReviewComment(
  modelLabel: string,
  reviewMarkdown: string,
) {
  return [
    `<!-- agent-state-sync:${modelLabel.toLowerCase().replace(/\s+/g, '-')} -->`,
    `## ${modelLabel} Review`,
    '',
    reviewMarkdown.trim(),
  ].join('\n');
}
