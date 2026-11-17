(() => {
  const sections = [...document.querySelectorAll('section.panel')];

  const findSection = (number) =>
    sections.find(section =>
      section.querySelector('h2')?.textContent.trim().startsWith(number + '.')
    );

  const connection = findSection(1);
  const product = findSection(2);
  const advertising = findSection(3);
  const generation = findSection(4);
  const history = findSection(5);

  if (!connection || !product || !advertising || !generation || !history) {
    console.error('PRODUCT STUDIO AI: Nepodarilo sa nájsť všetky sekcie.');
    return;
  }

  const style = document.createElement('style');
  style.textContent = `
    body {
      padding-bottom: calc(90px + env(safe-area-inset-bottom));
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
    }

    #appBottomNav {
      position: fixed;
      z-index: 9999;
      bottom: 0;
      left: 0;
      right: 0;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      padding: 9px 12px calc(9px + env(safe-area-inset-bottom));
      background: rgba(255,255,255,.96);
      border-top: 1px solid #e5e7eb;
      backdrop-filter: blur(16px);
    }

    #appBottomNav button {
      border: 0;
      background: transparent;
      color: #777;
      font-size: 12px;
      font-weight: 600;
      padding: 9px 4px;
      border-radius: 12px;
    }

    #appBottomNav button.active {
      color: #2563eb;
      background: #eff6ff;
    }

    #appBottomNav button span {
      display: block;
      font-size: 21px;
      margin-bottom: 3px;
    }

    .app-placeholder {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 18px;
      padding: 22px;
      margin: 14px 0;
      text-align: center;
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

  studio.append(product, advertising, generation);

  const projectsIntro = document.createElement('div');
  projectsIntro.className = 'app-placeholder';
  projectsIntro.innerHTML = `
    <h2>Moje projekty</h2>
    <p>Tu budeš mať svoje produktové projekty a vytvorené reklamy na jednom mieste.</p>
    <p><strong>Priestor pre tvoje projekty je pripravený.</strong></p>
  `;

  projects.append(projectsIntro, history);
  settings.append(connection);

  views.append(studio, projects, settings);

  const header = document.querySelector('header');
  if (header) {
    header.after(views);
  } else {
    document.body.prepend(views);
  }

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
})();
