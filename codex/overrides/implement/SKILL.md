---
name: implement
description: Implement a piece of work based on a spec or set of tickets.
disable-model-invocation: true
---

Implement the work described by the user in the supplied spec or issues. Resolve routine choices from the repository and current conversation; ask about missing product or interface decisions when they materially change the result.

Choose validation around the behavior and risk. Use /tdd when test-first work is requested or a failing behavior test provides useful coverage. Reuse established test boundaries without demanding another confirmation. Run focused checks during implementation and complete the repository's required checks before finishing; use the full suite when required or justified by the affected scope.

Review the actual changes before finishing, including relevant staged, unstaged, and untracked work. Use /code-review for substantial or risky changes, or when a review is requested; a focused self-review is sufficient for a small clear change. Do not recursively launch review workflows to review the review itself.

Commit only when the user has requested or already authorized a commit. Otherwise leave the changes ready for review. Report what changed and the verification performed, including material limitations.
