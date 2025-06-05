const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

describe('progress.js', () => {
  let dom;
  let document;
  let window;

  beforeEach(() => {
    const html = `
      <div class="progress-bar"></div>
      <span id="progress-count"></span>
      <div class="promise-card" data-anomaly="a1"><div class="card-progress"></div></div>
      <div class="promise-card" data-anomaly="a2"><div class="card-progress"></div></div>
    `;

    dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost' });
    window = dom.window;
    document = window.document;
    global.window = window;
    global.document = document;
    global.localStorage = window.localStorage;

    const scriptContent = fs.readFileSync(path.resolve(__dirname, '../assets/js/progress.js'), 'utf8');
    const scriptEl = document.createElement('script');
    scriptEl.textContent = scriptContent;
    document.body.appendChild(scriptEl);

    document.dispatchEvent(new window.Event('DOMContentLoaded'));
  });

  afterEach(() => {
    delete global.window;
    delete global.document;
    delete global.localStorage;
  });

  test('progress bar and counter update when anomaly cards are clicked', () => {
    const cards = document.querySelectorAll('.promise-card');
    const progressBar = document.querySelector('.progress-bar');
    const progressCount = document.getElementById('progress-count');

    expect(progressBar.style.width).toBe('0%');
    expect(progressCount.textContent).toBe('0');

    cards[0].dispatchEvent(new window.Event('click'));
    expect(progressBar.style.width).toBe('50%');
    expect(progressCount.textContent).toBe('1');

    cards[1].dispatchEvent(new window.Event('click'));
    expect(progressBar.style.width).toBe('100%');
    expect(progressCount.textContent).toBe('2');
  });
});
