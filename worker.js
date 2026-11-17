const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-App-Password",
  "Access-Control-Allow-Credentials": "false",
  "Access-Control-Max-Age": "86400",
  "Vary": "Origin"
};

function reply(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...CORS }
  });
}

function runwayHeaders(env) {
  return {
    "Authorization": `Bearer ${env.RUNWAY_API_KEY}`,
    "X-Runway-Version": "2024-11-06",
    "Content-Type": "application/json"
  };
}

// Only the six aspect/resolution combinations exposed by this app are accepted.
// All six values are in the model-specific Seedance 2.0 Mini SDK ratio list (12 total).
const ALLOWED_RATIOS = new Set([
  // 480p: landscape, square, portrait
  "864:496", "640:640", "496:864",
  // 720p: landscape, square, portrait
  "1280:720", "960:960", "720:1280"
]);

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    if (origin && ![
      "https://product-studio-ai-frontend.marianholka94.workers.dev",
      "https://product-studio-ai-pwa.pages.dev"
    ].includes(origin)) {
      return reply({ error: "Tento pôvod požiadavky nie je povolený." }, 403);
    }
    if (!env.RUNWAY_API_KEY || !env.APP_PASSWORD) {
      return reply({ error: "Backend nie je nakonfigurovaný. Skontroluj tajné premenné RUNWAY_API_KEY a APP_PASSWORD." }, 503);
    }
    if (request.headers.get("X-App-Password") !== env.APP_PASSWORD) {
      return reply({ error: "Nesprávny súkromný prístupový kód." }, 401);
    }

    try {
      if (request.method === "GET" && url.pathname === "/api/health") {
        return reply({ ok: true, service: "PRODUCT STUDIO AI", provider: "Runway Dev", model: "seedance2_mini" });
      }

      if (request.method === "POST" && url.pathname === "/api/generate") {
        const contentLength = Number(request.headers.get("Content-Length") || 0);
        if (contentLength > 22 * 1024 * 1024) {
          return reply({ error: "Súhrnná veľkosť fotografií je príliš veľká. Použi menšie obrázky." }, 413);
        }
        let body;
        try { body = await request.json(); }
        catch { return reply({ error: "Požiadavka neobsahuje platné JSON dáta." }, 400); }

        const images = Array.isArray(body.images) ? body.images : (typeof body.image === "string" ? [body.image] : []);
        if (images.length < 1 || images.length > 5) {
          return reply({ error: "Nahraj 1 až 5 fotografií produktu." }, 400);
        }
        for (const image of images) {
          if (typeof image !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
            return reply({ error: "Jedna z fotografií nemá podporovaný formát. Použi JPG, PNG alebo WebP." }, 400);
          }
          if (image.length > 5 * 1024 * 1024) {
            return reply({ error: "Každá fotografia musí mať menej než 5 MB." }, 413);
          }
        }
        if (images.reduce((total, image) => total + image.length, 0) > 20 * 1024 * 1024) {
          return reply({ error: "Súhrnná veľkosť fotografií prekračuje limit 20 MB." }, 413);
        }
        // Conservative API-reference limit (UTF-16 code units). The app builder
        // uses the same JavaScript length semantics and never exceeds 1,000.
        if (typeof body.prompt !== "string" || !body.prompt.trim() || body.prompt.length > 1000) {
          return reply({ error: "Text zadania musí mať 1 až 1 000 znakov." }, 400);
        }
        const duration = Number(body.duration);
        if (!Number.isInteger(duration) || duration < 4 || duration > 15) {
          return reply({ error: "Seedance 2.0 Mini podporuje dĺžku 4 až 15 sekúnd." }, 400);
        }
        if (!ALLOWED_RATIOS.has(body.ratio)) {
          return reply({ error: "Nepodporovaný pomer strán alebo rozlíšenie pre Seedance 2.0 Mini." }, 400);
        }

        const payload = {
          model: "seedance2_mini",
          promptImage: images.length === 1 ? images[0] : images.map(uri => ({ uri })),
          promptText: body.prompt.trim(),
          ratio: body.ratio,
          duration,
          audio: false,
          bitrate: "standard"
        };

        const upstream = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
          method: "POST",
          headers: runwayHeaders(env),
          body: JSON.stringify(payload)
        });
        const result = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const message = result.error?.message || result.error || result.message || `Runway API vrátilo HTTP ${upstream.status}.`;
          return reply({ error: String(message), providerStatus: upstream.status }, upstream.status);
        }
        if (!result.id) return reply({ error: "Runway požiadavku prijal, ale nevrátil ID úlohy.", providerResponse: result }, 502);
        return reply({ id: result.id, status: result.status || "PENDING", estimatedCost: result.estimatedCost || null });
      }

      const downloadMatch = url.pathname.match(/^\/api\/download\/([0-9a-f-]{36})$/i);
      if (request.method === "GET" && downloadMatch) {
        const taskResponse = await fetch(`https://api.dev.runwayml.com/v1/tasks/${downloadMatch[1]}`, {
          method: "GET", headers: runwayHeaders(env)
        });
        const task = await taskResponse.json().catch(() => ({}));
        if (!taskResponse.ok) {
          const message = task.error?.message || task.error || task.message || `Runway API vrátilo HTTP ${taskResponse.status}.`;
          return reply({ error: String(message), providerStatus: taskResponse.status }, taskResponse.status);
        }
        if (task.status !== "SUCCEEDED" || !Array.isArray(task.output) || typeof task.output[0] !== "string") {
          return reply({ error: "Video ešte nie je pripravené na stiahnutie." }, 409);
        }
        const videoUrl = task.output[0];
        if (!videoUrl.startsWith("https://")) return reply({ error: "Runway vrátil neplatnú adresu videa." }, 502);
        const videoResponse = await fetch(videoUrl);
        if (!videoResponse.ok || !videoResponse.body) return reply({ error: "Hotové video sa nepodarilo stiahnuť z Runway." }, 502);
        return new Response(videoResponse.body, {
          status: 200,
          headers: {
            ...CORS,
            "Content-Type": videoResponse.headers.get("Content-Type") || "video/mp4",
            "Content-Disposition": 'attachment; filename="product-studio-ai.mp4"',
            "Cache-Control": "no-store"
          }
        });
      }

      const match = url.pathname.match(/^\/api\/status\/([0-9a-f-]{36})$/i);
      if (request.method === "GET" && match) {
        const upstream = await fetch(`https://api.dev.runwayml.com/v1/tasks/${match[1]}`, {
          method: "GET",
          headers: runwayHeaders(env)
        });
        const result = await upstream.json().catch(() => ({}));
        if (!upstream.ok) {
          const message = result.error?.message || result.error || result.message || `Runway API vrátilo HTTP ${upstream.status}.`;
          return reply({ error: String(message), providerStatus: upstream.status }, upstream.status);
        }
        return reply(result);
      }

      return reply({ error: "Požadovaná adresa backendu neexistuje." }, 404);
    } catch (error) {
      return reply({ error: error?.message || "Neznáma chyba backendu." }, 500);
    }
  }
};