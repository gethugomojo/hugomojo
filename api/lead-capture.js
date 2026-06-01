const {
  json,
  addLeadToAirtable,
  sendLeadCaptureWithResend
} = require("./_delivery-config");

const MAX_BODY_BYTES = 16 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 10;
const rateLimitStore = globalThis.__hmLeadRateLimitStore || new Map();
globalThis.__hmLeadRateLimitStore = rateLimitStore;

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function clientIp(req) {
  const forwarded = String(req.headers["x-forwarded-for"] || "");
  return forwarded.split(",")[0].trim() || req.socket?.remoteAddress || "unknown";
}

function isAllowedOrigin(req) {
  const origin = String(req.headers.origin || "").trim();
  if (!origin) return true;

  const configured = String(process.env.HUGOMOJO_ALLOWED_ORIGINS || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);

  if (configured.length) return configured.includes(origin);
  return /^https:\/\/(www\.)?hugomojo\.com$/.test(origin) || /^https:\/\/[^/]+\.vercel\.app$/.test(origin);
}

function setCorsHeaders(req, res) {
  const origin = String(req.headers.origin || "").trim();
  if (origin && isAllowedOrigin(req)) {
    res.setHeader("access-control-allow-origin", origin);
    res.setHeader("vary", "Origin");
  }
  res.setHeader("access-control-allow-methods", "POST,OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function checkRateLimit(req) {
  const key = clientIp(req);
  const now = Date.now();
  const current = rateLimitStore.get(key) || { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };

  if (current.resetAt <= now) {
    current.count = 0;
    current.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  current.count += 1;
  rateLimitStore.set(key, current);

  for (const [storeKey, item] of rateLimitStore.entries()) {
    if (item.resetAt <= now) rateLimitStore.delete(storeKey);
  }

  return current.count <= RATE_LIMIT_MAX;
}

function readJsonBody(req) {
  if (typeof req.body === "object" && req.body) return Promise.resolve(req.body);

  return new Promise((resolve, reject) => {
    let raw = "";
    let size = 0;

    req.on("data", chunk => {
      size += chunk.length;
      if (size > MAX_BODY_BYTES) {
        reject(Object.assign(new Error("Payload too large."), { statusCode: 413 }));
        req.destroy();
        return;
      }
      raw += chunk;
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch (error) {
        reject(Object.assign(new Error("Invalid JSON payload."), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res);

  if (req.method === "OPTIONS") {
    return json(res, isAllowedOrigin(req) ? 200 : 403, { ok: isAllowedOrigin(req) });
  }

  if (req.method !== "POST") {
    res.setHeader("allow", "POST, OPTIONS");
    return json(res, 405, { ok: false, error: "Method not allowed." });
  }

  if (!isAllowedOrigin(req)) {
    return json(res, 403, { ok: false, error: "Origin not allowed." });
  }

  if (!checkRateLimit(req)) {
    return json(res, 429, { ok: false, error: "Too many attempts. Please try again later." });
  }

  let body = {};
  try {
    body = await readJsonBody(req);
  } catch (error) {
    return json(res, error.statusCode || 400, { ok: false, error: error.message || "Invalid request." });
  }

  if (String(body.company || body.website || "").trim()) {
    return json(res, 200, { ok: true, skipped: true });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isEmail(email)) {
    return json(res, 400, { ok: false, error: "Valid email is required." });
  }

  const result = {
    resend: {
      configured: Boolean(process.env.RESEND_API_KEY),
      delivered: false
    },
    airtable: {
      configured: Boolean((process.env.AIRTABLE_API_KEY || process.env.AIRTABLE_PAT) && process.env.AIRTABLE_BASE_ID),
      delivered: false
    }
  };

  if (result.resend.configured) {
    try {
      await sendLeadCaptureWithResend({
        email,
        body
      });
      result.resend.delivered = true;
    } catch (error) {
      result.resend.error = error.message;
    }
  }

  if (result.airtable.configured) {
    try {
      const airtable = await addLeadToAirtable({ email, body });
      result.airtable.delivered = true;
      result.airtable.recordId = airtable.recordId || "";
    } catch (error) {
      result.airtable.error = error.message;
    }
  }

  return json(res, 200, { ok: true, ...result });
};
