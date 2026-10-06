# Master prompt for Claude Code (handoff v3)

Paste this into Claude Code from the repo root after copying this handoff folder into it.

---

You are building **Chatua**, a premium mobile-first e-commerce web app for a traditional Odisha grain food.

1. Read `CLAUDE.md`, then every file in `docs/` in numeric order. Open `docs/reference/chatua-prototype-v3.html` in a browser at 390px width and study it; it is the approved design.
2. Summarise back to me in under 15 lines: the scope of v1, the stack, the phases, and any conflicts or questions you found. Wait for my reply before changing any files.
3. Use the ready-made files: `prisma/schema.prisma`, `prisma/seed-data.json`, `starter/tokens.css`, `starter/tailwind.preset.ts`, `starter/lib/*`. Copy them into the project rather than rewriting them.
   After I confirm, execute **Phase 0 and Phase 1** from `docs/06-BUILD-PLAN.md` only. Stop at the end of Phase 1, run lint, typecheck and build, and report.
4. Match the prototype's look closely (typography, colour, spacing, gold hairlines, dark espresso hero, frosted tab bar). Do not substitute default shadcn styling.
5. Follow the working agreements in `CLAUDE.md`. Ask when unsure; log decisions in `docs/DECISIONS.md`.

Proceed phase by phase only when I say "next phase".
