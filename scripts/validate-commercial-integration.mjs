import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const cloud = readFileSync("cloud-library.js", "utf8");
const nav = readFileSync("app-navigation.js", "utf8");
const html = readFileSync("index.html", "utf8");
const serviceWorker = readFileSync("sw.js", "utf8");

assert.ok(nav.includes("Nie sú viazané na cloudový účet"), "The local project screen must explain that device-local projects are independent of the signed-in cloud account.");

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
assert.ok(cloud.includes('await api("/api/auth/logout", { method: "POST" })'), "Cloud logout must revoke the server-side session before clearing the local token.");
assert.ok(cloud.includes('if (response.status === 401) { token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); renderAuth(); notifyCloudAccountChange(); }'), "Expired or revoked API sessions must clear the token, clear the account identity, refresh local project status, and return the cloud UI to signed-out state.");
assert.ok(cloud.includes('api("/api/auth/me").then(data =>'), "A restored tab session must be revalidated with the server before showing private cloud data.");
assert.ok(cloud.includes('catch(() => { token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); renderAuth(); notifyCloudAccountChange(); })'), "An invalid restored session must fail closed, clear local credentials and account identity, and refresh account-scoped project labels.");

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

assert.ok(worker.includes("(?:images|restore)"), "Product route matcher must accept the explicit restore sub-route");

assert.ok(cloud.includes("window.PSAICloudLibrary"), "Cloud library must expose the explicit local project save bridge");
assert.ok(cloud.includes("async saveLocalProject(record, onProgress"), "Cloud save bridge must accept a local project and durable progress callback");
assert.ok(cloud.includes('api("/api/products", {'), "Cloud save must create an account-scoped product before uploading media");
assert.ok(cloud.includes('api("/api/products/" + encodeURIComponent(sync.productId) + "/images"'), "Cloud save must upload images through the authenticated product media API");
assert.ok(cloud.includes("await onProgress({ ...sync })"), "Cloud save must persist every upload checkpoint before continuing");

assert.ok(cloud.includes("if (!sync.idempotencyKey)"), "Cloud save must create a stable idempotency key before project creation.");

assert.ok(cloud.includes("productOperationId: crypto.randomUUID()"), "Cloud save must create a stable product idempotency key before creating the product.");
assert.ok(cloud.includes("idempotencyKey: sync.productOperationId"), "Cloud product creation must send the persisted idempotency key.");
assert.ok(worker.includes("WHERE user_id = ? AND client_operation_id = ?"), "Cloud product and project retries must look up operation keys within the authenticated account.");
assert.ok(worker.includes("Kľúč operácie už bol použitý pre iný produkt."), "Reusing a product idempotency key with a different payload must be rejected.");

assert.ok(cloud.includes("idempotencyKey: sync.idempotencyKey"), "Cloud project creation must send the persisted idempotency key.");
assert.ok(cloud.includes("exportPreset: record.exportPreset || null"), "Cloud save retry fingerprints must include the export preset to detect changed project settings.");
assert.ok(worker.includes("client_operation_id"), "Cloud project creation must persist its idempotency key server-side.");
assert.ok(worker.includes("WHERE user_id = ? AND client_operation_id = ?"), "Cloud project retries must look up the operation key within the authenticated account.");
assert.ok(worker.includes("Kľúč operácie už bol použitý pre iný projekt."), "Reusing an idempotency key with a different payload must be rejected.");

