import {
  getSessionMiddleware,
  initPassport,
  ensureStrategy,
  runMiddleware,
  passport,
} from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  initPassport();

  try {
    await runMiddleware(req, res, getSessionMiddleware());
    await runMiddleware(req, res, passport.initialize());
    await runMiddleware(req, res, passport.session());

    const strategyName = await ensureStrategy(req.headers.host);

    await runMiddleware(req, res,
      passport.authenticate(strategyName, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })
    );
  } catch (err) {
    console.error("[login]", err.message);
    res.status(500).json({ error: "Login failed" });
  }
}
