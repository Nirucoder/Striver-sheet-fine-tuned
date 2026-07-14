import crypto from "crypto";
import { getSessionUser, isSecureRequest } from "../_lib/session.js";
import { getCalendarClientId, getCalendarClientSecret, getRedirectUri, setCorsHeaders } from "../_lib/calendar.js";

const SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
].join(" ");

export default async function handler(req, res) {
  setCorsHeaders(req, res);
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const user = await getSessionUser(req);
  if (!user) return res.status(401).json({ error: "Unauthorized" });

  const clientId = getCalendarClientId();
  const clientSecret = getCalendarClientSecret();
  const redirectUri = getRedirectUri();

  if (!clientId || !clientSecret || !redirectUri) {
    return res.status(503).json({
      error: "Calendar not configured",
      hint: "GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI must be set on the server.",
    });
  }

  const state = crypto.randomBytes(16).toString("hex");
  const secure = isSecureRequest(req);

  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  res.setHeader(
    "Set-Cookie",
    `cal_state=${state}; HttpOnly; Path=/; Max-Age=300${secure ? "; Secure" : ""}; SameSite=Lax`
  );

  return res.json({ url: url.toString() });
}
