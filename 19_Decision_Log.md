# 19_Decision_Log

# Product Decision Log

**Version:** 1.1  
**Status:** Final

---

# Purpose

Major product decisions for **AI Reading Buddy**, aligned with `03_Product_Decisions.md`.

---

| ID | Decision | Reason | Alternatives | Impact |
|----|----------|--------|--------------|--------|
| D-01 | Introduce Noor as reading companion | Emotional connection | Generic AI assistant | Higher engagement |
| D-02 | Hide AI from child | Magical, simple UX | Expose AI | Child-first trust |
| D-03 | Arabic-only MVP (child UI) | Noory audience | Multi-language | Focused delivery |
| D-04 | Page-level evaluation | Lower complexity/cost | Word-level | Faster MVP |
| D-05 | Positive feedback only | Confidence | Direct correction | Better emotional UX |
| D-06 | Narrator on **Retry** | Learn by listening | Retry without narrator | Better support |
| D-07 | **3** **Retry** outcomes → **Continue** | Avoid frustration (`03` Decision 7) | Unlimited retries | Motivation preserved |
| D-08 | Minimal UI | Focus on story | Feature-rich UI | Lower cognitive load |
| D-09 | No gamification in MVP | Validate core | Badges/streaks | Clear MVP scope |
| D-10 | Contextual messages (`11`) | Avoid repetition | Random only | Noor feels aware |
| D-11 | **Reading Summary** (effort/pages, no score) | Celebrate without exam | Analytics dashboard | Child-safe closure |
| D-12 | Modular / provider-independent AI | Scalability | Monolith / single vendor | Maintainability |

---

# Traceability

Full matrix: `07_Acceptance_Criteria.md` (Decision → US → AC → EC → flows).

---

# Product Principles Behind These Decisions

Child-first; confidence before correctness; simplicity; maintainability; brand consistency (`00_Project_Principles.md`).

---

# Future Decision Reviews

- Evaluation threshold (default 0.70 in `12`)
- Consent copy (SP-01)
- Narrator timing UX

---

# Conclusion

Reference for stakeholders; must stay consistent with `03` and `README.md` terminology.
