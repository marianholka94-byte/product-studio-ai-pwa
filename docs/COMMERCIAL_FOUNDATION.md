# Commercial foundation – implementation notes

## Current architecture and gap
The current app is a single shared-password prototype. The Worker signs 30-day sessions with the shared `APP_PASSWORD`; it does not identify an individual customer. Projects and products are stored in browser IndexedDB, so they do not synchronize across devices and are not backed up in a customer account. The Android wrapper loads a fixed preview hostname. This is suitable for private testing only, not a paid multi-customer service.

## Target architecture
- **Identity:** use a managed identity provider (OIDC/OAuth) or Cloudflare Access-compatible identity flow. The Worker must validate issuer, audience, signature, expiry and subject. Never accept a user ID supplied by the browser as proof of identity.
- **D1:** store user profiles, project/product metadata, generation records, subscriptions and an append-only credit ledger. Apply `migrations/0001_commercial_foundation.sql`.
- **R2:** store uploaded product images, source clips, generated MP4 files and thumbnails in private buckets. Keep object keys and metadata in D1. Issue short-lived, user-scoped upload/download URLs; do not make the bucket public.
- **Worker:** resolve the authenticated subject to one internal user ID on every request. Every query touching customer data must include that user ID. Validate ownership before reading, updating, deleting or attaching any project, product, asset or generation.
- **Billing:** accept payment-provider webhooks only after signature verification; deduplicate by provider event ID. Credit changes are append-only ledger entries and must use idempotency keys. Reserve credits before generation, settle actual cost on success, and release/refund reservations on failure.
- **Generation:** store provider task IDs and status server-side. The browser polls the app Worker, not the provider directly. Never expose provider API keys.
- **Operations:** add rate limits, per-plan quotas, request IDs, audit logs, retention/deletion rules and a customer data export path before public launch.

## D1 schema
The SQL migration is deliberately additive and does not change the live Worker. It includes:
- users and revocable hashed sessions;
- products, projects, media metadata and product-image ordering;
- generation task tracking;
- immutable credit ledger with database-level UPDATE/DELETE protection;
- plans, subscriptions, payment webhook idempotency and audit log.

The migration includes composite ownership foreign keys so a row belonging to one user cannot be linked to another user's product, project, asset or generation, including a product's main image. Product-image records also enforce at most one primary image per product. Credit-ledger rows reject UPDATE and DELETE operations at database level; users with financial history must be anonymized/soft-deleted rather than hard-deleted so financial reconciliation remains intact. Parent records with dependent tenant-owned rows use restrictive delete rules consistently: dependent assets, projects and generation/credit history cannot be silently detached or cascaded away. Application delete flows must explicitly detach or remove eligible dependent rows in a user-scoped transaction before deleting a parent. The CI workflow verifies schema creation, cross-user link rejection, immutable ledger behavior, the single-primary-image rule, and protection against deleting products, projects or generations that still have retained dependent records.

The migration is not applied yet. It requires a D1 database and a Worker binding, neither of which is currently provisioned by the connected tools. Do not deploy Worker code that references `env.DB` until the D1 binding exists.

## Required Cloudflare resources and one-time setup
1. Create a D1 database for the project and note its database ID.
2. Create a private R2 bucket for customer media.
3. Add the D1 binding (for example `DB`) and R2 binding (for example `MEDIA`) to the Worker.
4. Apply the SQL migration to the new D1 database.
5. Configure identity-provider credentials and callback/allowed origins as Worker secrets/variables.
6. Configure GitHub Actions secrets for Cloudflare deployment if not already present: `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.

These are infrastructure changes and must be completed before enabling customer registration or cloud project storage. Existing production must remain unchanged until the new branch passes preview testing.

## Release safety
- Keep `main` and the stable Android app unchanged.
- Do not enable paid generation tests without explicit approval.
- Do not merge the existing export-preset PR or this foundation PR automatically.
- Android builds currently use a debug signing configuration and are not Play Store release artifacts.
