/* INK CAST · interações leves (sem bibliotecas) */
(() => {
  "use strict";
  document.documentElement.classList.remove("no-js");

  const U = (id, w, h, q = 70) =>
    `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ""}&q=${q}`;

  /* ---------- Portfólio ----------
     Para trocar pelas fotos reais do estúdio, basta substituir "id"
     por um caminho local, ex.: src: "img/portfolio/01.jpg" */
  const WORKS = [
    { id: "1540174053853-1cc5d1fa8814", r: 1.25, cat: "realismo",  label: "Asas · costas" },
    { id: "1522687533888-1078974f88ec", r: 1.33, cat: "realismo",  label: "Leão · antebraço" },
    { id: "1706433758051-73c10d1157ca", r: 1.5,  cat: "blackwork", label: "Preto & cinza · braço" },
    { id: "1651692883249-ed36b3523419", r: 1.33, cat: "fine",      label: "Traços finos · braço" },
    { id: "1704345911815-5d9aa04aeb80", r: 1.25, cat: "realismo",  label: "Retrato feminino" },
    { id: "1568515045052-f9a854d70bfd", r: 1,    cat: "processo",  label: "Sessão no estúdio" },
    { id: "1759247943094-38c725526a5d", r: 1.33, cat: "realismo",  label: "Fechamento · costas" },
    { id: "1562379825-415aea84ebcf",    r: 1,    cat: "blackwork", label: "Nuca e pescoço" },
    { id: "1570168983832-8989dae1522e", r: 1.4,  cat: "fine",      label: "Lettering fino" },
    { id: "1665085326630-b01fea9a613d", r: 1.5,  cat: "realismo",  label: "Realismo · braço" },
    { id: "1643984920001-dc7b2d197165", r: 1.25, cat: "processo",  label: "Linha a linha" },
    { id: "1570106786245-ce68ce6503f8", r: 1.33, cat: "blackwork", label: "Filtro dos sonhos" },
    { id: "1547754145-ef9ff306e3f3",    r: 1,    cat: "fine",      label: "Minimalista · ombro" },
    { id: "1519822356-4853be4346a8",    r: 1.25, cat: "blackwork", label: "Sombreado" },
    { id: "1597852075234-fd721ac361d3", r: 1.33, cat: "processo",  label: "Detalhe da agulha" },
    { id: "1712432321375-226f466fff85", r: 1,    cat: "processo",  label: "Precisão" },
    { id: "1704345910291-49168c7631b6", r: 1.4,  cat: "processo",  label: "Bastidores" },
    { id: "1775134061522-c41e0bf5512f", r: 1.25, cat: "processo",  label: "Ambiente do estúdio" }
  ];

  const gallery = document.getElementById("gallery");
  if (gallery) {
    const frag = document.createDocumentFragment();
    WORKS.forEach((w, i) => {
      const h = Math.round(600 * w.r);
      const fig = document.createElement("figure");
      fig.className = "tile reveal";
      fig.dataset.cat = w.cat;
      fig.dataset.index = i;
      fig.innerHTML = `
        <img src="${U(w.id, 600, h)}"
             srcset="${U(w.id, 400, Math.round(400 * w.r))} 400w, ${U(w.id, 600, h)} 600w, ${U(w.id, 900, Math.round(900 * w.r))} 900w"
             sizes="(min-width:1200px) 24vw, (min-width:700px) 32vw, 48vw"
             width="600" height="${h}" alt="${w.label}" loading="${i < 4 ? "eager" : "lazy"}" decoding="async">
        <figcaption>${w.label}</figcaption>
        <button type="button" aria-label="Ampliar: ${w.label}"></button>`;
      frag.appendChild(fig);
    });
    gallery.appendChild(frag);
  }

  /* ---------- Filtros ---------- */
  const chips = document.querySelectorAll(".chip");
  let visible = WORKS.map((_, i) => i);
  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const f = chip.dataset.filter;
      chips.forEach((c) => {
        const on = c === chip;
        c.classList.toggle("is-active", on);
        c.setAttribute("aria-selected", on);
      });
      visible = [];
      gallery.querySelectorAll(".tile").forEach((t) => {
        const show = f === "all" || t.dataset.cat === f;
        t.classList.toggle("is-hidden", !show);
        if (show) { visible.push(+t.dataset.index); t.classList.add("is-in"); }
      });
    });
  });

  /* ---------- Lightbox com swipe ---------- */
  const lb = document.getElementById("lightbox");
  const lbFig = lb.querySelector(".lb__fig");
  const lbImg = document.createElement("img");
  lbImg.alt = "";
  lbImg.decoding = "async";
  lbFig.prepend(lbImg);
  const lbCap = lb.querySelector("figcaption");
  let cur = 0, lastFocus = null;

  const show = (pos) => {
    cur = (pos + visible.length) % visible.length;
    const w = WORKS[visible[cur]];
    lbImg.classList.add("is-loading");
    lbImg.onload = () => lbImg.classList.remove("is-loading");
    lbImg.src = U(w.id, 1400, null, 75);
    lbImg.alt = w.label;
    lbCap.textContent = `${w.label} · ${cur + 1}/${visible.length}`;
    // pré-carrega a próxima
    const nx = WORKS[visible[(cur + 1) % visible.length]];
    new Image().src = U(nx.id, 1400, null, 75);
  };
  const open = (idx) => {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => lb.classList.add("is-open"));
    show(Math.max(0, visible.indexOf(idx)));
    lb.querySelector(".lb__close").focus();
  };
  const close = () => {
    lb.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { lb.hidden = true; lbImg.removeAttribute("src"); }, 300);
    if (lastFocus) lastFocus.focus();
  };

  gallery?.addEventListener("click", (e) => {
    const btn = e.target.closest(".tile button");
    if (btn) open(+btn.parentElement.dataset.index);
  });
  lb.querySelector(".lb__close").addEventListener("click", close);
  lb.querySelector(".lb__prev").addEventListener("click", () => show(cur - 1));
  lb.querySelector(".lb__next").addEventListener("click", () => show(cur + 1));
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowRight") show(cur + 1);
    if (e.key === "ArrowLeft") show(cur - 1);
  });
  let sx = 0, sy = 0;
  lb.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
  lb.addEventListener("touchend", (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(cur + (dx < 0 ? 1 : -1));
    else if (dy > 90 && Math.abs(dy) > Math.abs(dx)) close();
  }, { passive: true });

  /* ---------- Menu mobile ---------- */
  const burger = document.querySelector(".burger");
  const nav = document.getElementById("menu");
  const setMenu = (openIt) => {
    burger.setAttribute("aria-expanded", openIt);
    burger.setAttribute("aria-label", openIt ? "Fechar menu" : "Abrir menu");
    nav.classList.toggle("is-open", openIt);
    document.body.classList.toggle("menu-open", openIt);
  };
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && nav.classList.contains("is-open")) setMenu(false); });

  /* ---------- Header + CTA mobile (1 leitura por frame) ---------- */
  const header = document.querySelector(".header");
  const cta = document.querySelector(".mobile-cta");
  let lastY = 0, ticking = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-solid", y > 40);
    header.classList.toggle("is-hidden", y > lastY && y > 500 && !nav.classList.contains("is-open"));
    cta.classList.toggle("is-visible", y > window.innerHeight * 0.7);
    lastY = y;
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Revelar ao rolar ---------- */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }
})();
