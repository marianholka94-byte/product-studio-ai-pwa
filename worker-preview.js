// PRODUCT STUDIO AI commercial preview Worker.
// Isolated preview only: D1-backed customer accounts and session management.
// Does not replace the production Worker. Generation is account-bound and remains disabled until a dedicated preview provider key is configured.
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
// Cloudflare Workers currently caps PBKDF2 at 100,000 iterations.
// This is preview-only authentication; production should use a managed identity provider.
const PASSWORD_ITERATIONS = 100000;
const SESSION_SECONDS = 30 * 24 * 60 * 60;
const encoder = new TextEncoder();

function corsHeaders(origin) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : "null";
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
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
async function sha256Bytes(value) {
  return b64url(new Uint8Array(await crypto.subtle.digest("SHA-256", value)));
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
async function readBytes(request, maxBytes) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > maxBytes) throw new Error("Súbor je príliš veľký.");
  if (!request.body) throw new Error("Súbor je prázdny.");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel();
        throw new Error("Súbor je príliš veľký.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  if (!total) throw new Error("Súbor je prázdny.");
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return bytes;
}
async function readJson(request, maxBytes = 12000) {
  const length = Number(request.headers.get("Content-Length") || 0);
  if (length > maxBytes) throw new Error("Požiadavka je príliš veľká.");
  if (!request.body) throw new Error("Požiadavka neobsahuje platné JSON dáta.");
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
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
  try {
    const parsed = JSON.parse(new TextDecoder().decode(bytes));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("Požiadavka musí obsahovať JSON objekt.");
    }
    return parsed;
  } catch {
    throw new Error("Požiadavka neobsahuje platné JSON dáta.");
  }
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

