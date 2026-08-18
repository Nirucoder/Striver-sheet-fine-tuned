/**
 * Codeforces activity helpers.
 *
 * Codeforces timestamps are Unix seconds. Dates are intentionally formatted
 * in the browser's local timezone so a submission near midnight belongs to
 * the user's day, not the Codeforces server's day.
 */

export function getLocalDateFromUnixTimestamp(timestamp, timeZone) {
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds)) return "";
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) return "";

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timeZone || undefined,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return values.year && values.month && values.day
    ? `${values.year}-${values.month}-${values.day}`
    : "";
}

/**
 * Return one activity entry per distinct accepted Codeforces problem/day.
 * Repeated accepted submissions do not inflate activity or streaks.
 */
export function buildCodeforcesActivity(submissions, timeZone) {
  const byDate = {};
  const seenByDate = new Map();

  for (const submission of Array.isArray(submissions) ? submissions : []) {
    if (submission?.verdict !== "OK") continue;
    const date = getLocalDateFromUnixTimestamp(submission.creationTimeSeconds, timeZone);
    if (!date) continue;

    const problem = submission.problem || {};
    const problemKey = [
      submission.contestId ?? problem.contestId ?? "",
      problem.index ?? "",
      problem.name ?? "",
    ].join(":");
    const uniqueKey = problemKey === "::"
      ? String(submission.id ?? `${date}-${Object.keys(byDate).length}`)
      : problemKey;

    if (!seenByDate.has(date)) seenByDate.set(date, new Set());
    if (seenByDate.get(date).has(uniqueKey)) continue;
    seenByDate.get(date).add(uniqueKey);

    if (!byDate[date]) byDate[date] = { count: 0, submissions: [] };
    byDate[date].count += 1;
    byDate[date].submissions.push({
      id: submission.id ?? null,
      contestId: submission.contestId ?? problem.contestId ?? null,
      problemIndex: problem.index ?? null,
      problemName: problem.name || "Accepted problem",
      rating: problem.rating ?? null,
      creationTimeSeconds: Number(submission.creationTimeSeconds),
    });
  }

  return byDate;
}

export function getLeetCodeActivityDates(activityLog) {
  return Object.entries(activityLog && typeof activityLog === "object" ? activityLog : {})
    .filter(([, entries]) => Array.isArray(entries) && entries.some(entry =>
      entry?.lcConfirmed || entry?.subName === "LeetCode Sync" || entry?.subName === "LeetCode AC"
    ))
    .map(([date]) => date);
}

/**
 * Replace the Codeforces portion of the combined active-date set while
 * retaining LeetCode dates and any dates that were independently confirmed by
 * the LeetCode activity log.
 */
export function mergeCodeforcesActiveDates(activeDates, previousActivity, nextActivity, leetcodeDates = []) {
  const previousCodeforcesDates = new Set(Object.keys(previousActivity || {}));
  const nextCodeforcesDates = Object.keys(nextActivity || {});
  const leetcodeDateSet = new Set(leetcodeDates);
  const retained = (Array.isArray(activeDates) ? activeDates : [])
    .filter(date => !previousCodeforcesDates.has(date) || leetcodeDateSet.has(date));
  return [...new Set([...retained, ...leetcodeDateSet, ...nextCodeforcesDates])];
}