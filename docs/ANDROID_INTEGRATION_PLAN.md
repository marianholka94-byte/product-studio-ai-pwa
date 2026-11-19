# Android Integration Plan

## Current implementation facts

- The Android project is a native Android application with a WebView wrapper (not a bundled Capacitor web asset).
- The wrapper currently loads a fixed Cloudflare Pages host and passes `native=1`.
- The WebView currently allows navigation only when the requested host matches the fixed Pages host; other hosts are handed off to Android.
- The web app skips service-worker registration when `native=1` is present.
- The Android wrapper has JavaScript, DOM storage, a multi-file image/video picker, back navigation, and a basic main-frame network error view.
- The package currently declares versionCode 4 and versionName 1.3.0.
- The Android manifest disables cleartext traffic and requests Internet permission.

## Intended integration

1. Keep the Android wrapper thin. The commercial web application, account state, cloud projects, products, and generation UI should remain server-delivered.
2. Use one stable, owned HTTPS app domain as the Android WebView entry point. Do not ship a temporary feature-branch Pages URL as the permanent app host.
3. Use a narrowly defined allowlist for first-party app and API hosts. Open unrelated external links outside the WebView.
4. Keep API authentication server-side and do not put secrets or invite codes in Android resources, JavaScript bundles, or query parameters.
5. Verify Android WebView storage behavior for session persistence and logout; do not assume browser Chrome storage and app WebView storage are shared.
6. Keep native-only changes separate from remote web releases. UI and JavaScript changes can be delivered remotely once the stable host is configured; changes to the native wrapper, permissions, package identity, or native SDKs require a new Android package.
7. Test file selection, multiple images, video selection, back navigation, external links, connectivity loss/recovery, authentication, private image viewing, cloud save/retry, project restore, and logout on a real Android device.

## Release gates

- [ ] Select and configure the permanent app hostname and Pages/Worker routing.
- [ ] Update the WebView entry URL and first-party host allowlist on a dedicated Android integration branch.
- [ ] Build and install a test APK without publishing it.
- [ ] Complete the Android end-to-end test matrix.
- [ ] Review privacy, account deletion, billing, and production authentication.
- [ ] Obtain explicit approval before production cutover or Android release.

## Update behavior

A WebView wrapper can load updated web code from its remote host without reinstalling the APK. This only works safely when the app points to a stable host whose deployed content is backward-compatible with the installed wrapper. Native wrapper changes still require a new APK/AAB release. A staged rollout and a rollback path are required before changing the production host.
