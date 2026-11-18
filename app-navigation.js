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

    /* Navigácia je súčasťou toku stránky, nie plávajúci/fixný panel.
       V natívnej Android aplikácii tak zostane nad systémovými tlačidlami Androidu. */
    #appBottomNav {
      position:static !important;
      inset:auto !important;
      z-index:auto !important;
      transform:none !important;
      width:100% !important;
      margin:22px 0 64px !important;
      display:grid !important;
      grid-template-columns:repeat(3,minmax(0,1fr)) !important;
      align-items:stretch !important;
      gap:8px !important;
      padding:10px 8px 12px !important;
      background:#0f131a !important;
      border:1px solid #293442 !important;
      border-radius:20px !important;
      box-shadow:0 8px 24px rgba(0,0,0,.2);
    }
    #appBottomNav button {
      min-width:0 !important;min-height:68px !important;padding:12px 3px !important;
      margin:0 !important;display:flex !important;flex-direction:column !important;
      align-items:center !important;justify-content:center !important;gap:10px !important;
      background:transparent !important;color:#8792a2 !important;border:0 !important;
      font-size:12px !important;line-height:1.2 !important;font-weight:800 !important;
      border-radius:18px !important;
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
  projects.append(projectsIntro,history);

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
      window.scrollTo({top:0,behavior:'smooth'});
    });
  });
  document.body.appendChild(nav);
})();
