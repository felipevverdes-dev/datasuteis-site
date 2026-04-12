import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { registerBusinessDayApiRoutes } from "./business-days-api.js";
import { registerConnectionToolRoutes } from "./connection-tools.js";
import { registerExternalDataRoutes } from "./external-data.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGE_REQUEST_PATTERN = /\.(png|jpe?g|webp|gif|svg|ico)$/i;
const IMAGE_ASSET_PATTERN = /^\/assets\/.+\.(png|jpe?g|webp|gif|svg|ico)$/i;
const API_WINDOW_MS = 60_000;
const API_MAX_REQUESTS = 90;
const SITE_LAST_MODIFIED_HTTP = new Date(
  "2026-04-02T00:00:00-03:00"
).toUTCString();
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

  app.get(["/calculadora", "/calculadora/"], (req, res) => {
    const queryIndex = req.originalUrl.indexOf("?");
    const suffix = queryIndex >= 0 ? req.originalUrl.slice(queryIndex) : "";
    res.redirect(301, `/utilitarios/calculadora/${suffix}`);
  });

  app.get(
    ["/utilitarios/horario-mundial", "/utilitarios/horario-mundial/"],
    (req, res, next) => {
      if (req.query.tab !== "mercados") {
        next();
        return;
      }

      const target = new URL(
        `https://datasuteis.com.br/utilitarios/horario-mercados/`
      );

      Object.entries(req.query).forEach(([key, value]) => {
        if (key === "tab") {
          return;
        }

        if (Array.isArray(value)) {
          value.forEach(item => target.searchParams.append(key, String(item)));
          return;
        }

        if (value !== undefined) {
          target.searchParams.set(key, String(value));
        }
      });

      res.redirect(301, `${target.pathname}${target.search}`);
    }
  );

  app.use((req, res, next) => {
    if (isSecureRequest(req)) {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }

    res.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
    res.setHeader(
      "Permissions-Policy",
      "geolocation=(self), camera=(), microphone=(), payment=()"
    );
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    res.setHeader(
      "X-Robots-Tag",
      shouldAllowIndexing(req.hostname) ? "index, follow" : "noindex, nofollow"
    );
    next();
  });

  app.use((req, res, next) => {
    if (
      !IMAGE_ASSET_PATTERN.test(req.path) ||
      !IMAGE_REQUEST_PATTERN.test(req.path)
    ) {
      next();
      return;
    }

    const refererHost = getHostFromReferer(req.get("referer"));
    const requestHost = req.hostname?.toLowerCase();
    if (
      refererHost &&
      refererHost !== requestHost &&
      !ALLOWED_ASSET_HOSTS.has(refererHost)
    ) {
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
        message:
          "Muitas requisições em pouco tempo. Tente novamente em instantes.",
        retryAfterSeconds: retryAfter,
      });
      return;
    }

    bucket.count += 1;
    res.setHeader("RateLimit-Limit", String(API_MAX_REQUESTS));
    res.setHeader(
      "RateLimit-Remaining",
      String(Math.max(0, API_MAX_REQUESTS - bucket.count))
    );
    res.setHeader(
      "RateLimit-Reset",
      String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)))
    );
    next();
  });

  registerBusinessDayApiRoutes(app);
  registerConnectionToolRoutes(app);
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

    res.status(200).type("text/plain").send("User-agent: *\nDisallow: /\n");
  });

  app.use(
    express.static(staticPath, {
      etag: true,
      setHeaders: (res, filePath) => {
        const normalized = filePath.replace(/\\/g, "/");
        const isHtmlFile = /\.(html)$/i.test(normalized);
        const isManifestFile = /\/manifest\.json$/i.test(normalized);
        const isServiceWorkerFile = /\/service-worker\.js$/i.test(normalized);
        const isFaviconFile = /\/favicon\.ico$/i.test(normalized);
        const isHashedBuildAsset =
          /\/assets\/.+-[A-Za-z0-9_-]{8,}\.[A-Za-z0-9]+$/i.test(normalized);

        if (
          isHtmlFile ||
          isManifestFile ||
          isServiceWorkerFile ||
          isFaviconFile
        ) {
          res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
          res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
          res.setHeader("Pragma", "no-cache");
          res.setHeader("Expires", "0");
          return;
        }

        if (/\.(xml|txt)$/i.test(normalized)) {
          res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
          res.setHeader("Cache-Control", "public, max-age=86400");
          return;
        }

        if (isHashedBuildAsset) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
          return;
        }

        if (/\/assets\//i.test(normalized)) {
          res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        }
      },
    })
  );

  app.use("/api", (_req, res) => {
    res.status(404).type("application/json").json({
      ok: false,
      error: "api_not_found",
      message: "Rota de API não encontrada.",
    });
  });

  // ── SPA fallback ──
  //
  // postbuild-seo.mjs generates a static index.html for every route that
  // appears in the sitemap (including ~72k year/month pages).  Those files
  // are served by express.static above with HTTP 200.
  //
  // If a request reaches this wildcard, it means there is NO matching
  // static file.  We need to decide:
  //   • HTML request to a path that matches the SPA router  → 200 + SPA shell
  //   • Everything else                                      → 404
  //
  // SPA route patterns mirror the <Switch> in client/src/App.tsx.
  const SPA_ROUTE_PATTERNS: RegExp[] = [
    /^\/$/,
    /^\/calcular\/?$/,
    /^\/calendario\/?$/,
    /^\/calendario\/\d{4}\/?$/,
    /^\/calendario\/\d{4}\/[a-z]+\/?$/,
    /^\/escala\/?$/,
    /^\/idade\/?$/,
    /^\/idade\/calcular-idade\/?$/,
    /^\/idade\/data-de-nascimento\/?$/,
    /^\/idade\/dia-da-semana-que-nasceu\/?$/,
    /^\/idade\/quantos-dias-eu-tenho-de-vida\/?$/,
    /^\/dias-uteis\/?$/,
    /^\/dias-uteis\/\d{4}\/?$/,
    /^\/dias-uteis\/\d{4}\/[a-z]+\/?$/,
    /^\/quinto-dia-util\/?$/,
    /^\/quinto-dia-util\/\d{4}\/?$/,
    /^\/quinto-dia-util\/\d{4}\/[a-z]+\/?$/,
    /^\/utilitarios\/?$/,
    /^\/utilitarios\/calculadora\/?$/,
    /^\/utilitarios\/sorteador\/?$/,
    /^\/utilitarios\/conversor-de-moeda\/?$/,
    /^\/utilitarios\/clima\/?$/,
    /^\/utilitarios\/qual-e-meu-ip\/?$/,
    /^\/utilitarios\/teste-de-throttling\/?$/,
    /^\/utilitarios\/horario-mundial\/?$/,
    /^\/utilitarios\/horario-mercados\/?$/,
    /^\/jogos\/?$/,
    /^\/jogos\/sudoku\/?$/,
    /^\/jogos\/caca-palavras\/?$/,
    /^\/jogos\/palavras-cruzadas\/?$/,
    /^\/jogos\/jogo-da-velha\/?$/,
    /^\/blog\/?$/,
    /^\/blog\/[a-z0-9-]+\/?$/,
    /^\/sobre\/?$/,
    /^\/contato\/?$/,
    /^\/privacidade\/?$/,
    /^\/termos\/?$/,
    /^\/calculadora\/?$/,
    /^\/404\/?$/,
  ];

  function isSpaRoute(pathname: string) {
    return SPA_ROUTE_PATTERNS.some(pattern => pattern.test(pathname));
  }

  const spaShellPath = path.join(staticPath, "index.html");

  app.get("*", (req, res) => {
    if (path.extname(req.path) || !req.accepts("html")) {
      res.status(404).type("text/plain").send("Not found.");
      return;
    }

    res.setHeader("Last-Modified", SITE_LAST_MODIFIED_HTTP);
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    if (isSpaRoute(req.path)) {
      // Valid SPA route without a pre-rendered file → serve SPA shell with 200
      res.status(200).sendFile(spaShellPath);
    } else {
      // Truly unknown route → 404
      res.status(404).sendFile(path.join(staticPath, "404.html"));
    }
  });

  const port = process.env.PORT || 3000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