assert.ok(cloud.includes('api("/api/projects", {'), "Cloud save must create a cloud project only after product media upload");
assert.ok(cloud.includes("settings,\n          exportPreset"), "Cloud project save must preserve mapped Studio settings and export preset");
assert.ok(cloud.includes("if (sync && sync.fingerprint !== fingerprint)"), "Cloud save must stop if the local project changes during a partial upload");
assert.ok(cloud.includes('crypto.subtle.digest("SHA-256"'), "Cloud save retry fingerprint must include actual image content hashes");
assert.ok(cloud.includes("uploaded > images.length"), "Cloud save must stop rather than silently duplicating excess media");
assert.ok(worker.includes("a.checksum_sha256") && worker.includes("checksumSha256: row.checksum_sha256"), "Private image manifests must expose stored SHA-256 checksums for safe resume.");
assert.ok(cloud.includes("const remoteDigests = (manifest.images || []).map(image => image.checksumSha256 || \"\")"), "Cloud save retry must compare the remote image manifest with the original local image checksums.");
assert.ok(cloud.includes("remoteDigests[index] !== imageDigests[index]"), "Cloud save retry must stop if a previously uploaded image differs from the local source.");
assert.ok(cloud.includes("return btoa(binary)") && cloud.includes("replace(/=/g"), "Client image fingerprints must use unpadded base64 SHA-256 encoding.");
assert.ok(nav.includes("Uložiť do cloudu"), "Local project cards must offer an explicit cloud save action");
assert.ok(nav.includes("latest.cloudSync=sync"), "Local project must persist cloud save progress for retry");
assert.ok(nav.includes("resolution:state.resolution||'720p',model:state.model||'seedance2_mini'"), "Local project save must retain model and resolution settings");


assert.ok(nav.includes('serializeImageRecord'), "Local IndexedDB must serialize image files into clone-safe bytes");
assert.ok(nav.includes('source.arrayBuffer()'), "Local image serialization must read bytes instead of persisting File/Blob objects");
assert.ok(nav.includes('new Blob([bytes]'), "Local project and product reads must reconstruct image Blob objects");
assert.ok(nav.includes('const putProject=async project=>{const stored=await prepareRecord(project)'), "Project writes must serialize image bytes before opening IndexedDB write transactions");
assert.ok(nav.includes('const putProduct=async product=>{const stored=await prepareRecord(product)'), "Product writes must serialize image bytes before opening IndexedDB write transactions");
assert.ok(nav.includes('const hydrateRecord=record=>'), "Existing local records must be hydrated on read for backwards compatibility");

assert.ok(cloud.includes('"Otvoriť v štúdiu"'), "Cloud project cards must expose an explicit open-in-Studio action");
assert.ok(cloud.includes('api("/api/products/" + encodeURIComponent(linkedProduct.id) + "/images")'), "Opening a cloud project must fetch its linked product image manifest");
assert.ok(cloud.includes('Authorization: "Bearer " + token'), "Cloud project media must be fetched with the authenticated session");
assert.ok(cloud.includes('prompt: project.prompt || ""'), "Cloud project import must restore the saved prompt");
assert.ok(cloud.includes('style: settings.style || ""') && cloud.includes('resolution: settings.resolution || "720p"') && cloud.includes('model: settings.model || "seedance2_mini"'), "Cloud project import must restore saved Studio settings");
assert.ok(cloud.includes("project.exportPreset || \"custom\""), "Cloud project import must restore the export preset");
assert.ok(cloud.includes("cloudový originál zostal nezmenený"), "Cloud project import must remain read-only");

assert.ok(cloud.includes("let editingProjectRecord = null"), "Cloud project editor must retain the full original project record");
assert.ok(cloud.includes("editingProjectRecord = project"), "Editing a cloud project must capture its existing settings");
assert.ok(cloud.includes("payload.settings = editingProjectRecord?.settings || {}"), "Editing project metadata must preserve existing cloud settings instead of overwriting them with an empty object");
assert.ok(cloud.includes("payload.exportPreset = editingProjectRecord?.exportPreset ?? null"), "Editing project metadata must preserve its export preset");


// Retry correctness: the same account-scoped operation key must replay the
// original row after a lost response, while a changed payload must fail closed.
const projectCreate = worker.match(/if \(request\.method === "POST" && !projectId\)[\s\S]*?\n          }\n          if \(projectId && request\.method === "GET"\)/)?.[0] || "";
assert.ok(projectCreate.includes("if (prior)"), "Project create must detect a previously committed operation before inserting again.");
assert.ok(projectCreate.includes("return json({ project: publicProject(prior), replayed: true }, 200, origin)"), "A lost project-create response must replay the original project rather than create a duplicate.");
assert.ok(projectCreate.includes("if (!samePayload) return json({ error: \"Kľúč operácie už bol použitý pre iný projekt.\" }, 409, origin)"), "A project retry with a changed payload must be rejected.");
assert.ok(projectCreate.includes("if (operationId && /unique|constraint/i.test(String(error)))"), "Concurrent project retries must recover from the unique operation-key constraint.");

