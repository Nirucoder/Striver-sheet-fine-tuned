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
- `streak_data` — `{ currentStreak, longestStreak, lastActiveDate, activeDates[] }` — LeetCode-driven streak
- `streak_freezes` — `{ month:"YYYY-MM", used:[], count:N }` — resets to count:0 on new month

## Streak system (rebuilt)
- Source of truth: LeetCode API ONLY. Manual logs do NOT affect streak.
- `getStreakDate()` — 5AM boundary: if hour < 5, return yesterday's date. Always use this instead of `new Date().toISOString().slice(0,10)` for streak.
- `prevDateStr(dateStr)` — returns the calendar day before dateStr (using T12:00:00Z to avoid DST issues).
- `computeStreak(activeDatesArr, freezeUsedArr)` — counts consecutive active-or-frozen days backwards from today/yesterday.
- `markDateActive(date)` — call after LeetCode sync if `Object.values(slugToDate).some(d => d === getStreakDate())`.
- `applyFreeze(targetDate)` — spends one freeze; recalculates streak; updates both `streakData` and `streakFreezes`.
- On load: if neither today nor yesterday is in activeDates+freezeUsed → set currentStreak = 0.
- Month rollover: if `streakFreezes.month !== monthKey`, reset freezes to `{ month, used:[], count:0 }`.
- `streak` const = `streakData.currentStreak` — compat alias passed to Dashboard/AISuggestions as `streak` prop.
- Freeze button in Dashboard: shows only when `yesterdayAtRisk || canFreezeToday`. Shows "❄️ X/3 freezes left" otherwise.

## Key compat rules
- Do NOT remove/rename `COA_TABLE` constant or `coaData` state — used by WeeklyPlanner, handleReset, Dashboard `coaDone`, Analytics, ALL_REV_TOPICS merge logic.
- `coaGsProgress` (new) is purely for the COA tab video tracker. Old coaData is purely for weekly planning stats.
- `todos`/`setTodos` must be threaded down to both `Dashboard` and `TodoApp` from the single `useLocalStorage("studyos_todos_v1", [])` in App.
- Cloud sync payload must include both `streak` (compat) and `streakData`/`streakFreezes` (new). On restore: prefer `data.streakData` if present, fall back to `data.streak` number.

## Vite build (Vercel fix)
- `express`, `cors`, `pg` and Node built-ins must be listed in `build.rollupOptions.external` in vite.config.js or Vite tries to bundle them and breaks the frontend build.

## Calendar auth
- Use `localStorage` (not `sessionStorage`) for `gcal_token` and `gcal_token_exp` so auth persists across page reloads.
- On init, validate expiry before restoring token (must be > Date.now() + 60000ms).

**Why:** These were hard-won lessons from a multi-feature implementation session where compat breaks were the main risk.

## LeetCode sync rate limits
- Use the app-owned `/api/leetcode/:username` proxy as the only automatic sync path.
- Keep a short server-side cache and coalesce simultaneous requests; preserve the last successful response during temporary 429 cooldowns.
- Keep one app-level poller rather than separate page-level timers.

**Why:** Multiple browser requests to third-party LeetCode endpoints and overlapping page/app timers amplified intermittent 429 responses and exposed them as misleading submission failures.

**How to apply:** Any future LeetCode data source or polling change must retain the shared proxy, cache, in-flight request reuse, and stale-data behavior unless the rate-limit strategy is deliberately redesigned.
