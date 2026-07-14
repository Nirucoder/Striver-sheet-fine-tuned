import { getSessionUser } from "../_lib/session.js";
import { setCorsHeaders, withCalendar } from "../_lib/calendar.js";

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const data = await withCalendar(user.sub, async (accessToken) => {
      const { timeMin, timeMax } = req.query;
      const params = new URLSearchParams({
        timeMin: timeMin || new Date(Date.now() - 30 * 86400000).toISOString(),
        timeMax: timeMax || new Date(Date.now() + 60 * 86400000).toISOString(),
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "500",
      });
      const gcalRes = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      if (!gcalRes.ok) throw new Error(`GCal ${gcalRes.status}`);
      return gcalRes.json();
    });
    return res.json(data);
  } catch (e) {
    if (e.code === "not_connected") return res.status(404).json({ error: "not_connected" });
    if (e.code === "calendar_revoked") return res.status(401).json({ error: "calendar_revoked", message: "Calendar was revoked. Please reconnect." });
    return res.status(500).json({ error: e.message });
  }
}
