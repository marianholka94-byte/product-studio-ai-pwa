// PRODUCT STUDIO AI commercial preview Worker.
// Isolated preview only: D1-backed customer accounts and session management.
// Does not replace the production Worker or invoke paid generation APIs.
const ALLOWED_ORIGINS = new Set([
  "https://feature-social-export-preset.product-studio-ai-pwa.pages.dev",
  "https://product-studio-ai-pwa.pages.dev",
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost"
]);
const PASSWORD_ITERATIONS = 310000;
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const encoder = new TextEncoder();

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Vary": "Origin"
  };
}
function json(data, status = 200, origin = null) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...corsHeaders(origin) }
  });
}
function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function randomToken(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return b64url(value);
}
async function sha256(value) {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", encoder.encode(value))));
}
async function passwordHash(password, salt = randomToken(16)) {
  const material = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: PASSWORD_ITERATIONS },
    material, 256
  );
  return `pbkdf2-sha256$${PASSWORD_ITERATIONS}$${salt}$${b64url(new Uint8Array(bits))}`;
}
async function verifyPassword(password, stored) {
  try {
    const [algorithm, iterationsText, salt, expected] = stored.split("$");
    if (algorithm !== "pbkdf2-sha256" || Number(iterationsText) !== PASSWORD_ITERATIONS || !salt || !expected) return false;
    return (await passwordHash(password, salt)).split("$")[3] === expected;
  } catch { return false; }
}
function bearerToken(request) {
  const match = /^Bearer\s+(.+)$/i.exec(request.headers.get("Authorization") || "");
  return match?.[1] || "";
}
async function currentUser(request, env) {
  const token = bearerToken(request);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `SELECT u.id, u.email, u.display_name, u.created_at
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active'
     LIMIT 1`
  ).bind(tokenHash, now).first();
  return row || null;
}
async function createSession(env, userId) {
  const token = randomToken(32);
  const now = Math.floor(Date.now() / 1000);
  const expires = now + SESSION_SECONDS;
  await env.DB.prepare(
    "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?, ?)"
  ).bind(crypto.randomUUID(), userId, await sha256(token), now, expires).run();
  return { token, expiresIn: SESSION_SECONDS };
}
function publicUser(row) {
  return { id: row.id, email: row.email, displayName: row.display_name || "", createdAt: row.created_at };
}
async function readJson(request) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > 12000) throw new Error("Požiadavka je príliš veľká.");
  try { return await request.json(); }
  catch { throw new Error("Požiadavka neobsahuje platné JSON dáta."); }
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin && !ALLOWED_ORIGINS.has(origin)) return json({ error: "Tento pôvod požiadavky nie je povolený." }, 403, origin);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });

    const url = new URL(request.url);
    if (!env.DB || !env.MEDIA) return json({ ok: false, error: "Preview storage bindings are missing." }, 503, origin);

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        const db = await env.DB.prepare("SELECT 1 AS ok").first();
        const objects = await env.MEDIA.list({ limit: 1 });
        return json({
          ok: db?.ok === 1 && Array.isArray(objects?.objects),
          service: "PRODUCT STUDIO AI commercial preview",
          storage: { d1: db?.ok === 1, r2: Array.isArray(objects?.objects) }
        }, 200, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/register") {
        const body = await readJson(request);
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        const displayName = String(body.displayName || "").trim().slice(0, 80);
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
          return json({ error: "Zadaj platnú e-mailovú adresu." }, 400, origin);
        }
        if (password.length < 12 || password.length > 128) {
          return json({ error: "Heslo musí mať 12 až 128 znakov." }, 400, origin);
        }
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const hashed = await passwordHash(password);
        try {
          await env.DB.prepare(
            "INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(id, email, displayName, hashed, now, now).run();
        } catch (error) {
          if (/unique|constraint/i.test(String(error))) return json({ error: "Účet s touto e-mailovou adresou už existuje." }, 409, origin);
          throw error;
        }
        const session = await createSession(env, id);
        return json({ user: { id, email, displayName, createdAt: now }, ...session }, 201, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/login") {
        const body = await readJson(request);
        const email = String(body.email || "").trim().toLowerCase();
        const password = String(body.password || "");
        if (!email || !password || email.length > 254 || password.length > 128) {
          return json({ error: "Skontroluj e-mail a heslo." }, 400, origin);
        }
        const user = await env.DB.prepare(
          "SELECT id, email, display_name, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE AND status = 'active' LIMIT 1"
        ).bind(email).first();
        if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
          return json({ error: "Nesprávny e-mail alebo heslo." }, 401, origin);
        }
        const session = await createSession(env, user.id);
        return json({ user: publicUser(user), ...session }, 200, origin);
      }

      if (request.method === "GET" && url.pathname === "/api/auth/me") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        return json({ user: publicUser(user) }, 200, origin);
      }

      if (request.method === "POST" && url.pathname === "/api/auth/logout") {
        const token = bearerToken(request);
        if (token) {
          await env.DB.prepare("UPDATE sessions SET revoked_at = ? WHERE token_hash = ? AND revoked_at IS NULL")
            .bind(Math.floor(Date.now() / 1000), await sha256(token)).run();
        }
        return json({ ok: true }, 200, origin);
      }

      return json({ error: "Not found" }, 404, origin);
    } catch (error) {
      // Never return SQL details, password hashes or provider internals to clients.
      const message = String(error?.message || "");
      if (message === "Požiadavka je príliš veľká." || message === "Požiadavka neobsahuje platné JSON dáta.") {
        return json({ error: message }, 400, origin);
      }
      return json({ ok: false, error: "Požiadavku sa nepodarilo spracovať. Skús to znova." }, 500, origin);
    }
  }
};
