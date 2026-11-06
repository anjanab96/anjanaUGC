(() => {
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const desktop = matchMedia("(min-width: 900px)");
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  $("[data-year]").textContent = new Date().getFullYear();

  // Split hero name into letters for the staggered intro
  let i = 0;
  $$(".split").forEach((word) => {
    const text = word.textContent.trim();
    word.textContent = "";
    word.setAttribute("aria-label", text);
    for (const c of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i++);
      s.textContent = c;
      word.appendChild(s);
    }
  });

  // Fade/slide items in as they enter; siblings get a small stagger
  const revealEls = $$(".reveal, .reveal-img");
  revealEls.forEach((el) => {
    const group = [...el.parentElement.children].filter((c) => c.matches(".reveal, .reveal-img"));
    el.style.setProperty("--d", `${Math.min(group.indexOf(el), 5) * 0.08}s`);
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    }),
    { rootMargin: "0px 0px -10% 0px", threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));

  // Load TikTok players only when they get close to the screen
  const tiktokIO = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const box = e.target;
      const f = document.createElement("iframe");
      f.src = `https://www.tiktok.com/player/v1/${box.dataset.tiktok}?description=0&music_info=0&rel=0&closed_caption=0`;
      f.allow = "autoplay; fullscreen; encrypted-media; picture-in-picture";
      f.title = "TikTok video";
      f.loading = "lazy";
      box.appendChild(f);
      tiktokIO.unobserve(box);
    }),
    { rootMargin: "400px 400px" }
  );
  $$("[data-tiktok]").forEach((el) => tiktokIO.observe(el));

  // ---------- Scroll-linked motion ----------
  const nav = $(".nav");
  const progress = $(".progress");
  const hero = $(".hero");
  const heroName = $("[data-drift]");
  const parallax = $$("[data-parallax]");
  const cols = $$(".gallery__col[data-speed]");
  const marquee = $("[data-marquee]");
  const ctaTitle = $("[data-scale]");
  const videos = $(".videos");
  const pin = $(".videos__pin");
  const track = $(".videos__track");

  let vh = innerHeight;
  let lastY = scrollY;
  let marqueeX = 0;
  let velocity = 0;
  let pinDistance = 0;
  const PIN_SLOW = 1.6; // vertical scroll px per horizontal px

  function setupPin() {
    vh = innerHeight;
    const on = desktop.matches && !reduceMotion;
    videos.classList.toggle("is-pinned", on);
    track.style.transform = "";
    if (!on) { videos.style.height = ""; pinDistance = 0; return; }
    pinDistance = Math.max(0, track.scrollWidth - innerWidth);
    videos.style.height = `${pin.offsetHeight + pinDistance * PIN_SLOW}px`;
  }

  function frame() {
    const y = scrollY;
    const max = document.documentElement.scrollHeight - vh;
    progress.style.setProperty("--p", max > 0 ? y / max : 0);

    // Nav: solid after hero, hides when scrolling down, returns on scroll up
    const dy = y - lastY;
    nav.classList.toggle("is-solid", y > vh * 0.6);
    if (Math.abs(dy) > 4) nav.classList.toggle("is-hidden", dy > 0 && y > vh);

    velocity += (dy - velocity) * 0.15;
    lastY = y;

    if (!reduceMotion) {
      // Parallax: element drifts relative to its own position on screen
      parallax.forEach((el) => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const offset = (r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.parallax);
        el.style.translate = `0 ${offset.toFixed(1)}px`;
      });

      // Hero name slides sideways and fades as you leave the hero
      const hp = clamp(y / hero.offsetHeight, 0, 1);
      heroName.style.transform = `translateX(${(-hp * 18).toFixed(2)}vw)`;
      heroName.style.opacity = (1 - hp * 0.9).toFixed(3);

      // Gallery columns move at different speeds
      cols.forEach((c) => {
        const r = c.parentElement.getBoundingClientRect();
        if (r.bottom < -200 || r.top > vh + 200) return;
        c.style.transform = `translateY(${(r.top * parseFloat(c.dataset.speed)).toFixed(1)}px)`;
      });

      // Marquee: constant drift, sped up by scroll velocity
      const half = marquee.scrollWidth / 2;
      marqueeX -= 0.6 + Math.abs(velocity) * 0.35;
      if (marqueeX <= -half) marqueeX += half;
      marquee.style.transform = `translate3d(${marqueeX.toFixed(1)}px,0,0)`;

      // Pinned horizontal video row
      if (pinDistance) {
        const top = videos.getBoundingClientRect().top;
        const p = clamp(-top / (pinDistance * PIN_SLOW), 0, 1);
        track.style.transform = `translate3d(${(-p * pinDistance).toFixed(1)}px,0,0)`;
      }

      // CTA headline grows into place
      const cr = ctaTitle.getBoundingClientRect();
      const cp = clamp((vh - cr.top) / (vh * 0.6), 0, 1);
      ctaTitle.style.transform = `scale(${(0.7 + cp * 0.3).toFixed(3)})`;
      ctaTitle.style.opacity = (0.15 + cp * 0.85).toFixed(3);
    }

    requestAnimationFrame(frame);
  }

  setupPin();
  addEventListener("resize", () => { clearTimeout(setupPin.t); setupPin.t = setTimeout(setupPin, 150); });
  addEventListener("load", setupPin);
  requestAnimationFrame(frame);
})();
