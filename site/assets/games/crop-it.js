// Crop It — recadre une image selon un objectif : règle des tiers, ligne d'horizon, espace devant le regard.
(function () {
  const IW = 600, IH = 400;
  const GOALS = Oeil.shuffle([
    { ratio: 1, label: "carré", text: "Recadre en carré, la tête du personnage sur le tiers gauche", target: (sc) => ({ x: 1 / 3, y: 1 / 3 }), point: "head", tip: "La règle des tiers place le sujet sur une intersection des lignes qui divisent l'image en trois : l'image respire et l'œil circule." },
    { ratio: 4 / 5, label: "portrait 4:5", text: "Recadre en portrait 4:5, l'horizon sur le tiers bas", target: () => ({ y: 2 / 3 }), point: "horizon", tip: "Un horizon au tiers bas donne la place au ciel ; au tiers haut, il donne la place au sol. Au milieu, l'image se coupe en deux et devient statique." },
    { ratio: 16 / 9, label: "16:9", text: "Recadre en 16:9 en laissant de l'espace devant le regard (le personnage regarde à droite)", target: () => ({ x: 1 / 3, y: 1 / 2 }), point: "head", tip: "On laisse de l'espace du côté où regarde le sujet : coupé devant son regard, il paraît buter contre le bord du cadre." },
    { ratio: 3 / 2, label: "3:2", text: "Recadre en 3:2, le soleil sur le tiers droit et l'horizon sur le tiers bas", target: () => ({ x: 2 / 3, y: 2 / 3 }), point: "sunHorizon", tip: "Deux éléments forts se placent sur deux lignes de tiers différentes : l'un structure l'image, l'autre l'anime." },
  ]);
  function scene(sc) {
    return `<svg viewBox="0 0 ${IW} ${IH}" class="ci-img" aria-hidden="true">
      <rect width="${IW}" height="${sc.hy}" fill="#B9D9FF"/><rect y="${sc.hy}" width="${IW}" height="${IH - sc.hy}" fill="#7FA6C9"/>
      <circle cx="${sc.sx}" cy="${sc.sy}" r="26" fill="#FFC08F"/>
      <path d="M0 ${sc.hy + 30} Q 150 ${sc.hy + 14} 300 ${sc.hy + 34} T 600 ${sc.hy + 28} V ${IH} H 0Z" fill="#D8EF71"/>
      <g transform="translate(${sc.px} ${sc.py})"><circle r="16" fill="#141413"/><path d="M-14 22 Q0 12 14 22 L18 80 H-18Z" fill="#141413"/><circle cx="8" cy="-2" r="2.5" fill="#F7F6F2"/></g>
    </svg>`;
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
      const sc = { hy: Oeil.randi(170, 250), px: Oeil.randi(160, 440), sx: Oeil.randi(80, 520), sy: Oeil.randi(60, 130) };
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
      if (s.g.point === "sunHorizon") { d = (Math.abs(nx(s.sc.sx) - t.x) + Math.abs(ny(s.sc.hy) - t.y)) / 1.4; parts.push(["Soleil", `${Math.round(nx(s.sc.sx) * 100)} % (cible 67 %)`], ["Horizon", `${Math.round(ny(s.sc.hy) * 100)} % (cible 67 %)`]); }
      const inside = nx(head.x) > 0 && nx(head.x) < 1 && ny(head.y) > 0 && ny(head.y) < 1;
      return {
        score: (inside || s.g.point === "horizon" ? 1 : 0.3) * Math.max(0, 100 - Math.max(0, d - 0.03) * 320),
        metrics: parts.map(([label, value]) => ({ label, value })),
        principle: s.g.tip,
      };
    },
    reveal(board, s) { s.box.classList.remove("grab"); s.box.classList.add("is-done"); s.box.querySelector(".ci-resize").remove(); },
  });
})();
