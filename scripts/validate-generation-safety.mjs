import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const html = readFileSync("index.html", "utf8");

// Provider readiness is deliberately opt-in: an API key alone must never trigger paid calls.
assert.match(worker, /BYTEPLUS_MODELARK_API_KEY/);
assert.match(worker, /BYTEPLUS_MODELARK_ENABLED/);
assert.match(worker, /function byteplusReady\(env\)[\s\S]*?=== "true"/);
assert.match(worker, /modelIntegrationReady: byteplusReady\(env\)/);
assert.match(worker, /provider: "byteplus_modelark"/);

// Official Seedance 2.0 model IDs and ModelArk API contract.
assert.match(worker, /dreamina-seedance-2-0-mini-260615/);
assert.match(worker, /dreamina-seedance-2-0-260128/);
assert.match(worker, /https:\/\/ark\.ap-southeast\.bytepluses\.com\/api\/v3\/contents\/generations\/tasks/);
assert.match(worker, /type: "image_url"/);
assert.match(worker, /image_url: \{ url: image \}/);
assert.match(worker, /role: "reference_image"/);
assert.match(worker, /ratio: providerRatio/);
assert.match(worker, /function byteplusRatio/);
assert.match(worker, /function generationStatus\(providerStatus\)[\s\S]*?toLowerCase\(\)/);

// Fail closed before writing a generation or invoking BytePlus.
const generationStart = worker.indexOf('if (url.pathname === "/api/generate" && request.method === "POST")');
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

// A lost provider response must be treated as ambiguous, never as permission to retry.
assert.match(worker, /status = 'submission_unknown'/);
assert.match(worker, /provider_submission_unknown/);
assert.match(worker, /recoveryRequired: true/);
assert.ok(worker.includes("BytePlus may") && worker.includes("already have accepted and billed the task"));
assert.ok(worker.includes("recoveryRequired: uncertain"));
assert.ok(worker.includes("if (!prior.provider_task_id)") && worker.includes("neposielam znova"));

// Status and download use the ModelArk task endpoint.
assert.match(worker, /BYTEPLUS_TASKS_URL \+ "\/" \+ encodeURIComponent\(generation\.provider_task_id\)/);
assert.doesNotMatch(worker, /RUNWAY_API_KEY|api\.dev\.runwayml\.com|RUNWAY_MODEL_ALLOWLIST/);

// UI must not invent a fixed provider price and must remain disabled until health confirms readiness.
assert.ok(html.includes("let generationIntegrationReady=false"));
assert.ok(html.includes("health.generation?.modelIntegrationReady"));
assert.ok(html.includes("Cena podľa skutočnej spotreby BytePlus"));
assert.ok(html.includes("BytePlus účtuje Seedance podľa skutočnej spotreby tokenov"));
assert.match(html, /platené generovanie zostáva vypnuté/i);
assert.doesNotMatch(html, /Runway Dev|0\.15 USD/);

console.log("BytePlus ModelArk integration checks passed: paid calls require explicit opt-in, model mapping and billing are provider-correct, and task polling/download use ModelArk.");
