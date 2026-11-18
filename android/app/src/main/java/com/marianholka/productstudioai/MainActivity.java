package com.marianholka.productstudioai;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.view.View;
import android.view.Window;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceError;
import android.widget.FrameLayout;
import android.widget.ProgressBar;
import android.view.Gravity;

public class MainActivity extends Activity {
    private WebView webView;

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Window w = getWindow();
        w.setStatusBarColor(Color.rgb(8, 8, 8));
        w.setNavigationBarColor(Color.rgb(8, 8, 8));
        w.getDecorView().setSystemUiVisibility(0);

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(8, 8, 8));
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(8, 8, 8));
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setLoadWithOverviewMode(true);
        s.setUseWideViewPort(true);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        webView.setWebChromeClient(new WebChromeClient());
        webView.setWebViewClient(new WebViewClient() {
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                String host = request.getUrl().getHost();
                return host != null && !host.equals("product-studio-ai-pwa.pages.dev");
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);
        webView.loadUrl("https://product-studio-ai-pwa.pages.dev/?native=1&app=android-v2");
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
