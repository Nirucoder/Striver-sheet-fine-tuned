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
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })
    );
  } catch (err) {
    console.error("[callback]", err.message);
    res.redirect("/api/login");
  }
}
