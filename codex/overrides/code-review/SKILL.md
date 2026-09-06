---
name: code-review
description: Review a requested diff, branch, PR, or work in progress for correctness, requirement coverage, and documented standards. Use when a code review is requested or a substantial implementation needs independent review; a code explanation or configuration lookup does not need this workflow.
---

Review the actual requested changes against both the requirements and the repository's standards. Keep findings actionable and supported by the diff.

## Establish the review scope

- Honor an explicit commit, range, PR base, or staged-only scope. Resolve refs before using them. For a branch or PR comparison, use its merge-base with the target branch, for example `git diff <base>...HEAD`.
- For current work before commit, inspect `git status --short`, `git diff`, and `git diff --cached`; also inspect relevant untracked files. A committed-only diff does not cover this work. If the request includes branch changes and local edits, inspect both and state the combined scope.
- When no scope is supplied, use the changes just made in this task or the current work in progress if that scope is clear. Ask only if different plausible scopes would materially change the review. Never infer that an empty committed diff means there is nothing to review without checking the requested local changes.

## Establish the requirements

Use the user's request, acceptance criteria, supplied spec, and applicable repository instructions. Read linked issues when available and relevant; use the configured issue tracker if needed. A missing tracker configuration or standalone spec is not a prerequisite failure: review against the available request and disclose any requirement gaps. Ask about missing decisions only when they prevent a useful review.

## Choose the review effort

For a focused change, review both correctness/spec coverage and documented standards yourself. Use independent reviewers only when permitted and the size, risk, or separable concerns justify their additional context and work.

Only the coordinating reviewer delegates. Give each worker the precise diff scope, its assigned concern, and the necessary requirement/standards sources. Tell workers to perform their assigned review directly, without invoking `code-review` or creating more reviewers. If you received such a review assignment, you are a worker and must not delegate this workflow again. If delegation is unavailable, review the concerns sequentially.

## Assess and report

- Prioritize concrete bugs, regressions, missing requirements, and consequential violations of documented standards. Follow relevant callers and tests when needed to substantiate a finding.
- Treat code smells as hypotheses, not mandatory refactors. Report one only when you can explain its concrete impact in this change. Skip issues already reliably enforced by tooling.
- Verify and deduplicate worker findings; rank by impact. Identify whether each finding concerns correctness/spec coverage or standards, with a file/line and an explanation of the failure or violated requirement.
- If no actionable findings remain, say so. State material coverage gaps and distinguish tests actually run from static inspection. Do not require fixes or another review round merely to satisfy a quota.
