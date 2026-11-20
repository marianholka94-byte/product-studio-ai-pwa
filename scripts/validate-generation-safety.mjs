import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const html = readFileSync("index.html", "utf8");
const outputMigration = readFileSync("migrations/0010_generation_outputs_r2.sql", "utf8");
const inputMigration = readFileSync("migrations/0011_generation_input_videos_r2.sql", "utf8");
const inputLimitMigration = readFileSync("migrations/0013_generation_input_videos_90mb.sql", "utf8");

// Provider readiness is deliberately opt-in: an API key alone must never trigger paid calls.
assert.match(worker, /BYTEPLUS_MODELARK_API_KEY/);
assert.match(worker, /BYTEPLUS_MODELARK_ENABLED/);
assert.match(worker, /function byteplusReady\(env\)[\s\S]*?=== "true"/);
assert.match(worker, /function byteplusConfigured\(env\)/);
const statusRoute = worker.slice(worker.indexOf('const generationStatusMatch'), worker.indexOf('const generationDownloadMatch'));
const downloadRoute = worker.slice(worker.indexOf('const generationDownloadMatch'));
assert.ok(statusRoute.includes('if (!byteplusConfigured(env))'), "Existing task status checks must remain available when new paid generation is disabled.");
assert.ok(downloadRoute.includes('if (!byteplusConfigured(env))'), "Existing task downloads must remain available when new paid generation is disabled.");
assert.ok(worker.includes('if (!byteplusReady(env)) return json({ error: "Seedance API zatiaľ nie je aktivované. Platené generovanie zostáva vypnuté."'), "New paid generation must still require explicit enablement.");
assert.match(worker, /modelIntegrationReady: byteplusReady\(env\)/);
assert.match(worker, /provider: "byteplus_modelark"/);

