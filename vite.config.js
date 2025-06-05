import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

const htmlFiles = fs.readdirSync('./').flatMap((f) =>
  f.endsWith('.html') ? [f] : []
);
const contentHtml = fs.existsSync('content/anomalies')
  ? fs.readdirSync('content/anomalies').filter(f => f.endsWith('.html')).map(f => `content/anomalies/${f}`)
  : [];

const inputs = {};
[...htmlFiles, ...contentHtml].forEach(f => {
  inputs[f.replace(/\.html$/, '')] = resolve(__dirname, f);
});

export default defineConfig({
  build: {
    rollupOptions: {
      input: inputs
    },
    outDir: 'dist'
  }
});
