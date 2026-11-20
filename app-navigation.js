(() => {
  const sections = [...document.querySelectorAll('section.panel')];
  const findSection = number =>
    sections.find(section => section.querySelector('h2')?.textContent.trim().startsWith(number + '.'));

  const connection = findSection(1);
  const product = findSection(2);
  const advertising = findSection(3);
  const generation = findSection(4);
  const history = findSection(5);

  if (!connection || !product || !advertising || !generation || !history) {
    console.error('PRODUCT STUDIO AI: Chýba niektorá sekcia.');
    return;
  }

  connection.querySelector('h2').textContent = 'Pripojenie generátora';
  product.querySelector('h2').textContent = 'Produkt';
  advertising.querySelector('h2').textContent = 'Nastavenie reklamy';
  generation.querySelector('h2').textContent = 'Generovanie videa';
  history.querySelector('h2').textContent = 'História posledného generovania';

  [[connection,'⚡'],[product,'📦'],[advertising,'🎨'],[generation,'🎬'],[history,'🕘']].forEach(([section,icon]) => {
    const heading=section.querySelector('h2');
    if(heading) heading.dataset.sectionIcon=icon;
  });

  const style=document.createElement('style');
  style.textContent=`
    :root {
      color-scheme: dark;
      font-family: Inter,system-ui,-apple-system,sans-serif;
      background:#0b0e13;
      color:#f3f5f8;
    }
    * { box-sizing:border-box; }
    body {
      display:block !important;
      width:100% !important;
      max-width:none !important;
      min-height:100%;
      height:auto !important;
      margin:0 auto;
      padding:16px 12px calc(88px + env(safe-area-inset-bottom, 0px)) !important;
      overflow-y:auto !important;
      background:#0b0e13 !important;
      color:#f3f5f8 !important;
      font-size:16px !important;
    }
    header {
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin:12px 3px 26px !important;
    }
    header h1 {
      color:#fff;
      font-size:24px !important;
      line-height:1.2 !important;
      font-weight:800;
      letter-spacing:1px !important;
    }
    header .muted {
      color:#8993a3 !important;
      font-size:14px !important;
      line-height:1.5 !important;
      margin-top:5px;
    }
    header>span { color:#d6b66e !important;font-weight:700; }
    #appViews { display:block !important;width:100% !important;max-width:none !important;margin:0 auto !important; }
    .app-screen { display:none; }
    .app-screen.active { display:block !important;animation:screenIn .22s ease; }
    @keyframes screenIn { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
    .panel,.app-placeholder {
      background:#151a22 !important;
      border:1px solid #27303c !important;
      border-radius:20px !important;
      padding:20px !important;
      margin:14px 0 !important;
      color:#f3f5f8 !important;
      box-shadow:0 8px 24px rgba(0,0,0,.16);
    }
    h2,.panel h2,.app-placeholder h2,.studio-welcome h2 {
      color:#fff !important;
      font-size:19px !important;
      line-height:1.3 !important;
      font-weight:750 !important;
      margin:0 0 26px !important;
    }
    .panel h2[data-section-icon],.app-placeholder[data-section-icon] h2 {
      display:flex !important;align-items:center !important;gap:10px !important;
    }
    .panel h2[data-section-icon]::before,.app-placeholder[data-section-icon] h2::before {
      content:attr(data-section-icon);display:inline-flex;align-items:center;justify-content:center;
      flex:0 0 30px;width:30px;height:30px;font-size:25px;line-height:1;
    }
    label,.panel label {
      display:block !important;color:#e0e6ef !important;font-size:14px !important;
      line-height:1.35 !important;font-weight:700 !important;margin:14px 0 6px !important;
    }
    input,select,textarea,.panel input,.panel select,.panel textarea {
      width:100% !important;min-height:48px !important;padding:12px !important;
      font-size:16px !important;line-height:1.3 !important;color:#f3f5f8 !important;
      background:#0e131a !important;border:1px solid #303b49 !important;border-radius:16px !important;
    }
    input::placeholder,textarea::placeholder { color:#657184 !important;font-size:14px !important; }
    input:focus,select:focus,textarea:focus { outline:none;border-color:#c9a75d !important;box-shadow:0 0 0 2px rgba(201,167,93,.15); }
    input:disabled { opacity:.65; }
    .panel select option { font-size:16px !important; }
    .panel textarea { min-height:110px !important; }
    button {
      border-radius:12px !important;min-height:54px !important;padding:12px !important;
      font-size:14px !important;font-weight:750 !important;
      background:linear-gradient(135deg,#d9bd7d,#b58b42) !important;color:#17130b !important;
      border:0 !important;letter-spacing:.2px;
    }
    button.secondary { background:#252e3a !important;color:#e7edf5 !important;border:1px solid #354253 !important; }
    button:disabled { opacity:.45; }
    .panel .note,.panel .muted,.panel .small,.panel p,.app-placeholder p,.studio-welcome p {
      color:#aeb8c7 !important;font-size:14px !important;line-height:1.55 !important;
    }
    .output { white-space:pre-wrap;overflow-wrap:anywhere;background:#0e131a !important;border:1px solid #293442;color:#dbe2ec !important;border-radius:12px !important;font-size:15px !important;line-height:1.6 !important;padding:12px; }
    .status { background:#302817 !important;color:#f0d99f !important;border:1px solid #59482a;border-radius:12px !important; }
    .status.ok { background:#142b22 !important;color:#9ce0b8 !important;border-color:#285b40; }
    .status.err { background:#321c20 !important;color:#ffb5b5 !important;border-color:#663139; }
    .muted,.note,.small { color:#8995a6 !important; }
    video { width:100%;max-height:520px;border:1px solid #303b49;border-radius:12px;background:#111; }
    a { color:#d9bd7d !important;overflow-wrap:anywhere; }
    .grid,.panel .grid { display:grid;grid-template-columns:minmax(0,1fr) !important;gap:16px !important; }
    .preview-gallery { display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin:14px 0; }
    .preview-item { min-width:0;background:#0e131a;border:1px solid #303b49;border-radius:14px;padding:8px; }
    .preview-item img { display:block;width:100%;height:150px;object-fit:contain;border-radius:9px; }
    .preview-item span { display:block;text-align:center;font-size:16px;margin-top:8px;color:#c5cedb; }
    .app-placeholder { text-align:left;padding:12px !important; }
    .app-placeholder h2 { font-size:19px !important;margin-bottom:10px !important; }
    .studio-welcome {
      background:linear-gradient(135deg,#202936,#151a22 72%) !important;
      border:1px solid #394454 !important;border-radius:20px !important;padding:12px !important;margin:0 0 15px !important;
    }
    .studio-welcome .welcome-kicker { color:#d9bd7d;font-size:12px;font-weight:800;letter-spacing:1.4px;text-transform:uppercase; }
    .studio-welcome h2 { font-size:23px !important;margin:9px 0 !important; }
    .studio-welcome p { color:#aeb8c7;font-size:14px;line-height:1.55;margin:0; }

    /* Mobile workspace polish. Navigation controls and Android system bars are intentionally untouched. */
    .app-screen { min-width:0; }
    .panel, .app-placeholder, .studio-welcome { min-width:0; }
    .panel { padding:clamp(14px,4vw,22px) !important; }
    .panel label { margin-top:16px !important; }
    .panel input:not([type="file"]), .panel select, .panel textarea {
      display:block;
      min-width:0 !important;
      width:100% !important;
      min-height:50px !important;
      padding:13px 14px !important;
      border-radius:13px !important;
      font-size:16px !important;
    }
    .panel textarea { min-height:116px !important; resize:vertical; }
    .panel input[type="file"] {
      display:block;
      width:100% !important;
      min-width:0 !important;
      min-height:54px !important;
      padding:9px !important;
      font-size:14px !important;
      line-height:1.4 !important;
      overflow:hidden;
    }
    .panel input[type="file"]::file-selector-button {
      max-width:100%;
      min-height:34px;
      margin:0 8px 0 0;
      padding:7px 10px;
      border:0;
      border-radius:8px;
      background:#303b49;
      color:#f3f5f8;
      font:600 13px system-ui,sans-serif;
    }
    .panel .grid { grid-template-columns:minmax(0,1fr) !important; gap:8px 14px !important; }
    .panel .row { align-items:flex-start; flex-wrap:wrap; }
    .panel .row strong { overflow-wrap:anywhere; text-align:right; }
    .preview-gallery { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:10px !important; }
    .preview-item { min-width:0; }
    .preview-item img { width:100%; height:clamp(112px,34vw,170px) !important; }
    .preview-item span { font-size:13px !important; overflow-wrap:anywhere; }
    .panel button { width:100%; white-space:normal; }
    .panel video { display:block; width:100%; max-height: min(58vh,520px); object-fit:contain; }
    .panel .output { max-height:none; overflow-wrap:anywhere; }
    .panel .note { overflow-wrap:anywhere; }
    @media(min-width:600px) {
      .panel .grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:12px 16px !important; }
      .panel { padding:22px !important; }
      .preview-gallery { grid-template-columns:repeat(3,minmax(0,1fr)) !important; }
    }
    @media(min-width:900px) {
      #appViews { max-width:980px !important; }
      header { max-width:980px; margin-inline:auto !important; }
      .panel { padding:24px !important; }
    }

    /* Lightroom-style bottom bar: fixed to the viewport, above Android system navigation. */
    body {
      padding-bottom:calc(92px + env(safe-area-inset-bottom, 0px)) !important;
    }
    #appBottomNav {
      position:fixed !important;
      left:0 !important;
      right:0 !important;
      bottom:0 !important;
      inset-inline:0 !important;
      z-index:9999 !important;
      transform:none !important;
      width:100% !important;
      margin:0 !important;
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      align-items:stretch !important;
      gap:4px !important;
      padding:8px 12.5% calc(8px + env(safe-area-inset-bottom, 0px)) !important;
      background:#10141b !important;
      border:0 !important;
      border-top:1px solid #293442 !important;
      border-radius:0 !important;
      box-shadow:0 -5px 18px rgba(0,0,0,.22) !important;
    }
    #appBottomNav button {
      min-width:0 !important;min-height:62px !important;padding:7px 3px !important;
      margin:0 !important;display:flex !important;flex-direction:column !important;
      align-items:center !important;justify-content:center !important;gap:6px !important;
      background:transparent !important;color:#8792a2 !important;border:0 !important;
      font-size:12px !important;line-height:1.2 !important;font-weight:650 !important;
      border-radius:12px !important;
    }
    #appBottomNav button.active { background:#29251c !important;color:#e2c47e !important; }
    #appBottomNav button span { display:block !important;font-size:24px !important;line-height:1 !important;margin:0 !important; }
/* Secondary drawer navigation; persistent bottom bar is preserved. */
header{position:relative;gap:10px}.psai-menu-trigger{flex:0 0 46px;width:46px!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0!important;border:1px solid #354253!important;border-radius:14px!important;background:#151a22!important;color:#f3f5f8!important;display:grid!important;place-items:center!important;font-size:23px!important}.psai-header-brand{flex:1;min-width:0}
.psai-drawer-backdrop{position:fixed;inset:0;z-index:10020;background:rgba(0,0,0,.62);opacity:0;visibility:hidden;transition:opacity .2s ease,visibility .2s ease}.psai-drawer-backdrop.open{opacity:1;visibility:visible}
.psai-side-drawer{position:absolute;inset:0 auto 0 0;width:min(86vw,340px);padding:calc(18px + env(safe-area-inset-top,0px)) 16px calc(18px + env(safe-area-inset-bottom,0px));background:#151b24;border-right:1px solid #354253;box-shadow:16px 0 40px rgba(0,0,0,.35);transform:translateX(-102%);transition:transform .22s ease;overflow-y:auto}.psai-drawer-backdrop.open .psai-side-drawer{transform:translateX(0)}
.psai-drawer-top{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:8px 4px 20px;border-bottom:1px solid #303b49}.psai-drawer-brand{color:#fff;font-weight:850;font-size:16px;letter-spacing:.8px}.psai-drawer-subtitle{color:#8995a6;font-size:12px;margin-top:5px}
.psai-drawer-close{width:40px!important;min-height:40px!important;height:40px!important;margin:0!important;padding:0!important;background:#252e3a!important;color:#fff!important;font-size:22px!important}.psai-drawer-label{margin:22px 8px 8px;color:#8995a6;font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase}
.psai-drawer-link{width:100%!important;min-height:52px!important;margin:4px 0!important;padding:10px 12px!important;display:flex!important;align-items:center!important;justify-content:flex-start!important;gap:12px!important;text-align:left!important;background:transparent!important;color:#dce3ed!important;border:1px solid transparent!important;border-radius:13px!important;font-size:14px!important}.psai-drawer-link .psai-drawer-icon{width:26px;text-align:center;font-size:19px}.psai-drawer-link.active{background:#29251c!important;color:#e2c47e!important;border-color:#5b4b2b!important}.psai-drawer-hint{margin:20px 8px 0;color:#8995a6;font-size:12px;line-height:1.5}@media(prefers-reduced-motion:reduce){.psai-drawer-backdrop,.psai-side-drawer{transition:none}}
    html,body { overflow-y:auto !important;scrollbar-width:auto;scrollbar-color:#8995a6 #151a22; }
    *::-webkit-scrollbar { width:8px; }
    *::-webkit-scrollbar-thumb { background:#8995a6;border-radius:10px; }
    @media(min-width:600px) {
      body { padding-left:22px !important;padding-right:22px !important; }
      .grid { grid-template-columns:1fr 1fr !important; }
    }
  `;
  document.head.appendChild(style);

  const views=document.createElement('main');views.id='appViews';
  const studio=document.createElement('div');studio.className='app-screen active';studio.id='screenStudio';
  const projects=document.createElement('div');projects.className='app-screen';projects.id='screenProjects';
  const settings=document.createElement('div');settings.className='app-screen';settings.id='screenSettings';

  const welcome=document.createElement('section');welcome.className='studio-welcome';
  welcome.innerHTML='<div class="welcome-kicker">PRODUCT STUDIO AI</div><h2>Vytvor novú reklamu</h2><p>Nahraj fotografie produktu a podľa potreby pridaj aj vlastné video. AI z nich vytvorí jednu výslednú reklamu.</p>';
  studio.append(welcome,product,advertising,generation);

  const projectsIntro=document.createElement('div');projectsIntro.className='app-placeholder';projectsIntro.dataset.sectionIcon='📁';
  projectsIntro.innerHTML='<h2>Moje projekty</h2><p>Lokálne projekty uložené v tomto zariadení. Nie sú viazané na cloudový účet a zostávajú tu aj po prepnutí účtu.</p><p>Cloudové projekty a produkty nájdeš v samostatnej sekcii <strong>Cloudová knižnica</strong>.</p><p><strong>Pracovný priestor PRODUCT STUDIO AI</strong></p>';


  connection.remove();
  settings.innerHTML='<section class="app-placeholder"><h2>Účet a bezpečnosť</h2><p>Cloudový účet a pripojenie generátora spravuješ v časti Projekty → Cloudová knižnica.</p><p>Odhlásenie z cloudovej knižnice zruší cloudovú reláciu. Lokálne projekty a produkty v tomto zariadení zostanú zachované.</p><p>Táto aplikácia už nepoužíva staré prihlásenie spoločným aplikačným heslom.</p></section>';

  views.append(studio,projects,settings);
  const header=document.querySelector('header');
  if(header)header.after(views);else document.body.prepend(views);

  const nav=document.createElement('nav');nav.id='appBottomNav';
  nav.innerHTML='<button class="active" data-screen="screenStudio"><span>✦</span>Štúdio</button><button data-screen="screenProjects"><span>▣</span>Projekty</button><button data-screen="screenSettings"><span>⚙</span>Nastavenia</button>';
  nav.querySelectorAll('button').forEach(button=>{
    button.addEventListener('click',()=>{
      const target=button.dataset.screen;
      document.querySelectorAll('.app-screen').forEach(screen=>screen.classList.toggle('active',screen.id===target));
      nav.querySelectorAll('button').forEach(item=>item.classList.toggle('active',item===button));
      if(target==='screenProjects'){
        renderProjects().catch(error=>{projectsList.textContent='Knižnicu projektov sa nepodarilo načítať: '+error.message;});
        renderProducts().catch(error=>{productsList.textContent='Knižnicu produktov sa nepodarilo načítať: '+error.message;});
      }
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  document.body.appendChild(nav);

  // Secondary side navigation; keep the bottom navigation bar available.
  const headerBrand=document.createElement('div');headerBrand.className='psai-header-brand';
  if(header){
    const brandContent=header.firstElementChild;if(brandContent)headerBrand.append(brandContent);
    const menuButton=document.createElement('button');menuButton.type='button';menuButton.className='psai-menu-trigger';
    menuButton.setAttribute('aria-label','Otvoriť bočný panel');menuButton.setAttribute('aria-expanded','false');menuButton.textContent='☰';
    header.prepend(menuButton);header.insertBefore(headerBrand,menuButton.nextSibling);
    const backdrop=document.createElement('div');backdrop.className='psai-drawer-backdrop';backdrop.hidden=true;
    backdrop.innerHTML='<aside class="psai-side-drawer" role="dialog" aria-modal="true" aria-label="Hlavná ponuka"><div class="psai-drawer-top"><div><div class="psai-drawer-brand">PRODUCT STUDIO AI</div><div class="psai-drawer-subtitle">Pracovný priestor</div></div><button type="button" class="psai-drawer-close" aria-label="Zavrieť ponuku">×</button></div><div class="psai-drawer-label">Navigácia</div><button class="psai-drawer-link active" data-screen="screenStudio"><span class="psai-drawer-icon">✦</span>Štúdio</button><button class="psai-drawer-link" data-screen="screenProjects"><span class="psai-drawer-icon">▣</span>Moje projekty</button><button class="psai-drawer-link" data-screen="screenSettings"><span class="psai-drawer-icon">⚙</span>Účet a nastavenia</button><div class="psai-drawer-label">Knižnica</div><button class="psai-drawer-link" data-action="cloud-library"><span class="psai-drawer-icon">☁</span>Cloudová knižnica</button><button class="psai-drawer-link" data-action="history"><span class="psai-drawer-icon">◷</span>História generovaní</button><p class="psai-drawer-hint">Spodná navigácia zostáva dostupná na každej obrazovke.</p></aside>';
    document.body.appendChild(backdrop);
    const closeDrawer=()=>{backdrop.classList.remove('open');menuButton.setAttribute('aria-expanded','false');setTimeout(()=>{if(!backdrop.classList.contains('open'))backdrop.hidden=true;},220);};
    menuButton.addEventListener('click',()=>{backdrop.hidden=false;requestAnimationFrame(()=>backdrop.classList.add('open'));menuButton.setAttribute('aria-expanded','true');});
    backdrop.querySelector('.psai-drawer-close').addEventListener('click',closeDrawer);
    backdrop.addEventListener('click',event=>{if(event.target===backdrop)closeDrawer();});
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!backdrop.hidden)closeDrawer();});
    backdrop.querySelectorAll('[data-screen]').forEach(button=>button.addEventListener('click',()=>{
      const target=button.dataset.screen;nav.querySelector('[data-screen="'+target+'"]')?.click();
      backdrop.querySelectorAll('[data-screen]').forEach(item=>item.classList.toggle('active',item===button));closeDrawer();
    }));
    backdrop.querySelector('[data-action="cloud-library"]').addEventListener('click',()=>{
      nav.querySelector('[data-screen="screenProjects"]')?.click();closeDrawer();
      setTimeout(()=>document.getElementById('commercialCloudPanel')?.scrollIntoView({behavior:'smooth',block:'start'}),240);
    });
    backdrop.querySelector('[data-action="history"]').addEventListener('click',()=>{
      nav.querySelector('[data-screen="screenProjects"]')?.click();closeDrawer();
      setTimeout(()=>document.getElementById('history')?.scrollIntoView({behavior:'smooth',block:'start'}),240);
    });
  }

  // Local project library backed by IndexedDB (project metadata + original image files).
  const projectDbName='product-studio-ai-projects', projectStoreName='projects';
  let activeProjectId=null, activeProductId=null, projectDbPromise=null;
  const localProductObjectUrls=new Set();
  const localProjectObjectUrls=new Set();
  const productManagerObjectUrls=new Set();
  const revokeObjectUrls=set=>{for(const url of set)URL.revokeObjectURL(url);set.clear();};
  const clearLocalProductObjectUrls=()=>{
    revokeObjectUrls(localProductObjectUrls);
  };
  const openProjectDb=()=>{
    if(projectDbPromise)return projectDbPromise;
    projectDbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(projectDbName,2);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(projectStoreName)){const store=db.createObjectStore(projectStoreName,{keyPath:'id'});store.createIndex('updatedAt','updatedAt');}if(!db.objectStoreNames.contains('products')){const products=db.createObjectStore('products',{keyPath:'id'});products.createIndex('updatedAt','updatedAt');}};
      request.onsuccess=()=>{
        const db=request.result;
        db.onversionchange=()=>{db.close();projectDbPromise=null;};
        resolve(db);
      };
      request.onerror=()=>{projectDbPromise=null;reject(request.error||new Error('Databázu projektov sa nepodarilo otvoriť.'));};
      request.onblocked=()=>{projectDbPromise=null;reject(new Error('Databázu projektov blokuje iná otvorená verzia aplikácie. Zavri ostatné okná aplikácie a skús to znova.'));};
    });return projectDbPromise;
  };
  const localDatabaseError=(error,kind)=>{
    if(error?.name==='QuotaExceededError')return 'V zariadení nie je dosť voľného miesta na uloženie '+kind+'. Uvoľni miesto alebo zmenši fotografie a skús to znova.';
    if(error?.name==='DataCloneError'||error?.name==='InvalidStateError')return 'Údaje sa nepodarilo bezpečne uložiť. Obnov aplikáciu a skús to znova.';
    return error?.message||'Lokálne údaje sa nepodarilo uložiť.';
  };
  const projectRequest=(mode,operation)=>openProjectDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(projectStoreName,mode);let request;
    try{request=operation(tx.objectStore(projectStoreName));}catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(new Error(localDatabaseError(tx.error,'projekt')));
    tx.onabort=()=>reject(new Error(localDatabaseError(tx.error,'projekt')));
  }));
  // Chromium on some Android devices can reject File/Blob structured clones with
  // "Failed to write blobs (InvalidBlob)". Persist image bytes as ArrayBuffers
  // and reconstruct Blob objects only when records are read.
  const serializeImageRecord=async image=>{
    const copy={...image};
    const source=image?.blob;
    if(source instanceof Blob){
      copy.blobBytes=await source.arrayBuffer();
      copy.blobType=image.type||source.type||'application/octet-stream';
      delete copy.blob;
    } else if(image?.blobBytes instanceof ArrayBuffer || ArrayBuffer.isView(image?.blobBytes)){
      copy.blobBytes=image.blobBytes instanceof ArrayBuffer?image.blobBytes:image.blobBytes.buffer.slice(image.blobBytes.byteOffset,image.blobBytes.byteOffset+image.blobBytes.byteLength);
      copy.blobType=image.blobType||image.type||'application/octet-stream';
      delete copy.blob;
    } else if(source!=null) throw new Error('Fotografiu sa nepodarilo bezpečne pripraviť na lokálne uloženie.');
    return copy;
  };
  const deserializeImageRecord=image=>{
    if(!image||image.blob instanceof Blob)return image;
    if(image.blobBytes instanceof ArrayBuffer || ArrayBuffer.isView(image.blobBytes)){
      const bytes=image.blobBytes instanceof ArrayBuffer?image.blobBytes:image.blobBytes.buffer.slice(image.blobBytes.byteOffset,image.blobBytes.byteOffset+image.blobBytes.byteLength);
      const {blobBytes,...rest}=image;
      return {...rest,blob:new Blob([bytes],{type:image.blobType||image.type||'application/octet-stream'})};
    }
    return image;
  };
  const hydrateRecord=record=>record?{...record,images:Array.isArray(record.images)?record.images.map(deserializeImageRecord):record.images}:record;
  const prepareRecord=async record=>({...record,images:Array.isArray(record.images)?await Promise.all(record.images.map(serializeImageRecord)):record.images});
  const getAllProjects=async()=>((await projectRequest('readonly',store=>store.getAll()))||[]).map(hydrateRecord);
  const productRequest=(mode,operation)=>openProjectDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction('products',mode);let request;
    try{request=operation(tx.objectStore('products'));}catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(new Error(localDatabaseError(tx.error,'produkt')));
    tx.onabort=()=>reject(new Error(localDatabaseError(tx.error,'produkt')));
  }));
  const getAllProducts=async()=>((await productRequest('readonly',store=>store.getAll()))||[]).map(hydrateRecord);
  const getProduct=async id=>hydrateRecord(await productRequest('readonly',store=>store.get(id)));
  const putProduct=async product=>{const stored=await prepareRecord(product);return productRequest('readwrite',store=>store.put(stored));};
  const removeProduct=id=>productRequest('readwrite',store=>store.delete(id));
  const getProject=async id=>hydrateRecord(await projectRequest('readonly',store=>store.get(id)));
  const putProject=async project=>{const stored=await prepareRecord(project);return projectRequest('readwrite',store=>store.put(stored));};
  const removeProject=id=>projectRequest('readwrite',store=>store.delete(id));

  const projectsList=document.createElement('div');projectsList.id='savedProjectsList';
  projectsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▣</span><strong>Zatiaľ tu nemáš žiadne projekty</strong><p>Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.</p></div>';
    const productsIntro=document.createElement('section');productsIntro.className='app-placeholder';productsIntro.dataset.sectionIcon='📦';
  productsIntro.innerHTML='<div class="library-title-row"><h2>Moja knižnica produktov</h2><button type="button" class="info-toggle" id="productLibraryInfoButton" aria-expanded="false" aria-controls="productLibraryInfo" aria-label="Zobraziť informáciu">i</button></div><p id="productLibraryInfo" class="collapsible-info" hidden>Ulož produkty raz a použi ich znova v ďalších reklamných projektoch.</p>';
  const productsList=document.createElement('div');productsList.id='savedProductsList';
  productsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▧</span><strong>Zatiaľ nemáš uložené produkty</strong><p>V štúdiu môžeš uložiť produkt spolu s jeho fotografiami.</p></div>';
  projects.append(projectsIntro,productsIntro,productsList,history,projectsList);
  const cloudLibraryPanel=document.getElementById('commercialCloudPanel');
  if(cloudLibraryPanel)projects.append(cloudLibraryPanel);
  productsIntro.querySelector('#productLibraryInfoButton').addEventListener('click',()=>{
    const button=productsIntro.querySelector('#productLibraryInfoButton');
    const info=productsIntro.querySelector('#productLibraryInfo');
    const opening=info.hidden;info.hidden=!opening;button.setAttribute('aria-expanded',String(opening));
  });
  const historyContent=history.querySelector('#history');
  if(historyContent&&historyContent.textContent.trim()==='Zatiaľ žiadne generovanie v tejto relácii.'){
    const heading=history.querySelector('h2');
    if(heading){
      history.classList.add('history-compact');
      const historyInfo=document.createElement('button');historyInfo.type='button';historyInfo.className='info-toggle';historyInfo.textContent='i';historyInfo.setAttribute('aria-label','Zobraziť informáciu o histórii');historyInfo.setAttribute('aria-expanded','false');
      const historyNote=document.createElement('div');historyNote.className='collapsible-info';historyNote.hidden=true;historyNote.textContent=historyContent.textContent.trim();historyContent.textContent='';
      const historyTitle=document.createElement('span');historyTitle.className='history-title';historyTitle.textContent='História generovania';heading.textContent='';heading.append(historyTitle,historyInfo);
      historyInfo.addEventListener('click',()=>{historyNote.hidden=!historyNote.hidden;historyInfo.setAttribute('aria-expanded',String(!historyNote.hidden));});
      historyContent.append(historyNote);
    }
  }

  const projectActions=document.createElement('div');projectActions.className='project-actions';
  projectActions.innerHTML='<button type="button" id="createProjectButton" class="secondary">＋ Nový projekt</button>';
  projectsIntro.append(projectActions);
  const studioActions=document.createElement('div');studioActions.className='studio-project-actions';
  studioActions.innerHTML='<button type="button" id="saveProjectButton">Uložiť projekt</button><button type="button" id="newProjectButton" class="secondary">Nový projekt</button><p id="projectSaveStatus" role="status"></p>';
  welcome.after(studioActions);
  const saveProductButton=document.createElement('button');
  saveProductButton.type='button';saveProductButton.className='secondary';saveProductButton.id='saveProductToLibrary';
  saveProductButton.textContent='＋ Uložiť produkt do knižnice';
  saveProductButton.style.cssText='width:100%;margin:14px 0 18px;min-height:50px!important;';
  const productSection=sections.find(section=>section.querySelector('h2')?.textContent.trim().startsWith('Produkt'));
  const productInput=document.getElementById('product');
  if(productInput)productInput.after(saveProductButton);
  else productSection?.append(saveProductButton);

  const projectStyle=document.createElement('style');
  projectStyle.textContent=`
    .studio-project-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin:0 0 14px}
    .studio-project-actions button,.project-actions button{margin:0;min-height:48px!important}
    .studio-project-actions #projectSaveStatus{grid-column:1/-1;margin:0;min-height:18px;font-size:12px;color:#9ce0b8}
    .project-actions{margin-top:14px}
    .library-title-row{display:flex;align-items:center;justify-content:center;gap:10px;min-height:30px}
    .library-title-row h2{margin:0!important;line-height:1.2!important}
    .library-title-row .info-toggle{transform:translateY(-1px)}
    .info-toggle{display:inline-flex;align-items:center;justify-content:center;flex:0 0 25px;width:25px;min-width:25px!important;height:25px;min-height:25px!important;padding:0!important;margin:0!important;border-radius:50%!important;background:#252e3a!important;border:1px solid #526176!important;color:#d9bd7d!important;font-size:15px!important;font-weight:800!important;line-height:1!important}
    .collapsible-info{margin:12px 0 0!important;padding:10px 12px;background:#10151d;border:1px solid #303b49;border-radius:12px;color:#aeb8c7!important;font-size:13px!important;line-height:1.5!important}
    .collapsible-info[hidden]{display:none!important}
    .history-compact{padding:16px!important}
    .history-compact h2{display:flex!important;align-items:center!important;gap:10px!important;margin:0!important;font-size:18px!important;line-height:1.25!important}
    .history-compact h2 .history-title{flex:1;min-width:0}
    .history-compact h2 .info-toggle{margin-left:auto!important;flex:0 0 25px!important}
    .history-compact .collapsible-info{margin-top:10px!important}
    .library-section-heading{margin:24px 2px 8px;padding:0 2px;background:transparent;border:0;border-radius:0;box-shadow:none}
    .library-section-heading h2{display:flex;align-items:center;gap:10px;margin:0 0 5px!important;font-size:19px!important;color:#fff}
    .library-section-heading h2::before{content:attr(data-section-icon);font-size:21px}
    .library-section-heading p{margin:0;color:#8995a6!important;font-size:13px!important;line-height:1.45!important}
    .projects-empty{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px;padding:34px 18px;background:#10151d;border:1px dashed #354253;border-radius:18px;color:#e8edf5}
    .projects-empty .empty-icon{font-size:34px;color:#d9bd7d}
    .projects-empty p{margin:0;max-width:260px;color:#8995a6;font-size:13px;line-height:1.5}
    .saved-project-card{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;padding:12px;margin:10px 0;background:#10151d;border:1px solid #303b49;border-radius:16px}
    .saved-project-thumb{width:76px;height:88px;object-fit:cover;border-radius:10px;background:#202936}
    .saved-project-info{min-width:0}
    .saved-project-info strong{display:block;color:#f3f5f8;font-size:15px;overflow-wrap:anywhere}
    .saved-project-info small{display:block;color:#8995a6;font-size:12px;line-height:1.5;margin-top:5px}
    .saved-project-buttons{display:flex;gap:7px;margin-top:9px}
    .saved-project-buttons button{min-height:38px!important;padding:8px!important;margin:0!important;font-size:12px!important;flex:1}
    .saved-project-buttons .delete-project{background:#302126!important;color:#ffb5b5!important;border:1px solid #663139!important}
    .saved-product-card{display:grid;grid-template-columns:76px minmax(0,1fr);gap:12px;padding:12px;margin:10px 0;background:#10151d;border:1px solid #303b49;border-radius:16px}
    .saved-product-thumb{width:76px;height:88px;object-fit:cover;border-radius:10px;background:#202936}
    .saved-product-info{min-width:0}
    .saved-product-info strong{display:block;color:#f3f5f8;font-size:15px;overflow-wrap:anywhere}
    .saved-product-info small{display:block;color:#8995a6;font-size:12px;line-height:1.5;margin-top:5px}
    .saved-product-buttons{display:flex;gap:7px;margin-top:9px}
    .saved-product-buttons{flex-wrap:wrap}
    .saved-product-buttons button{min-height:38px!important;padding:8px!important;margin:0!important;font-size:12px!important;flex:1 1 28%}
    .saved-product-buttons .manage-product{flex:1 1 100%;background:#202936!important;color:#e5d09c!important;border:1px solid #4a5362!important}
    .product-manager-backdrop{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.78)}
    .product-manager-backdrop[hidden]{display:none!important}
    .product-manager{width:100%;max-width:560px;max-height:82vh;overflow:auto;padding:18px;background:#151a22;border:1px solid #394454;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.45)}
    .product-manager-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .product-manager-head h3{margin:0;color:#fff;font-size:18px}
    .product-manager-sub{margin:0 0 14px;color:#9aa6b6;font-size:13px;line-height:1.45}
    .product-manager-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
    .product-manager-image{min-width:0;padding:8px;background:#0e131a;border:1px solid #303b49;border-radius:14px}
    .product-manager-image img{display:block;width:100%;height:150px;object-fit:contain;background:#080b10;border-radius:9px}
    .product-manager-image small{display:block;margin:7px 0;color:#aeb8c7;font-size:11px;overflow-wrap:anywhere}
    .product-manager-image button{width:100%;min-height:36px!important;margin:4px 0 0;padding:7px!important;font-size:11px!important}
    .product-manager-image .remove-photo{background:#302126!important;color:#ffb5b5!important;border:1px solid #663139!important}
    .product-manager-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px}
    .product-manager-actions button{min-height:44px!important;margin:0}
    .product-manager-close{min-width:38px!important;width:38px;min-height:38px!important;padding:0!important;border-radius:50%!important}
    .product-manager-add{grid-column:1/-1}
    .product-manager-create{grid-column:1/-1;background:#29251c!important;color:#e2c47e!important;border:1px solid #5b4b2b!important}
    .product-manager-count{margin:12px 0 0;color:#8995a6;font-size:12px;text-align:center}

  `;
  document.head.appendChild(projectStyle);
  const setProjectMessage=(message,isError=false)=>{const status=document.getElementById('projectSaveStatus');if(status){status.textContent=message;status.style.color=isError?'#ffb5b5':'#9ce0b8';}};
  const formatProjectDate=value=>new Intl.DateTimeFormat('sk-SK',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(value));
  const renderProjects=async()=>{
    revokeObjectUrls(localProjectObjectUrls);
    const records=(await getAllProjects()).sort((a,b)=>b.updatedAt-a.updatedAt);const linkedProducts=await getAllProducts();const linkedProductNames=new Map(linkedProducts.map(item=>[item.id,item.name]));projectsList.innerHTML='';
    if(!records.length){projectsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▣</span><strong>Zatiaľ tu nemáš žiadne projekty</strong><p>Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.</p></div>';return;}
    records.forEach(record=>{
      const card=document.createElement('article');card.className='saved-project-card';
      const thumb=document.createElement('img');thumb.className='saved-project-thumb';thumb.alt='';
      const firstImage=record.images?.[0]?.blob;if(firstImage){const objectUrl=URL.createObjectURL(firstImage);localProjectObjectUrls.add(objectUrl);thumb.src=objectUrl;}
      const info=document.createElement('div');info.className='saved-project-info';
      const title=document.createElement('strong');title.textContent=record.name||'Nepomenovaný projekt';
      const linkedProductName=record.productId?linkedProductNames.get(record.productId):null;const meta=document.createElement('small');meta.textContent=(record.images?.length||0)+' fotografií'+(linkedProductName?' · Produkt: '+linkedProductName:'')+' · '+formatProjectDate(record.updatedAt);
      const buttons=document.createElement('div');buttons.className='saved-project-buttons';
      const open=document.createElement('button');open.type='button';open.className='secondary';open.textContent='Otvoriť';
      open.addEventListener('click',async()=>{try{const latest=await getProject(record.id);if(!latest)throw new Error('Projekt sa už nenašiel.');await window.PSAIProjectBridge.restore(latest);activeProjectId=latest.id;activeProductId=latest.productId||null;syncPromptEditor(latest.prompt||'');setProjectMessage('Otvorený projekt: '+latest.name);nav.querySelector('[data-screen="screenStudio"]').click();}catch(error){alert(error.message||'Projekt sa nepodarilo otvoriť.');}});
      const duplicate=document.createElement('button');duplicate.type='button';duplicate.className='secondary';duplicate.textContent='Duplikovať';
      duplicate.addEventListener('click',async()=>{
        duplicate.disabled=true;
        try{
          const latest=await getProject(record.id);if(!latest)throw new Error('Projekt sa už nenašiel.');
          const now=Date.now();
          const copy={...latest,id:'project-'+now+'-'+Math.random().toString(36).slice(2,8),name:(latest.name||'Projekt')+' (kópia)',createdAt:now,updatedAt:now,images:(latest.images||[]).map(image=>({...image}))};
          await putProject(copy);await renderProjects();setProjectMessage('Kópia projektu „'+copy.name+'“ bola vytvorená. Pôvodný projekt zostal nezmenený.');
        }catch(error){alert(error.message||'Projekt sa nepodarilo duplikovať.');}
        finally{duplicate.disabled=false;}
      });
      const remove=document.createElement('button');remove.type='button';remove.className='delete-project';remove.textContent='Vymazať';
      remove.addEventListener('click',async()=>{if(!confirm('Naozaj chceš vymazať projekt „'+(record.name||'Nepomenovaný projekt')+'“?'))return;try{await removeProject(record.id);if(activeProjectId===record.id)activeProjectId=null;await renderProjects();}catch(error){alert(error.message||'Projekt sa nepodarilo vymazať.');}});
      const accountCloudSync=window.PSAICloudLibrary?.getSyncState(record)||null;
      const saveCloud=document.createElement('button');saveCloud.type='button';saveCloud.className='secondary';saveCloud.textContent=accountCloudSync?.projectId?'Uložené v cloude':'Uložiť do cloudu';saveCloud.disabled=!!accountCloudSync?.projectId;
      saveCloud.addEventListener('click',async()=>{
        if(!window.PSAICloudLibrary?.saveLocalProject){alert('Cloudová knižnica ešte nie je pripravená. Obnov stránku a skús to znova.');return;}
        if(!confirm('Uložiť projekt „'+(record.name||'Nepomenovaný projekt')+'“ a jeho fotografie do prihláseného cloudového účtu? Lokálny originál zostane zachovaný.'))return;
        saveCloud.disabled=true;
        try{
          const latest=await getProject(record.id);if(!latest)throw new Error('Lokálny projekt sa už nenašiel.');
          const result=await window.PSAICloudLibrary.saveLocalProject(latest,async sync=>{
            latest.cloudSyncByAccount={...(latest.cloudSyncByAccount||{}),[sync.accountId]:sync};latest.updatedAt=Date.now();await putProject(latest);
          });
          latest.cloudSyncByAccount={...(latest.cloudSyncByAccount||{}),[result.accountId]:result};latest.updatedAt=Date.now();await putProject(latest);
          saveCloud.textContent='Uložené v cloude';saveCloud.disabled=true;
          setProjectMessage('Projekt „'+latest.name+'“ bol uložený v cloude. Lokálna kópia zostala zachovaná.');
          await renderProjects();
        }catch(error){
          const latest=await getProject(record.id).catch(()=>null);
          saveCloud.disabled=false;
          const currentSync=latest?window.PSAICloudLibrary?.getSyncState(latest):null;
          saveCloud.textContent=currentSync?.productId?'Pokračovať v ukladaní':'Uložiť do cloudu';
          setProjectMessage(error.message||'Projekt sa nepodarilo uložiť do cloudu.',true);
        }
      });
      buttons.append(open,duplicate,remove,saveCloud);info.append(title,meta,buttons);card.append(thumb,info);projectsList.append(card);
    });
  };
  window.addEventListener('psai-cloud-account-change',()=>{
    renderProjects().catch(error=>{projectsList.textContent='Knižnicu projektov sa nepodarilo obnoviť: '+error.message;});
  });

  const productManagerBackdrop=document.createElement('div');
  productManagerBackdrop.className='product-manager-backdrop';
  productManagerBackdrop.hidden=true;
  productManagerBackdrop.innerHTML='<section class="product-manager" role="dialog" aria-modal="true" aria-labelledby="productManagerTitle"><div class="product-manager-head"><h3 id="productManagerTitle">Správa produktu</h3><button type="button" class="secondary product-manager-close" aria-label="Zavrieť">×</button></div><p class="product-manager-sub">Spravuj fotografie produktu. Môžeš pridať nové, odstrániť nepotrebné alebo zmeniť hlavnú fotografiu.</p><div class="product-manager-grid" id="productManagerGrid"></div><p class="product-manager-count" id="productManagerCount"></p><div class="product-manager-actions"><button type="button" class="secondary product-manager-add" id="addProductPhotos">＋ Pridať fotografie</button><button type="button" class="secondary" id="cancelProductManager">Zavrieť</button><button type="button" id="saveProductPhotos">Uložiť zmeny</button><button type="button" class="secondary product-manager-create" id="createProjectFromProduct">＋ Vytvoriť reklamný projekt</button></div><input type="file" id="productPhotoInput" accept="image/*" multiple hidden></section>';
  document.body.append(productManagerBackdrop);
  let managingProductId=null,managingProductName='',managingProductImages=[];
  const closeProductManager=()=>{revokeObjectUrls(productManagerObjectUrls);productManagerBackdrop.hidden=true;managingProductId=null;managingProductName='';managingProductImages=[];productManagerBackdrop.querySelector('#productManagerGrid').innerHTML='';};
  productManagerBackdrop.querySelector('.product-manager-close').addEventListener('click',closeProductManager);
  productManagerBackdrop.querySelector('#cancelProductManager').addEventListener('click',closeProductManager);
  productManagerBackdrop.addEventListener('click',event=>{if(event.target===productManagerBackdrop)closeProductManager();});
  const showProductManagerMessage=message=>{const count=productManagerBackdrop.querySelector('#productManagerCount');count.textContent=message;count.style.color='#ffb5b5';};
  const renderProductManagerImages=()=>{
    revokeObjectUrls(productManagerObjectUrls);
    const grid=productManagerBackdrop.querySelector('#productManagerGrid');grid.innerHTML='';
    managingProductImages.forEach((photo,index)=>{
      const tile=document.createElement('div');tile.className='product-manager-image';
      const img=document.createElement('img');img.alt='Fotografia '+(index+1);const objectUrl=URL.createObjectURL(photo.blob);productManagerObjectUrls.add(objectUrl);img.src=objectUrl;
      const name=document.createElement('small');name.textContent=(index===0?'★ Hlavná fotografia · ':'Fotografia '+(index+1)+' · ')+(photo.name||'produktová fotografia');
      const main=document.createElement('button');main.type='button';main.className='secondary';main.textContent=index===0?'Hlavná fotografia':'Nastaviť ako hlavnú';
      main.disabled=index===0;main.addEventListener('click',()=>{const selected=managingProductImages.splice(index,1)[0];managingProductImages.unshift(selected);renderProductManagerImages();});
      const remove=document.createElement('button');remove.type='button';remove.className='remove-photo';remove.textContent='Odstrániť';remove.disabled=managingProductImages.length<=1;
      remove.addEventListener('click',()=>{if(managingProductImages.length<=1){showProductManagerMessage('Produkt musí mať aspoň jednu fotografiu.');return;}managingProductImages.splice(index,1);renderProductManagerImages();});
      tile.append(img,name,main,remove);grid.append(tile);
    });
    const count=productManagerBackdrop.querySelector('#productManagerCount');count.textContent=managingProductImages.length+' / 5 fotografií';count.style.color='#8995a6';
    productManagerBackdrop.querySelector('#addProductPhotos').disabled=managingProductImages.length>=5;
  };
  const openProductManager=async id=>{
    const records=await getAllProducts();
    const record=records.find(item=>item.id===id);
    if(!record)throw new Error('Produkt sa už nenašiel. Obnov zoznam produktov a skús to znova.');
    managingProductId=record.id;managingProductName=record.name||'Produkt';managingProductImages=(record.images||[]).map(item=>({...item}));
    productManagerBackdrop.querySelector('#productManagerTitle').textContent=record.name;
    productManagerBackdrop.querySelector('#productPhotoInput').value='';
    renderProductManagerImages();productManagerBackdrop.hidden=false;
  };
  productManagerBackdrop.querySelector('#createProjectFromProduct').addEventListener('click',async()=>{
    const button=productManagerBackdrop.querySelector('#createProjectFromProduct');button.disabled=true;
    try{
      if(!managingProductId)throw new Error('Najskôr vyber produkt.');
      const records=await getAllProducts();const productRecord=records.find(item=>item.id===managingProductId);
      if(!productRecord)throw new Error('Produkt sa už nenašiel.');
      closeProductManager();activeProjectId=null;activeProductId=productRecord.id;
      await window.PSAIProjectBridge.restore({product:productRecord.name,images:productRecord.images||[]});
      syncPromptEditor('');
      setProjectMessage('Nový reklamný projekt pre produkt „'+productRecord.name+'“ je pripravený. Ulož ho ako samostatný projekt.');
      nav.querySelector('[data-screen="screenStudio"]').click();
    }catch(error){showProductManagerMessage(error.message||'Projekt sa nepodarilo vytvoriť.');}
    finally{button.disabled=false;}
  });
  productManagerBackdrop.querySelector('#addProductPhotos').addEventListener('click',()=>productManagerBackdrop.querySelector('#productPhotoInput').click());
  productManagerBackdrop.querySelector('#productPhotoInput').addEventListener('change',event=>{
    const files=[...event.target.files||[]];const remaining=5-managingProductImages.length;
    if(files.length>remaining)showProductManagerMessage('Môžeš pridať najviac '+remaining+' ďalšie fotografie.');
    files.slice(0,remaining).forEach(file=>{if(file.type.startsWith('image/'))managingProductImages.push({name:file.name,type:file.type,blob:file});});
    event.target.value='';renderProductManagerImages();
  });
  productManagerBackdrop.querySelector('#saveProductPhotos').addEventListener('click',async()=>{
    const button=productManagerBackdrop.querySelector('#saveProductPhotos');button.disabled=true;
    try{
      if(!managingProductImages.length)throw new Error('Produkt musí mať aspoň jednu fotografiu.');
      if(!managingProductId)throw new Error('Nie je vybraný produkt.');
      const records=await getAllProducts();
      const latest=records.find(item=>item.id===managingProductId);
      if(!latest)throw new Error('Produkt „'+managingProductName+'“ sa už nenašiel. Obnov zoznam produktov.');
      latest.images=managingProductImages.map(item=>({...item}));latest.updatedAt=Date.now();await putProduct(latest);
      closeProductManager();await renderProducts();setProjectMessage('Fotografie produktu „'+latest.name+'“ boli uložené.');
    }catch(error){showProductManagerMessage(error.message||'Fotografie sa nepodarilo uložiť.');}
    finally{button.disabled=false;}
  });

  const renderProducts=async()=>{
    clearLocalProductObjectUrls();
    const records=(await getAllProducts()).sort((a,b)=>b.updatedAt-a.updatedAt);const linkedProjects=await getAllProjects();const linkedProjectCounts=new Map(records.map(item=>[item.id,linkedProjects.filter(project=>project.productId===item.id).length]));productsList.innerHTML='';
    if(!records.length){productsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▧</span><strong>Zatiaľ nemáš uložené produkty</strong><p>V štúdiu môžeš uložiť produkt spolu s jeho fotografiami.</p></div>';return;}
    records.forEach(record=>{
      const card=document.createElement('article');card.className='saved-product-card';
      const thumb=document.createElement('img');thumb.className='saved-product-thumb';thumb.alt='';
      const first=record.images?.[0]?.blob;if(first){const objectUrl=URL.createObjectURL(first);localProductObjectUrls.add(objectUrl);thumb.src=objectUrl;}
      const info=document.createElement('div');info.className='saved-product-info';
      const title=document.createElement('strong');title.textContent=record.name;
      const linkedCount=linkedProjectCounts.get(record.id)||0;const meta=document.createElement('small');meta.textContent=(record.images?.length||0)+' fotografií · '+linkedCount+' reklamných projektov · '+formatProjectDate(record.updatedAt);
      const buttons=document.createElement('div');buttons.className='saved-product-buttons';
      const manage=document.createElement('button');manage.type='button';manage.className='secondary manage-product';manage.textContent='Spravovať fotografie';
      manage.addEventListener('click',async()=>{try{await openProductManager(record.id);}catch(error){setProjectMessage(error.message||'Správa produktu sa nepodarila otvoriť.',true);}});
      const use=document.createElement('button');use.type='button';use.className='secondary';use.textContent='Použiť v reklame';
      use.addEventListener('click',async()=>{
        try{
          if(!confirm('Načítať produkt „'+record.name+'“ do štúdia? Aktuálne neuložené zmeny v editore sa prepíšu.'))return;
          const latest=await getProduct(record.id);if(!latest)throw new Error('Produkt sa už nenašiel.');
          activeProjectId=null;activeProductId=latest.id;
          await window.PSAIProjectBridge.restore({product:latest.name,images:latest.images});
          syncPromptEditor('');
          setProjectMessage('Produkt „'+latest.name+'“ je pripravený na novú reklamu.');
          nav.querySelector('[data-screen="screenStudio"]').click();
        }catch(error){alert(error.message||'Produkt sa nepodarilo načítať.');}
      });
      const rename=document.createElement('button');rename.type='button';rename.className='secondary';rename.textContent='Premenovať';
      rename.addEventListener('click',async()=>{
        const name=prompt('Nový názov produktu:',record.name);if(name===null)return;
        if(!name.trim()){alert('Názov produktu nemôže byť prázdny.');return;}
        try{const latest=await getProduct(record.id);latest.name=name.trim();latest.updatedAt=Date.now();await putProduct(latest);await renderProducts();}
        catch(error){alert(error.message||'Produkt sa nepodarilo premenovať.');}
      });
      const remove=document.createElement('button');remove.type='button';remove.className='secondary';remove.textContent='Vymazať';
      remove.addEventListener('click',async()=>{
        if(!confirm('Naozaj chceš odstrániť produkt „'+record.name+'“ z knižnice? Uložené projekty zostanú zachované.'))return;
        try{await removeProduct(record.id);await renderProducts();}
        catch(error){alert(error.message||'Produkt sa nepodarilo vymazať.');}
      });
      const cloudSync=window.PSAICloudLibrary?.getSyncState(record)||null;
      const cloudImagesTotal=record.images?.length||0;
      const cloudSaved=!!cloudSync?.productId&&Number(cloudSync.uploadedImages||0)>=cloudImagesTotal;
      const cloudPending=!!cloudSync?.productId&&!cloudSaved;
      const saveCloud=document.createElement('button');saveCloud.type='button';saveCloud.className='secondary';
      saveCloud.textContent=cloudSaved?'Uložené v cloude':cloudPending?'Pokračovať v ukladaní':'☁ Uložiť do Cloudu';saveCloud.disabled=cloudSaved;
      saveCloud.addEventListener('click',async()=>{
        if(!window.PSAICloudLibrary?.saveLocalProduct){setProjectMessage('Cloudová knižnica ešte nie je pripravená. Obnov stránku a skús to znova.',true);return;}
        if(!window.PSAICloudLibrary.getCurrentUser()){setProjectMessage('Najskôr sa prihlás do Cloudovej knižnice.',true);return;}
        saveCloud.disabled=true;saveCloud.textContent='Ukladám…';
        try{
          const latest=await getProduct(record.id);if(!latest)throw new Error('Produkt sa už nenašiel.');
          const result=await window.PSAICloudLibrary.saveLocalProduct(latest,async sync=>{
            latest.cloudSyncByAccount={...(latest.cloudSyncByAccount||{}),[sync.accountId]:sync};latest.updatedAt=Date.now();await putProduct(latest);
            saveCloud.textContent='Nahrávam '+(sync.uploadedImages||0)+'/'+(latest.images?.length||0)+'…';
          });
          latest.cloudSyncByAccount={...(latest.cloudSyncByAccount||{}),[result.accountId]:result};latest.updatedAt=Date.now();await putProduct(latest);
          saveCloud.textContent='Uložené v cloude';saveCloud.disabled=true;
          setProjectMessage('Produkt „'+latest.name+'“ a '+latest.images.length+' fotografií boli uložené do Cloudu.');
          await renderProducts();
        }catch(error){
          saveCloud.disabled=false;saveCloud.textContent='☁ Pokračovať v ukladaní';
          setProjectMessage(error.message||'Produkt sa nepodarilo uložiť do Cloudu.',true);
        }
      });
      buttons.append(manage,use,rename,remove,saveCloud);info.append(title,meta,buttons);card.append(thumb,info);productsList.append(card);
    });
  };
  const saveProductToLibrary=async()=>{
    const state=window.PSAIProjectBridge?.capture();if(!state)throw new Error('Editor ešte nie je pripravený.');
    const name=state.product.trim();if(!name)throw new Error('Najskôr zadaj názov produktu.');
    if(!state.images.length)throw new Error('Na uloženie produktu pridaj aspoň jednu fotografiu.');
    const records=await getAllProducts();
    const existing=records.find(item=>item.name.toLowerCase()===name.toLowerCase());
    const now=Date.now();
    const record={id:existing?.id||('product-'+now+'-'+Math.random().toString(36).slice(2,8)),name,createdAt:existing?.createdAt||now,updatedAt:now,images:state.images};
    await putProduct(record);await renderProducts();
    setProjectMessage('Produkt „'+name+'“ bol uložený v knižnici.');
  };
  document.getElementById('saveProductToLibrary').addEventListener('click',async()=>{
    const button=document.getElementById('saveProductToLibrary');button.disabled=true;
    try{await saveProductToLibrary();}catch(error){setProjectMessage(error.message||'Produkt sa nepodarilo uložiť.',true);}
    finally{button.disabled=false;}
  });
  const saveCurrentProject=async()=>{
    const state=window.PSAIProjectBridge?.capture();if(!state)throw new Error('Editor projektu ešte nie je pripravený.');
    if(!state.product.trim()&&!state.images.length)throw new Error('Najskôr zadaj názov produktu alebo pridaj fotografiu.');
    if(!state.images.length)throw new Error('Projekt musí obsahovať aspoň jednu fotografiu produktu.');
    const now=Date.now(),existing=activeProjectId?await getProject(activeProjectId):null;
    const editedPrompt=promptDraft.value.trim()||state.prompt;const record={id:activeProjectId||('project-'+now+'-'+Math.random().toString(36).slice(2,8)),name:state.product.trim()||'Nový produkt',createdAt:existing?.createdAt||now,updatedAt:now,product:state.product,productId:activeProductId||existing?.productId||null,style:state.style,scenePreset:state.scenePreset||'',format:state.format,exportPreset:state.exportPreset||'custom',motion:state.motion,duration:state.duration,resolution:state.resolution||'720p',model:state.model||'seedance2_mini',lighting:state.lighting,extra:state.extra,prompt:editedPrompt,images:state.images};
    await putProject(record);activeProjectId=record.id;await renderProjects();setProjectMessage('Projekt „'+record.name+'“ bol uložený v tomto zariadení.');return record;
  };
  const startNewProject=async()=>{
    if(!confirm('Začať nový projekt? Neuložené zmeny v aktuálnom projekte sa stratia.'))return;
    activeProjectId=null;activeProductId=null;await window.PSAIProjectBridge.restore({});syncPromptEditor('');setProjectMessage('Nový projekt je pripravený. Po pridaní fotografie ho môžeš uložiť.');nav.querySelector('[data-screen="screenStudio"]').click();
  };
  document.getElementById('saveProjectButton').addEventListener('click',async()=>{const button=document.getElementById('saveProjectButton');button.disabled=true;try{await saveCurrentProject();}catch(error){setProjectMessage(error.message||'Projekt sa nepodarilo uložiť.',true);}finally{button.disabled=false;}});
  document.getElementById('newProjectButton').addEventListener('click',startNewProject);
  document.getElementById('createProjectButton').addEventListener('click',startNewProject);

  // Simple prompt editor: the prompt is saved as part of the complete project.
  // Scene selection belongs to ad settings, alongside the visual style.
  const styleSelect=document.getElementById('style');
  const sceneControl=document.createElement('div');
  sceneControl.innerHTML=`
    <label for="scenePreset">Reklamná scéna</label>
    <select id="scenePreset">
      <option value="">Bez predvolenej scény</option>
      <option value="luxury">Luxury Studio – luxusné tmavé štúdio</option>
      <option value="golden">Golden Premium – zlaté svetlo</option>
      <option value="water">Water &amp; Reflections – voda a odrazy</option>
      <option value="smoke">Smoke &amp; Shadows – dym a tiene</option>
      <option value="minimal">Minimalist – čistá produktová reklama</option>
      <option value="dynamic">Dynamic Commercial – dynamická scéna</option>
    </select>`;
  sceneControl.style.marginTop='12px';
  if(styleSelect?.parentElement)styleSelect.parentElement.append(sceneControl);
  const promptBox=document.getElementById('prompt');
  const promptEditor=document.createElement('section');promptEditor.id='promptEditor';
  promptEditor.innerHTML=`
    <button type="button" class="prompt-editor-toggle" id="promptEditorToggle" aria-expanded="false" aria-controls="promptEditorContent"><span><strong>Editor reklamného promptu</strong><small>Rozšírené nastavenie reklamného promptu</small></span><span class="prompt-editor-toggle-icon" aria-hidden="true">＋</span></button>
    <div id="promptEditorContent" hidden>
    <div class="prompt-editor-heading"><strong>Uprav si reklamný prompt</strong><span id="promptLength">0 / 1000</span></div>
    <p class="prompt-save-hint">Bezplatný lokálny pomocník. Napíš predstavu po slovensky a aplikácia ju rozdelí do správnych častí promptu podľa tvojich nastavení. Nepoužíva externé AI API.</p>
    <div class="ai-prompt-builder">
      <label class="prompt-label" for="aiPromptIdea">Tvoja predstava o reklame</label>
      <textarea id="aiPromptIdea" rows="4" maxlength="3000" placeholder="Napr. Produkt stojí na čiernom mramorovom podstavci. Za ním sa pomaly vznáša jemný dym a zlaté svetlo zvýrazňuje jeho hrany. Kamera sa pomaly približuje…"></textarea>
      <button type="button" id="createAiPrompt" class="secondary">✦ Rozdeliť zadanie do častí</button>
      <p class="prompt-save-hint">Tvoje zadanie sa spracuje priamo v zariadení. Známe pokyny sa prevedú do anglických formulácií; ostatný text zostane zachovaný, aby sa nestratil tvoj zámer.</p>
    </div>
    <div class="prompt-parts">
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partScenePanel">Prostredie a scéna <span>＋</span></button>
        <div class="prompt-part-panel" id="partScenePanel" hidden><textarea id="partScene" rows="4" placeholder="Opíš prostredie, pozadie, rekvizity a atmosféru scény…"></textarea><button type="button" class="add-prompt-part secondary" data-part="partScene">Pridať do promptu</button></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partProductPanel">Produkt a jeho vzhľad <span>＋</span></button>
        <div class="prompt-part-panel" id="partProductPanel" hidden><textarea id="partProduct" rows="4" placeholder="Čo musí zostať zachované? Tvar, obal, logo, farby, materiál…"></textarea><button type="button" class="add-prompt-part secondary" data-part="partProduct">Pridať do promptu</button></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partStylePanel">Vizuálny štýl <span>＋</span></button>
        <div class="prompt-part-panel" id="partStylePanel" hidden><textarea id="partStyle" rows="4" placeholder="Napr. prémiový, fotorealistický, cinematic…"></textarea><button type="button" class="add-prompt-part secondary" data-part="partStyle">Pridať do promptu</button></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partCameraPanel">Kamera a pohyb <span>＋</span></button>
        <div class="prompt-part-panel" id="partCameraPanel" hidden><textarea id="partCamera" rows="4" placeholder="Opíš uhol záberu, pohyb kamery a tempo…"></textarea><button type="button" class="add-prompt-part secondary" data-part="partCamera">Pridať do promptu</button></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partLightingPanel">Osvetlenie <span>＋</span></button>
        <div class="prompt-part-panel" id="partLightingPanel" hidden><textarea id="partLighting" rows="4" placeholder="Napr. mäkké bočné svetlo, odlesky, tiene…"></textarea><button type="button" class="add-prompt-part secondary" data-part="partLighting">Pridať do promptu</button></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partExtraPanel">Ďalšie pokyny <span>＋</span></button>
        <div class="prompt-part-panel" id="partExtraPanel" hidden><textarea id="partExtra" rows="4" placeholder="Čomu sa má reklama vyhnúť? Čo má zdôrazniť?"></textarea><button type="button" class="add-prompt-part secondary" data-part="partExtra">Pridať do promptu</button></div>
      </div>
      <button type="button" id="composePrompt" class="secondary">Zostaviť prompt z častí</button>
    </div>
    <label class="prompt-label" for="promptDraftText">Výsledný prompt – môžeš ho upraviť aj ručne</label>
    <textarea id="promptDraftText" rows="7" maxlength="1000" placeholder="Najskôr vytvor reklamný prompt alebo zostav ho z jednotlivých častí…"></textarea>
    <div class="prompt-editor-actions">
      <button type="button" id="copyPromptDraft" class="secondary">Kopírovať prompt</button>
      <button type="button" id="resetPromptParts" class="secondary">Obnoviť podľa nastavení reklamy</button>
    </div>
    <div id="promptEditorStatus" role="status"></div>
    <p class="prompt-save-hint">Prompt sa uloží spolu s projektom po stlačení „Uložiť projekt“.</p>
    </div>
  `;
  advertising.after(promptEditor);
  const promptStyle=document.createElement('style');
  promptStyle.textContent=`
    #promptEditor{margin:12px 0 18px;padding:0;background:transparent;border:0;border-radius:16px;color:#e8edf5}
    .prompt-editor-toggle{width:100%;min-height:66px!important;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px!important;text-align:left;background:#171e28!important;border:1px solid #303b49!important;border-radius:16px!important;color:#e8edf5!important}
    .prompt-editor-toggle strong{display:block;font-size:15px;font-weight:750}
    .prompt-editor-toggle small{display:block;margin-top:4px;color:#8995a6;font-size:12px;font-weight:400}
    .prompt-editor-toggle-icon{flex:0 0 auto;color:#d6b66e;font-size:26px;line-height:1}
    #promptEditorContent{margin-top:10px;padding:14px;background:#10151d;border:1px solid #303b49;border-radius:16px}
    #promptEditorContent[hidden]{display:none}
    .prompt-editor-heading{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:12px}
    .prompt-editor-heading strong{font-size:14px;color:#f2f4f8;font-weight:750}
    #promptLength{font-size:11px;color:#d6b66e}
    .prompt-label{display:block;margin:10px 0 6px;font-size:12px;color:#aab4c3}
    #promptEditor textarea{width:100%;box-sizing:border-box;background:#0b1017;color:#eef1f6;border:1px solid #354253;border-radius:11px;padding:11px;font:inherit;font-size:14px;resize:vertical;line-height:1.5;min-height:64px}
    #promptEditor #promptDraftText{min-height:150px}
    #scenePreset{width:100%;min-height:48px;background:#0e131a;color:#f3f5f8;border:1px solid #303b49;border-radius:16px;padding:12px;font:inherit;font-size:15px}
    .ai-prompt-builder{margin:12px 0 16px;padding:12px;background:#171e28;border:1px solid #354253;border-radius:12px}
    #aiPromptIdea{width:100%;min-height:112px;box-sizing:border-box;background:#0b1017;color:#eef1f6;border:1px solid #354253;border-radius:11px;padding:11px;font:inherit;font-size:14px;line-height:1.5;resize:vertical}
    #createAiPrompt{width:100%;margin:10px 0 8px;min-height:48px!important}
    .prompt-parts{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0 16px}
    .prompt-part{overflow:hidden;border:1px solid #303b49;border-radius:12px;background:#151c26}
    .prompt-part-toggle{width:100%;min-height:48px!important;display:flex;align-items:center;justify-content:space-between;text-align:left;background:#1a222e!important;color:#e8edf5!important;border:0!important;border-radius:0!important;padding:12px 14px!important}
    .prompt-part-toggle span{color:#d6b66e;font-size:18px}
    .prompt-part-panel{padding:10px}
    .prompt-part-panel[hidden]{display:none}
    .prompt-part-panel textarea{min-height:104px!important}
    .add-prompt-part{width:100%;min-height:42px!important;margin:8px 0 0!important}
    .add-prompt-part.added{background:#173326!important;color:#a8e5bd!important;border:1px solid #326548!important}
    .prompt-editor-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:10px}
    .prompt-editor-actions button,#composePrompt{margin:0;min-height:44px!important}
    #promptEditorStatus{min-height:18px;margin-top:8px;color:#9ce0b8;font-size:12px}
    .prompt-save-hint{margin:2px 0 0;color:#8995a6;font-size:12px;line-height:1.5}
  `;
  document.head.appendChild(promptStyle);
  const promptEditorToggle=document.getElementById('promptEditorToggle');
  const promptEditorContent=document.getElementById('promptEditorContent');
  promptEditorToggle.addEventListener('click',()=>{
    const opening=promptEditorContent.hidden;
    promptEditorContent.hidden=!opening;
    promptEditorToggle.setAttribute('aria-expanded',String(opening));
    promptEditorToggle.querySelector('.prompt-editor-toggle-icon').textContent=opening?'−':'＋';
  });
  const promptDraft=document.getElementById('promptDraftText');
  const promptStatus=document.getElementById('promptEditorStatus');
  const promptLength=document.getElementById('promptLength');
  const syncPromptLength=()=>{promptLength.textContent=promptDraft.value.length+' / 1000';};
  const partIds=['partScene','partProduct','partStyle','partCamera','partLighting','partExtra'];
  const promptParts=Object.fromEntries(partIds.map(id=>[id,document.getElementById(id)]));
  promptEditor.querySelectorAll('.prompt-part-toggle').forEach(toggle=>{
    toggle.addEventListener('click',()=>{
      const panel=document.getElementById(toggle.getAttribute('aria-controls'));
      const opening=panel.hidden;
      promptEditor.querySelectorAll('.prompt-part-panel').forEach(item=>item.hidden=true);
      promptEditor.querySelectorAll('.prompt-part-toggle').forEach(item=>{
        item.setAttribute('aria-expanded','false');
        item.querySelector('span').textContent='＋';
      });
      if(opening){
        panel.hidden=false;
        toggle.setAttribute('aria-expanded','true');
        toggle.querySelector('span').textContent='−';
        panel.querySelector('textarea').focus();
      }
    });
  });
  const scenePresets={
    luxury:{
      scene:'A luxurious dark studio with a deep charcoal background, elegant reflective black surface and carefully controlled negative space.',
      style:'High-end luxury campaign, photorealistic, refined, cinematic and sophisticated, with rich blacks and precise premium detail.',
      camera:'Slow, smooth cinematic push-in with a subtle controlled orbit around the product. Stable camera, deliberate premium pacing.',
      lighting:'A sculpted soft key light, narrow rim lights and subtle reflections that reveal the product shape without clipping highlights.'
    },
    golden:{
      scene:'An elegant premium studio with a warm golden glow, subtle gold reflections and a rich dark-to-amber background.',
      style:'Golden premium commercial aesthetic, photorealistic, luxurious, warm and polished, with restrained metallic accents.',
      camera:'Slow cinematic dolly-in with a gentle lateral movement, keeping the product as the clear hero.',
      lighting:'Warm golden key light, soft amber edge lighting and controlled highlights with realistic reflections.'
    },
    water:{
      scene:'A refined studio scene with a shallow reflective water surface, delicate ripples and elegant reflections around the product.',
      style:'Photorealistic cinematic product advertising, fresh, atmospheric and premium, with realistic water detail.',
      camera:'Slow low-angle push-in with a subtle smooth orbit; keep the product stable and clearly readable.',
      lighting:'Soft directional studio light with crisp controlled reflections on the water and gentle highlights on the product.'
    },
    smoke:{
      scene:'A dramatic dark studio with thin atmospheric smoke drifting slowly behind the product, leaving the product fully unobstructed.',
      style:'Dramatic cinematic commercial, photorealistic, bold contrast, deep shadows and premium editorial finish.',
      camera:'Measured cinematic push-in with a subtle side-to-side parallax movement; no sudden moves or shake.',
      lighting:'Directional side and back lighting through the smoke, with a soft controlled key light preserving all product details.'
    },
    minimal:{
      scene:'A clean seamless studio with a simple neutral background, uncluttered composition and a subtle matte or softly reflective surface.',
      style:'Minimalist modern product commercial, photorealistic, clean, precise and elegant, with no unnecessary decoration.',
      camera:'A very slow straight push-in with a steady centered composition and smooth motion.',
      lighting:'Even soft diffused lighting, gentle natural shadows and restrained highlights that show the true product colors.'
    },
    dynamic:{
      scene:'A bold contemporary commercial set with layered depth, subtle environmental movement and a strong hero composition around the product.',
      style:'Energetic high-impact commercial advertising, photorealistic, crisp, modern and visually engaging without looking artificial.',
      camera:'A smooth controlled tracking move with a short dynamic arc, maintaining clear focus and stable product proportions.',
      lighting:'Directional contrast lighting with defined highlights, subtle edge light and balanced exposure across the product.'
    }
  };
  const fillPromptParts=()=>{
    const selectedScene=scenePresets[document.getElementById('scenePreset')?.value];
    const styleTranslations={
      'Realistická luxusná reklama':'photorealistic luxury commercial aesthetic',
      'Minimalistická štúdiová reklama':'minimalist studio product commercial',
      'Športová dynamická reklama':'dynamic sports commercial aesthetic',
      'Prírodná lifestyle reklama':'natural lifestyle commercial aesthetic',
      'Technologická reklama':'modern technology commercial aesthetic'
    };
    const motionTranslations={
      'Pomalé približovanie (push-in)':'a slow, smooth cinematic push-in',
      'Plynulý pohyb zľava doprava':'a smooth camera move from left to right',
      'Jemný orbit okolo produktu':'a gentle cinematic orbit around the product',
      'Detailný makro záber':'a detailed macro close-up shot',
      'Statická kamera':'a locked-off static camera'
    };
    const lightingTranslations={
      'Tmavé štúdio, jemné zlaté okrajové svetlo':'dark studio with subtle golden rim lighting',
      'Svetlé čisté štúdio, mäkké svetlo':'bright clean studio with soft diffused lighting',
      'Dramatické bočné svetlo a tiene':'dramatic side lighting and deep shadows',
      'Vonkajšie prirodzené svetlo':'natural outdoor lighting'
    };
    promptParts.partScene.value=selectedScene?.scene||'A clean premium product-ad scene.';
    promptParts.partProduct.value='Product: '+(document.getElementById('product').value.trim()||'the uploaded product')+'. Preserve its exact identity, design, proportions, packaging, label, logo and original colors.';
    const style=document.getElementById('style').value;
    const motion=document.getElementById('motion').value;
    const lighting=document.getElementById('lighting').value;
    promptParts.partStyle.value=selectedScene?.style||((styleTranslations[style]||style)+'; photorealistic premium commercial quality.');
    promptParts.partCamera.value=selectedScene?.camera||('Camera movement: '+(motionTranslations[motion]||motion)+'. Smooth, stable motion without camera shake.');
    promptParts.partLighting.value=selectedScene?.lighting||('Lighting: '+(lightingTranslations[lighting]||lighting)+'. Use natural reflections and cinematic highlights.');
    promptParts.partExtra.value=document.getElementById('extra').value.trim();
  };
  const syncPromptEditor=(textValue='')=>{promptDraft.value=textValue||'';syncPromptLength();promptStatus.textContent='';loadPartsFromSettings();};
  const composePromptFromParts=()=>{
    const duration=document.getElementById('duration').value;
    const format=document.getElementById('format').value;
    const pieces=[
      'Create a photorealistic '+duration+'-second premium product advertisement for '+(document.getElementById('product').value.trim()||'the uploaded product')+' using all uploaded reference photos of the same product.',
      promptParts.partScene.value.trim(),promptParts.partProduct.value.trim(),promptParts.partStyle.value.trim(),
      promptParts.partCamera.value.trim(),promptParts.partLighting.value.trim(),
      'Aspect ratio: '+format+'. Keep the product sharp and consistent across all frames. Avoid extra objects, altered branding, distorted details and flicker.',
      promptParts.partExtra.value.trim()
    ].filter(Boolean);
    promptDraft.value=pieces.join(' ').slice(0,1000);syncPromptLength();
    if(window.PSAIProjectBridge?.setPrompt)window.PSAIProjectBridge.setPrompt(promptDraft.value);
    promptEditor.querySelectorAll('.add-prompt-part').forEach(button=>{
      button.classList.add('added');button.textContent='✓ Pridané do promptu';
    });
    promptStatus.textContent='Upravené časti boli pridané do výsledného promptu.';
  };
  const loadPartsFromSettings=()=>{fillPromptParts();};
  window.PSAIScenePresets=scenePresets;
  const sceneSelect=document.getElementById('scenePreset');
  const applySelectedScene=()=>{
    const preset=scenePresets[sceneSelect?.value];
    if(!preset)return;
    promptParts.partScene.value=preset.scene;
    promptParts.partStyle.value=preset.style;
    promptParts.partCamera.value=preset.camera;
    promptParts.partLighting.value=preset.lighting;
  };
  sceneSelect?.addEventListener('change',()=>{
    applySelectedScene();
    promptStatus.textContent=sceneSelect.value?'Vybraná reklamná scéna sa použije pri vytvorení promptu.':'Použije sa iba základné nastavenie reklamy.';
  });
  promptEditor.querySelectorAll('.add-prompt-part').forEach(button=>{
    button.addEventListener('click',()=>{
      const value=promptParts[button.dataset.part]?.value.trim();
      if(!value){promptStatus.textContent='Najskôr vyplň túto časť promptu.';return;}
      composePromptFromParts();
      const label=button.closest('.prompt-part')?.querySelector('.prompt-part-toggle')?.textContent.trim()||'Časť';
      promptStatus.textContent='✓ '+label+' bola pridaná do výsledného promptu.';
    });
  });
  document.getElementById('createAiPrompt').addEventListener('click',()=>{
    const button=document.getElementById('createAiPrompt');
    const idea=document.getElementById('aiPromptIdea').value.trim();
    if(!idea){promptStatus.textContent='Najskôr opíš svoju predstavu o reklame.';return;}

    // Offline Slovak-to-English phrasebook. No network request or API key is used.
    const phraseRules=[
      [/za ním nech sa pomaly vznáša/gi,'behind it, let subtle smoke drift slowly'],
      [/nech sa pomaly vznáša jemný dym/gi,'let subtle smoke drift slowly'],
      [/pomaly vznáša jemný dym/gi,'subtle smoke slowly drifts'],
      [/zachovaj jeho pôvodný vzhľad/gi,'preserve its original appearance'],
      [/zachovaj jeho presný tvar/gi,'preserve its exact shape'],
      [/zvýrazni jeho hrany/gi,'highlight its edges'],
      [/čierny mramorový podstavec/gi,'a black marble pedestal'],
      [/biely mramorový podstavec/gi,'a white marble pedestal'],
      [/mramorový podstavec/gi,'a marble pedestal'],
      [/na čiernom mramore/gi,'on black marble'],
      [/čierny mramor/gi,'black marble'],
      [/biely mramor/gi,'white marble'],
      [/drevený podstavec/gi,'a wooden pedestal'],
      [/sklenený podstavec/gi,'a glass pedestal'],
      [/na otočnom podstavci/gi,'on a rotating display pedestal'],
      [/na podstavci/gi,'on a display pedestal'],
      [/na stole/gi,'on a table'],
      [/na kamennom povrchu/gi,'on a stone surface'],
      [/na lesklom povrchu/gi,'on a glossy surface'],
      [/na tmavom povrchu/gi,'on a dark surface'],
      [/v tmavom štúdiu/gi,'in a dark studio'],
      [/v luxusnom štúdiu/gi,'in a luxurious studio'],
      [/v minimalistickom štúdiu/gi,'in a minimalist studio'],
      [/v čistom štúdiu/gi,'in a clean studio'],
      [/v prírode/gi,'in a natural outdoor setting'],
      [/v lese/gi,'in a forest setting'],
      [/pri vode/gi,'beside water'],
      [/na vodnej hladine/gi,'on a reflective water surface'],
      [/vo vzduchu/gi,'suspended in mid-air'],
      [/na čiernom pozadí/gi,'against a black background'],
      [/na bielom pozadí/gi,'against a white background'],
      [/na neutrálnom pozadí/gi,'against a neutral background'],
      [/na farebnom pozadí/gi,'against a colored background'],
      [/v pozadí/gi,'in the background'],
      [/jemný dym/gi,'subtle atmospheric smoke'],
      [/hustý dym/gi,'dense atmospheric smoke'],
      [/dym sa pomaly vznáša/gi,'smoke slowly drifts through the scene'],
      [/dym pomaly stúpa/gi,'smoke slowly rises'],
      [/dym/gi,'smoke'],
      [/vodná para/gi,'water vapor'],
      [/kvapky vody/gi,'water droplets'],
      [/striekajúca voda/gi,'splashing water'],
      [/jemné vlny/gi,'gentle ripples'],
      [/lietajúce častice/gi,'floating particles'],
      [/padajúce kvapky/gi,'falling droplets'],
      [/zlaté svetlo/gi,'warm golden lighting'],
      [/zlaté odlesky/gi,'subtle golden reflections'],
      [/zlaté okrajové svetlo/gi,'golden rim lighting'],
      [/teplé svetlo/gi,'warm lighting'],
      [/studené svetlo/gi,'cool-toned lighting'],
      [/mäkké svetlo/gi,'soft diffused lighting'],
      [/jemné svetlo/gi,'soft gentle lighting'],
      [/bočné svetlo/gi,'directional side lighting'],
      [/protisvetlo/gi,'backlighting'],
      [/dramatic(ké|kého)? svetlo/gi,'dramatic lighting'],
      [/farebné svetlá/gi,'colored accent lights'],
      [/neónové svetlo/gi,'neon lighting'],
      [/svetelné lúče/gi,'visible light rays'],
      [/odrazy svetla/gi,'light reflections'],
      [/hlboké tiene/gi,'deep shadows'],
      [/jemné tiene/gi,'soft shadows'],
      [/kontrastné osvetlenie/gi,'high-contrast lighting'],
      [/prirodzené osvetlenie/gi,'natural lighting'],
      [/produkt stojí/gi,'the product stands'],
      [/produkt leží/gi,'the product rests'],
      [/produkt pláva/gi,'the product floats'],
      [/produkt sa vznáša/gi,'the product is suspended in mid-air'],
      [/produkt umiestni/gi,'place the product'],
      [/umiestni produkt/gi,'place the product'],
      [/zvýrazni produkt/gi,'emphasize the product'],
      [/zvýrazni jeho hrany/gi,'highlight its edges'],
      [/detail produktu/gi,'a detailed product shot'],
      [/detailný záber/gi,'a close-up detail shot'],
      [/detailné zábery/gi,'close-up detail shots'],
      [/záber na produkt/gi,'a shot of the product'],
      [/produkt zblízka/gi,'the product in close-up'],
      [/kamera sa pomaly približuje/gi,'the camera slowly pushes in'],
      [/kamera sa približuje/gi,'the camera moves closer'],
      [/kamera sa vzďaľuje/gi,'the camera slowly pulls back'],
      [/kamera sa otáča okolo produktu/gi,'the camera slowly orbits around the product'],
      [/kamera obieha produkt/gi,'the camera makes a smooth orbit around the product'],
      [/kamera sa otáča/gi,'the camera slowly rotates'],
      [/kamera obieha/gi,'the camera makes a smooth orbit'],
      [/kamera ide zľava doprava/gi,'the camera moves smoothly from left to right'],
      [/kamera ide sprava doľava/gi,'the camera moves smoothly from right to left'],
      [/kamera ide zhora nadol/gi,'the camera moves from top to bottom'],
      [/kamera ide zdola nahor/gi,'the camera moves from bottom to top'],
      [/pomalý približovací záber/gi,'a slow cinematic push-in'],
      [/pomalý pohyb kamery/gi,'slow, smooth camera movement'],
      [/plynulý pohyb kamery/gi,'smooth, controlled camera movement'],
      [/kamera obíde/gi,'the camera orbits around'],
      [/otočný záber/gi,'a smooth rotating camera shot'],
      [/záber z nízkeho uhla/gi,'a low-angle shot'],
      [/záber zhora/gi,'a top-down shot'],
      [/záber spredu/gi,'a front-facing shot'],
      [/záber zboku/gi,'a side-angle shot'],
      [/makro záber/gi,'a macro close-up shot'],
      [/spomalený záber/gi,'a slow-motion shot'],
      [/rýchly pohyb kamery/gi,'a fast camera movement'],
      [/bez pohybu kamery/gi,'with a locked-off camera'],
      [/bez otrasov/gi,'without camera shake'],
      [/zachovaj/gi,'preserve'],
      [/zachovať/gi,'preserve'],
      [/musí zostať zachovaný/gi,'must remain unchanged'],
      [/pôvodný vzhľad/gi,'the original appearance'],
      [/pôvodné farby/gi,'the original colors'],
      [/pôvodný tvar/gi,'the original shape'],
      [/presný tvar/gi,'the exact shape'],
      [/logo/gi,'logo'],
      [/obal/gi,'packaging'],
      [/farby/gi,'colors'],
      [/materiál/gi,'material'],
      [/text na obale/gi,'text on the packaging'],
      [/nápisy/gi,'printed text'],
      [/značku/gi,'brand'],
      [/bez zmeny/gi,'without alteration'],
      [/nič nepridávaj/gi,'do not add anything'],
      [/nepridávaj ďalšie predmety/gi,'do not add extra objects'],
      [/bez ďalších predmetov/gi,'with no additional objects'],
      [/bez ľudí/gi,'with no people'],
      [/bez rúk/gi,'with no hands'],
      [/bez textu/gi,'with no added text'],
      [/bez nápisov/gi,'with no added lettering'],
      [/bez deformácií/gi,'with no distortion'],
      [/bez blikania/gi,'with no flicker'],
      [/luxusná reklama/gi,'luxury commercial aesthetic'],
      [/prémiová reklama/gi,'premium commercial aesthetic'],
      [/minimalistická reklama/gi,'minimalist product commercial'],
      [/dynamická reklama/gi,'dynamic commercial style'],
      [/luxusný/gi,'luxurious'],
      [/minimalistický/gi,'minimalist'],
      [/moderný/gi,'modern'],
      [/elegantný/gi,'elegant'],
      [/dramatický/gi,'dramatic'],
      [/filmový/gi,'cinematic'],
      [/fotorealistický/gi,'photorealistic'],
      [/realistický/gi,'realistic'],
      [/umelecký/gi,'artistic'],
      [/čistý/gi,'clean'],
      [/tmavé štúdio/gi,'a dark studio'],
      [/čisté pozadie/gi,'a clean background'],
      [/odlesky/gi,'reflections'],
      [/odrazy/gi,'reflections'],
      [/plynulo/gi,'smoothly'],
      [/pomaly/gi,'slowly'],
      [/jemne/gi,'gently'],
      [/realisticky/gi,'realistically'],
      [/výrazne/gi,'boldly']
    ];
    const translateKnown=text=>phraseRules.reduce((value,[pattern,replacement])=>value.replace(pattern,replacement),text)
      .replace(/\s+/g,' ').replace(/\s+([,.!?])/g,'$1').trim();

    const splitClauses=text=>text
      .replace(/\s+(a zároveň|a potom|potom|pričom|zatiaľ čo)\s+/gi,'. ')
      .split(/(?<=[.!?;])\s+|[,;\n]+/).map(value=>value.trim()).filter(Boolean);
    const buckets={scene:[],product:[],style:[],camera:[],lighting:[],extra:[]};
    const untranslated=[];
    for(const clause of splitClauses(idea)){
      const lower=clause.toLocaleLowerCase('sk');
      const translated=translateKnown(clause);
      const hasEnglish=translated!==clause;
      if(/kamera|záber|pohyb|otáč|približ|orbit|uhol|spomalen/.test(lower))buckets.camera.push(translated);
      else if(/svetl|osvet|zlat|tieň|odlesk|reflex|žiaren|neón|kontrast/.test(lower))buckets.lighting.push(translated);
      else if(/produkt|logo|obal|farb|tvar|materiál|značk|nápis|text/.test(lower))buckets.product.push(translated);
      else if(/štýl|luxus|minimal|modern|elegant|dramat|filmov|fotoreal|realist|reklam|umeleck/.test(lower))buckets.style.push(translated);
      else if(/pozad|prostred|scén|dym|mramor|podstavec|voda|povrch|stojí|leží|pláva|vznáša|stôl|les|prírod|kvapk|para|častic/.test(lower))buckets.scene.push(translated);
      else buckets.extra.push(translated);
      if(!hasEnglish && /[áäčďéíĺľňóôŕšťúýž]/i.test(clause))untranslated.push(clause);
    }

    const appendUnique=(field,values)=>{
      const current=promptParts[field].value.trim();
      const additions=values.filter(value=>value&&!current.toLocaleLowerCase().includes(value.toLocaleLowerCase()));
      if(additions.length)promptParts[field].value=[current,...additions].filter(Boolean).join(' ');
    };
    appendUnique('partScene',buckets.scene);
    appendUnique('partProduct',buckets.product);
    appendUnique('partStyle',buckets.style);
    appendUnique('partCamera',buckets.camera);
    appendUnique('partLighting',buckets.lighting);
    appendUnique('partExtra',buckets.extra);
    composePromptFromParts();
    promptEditor.querySelectorAll('.add-prompt-part').forEach(item=>{item.classList.remove('added');item.textContent='Pridať do promptu';});
    const retained=untranslated.length;
    promptStatus.textContent=retained
      ? '✓ Zadanie bolo rozdelené. Niektoré menej bežné formulácie zostali v pôvodnom jazyku, aby sa nestratil ich význam. Skontroluj výsledok.'
      : '✓ Zadanie bolo rozdelené do častí a vložené do promptu. Skontroluj a podľa potreby uprav výsledok.';
    button.textContent='✓ Zadanie rozdelené';
    button.disabled=true;
    window.setTimeout(()=>{button.textContent='✦ Rozdeliť zadanie do častí';button.disabled=false;},1400);
  });
  document.getElementById('composePrompt').addEventListener('click',composePromptFromParts);
  document.getElementById('resetPromptParts').addEventListener('click',()=>{loadPartsFromSettings();composePromptFromParts();promptStatus.textContent='Časti promptu boli obnovené podľa nastavení reklamy.';});
  promptDraft.addEventListener('input',()=>{syncPromptLength();if(window.PSAIProjectBridge?.setPrompt)window.PSAIProjectBridge.setPrompt(promptDraft.value);});
  loadPartsFromSettings();
  document.getElementById('copyPromptDraft').addEventListener('click',async()=>{
    const value=promptDraft.value.trim();if(!value){promptStatus.textContent='Nie je čo kopírovať.';return;}
    try{await navigator.clipboard.writeText(value);promptStatus.textContent='Prompt bol skopírovaný.';}
    catch(error){promptDraft.focus();promptDraft.select();try{document.execCommand('copy');promptStatus.textContent='Prompt bol skopírovaný.';}catch(e){promptStatus.textContent='Kopírovanie sa nepodarilo. Označ text a skopíruj ho ručne.';}}
  });
  const originalPromptButton=document.getElementById('makePrompt');
  if(originalPromptButton)originalPromptButton.addEventListener('click',()=>{setTimeout(()=>syncPromptEditor(document.getElementById('prompt').textContent||''),0);});
  syncPromptEditor(document.getElementById('prompt').textContent==='Po výbere produktu sa tu zobrazí reklamný prompt.'?'':document.getElementById('prompt').textContent);
  renderProjects().catch(error=>{projectsList.textContent='Knižnicu projektov sa nepodarilo načítať: '+error.message;});


})();