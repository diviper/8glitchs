window.quest = (function(){
  const ns = 'gr:quest:';
  const get = (k, d=null)=> JSON.parse(localStorage.getItem(ns+k) || 'null') ?? d;
  const set = (k, v)=> localStorage.setItem(ns+k, JSON.stringify(v));

  function introHTML(slug, title, intro){
    return `
    <div class="quest-scene" data-slug="${slug}">
      <div class="scene-bg" aria-hidden="true"></div>
      <div class="scene-layer">
        <h2 class="scene-title">${title}</h2>
        <p class="scene-intro">${intro || 'Вы входите в тёмную лабораторию. Неон мерцает. Что это за «глитч»?'}</p>
        <div class="scene-riddle">
          <label>Ключ (подсказка в тексте):</label>
          <input class="riddle-input" placeholder="введите ответ">
          <button class="btn" data-enter>Исследовать</button>
          <button class="btn ghost" data-skip>Пропустить</button>
          <div class="riddle-result" aria-live="polite"></div>
        </div>
      </div>
      <div class="scene-content hidden"></div>
    </div>`;
  }

  function mount(container, mdHTML, opts){
    const { slug, title, riddleAnswer } = opts;
    container.innerHTML = introHTML(slug, title, opts.intro);
    const scene = container.querySelector('.quest-scene');
    const content = scene.querySelector('.scene-content');
    content.innerHTML = mdHTML;

    // восстановление
    const done = get(slug+':done', false);
    if (done) reveal(scene, slug);

    // обработчики
    scene.querySelector('[data-enter]').onclick = () => {
      const val = scene.querySelector('.riddle-input').value.trim().toLowerCase();
      const ok = !riddleAnswer || normalize(val) === normalize(riddleAnswer);
      if (ok) {
        set(slug+':opened', true);
        reveal(scene, slug);
      } else {
        toast(scene, 'Неверно. Подсказка в карточке 👀');
      }
    };
    scene.querySelector('[data-skip]').onclick = () => { reveal(scene, slug); };

    // отметка «завершено» при конце карточки
    const doneBtn = content.querySelector('[data-quest-done]');
    if (doneBtn) doneBtn.onclick = () => { set(slug+':done', true); toast(scene, '✔ Завершено'); };
  }

  function reveal(scene, slug){
    scene.querySelector('.scene-layer').classList.add('fade-out');
    scene.querySelector('.scene-content').classList.remove('hidden');
    setTimeout(()=> scene.querySelector('.scene-layer').remove(), 300);
    set(slug+':opened', true);
  }

  function normalize(s){ return (s||'').toLowerCase().replace(/\s+/g,' ').trim(); }
  function toast(root, msg){
    let t = document.createElement('div');
    t.className='toast floating'; t.textContent = msg; root.appendChild(t);
    setTimeout(()=> t.classList.add('show'), 10);
    setTimeout(()=> t.remove(), 2000);
  }

  function getStats(manifest){
    const all = manifest.length;
    let opened=0, done=0;
    manifest.forEach(m=>{
      if (get(m.slug+':opened')) opened++;
      if (get(m.slug+':done')) done++;
    });
    return { all, opened, done };
  }

  return { mount, getStats };
})();
