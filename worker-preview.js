// Isolated infrastructure smoke-test Worker for PRODUCT STUDIO AI.
// This endpoint intentionally exposes no customer data and does not call Runway.
const CORS = {
  "Access-Control-Allow-Origin": "https://feature-social-export-preset.product-studio-ai-pwa.pages.dev",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store",
  "Vary": "Origin"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
    const url = new URL(request.url);
    if (request.method !== "GET" || url.pathname !== "/api/health") {
      return json({ error: "Not found" }, 404);
    }

    if (!env.DB || !env.MEDIA) {
      return json({ ok: false, error: "Preview storage bindings are missing." }, 503);
    }

    try {
      const db = await env.DB.prepare("SELECT 1 AS ok").first();
      const objects = await env.MEDIA.list({ limit: 1 });
      return json({
        ok: db?.ok === 1 && Array.isArray(objects?.objects),
        service: "PRODUCT STUDIO AI commercial preview",
        storage: {
          d1: db?.ok === 1,
          r2: Array.isArray(objects?.objects)
        }
      });
    } catch {
      return json({ ok: false, error: "Preview storage health check failed." }, 503);
    }
  }
};
