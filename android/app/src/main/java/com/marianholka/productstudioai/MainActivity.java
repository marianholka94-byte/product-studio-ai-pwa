package com.marianholka.productstudioai;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.graphics.Color;
import android.view.Gravity;
import android.view.Window;
import android.view.View;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.widget.TextView;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.os.Handler;
import android.os.Looper;

public class MainActivity extends Activity {
    private static final int FILE_CHOOSER_REQUEST = 4107;
    private WebView webView;
    private TextView networkErrorView;
    private ValueCallback<Uri[]> fileChooserCallback;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 8, 14));
        w.setNavigationBarColor(Color.rgb(8, 8, 14));

        // The preview flavor is isolated by package name and never replaces the installed production app.
        try {
            webView = new WebView(this);
            webView.setBackgroundColor(Color.rgb(11, 14, 19));
            WebSettings settings = webView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            settings.setDatabaseEnabled(true);
            settings.setMediaPlaybackRequiresUserGesture(false);
            settings.setLoadWithOverviewMode(true);
            settings.setUseWideViewPort(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            settings.setAllowFileAccess(false);
            settings.setLoadsImagesAutomatically(true);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                settings.setSafeBrowsingEnabled(true);
            }
            webView.setWebChromeClient(new WebChromeClient() {
                @Override
                public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                    if (fileChooserCallback != null) fileChooserCallback.onReceiveValue(null);
                    fileChooserCallback = callback;
                    Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                    String[] requestedTypes = params.getAcceptTypes();
                    java.util.ArrayList<String> mimeTypes = new java.util.ArrayList<>();
                    if (requestedTypes != null) {
                        for (String requestedType : requestedTypes) {
                            if (requestedType == null) continue;
                            String mimeType = requestedType.trim();
                            if (!mimeType.isEmpty() && mimeType.contains("/") && !mimeTypes.contains(mimeType)) {
                                mimeTypes.add(mimeType);
                            }
                        }
                    }
                    if (mimeTypes.isEmpty()) mimeTypes.add("image/*");
                    intent.setType(mimeTypes.size() == 1 ? mimeTypes.get(0) : "*/*");
                    if (mimeTypes.size() > 1) intent.putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes.toArray(new String[0]));
                    intent.putExtra(Intent.EXTRA_ALLOW_MULTIPLE, params.getMode() == WebChromeClient.FileChooserParams.MODE_OPEN_MULTIPLE);
                    try {
                        startActivityForResult(Intent.createChooser(intent, "Vybrať súbory"), FILE_CHOOSER_REQUEST);
                        return true;
                    } catch (Exception error) {
                        fileChooserCallback = null;
                        callback.onReceiveValue(null);
                        return false;
                    }
                }
            });
            webView.setWebViewClient(new WebViewClient() {
                @Override
                public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                    if (networkErrorView != null) networkErrorView.setVisibility(View.GONE);
                }
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    Uri uri = request.getUrl();
                    String scheme = uri.getScheme();
                    String host = uri.getHost();
                    if ("https".equalsIgnoreCase(scheme) && BuildConfig.WEB_APP_HOST.equalsIgnoreCase(host)) {
                        return false;
                    }
                    try {
                        startActivity(new Intent(Intent.ACTION_VIEW, uri));
                    } catch (Exception ignored) {
                        // Unsupported external links are safely left unopened.
                    }
                    return true;
                }
                @Override
                public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (request.isForMainFrame() && networkErrorView != null) {
                        networkErrorView.setVisibility(View.VISIBLE);
                    }
                }
            });
            FrameLayout root = new FrameLayout(this);
            root.setBackgroundColor(Color.rgb(11, 14, 19));
            // Android 15 (targetSdk 35) draws edge-to-edge by default. Reserve the
            // real system-navigation inset so the WebView's fixed bottom app bar
            // sits above Android's Back/Home/Recents buttons instead of underneath them.
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                root.setOnApplyWindowInsetsListener((view, insets) -> {
                    android.graphics.Insets navInsets = insets.getInsets(android.view.WindowInsets.Type.navigationBars());
                    view.setPadding(0, 0, 0, navInsets.bottom);
                    return insets;
                });
                root.requestApplyInsets();
            }
            root.addView(webView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
            networkErrorView = new TextView(this);
            networkErrorView.setText("Nepodarilo sa načítať PRODUCT STUDIO AI\n\nSkontroluj internetové pripojenie a ťukni sem pre opakovanie.");
            networkErrorView.setTextColor(Color.WHITE);
            networkErrorView.setTextSize(17);
            networkErrorView.setGravity(Gravity.CENTER);
            networkErrorView.setPadding(32, 32, 32, 32);
            networkErrorView.setBackgroundColor(Color.rgb(11, 14, 19));
            networkErrorView.setVisibility(View.GONE);
            networkErrorView.setOnClickListener(v -> webView.reload());
            root.addView(networkErrorView, new FrameLayout.LayoutParams(FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));

            // Restore the original branded startup artwork while the WebView loads.
            ImageView launchScreen = new ImageView(this);
            launchScreen.setImageResource(R.drawable.splash_brand_lockup);
            launchScreen.setScaleType(ImageView.ScaleType.FIT_CENTER);
            launchScreen.setBackgroundColor(Color.rgb(6, 20, 49));
            launchScreen.setPadding(24, 0, 24, 0);
            root.addView(launchScreen, new FrameLayout.LayoutParams(
                    FrameLayout.LayoutParams.MATCH_PARENT,
                    FrameLayout.LayoutParams.MATCH_PARENT));
            setContentView(root);
            new Handler(Looper.getMainLooper()).postDelayed(() -> {
                if (launchScreen.getParent() == root) root.removeView(launchScreen);
            }, 2200);
            if (savedInstanceState == null || webView.restoreState(savedInstanceState) == null) {
                webView.loadUrl(BuildConfig.WEB_APP_URL);
            }
        } catch (Throwable error) {
            TextView message = new TextView(this);
            message.setText("PRODUCT STUDIO AI sa nepodarilo spustiť.\n\n" + error.getClass().getSimpleName() + "\n\nSkontroluj aktualizáciu Android System WebView a skús aplikáciu znovu.");
            message.setTextColor(Color.WHITE);
            message.setTextSize(16);
            message.setGravity(Gravity.CENTER);
            message.setPadding(32, 32, 32, 32);
            setContentView(message);
        }
    }

    @Override protected void onSaveInstanceState(Bundle outState) {
        if (webView != null) webView.saveState(outState);
        super.onSaveInstanceState(outState);
    }

    @Override protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == FILE_CHOOSER_REQUEST && fileChooserCallback != null) {
            Uri[] results = null;
            if (resultCode == RESULT_OK && data != null) {
                if (data.getClipData() != null) {
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) results[i] = data.getClipData().getItemAt(i).getUri();
                } else if (data.getData() != null) {
                    results = new Uri[]{data.getData()};
                }
            }
            fileChooserCallback.onReceiveValue(results);
            fileChooserCallback = null;
        }
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (fileChooserCallback != null) {
            fileChooserCallback.onReceiveValue(null);
            fileChooserCallback = null;
        }
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}
