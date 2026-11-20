(() => {
  "use strict";
  const KEY = "psai_ui_language";
  const dictionaries = {
    en: {
      "Štúdio":"Studio","Projekty":"Projects","Nastavenia":"Settings","Účet a nastavenia":"Account & settings",
      "Vytvor novú reklamu":"Create a new advertisement",
      "Nahraj fotografie produktu a podľa potreby pridaj aj vlastné video. AI z nich vytvorí jednu výslednú reklamu.":"Upload product photos and optionally add your own video. AI will create one finished advertisement.",
      "Pripojenie generátora":"Generator connection","Produkt":"Product","Nastavenie reklamy":"Ad settings","Generovanie videa":"Video generation",
      "História posledného generovania":"Recent generation history","Moje projekty":"My projects",
      "Lokálne projekty uložené v tomto zariadení. Nie sú viazané na cloudový účet a zostávajú tu aj po prepnutí účtu.":"Local projects saved on this device. They are not linked to a cloud account and remain here even when you switch accounts.",
      "Cloudové projekty a produkty nájdeš v samostatnej sekcii":"Find cloud projects and products in the separate section",
      "Pracovný priestor":"Workspace","Navigácia":"Navigation","Knižnica":"Library","Cloudová knižnica":"Cloud library",
      "História generovaní":"Generation history","Účet a bezpečnosť":"Account & security",
      "Cloudový účet a pripojenie generátora spravuješ v časti Projekty → Cloudová knižnica.":"Manage your cloud account and generator connection under Projects → Cloud library.",
      "Odhlásenie z cloudovej knižnice zruší cloudovú reláciu. Lokálne projekty a produkty v tomto zariadení zostanú zachované.":"Signing out of the cloud library ends the cloud session. Local projects and products on this device will remain available.",
      "Táto aplikácia už nepoužíva staré prihlásenie spoločným aplikačným heslom.":"This app no longer uses the old shared application-password login.",
      "Jazyk aplikácie":"App language","Vyber jazyk rozhrania aplikácie. Zmena sa uloží automaticky.":"Choose the language used throughout the app. Your choice is saved automatically.",
      "Slovenčina":"Slovak","Angličtina":"English","Jazyk bol zmenený.":"Language changed.",
      "Môj účet a prehľad":"My account & overview","NEPRIHLÁSENÝ":"NOT SIGNED IN","Tvoj osobný prehľad používania PRODUCT STUDIO AI.":"Your personal PRODUCT STUDIO AI usage overview.",
      "CLOUDOVÝ ÚČET":"CLOUD ACCOUNT","Neprihlásený":"Not signed in","Prihlás sa v Cloudovej knižnici.":"Sign in in the Cloud library.",
      "DNES VYUŽITÉ":"USED TODAY","Denný limit preview":"Daily preview limit","DOSTUPNÉ KREDITY":"AVAILABLE CREDITS",
      "Zostatok sa zobrazí po prihlásení.":"Your balance will appear after signing in.",
      "Prihlás sa do svojho cloudového účtu v paneli Cloudová knižnica.":"Sign in to your cloud account in the Cloud library panel.",
      "Bezpečnostný limit preview: najviac 3 generovania denne na účet.":"Preview safety limit: up to 3 generations per account per day.",
      "Nahraj 1 až 5 fotografií produktu":"Upload 1 to 5 product photos",
      "Pridaj rôzne uhly alebo detaily toho istého produktu. Čím lepšie fotografie, tým presnejší výsledok.":"Add different angles or details of the same product. Better photos produce more accurate results.",
      "Vlastné produktové video (zatiaľ nedostupné v Preview)":"Your own product video (not yet available in Preview)",
      "Generovanie z vlastného zdrojového videa pripravujeme. Aktuálne funguje generovanie z fotografií produktu.":"Generation from your own source video is in development. Currently, generation from product photos is available.",
      "Názov alebo typ produktu":"Product name or type","Napr. čierny parfum MUSTANG":"E.g. black MUSTANG perfume",
      "Predvoľba exportu pre platformu":"Export preset for platform","Vlastné nastavenie":"Custom settings",
      "Instagram Reels / Stories – 9:16 · 1080p":"Instagram Reels / Stories – 9:16 · 1080p",
      "TikTok – 9:16 · 1080p":"TikTok – 9:16 · 1080p","YouTube Shorts – 9:16 · 1080p":"YouTube Shorts – 9:16 · 1080p",
      "YouTube video – 16:9 · 1080p":"YouTube video – 16:9 · 1080p","YouTube 4K – 16:9 · 4K":"YouTube 4K – 16:9 · 4K",
      "Instagram príspevok – 1:1 · 1080p":"Instagram post – 1:1 · 1080p",
      "Vyber platformu a aplikácia nastaví odporúčaný pomer strán, model a rozlíšenie. Nastavenia môžeš potom upraviť ručne.":"Choose a platform and the app will set the recommended aspect ratio, model and resolution. You can then adjust the settings manually.",
      "Vizuálny štýl":"Visual style","Realistická luxusná reklama":"Realistic luxury advertisement",
      "Minimalistická štúdiová reklama":"Minimalist studio advertisement","Športová dynamická reklama":"Dynamic sports advertisement",
      "Prírodná lifestyle reklama":"Natural lifestyle advertisement","Technologická reklama":"Technology advertisement",
      "Formát":"Format","Pohyb kamery":"Camera movement","Pomalé približovanie (push-in)":"Slow push-in",
      "Plynulý pohyb zľava doprava":"Smooth left-to-right movement","Jemný orbit okolo produktu":"Gentle orbit around the product",
      "Detailný makro záber":"Detailed macro shot","Statická kamera":"Static camera","Dĺžka klipu":"Clip duration",
      "5 sekúnd":"5 seconds","10 sekúnd":"10 seconds","15 sekúnd":"15 seconds","AI video model":"AI video model",
      "Rozlíšenie výstupu":"Output resolution","720p – vyvážená kvalita":"720p – balanced quality","480p – menší súbor":"480p – smaller file",
      "Seedance 2.0 Mini podporuje maximálne 720p. Model Quality sprístupní 1080p a 4K. FPS určuje model.":"Seedance 2.0 Mini supports up to 720p. The Quality model enables 1080p and 4K. FPS is determined by the model.",
      "Svetlo a prostredie":"Lighting and environment","Tmavé štúdio, jemné zlaté okrajové svetlo":"Dark studio, soft golden rim light",
      "Svetlé čisté štúdio, mäkké svetlo":"Bright clean studio, soft lighting","Dramatické bočné svetlo a tiene":"Dramatic side lighting and shadows",
      "Vonkajšie prirodzené svetlo":"Natural outdoor lighting","Dodatočné požiadavky":"Additional requirements",
      "Napr. jemná hmla, kvapky vody, odlesky na skle...":"E.g. subtle fog, water droplets, reflections on glass...",
      "Odhad podľa cenníka Runway Dev. Cena sa počíta podľa modelu, rozlíšenia a dĺžky. 1 kredit = 0,01 USD. Skutočnú cenu potvrdzuje poskytovateľ pri odoslaní úlohy.":"Estimate based on Runway Dev pricing. The price depends on the model, resolution and duration. 1 credit = USD 0.01. The provider confirms the actual price when the task is submitted.",
      "Vytvoriť / obnoviť reklamný prompt":"Create / refresh ad prompt","Po výbere produktu sa tu zobrazí reklamný prompt.":"Your ad prompt will appear here after you select a product.",
      "GENEROVAŤ VIDEO":"GENERATE VIDEO","Najskôr over backend a vyber fotografiu produktu.":"First check the backend and select a product photo.",
      "Pripravujem generovanie":"Preparing generation","1. Odoslanie":"1. Submitting","2. AI spracovanie":"2. AI processing","3. Dokončovanie":"3. Finalizing",
      "Po prijatí úlohy začne AI generovať video. Presné percento poskytovateľ neposkytuje.":"AI will start generating the video after the task is accepted. The provider does not supply an exact percentage.",
      "História generovaní":"Generation history","Posledných 20 generovaní uložených v tvojom účte.":"The last 20 generations saved in your account.",
      "Obnoviť históriu":"Refresh history","Počet dokončených a rozpracovaných videí sa zobrazí po načítaní histórie.":"The number of completed and in-progress videos will appear after the history loads.",
      "＋ Uložiť produkt do knižnice":"＋ Save product to library","＋ Nový projekt":"＋ New project","Uložiť projekt":"Save project","Nový projekt":"New project",
      "Zatiaľ tu nemáš žiadne projekty":"You don't have any projects yet","Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.":"Create a project in the Studio to save photos, settings and the ad prompt.",
      "Moja knižnica produktov":"My product library","Zatiaľ nemáš uložené produkty":"You don't have any saved products yet",
      "V štúdiu môžeš uložiť produkt spolu s jeho fotografiami.":"You can save a product together with its photos in the Studio.",
      "Zobraziť informáciu":"Show information","Zobraziť informáciu o histórii":"Show history information",
      "Otvoriť bočný panel":"Open side panel","Hlavná ponuka":"Main menu","Zavrieť ponuku":"Close menu",
      "Spodná navigácia zostáva dostupná na každej obrazovke.":"The bottom navigation remains available on every screen.",
      "Cloudová knižnica ešte nie je pripravená. Obnov stránku a skús to znova.":"The Cloud library is not ready yet. Refresh the page and try again.",
      "Zobraziť informáciu o histórii":"Show history information",
      "Údaje sa nepodarilo bezpečne uložiť. Obnov aplikáciu a skús to znova.":"The data could not be saved safely. Refresh the app and try again.",
      "Lokálne údaje sa nepodarilo uložiť.":"Local data could not be saved.",
      "Produkt musí mať aspoň jednu fotografiu.":"The product must have at least one photo.",
      "Najskôr sa prihlás do Cloudovej knižnice.":"Sign in to the Cloud library first.",
      "Ukladám…":"Saving…","Nahrávam":"Uploading","Odstrániť":"Delete","Hlavná fotografia":"Main photo",
      "Nastaviť ako hlavnú":"Set as main","Pridať do promptu":"Add to prompt","Rozdeliť zadanie do častí":"Split prompt into sections",
      "Zadanie bolo rozdelené do častí a vložené do promptu. Skontroluj a podľa potreby uprav výsledok.":"The prompt has been split into sections and added to the prompt editor. Review and adjust the result if needed.",

      "☁️ Cloudová knižnica":"☁️ Cloud library",
      "Jazyk":"Language","Kredity":"Credits","Názov produktu":"Product name",
      "Napr. Prémiová káva":"E.g. Premium coffee","Popis produktu":"Product description",
      "Produkt vytvorený pri ukladaní reklamného projektu.":"Product created while saving an advertising project.",
      "Čaká":"Queued","Spracúva sa":"Processing","Hotové":"Completed","Neúspešné":"Failed","Zrušené":"Cancelled","Neznámy stav":"Unknown status",
      "Dátum neznámy":"Unknown date","STIAHNUŤ VIDEO":"DOWNLOAD VIDEO","POKRAČOVAŤ V SLEDOVANÍ":"CONTINUE TRACKING",
      "Najskôr sa prihlás do cloudového účtu a vyber fotografiu produktu.":"Please sign in to your cloud account first and select a product photo.",
      "Zatiaľ žiadne generovania · Po prvom videu sa tu zobrazí tvoja história.":"No generations yet · Your history will appear here after your first video.",
      "Zatiaľ nemáš žiadne uložené generovania.":"You don't have any saved generations yet.",
      "Názov produktu nemôže byť prázdny.":"Product name cannot be empty.",

      "História sa načíta po prihlásení do cloudového účtu.":"History loads after you sign in to your cloud account.",
      "Formát":"Format","9:16 – Reels":"9:16 – Reels","1:1 – štvorcový":"1:1 – Square","16:9 – široký":"16:9 – Landscape",
      "720p – vyššia kvalita":"720p – higher quality","720p – vyvážená kvalita":"720p – balanced quality","480p – menší súbor":"480p – smaller file",
      "1080p – Full HD":"1080p – Full HD","4K – maximálne rozlíšenie":"4K – maximum resolution",
      "Seedance 2.0 podporuje 480p, 720p, 1080p a 4K. Dostupnosť závisí od API účtu.":"Seedance 2.0 supports 480p, 720p, 1080p and 4K. Availability depends on your API account.",
      "Seedance 2.0 Mini podporuje maximálne 720p. Pre Full HD a 4K vyber model Quality.":"Seedance 2.0 Mini supports up to 720p. Choose the Quality model for Full HD and 4K.",
      "Odhad:":"Estimate:","Model:":"Model:","Úloha:":"Task:","Stav:":"Status:",
      "Odhad podľa cenníka Runway Dev. Cena sa počíta podľa modelu, rozlíšenia a dĺžky. 1 kredit = 0,01 USD. Skutočnú cenu potvrdzuje poskytovateľ pri odoslaní úlohy.":"Estimate based on Runway Dev pricing. The price depends on the model, resolution and duration. 1 credit = USD 0.01. The provider confirms the actual price when the task is submitted.",
      "Instagram Reels a Stories: vertikálny formát 9:16 vo Full HD.":"Instagram Reels and Stories: vertical 9:16 format in Full HD.",
      "TikTok: vertikálny formát 9:16 vo Full HD.":"TikTok: vertical 9:16 format in Full HD.",
      "YouTube Shorts: vertikálny formát 9:16 vo Full HD.":"YouTube Shorts: vertical 9:16 format in Full HD.",
      "YouTube: širokouhlý formát 16:9 vo Full HD.":"YouTube: widescreen 16:9 format in Full HD.",
      "YouTube 4K: širokouhlý formát 16:9. Pozor na výrazne vyššiu cenu.":"YouTube 4K: widescreen 16:9 format. Note the significantly higher price.",
      "Štvorcový príspevok: formát 1:1 vo Full HD.":"Square post: 1:1 format in Full HD.",
      "Prihlás sa do svojho cloudového účtu v paneli Cloudová knižnica.":"Sign in to your cloud account in the Cloud library panel.",
      "Vlastné nastavenie":"Custom settings","Vyvážená kvalita":"Balanced quality","vyššia kvalita":"higher quality",
      "Vybrať súbory":"Choose files","Vybrať súbor":"Choose file","Nie je vybratý žiadny súbor":"No file selected",
      "Tvoj súkromný cloudový pracovný priestor pre produkty, fotografie a reklamné projekty.":"Your private cloud workspace for products, photos and advertising projects.",
      "Nie si prihlásený do cloudovej knižnice.":"You are not signed in to the Cloud library.",
      "Prihlás sa do svojho cloudového účtu":"Sign in to your cloud account",
      "Pokračovať bez prihlásenia":"Continue without signing in",
      "Prihlásiť sa do Cloudu":"Sign in to Cloud","Prihlásené do cloudu":"Signed in to Cloud",
      "Overujem tvoje prihlásenie…":"Checking your sign-in…",
      "Heslo (min. 12 znakov pri registrácii)":"Password (at least 12 characters for registration)",
      "Heslo":"Password","Meno (nepovinné)":"Name (optional)","Meno":"Name","Pozývací kód":"Invitation code",
      "Prihlásiť sa":"Sign in","Vytvoriť testovací účet":"Create test account","Registrácia":"Register","Späť na prihlásenie":"Back to sign in",
      "Dostupné kredity: načítavam…":"Available credits: loading…","Počet kreditov na dobitie":"Credits to add","Napr. 500":"E.g. 500",
      "Poznámka k dobitiu":"Top-up note","Manuálne dobitie":"Manual top-up","＋ Dobíť kredity":"＋ Add credits","Odhlásiť sa":"Sign out",
      "Napr. Prémiová káva":"E.g. Premium coffee","Popis produktu":"Product description","＋ Vytvoriť produkt":"＋ Create product",
      "Načítať najnovšiu verziu produktu":"Load latest product version","Ponechať moje zmeny a uložiť znova":"Keep my changes and save again",
      "Hľadať produkt":"Search products","Názov alebo popis produktu":"Product name or description","Názov reklamného projektu":"Ad project name",
      "Napr. Letná kampaň":"E.g. Summer campaign","Zadanie reklamného videa":"Video ad brief","＋ Vytvoriť projekt":"＋ Create project",
      "Načítať najnovšiu verziu":"Load latest version","Uložiť moje zmeny ako nový projekt":"Save my changes as a new project",
      "Hľadať projekt":"Search projects","Názov alebo text promptu":"Project name or prompt text","Prepojiť s produktom":"Link to product",
      "Bez prepojeného produktu":"No linked product","Nájdené:":"Found:","Nenašli sa žiadne produkty. Skús iný názov alebo popis.":"No products found. Try another name or description.",
      "Nenašli sa žiadne projekty. Skús iný názov alebo text promptu.":"No projects found. Try another name or prompt text.",
      "Posledné pohyby":"Recent transactions","Zatiaľ nemáš žiadne pohyby na kreditovom účte.":"You don't have any credit account transactions yet.",
      "Zadaj počet kreditov od 1 do 100 000.":"Enter a credit amount from 1 to 100,000.",
      "Kredity boli pripísané na účet.":"Credits have been added to the account.",
      "Prihlásenie do cloudovej knižnice je oddelené od prístupu ku generátoru.":"Cloud library sign-in is separate from generator access.",
      "Nahrať fotografiu":"Upload photo","Najskôr vyber fotografiu.":"Select a photo first.",
      "Fotografia bola bezpečne uložená.":"Photo saved securely.","Použiť v štúdiu":"Use in Studio",
      "Editor štúdia ešte nie je pripravený. Obnov stránku a skús to znova.":"Studio editor is not ready yet. Refresh the page and try again.",
      "Cloudové prihlásenie vypršalo. Prihlás sa znova.":"Your Cloud sign-in has expired. Please sign in again.",
      "Upraviť":"Edit","Archivovať":"Archive","Obnoviť produkt":"Restore product","Otvoriť v štúdiu":"Open in Studio",
      "Produkt bol archivovaný.":"Product archived.","Zatiaľ nemáš uložené aktívne produkty.":"You don't have any active saved products yet.",
      "Archivovaný produkt · fotografie zostávajú zachované":"Archived product · photos are retained",
      "Zatiaľ nemáš uložené reklamné projekty.":"You don't have any saved ad projects yet.",
      "Uložiť zmeny produktu":"Save product changes","Uložiť zmeny projektu":"Save project changes",
      "Produkt bol upravený.":"Product updated.","Produkt bol uložený v cloudovej knižnici.":"Product saved in the Cloud library.",
      "Reklamný projekt bol upravený.":"Ad project updated.","Reklamný projekt bol uložený.":"Ad project saved.",
      "Projekt bol archivovaný.":"Project archived.","Načítala sa najnovšia cloudová verzia produktu.":"The latest cloud product version has been loaded.",
      "Načítala sa najnovšia cloudová verzia projektu. Môžeš ju ďalej upraviť.":"The latest cloud project version has been loaded. You can continue editing it.",
      "Tvoje zmeny boli uložené ako samostatný projekt. Pôvodná cloudová verzia zostala zachovaná.":"Your changes were saved as a separate project. The original cloud version was preserved.",
      "Cloudový účet je prihlásený.":"Cloud account is signed in.","Cloudová knižnica je synchronizovaná.":"Cloud library is synchronized.",
      "＋ Uložiť do Cloudu":"＋ Save to Cloud","Ukladám…":"Saving…","Nahrávam":"Uploading","Nahrávanie":"Uploading",
      "Zobraziť informáciu o histórii":"Show history information",
      "Nie je čo kopírovať.":"Nothing to copy."      ,"Pripojenie generátora":"Generator connection"
      ,"História posledného generovania":"Recent generation history"
      ,"Účet a nastavenia":"Account & settings"
      ,"Databázu projektov sa nepodarilo otvoriť.":"Could not open the project database."
      ,"Databázu projektov blokuje iná otvorená verzia aplikácie. Zavri ostatné okná aplikácie a skús to znova.":"The project database is blocked by another open app instance. Close other app windows and try again."
      ,"Fotografiu sa nepodarilo bezpečne pripraviť na lokálne uloženie.":"Could not safely prepare the photo for local storage."
      ,"Uložiť projekt":"Save project","Otvoriť":"Open","Duplikovať":"Duplicate","Vymazať":"Delete"
      ,"Správa produktu":"Product manager","Spravuj fotografie produktu. Môžeš pridať nové, odstrániť nepotrebné alebo zmeniť hlavnú fotografiu.":"Manage product photos. You can add new ones, remove unwanted photos or change the main photo."
      ,"＋ Pridať fotografie":"＋ Add photos","Zavrieť":"Close","Uložiť zmeny":"Save changes"
      ,"＋ Vytvoriť reklamný projekt":"＋ Create ad project","Spravovať fotografie":"Manage photos","Použiť v reklame":"Use in ad"
      ,"Premenovať":"Rename","Nový názov produktu:":"New product name:","Názov produktu nemôže byť prázdny.":"Product name cannot be empty."
      ,"Najskôr vyber produkt.":"Select a product first.","Nie je vybraný produkt.":"No product selected."
      ,"Produkt sa už nenašiel.":"Product could not be found.","Projekt sa už nenašiel.":"Project could not be found."
      ,"Najskôr zadaj názov produktu.":"Enter a product name first.","Najskôr zadaj názov produktu alebo pridaj fotografiu.":"Enter a product name or add a photo first."
      ,"Na uloženie produktu pridaj aspoň jednu fotografiu.":"Add at least one photo to save the product."
      ,"Projekt musí obsahovať aspoň jednu fotografiu produktu.":"The project must contain at least one product photo."
      ,"Začať nový projekt? Neuložené zmeny v aktuálnom projekte sa stratia.":"Start a new project? Unsaved changes in the current project will be lost."
      ,"Nový projekt je pripravený. Po pridaní fotografie ho môžeš uložiť.":"New project is ready. You can save it after adding a photo."
      ,"Kópia projektu":"Project copy","Uložené v cloude":"Saved to Cloud","Uložiť do cloudu":"Save to Cloud"
      ,"Pokračovať v ukladaní":"Continue saving","Uložiť do Cloudu":"Save to Cloud"
      ,"Knižnicu projektov sa nepodarilo obnoviť:":"Could not refresh project library:"
      ,"Produkt musí mať aspoň jednu fotografiu.":"The product must have at least one photo."
      ,"Môžeš pridať najviac ":"You can add up to "
      ," ďalšie fotografie.":" more photos."
      ,"Fotografie produktu boli uložené.":"Product photos saved."
      ,"Vytvor projekt v štúdiu a ulož si fotografie, nastavenia aj reklamný prompt.":"Create a project in the Studio to save photos, settings and the ad prompt."
      ,"Ulož produkty raz a použi ich znova v ďalších reklamných projektoch.":"Save products once and reuse them in future ad projects."
      ,"Prostredie a scéna":"Environment and scene","Produkt a jeho vzhľad":"Product and appearance"
      ,"Ďalšie pokyny":"Additional instructions","Editor reklamného promptu":"Ad prompt editor"
      ,"Rozšírené nastavenie reklamného promptu":"Advanced ad prompt settings","Uprav si reklamný prompt":"Customize your ad prompt"
      ,"Bezplatný lokálny pomocník. Napíš predstavu po slovensky a aplikácia ju rozdelí do správnych častí promptu podľa tvojich nastavení. Nepoužíva externé AI API.":"Free local assistant. Describe your idea in Slovak and the app will split it into prompt sections based on your settings. It does not use an external AI API."
      ,"✦ Rozdeliť zadanie do častí":"✦ Split brief into sections","Pridať do promptu":"Add to prompt"
      ,"Zostaviť prompt z častí":"Compose prompt from sections","Výsledný prompt – môžeš ho upraviť aj ručne":"Final prompt – you can also edit it manually"
      ,"Kopírovať prompt":"Copy prompt","Obnoviť podľa nastavení reklamy":"Restore ad settings"
      ,"Prompt sa uloží spolu s projektom po stlačení „Uložiť projekt“.":"The prompt is saved with the project when you press “Save project”."
      ,"Reklamná scéna":"Ad scene","Bez predvolenej scény":"No preset scene"
      ,"Luxury Studio – luxusné tmavé štúdio":"Luxury Studio – premium dark studio"
      ,"Golden Premium – zlaté svetlo":"Golden Premium – golden lighting"
      ,"Minimalist – čistá produktová reklama":"Minimalist – clean product ad"
      ,"Dynamic Commercial – dynamická scéna":"Dynamic Commercial – dynamic scene"
      ,"Najskôr opíš svoju predstavu o reklame.":"Describe your ad idea first."
      ,"Najskôr vyplň túto časť promptu.":"Complete this prompt section first."
      ,"Časť":"Section","bola pridaná do výsledného promptu.":"was added to the final prompt."
      ,"Prompt bol skopírovaný.":"Prompt copied.","Kopírovanie sa nepodarilo. Označ text a skopíruj ho ručne.":"Copying failed. Select the text and copy it manually."
,"Prompt bol skopírovaný.":"Prompt copied.","Kopírovanie sa nepodarilo. Označ text a skopíruj ho ručne.":"Copying failed. Select the text and copy it manually."
    }
  };
  const reverse = Object.fromEntries(Object.entries(dictionaries.en).map(([sk,en]) => [en,sk]));
  const textState = new WeakMap(), attrState = new WeakMap();
  let language = "sk";
  const translate = value => {
    const source = String(value ?? "");
    const dict = language === "en" ? dictionaries.en : reverse;
    if (dict[source]) return dict[source];
    // Translate common labels while preserving user-entered values and interpolated data.
    if (language === "en") {
      const patterns = [
        [/^Prihlásený účet: /,"Signed-in account: "],
        [/^Nájdené: /,"Found: "],
        [/^Vybrané: /,"Selected: "],
        [/^Knižnicu projektov sa nepodarilo načítať: /,"Could not load project library: "],
        [/^Knižnicu produktov sa nepodarilo načítať: /,"Could not load product library: "],
        [/^Projekt „(.+)“ a (\d+) fotografií boli uložené v cloude\\.$/,"Project \"$1\" and $2 photos were saved to the cloud."],
        [/^Produkt „(.+)“ a (\d+) fotografií boli uložené do cloudu\\.$/,"Product \"$1\" and $2 photos were saved to the cloud."],
        [/^Pripravené: cloudový účet je prihlásený a vybraných je (\d+) fotografií produktu\\.$/,"Ready: cloud account is signed in and $1 product photos are selected."],
        [/^Cloudový účet je prihlásený\\. Teraz vyber fotografiu produktu\\.$/,"Cloud account is signed in. Now select a product photo."],
        [/^Najskôr sa prihlás do cloudového účtu/,"Please sign in to your cloud account first"],
        [/^Cloudová knižnica je synchronizovaná\\.$/,"Cloud library is synchronized."],
        [/^Dostupné kredity: /,"Available credits: "],
        [/^Rezervované: /,"Reserved: "],
        [/^Požiadavka zlyhala \\((\\d+)\\)\\.$/,"Request failed ($1)."],
        [/^Generovanie bolo dokončené/,"Generation completed"],
        [/^Vyber aspoň jednu fotografiu/,"Select at least one photo"]
      ];
      patterns.push(
        [/^Spolu (\\d+) · Hotové (\\d+) · Rozpracované (\\d+) · Neúspešné\\/zrušené (\\d+)$/, "Total $1 · Completed $2 · In progress $3 · Failed/cancelled $4"],
        [/^Odhad: (\d+[,.]\d+ USD) \((\d+) kreditov\)$/, "Estimate: $1 ($2 credits)"],
        [/^Odhad: (.+)$/, "Estimate: $1"],
        [/^Model: (.+)$/, "Model: $1"],
        [/^Úloha: (.+) · Model: (.+) · Stav: (.+)$/, "Task: $1 · Model: $2 · Status: $3"],
        [/^Produkt musí mať aspoň jednu fotografiu\\.$/, "The product must have at least one photo."]
      );
      for (const [pattern,replacement] of patterns) if (pattern.test(source)) return source.replace(pattern,replacement);
    }
    return source;
  };
  const applyText = node => {
    const state = textState.get(node);
    const current = node.data;
    const original = state && current === state.rendered ? state.original : current;
    const rendered = translate(original);
    textState.set(node,{original,rendered});
    if (current !== rendered) node.data = rendered;
  };
  const applyAttribute = (el,name) => {
    const states = attrState.get(el) || new Map();
    const current = el.getAttribute(name);
    const state = states.get(name);
    const original = state && current === state.rendered ? state.original : current;
    const rendered = translate(original);
    states.set(name,{original,rendered}); attrState.set(el,states);
    if (current !== rendered) el.setAttribute(name,rendered);
  };
  const excluded = node => node.parentElement?.closest("script,style,code,pre,textarea,[data-i18n-skip]");
  const walk = root => {
    if (root.nodeType === Node.TEXT_NODE) { if (!excluded(root)) applyText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE && root.nodeType !== Node.DOCUMENT_NODE) return;
    if (root.nodeType === Node.ELEMENT_NODE && root.matches("script,style,code,pre,textarea,[data-i18n-skip]")) return;
    const walker = document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
    let node; while ((node=walker.nextNode())) if (!excluded(node)) applyText(node);
    if (root.nodeType === Node.ELEMENT_NODE) {
      for (const name of ["placeholder","title","aria-label"]) if (root.hasAttribute(name)) applyAttribute(root,name);
      root.querySelectorAll("[placeholder],[title],[aria-label]").forEach(el => {
        for (const name of ["placeholder","title","aria-label"]) if (el.hasAttribute(name)) applyAttribute(el,name);
      });
    }
  };
  const renderLanguage = () => {
    language = localStorage.getItem(KEY) === "en" ? "en" : "sk";
    document.documentElement.lang = language;
    walk(document.body);
    const selector = document.getElementById("psaiLanguageSelect");
    if (selector) selector.value = language;
    const note = document.getElementById("psaiLanguageNote");
    if (note) note.textContent = language === "en" ? "Your language preference is saved automatically on this device." : "Tvoja voľba jazyka sa automaticky uloží v tomto zariadení.";
  };
  const addSettings = () => {
    const settings = document.getElementById("screenSettings");
    if (!settings || document.getElementById("psaiLanguagePanel")) return;
    const panel = document.createElement("section");
    panel.className = "app-placeholder";
    panel.id = "psaiLanguagePanel";
    panel.innerHTML = '<h2>Jazyk aplikácie</h2><p>Vyber jazyk rozhrania aplikácie. Zmena sa uloží automaticky.</p><label for="psaiLanguageSelect">Jazyk</label><select id="psaiLanguageSelect"><option value="sk">🇸🇰 Slovenčina</option><option value="en">🇬🇧 English</option></select><p id="psaiLanguageNote" class="muted"></p>';
    settings.prepend(panel);
    panel.querySelector("select").addEventListener("change",event => {
      localStorage.setItem(KEY,event.target.value);
      renderLanguage();
      panel.querySelector("h2").textContent = language === "en" ? "App language" : "Jazyk aplikácie";
    });
  };
  const init = () => {
    addSettings();
    renderLanguage();
    const observer = new MutationObserver(records => {
      for (const record of records) {
        if (record.type === "characterData") applyText(record.target);
        else if (record.type === "attributes") applyAttribute(record.target,record.attributeName);
        else record.addedNodes.forEach(node => walk(node));
      }
    });
    observer.observe(document.body,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["placeholder","title","aria-label"]});
    window.PSAII18n = { getLanguage:()=>language, setLanguage:value=>{if(value!=="sk"&&value!=="en")return;localStorage.setItem(KEY,value);renderLanguage();}, t:translate };
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",init,{once:true}); else init();
})();