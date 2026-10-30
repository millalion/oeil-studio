// Crop It — recadre une image selon un objectif : règle des tiers, ligne d'horizon, espace devant le regard.
(function () {
  const IW = 600, IH = 400;
  const GOALS = Oeil.shuffle([
    { ratio: 1, label: "carré", text: "Format carré : amène la tête (point rose) sur le rond rose", target: (sc) => ({ x: 1 / 3, y: 1 / 3 }), point: "head", tip: "La règle des tiers place le sujet sur une intersection des lignes qui divisent l'image en trois : l'image respire et l'œil circule." },
    { ratio: 4 / 5, label: "portrait 4:5", text: "Format portrait : amène l'horizon (ligne rose) sur la ligne pointillée", target: () => ({ y: 2 / 3 }), point: "horizon", tip: "Un horizon au tiers bas donne la place au ciel ; au tiers haut, il donne la place au sol. Au milieu, l'image se coupe en deux et devient statique." },
    { ratio: 16 / 9, label: "16:9", text: "Format 16:9 : amène la tête sur le rond rose, le personnage a de l'espace devant lui", target: () => ({ x: 1 / 3, y: 1 / 2 }), point: "head", tip: "On laisse de l'espace du côté où regarde le sujet : coupé devant son regard, il paraît buter contre le bord du cadre." },
    { ratio: 3 / 2, label: "3:2", text: "Format 3:2 : amène le soleil sur le rond rose", target: () => ({ x: 2 / 3, y: 1 / 3 }), point: "sun", tip: "Un sujet fort se place sur une intersection des lignes de tiers plutôt qu'au centre : l'image respire et le regard circule." },
  ]);
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
    s.box.style.cssText = `left:${s.c.x}px;top:${s.c.y}px;width:${s.c.w}px;height:${s.c.w / s.g.ratio}px`;
  }
  function fit(board, s) { s.k = Math.min((board.clientWidth - 40) / IW, (board.clientHeight - 40) / IH, 1.3); s.frame.style.transform = `translate(-50%, -50%) scale(${s.k})`; }
  Oeil.play({
    id: "crop-it", name: "Crop It",
    howto: [
      { icon: "crop", text: "Le cadre rose est ton recadrage. Son format est imposé par la consigne." },
      { icon: "drag_pan", text: "Glisse le cadre pour le déplacer, et sa poignée en bas à droite pour l'agrandir ou le réduire." },
      { icon: "grid_on", text: "Les lignes des tiers s'affichent dans le cadre pour t'aider à placer le sujet." },
    ],
    brief: (s) => s.g.text + ".",
    setup(round) {
      const g = GOALS[round % GOALS.length];
      const sc = { kind: Oeil.pick(Object.keys(THEMES)), hy: Oeil.randi(170, 250), px: Oeil.randi(160, 440), sx: Oeil.randi(80, 520), sy: Oeil.randi(60, 130) };
      sc.py = sc.hy + Oeil.randi(-20, 10);
      const w = g.ratio >= 1 ? 300 : 220;
      return { g, sc, c: { x: (IW - w) / 2, y: Math.max(0, (IH - w / g.ratio) / 2), w } };
    },
    mount(board, s, api) {
      s.frame = api.h("div", "ci-frame", scene(s.sc));
      s.frame.style.cssText = `width:${IW}px;height:${IH}px`;
      s.box = api.h("div", "ci-crop grab", `<span class="ci-third ci-v1"></span><span class="ci-third ci-v2"></span><span class="ci-third ci-h1"></span><span class="ci-third ci-h2"></span>`);
      const hd = api.h("span", "handle ci-resize");
      hd.setAttribute("aria-label", "Taille du recadrage");
        hd.addEventListener("pointerdown", (e) => e.stopPropagation());
      s.box.append(hd);
      // Repères : le sujet sur l'image, sa place dans le cadre
      const t = s.g.target(s.sc), sub = subject(s);
      if (t.x != null && s.g.point !== "horizon") s.box.insertAdjacentHTML("beforeend", `<span class="ci-goal" style="left:${t.x * 100}%;top:${t.y * 100}%"></span>`);
      if (s.g.point === "horizon") {
        s.box.insertAdjacentHTML("beforeend", `<span class="ci-goal-line" style="top:${t.y * 100}%"></span>`);
        s.frame.insertAdjacentHTML("beforeend", `<span class="ci-line" style="top:${s.sc.hy}px"></span>`);
      } else s.frame.insertAdjacentHTML("beforeend", `<span class="ci-dot" style="left:${sub.x}px;top:${sub.y}px"></span>`);
      s.frame.append(s.box);
      board.append(s.frame);
      fit(board, s); apply(s);
      const h = () => s.c.w / s.g.ratio;
      api.drag(s.box, { start: (e) => (e.target === hd ? null : { x: s.c.x, y: s.c.y }), move: (dx, dy, ev, c) => { if (!c) return; s.c.x = api.clamp(c.x + dx / s.k, 0, IW - s.c.w); s.c.y = api.clamp(c.y + dy / s.k, 0, IH - h()); apply(s); } });
      api.drag(hd, { start: () => ({ w: s.c.w }), move: (dx, dy, ev, c) => { const maxW = Math.min(IW - s.c.x, (IH - s.c.y) * s.g.ratio); s.c.w = api.clamp(c.w + dx / s.k, 120, maxW); apply(s); } });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">crop</span>Format imposé : ${s.g.label}</span><span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse le cadre, étire par le coin</span>`;
    },
    resize(board, s) { fit(board, s); },
    evaluate(s) {
      const h = s.c.w / s.g.ratio, t = s.g.target(s.sc);
      const nx = (x) => (x - s.c.x) / s.c.w, ny = (y) => (y - s.c.y) / h;
      let d = 0, parts = [];
      const head = { x: s.sc.px, y: s.sc.py };
      if (s.g.point === "head") { d = Math.hypot(nx(head.x) - t.x, ny(head.y) - t.y); parts.push(["Position du personnage", `${Math.round(nx(head.x) * 100)} % · ${Math.round(ny(head.y) * 100)} %`]); }
      if (s.g.point === "horizon") { d = Math.abs(ny(s.sc.hy) - t.y); parts.push(["Hauteur de l'horizon", `${Math.round(ny(s.sc.hy) * 100)} % (cible 67 %)`]); }
      if (s.g.point === "sun") { d = Math.hypot(nx(s.sc.sx) - t.x, ny(s.sc.sy) - t.y); parts.push(["Position du soleil", `${Math.round(nx(s.sc.sx) * 100)} % · ${Math.round(ny(s.sc.sy) * 100)} %`]); }
      const inside = s.g.point === "sun" || (nx(head.x) > 0 && nx(head.x) < 1 && ny(head.y) > 0 && ny(head.y) < 1);
      return {
        score: (inside || s.g.point === "horizon" ? 1 : 0.3) * Math.max(0, 100 - Math.max(0, d - 0.03) * 320),
        metrics: parts.map(([label, value]) => ({ label, value })),
        principle: s.g.tip,
      };
    },
    reveal(board, s, r, api) {
      s.box.classList.remove("grab"); s.box.classList.add("is-done"); s.box.querySelector(".ci-resize").remove();
      // Cadrage conseillé, à la même taille que celui du joueur
      const w = s.c.w, h = w / s.g.ratio, t = s.g.target(s.sc), sub = subject(s);
      const x = sub.x != null && t.x != null ? api.clamp(sub.x - t.x * w, 0, IW - w) : s.c.x;
      const y = sub.y != null && t.y != null ? api.clamp(sub.y - t.y * h, 0, IH - h) : s.c.y;
      s.frame.insertAdjacentHTML("beforeend", `<span class="ci-ideal" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px"><span class="tag-ref" style="left:0;top:-24px">Cadrage conseillé</span></span>`);
    },
  });
})();
