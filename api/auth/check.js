import { getGoogleClientId, verifyGoogleIdToken } from "../_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const clientId = getGoogleClientId();
  const authHeader = req.headers.authorization || req.headers.Authorization;
  const { payload, reason } = await verifyGoogleIdToken(authHeader);

  return res.json({
    serverConfigured: !!clientId,
    tokenPresent: !!(authHeader && authHeader.startsWith("Bearer ")),
    tokenValid: !!payload,
    reason: reason || (clientId ? null : "missing_client_id"),
  });
}
