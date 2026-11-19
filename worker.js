const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,X-App-Password,Authorization",
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


function b64url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}
function fromB64url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized + "=".repeat((4 - normalized.length % 4) % 4));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
}
async function signSession(payload, secret) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const body = b64url(new TextEncoder().encode(JSON.stringify(payload)));
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(body));
  return body + "." + b64url(new Uint8Array(signature));
}
async function verifySession(token, secret) {
  try {
    const [body, signature] = token.split(".");
    if (!body || !signature) return false;
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, fromB64url(signature), new TextEncoder().encode(body));
    if (!valid) return false;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body)));
    return Number(payload.exp) > Math.floor(Date.now() / 1000);
  } catch { return false; }
}

function runwayHeaders(env) {
  return {
    "Authorization": `Bearer ${env.RUNWAY_API_KEY}`,
    "X-Runway-Version": "2024-11-06",
    "Content-Type": "application/json"
  };
}

// Ratios accepted by Seedance 2.0 Mini and full Seedance 2.0.
const MINI_RATIOS = new Set(["864:496","640:640","496:864","1280:720","960:960","720:1280"]);
const FULL_RATIOS = new Set([
  ...MINI_RATIOS,
  "1920:1080","1440:1440","1080:1920",
  "3840:2160","3840:3840","2160:3840"
]);

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

    const url = new URL(request.url);
    const origin = request.headers.get("Origin");
    // Allow the hosted PWA and the native Capacitor Android WebView.
    // Capacitor's Android origin is https://localhost; localhost variants are
    // included for development builds only.
    const allowedOrigins = new Set([
      "https://product-studio-ai-frontend.marianholka94.workers.dev",
      "https://product-studio-ai-pwa.pages.dev",
      "https://feature-social-export-preset.product-studio-ai-pwa.pages.dev",
      "https://localhost",
      "http://localhost",
      "capacitor://localhost",
      "ionic://localhost"
    ]);
    if (origin && !allowedOrigins.has(origin)) {
      return reply({ error: "Tento pôvod požiadavky nie je povolený." }, 403);
    }
    if (!env.RUNWAY_API_KEY || !env.APP_PASSWORD) {
      return reply({ error: "Backend nie je nakonfigurovaný. Skontroluj tajné premenné RUNWAY_API_KEY a APP_PASSWORD." }, 503);
    }

    try {
      if (request.method === "POST" && url.pathname === "/api/session") {
        if (request.headers.get("X-App-Password") !== env.APP_PASSWORD) {
          return reply({ error: "Nesprávny prístupový kód." }, 401);
        }
        const token = await signSession({ exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60 }, env.APP_PASSWORD);
        return reply({ token, expiresIn: 30 * 24 * 60 * 60 });
      }
      const bearer = (request.headers.get("Authorization") || "").replace(/^Bearer\s+/i, "");
      const legacyPassword = request.headers.get("X-App-Password") === env.APP_PASSWORD;
      if (!legacyPassword && !(await verifySession(bearer, env.APP_PASSWORD))) {
        return reply({ error: "Prihlásenie vypršalo. Prihlás sa znova." }, 401);
      }

      if (request.method === "GET" && url.pathname === "/api/health") {
        return reply({ ok: true, service: "PRODUCT STUDIO AI", provider: "Runway Dev", model: "seedance2_mini", promptAssistant: Boolean(env.OPENAI_API_KEY) });
      }

      if (request.method === "POST" && url.pathname === "/api/create-prompt") {
        if (!env.OPENAI_API_KEY) {
          return reply({ error: "AI tvorba promptov ešte nie je nakonfigurovaná. V Cloudflare Worker pridaj tajnú premennú OPENAI_API_KEY." }, 503);
        }
        let body;
        try { body = await request.json(); }
        catch { return reply({ error: "Požiadavka neobsahuje platné JSON dáta." }, 400); }
        const idea = String(body.idea || "").trim();
        if (!idea || idea.length > 3000) {
          return reply({ error: "Opíš svoju predstavu v rozsahu 1 až 3 000 znakov." }, 400);
        }
        const context = body.context && typeof body.context === "object" ? body.context : {};
        const safeContext = {
          product: String(context.product || "").slice(0,160),
          visualStyle: String(context.visualStyle || "").slice(0,160),
          scene: String(context.scene || "").slice(0,1200),
          camera: String(context.camera || "").slice(0,300),
          lighting: String(context.lighting || "").slice(0,300),
          duration: String(context.duration || "").slice(0,10),
          aspectRatio: String(context.aspectRatio || "").slice(0,10),
          extra: String(context.extra || "").slice(0,500)
        };
        const aiResponse = await fetch("https://api.openai.com/v1/responses", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: env.OPENAI_PROMPT_MODEL || "gpt-6.2-astra",
            store: false,
            instructions: "You are an expert commercial product-ad prompt writer. Convert the user's Slovak or other-language creative idea into one polished, concise English video-generation prompt. Use the supplied settings as constraints and context. Preserve the product identity, packaging, logo, proportions and original colors. Do not invent product features, claims, text, logos, props or scene elements that conflict with the user's idea. Include scene composition, camera movement, lighting, realistic materials and motion where relevant. Avoid contradictory instructions and filler. Return only the final prompt in English, no heading, no quotation marks, maximum 1000 characters.",
            input: "USER'S CREATIVE IDEA:\n" + idea + "\n\nAPP SETTINGS (use as context, do not blindly repeat):\n" + JSON.stringify(safeContext)
          })
        });
        const aiData = await aiResponse.json().catch(() => ({}));
        if (!aiResponse.ok) {
          const message = aiData.error?.message || aiData.message || `OpenAI API vrátilo HTTP ${aiResponse.status}.`;
          return reply({ error: String(message) }, aiResponse.status === 429 ? 429 : 502);
        }
        const output = (aiData.output || []).flatMap(item => item.content || [])
          .filter(item => item.type === "output_text")
          .map(item => item.text || "").join("\n").trim();
        if (!output) return reply({ error: "AI nevytvorila použiteľný text. Skús upraviť zadanie." }, 502);
        return reply({ prompt: output.slice(0,1000) });
      }

      if (request.method === "POST" && url.pathname === "/api/generate-video") {
        const contentLength = Number(request.headers.get("Content-Length") || 0);
        if (contentLength > 75 * 1024 * 1024) {
          return reply({ error: "Video a fotografie spolu prekračujú limit 75 MB. Zmenši video alebo použi kratší záber." }, 413);
        }

        let form;
        try { form = await request.formData(); }
        catch { return reply({ error: "Nepodarilo sa načítať video a referenčné fotografie." }, 400); }

        const video = form.get("video");
        if (!(video instanceof File) || video.size < 512) {
          return reply({ error: "Nahraj platné vstupné video." }, 400);
        }
        if (video.size > 50 * 1024 * 1024) {
          return reply({ error: "Video môže mať najviac 50 MB. Exportuj kratší alebo menší súbor." }, 413);
        }
        const allowedVideoTypes = new Set(["video/mp4", "video/quicktime", "video/webm"]);
        if (!allowedVideoTypes.has(video.type)) {
          return reply({ error: "Podporované video formáty sú MP4, MOV a WebM." }, 400);
        }

        let images;
        try { images = JSON.parse(String(form.get("references") || "[]")); }
        catch { return reply({ error: "Referenčné fotografie nie sú v platnom formáte." }, 400); }
        if (!Array.isArray(images) || images.length < 1 || images.length > 5) {
          return reply({ error: "Pridaj 1 až 5 referenčných fotografií produktu." }, 400);
        }
        for (const image of images) {
          if (typeof image !== "string" || !/^data:image\/(jpeg|jpg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(image)) {
            return reply({ error: "Jedna z referenčných fotografií nemá podporovaný formát." }, 400);
          }
          if (image.length > 5 * 1024 * 1024) {
            return reply({ error: "Každá referenčná fotografia musí mať menej než 5 MB." }, 413);
          }
        }
        if (images.reduce((total, image) => total + image.length, 0) > 20 * 1024 * 1024) {
          return reply({ error: "Súhrnná veľkosť referenčných fotografií prekračuje 20 MB." }, 413);
        }

        const model = String(form.get("model") || "seedance2_mini");
        const ratio = String(form.get("ratio") || "");
        const validRatios = model === "seedance2" ? FULL_RATIOS : model === "seedance2_mini" ? MINI_RATIOS : null;
        if (!validRatios || !validRatios.has(ratio)) {
          return reply({ error: "Nepodporovaná kombinácia modelu a rozlíšenia." }, 400);
        }

        const prompt = String(form.get("prompt") || "").trim();
        if (!prompt || prompt.length > 10000) {
          return reply({ error: "Text zadania musí mať 1 až 10 000 znakov." }, 400);
        }
        const duration = Number(form.get("duration"));
        if (!Number.isInteger(duration) || duration < 4 || duration > 15) {
          return reply({ error: "Dĺžka výsledného videa musí byť 4 až 15 sekúnd." }, 400);
        }
        // Model and ratio were validated above against the selected Seedance tier.

        // Upload the original clip to Runway ephemeral storage. The returned runway:// URI
        // is used directly in the video-to-video generation request.
        const uploadInit = await fetch("https://api.dev.runwayml.com/v1/uploads", {
          method: "POST",
          headers: runwayHeaders(env),
          body: JSON.stringify({ filename: video.name || "product-source.mp4", type: "ephemeral" })
        });
        const uploadInfo = await uploadInit.json().catch(() => ({}));
        if (!uploadInit.ok || !uploadInfo.uploadUrl || !uploadInfo.runwayUri || !uploadInfo.fields) {
          const message = uploadInfo.error?.message || uploadInfo.error || uploadInfo.message || `Runway upload vrátil HTTP ${uploadInit.status}.`;
          return reply({ error: String(message), providerStatus: uploadInit.status }, uploadInit.ok ? 502 : uploadInit.status);
        }

        const uploadForm = new FormData();
        for (const [key, value] of Object.entries(uploadInfo.fields)) uploadForm.append(key, String(value));
        uploadForm.append("file", video, video.name || "product-source.mp4");
        const uploaded = await fetch(uploadInfo.uploadUrl, { method: "POST", body: uploadForm });
        if (!uploaded.ok) {
          return reply({ error: "Nahratie videa do Runway zlyhalo. Skús exportovať video do MP4 a nahrať ho znova.", providerStatus: uploaded.status }, 502);
        }

        const payload = {
          model,
          promptVideo: uploadInfo.runwayUri,
          promptText: prompt,
          references: images.map(uri => ({ uri })),
          ratio,
          duration,
          audio: false,
          bitrate: "high"
        };
        const upstream = await fetch("https://api.dev.runwayml.com/v1/video_to_video", {
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
          return reply({ error: "Seedance podporuje dĺžku 4 až 15 sekúnd." }, 400);
        }
        const model = String(body.model || "seedance2_mini");
        const validRatios = model === "seedance2" ? FULL_RATIOS : model === "seedance2_mini" ? MINI_RATIOS : null;
        if (!validRatios || !validRatios.has(body.ratio)) {
          return reply({ error: "Nepodporovaná kombinácia modelu a rozlíšenia." }, 400);
        }

        const payload = {
          model,
          promptImage: images.length === 1 ? images[0] : images.map(uri => ({ uri })),
          promptText: body.prompt.trim(),
          ratio: body.ratio,
          duration,
          audio: false,
          bitrate: "high"
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