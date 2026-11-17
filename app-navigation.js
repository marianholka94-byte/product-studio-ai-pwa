(() => {
  const sections = [...document.querySelectorAll('section.panel')];

  const findSection = number =>
    sections.find(section =>
      section.querySelector('h2')?.textContent.trim().startsWith(number + '.')
    );

  // Independent connection button handler: this file is loaded externally,
  // so the connection action does not depend on inline page scripts.
  document.addEventListener('click', async event => {
    const button = event.target.closest('#saveConfig');
    if (!button) return;
    event.preventDefault();
    event.stopPropagation();
    const box = document.getElementById('connectionStatus');
    const base = (document.getElementById('apiUrl')?.value || '').trim().replace(/\\/+$/, '');
    const password = document.getElementById('appPassword')?.value || '';
    if (!box) return;
    box.textContent = 'Kliknutie zachytené. Kontrolujem údaje…';
    box.className = 'status';
    if (!base || !password) {
      box.textContent = 'Zadaj adresu backendu aj súkromný prístupový kód.';
      box.className = 'status err';
      return;
    }
    try {
      localStorage.setItem('psai_api_url', base);
      sessionStorage.setItem('psai_password', password);
      box.textContent = 'Údaje uložené. Overujem backend…';
      const response = await fetch(base + '/api/health', {
        method: 'GET',
        headers: { 'X-App-Password': password }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || ('HTTP ' + response.status));
      box.textContent = 'Spojenie s backendom funguje.';
      box.className = 'status ok';
    } catch (error) {
      box.textContent = 'Tlačidlo funguje, chyba spojenia: ' + (error.message || 'Neznáma chyba');
      box.className = 'status err';
    }
  }, true);

  const connection = findSection(1);
  const product = findSection(2);
  const advertising = findSection(3);
  const generation = findSection(4);
  const history = findSection(5);

  if (!connection || !product || !advertising || !generation || !history) {
    console.error('PRODUCT STUDIO AI: Chýba niektorá sekcia.');
    return;
  }

  // Odstranenie cisel z nazvov vsetkych hlavnych sekcii
  connection.querySelector('h2').textContent = 'Pripojenie generátora';
  product.querySelector('h2').textContent = 'Produkt';
  advertising.querySelector('h2').textContent = 'Nastavenie reklamy';
  generation.querySelector('h2').textContent = 'Generovanie videa';
  history.querySelector('h2').textContent = 'História posledného generovania';

  // Velke orientacne ikony v hlavnych sekciach aplikacie
  [
    [connection, '⚡'],
    [product, '📦'],
    [advertising, '🎨'],
    [generation, '🎬'],
    [history, '🕘']
  ].forEach(([section, icon]) => {
    const heading = section.querySelector('h2');
    if (heading) heading.dataset.sectionIcon = icon;
  });

  const style = document.createElement('style');
  style.textContent = `
    :root {
      color-scheme: dark;
      font-family: Inter, system-ui, -apple-system, sans-serif;
      background: #0b0e13;
      color: #f3f5f8;
    }

    body {
      background: #0b0e13 !important;
      color: #f3f5f8 !important;
      padding: 18px 14px calc(105px + env(safe-area-inset-bottom)) !important;
    }

    header {
      margin: 12px 3px 26px !important;
      align-items: center;
    }

    header h1 {
      color: #fff;
      font-size: 21px;
      font-weight: 800;
      letter-spacing: 1.3px;
    }

    header .muted {
      color: #8993a3;
      font-size: 12px;
      margin-top: 5px;
    }

    header > span {
      color: #d6b66e !important;
      font-weight: 700;
    }

    #appViews {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
    }


    .app-screen {
      display: none;
    }

    .app-screen.active {
      display: block;
      animation: screenIn .22s ease;
    }

    @keyframes screenIn {
      from { opacity: 0; transform: translateY(7px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .panel,
    .app-placeholder {
      background: #151a22 !important;
      border: 1px solid #27303c !important;
      border-radius: 19px !important;
      padding: 18px !important;
      margin: 13px 0 !important;
      color: #f3f5f8 !important;
      box-shadow: 0 8px 24px rgba(0,0,0,.16);
    }

    h2 {
      color: #fff !important;
      font-size: 16px !important;
      font-weight: 750 !important;
      margin-bottom: 17px !important;
    }

    label {
      color: #aeb8c7 !important;
      font-size: 12px !important;
      font-weight: 650 !important;
    }

    input, select, textarea {
      background: #0e131a !important;
      color: #f3f5f8 !important;
      border: 1px solid #303b49 !important;
      border-radius: 12px !important;
      min-height: 45px;
      font-size: 14px !important;
    }

    input::placeholder, textarea::placeholder {
      color: #657184 !important;
    }

    input:focus, select:focus, textarea:focus {
      outline: none;
      border-color: #c9a75d !important;
      box-shadow: 0 0 0 2px rgba(201,167,93,.15);
    }

    input:disabled {
      opacity: .65;
    }

    button {
      border-radius: 12px !important;
      min-height: 46px;
      font-weight: 750 !important;
      background: linear-gradient(135deg,#d9bd7d,#b58b42) !important;
      color: #17130b !important;
      border: 0 !important;
      letter-spacing: .2px;
    }

    button.secondary {
      background: #252e3a !important;
      color: #e7edf5 !important;
      border: 1px solid #354253 !important;
    }

    button:disabled {
      opacity: .45;
    }

    .muted, .note, .small {
      color: #8995a6 !important;
    }

    .output {
      background: #0e131a !important;
      border: 1px solid #293442;
      color: #dbe2ec !important;
      border-radius: 12px !important;
    }

    .status {
      background: #302817 !important;
      color: #f0d99f !important;
      border: 1px solid #59482a;
      border-radius: 12px !important;
    }

    .status.ok {
      background: #142b22 !important;
      color: #9ce0b8 !important;
      border-color: #285b40;
    }

    .status.err {
      background: #321c20 !important;
      color: #ffb5b5 !important;
      border-color: #663139;
    }

    .preview {
      background: #0e131a !important;
      border: 1px solid #303b49;
    }

    video {
      border: 1px solid #303b49;
    }

    a {
      color: #d9bd7d !important;
    }

    .app-placeholder {
      text-align: left;
      padding: 22px !important;
    }

    .app-placeholder h2 {
      font-size: 20px !important;
      margin-bottom: 10px !important;
    }

    .app-placeholder p {
      color: #aeb8c7;
      font-size: 13px;
      line-height: 1.6;
    }

        #appBottomNav {
      position: fixed !important;
      z-index: 99999 !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      width: 100%;
      margin: 0 !important;
      transform: none !important;
      display: grid;
      visibility: visible;
      opacity: 1;
      pointer-events: auto;
      grid-template-columns: repeat(3, 1fr);
      gap: 7px;
      padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
      background: rgba(15,19,26,.97);
      border-top: 1px solid #293442;
      backdrop-filter: blur(18px);
    }

    #appBottomNav button {
      background: transparent !important;
      color: #8792a2 !important;
      border: 0 !important;
      min-height: 52px;
      padding: 5px 3px;
      margin: 0;
      font-size: 11px;
      border-radius: 12px !important;
    }

    #appBottomNav button.active {
      background: #29251c !important;
      color: #e2c47e !important;
    }

    #appBottomNav button span {
      display: block;
      font-size: 20px;
      margin-bottom: 3px;
    }

    @media(max-width:430px) {
      body {
        padding-inline: 11px !important;
      }
      .panel {
        padding: 16px !important;
      }
    }

    /* Mobilne rozlozenie a citatelnost */
    body {
      width: 100% !important;
      max-width: none !important;
      padding: 16px 12px calc(120px + env(safe-area-inset-bottom)) !important;
    }

    #appViews {
      width: 100% !important;
      max-width: none !important;
    }

    header h1 {
      font-size: 24px !important;
    }

    .panel, .app-placeholder {
      padding: 20px !important;
      margin: 14px 0 !important;
      border-radius: 20px !important;
    }

    h2 {
      font-size: 19px !important;
      line-height: 1.35 !important;
    }

    label {
      font-size: 14px !important;
      margin-top: 16px !important;
    }

    input, select, textarea {
      font-size: 16px !important;
      min-height: 52px !important;
      padding: 14px !important;
    }

    textarea {
      min-height: 100px !important;
    }

    button {
      font-size: 15px !important;
      min-height: 54px !important;
    }

    .note, .muted, .small {
      font-size: 14px !important;
      line-height: 1.55 !important;
    }

    .output {
      font-size: 15px !important;
      line-height: 1.6 !important;
    }

    .grid {
      grid-template-columns: 1fr !important;
      gap: 8px !important;
    }

                        /* ZJEDNOTENY MOBILNY DIZAJN */
    #appBottomNav {
      min-height: 160px !important;
      padding: 14px 8px calc(14px + env(safe-area-inset-bottom)) !important;
      gap: 8px !important;
      grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
      align-items: stretch !important;
    }

    #appBottomNav button {
      min-width: 0 !important;
      min-height: 132px !important;
      padding: 12px 3px !important;
      font-size: 23px !important;
      line-height: 1.2 !important;
      font-weight: 800 !important;
      border-radius: 18px !important;
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
    }

    #appBottomNav button span {
      display: block !important;
      font-size: 56px !important;
      line-height: 1 !important;
      margin: 0 !important;
    }

    /* JEDNOTNA VELKOST PISMA A IKON V CELEJ APLIKACII */
    body {
      font-size: 24px !important;
    }

    header h1 {
      font-size: 39px !important;
      line-height: 1.2 !important;
      letter-spacing: 1px !important;
    }

    header .muted {
      font-size: 25px !important;
      line-height: 1.5 !important;
    }

    .panel h2,
    .app-placeholder h2,
    .studio-welcome h2 {
      font-size: 40px !important;
      line-height: 1.3 !important;
      margin-bottom: 26px !important;
    }

    .panel h2[data-section-icon],
    .app-placeholder[data-section-icon] h2 {
      display: flex !important;
      align-items: center !important;
      gap: 20px !important;
    }

    .panel h2[data-section-icon]::before,
    .app-placeholder[data-section-icon] h2::before {
      content: attr(data-section-icon);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 68px;
      width: 68px;
      height: 68px;
      font-size: 52px;
      line-height: 1;
    }

    .panel label {
      display: block !important;
      font-size: 35px !important;
      line-height: 1.35 !important;
      font-weight: 700 !important;
      margin: 28px 0 12px !important;
      color: #e0e6ef !important;
    }

    .panel input,
    .panel select,
    .panel textarea {
      width: 100% !important;
      min-height: 120px !important;
      font-size: 38px !important;
      line-height: 1.3 !important;
      padding: 24px !important;
      border-radius: 16px !important;
    }

    .panel input::placeholder,
    .panel textarea::placeholder {
      font-size: 32px !important;
    }

    .panel select option {
      font-size: 34px !important;
    }

    .panel textarea {
      min-height: 240px !important;
    }

    .panel button:not(#appBottomNav button) {
      font-size: 35px !important;
      min-height: 116px !important;
      padding: 22px !important;
    }

    .panel .note,
    .panel .muted,
    .panel .small,
    .panel p,
    .app-placeholder p,
    .studio-welcome p {
      font-size: 27px !important;
      line-height: 1.55 !important;
    }

    .panel .output {
      font-size: 30px !important;
      line-height: 1.6 !important;
    }

    .studio-welcome .welcome-kicker {
      font-size: 20px !important;
    }

    /* Rovnake pohodlne ovladanie na vsetkych mobiloch */
    .panel .grid {
      grid-template-columns: minmax(0, 1fr) !important;
      gap: 16px !important;
    }

    html,
    body {
      overflow-y: auto !important;
      scrollbar-width: auto !important;
      scrollbar-color: #8995a6 #151a22 !important;
    }

    body {
      padding-bottom: 24px !important;
    }

    /* Rezerva priestoru pod obsahom, aby pevna navigacia nic nezakryvala */
    #appViews {
      margin-bottom: calc(190px + env(safe-area-inset-bottom)) !important;
    }

    .app-screen.active {
      padding-bottom: 24px !important;
      box-sizing: border-box !important;
    }

    *::-webkit-scrollbar {
      width: 8px;
    }

    *::-webkit-scrollbar-thumb {
      background: #8995a6;
      border-radius: 10px;
    }

    .studio-welcome {
      background: linear-gradient(135deg,#202936,#151a22 72%) !important;
      border: 1px solid #394454 !important;
      border-radius: 20px !important;
      padding: 22px !important;
      margin: 0 0 15px !important;
    }

    .studio-welcome .welcome-kicker {
      color: #d9bd7d;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 1.4px;
      text-transform: uppercase;
    }

    .studio-welcome h2 {
      font-size: 23px !important;
      margin: 9px 0 !important;
    }

    .studio-welcome p {
      color: #aeb8c7;
      font-size: 14px;
      line-height: 1.55;
      margin: 0;
    }

    @media(min-width:600px) {
      body {
        padding-left: 22px !important;
        padding-right: 22px !important;
      }
      .grid {
        grid-template-columns: 1fr 1fr !important;
      }
    
    }
    /* Stabilne mobilne rozlozenie: vysku aplikacie neriadi visual viewport/klavesnica. */
    html, body {
      min-height: 100%;
      height: auto !important;
    }

    body {
      display: block !important;
      overflow-y: auto !important;
    }

    #appViews {
      display: block !important;
      min-height: 0;
    }

    .app-screen.active {
      display: block !important;
    }
  `;
  document.head.appendChild(style);

  const views = document.createElement('main');
  views.id = 'appViews';

  const studio = document.createElement('div');
  studio.className = 'app-screen active';
  studio.id = 'screenStudio';

  const projects = document.createElement('div');
  projects.className = 'app-screen';
  projects.id = 'screenProjects';

  const settings = document.createElement('div');
  settings.className = 'app-screen';
  settings.id = 'screenSettings';

  const welcome = document.createElement('section');
welcome.className = 'studio-welcome';
welcome.innerHTML = `
  <div class="welcome-kicker">PRODUCT STUDIO AI</div>
  <h2>Vytvor novú reklamu</h2>
  <p>Nahraj fotografie produktu a podľa potreby pridaj aj vlastné video. AI z nich vytvorí jednu výslednú reklamu.</p>
`;

studio.append(welcome, product, advertising, generation);

    const projectsIntro = document.createElement('div');
  projectsIntro.className = 'app-placeholder';
  projectsIntro.dataset.sectionIcon = '📁';
  projectsIntro.innerHTML = `
    <h2>Moje projekty</h2>
    <p>Všetky tvoje produktové projekty a reklamné výstupy budú na jednom mieste.</p>
    <p><strong>Pracovný priestor PRODUCT STUDIO AI</strong></p>
  `;

  projects.append(projectsIntro, history);
  settings.append(connection);
  views.append(studio, projects, settings);

  const header = document.querySelector('header');
  if (header) header.after(views);
  else document.body.prepend(views);

  const nav = document.createElement('nav');
  nav.id = 'appBottomNav';
  nav.innerHTML = `
    <button class="active" data-screen="screenStudio">
      <span>✦</span>Štúdio
    </button>
    <button data-screen="screenProjects">
      <span>▣</span>Projekty
    </button>
    <button data-screen="screenSettings">
      <span>⚙</span>Nastavenia
    </button>
  `;

  nav.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', () => {
      const target = button.dataset.screen;

      document.querySelectorAll('.app-screen').forEach(screen => {
        screen.classList.toggle('active', screen.id === target);
      });

      nav.querySelectorAll('button').forEach(item => {
        item.classList.toggle('active', item === button);
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

  document.body.appendChild(nav);
    // Spodna navigacia zostava ukotvena cez CSS bottom: 0.
    // Nepreposuvame ju podla visualViewport, ktory sa meni pri otvoreni klavesnice.
})();
