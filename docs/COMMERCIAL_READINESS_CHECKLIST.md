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
- [x] Cloud project edits use an atomic `updated_at` precondition; stale edits return HTTP 409 with the current project instead of overwriting newer work.
- [x] Cloud product edits use an atomic `updated_at` precondition; stale edits return HTTP 409 with the current product and the UI offers reload-latest or retry-with-my-edits.
- [x] Cloud project editor preserves typed text after a conflict and updates its baseline version before the user retries.
- [x] Cloud project conflict recovery offers explicit reload-latest, retry-with-my-edits, and idempotent save-as-copy actions.
- [x] Cloud account changes, logout, and expired sessions clear account-specific editor state so one account's unsaved form data is not shown to another.
- [x] Reusing a product or project idempotency key with a different payload is rejected.
- [x] Manual cloud-library product and project creation persist account-scoped idempotency checkpoints in session storage, reuse the same key after a lost response, and prevent overlapping submissions.
- [x] Cloud library ignores stale refresh/save responses after account changes, prevents an old 401 response from clearing a newer session, serializes sign-in attempts, and revokes temporary image preview URLs.
- [x] Cloud uploads capture the initiating account before asynchronous image hashing; an account switch during hashing stops the upload instead of silently saving into the newly signed-in account. Overlapping refreshes are sequenced and temporary previews are released on refresh.
- [x] Commercial preview generation API requires a D1 customer session, stores generation requests per owner, prevents duplicate submissions with a per-account idempotency key and payload fingerprint, and enforces a three-generation UTC-day preview quota at the database layer.
- [x] Generation status and download endpoints resolve the local generation ID through the authenticated owner; provider task IDs are never accepted as authorization. A separate `RUNWAY_API_KEY_PREVIEW` repository secret can configure the isolated preview Worker without reusing production credentials.
- [x] Persistent generation history is available through an authenticated, owner-scoped API with a bounded result count; the Studio UI loads the signed-in account’s latest 20 jobs and refreshes after generation.
- [x] Completed history entries can download their MP4 through the authenticated owner-scoped endpoint; queued or processing entries can resume polling the existing task after a page reload without submitting a duplicate generation.
- [x] The live two-account acceptance script checks generation-history isolation in addition to product, project, private media, and session isolation.
- [x] Resumed cloud uploads compare ordered SHA-256 checksums against the remote image manifest before continuing.
- [x] Schema and integration checks cover both idempotency columns and unique per-account constraints.
- [x] Integration checks cover checksum-verified recovery of partially uploaded images.
- [x] Manual interrupted cloud save followed by resume; user confirmed that the project saved successfully.
- [x] Automated live API acceptance: replay product/project creation after a committed response, reject changed payloads with the same idempotency key, and verify no duplicate records.
- [x] Run live stale-project and stale-product edit acceptance tests against the deployed preview (the script verifies HTTP 409 and unchanged records).
- [x] Manual UI check (user-confirmed 2026-11-19): save the same local project to account A and account B; confirm each account has its own cloud copy and account-scoped save state.
- [x] Manual UI tenant-isolation check: the second account showed only its own cloud product and no products/projects from the first account.
- [x] Repeatable two-account API acceptance script added; checks own-account reads, cross-account product/project/asset denial, and server-side logout revocation without mutating saved records.
- [x] Preview deployment workflow can run the live two-account acceptance script when `PREVIEW_ACCOUNT_A_EMAIL`, `PREVIEW_ACCOUNT_A_PASSWORD`, `PREVIEW_ACCOUNT_B_EMAIL`, and `PREVIEW_ACCOUNT_B_PASSWORD` are configured as repository secrets; otherwise it explicitly skips the live test.
- [x] Local project cloud-sync checkpoints are now stored per customer account; legacy unscoped checkpoints are adopted only after the signed-in account proves ownership of the remote product/project.
- [x] PWA asset cache version and offline precache updated for account-scoped cloud-sync code; no Android package rebuild is required for this web-only preview change.
- [x] Automated direct cross-account API/asset-ID checks added, including attempts to attach another account's product to a new project; live execution remains dependent on the two test-account secrets.
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

### Preview deployment secrets

Configure these under **Repository → Settings → Secrets and variables → Actions**. Never commit their values or paste them into chat.

- `RUNWAY_API_KEY_PREVIEW`: dedicated Runway API key for the isolated preview Worker.
- `PREVIEW_ACCOUNT_A_EMAIL` and `PREVIEW_ACCOUNT_A_PASSWORD`: credentials for test account A.
- `PREVIEW_ACCOUNT_B_EMAIL` and `PREVIEW_ACCOUNT_B_PASSWORD`: credentials for test account B.

The deploy workflow automatically configures the preview provider key and runs the live two-account tenant-isolation acceptance script when all five secrets are present. A normal push to `feature/commercial-worker-preview` triggers the deployment workflow; the workflow remains isolated from production.

## Commercial model

- [x] Credit ledger design documented: account-scoped integer units, append-only audit ledger, idempotent reservation/capture/release, ambiguous-provider reconciliation, and rollout gates. Design only; no deductions or payment integration are enabled.
- [x] Preview D1 credit-ledger foundation migration added: account balances, immutable ledger entries, generation reservations, owner-scoped idempotency constraints, and non-negative integer checks. No accounts are funded and no generation route reads or mutates these tables; deployment health reports the schema as disabled until transaction logic and tests are complete.

- [ ] Define free and paid plan limits, credit pricing, and generation cost assumptions.
- [ ] Implement server-authoritative credit reservation, settlement, and refund flows.
- [ ] Add generation-job idempotency and provider timeout reconciliation before enabling customer charges.
- [ ] Select payment provider and implement verified webhook processing.
- [ ] Add customer-facing billing, invoices, cancellation, and subscription management.
- [ ] Complete legal, VAT, consumer-rights, and privacy review for launch markets.

## Android integration

- [x] Existing Android wrapper project identified.
- [x] Android Gradle configuration has separate production and preview flavors; the preview package has its own application ID and installs alongside the existing app.
- [x] Android preview flavor targets the commercial branch Pages host and permits only that exact host for in-WebView navigation; unrelated links open outside the WebView.
- [x] Existing production flavor retains its current WebView host and package identity.
- [x] Dedicated GitHub Actions workflow added to build and retain an isolated preview APK artifact without publishing it.
- [x] Isolated preview APK built successfully by CI and uploaded as a short-lived test artifact; it does not replace the installed production app.
- [x] Existing production-flavor debug APK build also passes CI and retains the original application ID; no production APK has been installed or published by this workflow.
- [x] Update Android WebView host allowlist and remote app URL deliberately in the isolated preview flavor.
- [ ] Verify cloud login, upload, save, retry, restore, and logout inside Android WebView.
- [ ] Verify WebView file chooser, navigation, offline behavior, and session persistence.
- [x] Documented update boundary: remote web code updates do not require an APK rebuild; native wrapper, package, permissions, or SDK changes do.
- [ ] Confirm which changes can ship as web updates and which require a new Android package on the installed device.
- [ ] Do not release a new Android build until preview acceptance and production cutover are explicitly approved.

- [ ] Implement and test video-to-video generation from a user-supplied source clip; the Preview UI currently marks this input as unavailable.

## Current boundary

All work in this checklist is limited to `feature/commercial-worker-preview` and its isolated preview Worker. The production branch, production Worker, and published Android application must remain unchanged until explicitly approved.
