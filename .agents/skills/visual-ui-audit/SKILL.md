---
name: visual-ui-audit
description: Use this repo-local skill when building, redesigning, or deploying Isengard frontend UI, especially when the user asks to avoid vibe-coded output, inspect screenshots, verify mobile/laptop views, or iterate visually before shipping. It runs the app, captures real browser screenshots, checks layout failures, and requires human-style screenshot review before commit or deploy.
metadata:
  short-description: Screenshot and inspect Isengard UI before shipping
---

# Visual UI Audit

Use this skill before committing or deploying meaningful Isengard UI changes.

## Workflow

1. Build the production UI and run the audit:

   ```bash
   npm run visual:audit:build
   ```

   To audit an already-running deployment or preview:

   ```bash
   VISUAL_AUDIT_URL=https://example.up.railway.app npm run visual:audit
   ```

2. Open the generated screenshots from `artifacts/visual-audit/<timestamp>/` with `view_image`.

3. Judge the screenshots against the active design references and these Isengard standards:
   - The app must feel like a full application window, not a poster frame or landing-page cover.
   - Each view should have one dominant task, with quiet side panels and clear empty space.
   - The environment diagram should read as a designed architecture canvas, not a generic graph or dashboard grid.
   - Desktop and mobile must be separate, intentional compositions.
   - Browser overscroll must never reveal white page chrome behind the dark experience.
   - Icon-only controls must have accessible names.

4. If the script reports hard failures, fix them before deploy.

5. If hard checks pass but the screenshot still looks cluttered, generic, cramped, or unlike the reference direction, iterate the UI and rerun the audit.

6. Only deploy after the final screenshot pass is visually acceptable.

## Outputs

The audit writes:

- `desktop-environment.png`
- `desktop-generate.png`
- `desktop-insights.png`
- `wide-environment.png`
- `wide-generate.png`
- `wide-insights.png`
- `mobile-environment.png`
- `summary.md`
- `report.json`

Generated artifacts are ignored by git.
