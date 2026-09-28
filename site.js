// Lado Kvataniya treatment site — page motion. Slides are the Figma frames on the little punk Rocky pins (gen-slides.py):
// top-level loops and photos are "pictures", the giant fitted words (svg.fit) and the text blocks are the words;
// colour blocks, veils and the logo stay put. Pictures come first, then the type.
(() => {
  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  root.classList.add('js');

  /* ---------- 1. fit the 1920×1080 slides into their plates ---------- */
  const plates = [...document.querySelectorAll('.plate')];
  function fit() {
    for (const p of plates) { const s = p.querySelector('.slide'); if (s) s.style.transform = `scale(${p.clientWidth / 1920})`; }
  }
  fit();
  let lastW = innerWidth;   // phones change the height while scrolling (address bar): only a new width re-fits
  addEventListener('resize', () => { if (innerWidth === lastW) return; lastW = innerWidth; fit(); window.ScrollTrigger && ScrollTrigger.refresh(); });

  /* ---------- 1b. the mini cover on the «turn your phone» screen ---------- */
  function fitMini() {
    const rot = document.querySelector('.rotate'), mini = rot && rot.querySelector('.mini'); if (!mini) return;
    const stage = rot.querySelector('.rotate__stage');
    const w = Math.min(innerWidth - 48, 420), h = w * 9 / 16, sh = stage.clientHeight || innerHeight * 0.55;
    const s1 = Math.min((sh * 0.9) / w, (innerWidth - 48) / h);
    mini.style.setProperty('--mw', w + 'px'); mini.style.setProperty('--s1', s1.toFixed(3)); mini.style.setProperty('--k', (w / 1920).toFixed(5));
  }
  fitMini(); addEventListener('resize', fitMini);

  /* ---------- 1c. phones held upright: the «turn your phone» screen shows once, at the start ---------- */
  const land = matchMedia('(orientation: landscape)');
  const done = () => { if (root.classList.contains('rotate-done')) return; root.classList.add('rotate-done');
    window.LENIS && LENIS.start(); window.ScrollTrigger && ScrollTrigger.refresh(); };
  if (land.matches) done();
  land.addEventListener('change', (e) => { if (e.matches) done(); });
  document.querySelector('.rotate__skip')?.addEventListener('click', done);

  /* ---------- 2. loops play only while visible ---------- */
  const vio = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target; if (e.isIntersecting) { v.muted = true; v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.12 });
  document.querySelectorAll('#flow video').forEach((v) => { v.removeAttribute('autoplay'); v.muted = true; vio.observe(v); });

  if (REDUCED || !window.gsap) return;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });

  /* ---------- 3. smooth scroll ---------- */
  if (window.Lenis) {
    const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((t) => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.LENIS = lenis;
    if (!root.classList.contains('rotate-done') && getComputedStyle(document.querySelector('.rotate')).display !== 'none') lenis.stop();
  }

  /* ---------- 4. picture first, then type ---------- */
  function prepare(plate) {
    const slide = plate.querySelector('.slide');
    const pics = [...slide.querySelectorAll(':scope > video.abs, :scope > img.abs')];
    const txt = [...slide.querySelectorAll(':scope > .abs')].filter((el) => !pics.includes(el) && !el.classList.contains('ylogo') &&
      (el.classList.contains('fit') || (el.tagName === 'DIV' && el.textContent.trim())));
    pics.forEach((el) => el.classList.add('reveal-img'));
    txt.forEach((el) => el.classList.add('reveal-txt'));
    return { pics, txt };
  }
  function play(plate, { pics, txt }, delay = 0) {
    const tl = gsap.timeline({ delay });
    const W = plate.querySelector('.slide').offsetWidth || 1920;
    pics.forEach((el, i) => {
      const full = el.offsetWidth / W > 0.9;
      tl.fromTo(el, full ? { opacity: 0 } : { opacity: 0, y: 40 },
        full ? { opacity: 1, duration: 1.3, ease: 'power2.out' } : { opacity: 1, y: 0, duration: 0.95, ease: 'back.out(1.3)', clearProps: 'transform' }, i * 0.1);
    });
    if (txt.length) tl.fromTo(txt, { opacity: 0, clipPath: 'inset(-40% -6% 140% -6%)' },
      { opacity: 1, clipPath: 'inset(-40% -6% -40% -6%)', duration: 1.1, ease: 'expo.out', stagger: { each: 0.03, from: 'start' },
        onComplete: () => gsap.set(txt, { clearProps: 'clipPath' }) }, pics.length ? '>-0.6' : 0);
    return tl;
  }
  plates.forEach((plate) => {
    const parts = prepare(plate);
    if (plate.classList.contains('plate--cover')) { play(plate, parts, 0.2); return; }
    ScrollTrigger.create({ trigger: plate, start: 'top 78%', once: true, onEnter: () => play(plate, parts) });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
