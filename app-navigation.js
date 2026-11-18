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
      padding:8px 12px calc(8px + env(safe-area-inset-bottom, 0px)) !important;
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
  projectsIntro.innerHTML='<h2>Moje projekty</h2><p>Všetky tvoje produktové projekty a reklamné výstupy budú na jednom mieste.</p><p><strong>Pracovný priestor PRODUCT STUDIO AI</strong></p>';


  connection.remove();
  settings.innerHTML='<section class="app-placeholder"><h2>Zabezpečenie</h2><p>Najskôr bezpečne over pripojenie generátora. Tento test nevytvára video a nemíňa Runway kredity.</p><button id="verifyConnection" class="secondary">Overiť pripojenie</button><p id="connectionCheckStatus" role="status">Pripojenie zatiaľ nebolo overené.</p><button id="logoutButton" class="secondary">Odhlásiť toto zariadenie</button></section>';
  settings.querySelector('#verifyConnection').addEventListener('click',async()=>{
    const button=settings.querySelector('#verifyConnection'),status=settings.querySelector('#connectionCheckStatus');
    const apiBase='https://square-feather-4b83.marianholka94.workers.dev';
    button.disabled=true;status.textContent='Overujem bezpečné pripojenie…';
    try {
      let token=localStorage.getItem('psai_session_token')||'';
      let health=token?await fetch(apiBase+'/api/health',{headers:{Authorization:'Bearer '+token}}):null;
      if(!health||health.status===401) {
        localStorage.removeItem('psai_session_token');
        const password=await window.requestAppPassword();
        if(!password)throw new Error('Prihlásenie bolo zrušené.');
        const login=await fetch(apiBase+'/api/session',{method:'POST',headers:{'X-App-Password':password}});
        const loginData=await login.json().catch(()=>({}));
        if(!login.ok||!loginData.token)throw new Error(loginData.error||'Prihlásenie sa nepodarilo.');
        token=loginData.token;health=await fetch(apiBase+'/api/health',{headers:{Authorization:'Bearer '+token}});
      }
      const result=await health.json().catch(()=>({}));
      if(!health.ok||!result.ok)throw new Error(result.error||'Backend neodpovedá správne.');
      localStorage.setItem('psai_session_token',token);
      status.textContent='Pripojenie je úspešne overené. Generátor je pripravený.';status.style.color='#9ce0b8';
    } catch(error) {
      status.textContent=error.message||'Overenie pripojenia zlyhalo.';status.style.color='#ffb5b5';
    } finally { button.disabled=false; }
  });
  settings.querySelector('#logoutButton').addEventListener('click',()=>{
    localStorage.removeItem('psai_session_token');
    settings.querySelector('#connectionCheckStatus').textContent='Zariadenie bolo odhlásené.';
    alert('Zariadenie bolo odhlásené. Pri ďalšom overení sa prihlásiš znova.');
  });

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
      if(target==='screenProjects'){renderProjects().catch(error=>{projectsList.textContent='Knižnicu projektov sa nepodarilo načítať: '+error.message;});renderProducts().catch(error=>{productsList.textContent='Knižnicu produktov sa nepodarilo načítať: '+error.message;});}renderProducts().catch(error=>{productsList.textContent='Knižnicu produktov sa nepodarilo načítať: '+error.message;});
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  document.body.appendChild(nav);

  // Local project library backed by IndexedDB (project metadata + original image files).
  const projectDbName='product-studio-ai-projects', projectStoreName='projects';
  let activeProjectId=null, activeProductId=null, projectDbPromise=null;
  const openProjectDb=()=>{
    if(projectDbPromise)return projectDbPromise;
    projectDbPromise=new Promise((resolve,reject)=>{
      const request=indexedDB.open(projectDbName,2);
      request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains(projectStoreName)){const store=db.createObjectStore(projectStoreName,{keyPath:'id'});store.createIndex('updatedAt','updatedAt');}if(!db.objectStoreNames.contains('products')){const products=db.createObjectStore('products',{keyPath:'id'});products.createIndex('updatedAt','updatedAt');}};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Databázu projektov sa nepodarilo otvoriť.'));
    });return projectDbPromise;
  };
  const projectRequest=(mode,operation)=>openProjectDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction(projectStoreName,mode);let request;
    try{request=operation(tx.objectStore(projectStoreName));}catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(tx.error||new Error('Operácia s projektom zlyhala.'));
    tx.onabort=()=>reject(tx.error||new Error('Operácia s projektom bola prerušená.'));
  }));
  const getAllProjects=()=>projectRequest('readonly',store=>store.getAll());
  const productRequest=(mode,operation)=>openProjectDb().then(db=>new Promise((resolve,reject)=>{
    const tx=db.transaction('products',mode);let request;
    try{request=operation(tx.objectStore('products'));}catch(error){reject(error);return;}
    tx.oncomplete=()=>resolve(request?.result);tx.onerror=()=>reject(tx.error||new Error('Operácia s produktom zlyhala.'));
    tx.onabort=()=>reject(tx.error||new Error('Operácia s produktom bola prerušená.'));
  }));
  const getAllProducts=()=>productRequest('readonly',store=>store.getAll());
  const getProduct=id=>productRequest('readonly',store=>store.get(id));
  const putProduct=product=>productRequest('readwrite',store=>store.put(product));
  const removeProduct=id=>productRequest('readwrite',store=>store.delete(id));
  const getProject=id=>projectRequest('readonly',store=>store.get(id));
  const putProject=project=>projectRequest('readwrite',store=>store.put(project));
  const removeProject=id=>projectRequest('readwrite',store=>store.delete(id));

  const projectsList=document.createElement('div');projectsList.id='savedProjectsList';
  projectsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▣</span><strong>Zatiaľ tu nemáš žiadne projekty</strong><p>Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.</p></div>';
    const productsIntro=document.createElement('section');productsIntro.className='app-placeholder';productsIntro.dataset.sectionIcon='📦';
  productsIntro.innerHTML='<div class="library-title-row"><h2>Moja knižnica produktov</h2><button type="button" class="info-toggle" id="productLibraryInfoButton" aria-expanded="false" aria-controls="productLibraryInfo" aria-label="Zobraziť informáciu">i</button></div><p id="productLibraryInfo" class="collapsible-info" hidden>Ulož produkty raz a použi ich znova v ďalších reklamných projektoch.</p>';
  const productsList=document.createElement('div');productsList.id='savedProductsList';
  productsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▧</span><strong>Zatiaľ nemáš uložené produkty</strong><p>V štúdiu môžeš uložiť produkt spolu s jeho fotografiami.</p></div>';
  projects.append(projectsIntro,productsIntro,productsList,history,projectsList);
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
    const records=(await getAllProjects()).sort((a,b)=>b.updatedAt-a.updatedAt);const linkedProducts=await getAllProducts();const linkedProductNames=new Map(linkedProducts.map(item=>[item.id,item.name]));projectsList.innerHTML='';
    if(!records.length){projectsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▣</span><strong>Zatiaľ tu nemáš žiadne projekty</strong><p>Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.</p></div>';return;}
    records.forEach(record=>{
      const card=document.createElement('article');card.className='saved-project-card';
      const thumb=document.createElement('img');thumb.className='saved-project-thumb';thumb.alt='';
      const firstImage=record.images?.[0]?.blob;if(firstImage)thumb.src=URL.createObjectURL(firstImage);
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
      buttons.append(open,duplicate,remove);info.append(title,meta,buttons);card.append(thumb,info);projectsList.append(card);
    });
  };

  const productManagerBackdrop=document.createElement('div');
  productManagerBackdrop.className='product-manager-backdrop';
  productManagerBackdrop.hidden=true;
  productManagerBackdrop.innerHTML='<section class="product-manager" role="dialog" aria-modal="true" aria-labelledby="productManagerTitle"><div class="product-manager-head"><h3 id="productManagerTitle">Správa produktu</h3><button type="button" class="secondary product-manager-close" aria-label="Zavrieť">×</button></div><p class="product-manager-sub">Spravuj fotografie produktu. Môžeš pridať nové, odstrániť nepotrebné alebo zmeniť hlavnú fotografiu.</p><div class="product-manager-grid" id="productManagerGrid"></div><p class="product-manager-count" id="productManagerCount"></p><div class="product-manager-actions"><button type="button" class="secondary product-manager-add" id="addProductPhotos">＋ Pridať fotografie</button><button type="button" class="secondary" id="cancelProductManager">Zavrieť</button><button type="button" id="saveProductPhotos">Uložiť zmeny</button><button type="button" class="secondary product-manager-create" id="createProjectFromProduct">＋ Vytvoriť reklamný projekt</button></div><input type="file" id="productPhotoInput" accept="image/*" multiple hidden></section>';
  document.body.append(productManagerBackdrop);
  let managingProductId=null,managingProductName='',managingProductImages=[];
  const closeProductManager=()=>{productManagerBackdrop.hidden=true;managingProductId=null;managingProductName='';managingProductImages=[];productManagerBackdrop.querySelector('#productManagerGrid').innerHTML='';};
  productManagerBackdrop.querySelector('.product-manager-close').addEventListener('click',closeProductManager);
  productManagerBackdrop.querySelector('#cancelProductManager').addEventListener('click',closeProductManager);
  productManagerBackdrop.addEventListener('click',event=>{if(event.target===productManagerBackdrop)closeProductManager();});
  const showProductManagerMessage=message=>{const count=productManagerBackdrop.querySelector('#productManagerCount');count.textContent=message;count.style.color='#ffb5b5';};
  const renderProductManagerImages=()=>{
    const grid=productManagerBackdrop.querySelector('#productManagerGrid');grid.innerHTML='';
    managingProductImages.forEach((photo,index)=>{
      const tile=document.createElement('div');tile.className='product-manager-image';
      const img=document.createElement('img');img.alt='Fotografia '+(index+1);img.src=URL.createObjectURL(photo.blob);
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
    const records=(await getAllProducts()).sort((a,b)=>b.updatedAt-a.updatedAt);const linkedProjects=await getAllProjects();const linkedProjectCounts=new Map(records.map(item=>[item.id,linkedProjects.filter(project=>project.productId===item.id).length]));productsList.innerHTML='';
    if(!records.length){productsList.innerHTML='<div class="projects-empty"><span class="empty-icon">▧</span><strong>Zatiaľ nemáš uložené produkty</strong><p>V štúdiu môžeš uložiť produkt spolu s jeho fotografiami.</p></div>';return;}
    records.forEach(record=>{
      const card=document.createElement('article');card.className='saved-product-card';
      const thumb=document.createElement('img');thumb.className='saved-product-thumb';thumb.alt='';
      const first=record.images?.[0]?.blob;if(first)thumb.src=URL.createObjectURL(first);
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
      buttons.append(manage,use,rename,remove);info.append(title,meta,buttons);card.append(thumb,info);productsList.append(card);
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
    const editedPrompt=promptDraft.value.trim()||state.prompt;const record={id:activeProjectId||('project-'+now+'-'+Math.random().toString(36).slice(2,8)),name:state.product.trim()||'Nový produkt',createdAt:existing?.createdAt||now,updatedAt:now,product:state.product,productId:activeProductId||existing?.productId||null,style:state.style,scenePreset:state.scenePreset||'',format:state.format,motion:state.motion,duration:state.duration,lighting:state.lighting,extra:state.extra,prompt:editedPrompt,images:state.images};
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
    <div class="prompt-editor-heading"><strong>Editor reklamného promptu</strong><span id="promptLength">0 / 1000</span></div>
    <p class="prompt-save-hint">Uprav jednotlivé časti reklamy a následne z nich zostav výsledný prompt.</p>
    <div class="prompt-parts">
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partScenePanel">Prostredie a scéna <span>＋</span></button>
        <div class="prompt-part-panel" id="partScenePanel" hidden><textarea id="partScene" rows="4" placeholder="Opíš prostredie, pozadie, rekvizity a atmosféru scény…"></textarea></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partProductPanel">Produkt a jeho vzhľad <span>＋</span></button>
        <div class="prompt-part-panel" id="partProductPanel" hidden><textarea id="partProduct" rows="4" placeholder="Čo musí zostať zachované? Tvar, obal, logo, farby, materiál…"></textarea></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partStylePanel">Vizuálny štýl <span>＋</span></button>
        <div class="prompt-part-panel" id="partStylePanel" hidden><textarea id="partStyle" rows="4" placeholder="Napr. prémiový, fotorealistický, cinematic…"></textarea></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partCameraPanel">Kamera a pohyb <span>＋</span></button>
        <div class="prompt-part-panel" id="partCameraPanel" hidden><textarea id="partCamera" rows="4" placeholder="Opíš uhol záberu, pohyb kamery a tempo…"></textarea></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partLightingPanel">Osvetlenie <span>＋</span></button>
        <div class="prompt-part-panel" id="partLightingPanel" hidden><textarea id="partLighting" rows="4" placeholder="Napr. mäkké bočné svetlo, odlesky, tiene…"></textarea></div>
      </div>
      <div class="prompt-part">
        <button type="button" class="prompt-part-toggle" aria-expanded="false" aria-controls="partExtraPanel">Ďalšie pokyny <span>＋</span></button>
        <div class="prompt-part-panel" id="partExtraPanel" hidden><textarea id="partExtra" rows="4" placeholder="Čomu sa má reklama vyhnúť? Čo má zdôrazniť?"></textarea></div>
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
  `;
  advertising.after(promptEditor);
  const promptStyle=document.createElement('style');
  promptStyle.textContent=`
    #promptEditor{margin:12px 0 18px;padding:14px;background:#10151d;border:1px solid #303b49;border-radius:16px;color:#e8edf5}
    .prompt-editor-heading{display:flex;justify-content:space-between;gap:8px;align-items:center;margin-bottom:12px}
    .prompt-editor-heading strong{font-size:14px;color:#f2f4f8;font-weight:750}
    #promptLength{font-size:11px;color:#d6b66e}
    .prompt-label{display:block;margin:10px 0 6px;font-size:12px;color:#aab4c3}
    #promptEditor textarea{width:100%;box-sizing:border-box;background:#0b1017;color:#eef1f6;border:1px solid #354253;border-radius:11px;padding:11px;font:inherit;font-size:14px;resize:vertical;line-height:1.5;min-height:64px}
    #promptEditor #promptDraftText{min-height:150px}
    #scenePreset{width:100%;min-height:48px;background:#0e131a;color:#f3f5f8;border:1px solid #303b49;border-radius:16px;padding:12px;font:inherit;font-size:15px}
    .prompt-parts{display:grid;grid-template-columns:1fr;gap:8px;margin:12px 0 16px}
    .prompt-part{overflow:hidden;border:1px solid #303b49;border-radius:12px;background:#151c26}
    .prompt-part-toggle{width:100%;min-height:48px!important;display:flex;align-items:center;justify-content:space-between;text-align:left;background:#1a222e!important;color:#e8edf5!important;border:0!important;border-radius:0!important;padding:12px 14px!important}
    .prompt-part-toggle span{color:#d6b66e;font-size:18px}
    .prompt-part-panel{padding:10px}
    .prompt-part-panel[hidden]{display:none}
    .prompt-part-panel textarea{min-height:104px!important}
    .prompt-editor-actions{display:grid;grid-template-columns:1fr;gap:8px;margin-top:10px}
    .prompt-editor-actions button,#composePrompt{margin:0;min-height:44px!important}
    #promptEditorStatus{min-height:18px;margin-top:8px;color:#9ce0b8;font-size:12px}
    .prompt-save-hint{margin:2px 0 0;color:#8995a6;font-size:12px;line-height:1.5}
  `;
  document.head.appendChild(promptStyle);
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
    promptParts.partScene.value=selectedScene?.scene||'A clean premium product-ad scene.';
    promptParts.partProduct.value='Product: '+(document.getElementById('product').value.trim()||'the uploaded product')+'. Preserve its exact identity, design, proportions, packaging, label, logo and original colors.';
    promptParts.partStyle.value=selectedScene?.style||('Photorealistic '+document.getElementById('style').value+' premium commercial style.');
    promptParts.partCamera.value=selectedScene?.camera||('Camera movement: '+document.getElementById('motion').value+'. Smooth, stable motion without camera shake.');
    promptParts.partLighting.value=selectedScene?.lighting||('Lighting: '+document.getElementById('lighting').value+'. Use natural reflections and cinematic highlights.');
    promptParts.partExtra.value=document.getElementById('extra').value.trim();
  };
  const syncPromptEditor=(textValue='')=>{promptDraft.value=textValue||'';syncPromptLength();promptStatus.textContent='';loadPartsFromSettings();};
  const composePromptFromParts=()=>{
    const duration=document.getElementById('duration').value;
    const format=document.getElementById('format').value;
    const pieces=[
      'Create a photorealistic '+duration+'-second premium product advertisement using all uploaded reference photos of the same product.',
      promptParts.partScene.value.trim(),promptParts.partProduct.value.trim(),promptParts.partStyle.value.trim(),
      promptParts.partCamera.value.trim(),promptParts.partLighting.value.trim(),
      'Aspect ratio: '+format+'. Keep the product sharp and consistent across all frames. Avoid extra objects, altered branding, distorted details and flicker.',
      promptParts.partExtra.value.trim()
    ].filter(Boolean);
    promptDraft.value=pieces.join(' ').slice(0,1000);syncPromptLength();
    if(window.PSAIProjectBridge?.setPrompt)window.PSAIProjectBridge.setPrompt(promptDraft.value);
    promptStatus.textContent='Prompt bol zostavený z upravených častí.';
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
