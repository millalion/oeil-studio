// Bézier Letters — une lettre vectorielle a un segment déformé : ajuste ses deux poignées pour la réparer.
(function () {
  const K = 0.5523; // approximation du cercle par des courbes de Bézier
  // Chaque lettre : point de départ + segments cubiques [c1x, c1y, c2x, c2y, x, y] (ou lignes [x, y]).
  const ell = (cx, cy, rx, ry) => ({ start: [cx, cy - ry], segs: [
    [cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy], [cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry],
    [cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy], [cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry]] });
  const LETTERS = Oeil.shuffle([
    { name: "O", shape: ell(150, 150, 95, 115), fix: [1], tip: "Sur un O, les poignées sont horizontales en haut et en bas, verticales sur les côtés, et longues d'environ 55 % du rayon. C'est ce qui donne une courbe tendue, sans bosse." },
    { name: "D", shape: { start: [70, 40], segs: [[180, 40], [250, 40, 260, 90, 260, 150], [260, 210, 250, 260, 180, 260], [70, 260], [70, 40]] }, fix: [1], tip: "La panse du D quitte la hampe horizontalement et rejoint son point le plus à droite verticalement : des poignées parallèles aux axes évitent les angles cachés." },
    { name: "C", shape: { start: [240, 80], segs: [[215, 50, 185, 35, 150, 35], [85, 35, 50, 90, 50, 150], [50, 210, 85, 265, 150, 265], [185, 265, 215, 250, 240, 220]] }, fix: [1, 2], tip: "Le C se construit comme un O ouvert : les extrémités du contour, plus serrées que les flancs, demandent des poignées plus courtes." },
    { name: "U", shape: { start: [70, 40], segs: [[70, 170], [70, 235, 105, 265, 150, 265], [195, 265, 230, 235, 230, 170], [230, 40]] }, fix: [1], tip: "Au creux du U, les poignées sont horizontales au point le plus bas : c'est ce qui donne un fond rond plutôt qu'un V aux angles mous." },
  ]);
  const d = (L) => `M${L.start.join(" ")} ` + L.segs.map((s) => (s.length === 6 ? `C${s.join(" ")}` : `L${s.join(" ")}`)).join(" ");
  const prev = (L, i) => (i === 0 ? L.start : L.segs[i - 1].slice(-2));

  function draw(s) {
    s.path.setAttribute("d", d(s.cur));
    s.fill.setAttribute("d", d(s.cur));
    s.arms.innerHTML = s.fix.map((i) => {
      const seg = s.cur.segs[i], p0 = prev(s.cur, i);
      return `<path d="M${p0.join(" ")} L${seg[0]} ${seg[1]} M${seg[4]} ${seg[5]} L${seg[2]} ${seg[3]}" class="bz-arm"/><circle cx="${p0[0]}" cy="${p0[1]}" r="4" class="bz-anchor"/><circle cx="${seg[4]}" cy="${seg[5]}" r="4" class="bz-anchor"/>`;
    }).join("");
    s.handles.forEach(({ el, i, k }) => { const seg = s.cur.segs[i]; el.style.left = `${(seg[k * 2] / 300) * 100}%`; el.style.top = `${(seg[k * 2 + 1] / 300) * 100}%`; });
  }

  Oeil.play({
    id: "bezier-letters", name: "Bézier Letters",
    howto: [
      { icon: "gesture", text: "Une lettre dessinée en courbes de Bézier a un ou deux segments déformés, avec leurs poignées roses." },
      { icon: "drag_pan", text: "Glisse les poignées roses pour redonner à la lettre une courbe tendue et régulière." },
      { icon: "lightbulb", text: "Aux points extrêmes d'une courbe (tout en haut, tout à droite…), la poignée est horizontale ou verticale." },
    ],
    brief: (s) => `Répare la lettre ${s.L.name} en ajustant les poignées roses.`,
    hint: { label: "Aperçu plein", run(s) { s.svg.classList.toggle("is-filled"); } },
    setup(round) {
      const L = LETTERS[round % LETTERS.length];
      const cur = JSON.parse(JSON.stringify(L.shape));
      L.fix.forEach((i) => { const seg = cur.segs[i]; for (let k = 0; k < 4; k++) seg[k] += Oeil.randi(28, 55) * (Math.random() < 0.5 ? -1 : 1); });
      return { L, cur, fix: L.fix };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "bz-wrap");
      wrap.innerHTML = `<svg class="bz-svg" viewBox="0 0 300 300" aria-hidden="true"><path class="bz-fill"/><path class="bz-ref"/><path class="bz-path"/><g class="bz-arms"></g></svg>`;
      s.svg = wrap.querySelector("svg"); s.path = wrap.querySelector(".bz-path"); s.fill = wrap.querySelector(".bz-fill"); s.arms = wrap.querySelector(".bz-arms"); s.ref = wrap.querySelector(".bz-ref");
      s.handles = [];
      s.fix.forEach((i) => [0, 1].forEach((k) => {
        const el = api.h("span", "handle");
        el.tabIndex = 0; el.setAttribute("aria-label", `Poignée ${k + 1} du segment`);
        wrap.append(el);
        s.handles.push({ el, i, k });
        api.drag(el, {
          start: () => ({ x: s.cur.segs[i][k * 2], y: s.cur.segs[i][k * 2 + 1], sc: wrap.clientWidth / 300 }),
          move: (dx, dy, ev, c) => { s.cur.segs[i][k * 2] = api.clamp(c.x + dx / c.sc, -20, 320); s.cur.segs[i][k * 2 + 1] = api.clamp(c.y + dy / c.sc, -20, 320); draw(s); },
        });
      }));
      board.append(wrap);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les poignées roses</span>`;
    },
    evaluate(s) {
      let dist = 0, n = 0;
      s.fix.forEach((i) => { for (let k = 0; k < 2; k++) { dist += Math.hypot(s.cur.segs[i][k * 2] - s.L.shape.segs[i][k * 2], s.cur.segs[i][k * 2 + 1] - s.L.shape.segs[i][k * 2 + 1]); n++; } });
      dist /= n;
      return {
        score: Math.max(0, 100 - Math.max(0, dist - 4) * 1.6),
        metrics: [{ label: "Écart moyen des poignées", value: `${dist.toFixed(0)} unités sur 300`, good: dist < 12 }],
        principle: s.L.tip,
      };
    },
    reveal(board, s) {
      s.ref.setAttribute("d", d(s.L.shape));
      s.handles.forEach(({ el }) => el.classList.add("is-locked"));
    },
  });
})();
