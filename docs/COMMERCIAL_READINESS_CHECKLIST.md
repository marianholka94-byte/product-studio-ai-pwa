# Commercial Readiness Checklist

This document tracks readiness work on the isolated commercial preview. It is not a declaration that the product is production-ready.

## Stability and data integrity

- [x] Preview D1 and R2 are isolated from production resources.
- [x] Authentication sessions are stored as token hashes and checked for expiry, revocation, and active account status.
- [x] Product, project, and private asset reads/writes are scoped to the authenticated account.
- [x] Product image upload validates size, MIME type, and file signatures.
- [x] Product image count is limited in both application code and D1.
- [x] Local IndexedDB image records are serialized to clone-safe bytes and hydrated on read.
- [x] Cloud save progress is checkpointed locally between media uploads.
- [x] Cloud product and project creation use persisted per-account idempotency keys, so retrying after a lost response returns the existing records instead of creating duplicates.
- [x] Reusing a product or project idempotency key with a different payload is rejected.
- [x] Resumed cloud uploads compare ordered SHA-256 checksums against the remote image manifest before continuing.
- [x] Schema and integration checks cover both idempotency columns and unique per-account constraints.
- [x] Integration checks cover checksum-verified recovery of partially uploaded images.
- [x] Manual interrupted cloud save followed by resume; user confirmed that the project saved successfully.
- [ ] Manual lost project-create response retry test (verify idempotent replay without duplicate records).
- [x] Manual UI tenant-isolation check: the second account showed only its own cloud product and no products/projects from the first account.
- [x] Repeatable two-account API acceptance script added; checks own-account reads, cross-account product/project/asset denial, and server-side logout revocation without mutating saved records.
- [x] Local project cloud-sync checkpoints are now stored per customer account; legacy unscoped checkpoints are adopted only after the signed-in account proves ownership of the remote product/project.
- [x] PWA asset cache version and offline precache updated for account-scoped cloud-sync code; no Android package rebuild is required for this web-only preview change.
- [ ] Direct cross-account API/asset-ID authorization check (attempt first-account resource IDs while authenticated as the second account).
- [ ] Manual session-expiry and logout test.
- [x] User-confirmed: after signing out and signing back in, a cloud project opens back into Studio with its saved content and photos.

## Security and operations

- [x] Preview deployment workflow runs syntax, integration, tenant-isolation, bundle, and D1/R2 smoke checks.
- [x] Unauthenticated API requests are checked by the deployment smoke test.
- [x] Untrusted browser origins are rejected by the deployment smoke test.
- [ ] Independent review of production authentication design and password policy.
- [ ] Replace the generation Worker shared-password session boundary with verified per-customer commercial account identity before paid generation is enabled.
- [ ] Review account recovery, email verification, abuse controls, privacy notice, and data deletion workflow.
- [ ] Define operational logging, alerting, backup, and incident response.
- [ ] Review retention and cleanup for archived records and orphaned R2 objects.

## Commercial model

- [ ] Define free and paid plan limits, credit pricing, and generation cost assumptions.
- [ ] Implement server-authoritative credit reservation, settlement, and refund flows.
- [ ] Add generation-job idempotency and provider timeout reconciliation before enabling customer charges.
- [ ] Select payment provider and implement verified webhook processing.
- [ ] Add customer-facing billing, invoices, cancellation, and subscription management.
- [ ] Complete legal, VAT, consumer-rights, and privacy review for launch markets.

## Android integration

- [x] Existing Android wrapper project identified.
- [ ] Update Android WebView host allowlist and remote app URL deliberately.
- [ ] Verify cloud login, upload, save, retry, restore, and logout inside Android WebView.
- [ ] Verify WebView file chooser, navigation, offline behavior, and session persistence.
- [ ] Confirm which changes can ship as web updates and which require a new Android package.
- [ ] Do not release a new Android build until preview acceptance and production cutover are explicitly approved.

## Current boundary

All work in this checklist is limited to `feature/commercial-worker-preview` and its isolated preview Worker. The production branch, production Worker, and published Android application must remain unchanged until explicitly approved.
