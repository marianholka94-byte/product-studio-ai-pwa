package com.marianholka.productstudioai;

import android.app.Activity;
import android.os.Bundle;
import android.graphics.Color;
import android.graphics.Typeface;
import android.view.View;
import android.view.Window;
import android.view.Gravity;
import android.view.animation.AccelerateDecelerateInterpolator;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.widget.FrameLayout;
import android.widget.TextView;

public class MainActivity extends Activity {
    private WebView webView;
    private FrameLayout splashOverlay;
    private boolean splashDismissed = false;

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
            @Override public void onPageFinished(WebView view, String url) {
                dismissSplash();
            }
        });
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));

        // Native splash is drawn immediately, before WebView starts rendering,
        // so the studio screen can never flash briefly before the intro.
        splashOverlay = new FrameLayout(this);
        splashOverlay.setBackgroundColor(Color.rgb(8, 8, 8));
        TextView brand = new TextView(this);
        brand.setText("PRODUCT\nSTUDIO AI");
        brand.setTextColor(Color.rgb(224, 184, 105));
        brand.setTextSize(25);
        brand.setTypeface(Typeface.create("sans-serif", Typeface.BOLD));
        brand.setLetterSpacing(0.16f);
        brand.setGravity(Gravity.CENTER);
        brand.setLineSpacing(8f, 1f);
        FrameLayout.LayoutParams brandParams = new FrameLayout.LayoutParams(-1, -2, Gravity.CENTER);
        brandParams.leftMargin = 28;
        brandParams.rightMargin = 28;
        splashOverlay.addView(brand, brandParams);
        root.addView(splashOverlay, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        brand.setAlpha(0f);
        brand.setScaleX(0.94f);
        brand.setScaleY(0.94f);
        brand.animate().alpha(1f).scaleX(1f).scaleY(1f).setDuration(650)
            .setInterpolator(new AccelerateDecelerateInterpolator()).start();

        webView.loadUrl("https://product-studio-ai-pwa.pages.dev/?native=1&app=android-v3");
    }

    private void dismissSplash() {
        if (splashDismissed || splashOverlay == null) return;
        splashDismissed = true;
        splashOverlay.animate().alpha(0f).setDuration(280).withEndAction(() -> {
            if (splashOverlay != null) {
                View parent = (View) splashOverlay.getParent();
                if (parent instanceof FrameLayout) ((FrameLayout) parent).removeView(splashOverlay);
                splashOverlay = null;
            }
        }).start();
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
