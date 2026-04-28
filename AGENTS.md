# Agent Instructions

This repository uses `docs/agent-memory.md` as its durable project memory.

## Chat-derived memory protocol

When working from a user chat, actively monitor the conversation for information that should be remembered in future sessions. Treat the memory file like a concise notebook, not a transcript.

Add or update memory when the user states:

- Durable project preferences, constraints, or conventions.
- Decisions about architecture, product behavior, deployment, or data handling.
- Repeated corrections about how work should be done.
- Stable facts about the project, business domain, or operating environment.
- Things future agents should avoid doing.

Do not add:

- Secrets, tokens, private keys, passwords, or sensitive personal data.
- One-off task details that will not matter after the current change.
- Guesses, uncertain interpretations, or unresolved options.
- Full chat transcripts.

Before editing memory, check whether the point already exists and update the existing entry instead of duplicating it. Keep each entry short, dated when useful, and tied to the reason it matters.

If the user asks for a code or documentation change and the chat contains durable knowledge, update `docs/agent-memory.md` in the same branch and commit as the related work when appropriate.

## Using memory

At the start of substantial work, read `docs/agent-memory.md` after the README and before making design decisions. Follow the memory unless it conflicts with the user's latest explicit request.
