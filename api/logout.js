import * as oidcClient from "openid-client";
import {
  getSessionMiddleware,
  initPassport,
  getOidcConfig,
  runMiddleware,
  passport,
} from "./_lib/auth.js";

export default async function handler(req, res) {
  if (req.method === "OPTIONS") return res.status(200).end();

  initPassport();

  await runMiddleware(req, res, getSessionMiddleware());
  await runMiddleware(req, res, passport.initialize());
  await runMiddleware(req, res, passport.session());

  req.logout(async () => {
    try {
      const cfg = await getOidcConfig();
      const endUrl = oidcClient.buildEndSessionUrl(cfg, {
        client_id: process.env.REPL_ID,
        post_logout_redirect_uri: `${req.headers["x-forwarded-proto"] ?? "https"}://${req.headers.host}`,
      }).href;
      res.redirect(endUrl);
    } catch {
      res.redirect("/");
    }
  });
}
