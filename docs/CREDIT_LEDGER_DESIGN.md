# Credit Ledger Design (Preview)

Status: preview foundation implemented; customer charging and payment integration are not enabled.

The preview currently has D1 credit-account, append-only ledger, and reservation tables; account-scoped wallet reads; an owner-only idempotent manual-grant endpoint; and server-side reservation/settlement helper routines. These are foundation capabilities only. BytePlus ModelArk generation is provider-billed and deliberately uses no internal wallet reservation or debit (estimatedCredits = 0). There is no checkout, payment webhook, subscription, invoice, or customer charge path.

## Goals

- Make credit accounting server-authoritative and account-scoped.
- Reserve credits before submitting a paid provider task.
- Settle a reservation once the provider outcome and billable usage are known.
- Release a reservation on a confirmed failure or cancellation according to the eventual commercial policy.
- Make every transition idempotent so retries, page reloads, webhook duplicates, and concurrent requests cannot double-charge.
- Keep an auditable, append-only ledger. Never let browser-provided prices or balances decide what a customer owes.

## Proposed records

### credit_accounts
One row per user. Contains current available and reserved integer credit units, a monotonically increasing version, and timestamps. Integer units avoid floating-point arithmetic. The account row is a transactional projection; the ledger remains the audit source.

### credit_ledger
Append-only entries with a unique entry ID, user ID, signed integer delta, entry type, reference type/ID, unique per-user idempotency key, and creation time. Entry types include grant, reserve, capture, release, and administrative adjustment. Corrections are new compensating entries; historical entries are never edited or deleted.

### generation_credit_reservations
One row per generation, unique by generation ID and user ID. Stores reserved units, final captured units, state (reserved, captured, released, review), idempotency keys, and timestamps. A reservation is never silently re-opened after terminal settlement.

## Required invariants

1. The owner is always derived from the authenticated D1 session. Never accept user_id, credit balance, price, or unit cost from the client.
2. A reservation must atomically verify sufficient available balance, decrease available units, increase reserved units, insert the reservation, and append its ledger event.
3. A settlement must atomically transition only a reserved row, move reserved units to captured units, and append exactly one capture event. A repeated settlement returns the original result.
4. A release must atomically transition only a reserved row, restore available units, reduce reserved units, and append exactly one release event. A repeated release returns the original result.
5. Capture and release are mutually exclusive terminal transitions. Concurrent attempts must have exactly one winner.
6. Every ledger idempotency key is unique within the account. Reusing a key with a different payload must return a conflict, not replay a different operation.
7. Provider timeout or ambiguous submission is not proof of failure. Keep the reservation in review/reconciliation flow; do not automatically release it or resubmit a paid provider task.
8. Provider-reported usage and a server-owned price table determine final capture. Browser estimates are display-only.
9. Refunds and manual corrections are compensating ledger entries with an operator reason and audit metadata.
10. All SQL transitions use D1 transactional batches/conditional updates and are covered by concurrency and retry tests.

## Target generation lifecycle (not yet connected to provider-billed generation)

1. Validate request and calculate the maximum reservation from a server-owned pricing table.
2. Reserve credits idempotently before provider submission.
3. Persist the generation and reservation linkage before/with provider submission using a stable request identity.
4. On confirmed success, reconcile billable usage and capture the final amount; release any unused reserved difference.
5. On confirmed provider failure/cancellation, release according to the published policy.
6. On ambiguous provider outcomes, keep funds reserved and reconcile provider status before any release or retry.
7. Expose available, reserved, and spent totals to the authenticated owner only.

## Rollout gates

- Pricing, free allowance, rounding, refunds, expiry, and cancellation policy approved.
- Migration tested against a disposable D1 database and existing preview data.
- Tests cover insufficient balance, duplicate request, changed-payload key reuse, simultaneous reservations, simultaneous capture/release, provider timeout, partial usage, and account isolation.
- Ledger reconciliation proves account projections equal ledger-derived totals.
- No customer-facing deductions until payment terms and pricing are approved and the live provider cost model is verified.
- Payment webhooks are signature-verified, replay-protected, and idempotent before purchased credits are granted.

## Explicitly out of scope for this design

- No real payment provider or webhook integration.
- No customer charge, debit, subscription, or automatic purchased-credit grant.
- BytePlus provider-billed generation does not reserve or debit this internal wallet.
- Manual grants are restricted to the configured owner identity and are not a payment flow.
- No claim that estimated UI credits equal actual provider cost.