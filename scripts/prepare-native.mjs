import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';

const root = process.cwd();
const out = new URL('../www/', import.meta.url);
await mkdir(out, { recursive: true });

for (const file of ['index.html', 'app-navigation.js', 'icon.svg']) {
  await cp(new URL('../' + file, import.meta.url), new URL(file, out));
}

const indexPath = new URL('index.html', out);
let html = await readFile(indexPath, 'utf8');

// The native WebView owns app lifecycle and asset loading; don't install a PWA service worker inside it.
html = html.replace(
  /<script>\s*if \('serviceWorker' in navigator\)[\s\S]*?<\/script>\s*/m,
  ''
);
html = html.replace(/<link rel="manifest" href="\/manifest\.webmanifest">\s*/m, '');
await writeFile(indexPath, html, 'utf8');
console.log('Prepared local Capacitor web assets in ./www');
