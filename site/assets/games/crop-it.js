// Crop It — recadre une image selon un objectif : règle des tiers, ligne d'horizon, espace devant le regard.
(function () {
  const IW = 600, IH = 400;
  const RATIOS = [[1, 1], [4, 5], [5, 4], [16, 9], [3, 2], [2, 3], [9, 16]];
  const AIMS = [
    { text: "le personnage sur un point fort, à gauche", point: "head", t: { x: 1 / 3, y: 1 / 3 }, tip: "La règle des tiers place le sujet sur une intersection : l'image gagne en tension par rapport à un sujet centré." },
    { text: "le personnage sur un point fort, à droite", point: "head", t: { x: 2 / 3, y: 1 / 3 }, tip: "La règle des tiers place le sujet sur une intersection, jamais au milieu exact." },
    { text: "laisse de l'espace devant le regard du personnage", point: "head", t: { x: 1 / 3, y: 1 / 2 }, tip: "On laisse de l'espace du côté où regarde le sujet : coupé devant son regard, il paraît buter contre le bord du cadre." },
    { text: "l'horizon sur le tiers bas, le ciel domine", point: "horizon", t: { y: 2 / 3 }, tip: "Un horizon au tiers bas donne la place au ciel et crée une impression d'espace." },
    { text: "l'horizon sur le tiers haut, le sol domine", point: "horizon", t: { y: 1 / 3 }, tip: "Un horizon au tiers haut donne du poids au premier plan et ancre l'image." },
    { text: "le soleil sur un point fort, en haut à droite", point: "sun", t: { x: 2 / 3, y: 1 / 3 }, tip: "Un sujet fort se place sur une intersection des tiers, pour que le regard s'y pose sans s'y bloquer." },
  ];
  // Tire un format et un objectif réalisables sur cette image
  function makeGoal(sc) {
    for (let i = 0; i < 60; i++) {
      const [a, b] = Oeil.pick(RATIOS), g = { ...Oeil.pick(AIMS), ratio: a / b, label: `${a}:${b}` };
      const sub = g.point === "head" ? { x: sc.px, y: sc.py } : g.point === "horizon" ? { y: sc.hy } : { x: sc.sx, y: sc.sy };
      const fits = [150, 200, 250, 300].some((w) => { const h = w / g.ratio, x = sub.x == null ? 0 : sub.x - g.t.x * w, y = sub.y - g.t.y * h; return h <= IH && x >= 0 && x + w <= IW && y >= 0 && y + h <= IH; });
      if (fits) return { ...g, target: () => g.t };
    }
    return { ...AIMS[3], ratio: 16 / 9, label: "16:9", target: () => AIMS[3].t };
  }
  const THEMES = {
    mer: { sky: "#B9D9FF", far: "#7FA6C9", near: "#D8EF71", sun: "#FFC08F" },
    desert: { sky: "#FFE08A", far: "#F7B4CC", near: "#FFC08F", sun: "#F0447A" },
    nuit: { sky: "#2B3158", far: "#3E467A", near: "#141B3A", sun: "#FFE08A" },
  };
  function scene(sc) {
    const t = THEMES[sc.kind];
    const far = sc.kind === "desert"
      ? `<path d="M0 ${sc.hy} L120 ${sc.hy - 70} L240 ${sc.hy} L360 ${sc.hy - 110} L520 ${sc.hy} L600 ${sc.hy - 40} V${IH} H0Z" fill="${t.far}"/>`
      : sc.kind === "nuit"
        ? `<rect y="${sc.hy}" width="${IW}" height="${IH - sc.hy}" fill="${t.far}"/>${[30, 110, 190, 330, 420, 510].map((x, i) => `<rect x="${x}" y="${sc.hy - 40 - (i * 37) % 70}" width="56" height="${60 + (i * 37) % 70}" fill="${t.far}"/>`).join("")}`
        : `<rect y="${sc.hy}" width="${IW}" height="${IH - sc.hy}" fill="${t.far}"/>`;
    const fg = sc.kind === "nuit" ? "#F7F6F2" : "#141413";
    return `<svg viewBox="0 0 ${IW} ${IH}" class="ci-img" aria-hidden="true">
      <rect width="${IW}" height="${IH}" fill="${t.sky}"/>
      <circle cx="${sc.sx}" cy="${sc.sy}" r="26" fill="${t.sun}"/>${far}
      <path d="M0 ${sc.hy + 30} Q 150 ${sc.hy + 14} 300 ${sc.hy + 34} T 600 ${sc.hy + 28} V ${IH} H 0Z" fill="${t.near}"/>
      <g transform="translate(${sc.px} ${sc.py})"><circle r="16" fill="${fg}"/><path d="M-14 22 Q0 12 14 22 L18 80 H-18Z" fill="${fg}"/><circle cx="8" cy="-2" r="2.5" fill="${sc.kind === "nuit" ? "#141413" : "#F7F6F2"}"/></g>
    </svg>`;
  }
  // Ce qu'il faut déplacer (repère sur l'image) et où l'amener (repère dans le cadre)
  function subject(s) {
    const { point } = s.g, sc = s.sc;
    if (point === "head") return { x: sc.px, y: sc.py };
    if (point === "horizon") return { y: sc.hy };
    return { x: sc.sx, y: sc.sy };
  }
  function apply(s) {
    s.box.style.cssText = `left:${s.c.x}px;top:${s.c.y}px;width:${s.c.w}px;height:${s.c.h}px`;
    const r = s.c.w / s.c.h, ok = Math.abs(r / s.g.ratio - 1) <= 0.02;
    s.tag.textContent = s.adv ? `${Math.round(s.c.w)} × ${Math.round(s.c.h)}` : ok ? `${s.g.label} ✓` : `${r.toFixed(2).replace(".", ",")} : 1`;
    s.tag.classList.toggle("is-ok", !s.adv && ok);
  }
  function fit(board, s) { s.k = Math.min((board.clientWidth - 40) / IW, (board.clientHeight - 40) / IH, 1.3); s.frame.style.transform = `translate(-50%, -50%) scale(${s.k})`; }
  Oeil.play({
    id: "crop-it", name: "Crop It", levels: true,
    howto: [
      { icon: "crop", text: "L'outil Recadrage de Photoshop, en format libre : à toi d'obtenir le format demandé." },
      { icon: "drag_pan", text: "Glisse le cadre pour le déplacer, et sa poignée en bas à droite pour changer sa largeur et sa hauteur." },
      { icon: "grid_on", text: "Sers-toi des lignes des tiers : le sujet se place sur leurs croisements." },
    ],
    brief: (s) => `Recadre en ${s.g.label} : ${s.g.text}.`,
    setup(round, api) {
      const sc = { kind: Oeil.pick(Object.keys(THEMES)), hy: Oeil.randi(170, 250), px: Oeil.randi(160, 440), sx: Oeil.randi(80, 520), sy: Oeil.randi(60, 130) };
      sc.py = sc.hy + Oeil.randi(-20, 10);
      // Le cadre part toujours au mauvais format
      const g = makeGoal(sc), w = 280, h = Math.abs(g.ratio - 1.4) < 0.3 ? 280 : 200;
      return { g, sc, adv: api.level === "adv", c: { x: (IW - w) / 2, y: (IH - h) / 2, w, h } };
    },
    mount(board, s, api) {
      s.frame = api.h("div", "ci-frame", scene(s.sc));
      s.frame.style.cssText = `width:${IW}px;height:${IH}px`;
      s.box = api.h("div", "ci-crop grab", `<span class="ci-third ci-v1"></span><span class="ci-third ci-v2"></span><span class="ci-third ci-h1"></span><span class="ci-third ci-h2"></span>`);
      const hd = api.h("span", "handle ci-resize");
      hd.setAttribute("aria-label", "Taille du recadrage");
        hd.addEventListener("pointerdown", (e) => e.stopPropagation());
      s.box.append(hd);
      s.tag = api.h("span", "ci-format");
      s.box.append(s.tag);
      s.frame.append(s.box);
      board.append(s.frame);
      fit(board, s); apply(s);
      api.drag(s.box, { start: (e) => (e.target === hd ? null : { x: s.c.x, y: s.c.y }), move: (dx, dy, ev, c) => { if (!c) return; s.c.x = api.clamp(c.x + dx / s.k, 0, IW - s.c.w); s.c.y = api.clamp(c.y + dy / s.k, 0, IH - s.c.h); apply(s); } });
      api.drag(hd, {
        start: () => ({ w: s.c.w, h: s.c.h }),
        move: (dx, dy, ev, c) => {
          s.c.w = api.clamp(c.w + dx / s.k, 80, IW - s.c.x); s.c.h = api.clamp(c.h + dy / s.k, 80, IH - s.c.y);
          // En Facile, le cadre s'aimante au format demandé quand on en approche
          if (!s.adv && Math.abs(s.c.w / s.c.h / s.g.ratio - 1) < 0.04) s.c.h = api.clamp(s.c.w / s.g.ratio, 80, IH - s.c.y);
          apply(s);
        },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">crop</span>Format demandé : ${s.g.label}</span><span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse le cadre, tire le coin pour changer son format</span>`;
    },
    resize(board, s) { fit(board, s); },
    evaluate(s) {
      const h = s.c.h, t = s.g.target(s.sc), rErr = Math.abs(s.c.w / s.c.h / s.g.ratio - 1);
      const nx = (x) => (x - s.c.x) / s.c.w, ny = (y) => (y - s.c.y) / h;
      let d = 0, parts = [];
      const head = { x: s.sc.px, y: s.sc.py };
      if (s.g.point === "head") { d = Math.hypot(nx(head.x) - t.x, ny(head.y) - t.y); parts.push(["Position du personnage", `${Math.round(nx(head.x) * 100)} % · ${Math.round(ny(head.y) * 100)} %`]); }
      if (s.g.point === "horizon") { d = Math.abs(ny(s.sc.hy) - t.y); parts.push(["Hauteur de l'horizon", `${Math.round(ny(s.sc.hy) * 100)} % (cible 67 %)`]); }
      if (s.g.point === "sun") { d = Math.hypot(nx(s.sc.sx) - t.x, ny(s.sc.sy) - t.y); parts.push(["Position du soleil", `${Math.round(nx(s.sc.sx) * 100)} % · ${Math.round(ny(s.sc.sy) * 100)} %`]); }
      const inside = s.g.point === "sun" || (nx(head.x) > 0 && nx(head.x) < 1 && ny(head.y) > 0 && ny(head.y) < 1);
      return {
        score: (inside || s.g.point === "horizon" ? 1 : 0.3) * Math.max(0, 100 - Math.max(0, d - 0.03) * 320) * Math.max(0.3, 1 - Math.max(0, rErr - 0.02) * 2.5),
        metrics: [{ label: "Format", value: `${(s.c.w / s.c.h).toFixed(2).replace(".", ",")} : 1 (demandé ${s.g.label})`, good: rErr <= 0.03 }, ...parts.map(([label, value]) => ({ label, value }))],
        principle: s.g.tip,
      };
    },
    reveal(board, s, r, api) {
      s.box.classList.remove("grab"); s.box.classList.add("is-done"); s.box.querySelector(".ci-resize").remove();
      // Cadrage conseillé, à la même taille que celui du joueur
      const t = s.g.target(s.sc), sub = subject(s);
      // Même largeur que le joueur si elle tient dans l'image, au format exact
      let w = s.c.w, h = w / s.g.ratio;
      if (h > IH) { h = IH; w = h * s.g.ratio; }
      const x = sub.x != null && t.x != null ? api.clamp(sub.x - t.x * w, 0, IW - w) : s.c.x;
      const y = sub.y != null && t.y != null ? api.clamp(sub.y - t.y * h, 0, IH - h) : s.c.y;
      s.frame.insertAdjacentHTML("beforeend", `<span class="ci-ideal" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><span class="tag-ref" style="left:0;top:-24px">Cadrage conseillé</span></span>`);
    },
  });
})();
