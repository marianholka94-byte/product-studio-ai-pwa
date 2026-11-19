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
- [x] Cloud project creation uses a persisted per-account idempotency key, so retrying after a lost response returns the existing project instead of creating a duplicate.
- [x] Reusing an idempotency key with a different payload is rejected.
- [x] Schema and integration checks cover the idempotency column and unique per-account constraint.
- [ ] Manual interruption/retry test with a deliberately interrupted project-create response.
- [ ] Manual tenant-isolation test using two independent preview accounts.
- [ ] Manual session-expiry and logout test.
- [ ] Manual verification of restored prompt, settings, export preset, image count, and image order after a fresh login.

## Security and operations

- [x] Preview deployment workflow runs syntax, integration, tenant-isolation, bundle, and D1/R2 smoke checks.
- [x] Unauthenticated API requests are checked by the deployment smoke test.
- [x] Untrusted browser origins are rejected by the deployment smoke test.
- [ ] Independent review of production authentication design and password policy.
- [ ] Review account recovery, email verification, abuse controls, privacy notice, and data deletion workflow.
- [ ] Define operational logging, alerting, backup, and incident response.
- [ ] Review retention and cleanup for archived records and orphaned R2 objects.

## Commercial model

- [ ] Define free and paid plan limits, credit pricing, and generation cost assumptions.
- [ ] Implement server-authoritative credit reservation, settlement, and refund flows.
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
