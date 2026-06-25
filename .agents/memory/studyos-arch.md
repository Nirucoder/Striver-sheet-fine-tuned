---
name: StudyOS architecture
description: Key localStorage keys, state boundaries, and compat rules to never break
---

## localStorage keys
- `srm_coa_v3` — old COA topic array (coaData). KEEP IT — WeeklyPlanner, Dashboard stats, Analytics all read it.
- `coa_tracker_gs` — new video-based COA progress object (coaGsProgress). OS Tracker pattern.
- `os_progress_v1` — OS video tracker progress object
- `maths_progress_v1` — Maths video tracker progress object
- `studyos_todos_v1` — global todos array (shared between TodoApp tab + Dashboard Today's Work card)
- `a2z_solved` — DSA solved questions object
- `studyos_cal_v1` — calendar local events

## Key compat rules
- Do NOT remove/rename `COA_TABLE` constant or `coaData` state — used by WeeklyPlanner, handleReset, Dashboard `coaDone`, Analytics, ALL_REV_TOPICS merge logic.
- `coaGsProgress` (new) is purely for the COA tab video tracker. Old coaData is purely for weekly planning stats.
- `todos`/`setTodos` must be threaded down to both `Dashboard` and `TodoApp` from the single `useLocalStorage("studyos_todos_v1", [])` in App.

## Vite build (Vercel fix)
- `express`, `cors`, `pg` and Node built-ins must be listed in `build.rollupOptions.external` in vite.config.js or Vite tries to bundle them and breaks the frontend build.

## Calendar auth
- Use `localStorage` (not `sessionStorage`) for `gcal_token` and `gcal_token_exp` so auth persists across page reloads.
- On init, validate expiry before restoring token (must be > Date.now() + 60000ms).

**Why:** These were hard-won lessons from a multi-feature implementation session where compat breaks were the main risk.
