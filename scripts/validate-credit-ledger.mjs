import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const migration = readFileSync("migrations/0008_credit_ledger_foundation.sql", "utf8");
const reconciliation = readFileSync("migrations/0009_reconcile_legacy_credit_ledger.sql", "utf8");
const worker = readFileSync("worker-preview.js", "utf8");
const workflow = readFileSync(".github/workflows/deploy-commercial-preview.yml", "utf8");

for (const table of ["credit_accounts", "credit_ledger", "generation_credit_reservations"]) {
  assert.match(migration, new RegExp("CREATE TABLE IF NOT EXISTS " + table), "Missing credit table: " + table);
}
assert.match(migration, /available_units INTEGER NOT NULL DEFAULT 0 CHECK \(available_units >= 0\)/, "Available credits must be integer units and cannot go negative.");
assert.match(migration, /reserved_units INTEGER NOT NULL DEFAULT 0 CHECK \(reserved_units >= 0\)/, "Reserved credits must be integer units and cannot go negative.");
assert.match(migration, /UNIQUE\(user_id, idempotency_key\)/, "Ledger idempotency keys must be unique per account.");
assert.match(migration, /UNIQUE\(user_id, generation_id\)/, "A generation may have at most one reservation per account.");
assert.match(migration, /UNIQUE\(user_id, reserve_idempotency_key\)/, "Reservation creation must be idempotent per account.");
assert.match(migration, /trg_credit_ledger_no_update[\s\S]*?RAISE\(ABORT, 'credit_ledger_is_append_only'\)/, "Ledger rows must reject updates.");
assert.match(migration, /trg_credit_ledger_no_delete[\s\S]*?RAISE\(ABORT, 'credit_ledger_is_append_only'\)/, "Ledger rows must reject deletes.");
assert.match(migration, /CHECK \(captured_units <= reserved_units\)/, "Captured credits cannot exceed reserved credits.");
assert.match(migration, /state IN \('reserved','captured','released','review'\)/, "Reservation state must be constrained.");
assert.match(reconciliation, /abs\(amount\)/, "Legacy signed ledger amounts must be preserved as positive credit units.");
assert.match(reconciliation, /WHEN 'reservation' THEN 'reserve'/, "Legacy reservations must map to the new reserve entry type.");
assert.match(reconciliation, /WHEN 'charge' THEN 'capture'/, "Legacy charges must map to the new capture entry type.");
assert.match(reconciliation, /COALESCE\(idempotency_key, 'legacy:' \|\| id\)/, "Legacy rows without idempotency keys must receive stable keys.");
assert.match(reconciliation, /DROP TABLE credit_ledger;[\s\S]*?ALTER TABLE credit_ledger_rebuilt RENAME TO credit_ledger/, "Migration must replace the incompatible legacy table.");
assert.match(worker, /creditSchema[\s\S]*?enabled: true/, "Credit accounting must be enabled after reservation and settlement are wired.");
assert.match(worker, /async function reserveGenerationCredits[\s\S]*?UPDATE credit_accounts[\s\S]*?available_units >= \?[\s\S]*?INSERT INTO generation_credit_reservations[\s\S]*?INSERT INTO credit_ledger/, "Generation credits must be atomically reserved and recorded before provider submission.");
assert.match(worker, /async function settleGenerationCredits[\s\S]*?UPDATE credit_accounts[\s\S]*?UPDATE generation_credit_reservations[\s\S]*?INSERT INTO credit_ledger/, "Generation credit settlement must update balances, reservation state, and immutable ledger together.");
assert.match(worker, /const estimatedCredits = 0/, "BytePlus generation must not invent an app-wallet estimate for provider-billed requests.");
assert.doesNotMatch(worker, /reserveGenerationCredits\(env, user\.id, generationId, estimatedCredits, now\)/, "BytePlus provider-billed generation must not reserve internal wallet credits.");
assert.match(worker, /provider: "byteplus_modelark"/, "Generation health must identify the BytePlus ModelArk provider.");
assert.match(worker, /settleGenerationCredits\(env, user\.id, generationId, "release", failedAt\)/, "Provider rejection must release the reservation.");
assert.match(worker, /settleGenerationCredits\(env, user\.id, generation\.id, "capture", now\)/, "Successful provider completion must capture reserved credits.");
assert.match(worker, /settleGenerationCredits\(env, user\.id, generation\.id, "release", now\)/, "Failed or cancelled provider completion must release reserved credits.");
assert.match(worker, /credit_ledger[\s\S]*?trg_credit_ledger_no_update[\s\S]*?trg_credit_ledger_no_delete/, "Health endpoint must report ledger tables and immutability triggers.");
const generationRouteStart = worker.indexOf('if (url.pathname === "/api/generate" && request.method === "POST")');
assert.notEqual(generationRouteStart, -1, "Commercial generation route must exist.");
const generationHandler = worker.slice(generationRouteStart);
assert.match(generationHandler, /const estimatedCredits = 0/, "Provider charges are billed directly by BytePlus, not the internal wallet.");
assert.doesNotMatch(generationHandler, /reserveGenerationCredits\(env, user\.id, generationId/, "Provider-billed generation must not reserve internal credits.");
assert.match(worker, /url\.pathname === "\/api\/credits\/admin-grant"[\s\S]*?INSERT INTO credit_accounts[\s\S]*?INSERT INTO credit_ledger/, "Only the authenticated admin-grant route may add manual credit grants.");
assert.match(workflow, /node scripts\/validate-credit-ledger\.mjs/, "Preview deployment must run the credit ledger validator.");
assert.match(workflow, /creditSchema.*accounts.*ledger.*reservations/, "Deployment smoke test must verify credit schema readiness.");
assert.match(workflow, /appendOnly.*enabled/, "Deployment smoke test must verify append-only ledger protection and active accounting.");

console.log("Credit accounting validation passed: reservations, capture, and release are enabled.");
