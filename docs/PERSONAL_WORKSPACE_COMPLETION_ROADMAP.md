# Personal Workspace Completion Roadmap

Status: active working plan for the owner's private day-to-day PRODUCT STUDIO AI workspace. This is not a public-launch checklist.

## Verified in the current isolated preview branch

### Studio and generation
- [x] Product photo input accepts 1–9 JPG, PNG, or WebP images (20 MB combined encoded-reference safety cap).
- [x] Source-video input accepts MP4/MOV files up to 90 MB (2–15 seconds); the Worker enforces the cap while streaming to private R2.
- [x] Product image ordering and primary-image selection are available.
- [x] Advertising controls include platform export presets, aspect ratio, visual style, camera motion, duration, model, resolution, lighting, and additional instructions.
- [x] Prompt creation and editing are integrated with the Studio project bridge.
- [x] Image-to-video generation is wired to the authenticated preview Worker.
- [x] Generation status polling, resumable history polling, owner-scoped history, and authenticated MP4 download are implemented.
- [ ] End-to-end generation must be manually verified in the Android preview app using the owner's provider configuration. Do not trigger a generation as part of automated checks.

### Local workspace
- [x] Local projects and products are stored in IndexedDB.
- [x] Project records preserve product settings, prompt, and original image bytes.
- [x] Local project open, duplicate, delete, and save flows are present.
- [x] Local product library supports image management and creating a project from a product.
- [x] Library navigation refreshes local project/product lists only when opening the Projects screen, avoiding redundant reads on every tab switch.
- [x] Local product thumbnail object URLs are revoked before re-rendering to prevent memory growth during repeated library refreshes.
- [x] IndexedDB open failures and blocked upgrades clear the cached open promise so a later retry can recover.
- [x] The Android preview app has user-confirmed local project saving.

### Cloud workspace
- [x] Separate cloud account login and logout are implemented.
- [x] Cloud products and projects are account-scoped by the Worker.
- [x] Cloud product images are uploaded to private R2 storage and served through authenticated endpoints.
- [x] Cloud products can be imported into Studio without changing the cloud original.
- [x] Cloud library is contained inside the Projects screen instead of appearing outside the app's bottom-navigation views.
- [x] Settings no longer expose the retired legacy shared-password backend; they direct account management to the current cloud-library session.
- [x] Account overview wording now describes a private cloud workspace and clearly labels the three-per-day preview safety limit; deferred credit billing is not presented as active.
- [x] Cloud library copy describes the owner's private working space rather than a commercial customer test environment.
- [x] Android file picker now respects the file input's accepted MIME types and multiple-selection mode instead of always offering every image/video type.
- [x] PWA static cache version and script asset query versions are advanced together so web releases invalidate stale cached app assets without requiring a new Android APK.
- [x] Cloud-session race protection is included in the web bundle, with the Service Worker cache and script query versions advanced together so the fix reaches existing preview installs without reinstalling the APK.
- [x] Local project and product storage now translates IndexedDB quota and structured-clone failures into actionable Slovak messages instead of generic transaction errors.
- [x] Local project thumbnails and product-manager previews release temporary object URLs when their lists rerender or the manager closes, preventing repeated editing from accumulating image memory.
- [x] Local projects can be explicitly saved to cloud with per-account sync checkpoints and retry-safe creation.
- [x] Cloud project metadata supports edits, archive/restore, and conflict recovery choices.
- [x] User-confirmed: the same local project can be saved to two separate accounts, each with its own cloud copy.
- [x] User-confirmed: cloud save and local save both work in the Android preview app.
- [ ] Complete Android-specific checks for upload, interrupted-save retry/resume, restore, logout, file chooser, offline/reconnect, and session persistence.

### Android and PWA delivery
- [x] Isolated Android preview flavor installs alongside the existing production app.
- [x] Preview APK and production-flavor debug APK have both built successfully in CI.
- [x] Preview Android wrapper loads the commercial preview branch.
- [x] PWA Service Worker uses network-first navigation and avoids caching authenticated API responses.
- [x] Native WebView intentionally skips browser Service Worker registration; the WebView loads the remote web app from the preview host.
- [x] Android preview WebView saves and restores page state across Activity recreation and follows Activity pause/resume lifecycle callbacks.
- [x] Main-frame network failures show an in-app retry overlay without replacing the current WebView document or navigation history.
- [ ] Validate that the preview app always receives the latest deployed web bundle after a refresh/relaunch.
- [ ] Complete Android file picker, external-link handling, back navigation, connectivity recovery, and session lifecycle tests.

## Recent reliability hardening

- [x] Guard cloud-session restoration with the starting token and account epoch so a late `/api/auth/me` response cannot overwrite a newly selected account or clear a newer session after a delayed failure.

## Confirmed gaps and limitations

- [ ] Source-video-to-video generation is not implemented. The current UI input is disabled; the client function intentionally throws an explanatory error, and the preview Worker has no matching route. Do not treat this as a working feature.
- [x] Preview generation is limited to 3 requests per account per UTC day; the deployed Worker health endpoint and live acceptance checks confirm the configured safety limit. This is not a paid subscription/credit system.
- [x] Preview wallet balance/history and owner-only idempotent manual-grant endpoint are implemented. Manual grants remain disabled until the owner email is configured as a Worker secret.
- [x] Preview credits are not connected to BytePlus generation or a payment provider and have no cash value; no customer charges, purchases, or subscriptions are enabled.
- [ ] Public registration remains invite-gated. This is acceptable for the private-workspace phase.
- [ ] The generator's legacy session and cloud-library account session are separate. Do not conflate or silently migrate them.
- [ ] The current preview Android package uses a feature-branch Pages host. It is a test build, not a permanent production distribution configuration.

## Priority order

1. **Personal workflow reliability:** test and fix project save/open/duplicate/delete, product management, prompt persistence, and local image-byte persistence across app restarts.
2. **Cloud reliability:** finish Android media upload, retry/resume, restore, logout, expired-session behavior, and two-account isolation acceptance.
3. **Generation reliability:** verify image-to-video generation only when the owner chooses to spend provider credits; improve recovery when the app is closed during an active job.
4. **Android/PWA quality:** verify refresh/update behavior, file chooser, back navigation, offline messaging, and layout on the actual phone.
5. **Workspace polish:** remove confusing public-customer/billing placeholders from the owner's daily workflow without removing the underlying isolated cloud foundations.
6. **Later, only when requested:** implement source-video-to-video generation and public-customer features.

## Release safety

- Keep all work on `feature/commercial-worker-preview` and its isolated Worker/Pages resources.
- Do not merge to the production branch, change the production Worker, replace the installed production app, or publish an APK without explicit approval.
- Do not trigger provider generation, purchase credits, or incur usage charges during automated tests.
- Do not delete or migrate existing local IndexedDB records.
