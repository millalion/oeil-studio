// Easing Lab — regarde un mouvement, puis tords la courbe de Bézier pour le reproduire.
(function () {
  const TARGETS = Oeil.fresh("easing-lab", [
    { name: "ease-out", p: [0, 0, 0.58, 1], tip: "Ease-out démarre vite et freine : c'est la courbe des éléments qui entrent à l'écran, ils arrivent avec élan puis se posent." },
    { name: "ease-in", p: [0.42, 0, 1, 1], tip: "Ease-in démarre lentement et accélère : réservé aux sorties, un élément qui part prend de la vitesse." },
    { name: "ease-in-out", p: [0.42, 0, 0.58, 1], tip: "Ease-in-out accélère puis freine : idéal pour un élément qui se déplace d'un point à un autre sans quitter l'écran." },
    { name: "expo-out", p: [0.16, 1, 0.3, 1], tip: "Une sortie exponentielle couvre presque tout le trajet en un instant, puis s'étire : sensation de réactivité, très utilisée en interface." },
    { name: "back-out", p: [0.34, 1.56, 0.64, 1], tip: "Une poignée au-dessus de 1 fait dépasser la cible avant de revenir : un rebond léger, à doser pour ne pas fatiguer." },
  ]);
  const DUR = 1400, PAUSE = 500;
  let raf = 0;
  const G = 260, PAD = 30; // taille du graphe, marge

  function bez(p, x) {
    const [x1, y1, x2, y2] = p;
    const cx = (t) => 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t;
    const cy = (t) => 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t;
    let lo = 0, hi = 1, t = x;
    for (let i = 0; i < 28; i++) { t = (lo + hi) / 2; if (cx(t) < x) lo = t; else hi = t; }
    return cy(t);
  }
  const toSvg = (x, y) => [PAD + x * G, PAD + (1 - y) * G];

  function drawCurve(s) {
    const [a, b] = [toSvg(s.u[0], s.u[1]), toSvg(s.u[2], s.u[3])];
    const [o, e] = [toSvg(0, 0), toSvg(1, 1)];
    s.path.setAttribute("d", `M${o} C${a} ${b} ${e}`);
    s.l1.setAttribute("d", `M${o} L${a}`); s.l2.setAttribute("d", `M${e} L${b}`);
    s.h1.style.left = `${(a[0] / (G + PAD * 2)) * 100}%`; s.h1.style.top = `${(a[1] / (G + PAD * 2)) * 100}%`;
    s.h2.style.left = `${(b[0] / (G + PAD * 2)) * 100}%`; s.h2.style.top = `${(b[1] / (G + PAD * 2)) * 100}%`;
    s.code.textContent = `cubic-bezier(${s.u.map((v) => v.toFixed(2)).join(", ")})`;
  }

  Oeil.play({
    id: "easing-lab", name: "Easing Lab",
    howto: [
      { icon: "animation", text: "La bille rose suit un mouvement mystère. La noire suit ta courbe." },
      { icon: "drag_pan", text: "Attrape les deux poignées roses du graphe et tords la courbe jusqu'à ce que les deux billes bougent pareil." },
      { icon: "lightbulb", text: "Repère d'abord : la bille rose démarre-t-elle vite (poignée de gauche vers le haut) ou lentement (vers la droite) ? Finit-elle en douceur (poignée de droite vers la gauche) ?" },
      { icon: "check", text: "Valide : la courbe cible s'affiche sur la tienne." },
    ],
    brief: "Tords la courbe pour que la bille noire bouge comme la rose.",
    hint: { label: "Voir la cible 2 s", run(s) { const p = s.t.p, [a, b] = [toSvg(p[0], p[1]), toSvg(p[2], p[3])]; s.ref.setAttribute("d", `M${toSvg(0, 0)} C${a} ${b} ${toSvg(1, 1)}`); setTimeout(() => { if (Oeil && s.ref && !s.revealed) s.ref.setAttribute("d", ""); }, 2000); } },
    setup(round) { return { t: TARGETS[round % TARGETS.length], u: [0.3, 0.3, 0.7, 0.7] }; },
    mount(board, s, api) {
      const wrap = api.h("div", "el-wrap");
      const lanes = api.h("div", "el-lanes", `<div class="el-lane"><span class="el-ball el-ball-ref"></span><small>Mouvement cible</small></div><div class="el-lane"><span class="el-ball el-ball-you"></span><small>Ta courbe</small></div>`);
      const graph = api.h("div", "el-graph");
      const S = G + PAD * 2;
      graph.innerHTML = `<svg viewBox="0 0 ${S} ${S}" aria-hidden="true">
        <rect x="${PAD}" y="${PAD}" width="${G}" height="${G}" class="el-box"/>
        <path class="el-diag" d="M${toSvg(0, 0)} L${toSvg(1, 1)}"/>
        <path class="el-ref-curve" d=""/>
        <path class="el-arm" id="el-l1"/><path class="el-arm" id="el-l2"/>
        <path class="el-curve" id="el-path"/>
        <text x="${PAD}" y="${S - 8}" class="el-axis">temps →</text>
        <text x="6" y="${PAD - 10}" class="el-axis">progression</text>
      </svg>`;
      s.path = graph.querySelector("#el-path"); s.l1 = graph.querySelector("#el-l1"); s.l2 = graph.querySelector("#el-l2"); s.ref = graph.querySelector(".el-ref-curve");
      s.h1 = api.h("span", "handle"); s.h2 = api.h("span", "handle");
      [s.h1, s.h2].forEach((hd, i) => {
        hd.tabIndex = 0; hd.setAttribute("aria-label", `Poignée ${i + 1}`);
        graph.append(hd);
        api.drag(hd, {
          start: () => ({ x: s.u[i * 2], y: s.u[i * 2 + 1], k: graph.getBoundingClientRect().width / S }),
          move: (dx, dy, ev, c) => {
            s.u[i * 2] = api.clamp(c.x + dx / c.k / G, 0, 1);
            s.u[i * 2 + 1] = api.clamp(c.y - dy / c.k / G, -0.5, 1.6);
            drawCurve(s);
          },
        });
      });
      s.code = api.h("code", "el-code");
      wrap.append(lanes, graph);
      board.append(wrap);
      api.controls.innerHTML = "";
      api.controls.append(s.code);
      drawCurve(s);
      // Animation des deux billes
      const ref = lanes.querySelector(".el-ball-ref"), you = lanes.querySelector(".el-ball-you");
      const t0 = performance.now();
      cancelAnimationFrame(raf);
      const tick = (now) => {
        const cyc = (now - t0) % (DUR + PAUSE), x = Math.min(1, cyc / DUR);
        const w = lanes.clientWidth - 40;
        ref.style.transform = `translateX(${bez(s.t.p, x) * w}px)`;
        you.style.transform = `translateX(${bez(s.u, x) * w}px)`;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    },
    evaluate(s) {
      let err = 0;
      for (let i = 1; i < 40; i++) { const x = i / 40; err += Math.abs(bez(s.u, x) - bez(s.t.p, x)); }
      err /= 39;
      return {
        score: Math.max(0, 100 - Math.max(0, err - 0.012) * 400),
        metrics: [
          { label: "Écart moyen de progression", value: `${(err * 100).toFixed(1).replace(".", ",")} %`, good: err < 0.04 },
          { label: "Courbe cible", value: s.t.name },
          { label: "Valeurs cibles", value: s.t.p.join(", ") },
        ],
        principle: s.t.tip,
      };
    },
    reveal(board, s) {
      s.revealed = true;
      const p = s.t.p, [a, b] = [toSvg(p[0], p[1]), toSvg(p[2], p[3])];
      s.ref.setAttribute("d", `M${toSvg(0, 0)} C${a} ${b} ${toSvg(1, 1)}`);
      [s.h1, s.h2].forEach((hd) => hd.classList.add("is-locked"));
    },
  });
})();
