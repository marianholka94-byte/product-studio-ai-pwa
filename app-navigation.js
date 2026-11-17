(() => {
  const sections = [...document.querySelectorAll('section.panel')];

  const findSection = number =>
    sections.find(section =>
      section.querySelector('h2')?.textContent.trim().startsWith(number + '.')
    );

  const connection = findSection(1);
  const product = findSection(2);
  const advertising = findSection(3);
  const generation = findSection(4);
  const history = findSection(5);

  if (!connection || !product || !advertising || !generation || !history) {
    console.error('PRODUCT STUDIO AI: Chýba niektorá sekcia.');
    return;
  }

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

    #appBottomNav {
      min-height: 82px !important;
      padding: 10px 12px calc(12px + env(safe-area-inset-bottom)) !important;
      gap: 8px !important;
    }

    #appBottomNav button {
      min-height: 64px !important;
      padding: 8px 4px !important;
      font-size: 14px !important;
      font-weight: 700 !important;
      border-radius: 14px !important;
    }

    #appBottomNav button span {
      font-size: 27px !important;
      line-height: 1.1 !important;
      margin-bottom: 5px !important;
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
  <p>Pridaj fotografiu produktu, vyber vizuálny štýl a priprav profesionálny reklamný koncept.</p>
`;

studio.append(welcome, product, advertising, generation);

  const projectsIntro = document.createElement('div');
  projectsIntro.className = 'app-placeholder';
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
    const viewport = window.visualViewport;

  if (viewport) {
    const positionNavigation = () => {
      nav.style.bottom = 'auto';
      nav.style.top =
        (viewport.offsetTop + viewport.height - nav.offsetHeight) + 'px';
    };

    viewport.addEventListener('resize', positionNavigation);
    viewport.addEventListener('scroll', positionNavigation);
    window.addEventListener('resize', positionNavigation);

    positionNavigation();
  }
})();
