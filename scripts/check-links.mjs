import fs from 'fs';
import path from 'path';

async function check(url){
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 7000);
  try {
    let res = await fetch(url, {method:'HEAD', signal: controller.signal});
    if (res.status === 405) {
      res = await fetch(url, {method:'GET', signal: controller.signal});
    }
    return res.status;
  } catch(e){
    return 'ERR';
  } finally {
    clearTimeout(t);
  }
}

async function main(){
  const dir = 'content/glitches';
  const files = await fs.promises.readdir(dir);
  const re = /\[[^\]]*\]\((https?:\/\/[^)]+)\)/g;
  for (const f of files) {
    const fp = path.join(dir, f);
    const txt = await fs.promises.readFile(fp, 'utf8');
    let m;
    while((m = re.exec(txt))){
      const url = m[1];
      const status = await check(url);
      const msg = status === 200 || status === 301 ? 'ok' : 'warn';
      console[msg](`${status} ${url} (${f})`);
    }
  }
}

main();
