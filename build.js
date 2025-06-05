const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

const srcDir = __dirname;
const destDir = path.join(srcDir, 'dist');

if (fs.existsSync(destDir)) {
  fs.rmSync(destDir, { recursive: true, force: true });
}
fs.mkdirSync(destDir);

const exclude = new Set(['node_modules', 'dist', '.git', 'package-lock.json', 'package.json', 'Dockerfile', '.dockerignore','build.js']);

for (const item of fs.readdirSync(srcDir)) {
  if (exclude.has(item)) continue;
  const srcPath = path.join(srcDir, item);
  const destPath = path.join(destDir, item);
  fse.copySync(srcPath, destPath);
}

console.log('Build completed:', destDir);
