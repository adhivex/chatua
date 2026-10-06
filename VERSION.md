# Chatua handoff — v3

| Item | Value |
|---|---|
| Package | chatua-handoff-v3 |
| Design reference | docs/reference/chatua-prototype-v3.html |
| Design direction | Premium: espresso hero, ivory surfaces, burnt-clay primary, antique-gold hairlines, Fraunces + Hanken Grotesk |
| Build status | Phases 0–4 done, Phase 5 done except external deployment (VPS preview live; see README). Owner items: docs/LAUNCH-CHECKLIST.md |

## Changelog
- **v1** — first design from the reference mockup (flat cream and orange).
- **v2** — premium restyle of the prototype; first handoff docs.
- **v3** — this package. Adds ready-to-use starter files so Claude Code does not have to transcribe them:
  - `prisma/schema.prisma` (final schema)
  - `prisma/seed-data.json` (products, variants, recipes)
  - `starter/tokens.css` (design tokens as CSS variables)
  - `starter/tailwind.preset.ts` (Tailwind theme from the tokens)
  - `starter/lib/delivery.ts` and `starter/lib/money.ts` (business-rule logic with tests)
  - `.claude/commands/` (reusable slash commands: `/phase`, `/compare-prototype`, `/check`)

- **v3.1 (build, 2026-10-06)** — app built from this package. Supabase Postgres + Storage instead of Neon + Cloudinary (owner request); see docs/DECISIONS.md.

Rule: when scope or design changes, bump the version here and note it in docs/DECISIONS.md.