const MINI_RATIOS = new Set(["864:496","640:640","496:864","1280:720","960:960","720:1280"]);
const FULL_RATIOS = new Set([...MINI_RATIOS,"1920:1080","1440:1440","1080:1920","3840:2160","3840:3840","2160:3840"]);
const PREVIEW_DAILY_GENERATION_LIMIT = 3;
function runwayHeaders(env) {
  return { Authorization: "Bearer " + env.RUNWAY_API_KEY, "X-Runway-Version": "2024-11-06", "Content-Type": "application/json" };
}
function generationStatus(providerStatus) {
  const value = String(providerStatus || "").toUpperCase();
  if (value === "SUCCEEDED") return "succeeded";
  if (value === "FAILED") return "failed";
  if (value === "CANCELED" || value === "CANCELLED") return "cancelled";
  if (["PENDING","THROTTLED","QUEUED"].includes(value)) return "queued";
  return "processing";
}
function estimatedGenerationCredits(model, resolution, duration) {
  const rates = model === "seedance2" ? { "480p": 14, "720p": 30, "1080p": 40, "4K": 150 } : { "480p": 7, "720p": 15 };
  const rate = rates[resolution];
  return rate ? Math.max(rate * 4, duration * rate) : null;
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
function matchesImageSignature(bytes, contentType) {
  if (contentType === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (contentType === "image/png") return bytes.length >= 8 && [0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a].every((value,index)=>bytes[index]===value);
  if (contentType === "image/webp") return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
  return false;
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
        const userColumns = await env.DB.prepare("PRAGMA table_info(users)").all();
        const sessionColumns = await env.DB.prepare("PRAGMA table_info(sessions)").all();
        const rateLimitTable = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'auth_rate_limits'"
        ).first();
        const userColumnNames = (userColumns.results || []).map(column => column.name);
        const sessionColumnNames = (sessionColumns.results || []).map(column => column.name);
        const generationColumns = await env.DB.prepare("PRAGMA table_info(generations)").all();
        const generationColumnNames = (generationColumns.results || []).map(column => column.name);
        const creditTables = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type = 'table' AND name IN ('credit_accounts','credit_ledger','generation_credit_reservations')"
        ).all();
        const creditTriggers = await env.DB.prepare(
          "SELECT name FROM sqlite_master WHERE type = 'trigger' AND name IN ('trg_credit_ledger_no_update','trg_credit_ledger_no_delete')"
        ).all();
        const creditTableNames = (creditTables.results || []).map(row => row.name);
        const creditTriggerNames = (creditTriggers.results || []).map(row => row.name);
        const creditSchema = {
          accounts: creditTableNames.includes("credit_accounts"),
          ledger: creditTableNames.includes("credit_ledger"),
          reservations: creditTableNames.includes("generation_credit_reservations"),
          appendOnly: creditTriggerNames.includes("trg_credit_ledger_no_update") && creditTriggerNames.includes("trg_credit_ledger_no_delete"),
          enabled: false
        };
        const authSchema = {
          usersTable: userColumnNames.length > 0,
          passwordHash: userColumnNames.includes("password_hash"),
          sessionsTable: sessionColumnNames.length > 0,
          sessionTokenHash: sessionColumnNames.includes("token_hash"),
          rateLimitsTable: !!rateLimitTable,
          generationRequestId: generationColumnNames.includes("client_request_id"),
          generationFingerprint: generationColumnNames.includes("request_fingerprint")
        };
        return json({
          ok: db?.ok === 1 && Array.isArray(objects?.objects),
          service: "PRODUCT STUDIO AI commercial preview",
          storage: { d1: db?.ok === 1, r2: Array.isArray(objects?.objects) },
          authSchema,
          creditSchema,
          generation: { configured: Boolean(env.RUNWAY_API_KEY), dailyLimit: PREVIEW_DAILY_GENERATION_LIMIT }
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
        let registrationStage = "password_hash";
        try {
          const id = crypto.randomUUID();
          const now = Math.floor(Date.now() / 1000);
          const hashed = await passwordHash(password);
          registrationStage = "insert_user";
          await env.DB.prepare(
            "INSERT INTO users (id, email, display_name, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)"
          ).bind(id, email, displayName, hashed, now, now).run();
          registrationStage = "create_session";
          const session = await createSession(env, id);
          return json({ user: { id, email, displayName, createdAt: now }, ...session }, 201, origin);
        } catch (error) {
          console.error("Preview registration failed", {
            stage: registrationStage,
            name: String(error?.name || "Error"),
            message: String(error?.message || "Unknown error"),
            stack: String(error?.stack || "").slice(0, 2000)
          });
          if (/unique|constraint/i.test(String(error))) {
            return json({ error: "Účet s touto e-mailovou adresou už existuje." }, 409, origin);
          }
          return json({ error: "Registrácia zlyhala. Diagnostický krok: " + registrationStage + "." }, 500, origin);
        }
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


      // Account-scoped credit wallet and owner-only manual top-ups.
      if (url.pathname === "/api/credits" && request.method === "GET") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const now = Math.floor(Date.now() / 1000);
        await env.DB.prepare(
          "INSERT INTO credit_accounts (user_id, available_units, reserved_units, version, created_at, updated_at) VALUES (?, 0, 0, 0, ?, ?) ON CONFLICT(user_id) DO NOTHING"
        ).bind(user.id, now, now).run();
        const account = await env.DB.prepare(
          "SELECT available_units, reserved_units, version FROM credit_accounts WHERE user_id = ? LIMIT 1"
        ).bind(user.id).first();
        const ledger = await env.DB.prepare(
          "SELECT id, entry_type, units, reference_type, note, created_at FROM credit_ledger WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 20"
        ).bind(user.id).all();
        return json({
          available: Number(account?.available_units || 0),
          reserved: Number(account?.reserved_units || 0),
          version: Number(account?.version || 0),
          isAdmin: Boolean(env.PREVIEW_ADMIN_EMAIL && user.email.toLowerCase() === String(env.PREVIEW_ADMIN_EMAIL).trim().toLowerCase()),
          history: (ledger.results || []).map(row => ({
            id: row.id, type: row.entry_type, units: Number(row.units),
            reference: row.reference_type, note: row.note || "", createdAt: row.created_at
          }))
        }, 200, origin);
      }

      if (url.pathname === "/api/credits/admin-grant" && request.method === "POST") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const adminEmail = String(env.PREVIEW_ADMIN_EMAIL || "").trim().toLowerCase();
        if (!adminEmail || user.email.toLowerCase() !== adminEmail) {
          return json({ error: "Manuálne dobíjanie je povolené iba správcovi aplikácie." }, 403, origin);
        }
        const body = await readJson(request, 2000);
        const units = Number(body.units);
        const note = validText(body.note, 160, "Manuálne dobitie správcom");
        const idempotencyKey = String(body.idempotencyKey || "");
        if (!Number.isSafeInteger(units) || units < 1 || units > 100000 || note === null ||
            !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotencyKey)) {
          return json({ error: "Skontroluj počet kreditov a poznámku k dobitiu." }, 400, origin);
        }
        const existing = await env.DB.prepare(
          "SELECT id, units, payload_fingerprint FROM credit_ledger WHERE user_id = ? AND idempotency_key = ? LIMIT 1"
        ).bind(user.id, idempotencyKey).first();
        const fingerprint = await sha256(JSON.stringify({ userId: user.id, units, note }));
        if (existing) {
          if (Number(existing.units) !== units || existing.payload_fingerprint !== fingerprint) {
            return json({ error: "Identifikátor dobitia už bol použitý pre inú operáciu." }, 409, origin);
          }
          const account = await env.DB.prepare("SELECT available_units, reserved_units FROM credit_accounts WHERE user_id = ?").bind(user.id).first();
          return json({ ok: true, replayed: true, available: Number(account?.available_units || 0), reserved: Number(account?.reserved_units || 0) }, 200, origin);
        }
        const now = Math.floor(Date.now() / 1000);
        const entryId = crypto.randomUUID();
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO credit_accounts (user_id, available_units, reserved_units, version, created_at, updated_at) VALUES (?, ?, 0, 1, ?, ?) ON CONFLICT(user_id) DO UPDATE SET available_units = credit_accounts.available_units + excluded.available_units, version = credit_accounts.version + 1, updated_at = excluded.updated_at"
          ).bind(user.id, units, now, now),
          env.DB.prepare(
            "INSERT INTO credit_ledger (id, user_id, entry_type, units, reference_type, reference_id, idempotency_key, payload_fingerprint, note, created_at) VALUES (?, ?, 'grant', ?, 'admin', ?, ?, ?, ?, ?)"
          ).bind(entryId, user.id, units, entryId, idempotencyKey, fingerprint, note, now)
        ]);
        const account = await env.DB.prepare("SELECT available_units, reserved_units FROM credit_accounts WHERE user_id = ?").bind(user.id).first();
        return json({ ok: true, replayed: false, available: Number(account?.available_units || 0), reserved: Number(account?.reserved_units || 0), granted: units }, 201, origin);
      }

      // Commercial generation always resolves the owner from the D1 session.
      if (url.pathname === "/api/generate" && request.method === "POST") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Na generovanie sa najskôr prihlás do svojho zákazníckeho účtu." }, 401, origin);
        if (!env.RUNWAY_API_KEY) return json({ error: "Generátor zatiaľ nie je nakonfigurovaný pre komerčnú preview verziu." }, 503, origin);
        const contentLength = Number(request.headers.get("Content-Length") || 0);
        if (contentLength > 22 * 1024 * 1024) return json({ error: "Súhrnná veľkosť fotografií je príliš veľká. Použi menšie obrázky." }, 413, origin);
        const body = await readJson(request, 22 * 1024 * 1024);
        const requestId = String(body.requestId || "");
        if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
          return json({ error: "Požiadavka nemá platný identifikátor. Obnov stránku a skús to znova." }, 400, origin);
        }
        const images = Array.isArray(body.images) ? body.images : (typeof body.image === "string" ? [body.image] : []);
        if (images.length < 1 || images.length > 5) return json({ error: "Nahraj 1 až 5 fotografií produktu." }, 400, origin);
        for (const image of images) {
          if (typeof image !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
            return json({ error: "Jedna z fotografií nemá podporovaný formát. Použi JPG, PNG alebo WebP." }, 400, origin);
          }
          if (image.length > 5 * 1024 * 1024) return json({ error: "Každá fotografia musí mať menej než 5 MB." }, 413, origin);
        }
        if (images.reduce((total, image) => total + image.length, 0) > 20 * 1024 * 1024) return json({ error: "Súhrnná veľkosť fotografií prekračuje 20 MB." }, 413, origin);
        if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 1000) return json({ error: "Text zadania musí mať 1 až 1 000 znakov." }, 400, origin);
        const duration = Number(body.duration);
        const model = String(body.model || "seedance2_mini");
        const resolution = String(body.resolution || (model === "seedance2" ? "1080p" : "720p"));
        const ratio = String(body.ratio || "");
        const allowedRatios = model === "seedance2" ? FULL_RATIOS : model === "seedance2_mini" ? MINI_RATIOS : null;
        const estimatedCredits = estimatedGenerationCredits(model, resolution, duration);
        if (!Number.isInteger(duration) || duration < 4 || duration > 15 || !allowedRatios || !allowedRatios.has(ratio) || estimatedCredits === null) {
          return json({ error: "Nepodporovaná kombinácia modelu, rozlíšenia, pomeru strán alebo dĺžky." }, 400, origin);
        }
        const fingerprint = await sha256(JSON.stringify({ images, prompt: body.prompt.trim(), model, resolution, ratio, duration }));
        const prior = await env.DB.prepare(
          "SELECT id, request_fingerprint, provider_task_id, status, estimated_credits FROM generations WHERE user_id = ? AND client_request_id = ? LIMIT 1"
        ).bind(user.id, requestId).first();
        if (prior) {
          if (prior.request_fingerprint !== fingerprint) return json({ error: "Identifikátor požiadavky už bol použitý pre iné zadanie." }, 409, origin);
          if (!prior.provider_task_id) return json({ error: "Požiadavka sa už začala spracúvať. Z bezpečnostných dôvodov ju neposielam znova, aby nevzniklo duplicitné platené generovanie.", generationId: prior.id, status: prior.status }, 409, origin);
          return json({ id: prior.id, status: prior.status, replayed: true, estimatedCredits: prior.estimated_credits }, 200, origin);
        }
        const now = Math.floor(Date.now() / 1000);
        const dayStart = Math.floor(now / 86400) * 86400;
        const usage = await env.DB.prepare("SELECT COUNT(*) AS count FROM generations WHERE user_id = ? AND created_at >= ?")
          .bind(user.id, dayStart).first();
        if (Number(usage?.count || 0) >= PREVIEW_DAILY_GENERATION_LIMIT) {
          return json({ error: "Dosiahol si denný limit " + PREVIEW_DAILY_GENERATION_LIMIT + " skúšobných generovaní. Skús to znova zajtra.", dailyLimit: PREVIEW_DAILY_GENERATION_LIMIT, usedToday: Number(usage?.count || 0) }, 429, origin);
        }
        const generationId = crypto.randomUUID();
        try {
          await env.DB.prepare(
            "INSERT INTO generations (id, user_id, provider, model, resolution, aspect_ratio, duration_seconds, status, prompt_snapshot, estimated_credits, client_request_id, request_fingerprint, created_at, updated_at) VALUES (?, ?, 'runway', ?, ?, ?, ?, 'queued', ?, ?, ?, ?, ?, ?)"
          ).bind(generationId, user.id, model, resolution, ratio, duration, body.prompt.trim(), estimatedCredits, requestId, fingerprint, now, now).run();
        } catch (error) {
          if (/generation_daily_limit/i.test(String(error))) return json({ error: "Dosiahol si denný limit " + PREVIEW_DAILY_GENERATION_LIMIT + " skúšobných generovaní.", dailyLimit: PREVIEW_DAILY_GENERATION_LIMIT }, 429, origin);
          if (/unique|constraint/i.test(String(error))) {
            const raced = await env.DB.prepare("SELECT id, request_fingerprint, provider_task_id, status, estimated_credits FROM generations WHERE user_id = ? AND client_request_id = ? LIMIT 1")
              .bind(user.id, requestId).first();
            if (raced && raced.request_fingerprint === fingerprint && raced.provider_task_id) return json({ id: raced.id, status: raced.status, replayed: true, estimatedCredits: raced.estimated_credits }, 200, origin);
            if (raced) return json({ error: "Požiadavka sa už spracúva. Neposielaj ju znova, aby nevzniklo duplicitné generovanie.", generationId: raced.id }, 409, origin);
          }
          throw error;
        }
        const upstream = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
          method: "POST",
          headers: runwayHeaders(env),
          body: JSON.stringify({
            model,
            promptImage: images.length === 1 ? images[0] : images.map(uri => ({ uri })),
            promptText: body.prompt.trim(),
            ratio,
            duration,
            audio: false,
            bitrate: "high"
          })
        });
        const result = await upstream.json().catch(() => ({}));
        if (!upstream.ok || !result.id) {
          const message = result.error?.message || result.error || result.message || "Runway požiadavku neprijal.";
          const failedAt = Math.floor(Date.now() / 1000);
          await env.DB.prepare("UPDATE generations SET status = 'failed', error_code = ?, error_message = ?, updated_at = ?, completed_at = ? WHERE id = ? AND user_id = ?")
            .bind("provider_rejected", String(message).slice(0, 500), failedAt, failedAt, generationId, user.id).run();
          return json({ error: String(message), providerStatus: upstream.status || 502, generationId }, 502, origin);
        }
        const providerTaskId = String(result.id);
        const status = generationStatus(result.status || "PENDING");
        await env.DB.prepare("UPDATE generations SET provider_task_id = ?, status = ?, updated_at = ? WHERE id = ? AND user_id = ?")
          .bind(providerTaskId, status, Math.floor(Date.now() / 1000), generationId, user.id).run();
        return json({ id: generationId, status: result.status || "PENDING", estimatedCredits, dailyLimit: PREVIEW_DAILY_GENERATION_LIMIT, usedToday: Number(usage?.count || 0) + 1 }, 201, origin);
      }

      if (url.pathname === "/api/generation/usage" && request.method === "GET") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const dayStart = Math.floor(Date.now() / 86400000) * 86400;
        const row = await env.DB.prepare("SELECT COUNT(*) AS count FROM generations WHERE user_id = ? AND created_at >= ?")
          .bind(user.id, dayStart).first();
        const used = Number(row?.count || 0);
        return json({ dailyLimit: PREVIEW_DAILY_GENERATION_LIMIT, usedToday: used, remainingToday: Math.max(0, PREVIEW_DAILY_GENERATION_LIMIT - used), resetsAt: dayStart + 86400 }, 200, origin);
      }

      if (url.pathname === "/api/generations" && request.method === "GET") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const requestedLimit = Number(url.searchParams.get("limit") || 20);
        const limit = Number.isSafeInteger(requestedLimit) ? Math.min(50, Math.max(1, requestedLimit)) : 20;
        const result = await env.DB.prepare(
          "SELECT id, project_id, provider, model, resolution, aspect_ratio, duration_seconds, status, estimated_credits, error_code, error_message, created_at, updated_at, completed_at FROM generations WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?"
        ).bind(user.id, limit).all();
        const generations = (result.results || []).map(row => ({
          id: row.id,
          projectId: row.project_id,
          provider: row.provider,
          model: row.model,
          resolution: row.resolution,
          aspectRatio: row.aspect_ratio,
          durationSeconds: row.duration_seconds,
          status: row.status,
          estimatedCredits: row.estimated_credits,
          errorCode: row.error_code,
          errorMessage: row.error_message ? String(row.error_message).slice(0, 300) : null,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
          completedAt: row.completed_at
        }));
        return json({ generations, limit }, 200, origin);
      }

      const generationStatusMatch = /^\/api\/status\/([0-9a-f-]{36})$/i.exec(url.pathname);
      if (generationStatusMatch && request.method === "GET") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        if (!env.RUNWAY_API_KEY) return json({ error: "Generátor zatiaľ nie je nakonfigurovaný." }, 503, origin);
        const generation = await env.DB.prepare("SELECT id, provider_task_id, status FROM generations WHERE id = ? AND user_id = ? LIMIT 1")
          .bind(generationStatusMatch[1], user.id).first();
        if (!generation) return json({ error: "Generovanie sa nenašlo." }, 404, origin);
        if (!generation.provider_task_id) return json({ error: "Generovanie zatiaľ nemá potvrdené ID poskytovateľa.", status: generation.status }, 409, origin);
        const upstream = await fetch("https://api.dev.runwayml.com/v1/tasks/" + encodeURIComponent(generation.provider_task_id), { headers: runwayHeaders(env) });
        const task = await upstream.json().catch(() => ({}));
        if (!upstream.ok) return json({ error: task.error?.message || task.error || "Stav generovania sa nepodarilo načítať.", providerStatus: upstream.status }, 502, origin);
        const mapped = generationStatus(task.status);
        const now = Math.floor(Date.now() / 1000);
        await env.DB.prepare("UPDATE generations SET status = ?, error_message = ?, completed_at = CASE WHEN ? = 1 THEN COALESCE(completed_at, ?) ELSE completed_at END, updated_at = ? WHERE id = ? AND user_id = ? AND status NOT IN ('succeeded','failed','cancelled')")
          .bind(mapped, mapped === "failed" ? String(task.failure || task.error || "Generovanie zlyhalo.").slice(0,500) : null, ["succeeded","failed","cancelled"].includes(mapped) ? 1 : 0, now, now, generation.id, user.id).run();
        return json({ ...task, id: generation.id }, 200, origin);
      }

      const generationDownloadMatch = /^\/api\/download\/([0-9a-f-]{36})$/i.exec(url.pathname);
      if (generationDownloadMatch && request.method === "GET") {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        if (!env.RUNWAY_API_KEY) return json({ error: "Generátor zatiaľ nie je nakonfigurovaný." }, 503, origin);
        const generation = await env.DB.prepare("SELECT id, provider_task_id FROM generations WHERE id = ? AND user_id = ? LIMIT 1")
          .bind(generationDownloadMatch[1], user.id).first();
        if (!generation) return json({ error: "Video sa nenašlo." }, 404, origin);
        if (!generation.provider_task_id) return json({ error: "Video ešte nie je pripravené." }, 409, origin);
        const taskResponse = await fetch("https://api.dev.runwayml.com/v1/tasks/" + encodeURIComponent(generation.provider_task_id), { headers: runwayHeaders(env) });
        const task = await taskResponse.json().catch(() => ({}));
        if (!taskResponse.ok) return json({ error: task.error?.message || task.error || "Video sa nepodarilo načítať." }, 502, origin);
        const videoUrl = Array.isArray(task.output) && typeof task.output[0] === "string" ? task.output[0] : "";
        if (task.status !== "SUCCEEDED" || !videoUrl) return json({ error: "Video ešte nie je pripravené na stiahnutie." }, 409, origin);
        let parsedVideoUrl;
        try { parsedVideoUrl = new URL(videoUrl); } catch { return json({ error: "Poskytovateľ vrátil neplatnú adresu videa." }, 502, origin); }
        if (parsedVideoUrl.protocol !== "https:" || parsedVideoUrl.username || parsedVideoUrl.password) return json({ error: "Poskytovateľ vrátil neplatnú adresu videa." }, 502, origin);
        const videoResponse = await fetch(parsedVideoUrl.href);
        if (!videoResponse.ok || !videoResponse.body) return json({ error: "Hotové video sa nepodarilo stiahnuť." }, 502, origin);
        const completedAt = Math.floor(Date.now() / 1000);
        await env.DB.prepare("UPDATE generations SET status = 'succeeded', completed_at = COALESCE(completed_at, ?), updated_at = ? WHERE id = ? AND user_id = ?")
          .bind(completedAt, completedAt, generation.id, user.id).run();
        return new Response(videoResponse.body, {
          status: 200,
          headers: { ...corsHeaders(origin), "Content-Type": videoResponse.headers.get("Content-Type") || "video/mp4", "Content-Disposition": 'attachment; filename="product-studio-ai.mp4"', "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
        });
      }

      // Every library endpoint is scoped to the authenticated account. Client-supplied user IDs are ignored.
      if (url.pathname.startsWith("/api/products") || url.pathname.startsWith("/api/projects") || url.pathname.startsWith("/api/assets/")) {
        const user = await currentUser(request, env);
        if (!user) return json({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401, origin);
        const now = Math.floor(Date.now() / 1000);
        const productMatch = /^\/api\/products(?:\/([a-zA-Z0-9_-]{1,80})(?:\/(?:images|restore))?)?$/.exec(url.pathname);
        const projectMatch = /^\/api\/projects(?:\/([a-zA-Z0-9_-]{1,80}))?$/.exec(url.pathname);

        if (productMatch) {
          const productId = productMatch[1];
          if (productId && request.method === "GET" && url.pathname === `/api/products/${productId}/images`) {
            const product = await ownedProduct(env, user.id, productId);
            if (!product) return json({ error: "Produkt sa nenašiel." }, 404, origin);
            const result = await env.DB.prepare(
              `SELECT a.id, a.content_type, a.byte_size, a.width, a.height, a.checksum_sha256, pi.sort_order, pi.is_primary, a.created_at
               FROM product_images pi JOIN assets a ON a.id = pi.asset_id
               WHERE pi.product_id = ? AND pi.user_id = ? AND a.deleted_at IS NULL
               ORDER BY pi.sort_order ASC LIMIT 5`
            ).bind(productId, user.id).all();
            return json({ images: (result.results || []).map(row => ({ id: row.id, contentType: row.content_type, byteSize: row.byte_size, width: row.width, height: row.height, checksumSha256: row.checksum_sha256, sortOrder: row.sort_order, isPrimary: !!row.is_primary, createdAt: row.created_at, url: `/api/assets/${row.id}` })) }, 200, origin);
          }
          if (productId && request.method === "POST" && url.pathname === `/api/products/${productId}/images`) {
            const product = await ownedProduct(env, user.id, productId);
            if (!product || product.archived_at) return json({ error: "Aktívny produkt sa nenašiel." }, 404, origin);
            const contentType = (request.headers.get("Content-Type") || "").split(";")[0].trim().toLowerCase();
            const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
            if (!allowedTypes.has(contentType)) return json({ error: "Podporované sú iba JPG, PNG a WebP fotografie." }, 415, origin);
            const current = await env.DB.prepare(
              "SELECT COUNT(*) AS count FROM product_images WHERE product_id = ? AND user_id = ?"
            ).bind(productId, user.id).first();
            if (Number(current?.count || 0) >= 5) return json({ error: "Produkt môže obsahovať najviac 5 fotografií." }, 409, origin);
            const bytes = await readBytes(request, 10 * 1024 * 1024);
            if (!matchesImageSignature(bytes, contentType)) return json({ error: "Obsah súboru nezodpovedá deklarovanému formátu fotografie." }, 415, origin);
            const assetId = crypto.randomUUID();
            const r2Key = `users/${user.id}/products/${productId}/${assetId}`;
            const checksum = await sha256Bytes(bytes);
            await env.MEDIA.put(r2Key, bytes, { httpMetadata: { contentType } });
            const isPrimary = Number(current?.count || 0) === 0 ? 1 : 0;
            try {
              await env.DB.batch([
                env.DB.prepare(
                  "INSERT INTO assets (id, user_id, product_id, kind, r2_key, content_type, byte_size, checksum_sha256, created_at) VALUES (?, ?, ?, 'product_image', ?, ?, ?, ?, ?)"
                ).bind(assetId, user.id, productId, r2Key, contentType, bytes.byteLength, checksum, now),
                env.DB.prepare(
                  "INSERT INTO product_images (product_id, asset_id, user_id, sort_order, is_primary, created_at) VALUES (?, ?, ?, ?, ?, ?)"
                ).bind(productId, assetId, user.id, Number(current?.count || 0), isPrimary, now)
              ]);
            } catch (error) {
              await env.MEDIA.delete(r2Key);
              throw error;
            }
            return json({ image: { id: assetId, contentType, byteSize: bytes.byteLength, sortOrder: Number(current?.count || 0), isPrimary: !!isPrimary, createdAt: now, url: `/api/assets/${assetId}` } }, 201, origin);
          }
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
            const operationId = body.idempotencyKey == null ? null : validText(body.idempotencyKey, 80);
            if (!name || !name.length || description === null || operationId !== null && !/^[a-zA-Z0-9_-]{16,80}$/.test(operationId)) return json({ error: "Skontroluj názov a popis produktu." }, 400, origin);
            if (operationId) {
              const prior = await env.DB.prepare(
                "SELECT id, name, description, created_at, updated_at, archived_at FROM products WHERE user_id = ? AND client_operation_id = ? LIMIT 1"
              ).bind(user.id, operationId).first();
              if (prior) {
                if (prior.name !== name || prior.description !== description) return json({ error: "Kľúč operácie už bol použitý pre iný produkt." }, 409, origin);
                return json({ product: publicProduct(prior), replayed: true }, 200, origin);
              }
            }
            const id = crypto.randomUUID();
            try {
              await env.DB.prepare(
                "INSERT INTO products (id, user_id, name, description, client_operation_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
              ).bind(id, user.id, name, description, operationId, now, now).run();
            } catch (error) {
              if (operationId && /unique|constraint/i.test(String(error))) {
                const prior = await env.DB.prepare(
                  "SELECT id, name, description, created_at, updated_at, archived_at FROM products WHERE user_id = ? AND client_operation_id = ? LIMIT 1"
                ).bind(user.id, operationId).first();
                if (prior) {
                  if (prior.name === name && prior.description === description) return json({ product: publicProduct(prior), replayed: true }, 200, origin);
                  return json({ error: "Kľúč operácie už bol použitý pre iný produkt." }, 409, origin);
                }
              }
              throw error;
            }
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
            const expectedUpdatedAt = body.expectedUpdatedAt;
            if (expectedUpdatedAt !== undefined && (!Number.isSafeInteger(expectedUpdatedAt) || expectedUpdatedAt < 0)) {
              return json({ error: "Neplatná verzia produktu." }, 400, origin);
            }
            if (expectedUpdatedAt !== undefined && Number(existing.updated_at) !== expectedUpdatedAt) {
              return json({ error: "Produkt bol medzičasom zmenený v cloude. Tvoje zmeny zostali zachované; skontroluj aktuálnu verziu a ulož ich znova.", currentProduct: publicProduct(existing) }, 409, origin);
            }
            const name = body.name === undefined ? existing.name : validText(body.name, 120);
            const description = body.description === undefined ? existing.description : validText(body.description, 2000);
            if (!name || !name.length || description === null) return json({ error: "Skontroluj názov a popis produktu." }, 400, origin);
            const updateStatement = expectedUpdatedAt === undefined
              ? env.DB.prepare("UPDATE products SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ?")
                  .bind(name, description, now, productId, user.id)
              : env.DB.prepare("UPDATE products SET name = ?, description = ?, updated_at = ? WHERE id = ? AND user_id = ? AND updated_at = ?")
                  .bind(name, description, now, productId, user.id, expectedUpdatedAt);
            const updateResult = await updateStatement.run();
            if (expectedUpdatedAt !== undefined && Number(updateResult.meta?.changes || 0) !== 1) {
              const current = await ownedProduct(env, user.id, productId);
              return current
                ? json({ error: "Produkt bol medzičasom zmenený v cloude. Tvoje zmeny zostali zachované; skontroluj aktuálnu verziu a ulož ich znova.", currentProduct: publicProduct(current) }, 409, origin)
                : json({ error: "Produkt sa nenašiel." }, 404, origin);
            }
            const updated = await ownedProduct(env, user.id, productId);
            return json({ product: publicProduct(updated) }, 200, origin);
          }
          if (productId && request.method === "POST" && url.pathname === `/api/products/${productId}/restore`) {
            const existing = await ownedProduct(env, user.id, productId);
            if (!existing) return json({ error: "Produkt sa nenašiel." }, 404, origin);
            if (!existing.archived_at) return json({ product: publicProduct(existing), restored: false }, 200, origin);
            await env.DB.prepare("UPDATE products SET archived_at = NULL, updated_at = ? WHERE id = ? AND user_id = ?")
              .bind(now, productId, user.id).run();
            const restored = await ownedProduct(env, user.id, productId);
            return json({ product: publicProduct(restored), restored: true }, 200, origin);
          }
          if (productId && request.method === "DELETE") {
            const existing = await ownedProduct(env, user.id, productId);
            if (!existing) return json({ error: "Produkt sa nenašiel." }, 404, origin);
            await env.DB.prepare("UPDATE products SET archived_at = ?, updated_at = ? WHERE id = ? AND user_id = ?")
              .bind(now, now, productId, user.id).run();
            return json({ ok: true, archivedAt: now }, 200, origin);
          }
        }

        const assetMatch = /^\/api\/assets\/([a-zA-Z0-9_-]{1,80})$/.exec(url.pathname);
        if (assetMatch && request.method === "GET") {
          const asset = await env.DB.prepare(
            "SELECT id, r2_key, content_type FROM assets WHERE id = ? AND user_id = ? AND deleted_at IS NULL LIMIT 1"
          ).bind(assetMatch[1], user.id).first();
          if (!asset) return json({ error: "Súbor sa nenašiel." }, 404, origin);
          const object = await env.MEDIA.get(asset.r2_key);
          if (!object) return json({ error: "Súbor už nie je dostupný." }, 404, origin);
          return new Response(object.body, {
            status: 200,
            headers: { ...corsHeaders(origin), "Content-Type": asset.content_type, "Content-Length": String(object.size), "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" }
          });
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
            const operationId = body.idempotencyKey == null ? null : validText(body.idempotencyKey, 80);
            if (!name || !name.length || prompt === null || exportPreset === null && body.exportPreset != null || settingsJson === null || (body.productId != null && productId === null) || operationId !== null && !/^[a-zA-Z0-9_-]{16,80}$/.test(operationId)) {
              return json({ error: "Skontroluj údaje reklamného projektu." }, 400, origin);
            }
            if (productId && !(await ownedProduct(env, user.id, productId))) return json({ error: "Vybraný produkt sa nenašiel." }, 404, origin);
            if (operationId) {
              const prior = await env.DB.prepare(
                "SELECT id, product_id, name, status, prompt, settings_json, export_preset, created_at, updated_at, archived_at FROM projects WHERE user_id = ? AND client_operation_id = ? LIMIT 1"
              ).bind(user.id, operationId).first();
              if (prior) {
                const samePayload = prior.product_id === productId && prior.name === name && prior.prompt === prompt && prior.settings_json === settingsJson && prior.export_preset === exportPreset;
                if (!samePayload) return json({ error: "Kľúč operácie už bol použitý pre iný projekt." }, 409, origin);
                return json({ project: publicProject(prior), replayed: true }, 200, origin);
              }
            }
            const id = crypto.randomUUID();
            try {
              await env.DB.prepare(
                "INSERT INTO projects (id, user_id, product_id, name, prompt, settings_json, export_preset, client_operation_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
              ).bind(id, user.id, productId, name, prompt, settingsJson, exportPreset, operationId, now, now).run();
            } catch (error) {
              if (operationId && /unique|constraint/i.test(String(error))) {
                const prior = await env.DB.prepare(
                  "SELECT id, product_id, name, status, prompt, settings_json, export_preset, created_at, updated_at, archived_at FROM projects WHERE user_id = ? AND client_operation_id = ? LIMIT 1"
                ).bind(user.id, operationId).first();
                if (prior) {
                  const samePayload = prior.product_id === productId && prior.name === name && prior.prompt === prompt && prior.settings_json === settingsJson && prior.export_preset === exportPreset;
                  if (samePayload) return json({ project: publicProject(prior), replayed: true }, 200, origin);
                  return json({ error: "Kľúč operácie už bol použitý pre iný projekt." }, 409, origin);
                }
              }
              throw error;
            }
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
            const expectedUpdatedAt = body.expectedUpdatedAt;
            if (expectedUpdatedAt !== undefined && (!Number.isSafeInteger(expectedUpdatedAt) || expectedUpdatedAt < 0)) {
              return json({ error: "Neplatná verzia projektu." }, 400, origin);
            }
            if (expectedUpdatedAt !== undefined && Number(existing.updated_at) !== expectedUpdatedAt) {
              return json({ error: "Projekt bol medzičasom zmenený v cloude. Tvoje zmeny zostali zachované; skontroluj aktuálnu verziu a ulož ich znova.", currentProject: publicProject(existing) }, 409, origin);
            }
            const name = body.name === undefined ? existing.name : validText(body.name, 120);
            const prompt = body.prompt === undefined ? existing.prompt : validText(body.prompt, 8000);
            const exportPreset = body.exportPreset === undefined ? existing.export_preset : (body.exportPreset == null ? null : validText(body.exportPreset, 80));
            const settingsJson = body.settings === undefined ? existing.settings_json : validSettings(body.settings);
            const productId = body.productId === undefined ? existing.product_id : (body.productId == null ? null : validText(body.productId, 80));
            if (!name || !name.length || prompt === null || exportPreset === null && body.exportPreset != null || settingsJson === null || (body.productId !== undefined && body.productId !== null && productId === null)) {
              return json({ error: "Skontroluj údaje reklamného projektu." }, 400, origin);
            }
            if (productId && !(await ownedProduct(env, user.id, productId))) return json({ error: "Vybraný produkt sa nenašiel." }, 404, origin);
            const updateStatement = expectedUpdatedAt === undefined
              ? env.DB.prepare("UPDATE projects SET product_id = ?, name = ?, prompt = ?, settings_json = ?, export_preset = ?, updated_at = ? WHERE id = ? AND user_id = ?")
                  .bind(productId, name, prompt, settingsJson, exportPreset, now, projectId, user.id)
              : env.DB.prepare("UPDATE projects SET product_id = ?, name = ?, prompt = ?, settings_json = ?, export_preset = ?, updated_at = ? WHERE id = ? AND user_id = ? AND updated_at = ?")
                  .bind(productId, name, prompt, settingsJson, exportPreset, now, projectId, user.id, expectedUpdatedAt);
            const updateResult = await updateStatement.run();
            if (expectedUpdatedAt !== undefined && Number(updateResult.meta?.changes || 0) !== 1) {
              const current = await ownedProject(env, user.id, projectId);
              return current
                ? json({ error: "Projekt bol medzičasom zmenený v cloude. Tvoje zmeny zostali zachované; skontroluj aktuálnu verziu a ulož ich znova.", currentProject: publicProject(current) }, 409, origin)
                : json({ error: "Projekt sa nenašiel." }, 404, origin);
            }
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
      // Keep detailed diagnostics in Worker logs only; never expose SQL details to clients.
      console.error("Commercial preview request failed", {
        name: String(error?.name || "Error"),
        message: String(error?.message || "Unknown error"),
        stack: String(error?.stack || "").slice(0, 2000)
      });
      const message = String(error?.message || "");
      if (message === "Požiadavka je príliš veľká." || message === "Požiadavka neobsahuje platné JSON dáta." || message === "Požiadavka musí obsahovať JSON objekt." || message === "Súbor je príliš veľký." || message === "Súbor je prázdny.") {
        return json({ error: message }, 400, origin);
      }
      return json({ ok: false, error: "Požiadavku sa nepodarilo spracovať. Skús to znova." }, 500, origin);
    }
  }
};
