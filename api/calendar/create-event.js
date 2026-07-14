import { getSessionUser, csrfMatches, parseCookies, CSRF_COOKIE, CSRF_HEADER } from "../_lib/session.js";
import { setCorsHeaders, withCalendar } from "../_lib/calendar.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const cookies = parseCookies(req);
  if (!csrfMatches(cookies[CSRF_COOKIE], req.headers[CSRF_HEADER])) {
    return res.status(403).json({ error: "Invalid CSRF token" });
  }

  const { summary, description, start, end } = req.body || {};
  if (!summary || !start || !end) {
    return res.status(400).json({ error: "summary, start, and end are required" });
  }

  try {
    const data = await withCalendar(user.sub, async (accessToken) => {
      const gcalRes = await fetch(
        "https://www.googleapis.com/calendar/v3/calendars/primary/events",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
          body: JSON.stringify({ summary, description: description || "", start, end }),
        }
      );
      if (!gcalRes.ok) throw new Error(`GCal ${gcalRes.status}`);
      return gcalRes.json();
    });
    return res.json(data);
  } catch (e) {
    if (e.code === "not_connected") return res.status(404).json({ error: "not_connected" });
    if (e.code === "calendar_revoked") return res.status(401).json({ error: "calendar_revoked" });
    return res.status(500).json({ error: e.message });
  }
}
