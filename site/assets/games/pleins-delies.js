// Pleins et Déliés — une lettre tracée à la plume : règle le plein, le délié et l'angle de la plume pour retrouver un style.
(function () {
  const S = 300, K = 0.5523;
  const line = (x0, y0, x1, y1) => [x0, y0, x0 + (x1 - x0) / 3, y0 + (y1 - y0) / 3, x1 - (x1 - x0) / 3, y1 - (y1 - y0) / 3, x1, y1];
  const oval = (cx, cy, rx, ry) => [
    [cx, cy - ry, cx + rx * K, cy - ry, cx + rx, cy - ry * K, cx + rx, cy],
    [cx + rx, cy, cx + rx, cy + ry * K, cx + rx * K, cy + ry, cx, cy + ry],
    [cx, cy + ry, cx - rx * K, cy + ry, cx - rx, cy + ry * K, cx - rx, cy],
    [cx - rx, cy, cx - rx, cy - ry * K, cx - rx * K, cy - ry, cx, cy - ry],
  ];
  // Squelettes des lettres : chaque trait est une suite de courbes de Bézier cubiques
  const LETTERS = {
    O: [oval(150, 150, 82, 98)],
    e: [[line(76, 150, 222, 150)], [[222, 150, 222, 96, 192, 62, 150, 62], [150, 62, 104, 62, 74, 100, 74, 150], [74, 150, 74, 204, 108, 238, 156, 238], [156, 238, 186, 238, 208, 224, 222, 200]]],
    n: [[line(96, 66, 96, 236)], [[96, 122, 114, 88, 140, 70, 166, 70], [166, 70, 196, 70, 206, 94, 206, 126], line(206, 126, 206, 236)]],
    S: [[[212, 90, 196, 66, 172, 58, 148, 58], [148, 58, 110, 58, 88, 80, 88, 106], [88, 106, 88, 136, 116, 144, 150, 152], [150, 152, 186, 160, 214, 172, 214, 200], [214, 200, 214, 226, 190, 242, 150, 242], [150, 242, 120, 242, 98, 232, 84, 208]]],
    c: [[[216, 92, 200, 70, 176, 60, 152, 60], [152, 60, 106, 60, 74, 100, 74, 150], [74, 150, 74, 200, 106, 240, 152, 240], [152, 240, 176, 240, 200, 230, 216, 208]]],
  };
  const STYLES = Oeil.fresh("pleins-delies", [
    { name: "Didone", letter: "O", stem: 54, hair: 5, axis: 0, tip: "Une Didone, comme le Bodoni, oppose des pleins très gras à des déliés très fins, avec un axe parfaitement vertical. C'est le contraste qui fait son élégance." },
    { name: "Garalde", letter: "e", stem: 40, hair: 14, axis: -22, tip: "Une Garalde, comme le Garamond, garde la mémoire de la plume : l'axe penche vers la gauche et le contraste reste modéré." },
    { name: "Grotesque", letter: "n", stem: 32, hair: 26, axis: 0, tip: "Une Grotesque, comme l'Helvetica, gomme presque le contraste : plein et délié se rapprochent, mais ne sont jamais égaux pour que la lettre paraisse régulière." },
    { name: "Black", letter: "S", stem: 54, hair: 30, axis: 0, tip: "Dans une graisse Black, le plein grossit plus vite que le délié : sans ce dosage, les zones de jonction se bouchent et la lettre devient une tache." },
    { name: "Calligraphique", letter: "c", stem: 46, hair: 8, axis: -38, tip: "Une plume large tenue en biais donne ce rythme : les zones fines tombent en diagonale, en haut à gauche et en bas à droite de la lettre." },
  ]);
  // La plume est un bec plat : son trait est fin quand elle avance dans le sens du bec, plein quand elle avance en travers
  const ribbon = (t, a) => Math.abs(Math.sin(t - (a * Math.PI) / 180));
  const width = (p, t) => p.hair + (p.stem - p.hair) * ribbon(t, p.axis);
  function samples(strokes) {
    return strokes.map((segs) => segs.flatMap((c, j) => {
      const out = [];
      for (let i = j ? 1 : 0; i <= 30; i++) {
        const u = i / 30, v = 1 - u;
        const x = v * v * v * c[0] + 3 * v * v * u * c[2] + 3 * v * u * u * c[4] + u * u * u * c[6];
        const y = v * v * v * c[1] + 3 * v * v * u * c[3] + 3 * v * u * u * c[5] + u * u * u * c[7];
        const dx = 3 * v * v * (c[2] - c[0]) + 6 * v * u * (c[4] - c[2]) + 3 * u * u * (c[6] - c[4]);
        const dy = 3 * v * v * (c[3] - c[1]) + 6 * v * u * (c[5] - c[3]) + 3 * u * u * (c[7] - c[5]);
        const t = Math.atan2(dy, dx);
        let nx = -Math.sin(t), ny = Math.cos(t);
        out.push({ x, y, t, nx, ny });
      }
      return out;
    }));
  }
  function outline(pts, p) {
    return pts.map((st) => {
      const a = st.map((q) => { const w = width(p, q.t) / 2; return `${(q.x + q.nx * w).toFixed(1)} ${(q.y + q.ny * w).toFixed(1)}`; });
      const b = st.map((q) => { const w = width(p, q.t) / 2; return `${(q.x - q.nx * w).toFixed(1)} ${(q.y - q.ny * w).toFixed(1)}`; }).reverse();
      return `M${a.join(" L")} L${b.join(" L")} Z`;
    }).join(" ");
  }
  // Là où la plume donne son trait le plus épais, ou le plus fin
  function extreme(pts, axis, thick) {
    let best = null, val = thick ? -1 : 2;
    pts.flat().forEach((q) => { const r = ribbon(q.t, axis); if (thick ? r > val + 0.001 : r < val - 0.001) { val = r; best = q; } });
    const out = (best.x - S / 2) * best.nx + (best.y - S / 2) * best.ny >= 0 ? 1 : -1;
    return { x: best.x, y: best.y, nx: best.nx * out, ny: best.ny * out };
  }
  const R = 148;
  function draw(s) {
    const p = s.p;
    s.fill.setAttribute("d", outline(s.pts, p));
    const st = extreme(s.pts, p.axis, true), ha = extreme(s.pts, p.axis, false);
    s.st = st; s.ha = ha;
    const pos = (el, x, y) => { el.style.left = `${(x / S) * 100}%`; el.style.top = `${(y / S) * 100}%`; };
    pos(s.hS, st.x + (st.nx * p.stem) / 2, st.y + (st.ny * p.stem) / 2);
    pos(s.hH, ha.x + (ha.nx * p.hair) / 2, ha.y + (ha.ny * p.hair) / 2);
    const r = ((p.axis - 90) * Math.PI) / 180;
    const ax = S / 2 + Math.cos(r) * R, ay = S / 2 + Math.sin(r) * R;
    pos(s.hA, ax, ay);
    s.arms.innerHTML = `<path class="bz-arm" d="M${st.x} ${st.y} L${st.x + (st.nx * p.stem) / 2} ${st.y + (st.ny * p.stem) / 2}"/><path class="bz-arm" d="M${ha.x} ${ha.y} L${ha.x + (ha.nx * p.hair) / 2} ${ha.y + (ha.ny * p.hair) / 2}"/><path class="pd-axis" d="M${S - ax} ${S - ay} L${ax} ${ay}"/>`;
    s.read.innerHTML = `<span>Plein <b>${Math.round(p.stem)}</b></span><span>Délié <b>${Math.round(p.hair)}</b></span><span>Axe <b>${Math.round(p.axis)}°</b></span>`;
  }
  Oeil.play({
    id: "pleins-delies", name: "Pleins et Déliés",
    howto: [
      { icon: "ink_pen", text: "Ta lettre est tracée à la plume. Le modèle montre le style à retrouver." },
      { icon: "drag_pan", text: "Tire les trois poignées : le plein (trait épais), le délié (trait fin) et l'axe de la plume." },
      { icon: "lightbulb", text: "Regarde où tombent les parties fines : elles te donnent l'angle de la plume." },
    ],
    brief: (s) => `Retrouve le dosage de la ${s.g.name} : plein, délié et axe.`,
    setup(round) {
      const g = STYLES[round % STYLES.length];
      return { g, pts: samples(LETTERS[g.letter]), p: { stem: 30, hair: 30, axis: 20 } };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "pd-wrap");
      wrap.innerHTML = `<figure class="pd-model"><figcaption>Modèle</figcaption><svg viewBox="0 0 ${S} ${S}" aria-hidden="true"><path d="${outline(s.pts, s.g)}"/></svg></figure><div class="pd-stage"><svg viewBox="0 0 ${S} ${S}" aria-hidden="true"><path class="pd-fill"/><g class="pd-arms"></g></svg><div class="pd-read"></div></div>`;
      const stage = wrap.querySelector(".pd-stage");
      s.stage = stage; s.fill = wrap.querySelector(".pd-fill"); s.arms = wrap.querySelector(".pd-arms"); s.read = wrap.querySelector(".pd-read");
      const handle = (cls, label) => { const el = api.h("span", cls); el.tabIndex = 0; el.setAttribute("aria-label", label); stage.append(el); return el; };
      s.hS = handle("handle", "Épaisseur du plein"); s.hH = handle("handle nb-tan", "Épaisseur du délié"); s.hA = handle("handle pd-angle", "Axe de la plume");
      const thick = (el, key, from, to) => api.drag(el, {
        start: () => ({ w: s.p[key], q: key === "stem" ? s.st : s.ha, k: stage.clientWidth / S }),
        move: (dx, dy, ev, c) => {
          const w = c.w + (2 * (dx * c.q.nx + dy * c.q.ny)) / c.k;
          s.p[key] = api.clamp(w, from(), to());
          draw(s);
        },
      });
      thick(s.hS, "stem", () => Math.max(12, s.p.hair), () => 72);
      thick(s.hH, "hair", () => 3, () => Math.min(50, s.p.stem));
      api.drag(s.hA, {
        move: (dx, dy, ev) => {
          const b = stage.getBoundingClientRect();
          const a = (Math.atan2(ev.clientY - b.top - b.height / 2, ev.clientX - b.left - b.width / 2) * 180) / Math.PI + 90;
          s.p.axis = api.clamp(((a + 540) % 360) - 180, -60, 60);
          draw(s);
        },
      });
      board.append(wrap);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Rond : plein. Carré : délié. Losange : axe de la plume</span>`;
    },
    evaluate(s) {
      const p = s.p, g = s.g;
      const ds = Math.abs(p.stem - g.stem), dh = Math.abs(p.hair - g.hair), da = Math.abs(p.axis - g.axis);
      const miss = Math.max(0, ds - 2) / 45 + Math.max(0, dh - 2) / 30 + Math.max(0, da - 3) / 60;
      return {
        score: Math.max(0, 100 - miss * 100),
        metrics: [
          { label: "Plein", value: `${Math.round(p.stem)} (modèle ${g.stem})`, good: ds <= 5 },
          { label: "Délié", value: `${Math.round(p.hair)} (modèle ${g.hair})`, good: dh <= 4 },
          { label: "Axe de la plume", value: `${Math.round(p.axis)}° (modèle ${g.axis}°)`, good: da <= 7 },
        ],
        principle: g.tip,
      };
    },
    reveal(board, s) {
      [s.hS, s.hH, s.hA].forEach((el) => el.classList.add("is-locked"));
      s.arms.insertAdjacentHTML("beforeend", `<path class="pd-ref" d="${outline(s.pts, s.g)}"/>`);
    },
  });
})();
