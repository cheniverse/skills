---
name: diagnosing-bugs
description: Diagnose unclear, persistent, intermittent, or performance bugs using evidence and targeted experiments. Use when the cause is uncertain or an initial fix failed; straightforward errors and code explanations can be handled directly without a formal diagnosis loop.
---

Find and verify the cause of the reported symptom. Begin with the smallest investigation that can distinguish a cause; increase effort when the evidence calls for it.

## Start with available evidence

Read the exact error, relevant code, recent changes, and available logs or failing tests. Use applicable domain terms and ADRs. A clear cause may need only a focused fix and appropriate verification; do not construct a mock reproduction or invent extra hypotheses to satisfy a workflow.

Redact secrets from commands, logs, traces, and reports. Keep credentials in environment variables and quote only the output needed for the diagnosis.

## Escalate when uncertainty remains

- Reuse an existing failure signal before building a new harness. Choose a test, CLI request, browser interaction, trace replay, or measurement that exercises the actual symptom.
- State plausible hypotheses and what evidence would distinguish them. The number depends on the evidence; reading code and logs can legitimately precede a runnable reproduction.
- Run the most informative targeted experiment. Minimize the reproduction enough to isolate the cause or make iteration practical, rather than removing every possible element before investigating.
- For intermittent failures, choose bounded repetitions or stress from the observed failure rate and cost. Record conditions and results; stop or change approach when repetition no longer adds information. No fixed 100-run or 1000-input quota is required.
- For performance regressions, measure a comparable baseline and use profiling or query plans to identify the cause before claiming an improvement.

If reproduction is unavailable, continue useful static analysis and label hypotheses as unverified. Ask for the specific missing access or redacted evidence when further progress depends on it. Production instrumentation requires authorization; do not claim the bug is fixed from static plausibility alone.

## Fix and verify

When a durable regression test can exercise the real failure, establish its failing signal before applying the fix. Otherwise use the most relevant available verification and explain the remaining gap; absence of a convenient test boundary is not by itself a mandate to redesign the architecture.

Verify the original scenario after the fix, complete applicable checks, and remove temporary instrumentation and task-created disposable artifacts that are no longer needed. Report the supported cause, change, verification, and unresolved limitations.
