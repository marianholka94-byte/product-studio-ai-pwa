# Commercial preview Worker

This is an isolated infrastructure smoke test. It does not replace or modify the existing production Worker and does not invoke paid generation APIs.

## Bound resources

- Worker: `product-studio-ai-commercial-preview`
- D1: `product-studio-ai-db-preview`
- R2: `product-studio-ai-media-preview`
- D1 binding: `DB`
- R2 binding: `MEDIA`

The only application route is `GET /api/health`. It performs a harmless `SELECT 1` against D1 and a one-object R2 list request. It returns only whether each binding is reachable; it does not expose stored data.

## Deployment

The GitHub Actions workflow `Deploy commercial preview Worker` is manual-only. Run it only after the repository secret `CLOUDFLARE_API_TOKEN` has permissions to edit Workers scripts, edit D1, and edit R2 storage, and `CLOUDFLARE_ACCOUNT_ID` is configured.

The existing production Worker and the Android app are intentionally untouched.
