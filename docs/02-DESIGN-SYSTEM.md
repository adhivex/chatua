# 02 — Design System

Premium, warm, rooted in Odisha. Ivory surfaces, burnt-clay primary, antique-gold hairlines, dark espresso for hero and emphasis. The prototype is the visual reference.

## Colour tokens
| Token | Hex | Use |
|---|---|---|
| `cream` | #F7F0E4 | App background |
| `paper` | #FFFAF1 | Sheets, nav, sticky bars |
| `card` | #FFFDF8 | Cards |
| `sand` | #EFE4D1 | Subtle fills |
| `line` | #E7DBC6 | Borders, dividers |
| `clay` | #B4421A | Primary actions, links, badges |
| `clay-dark` | #8E3210 | Pressed state, selected text |
| `clay-soft` | #F6E1D2 | Tinted chips |
| `gold` | #C8A05A | Hairlines, selected borders, active nav |
| `gold-light` | #E6CC94 | Text on espresso, gold button top |
| `espresso` | #22130A | Hero, active chip, toast, dark cards |
| `ink` | #2A1A10 | Body text |
| `muted` | #85715F | Secondary text |
| `leaf` | #2C7A47 | Success, free delivery, Bestseller context |

Primary button: vertical gradient `#C64F22 → #A43914`, inset 1px highlight `rgba(255,255,255,.22)`, shadow `0 12px 24px -10px rgba(164,57,20,.75)`. Gold button (on dark hero only): `#E6CC94 → #C8A05A` with espresso text.

## Typography
- Headings, prices, wordmark: **Fraunces** (variable, optical size on), weights 500–700. Use 600 by default.
- Body and UI: **Hanken Grotesk** 400/500/600/700.
- Load both with `next/font/google`, `display: swap`.

| Role | Size / weight | Notes |
|---|---|---|
| Hero H1 | 40/1.02, 600, −1px tracking | ivory on espresso |
| Page H1 | 31, 600, −0.8px | product title |
| Section H3 | 21, 600, −0.3px | |
| Card title | 15.5–17, Fraunces 600 | |
| Price | 19–20, Fraunces 600 | |
| Body | 14–14.5 / 1.5–1.6 | max line length ~62ch |
| Caption | 12–12.5 | muted |
| Wordmark | Fraunces 600, 22, 3.5px letter-spacing | tagline 8.5px, clay |

Sentence case everywhere. No ALL-CAPS labels except the wordmark.

## Shape, depth, spacing
- Radius: cards 20, buttons 14–16, inputs 12–15, chips/pills 999, hero sheet top corners 30.
- Shadows: `--sh: 0 1px 2px rgba(60,35,15,.05), 0 10px 26px -10px rgba(60,35,15,.2)`; `--sh2: 0 2px 4px rgba(60,35,15,.06), 0 22px 44px -14px rgba(60,35,15,.32)`.
- Spacing scale 4/8/12/16/20/24/32. Screen horizontal padding 16–18.
- Hairlines: 1px `rgba(200,160,90,.28–.35)` for bars and section dividers; selected controls use a 1px gold border plus inset 1px gold.
- Background has a very faint paper-grain noise (SVG feTurbulence, ~9% alpha). Keep it subtle.

## Components (build as shared components)
`Logo` · `TopBar` (default, and `over` variant transparent on the hero) · `BackBar` · `BottomNav` (frosted, gold 2px active indicator, cart badge) · `Button` (primary, gold, line, block) · `Chip` (active = espresso fill with gold-light text) · `SearchField` · `ProductCard` (grid) · `ProductRow` (list, with size pills) · `SizeOption` · `QuantityStepper` · `CartItem` · `OrderSummary` · `RadioCard` (delivery, payment, selected = gold border) · `TrustRow` (icon in a gold-bordered circle) · `HeritageCard` (dark gradient over image) · `Accordion` (product details) · `Toast` (espresso, gold border) · `StickyCta` · `ProductImage` (Cloudinary image with warm vignette overlay and fallback illustration).

## Imagery
- Real photography: warm, directional light, dark wood bowls, shallow depth of field. Aspect ratios: card 1:1, hero 4:5 (art-directed crop to the right half), gallery 1:1.
- Apply a subtle vignette overlay (radial, transparent at 50% to rgba(20,10,3,.6) at edge) and a warm top-left light wash so mixed photos feel consistent.
- Until photos exist, use the SVG placeholder from the prototype (`mound()` function) inside `ProductImage` as a fallback.

## Motion
Minimal. Press scale (.97) on buttons, `pop` on the order success tick, small confetti on success, toast slide-up. Everything off under `prefers-reduced-motion`.

## Accessibility
Contrast AA on all text. Icon-only buttons need `aria-label`. Focus ring: 2px clay with 2px offset. Touch targets ≥ 44px (use padding on small controls).
