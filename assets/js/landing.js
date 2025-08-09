(function () {
  var data;
  var landing = document.getElementById('landing');
  var overlay = document.querySelector('.overlay');
  var titleEl = document.getElementById('landing-title');
  var tagEl = document.getElementById('landing-tagline');
  var enterBtn = document.getElementById('enter-btn');
  var muteBtn = document.getElementById('mute-btn');
  var skipBtn = document.getElementById('skip-btn');
  var alwaysSkipBtn = document.getElementById('always-skip-btn');
  var loader = document.getElementById('loader');
  var canvas = document.getElementById('fallback');
  var audio;
  var muted = localStorage.getItem('landing:muted') === 'true';
  var prefetched = false;
  var gestured = false;
  var lowFps = false;

  var fpsCount = 0;
  var fpsStart = performance.now();
  function fpsCheck(now) {
    fpsCount++;
    if (now - fpsStart < 1000) {
      requestAnimationFrame(fpsCheck);
    } else if (fpsCount < 30) {
      lowFps = true;
      landing.classList.add('no-effects');
    }
  }
  requestAnimationFrame(fpsCheck);

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
    localStorage.setItem('landing:muted', String(muted));
    updateMuteBtn();
  }

  function prefetchHub() {
    if (prefetched) return;
    prefetched = true;
    ['assets/js/router.js', 'assets/js/md.js', 'assets/js/progress.v2.js'].forEach(function (src) {
      var link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = src;
      document.head.appendChild(link);
    });
  }

  function enter() {
    ensureAudio();
    localStorage.setItem('landing:lastSeen', Date.now().toString());
    landing.classList.add('fade-out');
    setTimeout(function () {
      location.href = 'index.html#/overview';
    }, 600);
  }

  function showFallback() {
    landing.style.background = 'url(' + data.poster + ') center/cover no-repeat';
    loader.hidden = true;
    enterBtn.hidden = false;
    if (!lowFps) {
      canvas.hidden = false;
      startStars();
    }
    prefetchHub();
  }

  function startStars() {
    if (lowFps) return;
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

  function onFirstGesture() {
    if (gestured) return;
    gestured = true;
    muteBtn.hidden = false;
    ensureAudio();
    prefetchHub();
  }

  function init(dataJson) {
    data = dataJson;
    titleEl.textContent = data.title;
    tagEl.textContent = data.tagline;
    updateMuteBtn();
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
    video.addEventListener('canplay', function () {
      loader.hidden = true;
      enterBtn.hidden = false;
      prefetchHub();
    });
    video.addEventListener('loadeddata', prefetchHub);
    video.addEventListener('error', showFallback);
    setTimeout(function () {
      if (!video.readyState) showFallback();
    }, 4000);
    setTimeout(function () {
      loader.hidden = true;
      enterBtn.hidden = false;
    }, 3000);
  }

  document.addEventListener('click', onFirstGesture);
  document.addEventListener('touchstart', onFirstGesture);
  document.addEventListener('keydown', onFirstGesture);

  muteBtn.addEventListener('click', toggleMute);
  enterBtn.addEventListener('click', enter);
  skipBtn.addEventListener('click', enter);
  alwaysSkipBtn.addEventListener('click', function () {
    localStorage.setItem('landing:skip', 'true');
    enter();
  });

  document.addEventListener('keydown', function (e) {
    if (e.code === 'Enter') {
      e.preventDefault();
      enter();
    } else if (e.code === 'Space') {
      e.preventDefault();
      toggleMute();
    } else if (e.code === 'Escape') {
      e.preventDefault();
      enter();
    }
  });

  fetch('content/landing.json')
    .then(function (r) { return r.json(); })
    .then(init)
    .catch(function () {
      console.error('landing manifest not found');
    });
})();

