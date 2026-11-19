# Android preview build

The Android project has two application flavors:

- `production`: preserves the existing package ID and the current WebView host.
- `preview`: installs as `com.marianholka.productstudioai.preview` and loads the isolated commercial Pages preview.

Build the preview APK from this directory with:

```sh
gradle --no-daemon assemblePreviewDebug
```

The preview APK is a test build only. It is not signed for store release and is not published automatically. It can be installed alongside the existing production app.

Web UI changes can be delivered by the preview Pages deployment without rebuilding the APK. Changes to the Android wrapper itself require a new preview APK.
