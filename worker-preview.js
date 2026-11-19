// PRODUCT STUDIO AI commercial preview Worker.
// Isolated preview only: D1-backed customer accounts and session management.
// Does not replace the production Worker or invoke paid generation APIs.
const ALLOWED_ORIGINS = new Set([
  "https://feature-social-export-preset.product-studio-ai-pwa.pages.dev",
  "https://feature-commercial-worker-pr.product-studio-ai-pwa.pages.dev",
  "https://07bfc5c3.product-studio-ai-pwa.pages.dev",
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
  if (!request.body) throw new Error("Požiadavka neobsahuje platné JSON dáta.");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > 12000) {
        await reader.cancel();
        throw new Error("Požiadavka je príliš veľká.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); }
  catch { throw new Error("Požiadavka neobsahuje platné JSON dáta."); }
}
async function authAttemptKey(request, email) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  return sha256(ip + "|" + email);
}
async function loginIsBlocked(env, key, now) {
  const row = await env.DB.prepare(
    "SELECT blocked_until FROM auth_rate_limits WHERE key_hash = ? LIMIT 1"
  ).bind(key).first();
  return Number(row?.blocked_until || 0) > now;
}
async function recordLoginFailure(env, key, now) {
  await env.DB.prepare(
    `INSERT INTO auth_rate_limits (key_hash, attempts, window_started_at, blocked_until, updated_at)
     VALUES (?, 1, ?, 0, ?)
     ON CONFLICT(key_hash) DO UPDATE SET
       attempts = CASE WHEN auth_rate_limits.window_started_at <= ? THEN 1 ELSE auth_rate_limits.attempts + 1 END,
       window_started_at = CASE WHEN auth_rate_limits.window_started_at <= ? THEN ? ELSE auth_rate_limits.window_started_at END,
       blocked_until = CASE
         WHEN (CASE WHEN auth_rate_limits.window_started_at <= ? THEN 1 ELSE auth_rate_limits.attempts + 1 END) >= 5
         THEN ? ELSE auth_rate_limits.blocked_until END,
       updated_at = excluded.updated_at`
  ).bind(key, now, now, now - 900, now - 900, now, now - 900, now + 900).run();
}
async function clearLoginFailures(env, key) {
  await env.DB.prepare("DELETE FROM auth_rate_limits WHERE key_hash = ?").bind(key).run();
}

function validText(value, max, fallback = "") {
  if (value == null) return fallback;
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : null;
}
function validSettings(value) {
  if (value == null) return "{}";
  if (typeof value !== "object" || Array.isArray(value)) return null;
  const encoded = JSON.stringify(value);
  return encoded.length <= 12000 ? encoded : null;
}
async function ownedProduct(env, userId, productId) {
  return env.DB.prepare(
    "SELECT id, name, description, created_at, updated_at, archived_at FROM products WHERE id = ? AND user_id = ? LIMIT 1"
  ).bind(productId, userId).first();
}
async function ownedProject(env, userId, projectId) {
  return env.DB.prepare(
    "SELECT id, product_id, name, status, prompt, settings_json, export_preset, created_at, updated_at, archived_at FROM projects WHERE id = ? AND user_id = ? LIMIT 1"
  ).bind(projectId, userId).first();
}
function publicProduct(row) {
  return { id: row.id, name: row.name, description: row.description, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at };
}
function publicProject(row) {
  let settings = {};
  try { settings = JSON.parse(row.settings_json || "{}"); } catch {}
  return { id: row.id, productId: row.product_id, name: row.name, status: row.status, prompt: row.prompt, settings, exportPreset: row.export_preset, createdAt: row.created_at, updatedAt: row.updated_at, archivedAt: row.archived_at };
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
        // Public sign-up stays closed unless the owner explicitly configures a preview invite secret.
        if (!env.PREVIEW_SIGNUP_CODE) {
          return json({ error: "Registrácia v testovacej verzii zatiaľ nie je povolená." }, 503, origin);
        }
        const body = await readJson(request);
        if (typeof body.inviteCode !== "string" || body.inviteCode !== env.PREVIEW_SIGNUP_CODE) {
          return json({ error: "Neplatný pozývací kód." }, 403, origin);
        }
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
        const now = Math.floor(Date.now() / 1000);
        const attemptKey = await authAttemptKey(request, email);
        if (await loginIsBlocked(env, attemptKey, now)) {
          return json({ error: "Príliš veľa neúspešných pokusov. Skús to znova o 15 minút." }, 429, origin);
        }
        const user = await env.DB.prepare(
          "SELECT id, email, display_name, password_hash, created_at FROM users WHERE email = ? COLLATE NOCASE AND status = 'active' LIMIT 1"
        ).bind(email).first();
        if (!user || !user.password_hash || !(await verifyPassword(password, user.password_hash))) {
          await recordLoginFailure(env, attemptKey, now);
          return json({ error: "Nesprávny e-mail alebo heslo." }, 401, origin);
        }
        await clearLoginFailures(env, attemptKey);
        const session = await createSession(env, user.id);
        return json({ user: publicUser(user), ...session }, 200, origin);
      }

      // Every library endpoint is scoped to the authenticated account. Client-supplied user IDs are ignored.
      if (url.pathname.startsWith("/api/products") || url.pathname.startsWith("/api/projects")) {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const now = Math.floor(Date.now() / 1000);
        const productMatch = /^\\/api\\/products(?:\\/([a-zA-Z0-9_-]{1,80}))?$/.exec(url.pathname);
        const projectMatch = /^\\/api\\/projects(?:\\/([a-zA-Z0-9_-]{1,80}))?$/.exec(url.pathname);

        if (productMatch) {
          const productId = productMatch[1];
          if (request.method === "GET" && !productId) {
            const result = await env.DB.prepare(
              "SELECT id, name, description, created_at, updated_at, archived_at FROM products WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100"
            ).bind(user.id).all();
            return json({ products: (result.results || []).map(publicProduct) }, 200, origin);
          }
          if (request.method === "POST" && !productId) {
            const body = await readJson(request);
            const name = validText(body.name, 120);
            const description = validText(body.description, 2000, "");
            if (!name || !name.length || description === null) return json({ error: "Skontroluj názov a popis produktu." }, 400, origin);
            const id = crypto.randomUUID();
            await env.DB.prepare(
              "INSERT INTO products (id, user_id, name, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
            ).bind(id, user.id, name, description, now, now).run();
            return json({ product: publicProduct({ id, name, description, created_at: now, updated_at: now, archived_at: null }) }, 201, origin);
          }
          if (productId && request.method === "GET") {
            const row = await ownedProduct(env, user.id, productId);
            return row ? json({ product: publicProduct(row) }, 200, origin) : json({ error: "Produkt sa nenašiel." }, 404, origin);
          }
          if (productId && request.method === "PATCH") {
            const existing = await ownedProduct(env, user.id, productId);
            if (!existing) return json({ error: "Produkt sa nenašiel." }, 404, origin);
            const body = await readJson(request);
            const name = body.name === undefined ? existing.name : validText(body.name, 120);
            const description = body.description === undefined ? existing.description : validText(body.description, 2000);
            if (!name || !name.length || description === null) return json({ error: "Skontroluj názov a popis produktu." }, 400, origin);
            await env.DB.prepare("UPDATE products SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?")
              .bind(name, description, now, productId, user.id).run();
            const updated = await ownedProduct(env, user.id, productId);
            return json({ product: publicProduct(updated) }, 200, origin);
          }
          if (productId && request.method === "DELETE") {
            const existing = await ownedProduct(env, user.id, productId);
            if (!existing) return json({ error: "Produkt sa nenašiel." }, 404, origin);
            await env.DB.prepare("UPDATE products SET archived_at = ?, updated_at = ? WHERE id = ? AND user_id = ?")
              .bind(now, now, productId, user.id).run();
            return json({ ok: true, archivedAt: now }, 200, origin);
          }
        }

        if (projectMatch) {
          const projectId = projectMatch[1];
          if (request.method === "GET" && !projectId) {
            const result = await env.DB.prepare(
              "SELECT id, product_id, name, status, prompt, settings_json, export_preset, created_at, updated_at, archived_at FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT 100"
            ).bind(user.id).all();
            return json({ projects: (result.results || []).map(publicProject) }, 200, origin);
          }
          if (request.method === "POST" && !projectId) {
            const body = await readJson(request);
            const name = validText(body.name, 120);
            const prompt = validText(body.prompt, 8000, "");
            const exportPreset = body.exportPreset == null ? null : validText(body.exportPreset, 80);
            const settingsJson = validSettings(body.settings);
            const productId = body.productId == null ? null : validText(body.productId, 80);
            if (!name || !name.length || prompt === null || exportPreset === null && body.exportPreset != null || settingsJson === null || productId === null) {
              return json({ error: "Skontroluj údaje reklamného projektu." }, 400, origin);
            }
            if (productId && !(await ownedProduct(env, user.id, productId))) return json({ error: "Vybraný produkt sa nenašiel." }, 404, origin);
            const id = crypto.randomUUID();
            await env.DB.prepare(
              "INSERT INTO projects (id, user_id, product_id, name, prompt, settings_json, export_preset, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
            ).bind(id, user.id, productId, name, prompt, settingsJson, exportPreset, now, now).run();
            return json({ project: publicProject({ id, product_id: productId, name, status: "draft", prompt, settings_json: settingsJson, export_preset: exportPreset, created_at: now, updated_at: now, archived_at: null }) }, 201, origin);
          }
          if (projectId && request.method === "GET") {
            const row = await ownedProject(env, user.id, projectId);
            return row ? json({ project: publicProject(row) }, 200, origin) : json({ error: "Projekt sa nenašiel." }, 404, origin);
          }
          if (projectId && request.method === "PATCH") {
            const existing = await ownedProject(env, user.id, projectId);
            if (!existing) return json({ error: "Projekt sa nenašiel." }, 404, origin);
            const body = await readJson(request);
            const name = body.name === undefined ? existing.name : validText(body.name, 120);
            const prompt = body.prompt === undefined ? existing.prompt : validText(body.prompt, 8000);
            const exportPreset = body.exportPreset === undefined ? existing.export_preset : (body.exportPreset == null ? null : validText(body.exportPreset, 80));
            const settingsJson = body.settings === undefined ? existing.settings_json : validSettings(body.settings);
            const productId = body.productId === undefined ? existing.product_id : (body.productId == null ? null : validText(body.productId, 80));
            if (!name || !name.length || prompt === null || exportPreset === null && body.exportPreset != null || settingsJson === null || productId === null) {
              return json({ error: "Skontroluj údaje reklamného projektu." }, 400, origin);
            }
            if (productId && !(await ownedProduct(env, user.id, productId))) return json({ error: "Vybraný produkt sa nenašiel." }, 404, origin);
            await env.DB.prepare(
              "UPDATE projects SET product_id = ?, name = ?, prompt = ?, settings_json = ?, export_preset = ?, updated_at = ? WHERE id = ? AND user_id = ?"
            ).bind(productId, name, prompt, settingsJson, exportPreset, now, projectId, user.id).run();
            const updated = await ownedProject(env, user.id, projectId);
            return json({ project: publicProject(updated) }, 200, origin);
          }
          if (projectId && request.method === "DELETE") {
            const existing = await ownedProject(env, user.id, projectId);
            if (!existing) return json({ error: "Projekt sa nenašiel." }, 404, origin);
            await env.DB.prepare("UPDATE projects SET status = 'archived', archived_at = ?, updated_at = ? WHERE id = ? AND user_id = ?")
              .bind(now, now, projectId, user.id).run();
            return json({ ok: true, archivedAt: now }, 200, origin);
          }
        }
        return json({ error: "Nepodporovaná operácia knižnice." }, 405, origin);
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
