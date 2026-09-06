---
name: research
description: Investigate a substantial question by comparing primary sources and resolving conflicting evidence. Use for a research brief, a multi-source investigation, or a delegated research task; ordinary fact lookups and single-page documentation questions can be answered directly.
---

Resolve the research question with cited evidence and clearly identified uncertainty. Match the scope and output to the user's request.

- Start from primary sources: official documentation, source code, specifications, or first-party data. Distinguish firsthand community reports from controlled measurements and your own inferences.
- Use the current conversation and already gathered evidence. Read further when a claim needs verification or sources conflict; stop when the question is answered to the requested depth.
- Return findings in the conversation by default. Write a file only when the user requested one or the established task deliverable requires it; use the project's existing location and conventions.
- Research directly when it is a single investigation. Delegate only when permitted and an independent question can be investigated while useful work continues locally. Give each worker a bounded question, relevant sources, and the required output format.
- If you are already the delegated researcher, perform the investigation yourself. Do not invoke this skill again or spawn another researcher. Return evidence and limitations to the caller, who owns synthesis and any requested artifact.
- If a source or tool is unavailable, use suitable alternatives and identify what remains unverified. Do not present an inaccessible source as evidence.
