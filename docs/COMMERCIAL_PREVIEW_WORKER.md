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

Passwords are stored as PBKDF2-SHA256 hashes (310,000 iterations); session bearer tokens are stored only as SHA-256 hashes. This is an initial preview authentication layer, not yet production-ready: email verification, abuse/rate limiting, password reset, account deletion, and a full privacy/security review remain required before public launch.

## Database migrations

The preview migration workflow applies pending files in `migrations/` to the preview D1 database only. It requires GitHub repository secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`. Never commit API tokens or passwords.

## Deployment and safety

The preview Worker deploy workflow is separate from the production Worker. The existing production Worker and Android app are intentionally untouched.
