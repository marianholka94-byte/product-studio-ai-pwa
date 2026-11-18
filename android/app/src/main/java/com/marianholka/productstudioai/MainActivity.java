package com.marianholka.productstudioai;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.Gravity;
import android.view.Window;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;

public class MainActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 8, 14));
        w.setNavigationBarColor(Color.rgb(8, 8, 14));

        // No custom splash screen or intro animation. Open the existing web app directly.
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
                @Override public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
                    super.onReceivedError(view, request, error);
                    if (request.isForMainFrame()) {
                        view.loadData("<html><meta name='viewport' content='width=device-width, initial-scale=1'><body style='font-family:sans-serif;padding:24px;color:#222'><h2>Nepodarilo sa načítať PRODUCT STUDIO AI</h2><p>Skontroluj internetové pripojenie a skús to znova.</p><button onclick='location.reload()'>Skúsiť znova</button></body></html>", "text/html", "UTF-8");
                    }
                }
            });
            setContentView(webView);
            webView.loadUrl("https://product-studio-ai-pwa.pages.dev/?native=1&app=android-v7");
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

    @Override public void onBackPressed() {
        if (webView != null && webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override protected void onDestroy() {
        if (webView != null) { webView.destroy(); webView = null; }
        super.onDestroy();
    }
}