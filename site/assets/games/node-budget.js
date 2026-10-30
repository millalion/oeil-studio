// Node Budget — reproduis une forme avec un nombre limité de points : chaque point doit compter.
(function () {
  const S = 300;
  const SHAPES = Oeil.shuffle([
    { name: "feuille", n: 5, d: "M150 30 C 230 70 250 170 150 270 C 50 170 70 70 150 30 Z", tip: "Avec peu de points, on les place sur les extrémités et les changements de direction : la pointe, la base, les points les plus larges." },
    { name: "maison", n: 5, d: "M60 140 L150 50 L240 140 L240 260 L60 260 Z", tip: "Une forme à angles se reproduit parfaitement avec un point par angle : ajouter des points sur les droites n'apporte rien." },
    { name: "goutte", n: 6, d: "M150 30 C 150 30 240 150 240 195 C 240 245 200 275 150 275 C 100 275 60 245 60 195 C 60 150 150 30 150 30 Z", tip: "Pour une forme ronde, répartis les points régulièrement sur la partie courbe et garde-en un pour la pointe." },
    { name: "flèche", n: 7, d: "M40 120 L170 120 L170 60 L265 150 L170 240 L170 180 L40 180 Z", tip: "Sept angles, sept points : la contrainte oblige à repérer d'abord la structure de la forme avant de tracer." },
  ]);
  // Tracé fermé : chaque point a une poignée symétrique ; sans poignée, c'est un angle vif.
  function pathD(pts) {
    let d = `M${pts[0].x} ${pts[0].y}`;
    pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length]; d += ` C${a.x + a.hx} ${a.y + a.hy} ${b.x - b.hx} ${b.y - b.hy} ${b.x} ${b.y}`; });
    return d + " Z";
  }
  function iou(target, poly) {
    const c = document.createElement("canvas"); c.width = c.height = 120;
    const ctx = c.getContext("2d"), k = 120 / S;
    const draw = (fn) => { ctx.clearRect(0, 0, 120, 120); ctx.save(); ctx.scale(k, k); fn(); ctx.restore(); return ctx.getImageData(0, 0, 120, 120).data; };
    const A = draw(() => ctx.fill(new Path2D(target)));
    const B = draw(() => ctx.fill(new Path2D(poly)));
    let inter = 0, uni = 0;
    for (let i = 3; i < A.length; i += 4) { const a = A[i] > 127, b = B[i] > 127; if (a && b) inter++; if (a || b) uni++; }
    return uni ? inter / uni : 0;
  }
  function draw(s) {
    s.poly.setAttribute("d", pathD(s.pts));
    s.arms.innerHTML = s.pts.map((p) => (p.hx || p.hy ? `<path class="bz-arm" d="M${p.x - p.hx} ${p.y - p.hy} L${p.x + p.hx} ${p.y + p.hy}"/>` : "")).join("");
    s.pts.forEach((p, i) => {
      const n = s.handles[i], t = s.tans[i], curved = p.hx || p.hy;
      n.style.left = `${(p.x / S) * 100}%`; n.style.top = `${(p.y / S) * 100}%`;
      t.style.left = `${((p.x + (curved ? p.hx : p.tx)) / S) * 100}%`; t.style.top = `${((p.y + (curved ? p.hy : p.ty)) / S) * 100}%`;
    });
  }
  Oeil.play({
    id: "node-budget", name: "Node Budget",
    howto: [
      { icon: "polyline", text: "La forme rose pâle est la cible. Ton tracé n'a droit qu'à quelques points." },
      { icon: "drag_pan", text: "Glisse les gros points pour les placer, et les petites poignées pour courber le tracé." },
      { icon: "lightbulb", text: "Ramène une poignée sur son point pour retrouver un angle vif." },
    ],
    brief: (s) => `Reproduis la ${s.sh.name} avec ${s.sh.n} points : place-les, puis tire les petites poignées pour courber.`,
    setup(round) {
      const sh = SHAPES[round % SHAPES.length];
      const pts = Array.from({ length: sh.n }, (_, i) => { const a = (i / sh.n) * Math.PI * 2 - Math.PI / 2; return { x: 150 + Math.cos(a) * 70, y: 150 + Math.sin(a) * 70, hx: 0, hy: 0, tx: -Math.sin(a) * 22, ty: Math.cos(a) * 22 }; });
      return { sh, pts };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "nb-wrap");
      wrap.innerHTML = `<svg viewBox="0 0 ${S} ${S}" class="nb-svg" aria-hidden="true"><path d="${s.sh.d}" class="nb-target"/><path class="nb-poly"/><g class="nb-arms"></g></svg>`;
      s.poly = wrap.querySelector(".nb-poly"); s.arms = wrap.querySelector(".nb-arms");
      s.handles = s.pts.map((p, i) => {
        const el = api.h("span", "handle");
        el.tabIndex = 0; el.setAttribute("aria-label", `Point ${i + 1}`);
        wrap.append(el);
        api.drag(el, { start: () => ({ x: p.x, y: p.y, k: wrap.clientWidth / S }), move: (dx, dy, ev, c) => { p.x = api.clamp(c.x + dx / c.k, 0, S); p.y = api.clamp(c.y + dy / c.k, 0, S); draw(s); } });
        return el;
      });
      s.tans = s.pts.map((p, i) => {
        const el = api.h("span", "handle nb-tan");
        el.setAttribute("aria-label", `Poignée du point ${i + 1}`);
        wrap.append(el);
        api.drag(el, {
          start: () => ({ x: p.hx || p.tx, y: p.hy || p.ty, k: wrap.clientWidth / S }),
          move: (dx, dy, ev, c) => {
            const x = c.x + dx / c.k, y = c.y + dy / c.k, r = Math.hypot(x, y);
            if (r < 10) { p.hx = p.hy = 0; } else { p.hx = x; p.hy = y; p.tx = x; p.ty = y; }
            draw(s);
          },
        });
        return el;
      });
      board.append(wrap);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Gros points : position. Petites poignées : courbure</span>`;
    },
    evaluate(s) {
      const v = iou(s.sh.d, pathD(s.pts));
      return {
        score: Math.round(Oeil.clamp((v - 0.55) / 0.38, 0, 1) * 100),
        metrics: [{ label: "Recouvrement de la cible", value: `${Math.round(v * 100)} %`, good: v > 0.88 }],
        principle: s.sh.tip,
      };
    },
    reveal(board, s) { [...s.handles, ...s.tans].forEach((el) => el.classList.add("is-locked")); },
  });
})();
