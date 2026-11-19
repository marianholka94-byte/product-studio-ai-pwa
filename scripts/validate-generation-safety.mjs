import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const worker = readFileSync("worker-preview.js", "utf8");
const html = readFileSync("index.html", "utf8");

assert.match(worker, /const RUNWAY_MODEL_ALLOWLIST = new Set\(\);/, "No provider model may be treated as supported before an adapter is verified.");
assert.match(worker, /modelIntegrationReady: RUNWAY_MODEL_ALLOWLIST\.size > 0/, "Health must distinguish an API key from a working model integration.");
assert.match(worker, /supportedModels: \[\.\.\.RUNWAY_MODEL_ALLOWLIST\]/, "Health must expose only explicitly verified provider models.");
assert.match(worker, /code: "PROVIDER_MODEL_NOT_SUPPORTED"/, "Unsupported model requests must return a stable diagnostic code.");

const generationStart = worker.indexOf('if (url.pathname === "/api/generate" && request.method === "POST")');
assert.notEqual(generationStart, -1, "Generation route must exist.");
const modelGuard = worker.indexOf("if (!RUNWAY_MODEL_ALLOWLIST.has(model))", generationStart);
const reservation = worker.indexOf("reserveGenerationCredits(env, user.id, generationId, estimatedCredits, now)", generationStart);
const providerFetch = worker.indexOf('fetch("https://api.dev.runwayml.com/v1/image_to_video"', generationStart);
assert.ok(modelGuard > generationStart, "Generation route must verify the provider/model adapter.");
assert.ok(reservation > modelGuard, "Unsupported models must be rejected before any credit reservation.");
assert.ok(providerFetch > modelGuard, "Unsupported models must be rejected before calling the paid provider.");

assert.ok(html.includes("let generationIntegrationReady=false"), "The UI must start in a fail-closed generation state.");
assert.ok(html.includes("setGenerationAvailability(false)"), "Missing account or failed health checks must disable generation.");
assert.ok(html.includes("health.generation?.modelIntegrationReady"), "The UI must use provider/model readiness, not just API-key presence.");
assert.ok(html.includes("Platené generovanie je bezpečne zablokované"), "The UI must explain why paid generation is unavailable.");
assert.ok(html.includes("finally{btn.disabled=!generationIntegrationReady}"), "Finishing a request must not re-enable generation when the provider is not ready.");

console.log("Generation provider readiness checks passed: unsupported models fail closed before credit reservation or paid provider calls.");
