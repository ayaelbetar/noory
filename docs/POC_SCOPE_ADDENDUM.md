# POC Scope Addendum — Submitted Implementation vs PRD

**Date:** 2026-07-31  
**Authority:** For manager sign-off of the submitted browser POC, this document together with [`manager-delivery-pack.md`](manager-delivery-pack.md) and [`README.md`](../README.md) override the frozen root specification package where they differ.

The frozen markdown package (2026-07-28) remains the engineering baseline for future production work.

---

## Reconciliation table

| Topic | PRD / frozen spec | Submitted POC | Manager note |
|-------|-------------------|---------------|--------------|
| Outcome label | **Retry** (Arabic: حاول مرة أخرى via `cta.retry`) | "Try Again" in English POC docs | Child UI uses Arabic keys from `src/core/messages.js` |
| Character name | **Noor — نور** | "Nouri" in some English POC docs | Use **Noor** in all stakeholder-facing text |
| Noor voice | Optional TTS toggle (independent from narrator) | `NOURI_ENABLED=false`; voice module removed | Accepted deferral — see README § Noor voice |
| Narrator fallback | Browser TTS if narrator file missing | Professional MP3 only; error if missing | Accept — all 47 active pages have MP3 assets |
| Gamification | No badges, streaks, or leaderboards in MVP | 1 star + 5 coins per unique confirmed successful page | Light session reward; documented POC exception |
| Letter-sound pages | Not in frozen state machine | `needs-practice` after 3 attempts on isolated بَ/بِ/بُ pages | Experimental safe practice; does not block book completion |
| Evaluation API | Server `/evaluate` in production spec | Browser STT + local text alignment | Expected POC scope |
| Book catalog | Generic MVP library | 3 books, 47 pages: `baa`, `mosque`, `girl` | As delivered |
| Live word glow | Not specified in frozen specs | Progressive highlight during reading | Experimental UX; does not replace evaluation outcome |
| Final score | Simple book-level percentage in Reading Summary | `successfulPages / totalBookPages` | Aligned; unverified letter pages stay in denominator only |

---

## What the manager should accept

- Browser Arabic STT is **experimental**, not teacher-level pronunciation assessment.
- Isolated short-vowel letter practice is **conservative** and never awards unverified success.
- Manual Chrome/Edge and mobile-device acceptance checks remain separate QA work.
- Interactive Noor voice is **future scope**, not a delivery gap for this POC.

---

## Related documents

- [`DELIVERY_INDEX.md`](DELIVERY_INDEX.md) — ordered reading list  
- [`Read_with_Noor_MVP_PRD.md`](../Read_with_Noor_MVP_PRD.md) — product requirements  
- [`manager-delivery-pack.md`](manager-delivery-pack.md) — delivery status
