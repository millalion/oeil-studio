// Node Budget — reproduis une forme avec un nombre limité de points : chaque point doit compter.
(function () {
  const S = 300;
  const SHAPES = Oeil.shuffle([
    { name: "feuille", n: 5, d: "M150 30 C 230 70 250 170 150 270 C 50 170 70 70 150 30 Z", tip: "Avec peu de points, on les place sur les extrémités et les changements de direction : la pointe, la base, les points les plus larges." },
    { name: "maison", n: 5, d: "M60 140 L150 50 L240 140 L240 260 L60 260 Z", tip: "Une forme à angles se reproduit parfaitement avec un point par angle : ajouter des points sur les droites n'apporte rien." },
    { name: "goutte", n: 6, d: "M150 30 C 150 30 240 150 240 195 C 240 245 200 275 150 275 C 100 275 60 245 60 195 C 60 150 150 30 150 30 Z", tip: "Pour une forme ronde, répartis les points régulièrement sur la partie courbe et garde-en un pour la pointe." },
    { name: "flèche", n: 7, d: "M40 120 L170 120 L170 60 L265 150 L170 240 L170 180 L40 180 Z", tip: "Sept angles, sept points : la contrainte oblige à repérer d'abord la structure de la forme avant de tracer." },
  ]);
  function iou(target, poly) {
    const c = document.createElement("canvas"); c.width = c.height = 120;
    const ctx = c.getContext("2d"), k = 120 / S;
    const draw = (fn) => { ctx.clearRect(0, 0, 120, 120); ctx.save(); ctx.scale(k, k); fn(); ctx.restore(); return ctx.getImageData(0, 0, 120, 120).data; };
    const A = draw(() => ctx.fill(new Path2D(target)));
    const B = draw(() => { ctx.beginPath(); poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fill(); });
    let inter = 0, uni = 0;
    for (let i = 3; i < A.length; i += 4) { const a = A[i] > 127, b = B[i] > 127; if (a && b) inter++; if (a || b) uni++; }
    return uni ? inter / uni : 0;
  }
  function draw(s) {
    s.poly.setAttribute("points", s.pts.map((p) => p.join(",")).join(" "));
    s.handles.forEach((el, i) => { el.style.left = `${(s.pts[i][0] / S) * 100}%`; el.style.top = `${(s.pts[i][1] / S) * 100}%`; });
  }
  Oeil.play({
    id: "node-budget", name: "Node Budget",
    howto: [
      { icon: "polyline", text: "La forme rose pâle est la cible. Ton tracé noir n'a droit qu'à quelques points." },
      { icon: "drag_pan", text: "Glisse chaque point rose pour que ton tracé recouvre la cible le mieux possible." },
      { icon: "lightbulb", text: "Place d'abord les points sur les angles et les extrémités : ce sont eux qui portent la forme." },
    ],
    brief: (s) => `Reproduis la ${s.sh.name} avec ${s.sh.n} points seulement.`,
    setup(round) {
      const sh = SHAPES[round % SHAPES.length];
      const pts = Array.from({ length: sh.n }, (_, i) => { const a = (i / sh.n) * Math.PI * 2 - Math.PI / 2; return [150 + Math.cos(a) * 50, 150 + Math.sin(a) * 50]; });
      return { sh, pts };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "nb-wrap");
      wrap.innerHTML = `<svg viewBox="0 0 ${S} ${S}" class="nb-svg" aria-hidden="true"><path d="${s.sh.d}" class="nb-target"/><polygon class="nb-poly"/></svg>`;
      s.poly = wrap.querySelector(".nb-poly");
      s.handles = s.pts.map((p, i) => {
        const el = api.h("span", "handle");
        el.tabIndex = 0; el.setAttribute("aria-label", `Point ${i + 1}`);
        wrap.append(el);
        api.drag(el, { start: () => ({ x: s.pts[i][0], y: s.pts[i][1], k: wrap.clientWidth / S }), move: (dx, dy, ev, c) => { s.pts[i] = [api.clamp(c.x + dx / c.k, 0, S), api.clamp(c.y + dy / c.k, 0, S)]; draw(s); } });
        return el;
      });
      board.append(wrap);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les ${s.sh.n} points roses</span>`;
    },
    evaluate(s) {
      const v = iou(s.sh.d, s.pts);
      return {
        score: Math.round(Oeil.clamp((v - 0.55) / 0.38, 0, 1) * 100),
        metrics: [{ label: "Recouvrement de la cible", value: `${Math.round(v * 100)} %`, good: v > 0.88 }],
        principle: s.sh.tip,
      };
    },
    reveal(board, s) { s.handles.forEach((el) => el.classList.add("is-locked")); },
  });
})();
