import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';

const project = fileURLToPath(new URL('.', import.meta.url));
export default defineConfig({
  base: '/leo-notes/',
  root: `${project}github-pages`,
  publicDir: `${project}public`,
  resolve: { alias: { '@': project } },
  plugins: [react()],
  css: { postcss: { plugins: [tailwindcss()] } },
  build: { outDir: `${project}dist-pages`, emptyOutDir: true },
});
