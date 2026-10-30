// Curve Continuity — un tracé a des cassures : aligne les poignées de part et d'autre de chaque point pour le lisser.
(function () {
  // Tracé : points d'ancrage avec poignée entrante et sortante.
  const PATHS = Oeil.fresh("curve-continuity", [
    [[40, 200, 0, 0, 70, -90], [220, 120, -70, 0, 70, 0], [400, 200, -60, -80, 60, 80], [560, 140, -60, 0, 0, 0]],
    [[40, 150, 0, 0, 60, 90], [200, 230, -70, 0, 70, 0], [330, 100, -50, 60, 50, -60], [470, 160, -50, -40, 50, 40], [580, 230, -40, 0, 0, 0]],
    [[40, 230, 0, 0, 80, -120], [260, 90, -90, 0, 90, 0], [460, 230, -70, -60, 70, 60], [580, 260, -40, 0, 0, 0]],
  ]);
  // Un tracé inventé : des points répartis en largeur, chacun avec des poignées alignées
  function makePath() {
    const n = Oeil.randi(4, 5), gap = 540 / (n - 1);
    return Array.from({ length: n }, (_, i) => {
      const hx = gap * 0.36, hy = i === 0 || i === n - 1 ? 0 : Oeil.randi(-45, 45);
      return [30 + i * gap, Oeil.randi(90, 240), i ? -hx : 0, i ? -hy : 0, i < n - 1 ? hx : 0, i < n - 1 ? hy : 0];
    });
  }
  function dPath(pts) {
    let s = `M${pts[0][0]} ${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      s += ` C${a[0] + a[4]} ${a[1] + a[5]} ${b[0] + b[2]} ${b[1] + b[3]} ${b[0]} ${b[1]}`;
    }
    return s;
  }
  const ang = (x, y) => Math.atan2(y, x) * 180 / Math.PI;
  function err(p) { const a = ang(-p[2], -p[3]), b = ang(p[4], p[5]); let d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; }
  function draw(s) {
    s.path.setAttribute("d", dPath(s.pts));
    s.arms.innerHTML = s.pts.map((p, i) => (i === 0 || i === s.pts.length - 1 ? "" : `<path class="bz-arm" d="M${p[0] + p[2]} ${p[1] + p[3]} L${p[0]} ${p[1]} L${p[0] + p[4]} ${p[1] + p[5]}"/><circle cx="${p[0] + p[2]}" cy="${p[1] + p[3]}" r="4" class="cc-in"/><circle cx="${p[0]}" cy="${p[1]}" r="5" class="bz-anchor${s.broken.includes(i) ? " cc-broken" : ""}"/>`)).join("");
    s.handles.forEach(({ el, i }) => { const p = s.pts[i]; el.style.left = `${((p[0] + p[4]) / 600) * 100}%`; el.style.top = `${((p[1] + p[5]) / 320) * 100}%`; });
  }
  Oeil.play({
    id: "curve-continuity", name: "Curve Continuity",
    howto: [
      { icon: "timeline", text: "Le tracé a des cassures : à certains points, la courbe change brutalement de direction." },
      { icon: "drag_pan", text: "Pour chaque point marqué en rose, glisse la poignée rose jusqu'à ce qu'elle soit dans le prolongement exact de la poignée grise." },
      { icon: "lightbulb", text: "Une courbe lisse a ses deux poignées alignées de part et d'autre du point (continuité de tangente)." },
    ],
    brief: (s) => `Lisse le tracé : ${s.broken.length} points sont cassés.`,
    setup(round) {
      const base = round % 2 ? makePath() : PATHS[(round / 2) % PATHS.length].map((p) => [...p]);
      const inner = base.map((_, i) => i).slice(1, -1);
      const broken = Oeil.shuffle(inner).slice(0, Math.min(inner.length, round < 2 ? 2 : 3)).sort();
      broken.forEach((i) => { const p = base[i], r = Math.hypot(p[4], p[5]), a = Math.atan2(p[5], p[4]) + (Oeil.randi(30, 70) * Math.PI / 180) * (Math.random() < 0.5 ? -1 : 1); p[4] = Math.cos(a) * r; p[5] = Math.sin(a) * r; });
      return { pts: base, broken };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "cc-wrap");
      wrap.innerHTML = `<svg viewBox="0 0 600 320" class="cc-svg" aria-hidden="true"><path class="cc-path"/><g class="bz-arms"></g></svg>`;
      s.path = wrap.querySelector(".cc-path"); s.arms = wrap.querySelector(".bz-arms");
      s.handles = s.broken.map((i) => {
        const el = api.h("span", "handle");
        el.tabIndex = 0; el.setAttribute("aria-label", `Poignée du point ${i}`);
        wrap.append(el);
        api.drag(el, { start: () => ({ x: s.pts[i][4], y: s.pts[i][5], k: wrap.clientWidth / 600 }), move: (dx, dy, ev, c) => { const [x, y] = s.lock.snap(0, 0, c.x + dx / c.k, c.y + dy / c.k, ev); s.pts[i][4] = x; s.pts[i][5] = y; el.classList.toggle("is-snapped", s.lock.active(ev)); draw(s); }, end: () => el.classList.remove("is-snapped") });
        return { el, i };
      });
      board.append(wrap);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Aligne chaque poignée rose sur la grise</span>`;
      s.lock = Oeil.angleLock(api.controls, (on) => {
        if (!on) return;
        s.broken.forEach((i) => { [s.pts[i][4], s.pts[i][5]] = s.lock.snap(0, 0, s.pts[i][4], s.pts[i][5], { shiftKey: true }); });
        draw(s);
      });
    },
    evaluate(s) {
      const e = s.broken.map((i) => err(s.pts[i]));
      const mean = e.reduce((a, b) => a + b, 0) / e.length;
      return {
        score: e.reduce((a, x) => a + Math.max(0, 100 - Math.max(0, x - 2) * 3.5), 0) / e.length,
        metrics: [{ label: "Angle moyen de cassure", value: `${mean.toFixed(1).replace(".", ",")}°`, good: mean < 4 }, { label: "Points lisses", value: `${e.filter((x) => x < 4).length} sur ${e.length}`, good: e.every((x) => x < 4) }],
        principle: "Quand les deux poignées d'un point sont alignées, la courbe passe sans à-coup : c'est la continuité de tangente. Des poignées de même longueur en plus donnent une courbure égale des deux côtés, encore plus douce.",
      };
    },
    reveal(board, s) {
      s.handles.forEach(({ el }) => el.classList.add("is-locked"));
      // Courbe corrigée : la poignée sortante dans le prolongement de la poignée entrante
      const fixed = s.pts.map((p, i) => { if (!s.broken.includes(i)) return p; const r = Math.hypot(p[4], p[5]), l = Math.hypot(p[2], p[3]) || 1; return [p[0], p[1], p[2], p[3], (-p[2] / l) * r, (-p[3] / l) * r]; });
      s.path.insertAdjacentHTML("afterend", `<path class="cc-ref" d="${dPath(fixed)}"/>`);
    },
  });
})();
