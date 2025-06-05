const fs = require('fs');
const path = require('path');
const nunjucks = require('nunjucks');

nunjucks.configure(['templates', 'src'], { autoescape: false });

const srcDir = path.join(__dirname, 'src');

for (const file of fs.readdirSync(srcDir)) {
  if (file.endsWith('.njk')) {
    const output = nunjucks.render(file);
    const outPath = path.join(__dirname, file.replace(/\.njk$/, '.html'));
    fs.writeFileSync(outPath, output, 'utf8');
    console.log('Generated', outPath);
  }
}
