# AI Usage Standard — Abridged
Version 1.0  
Last Updated: January 19, 2026

## Purpose
Define safe, repo-aligned use of AI tooling (Copilot, GPT, etc.) so no source or user data leaves the project unintentionally.

## Core Rules
- **Local-only prompts.** Do not paste repo content, logs, or secrets into external chats or cloud prompts. Keep AI generations local (editor/CLI) and review manually.
- **Treat AI output as a draft.** Validate logic, types, accessibility, and standards compliance before committing.
- **No secrets in prompts or logs.** Never include API keys, DSNs, or article payloads with identifiers.
- **Respect licenses.** Avoid inserting AI-suggested code that introduces incompatible licenses.
- **Cite changes.** If AI assisted materially, mention it in PR notes when relevant.

## Workflow
1) Run/mentally check Preflight (scope, rationale, acceptance).  
2) When using AI suggestions, cross-check against:  
   - `docs/standards/design-standards.md` (no emojis, Lucide icons, safe areas).  
   - `docs/standards/engineering.md` (SemVer, changelog).  
3) Run `npm run audit:ai-leak` before commits for a quick secret scan.  
4) Document deviations or new standards in `AGENTS.md` and relevant docs.

## Data Handling
- Persisted state changes (AsyncStorage) require migration notes/tests. Do not expose stored data in prompts.
- Logs: keep structured, non-sensitive, and development-only.

See also: `AGENTS.md` (AI tooling note), `docs/standards/checklist-quickref.md`.