const projectMigration = readFileSync("migrations/0005_project_save_idempotency.sql", "utf8");
const productMigration = readFileSync("migrations/0006_product_save_idempotency.sql", "utf8");
assert.ok(projectMigration.includes("CREATE UNIQUE INDEX") && projectMigration.includes("ON projects(user_id, client_operation_id)"), "Project operation keys must be unique within each account at the database layer.");
assert.ok(productMigration.includes("CREATE UNIQUE INDEX") && productMigration.includes("ON products(user_id, client_operation_id)"), "Product operation keys must be unique within each account at the database layer.");
assert.ok(projectMigration.includes("WHERE client_operation_id IS NOT NULL") && productMigration.includes("WHERE client_operation_id IS NOT NULL"), "Legacy rows without operation keys must remain compatible.");

// A retry must reconcile the server manifest before sending another image.
const saveFlow = cloud.match(/async saveLocalProject\(record, onProgress = \(\) => \{\}\)[\s\S]*?\n    }\n  };/)?.[0] || "";
assert.ok(saveFlow.indexOf("const manifest = await api(") < saveFlow.indexOf("for (let index = uploaded; index < images.length; index++)"), "Cloud save must read the remote manifest before uploading any retry images.");
assert.ok(saveFlow.includes("if (!remoteDigests[index] || remoteDigests[index] !== imageDigests[index])"), "Cloud save must refuse to resume when a previously uploaded image cannot be checksum-verified.");
assert.ok(saveFlow.includes("sync.idempotencyKey = crypto.randomUUID()") && saveFlow.indexOf("await onProgress({ ...sync })") < saveFlow.indexOf("api(\"/api/projects\""), "Project operation key must be persisted before the create request can lose its response.");

assert.ok(cloud.includes("getSyncState(record)"), "Local project cloud status must be resolved for the currently authenticated account.");
assert.ok(cloud.includes("record.cloudSyncByAccount?.[user.id]"), "Cloud save metadata must be stored and retrieved independently per customer account.");
assert.ok(cloud.includes("const accountId = user.id"), "Every cloud save operation must be bound to the authenticated account identity.");
assert.ok(cloud.includes("const remoteProduct = await api(\"/api/products/\" + encodeURIComponent(record.cloudSync.productId))"), "Legacy unscoped cloud saves must be adopted only after verifying product ownership.");
assert.ok(nav.includes("latest.cloudSyncByAccount={...(latest.cloudSyncByAccount||{}),[sync.accountId]:sync}"), "Cloud save checkpoints must be persisted under their owning account.");
assert.ok(nav.includes("[result.accountId]:result"), "Completed cloud saves must remain associated with the account that owns them.");
assert.ok(nav.includes("psai-cloud-account-change"), "Switching cloud accounts must refresh local project cloud-status labels.");
assert.ok(html.includes("cloud-library.js?v=account-scoped-cloud-sync-20261119") && html.includes("app-navigation.js?v=account-scoped-cloud-sync-20261119"), "PWA HTML must request the account-scoped cloud-sync asset versions.");
assert.ok(serviceWorker.includes("product-studio-ai-v30-account-scoped-cloud-sync-20261119"), "PWA service worker cache must be versioned for the account-scoped cloud-sync release.");
assert.ok(serviceWorker.includes("/cloud-library.js?v=account-scoped-cloud-sync-20261119") && serviceWorker.includes("/app-navigation.js?v=account-scoped-cloud-sync-20261119"), "Offline precache must include the exact account-scoped cloud-sync asset URLs.");
