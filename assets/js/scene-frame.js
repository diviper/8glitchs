(()=>{'use strict';
  function mount(target, html){
    target.innerHTML = html||'';
    if(!target.querySelector('.scene-layer')){
      const d=document.createElement('div');
      d.className='scene-empty';
      d.textContent='Сцена загружена, но без разметки.';
      target.appendChild(d);
    }
  }
  function unmount(target){ if(target) target.innerHTML=''; }
  window.SceneFrame = { mount, unmount };
})();
