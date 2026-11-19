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

Passwords are stored as PBKDF2-SHA256 hashes (310,000 iterations); session bearer tokens are stored only as SHA-256 hashes. Login attempts are throttled per hashed IP/email pair: five failed attempts trigger a 15-minute block. Request JSON is size-limited while streaming, even when the client omits Content-Length. This is an initial preview authentication layer, not yet production-ready: email verification, abuse/rate limiting, password reset, account deletion, and a full privacy/security review remain required before public launch.

## Database migrations

The preview migration workflow applies pending files in `migrations/` to the preview D1 database only. It requires GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Preview registration is closed by default and requires the Worker secret `PREVIEW_SIGNUP_CODE`; clients must send it as `inviteCode` during registration. Configure a long random value in the preview Worker only. Never commit API tokens, invite codes or passwords.

## Deployment and safety

The preview Worker deploy workflow is separate from the production Worker. The existing production Worker and Android app are intentionally untouched.
