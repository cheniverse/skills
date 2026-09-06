---
name: tdd
description: Develop test-first when the user requests TDD or red-green-refactor, or when a behavior change benefits from a failing regression test with an independent expected result. Merely adding tests or making an implementation change does not require the full TDD workflow.
---

Use red-green cycles to protect observable behavior with tests worth keeping.

## Decide what needs a test

Identify the behavior at risk and an expected result grounded in the requirements, a worked example, or another independent source of truth. Reuse existing coverage when it already detects the change. Do not add a test that simply mirrors the implementation.

An explicit test-first request determines the method. Otherwise, use the loop when it provides a meaningful failing signal for a new behavior or bug; use appropriate existing checks or direct verification for changes where a new loop adds no useful coverage. File type alone does not determine risk: configuration and UI changes can affect critical behavior.

## Choose the boundary

Test through the public interface that exposes the relevant behavior. Reuse established test boundaries and project conventions. State a new boundary briefly when useful; ask the user only when an unresolved interface or product decision would materially affect the work, rather than requesting approval before every test.

Use the project's domain terminology and applicable ADRs. Consult [tests.md](tests.md) or [mocking.md](mocking.md) when test design needs examples; do not reload references on every cycle. If interface design itself is unresolved, consult the available `codebase-design` skill as a reference rather than starting a separate design session by default.

## Run the loop

1. Write one behavior-focused test and run it. Confirm it fails for the intended missing behavior or bug, not a broken fixture or environment.
2. Implement enough to satisfy that behavior and rerun the relevant test.
3. After the test passes, refactor locally only when needed to complete the current behavior or keep the touched code maintainable. Preserve observable behavior and verify the affected tests. Refactoring is optional, not a required step in every cycle; do not expand it into unrelated architectural changes. Continue with the next valuable behavior if needed.

Keep expected values independent of the code under test and avoid assertions on private implementation details. Use the lowest-cost test level that actually observes the failure; browser tests remain appropriate for behavior that requires a browser, but need not run for every unrelated cycle.

Complete required repository checks and validation appropriate to the affected paths. Broaden or repeat checks when changes, failures, or unresolved risk warrant it. Report any unverified behavior honestly; a passing unrelated test is not evidence of a fix.
