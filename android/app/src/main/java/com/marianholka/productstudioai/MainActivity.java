package com.marianholka.productstudioai;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.view.Gravity;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;

public class MainActivity extends Activity {
    private FrameLayout root;
    private FrameLayout splashOverlay;
    private WebView webView;
    private boolean splashRemoved = false;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 8, 14));
        w.setNavigationBarColor(Color.rgb(8, 8, 14));

        // Draw the first Android frame immediately. Do not construct WebView
        // before setContentView: WebView provider startup can hold Android's
        // system splash screen on some devices.
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(8, 8, 14));
        splashOverlay = new FrameLayout(this);
        splashOverlay.setBackgroundColor(Color.rgb(8, 8, 14));

        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.ic_launcher_foreground);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        int logoSize = (int)(getResources().getDisplayMetrics().widthPixels * 0.70f);
        splashOverlay.addView(logo, new FrameLayout.LayoutParams(logoSize, logoSize, Gravity.CENTER));
        root.addView(splashOverlay, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        logo.setAlpha(0f);
        logo.setScaleX(0.88f);
        logo.setScaleY(0.88f);
        logo.setRotation(-5f);
        logo.animate().alpha(1f).scaleX(1f).scaleY(1f).rotation(0f).setDuration(700)
            .setInterpolator(new AccelerateDecelerateInterpolator()).start();

        // Start WebView only after the native screen has been drawn.
        root.postDelayed(() -> createWebView(), 100);
        // Fail-safe: never keep the intro overlay indefinitely.
        root.postDelayed(() -> removeSplash(), 5000);
    }

    private void createWebView() {
        if (isFinishing() || webView != null) return;
        try {
            webView = new WebView(this);
            webView.setBackgroundColor(Color.WHITE);
            WebSettings s = webView.getSettings();
            s.setJavaScriptEnabled(true);
            s.setDomStorageEnabled(true);
            s.setDatabaseEnabled(true);
            s.setMediaPlaybackRequiresUserGesture(false);
            s.setLoadWithOverviewMode(true);
            s.setUseWideViewPort(true);
            s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
            s.setLoadsImagesAutomatically(true);
            webView.setWebChromeClient(new WebChromeClient());
            webView.setWebViewClient(new WebViewClient() {
                @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    String host = request.getUrl().getHost();
                    return host != null && !host.equals("product-studio-ai-pwa.pages.dev");
                }
                @Override public void onPageFinished(WebView view, String url) {
                    super.onPageFinished(view, url);
                    removeSplash();
                }
                @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (request.isForMainFrame()) {
                        view.loadData("<html><meta name='viewport' content='width=device-width, initial-scale=1'><body style='font-family:sans-serif;padding:24px;color:#222'><h2>Nepodarilo sa načítať PRODUCT STUDIO AI</h2><p>Skontroluj internetové pripojenie a skús to znova.</p><button onclick='location.reload()'>Skúsiť znova</button></body></html>", "text/html", "UTF-8");
                        removeSplash();
                    }
                }
            });
            // Insert below the logo overlay so the first visible frame is always the intro.
            root.addView(webView, 0, new FrameLayout.LayoutParams(-1, -1));
            webView.loadUrl("https://product-studio-ai-pwa.pages.dev/?native=1&app=android-v6");
        } catch (Throwable error) {
            showStartupError(error);
        }
    }

    private void removeSplash() {
        if (splashRemoved || splashOverlay == null) return;
        splashRemoved = true;
        FrameLayout overlay = splashOverlay;
        splashOverlay = null;
        overlay.animate().cancel();
        overlay.animate().alpha(0f).setDuration(220).withEndAction(() -> root.removeView(overlay)).start();
    }

    private void showStartupError(Throwable error) {
        TextView message = new TextView(this);
        message.setText("PRODUCT STUDIO AI sa nepodarilo spustiť.\n\n" + error.getClass().getSimpleName() + "\n\nSkontroluj aktualizáciu Android System WebView a skús aplikáciu znovu.");
        message.setTextColor(Color.WHITE);
        message.setTextSize(16);
        message.setGravity(Gravity.CENTER);
        message.setPadding(32, 32, 32, 32);
        root.addView(message, new FrameLayout.LayoutParams(-1, -1));
        removeSplash();
    }

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}