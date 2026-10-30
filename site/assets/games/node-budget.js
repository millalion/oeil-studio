// Node Budget — reproduis une forme avec le moins de points possible : chaque point doit compter.
(function () {
  const S = 300;
  const pt = (x, y, hx = 0, hy = 0) => ({ x, y, hx, hy });
  const SHAPES = Oeil.fresh("node-budget", [
    { name: "feuille", d: "M150 30 C 230 70 250 170 150 270 C 50 170 70 70 150 30 Z", sol: [pt(150, 30), pt(217, 127, 3, 44), pt(150, 270), pt(83, 127, -3, -44)], tip: "Avec peu de points, on les place sur les extrémités et les changements de direction : la pointe, la base, les points les plus larges." },
    { name: "maison", d: "M60 140 L150 50 L240 140 L240 260 L60 260 Z", sol: [pt(60, 140), pt(150, 50), pt(240, 140), pt(240, 260), pt(60, 260)], tip: "Une forme à angles se reproduit parfaitement avec un point par angle : ajouter des points sur les droites n'apporte rien." },
    { name: "goutte", d: "M150 30 C 150 30 240 150 240 195 C 240 245 200 275 150 275 C 100 275 60 245 60 195 C 60 150 150 30 150 30 Z", sol: [pt(150, 30), pt(240, 195, 0, 45), pt(150, 275, -50, 0), pt(60, 195, 0, -45)], tip: "Pour une forme ronde, place un point sur chaque extrémité et garde-en un pour la pointe : les poignées font le reste." },
    { name: "flèche", d: "M40 120 L170 120 L170 60 L265 150 L170 240 L170 180 L40 180 Z", sol: [pt(40, 120), pt(170, 120), pt(170, 60), pt(265, 150), pt(170, 240), pt(170, 180), pt(40, 180)], tip: "Sept angles, sept points : la contrainte oblige à repérer d'abord la structure de la forme avant de tracer." },
  ]);
  // Une forme nouvelle à chaque fois : un polygone irrégulier, un point par angle
  function polygon() {
    const n = Oeil.randi(4, 7), turn = Oeil.rand ? Oeil.rand() : Math.random();
    const sol = Array.from({ length: n }, (_, i) => { const a = ((i + (Oeil.randi(-20, 20) / 100) + turn) / n) * Math.PI * 2, r = Oeil.randi(75, 125); return pt(Math.round(150 + Math.cos(a) * r), Math.round(150 + Math.sin(a) * r)); });
    return { name: "forme", d: `M${sol.map((p) => `${p.x} ${p.y}`).join(" L")} Z`, sol, tip: "Une forme à angles se reproduit avec un point par angle, et aucune poignée : ajouter des points sur les droites n'apporte rien." };
  }
  // Tracé fermé : chaque point a une poignée symétrique ; sans poignée, c'est un angle vif.
  function pathD(pts) {
    let d = `M${pts[0].x} ${pts[0].y}`;
    pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length]; d += ` C${a.x + a.hx} ${a.y + a.hy} ${b.x - b.hx} ${b.y - b.hy} ${b.x} ${b.y}`; });
    return d + " Z";
  }
  const ring = (n) => Array.from({ length: n }, (_, i) => { const a = (i / n) * Math.PI * 2 - Math.PI / 2; return { x: 150 + Math.cos(a) * 70, y: 150 + Math.sin(a) * 70, hx: 0, hy: 0, tx: -Math.sin(a) * 22, ty: Math.cos(a) * 22 }; });
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
    id: "node-budget", name: "Node Budget", levels: true,
    howto: [
      { icon: "polyline", text: "La forme rose pâle est la cible. Choisis ton nombre de points avec + et −." },
      { icon: "drag_pan", text: "Glisse les gros points pour les placer, et les petites poignées pour courber le tracé." },
      { icon: "lightbulb", text: "Ramène une poignée sur son point pour retrouver un angle vif." },
    ],
    brief: (s) => `Reproduis la ${s.sh.name} avec le moins de points possible.`,
    setup(round, api) {
      const sh = round % 2 ? polygon() : SHAPES[(round / 2) % SHAPES.length];
      return { sh: { ...sh, best: sh.sol.length }, pts: ring(8), adv: api.level === "adv" };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "nb-wrap");
      wrap.innerHTML = `<svg viewBox="0 0 ${S} ${S}" class="nb-svg" aria-hidden="true"><path d="${s.sh.d}" class="nb-target"/>${s.adv ? "" : s.sh.sol.map((p) => `<circle class="nb-hint" cx="${p.x}" cy="${p.y}" r="5"/>`).join("")}<path class="nb-poly"/><g class="nb-arms"></g></svg>`;
      s.poly = wrap.querySelector(".nb-poly"); s.arms = wrap.querySelector(".nb-arms");
      s.wrap = wrap;
      s.build = () => {
        wrap.querySelectorAll(".handle").forEach((n) => n.remove());
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
      };
      s.build();
      board.append(wrap);
      draw(s);
      s.tools = api.h("div", "nb-tools is-new", `<button data-d="-1" type="button"><span aria-hidden="true">−</span> Retirer un point</button><b>${s.pts.length} points</b><button data-d="1" type="button"><span aria-hidden="true">+</span> Ajouter</button>`);
      board.append(s.tools);
      s.tools.querySelectorAll("[data-d]").forEach((b) => b.addEventListener("click", () => {
        if (api.phase !== "play") return;
        s.tools.classList.remove("is-new");
        const n = Oeil.clamp(s.pts.length + +b.dataset.d, 3, 10);
        if (n > s.pts.length) { const a = s.pts[s.pts.length - 1], c = s.pts[0]; const g = ring(n)[n - 1]; s.pts.push({ ...g, x: (a.x + c.x) / 2, y: (a.y + c.y) / 2 }); } else if (n < s.pts.length) s.pts.pop();
        s.tools.querySelector("b").textContent = `${s.pts.length} points`;
        s.build(); draw(s);
      }));
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Gros points : position. Petites poignées : courbure</span>`;
    },
    evaluate(s) {
      const v = iou(s.sh.d, pathD(s.pts)), n = s.pts.length, best = s.sh.best, extra = Math.max(0, n - best);
      return {
        score: Math.max(0, Math.round(Oeil.clamp((v - 0.55) / 0.38, 0, 1) * 100) - extra * 8),
        metrics: [
          { label: "Recouvrement de la cible", value: `${Math.round(v * 100)} %`, good: v > 0.88 },
          { label: "Tes points", value: `${n}`, good: extra === 0 },
          { label: "Correction en rose", value: extra ? `tu aurais pu n'en utiliser que ${best}` : `${best} points : parfait`, good: extra === 0 },
        ],
        principle: s.sh.tip,
      };
    },
    reveal(board, s) {
      [...s.handles, ...s.tans].forEach((el) => el.classList.add("is-locked"));
      // Le tracé conseillé, avec ses points
      s.poly.insertAdjacentHTML("afterend", `<path class="nb-sol" d="${pathD(s.sh.sol)}"/>${s.sh.sol.map((p) => `<circle class="nb-sol-pt" cx="${p.x}" cy="${p.y}" r="6"/>`).join("")}`);
    },
  });
})();
