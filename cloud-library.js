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
  const intro = $("p", { class: "muted" }, "Tvoj súkromný cloudový pracovný priestor pre produkty, fotografie a reklamné projekty.");
  const status = $("div", { class: "status", role: "status" }, "Nie si prihlásený do cloudovej knižnice.");
  const auth = $("div");
  const workspace = $("div");
  workspace.hidden = true;
  const loginGate = $("div", { class: "psai-login-gate", role: "dialog", "aria-modal": "true", "aria-labelledby": "psaiLoginTitle" });
  const loginCard = $("section", { class: "psai-login-card" });
  const loginTitle = $("h1", { id: "psaiLoginTitle" }, "PRODUCT STUDIO AI");
  const loginSubtitle = $("p", { class: "psai-login-subtitle" }, "Prihlás sa do svojho cloudového účtu");
  const loginLocal = $("button", { class: "secondary psai-login-local", type: "button" }, "Pokračovať bez prihlásenia");
  const openLogin = $("button", { class: "secondary psai-open-login", type: "button" }, "Prihlásiť sa do Cloudu");
  openLogin.hidden = true;
  loginCard.append(loginTitle, loginSubtitle, status, auth, loginLocal);
  loginGate.append(loginCard);
  document.body.append(loginGate);
  panel.append(openLogin);
  const showLoginGate = (checking = false) => {
    document.documentElement.classList.add("psai-login-open");
    document.body.classList.add("psai-login-open");
    loginGate.hidden = false;
    loginLocal.hidden = checking;
    auth.hidden = checking;
    if (checking) setStatus("Overujem tvoje prihlásenie…");
  };
  const hideLoginGate = () => {
    loginGate.hidden = true;
    document.documentElement.classList.remove("psai-login-open");
    document.body.classList.remove("psai-login-open");
  };
  loginLocal.addEventListener("click", () => { hideLoginGate(); openLogin.hidden = false; updateCloudLoginButton(); });
  openLogin.addEventListener("click", () => { if (user) return; showLoginGate(false); auth.hidden = false; });
  const style = $("style");
  style.textContent = "#commercialCloudPanel input,#commercialCloudPanel textarea,#commercialCloudPanel select,.psai-login-card input,.psai-login-card textarea,.psai-login-card select{width:100%;margin:5px 0 10px;padding:11px;border-radius:9px;border:1px solid #39495d;background:#0d141d;color:#fff;box-sizing:border-box}#commercialCloudPanel button,.psai-login-card button{width:auto;min-height:44px;margin:4px 6px 8px 0;padding:10px 14px;border-radius:9px;background:#d9bd7d;color:#17130b;font-weight:700;border:0}#commercialCloudPanel button.secondary,.psai-login-card button.secondary{background:#293647;color:#eef2f7}#commercialCloudPanel .cloud-item{border:1px solid #39495d;border-radius:12px;padding:12px;margin:10px 0;background:#101720}#commercialCloudPanel .cloud-thumb{width:76px;height:76px;object-fit:cover;border-radius:8px;margin:5px 7px 0 0}#commercialCloudPanel label,.psai-login-card label{display:block;color:#aebaca;font-size:13px;margin-top:8px}.psai-login-gate{position:fixed;inset:0;z-index:10050;display:flex;align-items:center;justify-content:center;box-sizing:border-box;width:100%;max-width:100%;min-width:0;padding: max(16px,env(safe-area-inset-top,0px)) 16px max(16px,env(safe-area-inset-bottom,0px));background:rgba(7,10,15,.97);overflow-x:hidden;overflow-y:auto}.psai-login-gate[hidden]{display:none}.psai-login-card{box-sizing:border-box;flex:0 1 440px;width:100%;min-width:0;max-width:440px;max-height:calc(100vh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));max-height:calc(100dvh - 32px - env(safe-area-inset-top,0px) - env(safe-area-inset-bottom,0px));overflow-x:hidden;overflow-y:auto;padding:24px 20px;border:1px solid #39495d;border-radius:22px;background:#151b24;color:#f3f5f8;box-shadow:0 24px 80px rgba(0,0,0,.45)}.psai-login-card>*{min-width:0;max-width:100%;box-sizing:border-box}.psai-login-card input,.psai-login-card button{box-sizing:border-box;max-width:100%}.psai-login-card h1{margin:0;color:#fff;font-size:25px;letter-spacing:.5px}.psai-login-subtitle{margin:8px 0 20px;color:#aebaca;font-size:14px}.psai-login-card #loginLocal{width:100%}.psai-login-card .status{margin:10px 0 14px}.psai-login-card button:not(.secondary){width:100%}.psai-login-card .psai-login-local{width:100%;margin:10px 0 0}.psai-login-card .psai-register-toggle{display:block;width:100%;margin:10px 0 0}#commercialCloudPanel .psai-open-login{display:block;margin:10px 0;background:#d9bd7d;color:#17130b}#commercialCloudPanel .psai-open-login.is-connected{background:#173a2c;color:#b8e7c9;border:1px solid #32684c;opacity:1;cursor:default}#commercialCloudPanel .psai-open-login:disabled{opacity:1}";
  panel.append(style, heading, intro, workspace);
  const first = document.querySelector("main") || document.body;
  const appHeader = first.querySelector(":scope > header");
  if (appHeader) appHeader.after(panel);
  else first.insertBefore(panel, first.firstChild);
  let token = sessionStorage.getItem(TOKEN_KEY) || "";
  let products = [];
  let user = null;
  const updateCloudLoginButton = () => {
    const connected = !!user;
    openLogin.textContent = connected ? "Prihlásené do cloudu" : "Prihlásiť sa do Cloudu";
    openLogin.disabled = connected;
    openLogin.classList.toggle("is-connected", connected);
    openLogin.setAttribute("aria-label", connected ? "Prihlásené do cloudu" : "Prihlásiť sa do Cloudu");
  };
  let editingProductId = null;
  let editingProductRecord = null;
  let editingProjectId = null;
  let editingProjectRecord = null;
  let accountEpoch = 0;
  let refreshSequence = 0;
  let authAttempt = 0;
  const previewObjectUrls = new Set();
  const setStatus = (message, error = false) => {
    status.textContent = message;
    status.className = "status" + (error ? " err" : " ok");
  };
  const notifyCloudAccountChange = () => window.dispatchEvent(new CustomEvent("psai-cloud-account-change"));
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
  const showRegister = $("button", { class: "secondary psai-register-toggle" }, "Registrácia");
  const showLogin = $("button", { class: "secondary" }, "Späť na prihlásenie");
  const authButtons = $("div");
  const registerFields = $("div");
  registerFields.hidden = true;
  for (const item of [email, password]) auth.append(item.wrap);
  registerFields.append(displayName.wrap, invite.wrap, register, showLogin);
  authButtons.append(login, showRegister);
  auth.append(authButtons, registerFields);
  const accountLine = $("p", { class: "muted" });
  const creditPanel = $("div", { class: "cloud-item" });
  const creditHeading = $("h3", {}, "💳 Kredity");
  const creditBalance = $("p", {}, "Dostupné kredity: načítavam…");
  const creditReserved = $("small", {}, "");
  const creditAdminArea = $("div");
  creditAdminArea.hidden = true;
  const creditAmount = field("Počet kreditov na dobitie", "number", "Napr. 500", 6);
  creditAmount.el.min = "1";
  creditAmount.el.max = "100000";
  creditAmount.el.step = "1";
  const creditNote = field("Poznámka k dobitiu", "text", "Manuálne dobitie", 160);
  const creditGrant = $("button", {}, "＋ Dobíť kredity");
  const creditHistory = $("div");
  creditAdminArea.append(creditAmount.wrap, creditNote.wrap, creditGrant);
  creditPanel.append(creditHeading, creditBalance, creditReserved, creditAdminArea, creditHistory);
  const logout = $("button", { class: "secondary" }, "Odhlásiť sa");
  const productName = field("Názov produktu", "text", "Napr. Prémiová káva", 120);
  const productDescription = field("Popis produktu", "textarea", "Popis produktu", 2000);
  const addProduct = $("button", {}, "＋ Vytvoriť produkt");
  const productConflict = $("div", { class: "cloud-item" });
  productConflict.hidden = true;
  productConflict.style.borderColor = "#c58b42";
  const productConflictText = $("p", {}, "");
  const reloadLatestProduct = $("button", { class: "secondary" }, "Načítať najnovšiu verziu produktu");
  const retryProductSave = $("button", {}, "Ponechať moje zmeny a uložiť znova");
  productConflict.append(productConflictText, reloadLatestProduct, retryProductSave);
  let conflictLatestProduct = null;
  const productList = $("div");
  const productSearch = field("Hľadať produkt", "search", "Názov alebo popis produktu", 120);
  productSearch.el.setAttribute("aria-label", "Hľadať v cloudovej knižnici produktov");
  const projectName = field("Názov reklamného projektu", "text", "Napr. Letná kampaň", 120);
  const projectPrompt = field("Prompt", "textarea", "Zadanie reklamného videa", 8000);
  const projectProduct = $("select");
  const addProject = $("button", {}, "＋ Vytvoriť projekt");
  const projectConflict = $("div", { class: "cloud-item" });
  projectConflict.hidden = true;
  projectConflict.style.borderColor = "#c58b42";
  const projectConflictText = $("p", {}, "");
  const reloadLatestProject = $("button", { class: "secondary" }, "Načítať najnovšiu verziu");
  const retryProjectSave = $("button", {}, "Ponechať moje zmeny a uložiť znova");
  const saveProjectAsCopy = $("button", { class: "secondary" }, "Uložiť moje zmeny ako nový projekt");
  projectConflict.append(projectConflictText, reloadLatestProject, retryProjectSave, saveProjectAsCopy);
  let conflictLatestProject = null;
  let copyOperationId = null;
  let pendingCopyPayload = null;
  const projectList = $("div");
  const projectSearch = field("Hľadať projekt", "search", "Názov alebo text promptu", 120);
  projectSearch.el.setAttribute("aria-label", "Hľadať v cloudových reklamných projektoch");
  workspace.append(accountLine, creditPanel, logout, $("hr"), productName.wrap, productDescription.wrap, addProduct, productConflict, productSearch.wrap, productList, $("hr"), projectName.wrap, $("label", {}, "Prepojiť s produktom"), projectProduct, projectPrompt.wrap, addProject, projectConflict, projectSearch.wrap, projectList);
  const applyLibraryFilter = (root, query) => {
    const needle = String(query || "").trim().toLocaleLowerCase("sk");
    const cards = [...root.querySelectorAll(".cloud-item[data-search-text]")];
    let visible = 0;
    for (const card of cards) {
      card.hidden = !!needle && !card.dataset.searchText.includes(needle);
      if (!card.hidden) visible += 1;
    }
    let count = root.querySelector(":scope > .cloud-search-count");
    if (!count) {
      count = $("p", { class: "cloud-search-count", "aria-live": "polite" });
      count.style.cssText = "color:#8995a6;font-size:12px;line-height:1.4;margin:0 0 8px";
      root.prepend(count);
    }
    count.hidden = !needle;
    count.textContent = needle ? "Nájdené: " + visible + " z " + cards.length : "";
    let emptyState = root.querySelector(":scope > .cloud-search-empty");
    if (!emptyState) {
      emptyState = $("p", { class: "cloud-search-empty", role: "status" });
      emptyState.style.cssText = "color:#aeb8c7;font-size:13px;line-height:1.5;padding:10px 2px";
      root.append(emptyState);
    }
    emptyState.hidden = !needle || visible > 0;
    emptyState.textContent = root === productList
      ? "Nenašli sa žiadne produkty. Skús iný názov alebo popis."
      : "Nenašli sa žiadne projekty. Skús iný názov alebo text promptu.";
  };
  productSearch.el.addEventListener("input", () => applyLibraryFilter(productList, productSearch.el.value));
  projectSearch.el.addEventListener("input", () => applyLibraryFilter(projectList, projectSearch.el.value));
  function resetAccountWorkspace() {
    accountEpoch += 1;
    refreshSequence += 1;
    for (const url of previewObjectUrls) URL.revokeObjectURL(url);
    previewObjectUrls.clear();
    editingProductId = null;
    editingProductRecord = null;
    conflictLatestProduct = null;
    productConflict.hidden = true;
    editingProjectId = null;
    editingProjectRecord = null;
    conflictLatestProject = null;
    copyOperationId = null;
    pendingCopyPayload = null;
    productName.el.value = "";
    productDescription.el.value = "";
    projectName.el.value = "";
    projectPrompt.el.value = "";
    addProduct.textContent = "＋ Vytvoriť produkt";
    addProject.textContent = "＋ Vytvoriť projekt";
    projectConflict.hidden = true;
    products = [];
    productList.replaceChildren();
    projectList.replaceChildren();
    projectProduct.replaceChildren($("option", { value: "" }, "Bez prepojeného produktu"));
  }
  async function operationFor(scope, payload) {
    if (!user?.id) throw new Error("Cloudový účet nie je prihlásený.");
    const accountId = user.id;
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    if (user?.id !== accountId) throw new Error("Cloudový účet sa počas prípravy ukladania zmenil. Skús to znova.");
    const fingerprint = Array.from(digest, byte => byte.toString(16).padStart(2, "0")).join("");
    const storageKey = "psai_pending_" + scope + "_" + accountId;
    let saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(storageKey) || "null"); } catch {}
    if (saved?.fingerprint === fingerprint && /^[a-zA-Z0-9_-]{16,80}$/.test(saved.key || "")) return saved.key;
    const key = crypto.randomUUID();
    sessionStorage.setItem(storageKey, JSON.stringify({ key, fingerprint }));
    return key;
  }
  function clearOperation(scope, accountId = user?.id) {
    if (!accountId) return;
    sessionStorage.removeItem("psai_pending_" + scope + "_" + accountId);
  }
  async function api(path, options = {}) {
    const headers = { ...(options.headers || {}) };
    const requestToken = token;
    if (requestToken) headers.Authorization = "Bearer " + requestToken;
    const response = await fetch(API + path, { ...options, headers });
    const data = (response.headers.get("content-type") || "").includes("application/json") ? await response.json() : null;
    if (!response.ok) {
      if (response.status === 401 && token === requestToken) { token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); resetAccountWorkspace(); renderAuth(); openLogin.hidden = false; updateCloudLoginButton(); showLoginGate(false); notifyCloudAccountChange(); }
      const error = new Error(data?.error || "Požiadavka zlyhala (" + response.status + ").");
      if (data?.currentProject) error.currentProject = data.currentProject;
      if (data?.currentProduct) error.currentProduct = data.currentProduct;
      error.status = response.status;
      throw error;
    }
    return data;
  }
  async function refreshCredits() {
    const accountId = user?.id;
    if (!accountId || !token) return;
    const data = await api("/api/credits");
    if (accountId !== user?.id) return;
    creditBalance.textContent = "Dostupné kredity: " + Number(data.available || 0).toLocaleString("sk-SK");
    creditReserved.textContent = "Rezervované: " + Number(data.reserved || 0).toLocaleString("sk-SK");
    creditAdminArea.hidden = !data.isAdmin;
    creditHistory.replaceChildren();
    const title = $("p", {}, "Posledné pohyby");
    title.style.fontWeight = "700";
    creditHistory.append(title);
    const history = data.history || [];
    if (!history.length) {
      creditHistory.append($("small", {}, "Zatiaľ nemáš žiadne pohyby na kreditovom účte."));
    } else {
      for (const entry of history) {
        const line = $("p", {});
        line.style.cssText = "font-size:12px;color:#aebaca;margin:5px 0";
        const date = new Date(Number(entry.createdAt) * 1000).toLocaleString("sk-SK");
        line.textContent = date + " · " + entry.type + " · " + entry.units.toLocaleString("sk-SK") + " kreditov" + (entry.note ? " · " + entry.note : "");
        creditHistory.append(line);
      }
    }
  }
  creditGrant.addEventListener("click", async () => {
    const units = Number(creditAmount.el.value);
    if (!Number.isSafeInteger(units) || units < 1 || units > 100000) {
      setStatus("Zadaj počet kreditov od 1 do 100 000.", true);
      return;
    }
    if (!confirm("Naozaj pripísať " + units.toLocaleString("sk-SK") + " kreditov na tvoj účet?")) return;
    creditGrant.disabled = true;
    try {
      await api("/api/credits/admin-grant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          units,
          note: creditNote.el.value.trim() || "Manuálne dobitie správcom",
          idempotencyKey: crypto.randomUUID()
        })
      });
      creditAmount.el.value = "";
      setStatus("Kredity boli pripísané na účet.");
      await refreshCredits();
    } catch (error) {
      setStatus(error.message || "Dobitie kreditov zlyhalo.", true);
    } finally {
      creditGrant.disabled = false;
    }
  });
  function renderAuth() {
    auth.hidden = false;
    workspace.hidden = true;
    setStatus("Prihlásenie do cloudovej knižnice je oddelené od prístupu ku generátoru.");
  }
  function addText(parent, tag, text) { parent.append($(tag, {}, text || "")); }
  async function refresh() {
    const refreshEpoch = accountEpoch;
    const refreshUserId = user?.id;
    const refreshId = ++refreshSequence;
    const isCurrentRefresh = () => refreshEpoch === accountEpoch && refreshUserId === user?.id && refreshId === refreshSequence;
    if (!token || !refreshUserId) return;
    const [p, pr] = await Promise.all([api("/api/products"), api("/api/projects")]);
    if (!isCurrentRefresh()) return;
    products = p.products || [];
    productList.replaceChildren();
    for (const url of previewObjectUrls) URL.revokeObjectURL(url);
    previewObjectUrls.clear();
    projectProduct.replaceChildren($("option", { value: "" }, "Bez prepojeného produktu"));
    const archivedProducts = products.filter(x => !!x.archivedAt);
    const activeProducts = products.filter(x => !x.archivedAt);
    for (const product of activeProducts) {
      projectProduct.append($("option", { value: product.id }, product.name));
      const card = $("div", { class: "cloud-item" });
      card.dataset.searchText = [product.name, product.description].filter(Boolean).join(" ").toLocaleLowerCase("sk");
      addText(card, "strong", product.name);
      const description = $("small", {}, product.description || "Bez popisu");
      description.style.display = "block";
      description.style.marginTop = "5px";
      description.style.color = "#aebaca";
      card.append(description);
      const upload = $("input", { type: "file", accept: "image/jpeg,image/png,image/webp" });
      const uploadButton = $("button", {}, "Nahrať fotografiu");
      const thumbs = $("div");
      uploadButton.addEventListener("click", async () => {
        if (uploadButton.disabled) return;
        const file = upload.files?.[0];
        if (!file) return setStatus("Najskôr vyber fotografiu.", true);
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 10 * 1024 * 1024) return setStatus("Vyber JPG, PNG alebo WebP do 10 MB.", true);
        const accountId = user?.id;
        const requestEpoch = accountEpoch;
        uploadButton.disabled = true;
        try {
          await api("/api/products/" + encodeURIComponent(product.id) + "/images", { method: "POST", headers: { "Content-Type": file.type }, body: file });
          if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
          setStatus("Fotografia bola bezpečne uložená.");
          await refresh();
        } catch (e) {
          if (requestEpoch === accountEpoch && accountId === user?.id) setStatus(e.message, true);
        } finally {
          if (requestEpoch === accountEpoch && accountId === user?.id) uploadButton.disabled = false;
        }
      });
      const actions = $("div");
      const useInStudio = $("button", { class: "secondary" }, "Použiť v štúdiu");
      useInStudio.addEventListener("click", async () => {
        if (!window.PSAIProjectBridge?.restore) {
          setStatus("Editor štúdia ešte nie je pripravený. Obnov stránku a skús to znova.", true);
          return;
        }
        if (!confirm("Načítať produkt „" + product.name + "“ do štúdia? Aktuálne neuložené zmeny v editore sa prepíšu.")) return;
        const accountId = user?.id;
        const requestEpoch = accountEpoch;
        const requestToken = token;
        if (!accountId || !requestToken) return setStatus("Cloudové prihlásenie vypršalo. Prihlás sa znova.", true);
        useInStudio.disabled = true;
        try {
          const result = await api("/api/products/" + encodeURIComponent(product.id) + "/images");
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          const imageRecords = result.images || [];
          if (!imageRecords.length) throw new Error("Tento cloudový produkt nemá žiadne aktívne fotografie.");
          const files = [];
          for (let index = 0; index < imageRecords.length; index++) {
            const imageRecord = imageRecords[index];
            const response = await fetch(API + imageRecord.url, {
              headers: { Authorization: "Bearer " + requestToken },
              cache: "no-store"
            });
            if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
            if (response.status === 401) {
              token = "";
              sessionStorage.removeItem(TOKEN_KEY);
              renderAuth();
              throw new Error("Cloudové prihlásenie vypršalo. Prihlás sa znova a skús import opakovať.");
            }
            if (!response.ok) throw new Error("Fotografiu " + (index + 1) + " sa nepodarilo bezpečne načítať.");
            const blob = await response.blob();
            if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
            const type = imageRecord.contentType || blob.type || "image/jpeg";
            if (!["image/jpeg", "image/png", "image/webp"].includes(type)) throw new Error("Cloudová knižnica vrátila nepodporovaný formát fotografie.");
            files.push({
              name: "cloud-" + product.id + "-" + (index + 1) + (type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg"),
              type,
              blob
            });
          }
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          await window.PSAIProjectBridge.restore({ product: product.name, images: files });
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          window.PSAIProjectBridge.setPrompt("");
          document.querySelector('#appBottomNav [data-screen="screenStudio"]')?.click();
          setStatus("Produkt „" + product.name + "“ a " + files.length + " fotografií boli načítané do štúdia. Cloudový originál zostal nezmenený.");
        } catch (error) {
          if (requestEpoch === accountEpoch && accountId === user?.id) setStatus(error.message || "Produkt sa nepodarilo načítať do štúdia.", true);
        } finally {
          if (requestEpoch === accountEpoch && accountId === user?.id) useInStudio.disabled = false;
        }
      });
      const editButton = $("button", { class: "secondary" }, "Upraviť");
      const archiveButton = $("button", { class: "secondary" }, "Archivovať");
      editButton.addEventListener("click", () => {
        editingProductId = product.id;
        editingProductRecord = product;
        conflictLatestProduct = null;
        productConflict.hidden = true;
        productName.el.value = product.name;
        productDescription.el.value = product.description || "";
        addProduct.textContent = "Uložiť zmeny produktu";
        productName.el.focus();
        setStatus("Upravuješ produkt: " + product.name);
      });
      archiveButton.addEventListener("click", async () => {
        if (archiveButton.disabled || !confirm("Naozaj archivovať produkt „" + product.name + "“?")) return;
        const accountId = user?.id;
        const requestEpoch = accountEpoch;
        archiveButton.disabled = true;
        try {
          await api("/api/products/" + encodeURIComponent(product.id), { method: "DELETE" });
          if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
          if (editingProductId === product.id) { editingProductId = null; editingProductRecord = null; addProduct.textContent = "＋ Vytvoriť produkt"; productConflict.hidden = true; }
          setStatus("Produkt bol archivovaný.");
          await refresh();
        } catch (e) { if (requestEpoch === accountEpoch && accountId === user?.id) setStatus(e.message, true); }
        finally { if (requestEpoch === accountEpoch && accountId === user?.id) archiveButton.disabled = false; }
      });
      actions.append(useInStudio, editButton, archiveButton);
      card.append(upload, uploadButton, thumbs, actions);
      productList.append(card);
      applyLibraryFilter(productList, productSearch.el.value);
      try {
        if (!isCurrentRefresh()) return
        const images = await api("/api/products/" + encodeURIComponent(product.id) + "/images");
        if (!isCurrentRefresh()) return
        for (const image of images.images || []) {
          if (!isCurrentRefresh()) return
          const response = await fetch(API + image.url, { headers: { Authorization: "Bearer " + token }, cache: "no-store" });
          if (!isCurrentRefresh()) return
          if (response.ok) {
            const img = $("img", { class: "cloud-thumb" });
            const objectUrl = URL.createObjectURL(await response.blob());
            if (!isCurrentRefresh()) { URL.revokeObjectURL(objectUrl); return; }
            previewObjectUrls.add(objectUrl);
            img.src = objectUrl;
            img.alt = "Fotografia produktu";
            thumbs.append(img);
          }
        }
      } catch {}
    }
    if (!productList.childElementCount) addText(productList, "p", "Zatiaľ nemáš uložené aktívne produkty.");
    if (archivedProducts.length) {
      const archive = $("details", { class: "cloud-item" });
      archive.append($("summary", {}, "Archív produktov (" + archivedProducts.length + ")"));
      for (const product of archivedProducts) {
        const item = $("div", { class: "cloud-item" });
        addText(item, "strong", product.name);
        addText(item, "small", "Archivovaný produkt · fotografie zostávajú zachované");
        const restore = $("button", { class: "secondary" }, "Obnoviť produkt");
        restore.addEventListener("click", async () => {
          if (restore.disabled) return;
          const accountId = user?.id;
          const requestEpoch = accountEpoch;
          restore.disabled = true;
          try {
            await api("/api/products/" + encodeURIComponent(product.id) + "/restore", { method: "POST" });
            if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
            setStatus("Produkt „" + product.name + "“ bol obnovený.");
            await refresh();
          } catch (e) { if (requestEpoch === accountEpoch && accountId === user?.id) setStatus(e.message, true); }
          finally { if (requestEpoch === accountEpoch && accountId === user?.id) restore.disabled = false; }
        });
        item.append(restore);
        archive.append(item);
      }
      productList.append(archive);
    }
    if (!isCurrentRefresh()) return
    projectList.replaceChildren();
    for (const project of (pr.projects || []).filter(x => !x.archivedAt)) {
      const card = $("div", { class: "cloud-item" });
      card.dataset.searchText = [project.name, project.prompt, project.status].filter(Boolean).join(" ").toLocaleLowerCase("sk");
      addText(card, "strong", project.name);
      addText(card, "small", (project.status || "draft") + (project.productId ? " · Prepojený produkt" : ""));
      addText(card, "p", project.prompt || "");
      const actions = $("div");
      const openInStudio = $("button", { class: "secondary" }, "Otvoriť v štúdiu");
      openInStudio.addEventListener("click", async () => {
        if (!window.PSAIProjectBridge?.restore) return setStatus("Editor štúdia ešte nie je pripravený. Obnov stránku a skús to znova.", true);
        const linkedProduct = products.find(item => item.id === project.productId);
        if (!linkedProduct) return setStatus("Prepojený cloudový produkt sa nenašiel. Projekt zostal nezmenený.", true);
        if (!confirm("Otvoriť cloudový projekt „" + project.name + "“ v štúdiu? Aktuálne neuložené zmeny v editore sa prepíšu. Cloudový originál zostane nezmenený.")) return;
        const accountId = user?.id;
        const requestEpoch = accountEpoch;
        const requestToken = token;
        if (!accountId || !requestToken) return setStatus("Cloudové prihlásenie vypršalo. Prihlás sa znova.", true);
        openInStudio.disabled = true;
        try {
          const result = await api("/api/products/" + encodeURIComponent(linkedProduct.id) + "/images");
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          const imageRecords = result.images || [];
          if (!imageRecords.length) throw new Error("Prepojený produkt nemá žiadne aktívne fotografie.");
          const files = [];
          for (let index = 0; index < imageRecords.length; index++) {
            const imageRecord = imageRecords[index];
            const response = await fetch(API + imageRecord.url, { headers: { Authorization: "Bearer " + requestToken }, cache: "no-store" });
            if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
            if (response.status === 401) {
              token = ""; sessionStorage.removeItem(TOKEN_KEY); renderAuth();
              throw new Error("Cloudové prihlásenie vypršalo. Prihlás sa znova a skús import opakovať.");
            }
            if (!response.ok) throw new Error("Fotografiu " + (index + 1) + " sa nepodarilo načítať.");
            const blob = await response.blob();
            if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
            const type = imageRecord.contentType || blob.type || "image/jpeg";
            if (!["image/jpeg", "image/png", "image/webp"].includes(type)) throw new Error("Cloudový projekt obsahuje nepodporovaný formát fotografie.");
            files.push({ name: "cloud-" + linkedProduct.id + "-" + (index + 1) + (type === "image/png" ? ".png" : type === "image/webp" ? ".webp" : ".jpg"), type, blob });
          }
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          const settings = project.settings || {};
          await window.PSAIProjectBridge.restore({
            product: linkedProduct.name, style: settings.style || "", scenePreset: settings.scenePreset || "",
            format: settings.format || "9:16", exportPreset: project.exportPreset || "custom",
            motion: settings.motion || "", duration: settings.duration || "5",
            resolution: settings.resolution || "720p", model: settings.model || "seedance2_mini",
            lighting: settings.lighting || "", extra: settings.extra || "", prompt: project.prompt || "", images: files
          });
          if (requestEpoch !== accountEpoch || accountId !== user?.id || requestToken !== token) return;
          document.querySelector('#appBottomNav [data-screen="screenStudio"]')?.click();
          setStatus("Cloudový projekt „" + project.name + "“ a " + files.length + " fotografií boli načítané do štúdia. Prompt a nastavenia boli obnovené; cloudový originál zostal nezmenený.");
        } catch (error) {
          setStatus(error.message || "Cloudový projekt sa nepodarilo načítať do štúdia.", true);
        } finally {
          openInStudio.disabled = false;
        }
      });
      const editButton = $("button", { class: "secondary" }, "Upraviť");
      const archiveButton = $("button", { class: "secondary" }, "Archivovať");
      editButton.addEventListener("click", () => {
        editingProjectId = project.id;
        editingProjectRecord = project;
        conflictLatestProject = null;
        projectConflict.hidden = true;
        projectName.el.value = project.name;
        projectPrompt.el.value = project.prompt || "";
        projectProduct.value = project.productId || "";
        addProject.textContent = "Uložiť zmeny projektu";
        projectName.el.focus();
        setStatus("Upravuješ projekt: " + project.name);
      });
      archiveButton.addEventListener("click", async () => {
        if (!confirm("Naozaj archivovať projekt „" + project.name + "“?")) return;
        try {
          await api("/api/projects/" + encodeURIComponent(project.id), { method: "DELETE" });
          if (editingProjectId === project.id) { editingProjectId = null; addProject.textContent = "＋ Vytvoriť projekt"; }
          setStatus("Projekt bol archivovaný.");
          await refresh();
        } catch (e) { setStatus(e.message, true); }
      });
      actions.append(openInStudio, editButton, archiveButton);
      card.append(actions);
      projectList.append(card);
      applyLibraryFilter(projectList, projectSearch.el.value);
    }
    if (!projectList.childElementCount) addText(projectList, "p", "Zatiaľ nemáš uložené reklamné projekty.");
  }
  async function signIn(path, body) {
    if (login.disabled || register.disabled) return;
    const attempt = ++authAttempt;
    login.disabled = true;
    register.disabled = true;
    try {
      const data = await api(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      if (attempt !== authAttempt) return;
      resetAccountWorkspace();
      token = data.token;
      sessionStorage.setItem(TOKEN_KEY, token);
      user = data.user;
      notifyCloudAccountChange();
      auth.hidden = true;
      workspace.hidden = false;
      openLogin.hidden = false;
      updateCloudLoginButton();
      hideLoginGate();
      accountLine.textContent = "Prihlásený účet: " + user.email;
      setStatus("Cloudový účet je prihlásený.");
      await refresh();
      try { await refreshCredits(); } catch (error) { setStatus("Kreditový účet sa nepodarilo načítať: " + error.message, true); }
    } catch (e) { if (attempt === authAttempt) setStatus(e.message, true); }
    finally { if (attempt === authAttempt) { login.disabled = false; register.disabled = false; } }
  }
  login.addEventListener("click", () => signIn("/api/auth/login", { email: email.el.value.trim(), password: password.el.value }));
  register.addEventListener("click", () => signIn("/api/auth/register", { email: email.el.value.trim(), password: password.el.value, displayName: displayName.el.value, inviteCode: invite.el.value }));
  showRegister.addEventListener("click", () => { registerFields.hidden = false; authButtons.hidden = true; });
  showLogin.addEventListener("click", () => { registerFields.hidden = true; authButtons.hidden = false; });
  logout.addEventListener("click", async () => {
    authAttempt += 1;
    login.disabled = false;
    register.disabled = false;
    try { await api("/api/auth/logout", { method: "POST" }); } catch {}
    token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); resetAccountWorkspace(); renderAuth(); openLogin.hidden = false; updateCloudLoginButton(); showLoginGate(false); notifyCloudAccountChange();
  });
  addProduct.addEventListener("click", async () => {
    if (addProduct.disabled) return;
    const accountId = user?.id;
    const requestEpoch = accountEpoch;
    const isEditing = !!editingProductId;
    addProduct.disabled = true;
    try {
      const path = isEditing ? "/api/products/" + encodeURIComponent(editingProductId) : "/api/products";
      const payload = { name: productName.el.value.trim(), description: productDescription.el.value };
      if (isEditing) payload.expectedUpdatedAt = editingProductRecord?.updatedAt;
      if (!isEditing) payload.idempotencyKey = await operationFor("product-create", { name: payload.name, description: payload.description });
      if (requestEpoch !== accountEpoch || accountId !== user?.id) throw new Error("Cloudový účet sa počas ukladania zmenil. Prihlás sa späť do pôvodného účtu.");
      await api(path, { method: isEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      if (!isEditing) clearOperation("product-create", accountId);
      editingProductId = null;
      editingProductRecord = null;
      conflictLatestProduct = null;
      productConflict.hidden = true;
      productName.el.value = ""; productDescription.el.value = "";
      addProduct.textContent = "＋ Vytvoriť produkt";
      setStatus(isEditing ? "Produkt bol upravený." : "Produkt bol uložený v cloudovej knižnici.");
      await refresh();
    } catch (e) {
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      if (e.currentProduct && editingProductId) {
        conflictLatestProduct = e.currentProduct;
        editingProductRecord = e.currentProduct;
        productConflictText.textContent = "Tento produkt bol medzičasom upravený v inom okne alebo zariadení. Tvoje aktuálne zmeny zostali zachované. Načítanie najnovšej verzie prepíše formulár; prípadne môžeš ponechať svoje zmeny a uložiť ich znova.";
        productConflict.hidden = false;
        setStatus("Konflikt verzií produktu: vyber, ako chceš pokračovať.", true);
      } else setStatus(e.message, true);
    }
    finally { addProduct.disabled = false; }
  });
  reloadLatestProduct.addEventListener("click", () => {
    if (!conflictLatestProduct || !editingProductId) return;
    const latest = conflictLatestProduct;
    productName.el.value = latest.name || "";
    productDescription.el.value = latest.description || "";
    editingProductRecord = latest;
    conflictLatestProduct = null;
    productConflict.hidden = true;
    setStatus("Načítala sa najnovšia cloudová verzia produktu.");
  });
  retryProductSave.addEventListener("click", () => {
    if (!editingProductId || !conflictLatestProduct) return;
    addProduct.click();
  });
  addProject.addEventListener("click", async () => {
    if (addProject.disabled) return;
    const accountId = user?.id;
    const requestEpoch = accountEpoch;
    const isEditing = !!editingProjectId;
    addProject.disabled = true;
    try {
      const path = isEditing ? "/api/projects/" + encodeURIComponent(editingProjectId) : "/api/projects";
      const payload = { name: projectName.el.value.trim(), prompt: projectPrompt.el.value, productId: projectProduct.value || null };
      if (isEditing) {
        payload.settings = editingProjectRecord?.settings || {};
        payload.exportPreset = editingProjectRecord?.exportPreset ?? null;
        payload.expectedUpdatedAt = editingProjectRecord?.updatedAt;
      } else {
        payload.idempotencyKey = await operationFor("project-create", payload);
      }
      if (requestEpoch !== accountEpoch || accountId !== user?.id) throw new Error("Cloudový účet sa počas ukladania zmenil. Prihlás sa späť do pôvodného účtu.");
      await api(path, { method: isEditing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      if (!isEditing) clearOperation("project-create", accountId);
      editingProjectId = null;
      editingProjectRecord = null;
      conflictLatestProject = null;
      projectConflict.hidden = true;
      projectName.el.value = ""; projectPrompt.el.value = "";
      addProject.textContent = "＋ Vytvoriť projekt";
      setStatus(isEditing ? "Reklamný projekt bol upravený." : "Reklamný projekt bol uložený.");
      await refresh();
    } catch (e) {
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      if (e.currentProject && editingProjectId) {
        conflictLatestProject = e.currentProject;
        copyOperationId = null;
        pendingCopyPayload = null;
        editingProjectRecord = e.currentProject;
        projectConflictText.textContent = "Tento projekt bol medzičasom upravený v inom okne alebo zariadení. Tvoje aktuálne textové zmeny sú zachované. Môžeš načítať najnovšiu verziu (prepíše rozpracovaný formulár), alebo ponechať svoje zmeny a uložiť ich znova nad aktuálnou verziou.";
        projectConflict.hidden = false;
        setStatus("Konflikt verzií: cloudový projekt sa zmenil. Vyber, ako chceš pokračovať.", true);
      } else {
        setStatus(e.message, true);
      }
    } finally { addProject.disabled = false; }
  });
  reloadLatestProject.addEventListener("click", () => {
    if (!conflictLatestProject || !editingProjectId) return;
    const latest = conflictLatestProject;
    projectName.el.value = latest.name || "";
    projectPrompt.el.value = latest.prompt || "";
    projectProduct.value = latest.productId || "";
    editingProjectRecord = latest;
    conflictLatestProject = null;
    projectConflict.hidden = true;
    setStatus("Načítala sa najnovšia cloudová verzia projektu. Môžeš ju ďalej upraviť.");
  });
  retryProjectSave.addEventListener("click", () => {
    if (!editingProjectId || !conflictLatestProject) return;
    addProject.click();
  });
  saveProjectAsCopy.addEventListener("click", async () => {
    if (!editingProjectId || !conflictLatestProject || !user?.id || saveProjectAsCopy.disabled) return;
    const accountId = user.id;
    const requestEpoch = accountEpoch;
    saveProjectAsCopy.disabled = true;
    try {
      if (!pendingCopyPayload) {
        const payload = {
          name: (projectName.el.value.trim() || "Reklamný projekt") + " (kópia)",
          prompt: projectPrompt.el.value,
          productId: projectProduct.value || null,
          settings: editingProjectRecord?.settings || {},
          exportPreset: editingProjectRecord?.exportPreset ?? null
        };
        copyOperationId = await operationFor("project-copy", payload);
        if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
        pendingCopyPayload = { ...payload, idempotencyKey: copyOperationId };
      }
      const result = await api("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pendingCopyPayload)
      });
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      editingProjectId = result.project.id;
      editingProjectRecord = result.project;
      projectName.el.value = result.project.name;
      conflictLatestProject = null;
      clearOperation("project-copy", accountId);
      copyOperationId = null;
      pendingCopyPayload = null;
      projectConflict.hidden = true;
      addProject.textContent = "Uložiť zmeny projektu";
      setStatus("Tvoje zmeny boli uložené ako samostatný projekt. Pôvodná cloudová verzia zostala zachovaná.");
      await refresh();
    } catch (error) {
      if (requestEpoch !== accountEpoch || accountId !== user?.id) return;
      setStatus(error.message + " Opakovaním tejto akcie sa použije rovnaký bezpečný kľúč a nevytvorí sa duplicitný projekt.", true);
    } finally {
      if (requestEpoch === accountEpoch && accountId === user?.id) saveProjectAsCopy.disabled = false;
    }
  });
  window.PSAICloudLibrary = {
    getCurrentUser() {
      return user ? { id: user.id, email: user.email, displayName: user.displayName || "" } : null;
    },
    async request(path, options = {}) {
      const accountId = user?.id;
      const requestEpoch = accountEpoch;
      if (!token || !accountId) throw new Error("Najskôr sa prihlás do svojho cloudového účtu.");
      const result = await api(path, options);
      if (!token || accountEpoch !== requestEpoch || user?.id !== accountId) {
        throw new Error("Cloudový účet sa počas požiadavky zmenil. Skús to znova.");
      }
      return result;
    },
    async download(path) {
      const accountId = user?.id;
      const requestEpoch = accountEpoch;
      const requestToken = token;
      if (!requestToken || !accountId) throw new Error("Najskôr sa prihlás do svojho cloudového účtu.");
      const response = await fetch(API + path, { headers: { Authorization: "Bearer " + requestToken } });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        if (response.status === 401 && token === requestToken) {
          token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY);
          resetAccountWorkspace(); renderAuth(); updateCloudLoginButton(); notifyCloudAccountChange();
        }
        const error = new Error(data?.error || "Video sa nepodarilo stiahnuť (" + response.status + ").");
        error.status = response.status;
        throw error;
      }
      if (!token || accountEpoch !== requestEpoch || user?.id !== accountId) {
        throw new Error("Cloudový účet sa počas sťahovania zmenil. Sťahovanie bolo zastavené.");
      }
      return response.blob();
    },
    getSyncState(record) {
      if (!user?.id || !record) return null;
      return record.cloudSyncByAccount?.[user.id] || (record.cloudSync?.accountId === user.id ? record.cloudSync : null);
    },
    async saveLocalProduct(record, onProgress = () => {}) {
      if (!token || !user?.id) throw new Error("Najskôr sa prihlás do cloudovej knižnice.");
      const accountId = user.id;
      const startEpoch = accountEpoch;
      if (!record || !record.id || !Array.isArray(record.images) || !record.images.length) throw new Error("Produkt musí obsahovať aspoň jednu fotografiu.");
      if (record.images.length > 9) throw new Error("Cloudový produkt môže obsahovať najviac 9 fotografií.");
      const images = record.images.map((item, index) => {
        const blob = item.blob;
        const type = item.type || blob?.type || "";
        if (!(blob instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(type)) throw new Error("Fotografia " + (index + 1) + " nemá podporovaný formát JPG, PNG alebo WebP.");
        if (!blob.size || blob.size > 10 * 1024 * 1024) throw new Error("Každá fotografia musí mať veľkosť do 10 MB.");
        return { blob, type, name: item.name || ("produkt-" + (index + 1)) };
      });
      const imageDigests = await Promise.all(images.map(async image => {
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", await image.blob.arrayBuffer()));
        let binary = ""; for (const byte of digest) binary += String.fromCharCode(byte);
        return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }));
      const fingerprint = JSON.stringify({
        name: record.name || "Produkt",
        images: images.map((x, index) => ({ name: x.name, type: x.type, size: x.blob.size, sha256: imageDigests[index] }))
      });
      if (accountEpoch !== startEpoch || user?.id !== accountId || !token) throw new Error("Cloudový účet sa počas prípravy ukladania zmenil. Ukladanie bolo zastavené.");
      const accountApi = (path, options = {}) => {
        if (!token || accountEpoch !== startEpoch || user?.id !== accountId) return Promise.reject(new Error("Cloudový účet sa počas ukladania zmenil. Prihlás sa späť do pôvodného účtu a pokračuj v ukladaní."));
        return api(path, options).then(data => {
          if (!token || accountEpoch !== startEpoch || user?.id !== accountId) throw new Error("Cloudový účet sa počas ukladania zmenil. Ukladanie bolo zastavené.");
          return data;
        });
      };
      const savedByAccount = record.cloudSyncByAccount && typeof record.cloudSyncByAccount === "object" ? record.cloudSyncByAccount : {};
      let sync = savedByAccount[accountId] || (record.cloudSync?.accountId === accountId ? record.cloudSync : null);
      if (sync && sync.accountId !== accountId) throw new Error("Cloudové uloženie patrí inému účtu. Ukladanie bolo zastavené.");
      if (sync && sync.fingerprint !== fingerprint) throw new Error("Produkt sa od posledného cloudového uloženia zmenil. Pôvodné cloudové fotografie zostali zachované; upravený produkt ulož ako nový produkt alebo najprv dokonči pôvodné nahrávanie.");
      if (!sync) {
        sync = { accountId, fingerprint, productOperationId: crypto.randomUUID(), productId: null, uploadedImages: 0 };
        await onProgress({ ...sync });
      }
      if (!sync.productId) {
        if (!sync.productOperationId) { sync.productOperationId = crypto.randomUUID(); await onProgress({ ...sync }); }
        const created = await accountApi("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: (record.name || "Produkt").slice(0, 120), description: "Produkt uložený z lokálnej knižnice PRODUCT STUDIO AI.", idempotencyKey: sync.productOperationId })
        });
        sync.productId = created.product.id; await onProgress({ ...sync });
      }
      const manifest = await accountApi("/api/products/" + encodeURIComponent(sync.productId) + "/images");
      const uploaded = (manifest.images || []).length;
      if (uploaded > images.length) throw new Error("Cloudový produkt obsahuje viac fotografií, než má lokálny produkt. Nahrávanie bolo zastavené kvôli ochrane pred duplicitami.");
      const remoteDigests = (manifest.images || []).map(image => image.checksumSha256 || "");
      for (let index = 0; index < uploaded; index++) {
        if (!remoteDigests[index] || remoteDigests[index] !== imageDigests[index]) throw new Error("Fotografie uložené v cloude sa nezhodujú s lokálnymi súbormi. Obnovenie bolo zastavené.");
      }
      sync.uploadedImages = uploaded; await onProgress({ ...sync });
      if (uploaded === images.length) {
        setStatus("Produkt „" + (record.name || "Produkt") + "“ a všetkých " + images.length + " fotografií už je uložených v cloude.");
        await refresh();
        return { ...sync, alreadySaved: true };
      }
      for (let index = uploaded; index < images.length; index++) {
        const image = images[index];
        await accountApi("/api/products/" + encodeURIComponent(sync.productId) + "/images", { method: "POST", headers: { "Content-Type": image.type }, body: image.blob });
        sync.uploadedImages = index + 1; await onProgress({ ...sync });
      }
      setStatus("Produkt „" + (record.name || "Produkt") + "“ a " + images.length + " fotografií boli uložené do cloudu.");
      await refresh();
      return { ...sync, alreadySaved: false };
    },
    async saveLocalProject(record, onProgress = () => {}) {
      if (!token || !user?.id) throw new Error("Najskôr sa prihlás do cloudovej knižnice.");
      const accountId = user.id;
      const startEpoch = accountEpoch;
      if (!record || !record.id || !Array.isArray(record.images) || !record.images.length) throw new Error("Projekt musí obsahovať aspoň jednu fotografiu.");
      if (record.images.length > 9) throw new Error("Cloudový produkt môže obsahovať najviac 9 fotografií.");
      const images = record.images.map((item, index) => {
        const blob = item.blob;
        const type = item.type || blob?.type || "";
        if (!(blob instanceof Blob) || !["image/jpeg", "image/png", "image/webp"].includes(type)) throw new Error("Fotografia " + (index + 1) + " nemá podporovaný formát JPG, PNG alebo WebP.");
        if (!blob.size || blob.size > 10 * 1024 * 1024) throw new Error("Každá fotografia musí mať veľkosť do 10 MB.");
        return { blob, type, name: item.name || ("produkt-" + (index + 1)) };
      });
      const settings = {
        style: record.style || "", scenePreset: record.scenePreset || "", format: record.format || "9:16",
        motion: record.motion || "", duration: record.duration || "5", resolution: record.resolution || "720p",
        model: record.model || "seedance2_mini", lighting: record.lighting || "", extra: record.extra || ""
      };
      const imageDigests = await Promise.all(images.map(async image => {
        const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", await image.blob.arrayBuffer()));
        let binary = "";
        for (const byte of digest) binary += String.fromCharCode(byte);
        return btoa(binary).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
      }));
      const fingerprint = JSON.stringify({
        name: record.name || record.product || "Nový produkt", product: record.product || "",
        prompt: record.prompt || "", settings, exportPreset: record.exportPreset || null,
        images: images.map((x, index) => ({ name: x.name, type: x.type, size: x.blob.size, sha256: imageDigests[index] }))
      });
      if (accountEpoch !== startEpoch || user?.id !== accountId || !token) throw new Error("Cloudový účet sa počas prípravy ukladania zmenil. Ukladanie bolo zastavené.");
      const accountApi = (path, options = {}) => {
        if (!token || accountEpoch !== startEpoch || user?.id !== accountId) return Promise.reject(new Error("Cloudový účet sa počas ukladania zmenil. Prihlás sa späť do pôvodného účtu a pokračuj v ukladaní."));
        return api(path, options).then(data => {
          if (!token || accountEpoch !== startEpoch || user?.id !== accountId) throw new Error("Cloudový účet sa počas ukladania zmenil. Prihlás sa späť do pôvodného účtu a pokračuj v ukladaní.");
          return data;
        });
      };
      const savedByAccount = record.cloudSyncByAccount && typeof record.cloudSyncByAccount === "object" ? record.cloudSyncByAccount : {};
      let sync = savedByAccount[accountId] || (record.cloudSync?.accountId === accountId ? record.cloudSync : null);
      if (sync && sync.accountId !== accountId) throw new Error("Cloudové uloženie patrí inému účtu. Ukladanie bolo zastavené.");

      // Older local records stored one unscoped cloudSync object. Adopt it only
      // after proving that its product (and, when present, project) belongs to
      // the currently authenticated account. Another account starts its own sync.
      if (!sync && record.cloudSync?.productId && !record.cloudSync.accountId) {
        try {
          const remoteProduct = await accountApi("/api/products/" + encodeURIComponent(record.cloudSync.productId));
          if (remoteProduct.product) {
            let legacyProjectId = record.cloudSync.projectId || null;
            if (legacyProjectId) {
              try {
                const remoteProject = await accountApi("/api/projects/" + encodeURIComponent(legacyProjectId));
                if (remoteProject.project?.productId !== record.cloudSync.productId) throw new Error("Legacy cloud project does not match its product.");
              } catch (error) {
                if (!String(error.message || "").includes("(404)")) throw error;
                legacyProjectId = null;
              }
            }
            sync = { ...record.cloudSync, accountId, projectId: legacyProjectId };
            if (!legacyProjectId) delete sync.idempotencyKey;
            await onProgress({ ...sync });
          }
        } catch (error) {
          if (String(error.message || "").includes("(401)")) throw error;
          // A 404 means the old cloud product belongs to another account (or
          // no longer exists); create a separate account-scoped cloud copy.
          if (!String(error.message || "").includes("(404)")) throw error;
        }
      }

      if (sync && sync.fingerprint !== fingerprint) throw new Error("Tento lokálny projekt sa od posledného pokusu zmenil. Pôvodné čiastočné nahrávanie zostáva zachované; najprv ho dokonči alebo vytvor nový lokálny projekt.");
      if (sync?.projectId) return { ...sync, alreadySaved: true };
      if (!sync) {
        sync = { accountId, fingerprint, productOperationId: crypto.randomUUID(), productId: null, uploadedImages: 0, projectId: null };
        await onProgress({ ...sync });
      }
      if (!sync?.productId) {
        if (!sync.productOperationId) {
          sync.productOperationId = crypto.randomUUID();
          await onProgress({ ...sync });
        }
        const created = await accountApi("/api/products", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: (record.product || record.name || "Produkt").slice(0, 120),
            description: "Produkt vytvorený pri ukladaní reklamného projektu.",
            idempotencyKey: sync.productOperationId
          })
        });
        sync.productId = created.product.id;
        await onProgress({ ...sync });
      }
      const manifest = await accountApi("/api/products/" + encodeURIComponent(sync.productId) + "/images");
      const uploaded = (manifest.images || []).length;
      if (uploaded > images.length) throw new Error("Cloudový produkt obsahuje viac fotografií, než má tento projekt. Nahrávanie bolo zastavené kvôli ochrane pred duplicitami.");
      const remoteDigests = (manifest.images || []).map(image => image.checksumSha256 || "");
      for (let index = 0; index < uploaded; index++) {
        if (!remoteDigests[index] || remoteDigests[index] !== imageDigests[index]) {
          throw new Error("Fotografie uložené v cloude sa nezhodujú s týmto lokálnym projektom. Obnovenie bolo zastavené, aby sa nezmiešali rôzne súbory.");
        }
      }
      sync.uploadedImages = uploaded;
      await onProgress({ ...sync });
      for (let index = uploaded; index < images.length; index++) {
        const image = images[index];
        await accountApi("/api/products/" + encodeURIComponent(sync.productId) + "/images", {
          method: "POST", headers: { "Content-Type": image.type }, body: image.blob
        });
        sync.uploadedImages = index + 1;
        await onProgress({ ...sync });
      }
      if (!sync.idempotencyKey) {
        sync.idempotencyKey = crypto.randomUUID();
        await onProgress({ ...sync });
      }
      const createdProject = await accountApi("/api/projects", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: (record.name || record.product || "Reklamný projekt").slice(0, 120),
          productId: sync.productId, prompt: record.prompt || "", settings,
          exportPreset: record.exportPreset || null, idempotencyKey: sync.idempotencyKey
        })
      });
      sync.projectId = createdProject.project.id;
      await onProgress({ ...sync });
      setStatus("Projekt „" + createdProject.project.name + "“ a " + images.length + " fotografií boli uložené do cloudu.");
      await refresh();
      return { ...sync, alreadySaved: false };
    }
  };
  panel.appendChild(workspace);
  renderAuth();
  openLogin.hidden = false;
  updateCloudLoginButton();
  showLoginGate(!!token);
  if (token) {
    // A restored session may resolve after the user has already signed in or out.
    // Never let this older bootstrap request overwrite a newer account session.
    const bootstrapToken = token;
    const bootstrapEpoch = accountEpoch;
    const isCurrentBootstrap = () => token === bootstrapToken && accountEpoch === bootstrapEpoch;
    api("/api/auth/me").then(data => {
      if (!isCurrentBootstrap()) return;
      user = data.user; notifyCloudAccountChange(); auth.hidden = true; workspace.hidden = false; openLogin.hidden = false; updateCloudLoginButton(); hideLoginGate();
      accountLine.textContent = "Prihlásený účet: " + user.email;
      return refresh();
    }).then(() => {
      if (isCurrentBootstrap()) setStatus("Cloudová knižnica je synchronizovaná.");
    }).catch(() => {
      if (!isCurrentBootstrap()) return;
      token = ""; user = null; sessionStorage.removeItem(TOKEN_KEY); resetAccountWorkspace(); renderAuth(); updateCloudLoginButton(); notifyCloudAccountChange();
    });
  }
})();