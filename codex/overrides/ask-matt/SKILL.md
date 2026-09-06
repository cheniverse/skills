---
name: ask-matt
description: Ask which skill or flow fits your situation. A router over the skills in this repo.
disable-model-invocation: true
---

# Ask Matt

Recommend the smallest useful workflow for the user's situation. A clear question or small, well-scoped change may need no skill. This is a map for choosing skills, not an instruction to execute every step. User-invoked skills below are suggestions for the human; do not invoke them on the user's behalf.

## Build and investigate

- `/implement`: implement a supplied spec or issues with appropriate verification. It selects TDD and independent review when useful; committing requires user authorization.
- `/tdd`: develop test-first for a requested method or a meaningful behavior/regression test. Existing boundaries do not require repeated approval.
- `/diagnosing-bugs`: investigate unclear, persistent, intermittent, or performance failures. Start with available evidence and deepen the investigation when needed.
- `/code-review`: inspect the requested branch, PR, or local work against requirements and standards. Focused reviews can run in one agent; delegated reviewers do not recursively delegate.
- `/research`: investigate a substantial question using cited primary sources. Return findings in chat unless a file is requested or required by the deliverable. Background work is optional and bounded.
- `/resolving-merge-conflicts`: resolve an existing merge/rebase conflict using the intent of both sides.

## Clarify and plan when needed

- `/grill-me`: interview the user to sharpen a plan without recording domain documents.
- `/grill-with-docs`: interview while maintaining project terminology and decisions. Choose it when those durable records are useful, not simply because a repository exists.
- `/grilling`: the interview primitive used by other workflows, or directly when an interview is requested.
- `/prototype`: use throwaway code to answer a specific design or UI question that discussion cannot settle.
- `/to-spec`: turn resolved requirements into a buildable specification when a spec is needed.
- `/to-tickets`: split a spec into executable vertical slices and dependencies when the work benefits from that handoff.
- `/wayfinder`: map unresolved decisions for a large, ambiguous, multi-session effort. It produces decisions, not the implementation; reserve it for that scale.
- `/triage`: turn incoming raw issues into appropriately classified work. Already prepared implementation issues do not need another triage pass.

A larger effort may benefit from clarification, a spec, issues, then implementation. Enter at the stage the work actually needs; do not require an interview or new documents when the supplied task is already clear.

## Design and supporting work

- `/codebase-design`: consult deep-module and interface vocabulary when designing a boundary.
- `/domain-modeling`: actively resolve domain terminology and record consequential decisions. Reading an existing glossary alone does not need this workflow.
- `/improve-codebase-architecture`: inspect architectural improvement opportunities when that work is requested or justified.
- `/handoff`: carry context to another person, directory, harness, or session when a handoff is needed.
- `/to-questionnaire`: prepare questions for someone else who holds the missing information.
- `/wizard`: guide steps that genuinely require human interaction; ordinary agent-executable steps do not need it.
- `/wait-what`: explain an answer again with the missing context.
- `/teach`: learn a concept across sessions.
- `/writing-for-agents`: consult guidance for documents consumed by agents when needed.
- `/setup-matt-pocock-skills`: configure tracker, triage, and domain conventions before a workflow that actually depends on them. A standalone review, code question, or focused change need not wait for tracker setup.

## Personal additions

- `/nushell`: a personal addition for writing or troubleshooting Nushell commands and scripts. Only the human can invoke it; do not route ordinary structured-data tasks into it automatically.
- `/karpathy-guidelines`: a personal, focused check for overengineering, unrelated changes, and proportionate verification. Only the human can invoke it; do not add it as a required coding or review step.

Continue in the current conversation while its context is useful. Use supported compaction or a concise handoff when context pressure or a real phase transition warrants it; do not assume a universal token threshold or require a fresh session per issue.
