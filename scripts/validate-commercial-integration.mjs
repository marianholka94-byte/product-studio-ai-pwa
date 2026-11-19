import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const cloud = readFileSync("cloud-library.js", "utf8");
const html = readFileSync("index.html", "utf8");

for (const route of [
  "/api/auth/register", "/api/auth/login", "/api/auth/me", "/api/auth/logout",
  "/api/products", "/api/projects", "/api/assets/"
]) assert.ok(worker.includes(route), "Missing Worker route: " + route);

for (const method of ["POST", "GET", "PATCH", "DELETE"]) {
  assert.ok(worker.includes('request.method === "' + method + '"'), "Missing HTTP method handling: " + method);
}
for (const apiPath of [
  "/api/auth/login", "/api/auth/register", "/api/auth/me", "/api/auth/logout",
  "/api/products", "/api/projects"
]) assert.ok(cloud.includes(apiPath), "Cloud UI does not call " + apiPath);

assert.ok(html.includes("/cloud-library.js?"), "Main PWA does not load the cloud library module");
assert.ok(cloud.includes("sessionStorage"), "Cloud session token must use sessionStorage");
assert.ok(!cloud.includes("localStorage"), "Cloud session token must not use localStorage");
assert.ok(cloud.includes("Authorization"), "Cloud requests must use bearer authentication");
assert.ok(cloud.includes("method: isEditing ? \"PATCH\" : \"POST\""), "Cloud UI must support updates");
assert.ok(cloud.includes('method: "DELETE"'), "Cloud UI must support archive operations");
assert.ok(worker.includes("ALLOWED_ORIGINS"), "Worker must enforce an origin allowlist");
assert.ok(worker.includes("user.id"), "Worker must scope library operations to the authenticated account");


const ownedProduct = worker.match(/async function ownedProduct[\s\S]*?\n}/)?.[0] || "";
const ownedProject = worker.match(/async function ownedProject[\s\S]*?\n}/)?.[0] || "";
assert.ok(ownedProduct.includes("WHERE id = ? AND user_id = ?"), "Product lookup must be scoped by both ID and authenticated user");
assert.ok(ownedProject.includes("WHERE id = ? AND user_id = ?"), "Project lookup must be scoped by both ID and authenticated user");
assert.ok(worker.includes("WHERE id = ? AND user_id = ? AND deleted_at IS NULL"), "Private asset lookup must enforce owner and active state");
assert.ok(worker.includes("const r2Key = `users/${user.id}/products/${productId}/${assetId}`"), "R2 object keys must be namespaced by authenticated user and product");
assert.ok(worker.includes("sessions s JOIN users u ON u.id = s.user_id"), "Session lookup must resolve its account from the server-side session record");
assert.ok(worker.includes("s.revoked_at IS NULL AND s.expires_at > ? AND u.status = 'active'"), "Session lookup must reject revoked, expired, or inactive accounts");
assert.ok(worker.includes("ALLOWED_ORIGINS.has(origin)"), "Worker must reject origins outside the allowlist");
assert.ok(cloud.includes("sessionStorage.removeItem(TOKEN_KEY)"), "Logout and expired sessions must clear the cloud token");

assert.ok(cloud.includes('"Použiť v štúdiu"'), "Cloud products must offer an explicit read-only Studio import action");
assert.ok(cloud.includes('api("/api/products/" + encodeURIComponent(product.id) + "/images")'), "Studio import must load the product's private image manifest");
assert.ok(cloud.includes('headers: { Authorization: "Bearer " + token }'), "Studio import must fetch private assets with the cloud session");
assert.ok(cloud.includes("window.PSAIProjectBridge.restore({ product: product.name, images: files })"), "Studio import must use the existing project bridge");
assert.ok(cloud.includes("Cloudový originál zostal nezmenený."), "Studio import must preserve the cloud source record");
assert.ok(cloud.includes("if (!confirm("), "Studio import must confirm before replacing unsaved editor state");

console.log("Commercial cloud integration contract checks passed.");

assert.ok(worker.includes('/restore`)'), "Archived products must have an explicit restore endpoint");
assert.ok(worker.includes("SET archived_at = NULL, updated_at = ?"), "Product restore must clear archive state within the authenticated owner scope");
assert.ok(cloud.includes('"Obnoviť produkt"'), "Cloud library must expose an explicit restore action for archived products");
assert.ok(cloud.includes('api("/api/products/" + encodeURIComponent(product.id) + "/restore"'), "Restore action must call the owner-scoped API endpoint");
