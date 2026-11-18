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
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout splashOverlay;
    private FrameLayout root;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 8, 14));
        w.setNavigationBarColor(Color.rgb(8, 8, 14));
        w.getDecorView().setSystemUiVisibility(0);

        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(8, 8, 14));
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
                // The splash timeout is independent of WebView callbacks.
            }
            @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                super.onReceivedError(view, request, error);
                if (request.isForMainFrame()) {
                    view.loadData("<html><body style='font-family:sans-serif;padding:24px;color:#222'><h2>Nepodarilo sa načítať PRODUCT STUDIO AI</h2><p>Skontroluj internetové pripojenie a aplikáciu znovu otvor.</p><button onclick='location.reload()'>Skúsiť znova</button></body></html>", "text/html", "UTF-8");
                }
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));

        splashOverlay = new FrameLayout(this);
        splashOverlay.setBackgroundColor(Color.rgb(8, 8, 14));
        ImageView logo = new ImageView(this);
        logo.setImageResource(R.drawable.ic_launcher_foreground);
        logo.setScaleType(ImageView.ScaleType.FIT_CENTER);
        int logoSize = (int)(getResources().getDisplayMetrics().widthPixels * 0.70f);
        FrameLayout.LayoutParams logoParams = new FrameLayout.LayoutParams(logoSize, logoSize, Gravity.CENTER);
        splashOverlay.addView(logo, logoParams);
        root.addView(splashOverlay, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        logo.setAlpha(0f);
        logo.setScaleX(0.88f);
        logo.setScaleY(0.88f);
        logo.setRotation(-5f);
        logo.animate().alpha(1f).scaleX(1f).scaleY(1f).rotation(0f).setDuration(650)
            .setInterpolator(new AccelerateDecelerateInterpolator()).start();

        // Crucial: schedule on the attached root, not on the overlay. Always uncover
        // the WebView after a short fixed intro, regardless of page callbacks.
        root.postDelayed(() -> {
            if (splashOverlay != null) {
                splashOverlay.animate().cancel();
                splashOverlay.setVisibility(View.GONE);
                root.removeView(splashOverlay);
                splashOverlay = null;
            }
        }, 1700);

        webView.loadUrl("https://product-studio-ai-pwa.pages.dev/?native=1&app=android-v5");
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