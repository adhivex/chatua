# Chatua — project handoff

**Package version: v3**

Mobile-first premium e-commerce web app for Chatua, Odisha's traditional grain food.

## What is in this folder
- `CLAUDE.md` — standing instructions for Claude Code (read first)
- `MASTER_PROMPT.md` — the prompt to paste into Claude Code to start
- `docs/` — PRD, design system, screens, architecture, database, build plan, decisions log
- `docs/reference/chatua-prototype-v3.html` — the approved interactive prototype (open in a browser, mobile width)
- `VERSION.md` — version and changelog
- `prisma/` — final schema and seed data
- `starter/` — design tokens, Tailwind preset, delivery and money logic with tests
- `.claude/commands/` — slash commands `/phase`, `/compare-prototype`, `/check`
- `.env.example` — environment variables needed

## How to start
1. Inside WSL2, create the repo folder on the Linux filesystem and copy these files into its root.
2. Open Claude Code in that folder and paste the contents of `MASTER_PROMPT.md`.
3. Review the summary it gives back, confirm, and let it run Phase 0 and Phase 1.
4. Say "next phase" to continue.
