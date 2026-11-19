import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const wrangler = readFileSync("wrangler.preview.toml", "utf8");

function mustContain(source, pattern, message) {
  assert.ok(pattern.test(source), message);
}
function mustNotContain(source, pattern, message) {
  assert.ok(!pattern.test(source), message);
}

// Generation submission, polling, and download are tenant-scoped and fail closed.
mustContain(worker, /url\\.pathname === "\\/api\\/generate"[\\s\\S]*?const user = await currentUser\\(request, env\\)[\\s\\S]*?if \\(!user\\)/, "Generation submission must require an authenticated commercial account.");
mustContain(worker, /FROM generations WHERE id = \\? AND user_id = \\? LIMIT 1/, "Generation status and download must look up tasks by both generation ID and owner.");
mustContain(worker, /client_request_id[\\s\\S]*?request_fingerprint/, "Generation requests must persist an idempotency key and a payload fingerprint.");
mustContain(worker, /PREVIEW_DAILY_GENERATION_LIMIT = 3[\\s\\S]*?generation_daily_limit/, "The preview generation allowance must be protected by a database-level daily limit.");
mustContain(worker, /if \\(!env\\.RUNWAY_API_KEY\\)/, "Generation must fail closed unless the isolated preview provider secret is configured.");
// All cloud-library routes must resolve identity from a valid server-side session
// before reading or mutating any tenant-owned records.
mustContain(worker, /if \(url\.pathname\.startsWith\("\/api\/products"\)[\s\S]*?const user = await currentUser\(request, env\);[\s\S]*?if \(!user\) return json\([\s\S]*?401/, "Library routes must require an authenticated session before accessing tenant data.");
mustContain(worker, /FROM sessions s JOIN users u ON u\.id = s\.user_id[\s\S]*?s\.token_hash = \? AND s\.revoked_at IS NULL AND s\.expires_at > \? AND u\.status = 'active'/, "Session identity must be resolved from a valid, active server-side session.");

mustContain(worker, /password\.length < 12 \|\| password\.length > 128/, "Account registration must enforce the documented password length bounds.");
mustContain(worker, /if \(!env\.PREVIEW_SIGNUP_CODE\)[\s\S]*?body\.inviteCode !== env\.PREVIEW_SIGNUP_CODE/, "Preview account registration must remain invite-gated.");
mustContain(worker, /UPDATE sessions SET revoked_at = \? WHERE token_hash = \? AND revoked_at IS NULL/, "Logout must revoke the server-side session.");
mustContain(worker, /blocked_until[\s\S]*?>= 5[\s\S]*?now \+ 900/, "Repeated failed logins must trigger a temporary server-side block.");
mustContain(worker, /matchesImageSignature\(bytes, contentType\)/, "Image upload must verify file signatures rather than trusting MIME headers.");
mustContain(worker, /await env\.MEDIA\.delete\(r2Key\)/, "Failed D1 image metadata writes must clean up the corresponding R2 object.");

// Collection reads are tenant-scoped; a valid account must never receive another
// account's product or project list.
mustContain(worker, /FROM products WHERE user_id = \? ORDER BY updated_at DESC[\s\S]*?bind\(user\.id\)/, "Product collection query must filter by authenticated user.");
mustContain(worker, /FROM projects WHERE user_id = \? ORDER BY updated_at DESC[\s\S]*?bind\(user\.id\)/, "Project collection query must filter by authenticated user.");

// Individual resource lookups and all mutations must pair resource ID with owner ID.
mustContain(worker, /FROM products WHERE id = \? AND user_id = \? LIMIT 1/, "Product lookup must enforce ownership.");
mustContain(worker, /FROM projects WHERE id = \? AND user_id = \? LIMIT 1/, "Project lookup must enforce ownership.");
mustContain(worker, /UPDATE products SET name = \?, description = \?, updated_at = \? WHERE id = \? AND user_id = \?/, "Product updates must enforce ownership in SQL.");
mustContain(worker, /UPDATE products SET archived_at = \?, updated_at = \? WHERE id = \? AND user_id = \?/, "Product archive must enforce ownership in SQL.");

mustContain(worker, /if \(productId && request\.method === "POST" && url\.pathname === `\/api\/products\/\$\{productId\}\/restore`\)[\s\S]*?const existing = await ownedProduct\(env, user\.id, productId\);[\s\S]*?UPDATE products SET archived_at = NULL, updated_at = \? WHERE id = \? AND user_id = \?/, "Product restore must verify ownership and scope the update to the authenticated account.");
mustContain(worker, /if \(productId && request\.method === "POST" && url\.pathname === `\/api\/products\/\$\{productId\}\/images`\)[\s\S]*?if \(!product \|\| product\.archived_at\)/, "Archived products must not accept new media uploads.");
mustContain(worker, /WHERE pi\.product_id = \? AND pi\.user_id = \? AND a\.deleted_at IS NULL/, "Product media manifests must exclude deleted assets and enforce tenant ownership.");
mustContain(worker, /WHERE id = \? AND user_id = \? AND deleted_at IS NULL LIMIT 1/, "Private asset downloads must enforce tenant ownership.");

mustContain(worker, /UPDATE projects SET product_id = \?, name = \?, prompt = \?, settings_json = \?, export_preset = \?, updated_at = \? WHERE id = \? AND user_id = \?/, "Project updates must enforce ownership in SQL.");
mustContain(worker, /UPDATE projects SET status = 'archived', archived_at = \?, updated_at = \? WHERE id = \? AND user_id = \?/, "Project archive must enforce ownership in SQL.");

// Images are private tenant resources: both metadata and object retrieval are
// checked against the authenticated owner; object keys are namespaced per user.
mustContain(worker, /WHERE pi\.product_id = \? AND pi\.user_id = \? AND a\.deleted_at IS NULL[\s\S]*?bind\(productId, user\.id\)/, "Product image listing must enforce ownership.");
mustContain(worker, /WHERE id = \? AND user_id = \? AND deleted_at IS NULL LIMIT 1/, "Private asset lookup must enforce ownership and active state.");
mustContain(worker, /const r2Key = `users\/\$\{user\.id\}\/products\/\$\{productId\}\/\$\{assetId\}`/, "Uploaded objects must use account-scoped R2 keys.");
mustContain(worker, /INSERT INTO assets \(id, user_id, product_id, kind, r2_key, content_type, byte_size, checksum_sha256, created_at\)[\s\S]*?bind\(assetId, user\.id, productId, r2Key/, "Asset metadata must store the authenticated owner.");
mustContain(worker, /INSERT INTO product_images \(product_id, asset_id, user_id, sort_order, is_primary, created_at\)[\s\S]*?bind\(productId, assetId, user\.id/, "Product-image relation must store the authenticated owner.");

// Preview infrastructure must remain isolated from production storage.
mustContain(wrangler, /database_name = "product-studio-ai-db-preview"/, "Preview must use its dedicated D1 database.");
mustContain(wrangler, /bucket_name = "product-studio-ai-media-preview"/, "Preview must use its dedicated R2 bucket.");
mustNotContain(wrangler, /database_name = "product-studio-ai-db"/, "Preview must not bind the production D1 database.");
mustNotContain(wrangler, /bucket_name = "product-studio-ai-media"/, "Preview must not bind the production R2 bucket.");

console.log("Commercial tenant-isolation and private-media security checks passed.");