// Official Seedance 2.0 model IDs and ModelArk API contract.
assert.match(worker, /dreamina-seedance-2-0-mini-260615/);
assert.match(worker, /dreamina-seedance-2-0-260128/);
assert.match(worker, /https:\/\/ark\.ap-southeast\.bytepluses\.com\/api\/v3\/contents\/generations\/tasks/);
assert.match(worker, /type: "image_url"/);
assert.match(worker, /image_url: \{ url: image \}/);
assert.match(worker, /role: "reference_image"/);
assert.match(worker, /type: "video_url"/, "Seedance requests must support reference video inputs.");
assert.match(worker, /role: "reference_video"/, "Reference video input must use the ModelArk reference_video role.");
assert.match(worker, /video_url: \{ url: PREVIEW_WORKER_ORIGIN \+ "\/api\/provider-input\//, "The provider must receive a temporary Worker URL, not a public permanent R2 object URL.");
assert.match(worker, /access_token_hash = \?/);
assert.match(worker, /access_expires_at > \?/);
assert.match(worker, /function cleanupExpiredGenerationInputs/);
assert.match(inputMigration, /CREATE TABLE IF NOT EXISTS generation_input_videos/);
assert.match(inputMigration, /UNIQUE \(user_id, client_upload_id\)/);
assert.match(inputMigration, /FOREIGN KEY \(generation_id, user_id\)[\s\S]*?REFERENCES generations\(id, user_id\)/);
assert.match(worker, /ratio: providerRatio/);
assert.match(worker, /function byteplusRatio/);
assert.match(worker, /function generationStatus\(providerStatus\)[\s\S]*?toLowerCase\(\)/);

// Fail closed before writing a generation or invoking BytePlus.
const videoUploadStart = worker.indexOf('if (request.method === "POST" && url.pathname === "/api/generation-input-video")');
assert.ok(videoUploadStart >= 0, "Authenticated reference video upload route must exist.");
const videoUploadRoute = worker.slice(videoUploadStart, worker.indexOf('if (request.method === "GET" && url.pathname === "/api/health")'));
assert.ok(videoUploadRoute.includes("currentUser(request, env)") && !videoUploadRoute.includes("byteplusReady(env)"), "Private source-video uploads must require an authenticated account but remain testable while paid generation is disabled.");
assert.match(inputMigration, /byte_size INTEGER NOT NULL CHECK \(byte_size BETWEEN 12 AND 52428800\)/);
assert.match(inputLimitMigration, /byte_size INTEGER NOT NULL CHECK \(byte_size BETWEEN 12 AND 94371840\)/);
assert.match(inputLimitMigration, /INSERT INTO generation_input_videos_new[\s\S]*?FROM generation_input_videos/);
assert.match(inputLimitMigration, /ALTER TABLE generation_input_videos_new RENAME TO generation_input_videos/);
assert.ok(worker.includes("const MAX_SOURCE_VIDEO_BYTES = 90 * 1024 * 1024") && videoUploadRoute.includes("MAX_SOURCE_VIDEO_BYTES") && videoUploadRoute.includes("new TransformStream") && videoUploadRoute.includes('"ftyp"') && videoUploadRoute.includes("90 MB"), "Reference video uploads must stream to R2 with the 90 MB hard size cap and MP4/MOV signature validation.");
assert.ok(videoUploadRoute.includes('throw new Error("Zdrojové video môže mať najviac 90 MB.")'), "The streamed source video byte counter must report the same 90 MB limit as the upload header check.");
const providerInputRoute = worker.slice(worker.indexOf("const providerInputMatch"), videoUploadStart);
assert.ok(providerInputRoute.includes('request.headers.get("Range")') && providerInputRoute.includes('range: { offset: start, length: responseLength }'), "The private provider video endpoint must stream valid byte ranges directly from R2.");
assert.ok(providerInputRoute.includes('"Accept-Ranges": "bytes"') && providerInputRoute.includes('headers["Content-Range"] = contentRange') && providerInputRoute.includes('status: responseStatus'), "Provider video range responses must include correct 206/416 metadata.");
assert.ok(providerInputRoute.includes('/^bytes=(\\d*)-(\\d*)$/i') && providerInputRoute.includes('(!match[1] && !match[2])'), "Provider video range parsing must accept only one explicit byte range and reject empty or multipart values.");
assert.ok(providerInputRoute.includes('if (!match[1])') && providerInputRoute.includes('Math.max(totalSize - suffixLength, 0)'), "Provider video range parsing must support suffix byte ranges.");
assert.ok(providerInputRoute.includes('end = match[2] ? Number(match[2]) : totalSize - 1') && providerInputRoute.includes('end = Math.min(end, totalSize - 1)'), "Provider video range parsing must support open-ended ranges and clamp end offsets to the object size.");
assert.ok(providerInputRoute.includes('start >= totalSize') && providerInputRoute.includes('end < start') && providerInputRoute.includes('"Content-Range": "bytes */" + totalSize'), "Unsatisfiable provider video ranges must return 416 with the total object size.");
assert.ok(providerInputRoute.includes('request.method === "HEAD" ? null : object.body'), "Provider video HEAD requests must return headers without streaming the body.");
const generationStart = worker.indexOf('if (url.pathname === "/api/generate" && request.method === "POST")');
const generationVideoValidation = worker.slice(generationStart, worker.indexOf("const generationId = crypto.randomUUID()", generationStart));
assert.ok(generationVideoValidation.includes("Number(inputVideo.byte_size) > MAX_SOURCE_VIDEO_BYTES"), "Generation must accept the same 90 MB source-video limit as the upload route.");
assert.ok(!generationVideoValidation.includes("50 * 1024 * 1024"), "Generation must not retain the previous 50 MB source-video limit.");
assert.notEqual(generationStart, -1, "Generation route must exist.");
const readinessGuard = worker.indexOf("if (!byteplusReady(env))", generationStart);
const modelGuard = worker.indexOf("const providerModel = BYTEPLUS_MODEL_IDS[model]", generationStart);
const generationInsert = worker.indexOf("INSERT INTO generations", generationStart);
const providerFetch = worker.indexOf("fetch(BYTEPLUS_TASKS_URL", generationStart);
assert.ok(readinessGuard > generationStart && modelGuard > readinessGuard);
assert.ok(generationInsert > modelGuard, "Unsupported models must be rejected before a task is recorded.");
assert.ok(providerFetch > generationInsert, "Paid provider calls must happen only after all validation.");

// BytePlus billing is separate from the app wallet; do not debit stale Runway estimates.
assert.match(worker, /const estimatedCredits = 0/);
assert.doesNotMatch(worker, /reserveGenerationCredits\(env, user\.id, generationId/);
assert.match(worker, /'byteplus_modelark'/);
assert.match(worker, /task\.content\?\.video_url/);
assert.match(worker, /task\.status !== "succeeded"/);
assert.match(worker, /MEDIA\.put\(r2Key, limitedBody/);
assert.match(worker, /MEDIA\.get\(savedOutput\.r2_key\)/);
assert.match(worker, /maxVideoBytes = 250 \* 1024 \* 1024/);
assert.match(worker, /generation_outputs WHERE generation_id = \? AND user_id = \?/);
assert.match(outputMigration, /CREATE TABLE IF NOT EXISTS generation_outputs/);
assert.match(outputMigration, /FOREIGN KEY \(generation_id, user_id\)[\s\S]*?REFERENCES generations\(id, user_id\)/);
assert.match(outputMigration, /UNIQUE/);

// A lost provider response must be treated as ambiguous, never as permission to retry.
assert.match(worker, /SET status = 'processing', error_code = \?/);
assert.match(worker, /provider_submission_unknown/);
assert.match(worker, /recoveryRequired: true/);
assert.ok(worker.includes("BytePlus may") && worker.includes("already have accepted and billed the task"));
assert.ok(worker.includes("recoveryRequired: uncertain"));
assert.match(worker, /const ambiguous = upstream\.status >= 500 \|\| upstream\.ok/);
assert.ok(worker.includes("if (!prior.provider_task_id)") && worker.includes("neposielam znova"));

// Status and download use the ModelArk task endpoint.
assert.match(worker, /BYTEPLUS_TASKS_URL \+ "\/" \+ encodeURIComponent\(generation\.provider_task_id\)/);
assert.ok(worker.includes("providerStatus: task.status, status: mapped"), "Status API must return normalized terminal states while preserving the provider status.");
assert.ok(worker.includes("delete safeTask.content.video_url"), "Temporary provider video URLs must never be exposed by the status API.");
assert.doesNotMatch(worker, /RUNWAY_API_KEY|api\.dev\.runwayml\.com|RUNWAY_MODEL_ALLOWLIST/);

// UI must not invent a fixed provider price and must remain disabled until health confirms readiness.
assert.ok(html.includes("let generationIntegrationReady=false"));
assert.ok(html.includes("health.generation?.modelIntegrationReady"));
assert.ok(html.includes("Cena podľa skutočnej spotreby BytePlus"));
assert.ok(html.includes("BytePlus účtuje Seedance podľa skutočnej spotreby tokenov"));
assert.ok(html.includes("item.errorCode==='provider_submission_unknown'?'Overenie odoslania'"));
assert.ok(html.includes("Neposielaj požiadavku znova"));
assert.ok(html.includes("Na overenie"));
assert.ok(html.includes("item.errorCode==='provider_submission_unknown'"), "Unknown provider submissions must use their diagnostic code rather than an unsupported database status.");
assert.ok(html.includes("item.errorCode!=='provider_submission_unknown'"), "Unknown provider submissions must not expose a misleading resume action.");
assert.ok(html.includes("['FAILED','CANCELED','CANCELLED'].includes(status)"), "Polling must stop for both provider cancellation spellings.");
const historyRefresh = html.slice(html.indexOf("async function refreshGenerationHistory()"), html.indexOf("$('refreshHistory').addEventListener"));
assert.ok(historyRefresh.includes("activeItems.map") && historyRefresh.includes("/api/status/"), "Opening generation history must reconcile existing active tasks.");
assert.ok(!historyRefresh.includes("/api/generate"), "Automatic history reconciliation must never submit a new paid task.");
assert.match(html, /platené generovanie zostáva vypnuté/i);
assert.doesNotMatch(html, /Runway Dev|0\.15 USD/);

console.log("BytePlus ModelArk integration checks passed: paid calls require explicit opt-in, model mapping and billing are provider-correct, and task polling/download use ModelArk.");
