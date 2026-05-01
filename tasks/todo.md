# Todo

- [x] Inspect homepage data flow for News and Selected Publications
- [x] Update News ranking/content: CVPR Highlight appears before ICML and explicitly marked as Highlight
- [x] Update default Selected Publications rule: only First Author / Co-first Author are shown by default
- [x] Ensure CVPR paper appears only after clicking `Show All`
- [x] Verify behavior and update review notes
- [x] Fix Selected Publications image/content horizontal alignment

## Review

- Updated `js/app.js` News rendering:
  - Publication news now appends status text (e.g., `Highlight (Second Author)`) in the News sentence.
  - Added publication ranking within the same year: `Highlight/CVPR` first, `ICML` second, then others.
- Updated `js/app.js` publications default display rule:
  - Default cards now filter by `status` containing `First Author` or `Co-first` only.
  - All other papers (including CVPR second-author highlight) are moved to `Show All`.
- Updated `data/publications.json`:
  - Set CVPR paper `selected` to `false` to match desired behavior.
- Updated `css/style.css` publication layout:
  - Removed `padding-top: 0.15rem` from `.publication-content` so image and text blocks share the same top baseline.
- Validation:
  - JSON parse passes.
  - Default primary list includes only first/co-first entries.
