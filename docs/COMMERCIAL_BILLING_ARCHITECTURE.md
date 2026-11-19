# Commercial Accounts, Credits, and Generation Architecture

## Current baseline

The isolated commercial preview has account registration, login, logout, account-scoped products/projects, and private media. It does not yet meter or charge for AI generation.

The existing generation Worker exposes prompt creation and Runway generation endpoints. Its current authorization is a shared Worker password/session mechanism, not the commercial preview's per-customer account identity. The generation Worker also has no credit ledger, reservation, settlement, refund, or payment webhook implementation.

These systems must not be treated as commercially connected until identity and billing are integrated end-to-end.

## Required architecture

1. The commercial account is the single customer identity across Studio, cloud library, generation, and billing.
2. Every generation request must authenticate the customer on the server. Never trust a client-supplied user ID, plan, credit balance, price, or estimated cost.
3. The generation Worker must resolve the authenticated account from a verified server-side session or a short-lived, audience-restricted internal token issued by the account service.
4. A generation request must have a client-generated idempotency key. Repeated requests with the same key and same payload must return the existing generation job; reusing the key with a different payload must be rejected.
5. Before calling the provider, the server reserves the required credits in a D1 transaction/atomic conditional update. The balance must never go negative.
6. Provider acceptance creates a durable generation job with provider task ID and reservation reference.
7. On successful completion, settle the reservation against the final server-calculated charge. On provider failure or confirmed cancellation, release/refund the reservation exactly once.
8. Handle unknown provider outcomes explicitly. A timeout after provider acceptance must be reconciled using provider task lookup and the idempotency key, not blindly charged again or submitted as a second job.
9. Keep an immutable credit ledger. Corrections are compensating ledger entries; do not rewrite historic transactions.
10. Payment webhooks must verify signatures, persist provider event IDs, and be idempotent. Never grant credits from a browser redirect or client callback.

## Suggested data model

- `plans`: versioned plan definitions and server-owned limits.
- `subscriptions`: customer, provider subscription ID, plan version, status, period boundaries.
- `credit_accounts`: one account per customer and currency/credit unit.
- `credit_ledger`: immutable grants, reservations, settlements, refunds, expirations, and manual adjustments.
- `generation_jobs`: owner, idempotency key, request fingerprint, provider, provider task ID, state, reserved amount, settled amount, timestamps.
- `payment_events`: unique provider event ID, event type, processing state, timestamps.
- `usage_events`: auditable server-side usage details and cost components.

All customer-owned rows require account ownership constraints and tenant-scoped queries. Unique indexes should enforce per-account idempotency keys and unique payment event IDs.

## Credit lifecycle

`available = granted + adjustments - settled - active_reservations - expired`

The exact formula and treatment of promotional credits, expiry, refunds, and subscription rollover must be finalized before launch. Reservation and settlement must be atomic and idempotent.

## Pricing inputs required before implementation

- Provider cost per model, resolution, duration, and any other billable parameter.
- Currency and whether credits are a direct monetary equivalent or an abstract unit.
- Free-tier monthly allowance and abuse controls.
- Paid plan limits, rollover/expiry, cancellation behavior, refunds, and failed-job policy.
- Target gross margin and contingency for provider price changes.
- VAT/tax handling and consumer disclosure for Slovakia/EU launch.

Do not hard-code customer-facing credit prices until these inputs are confirmed and versioned.

## Implementation order

1. Integrate customer identity between the commercial account service and generation Worker.
2. Add generation job idempotency and provider reconciliation.
3. Add credit ledger and atomic reservation/settlement/refund.
4. Add plan entitlements and server-side usage limits.
5. Select a payment provider and implement signed, idempotent webhooks.
6. Add customer billing screens and transaction history.
7. Test concurrent generation, duplicate requests, provider timeouts, webhook replays, failed jobs, refunds, and cross-tenant access.
8. Complete legal, VAT, privacy, and operational review.

## Safety boundary

Do not enable real paid generation or charge customers until the full identity, credit, provider reconciliation, and payment webhook path passes tests. Keep preview billing in test mode until a payment provider and launch policy are explicitly selected.
