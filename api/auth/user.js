import {
  getSessionMiddleware,
  initPassport,
  getPool,
  runMiddleware,
  passport,
} from "../_lib/auth.js";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  initPassport();

  await runMiddleware(req, res, getSessionMiddleware());
  await runMiddleware(req, res, passport.initialize());
  await runMiddleware(req, res, passport.session());

  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });

  try {
    const db = getPool();
    const { rows } = await db.query(
      "SELECT id, email, first_name, last_name, profile_image_url FROM users WHERE id = $1",
      [userId]
    );
    res.json(rows[0] || null);
  } catch (err) {
    console.error("[auth/user]", err.message);
    res.status(500).json({ message: "Server error" });
  }
}
