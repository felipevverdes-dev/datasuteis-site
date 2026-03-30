import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerBusinessDayApiRoutes } from "./business-days-api.js";
import { registerExternalDataRoutes } from "./external-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGE_REQUEST_PATTERN = /\.(png|jpe?g|webp|gif|svg|ico)$/i;
const IMAGE_ASSET_PATTERN = /^\/assets\/.+\.(png|jpe?g|webp|gif|svg|ico)$/i;
const API_WINDOW_MS = 60_000;
const API_MAX_REQUESTS = 90;
const SITE_LAST_MODIFIED_HTTP = new Date("2026-03-29T00:00:00-03:00").toUTCString();
const ALLOWED_ASSET_HOSTS = new Set([
  "datasuteis.com.br",
  "www.datasuteis.com.br",
  "localhost",
  "127.0.0.1",
]);
const ALLOWED_INDEX_HOSTS = new Set(["datasuteis.com.br"]);
const apiRateBuckets = new Map<string, { count: number; resetAt: number }>();
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://api.frankfurter.app https://open.er-api.com https://api.open-meteo.com https://geocoding-api.open-meteo.com https://api.bigdatacloud.net https://ipwho.is https://ipapi.co https://www.google-analytics.com https://region1.google-analytics.com",
  "frame-src 'self' https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net",
].join("; ");

function getHostFromReferer(referer: string | undefined) {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).hostname.toLowerCase();
  } catch {
    return null;
  }
}

function shouldAllowIndexing(hostname: string | undefined) {
  const normalizedHostname = hostname?.toLowerCase();
  if (!normalizedHostname) {
    return false;
  }

  return (
    process.env.NODE_ENV === "production" &&
    ALLOWED_INDEX_HOSTS.has(normalizedHostname)
  );
}

function isSecureRequest(req: express.Request) {
  if (req.secure) {
    return true;
  }

  const forwardedProto = req.headers["x-forwarded-proto"];
  const normalizedProto =
    typeof forwardedProto === "string"
      ? forwardedProto.split(",")[0]?.trim().toLowerCase()
      : Array.isArray(forwardedProto)
        ? forwardedProto[0]?.trim().toLowerCase()
        : "";

  return normalizedProto === "https";
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  app.set("trust proxy", true);

  // Canonical domain redirect: www → non-www (301 permanent)
  app.use((req, res, next) => {
    if (req.hostname === "www.datasuteis.com.br") {
      const proto = req.headers["x-forwarded-proto"] ?? "https";
      return res.redirect(301, `${proto}://datasuteis.com.br${req.url}`);
    }
    next();
  });

  app.use((req, res, next) => {
    if (isSecureRequest(req)) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload",
      );
    }

    res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(self), camera=(), microphone=(), payment=()",
    );
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    res.setHeader(
      "X-Robots-Tag",
      shouldAllowIndexing(req.hostname) ? "index, follow" : "noindex, nofollow",
    );
    next();
  });

  app.use((req, res, next) => {
    if (!IMAGE_ASSET_PATTERN.test(req.path) || !IMAGE_REQUEST_PATTERN.test(req.path)) {
      next();
      return;
    }

    const refererHost = getHostFromReferer(req.get("referer"));
    if (refererHost && !ALLOWED_ASSET_HOSTS.has(refererHost)) {
      res.status(403).type("text/plain").send("Hotlink blocked.");
      return;
    }

    next();
  });

  app.use("/api", (req, res, next) => {
    const ip =
      req.ip ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "unknown";
    const now = Date.now();
    const bucket = apiRateBuckets.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      apiRateBuckets.set(ip, {
        count: 1,
        resetAt: now + API_WINDOW_MS,
      });
      res.setHeader("RateLimit-Limit", String(API_MAX_REQUESTS));
      res.setHeader("RateLimit-Remaining", String(API_MAX_REQUESTS - 1));
      res.setHeader("RateLimit-Reset", String(Math.ceil(API_WINDOW_MS / 1000)));
      next();
      return;
    }

    if (bucket.count >= API_MAX_REQUESTS) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfter));
      res.status(429).json({
        ok: false,
        error: "rate_limited",
        message: "Muitas requisições em pouco tempo. Tente novamente em instantes.",
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    bucket.count += 1;
    res.setHeader("RateLimit-Limit", String(API_MAX_REQUESTS));
    res.setHeader(
      "RateLimit-Remaining",
      String(Math.max(0, API_MAX_REQUESTS - bucket.count)),
    );
    res.setHeader(
      "RateLimit-Reset",
      String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))),
    );
    next();
  });

  registerBusinessDayApiRoutes(app);
  registerExternalDataRoutes(app);

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.get("/robots.txt", (req, res, next) => {
    if (shouldAllowIndexing(req.hostname)) {
      next();
      return;
    }

    res
      .status(200)
      .type("text/plain")
      .send("User-agent: *\nDisallow: /\n");
  });

  app.use(
    express.static(staticPath, {
      etag: true,
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");

        if (/\.(html)$/i.test(normalized)) {
          res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
          return;
        }

        if (/\.(xml|txt)$/i.test(normalized)) {
          res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
          res.setHeader("Cache-Control", "public, max-age=86400");
          return;
        }

        if (/\/assets\/.+-[A-Za-z0-9]{8,}\.[A-Za-z0-9]+$/i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        if (/\/assets\//i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=604800");
        }
      },
    }),
  );

  app.use("/api", (_req, res) => {
    res.status(404).type("application/json").json({
      ok: false,
      error: "api_not_found",
      message: "Rota de API não encontrada.",
    });
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
