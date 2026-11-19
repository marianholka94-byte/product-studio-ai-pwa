# Commercial preview Worker

This is an isolated preview environment. It does not replace or modify the existing production Worker and does not invoke paid video-generation APIs.

## Bound resources

- Worker: `product-studio-ai-commercial-preview`
- D1: `product-studio-ai-db-preview`
- R2: `product-studio-ai-media-preview`
- D1 binding: `DB`
- R2 binding: `MEDIA`

## Current preview API

- `GET /api/health`: harmless D1 and R2 connectivity check.
- `POST /api/auth/register`: creates a preview user; password must be 12–128 characters.
- `POST /api/auth/login`: verifies the password and issues a random 30-day bearer session.
- `GET /api/auth/me`: returns the authenticated user's basic profile.
- `POST /api/auth/logout`: revokes the current session.

## Account-scoped cloud library API

All library routes require `Authorization: Bearer <session-token>`. The Worker derives the owner from the session; it never accepts a client-supplied `user_id`.

- `GET /api/products` and `GET /api/products/:id`: list or read the signed-in user's products.
- `POST /api/products`: create a product from `{ "name": "...", "description": "..." }`.
- `GET /api/products/:id/images`: list the signed-in user's private product image metadata.
- `POST /api/products/:id/images`: upload one JPG, PNG or WebP image as the raw request body with its matching `Content-Type`; maximum 10 MB per image and five images per product. MIME type and file signature are checked before storage, and D1 independently enforces the five-image limit. The first image becomes primary.
- `GET /api/assets/:id`: stream an image only after checking that its D1 asset record belongs to the signed-in user.
- `PATCH /api/products/:id`: update the name and/or description.
- `DELETE /api/products/:id`: archive the product; it does not physically erase linked history.
- `GET /api/projects` and `GET /api/projects/:id`: list or read the signed-in user's projects.
- `POST /api/projects`: create a project from `{ "name": "...", "productId": null, "prompt": "...", "settings": {}, "exportPreset": null }`.
- `PATCH /api/projects/:id`: update project metadata and settings.
- `DELETE /api/projects/:id`: archive the project and preserve its history.

Lists are capped at 100 records. Product names are capped at 120 characters, descriptions at 2,000, prompts at 8,000, and serialized settings at 12,000 characters. Product image bytes can now be uploaded to private R2 and retrieved through owner-checked routes. The current browser library is still local-only: automatic migration of existing IndexedDB products/projects and cross-device sync in the PWA interface are not yet connected. Project image/video uploads are also not yet implemented.

Passwords are stored as PBKDF2-SHA256 hashes (100,000 iterations, the current Cloudflare Workers Web Crypto limit); session bearer tokens are stored only as SHA-256 hashes. This is preview authentication only; production should use a managed identity provider and a separately reviewed password policy. Login attempts are throttled per hashed IP/email pair: five failed attempts trigger a 15-minute block. Request JSON is size-limited while streaming, even when the client omits Content-Length. This is an initial preview authentication layer, not yet production-ready: email verification, abuse/rate limiting, password reset, account deletion, and a full privacy/security review remain required before public launch.

## Database migrations

The preview migration workflow applies pending files in `migrations/` to the preview D1 database only. It requires GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Preview registration is closed by default and requires the Worker secret `PREVIEW_SIGNUP_CODE`; clients must send it as `inviteCode` during registration. Configure a long random value in the preview Worker only. Never commit API tokens, invite codes or passwords.

## Test page

Once the Cloudflare Pages branch preview finishes building, open:
`https://feature-commercial-worker-pr.product-studio-ai-pwa.pages.dev/commercial-preview.html`

The page uses the isolated preview Worker and keeps its session token in tab-scoped session storage. Account registration will remain disabled until the owner explicitly sets the `PREVIEW_SIGNUP_CODE` Worker secret.

## Deployment and safety

The preview Worker deploy workflow is separate from the production Worker. The existing production Worker and Android app are intentionally untouched.
