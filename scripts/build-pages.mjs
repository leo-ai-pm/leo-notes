import { build } from 'vite';
import { readFile, writeFile, rm } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const configFile = path.join(root, 'vite.pages.config.ts');
const serverDir = path.join(root, '.pages-render');
try {
  await build({ configFile });
  await build({ configFile, build: { ssr: path.join(root, 'github-pages/render.tsx'), outDir: serverDir, copyPublicDir: false } });
  const { render } = await import(pathToFileURL(path.join(serverDir, 'render.js')).href);
  const index = path.join(root, 'dist-pages/index.html');
  const template = await readFile(index, 'utf8');
  if (!template.includes('<!--site-html-->')) throw new Error('Missing prerender placeholder');
  await writeFile(index, template.replace('<!--site-html-->', render()));
  await writeFile(path.join(root, 'dist-pages/.nojekyll'), '');
} finally {
  await rm(serverDir, { recursive: true, force: true });
}
