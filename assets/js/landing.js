(function () {
  var data;
  var landing = document.getElementById('landing');
  var overlay = document.querySelector('.overlay');
  var titleEl = document.getElementById('landing-title');
  var tagEl = document.getElementById('landing-tagline');
  var enterBtn = document.getElementById('enter-btn');
  var muteBtn = document.getElementById('mute-btn');
  var skipBtn = document.getElementById('skip-btn');
  var skipCb = document.getElementById('skip-checkbox');
  var canvas = document.getElementById('fallback');
  var audio;
  var muted = localStorage.getItem('landing.muted') === 'true';

  function updateMuteBtn() {
    muteBtn.textContent = muted ? 'Unmute' : 'Mute';
    muteBtn.setAttribute('aria-label', muted ? 'Включить звук' : 'Выключить звук');
  }

  function ensureAudio() {
    if (audio) return;
    audio = new Audio(data.audioMp3);
    audio.loop = true;
    audio.volume = muted ? 0 : 1;
    audio.play().catch(function () {});
  }

  function toggleMute() {
    ensureAudio();
    muted = !muted;
    audio.volume = muted ? 0 : 1;
    localStorage.setItem('landing.muted', String(muted));
    updateMuteBtn();
  }

  function enter() {
    ensureAudio();
    localStorage.setItem('landing.lastSeenAt', Date.now().toString());
    landing.classList.add('fade-out');
    setTimeout(function () {
      location.href = 'index.html#/overview';
    }, 600);
  }

  function showFallback() {
    landing.style.background = 'url(' + data.poster + ') center/cover no-repeat';
    canvas.hidden = false;
    startStars();
  }

  function startStars() {
    var ctx = canvas.getContext('2d');
    var width = 0;
    var height = 0;
    var count = 120;
    var stars = new Array(count);
    var minO = 0.2;
    var maxO = 0.8;

    function resetStar(i) {
      var speed = 0.2 + Math.random();
      stars[i] = {
        x: Math.random() * width - width / 2,
        y: Math.random() * height - height / 2,
        z: Math.random() * width,
        o: minO + Math.random() * (maxO - minO),
        s: speed,
        c: Math.floor(200 + Math.random() * 55)
      };
    }

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      for (var i = 0; i < count; i++) {
        resetStar(i);
      }
    }

    window.addEventListener('resize', resize);
    resize();

    function step() {
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.fillRect(0, 0, width, height);
      for (var i = 0; i < count; i++) {
        var star = stars[i];
        star.z -= star.s;
        star.o += (Math.random() - 0.5) * 0.05;
        if (star.o < minO) star.o = minO;
        if (star.o > 1) star.o = 1;
        if (star.z <= 0) {
          resetStar(i);
          continue;
        }
        var k = 128 / star.z;
        var x = star.x * k + width / 2;
        var y = star.y * k + height / 2;
        if (x < 0 || x >= width || y < 0 || y >= height) {
          resetStar(i);
          continue;
        }
        var size = (1 - star.z / width) * 2;
        ctx.fillStyle = 'rgba(' + star.c + ',' + star.c + ',' + star.c + ',' + star.o + ')';
        ctx.fillRect(x, y, size, size);
      }
      requestAnimationFrame(step);
    }
    step();
  }

  function init(dataJson) {
    data = dataJson;
    titleEl.textContent = data.title;
    tagEl.textContent = data.tagline;
    updateMuteBtn();
    if (localStorage.getItem('landing.skip') === '1') {
      skipCb.checked = true;
    }
    var video = document.createElement('video');
    video.setAttribute('autoplay', '');
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('loop', '');
    video.poster = data.poster;
    var src = document.createElement('source');
    src.src = data.videoMp4;
    src.type = 'video/mp4';
    video.appendChild(src);
    landing.insertBefore(video, overlay);
    video.addEventListener('error', showFallback);
    setTimeout(function () {
      if (!video.readyState) showFallback();
    }, 4000);
  }

  muteBtn.addEventListener('click', toggleMute);
  enterBtn.addEventListener('click', enter);
  skipBtn.addEventListener('click', enter);
  skipCb.addEventListener('change', function () {
    if (skipCb.checked) {
      localStorage.setItem('landing.skip', '1');
    } else {
      localStorage.removeItem('landing.skip');
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      enter();
    } else if (e.key === 'm' || e.key === 'M') {
      toggleMute();
    }
  });

  fetch('content/landing.json')
    .then(function (r) { return r.json(); })
    .then(init)
    .catch(function () {
      console.error('landing manifest not found');
    });
})();
