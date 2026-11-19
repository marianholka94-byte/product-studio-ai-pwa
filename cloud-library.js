(() => {
  const API = "https://product-studio-ai-commercial-preview.marianholka94.workers.dev";
  const TOKEN_KEY = "psai_commercial_preview_token";
  const $ = (tag, attrs = {}, text = "") => {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs)) {
      if (key === "class") node.className = value;
      else if (key === "type" || key === "placeholder" || key === "autocomplete" || key === "accept") node.setAttribute(key, value);
      else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
      else node[key] = value;
    }
    if (text) node.textContent = text;
    return node;
  };
  const panel = $("section", { class: "panel", id: "commercialCloudPanel" });
  panel.style.cssText = "border:1px solid #b99b5e!important;background:#151a22!important;color:#f3f5f8!important";
  const heading = $("h2", {}, "☁️ Cloudová knižnica");
  const intro = $("p", { class: "muted" }, "Samostatný komerčný účet, produkty, fotografie a reklamné projekty. Táto funkcia je zatiaľ v testovacom režime.");
  const status = $("div", { class: "status", role: "status" }, "Nie si prihlásený do cloudovej knižnice.");
  const auth = $("div");
  const workspace = $("div");
  workspace.hidden = true;
  const style = $("style");
  style.textContent = "#commercialCloudPanel input,#commercialCloudPanel textarea,#commercialCloudPanel select{width:100%;margin:5px 0 10px;padding:11px;border-radius:9px;border:1px solid #39495d;background:#0d141d;color:#fff}#commercialCloudPanel button{width:auto;margin:4px 6px 8px 0;padding:10px 14px;border-radius:9px;background:#d9bd7d;color:#17130b;font-weight:700;border:0}#commercialCloudPanel button.secondary{background:#293647;color:#eef2f7}#commercialCloudPanel .cloud-item{border:1px solid #39495d;border-radius:12px;padding:12px;margin:10px 0;background:#101720}#commercialCloudPanel .cloud-thumb{width:76px;height:76px;object-fit:cover;border-radius:8px;margin:5px 7px 0 0}#commercialCloudPanel label{display:block;color:#aebaca;font-size:13px;margin-top:8px}";
  panel.append(style, heading, intro, status, auth, workspace);
  const first = document.querySelector("main") || document.body;
  first.insertBefore(panel, first.firstChild);
  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  let products = [];
  let user = null;
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.className = "status" + (error ? " err" : " ok");
  };
  const field = (label, type, placeholder, maxLength) => {
    const wrap = $("div");
    wrap.append($("label", {}, label));
    const el = $(type === "textarea" ? "textarea" : "input", { type: type === "textarea" ? undefined : type, placeholder, maxLength: maxLength || 2000 });
    wrap.append(el);
    return { wrap, el };
  };
  const email = field("E-mail", "email", "meno@priklad.sk", 254);
  const password = field("Heslo (min. 12 znakov pri registrácii)", "password", "Heslo", 128);
  const displayName = field("Meno (nepovinné)", "text", "Meno", 80);
  const invite = field("Pozývací kód", "password", "Pozývací kód", 200);
  const login = $("button", {}, "Prihlásiť sa");
  const register = $("button", {}, "Vytvoriť testovací účet");
  const showRegister = $("button", { class: "secondary" }, "Registrácia");
  const showLogin = $("button", { class: "secondary" }, "Späť na prihlásenie");
  const authButtons = $("div");
  const registerFields = $("div");
  registerFields.hidden = true;
  for (const item of [email, password]) auth.append(item.wrap);
  registerFields.append(displayName.wrap, invite.wrap, register, showLogin);
  authButtons.append(login, showRegister);
  auth.append(authButtons, registerFields);
  const accountLine = $("p", { class: "muted" });
  const logout = $("button", { class: "secondary" }, "Odhlásiť sa");
  const productName = field("Názov produktu", "text", "Napr. Prémiová káva", 120);
  const productDescription = field("Popis produktu", "textarea", "Popis produktu", 2000);
  const addProduct = $("button", {}, "＋ Vytvoriť produkt");
  const productList = $("div");
  const projectName = field("Názov reklamného projektu", "text", "Napr. Letná kampaň", 120);
  const projectPrompt = field("Prompt", "textarea", "Zadanie reklamného videa", 8000);
  const projectProduct = $("select");
  const addProject = $("button", {}, "＋ Vytvoriť projekt");
  const projectList = $("div");
  workspace.append(accountLine, logout, $("hr"), productName.wrap, productDescription.wrap, addProduct, productList, $("hr"), projectName.wrap, $("label", {}, "Prepojiť s produktom"), projectProduct, projectPrompt.wrap, addProject, projectList);
  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = "Bearer " + token;
    const response = await fetch(API + path, { ...options, headers });
    const data = (response.headers.get("content-type") || "").includes("application/json") ? await response.json() : null;
    if (!response.ok) {
      if (response.status === 401) { token = ""; sessionStorage.removeItem(TOKEN_KEY); renderAuth(); }
      throw new Error(data?.error || "Požiadavka zlyhala (" + response.status + ").");
    }
    return data;
  }
  function renderAuth() {
    auth.hidden = false;
    workspace.hidden = true;
    setStatus("Prihlásenie do cloudovej knižnice je oddelené od prístupu ku generátoru.");
  }
  function addText(parent, tag, text) { parent.append($(tag, {}, text || "")); }
  async function refresh() {
    const [p, pr] = await Promise.all([api("/api/products"), api("/api/projects")]);
    products = p.products || [];
    productList.replaceChildren();
    projectProduct.replaceChildren($("option", { value: "" }, "Bez prepojeného produktu"));
    for (const product of products.filter(x => !x.archivedAt)) {
      projectProduct.append($("option", { value: product.id }, product.name));
      const card = $("div", { class: "cloud-item" });
      addText(card, "strong", product.name);
      addText(card, "small", product.description || "Bez popisu");
      const upload = $("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
      const uploadButton = $("button", {}, "Nahrať fotografiu");
      const thumbs = $("div");
      uploadButton.addEventListener("click", async () => {
        const file = upload.files?.[0];
        if (!file) return setStatus("Najskôr vyber fotografiu.", true);
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) return setStatus("Vyber JPG, PNG alebo WebP do 10 MB.", true);
        try {
          await api("/api/products/" + encodeURIComponent(product.id) + "/images", { method: "POST", headers: { "Content-Type": file.type }, body: file });
          setStatus("Fotografia bola bezpečne uložená.");
          await refresh();
        } catch (e) { setStatus(e.message, true); }
      });
      card.append(upload, uploadButton, thumbs);
      productList.append(card);
      try {
        const images = await api("/api/products/" + encodeURIComponent(product.id) + "/images");
        for (const image of images.images || []) {
          const response = await fetch(API + image.url, { headers: { Authorization: "Bearer " + token } });
          if (response.ok) {
            const img = $("img", { class: "cloud-thumb" });
            img.src = URL.createObjectURL(await response.blob());
            img.alt = "Fotografia produktu";
            thumbs.append(img);
          }
        }
      } catch {}
    }
    if (!productList.childElementCount) addText(productList, "p", "Zatiaľ nemáš uložené produkty.");
    projectList.replaceChildren();
    for (const project of (pr.projects || []).filter(x => !x.archivedAt)) {
      const card = $("div", { class: "cloud-item" });
      addText(card, "strong", project.name);
      addText(card, "small", (project.status || "draft") + (project.productId ? " · Prepojený produkt" : ""));
      addText(card, "p", project.prompt || "");
      projectList.append(card);
    }
    if (!projectList.childElementCount) addText(projectList, "p", "Zatiaľ nemáš uložené reklamné projekty.");
  }
  async function signIn(path, body) {
    try {
      const data = await api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      token = data.token;
      sessionStorage.setItem(TOKEN_KEY, token);
      user = data.user;
      auth.hidden = true;
      workspace.hidden = false;
      accountLine.textContent = "Prihlásený účet: " + user.email;
      setStatus("Cloudový účet je prihlásený.");
      await refresh();
    } catch (e) { setStatus(e.message, true); }
  }
  login.addEventListener("click", () => signIn("/api/auth/login", { email: email.el.value.trim(), password: password.el.value }));
  register.addEventListener("click", () => signIn("/api/auth/register", { email: email.el.value.trim(), password: password.el.value, displayName: displayName.el.value, inviteCode: invite.el.value }));
  showRegister.addEventListener("click", () => { registerFields.hidden = false; authButtons.hidden = true; });
  showLogin.addEventListener("click", () => { registerFields.hidden = true; authButtons.hidden = false; });
  logout.addEventListener("click", async () => {
    try { await api("/api/auth/logout", { method: "POST" }); } catch {}
    token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); renderAuth();
  });
  addProduct.addEventListener("click", async () => {
    try {
      await api("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: productName.el.value.trim(), description: productDescription.el.value }) });
      productName.el.value = ""; productDescription.el.value = "";
      setStatus("Produkt bol uložený v cloudovej knižnici.");
      await refresh();
    } catch (e) { setStatus(e.message, true); }
  });
  addProject.addEventListener("click", async () => {
    try {
      await api("/api/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: projectName.el.value.trim(), prompt: projectPrompt.el.value, productId: projectProduct.value || null, settings: {} }) });
      projectName.el.value = ""; projectPrompt.el.value = "";
      setStatus("Reklamný projekt bol uložený.");
      await refresh();
    } catch (e) { setStatus(e.message, true); }
  });
  panel.appendChild(auth);
  panel.appendChild(workspace);
  renderAuth();
  if (token) {
    api("/api/auth/me").then(data => {
      user = data.user; auth.hidden = true; workspace.hidden = false;
      accountLine.textContent = "Prihlásený účet: " + user.email;
      return refresh();
    }).then(() => setStatus("Cloudová knižnica je synchronizovaná."))
      .catch(() => { token = ""; sessionStorage.removeItem(TOKEN_KEY); renderAuth(); });
  }
})();