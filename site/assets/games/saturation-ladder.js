(function () {
  const C = Oeil.color;
  const LEVELS = [{ n: 5, gap: 12 }, { n: 6, gap: 9 }, { n: 6, gap: 8 }, { n: 7, gap: 6.5 }, { n: 7, gap: 5.5 }];
  const chroma = (c) => { const [, a, b] = C.lab(C.hslToRgb(c.h, c.s, c.l)); return Math.hypot(a, b); };
  // Trouve la saturation HSL qui donne la chroma voulue, à teinte et clarté fixées.
  function forChroma(h, l, target) {
    let lo = 0, hi = 100;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (chroma({ h, s: mid, l }) < target) lo = mid; else hi = mid; }
    return Math.round((lo + hi) / 2 * 10) / 10;
  }
  Oeil.play({
    id: "saturation-ladder", name: "Saturation Ladder",
    howto: [
      { icon: "drag_pan", text: "Glisse les cases pour les ranger de la plus terne (à gauche) à la plus vive (à droite)." },
      { icon: "contrast", text: "La saturation, c'est l'intensité de la couleur : un gris n'en a aucune. Ignore la clarté, compare seulement « à quel point c'est coloré »." },
      { icon: "keyboard", text: "Tab pour choisir une case, ← → pour la déplacer, Entrée pour valider." },
    ],
    brief: "Range les couleurs de la plus terne à la plus vive.",
    
    setup(round) {
      const L = LEVELS[round % LEVELS.length];
      const base = Oeil.rand(6, 12);
      const hues = Oeil.shuffle([10, 30, 50, 140, 175, 205, 230, 330]).slice(0, L.n);
      const colors = hues.map((h, i) => { const l = Oeil.randi(48, 58); const t = base + i * L.gap; return { id: i, h, l, s: forChroma(h, l, t), L: t }; });
      colors.forEach((c) => (c.L = chroma(c)));
      colors.sort((a, b) => a.L - b.L).forEach((c, i) => (c.id = i));
      let start;
      do { start = Oeil.shuffle(colors); } while (start.filter((c, i) => c.id === i).length > 1);
      return { n: L.n, colors, start };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "row-wrap");
      s.row = api.h("div", "row-track");
      wrap.append(s.row);
      board.append(wrap);
      const items = s.start.map((c) => { const el = api.h("div", "row-swatch"); el.style.background = C.hsl(c); el.dataset.id = c.id; el.setAttribute("aria-label", `Couleur ${c.id + 1}`); return { id: c.id, el }; });
      s.sort = api.sortable(s.row, items);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">water_drop</span>Terne à gauche</span><span class="ctl-hint"><span class="material-symbols-outlined">colors</span>Vive à droite</span>`;
    },
    evaluate(s) {
      const order = s.sort.order();
      s.order = order;
      const disp = order.reduce((a, id, i) => a + Math.abs(id - i), 0) / s.n;
      const right = order.filter((id, i) => id === i).length;
      // L'erreur la plus fréquente : surestimer la clarté des jaunes et des verts.
      const yellowish = order.map((id, i) => ({ c: s.colors[id], i })).filter((x) => x.c.h >= 40 && x.c.h <= 150 && x.i > x.c.id);
      return {
        score: Math.max(0, 100 - disp * 30),
        metrics: [
          { label: "Cases bien placées", value: `${right} sur ${s.n}`, good: right === s.n },
          { label: "Écart de saturation entre voisines", value: `${s.colors[1].L - s.colors[0].L > 9 ? "large" : "fin"}` },
        ],
        principle: "La saturation perçue ne suit pas le pourcentage HSL : à 60 % de saturation, un jaune paraît bien plus vif qu'un bleu. On mesure ici la chroma de CIE-Lab, plus proche de ce que voit l'œil.",
      };
    },
    reveal(board, s, r, api) {
      s.row.classList.remove("is-gray");
      [...s.row.children].forEach((el) => {
        el.classList.remove("grab");
        const id = +el.dataset.id, i = s.order.indexOf(id), c = s.colors[id];
        el.insertAdjacentHTML("beforeend", `<span class="${id === i ? "tag-you" : "tag-ref"} row-tag">L* ${Math.round(c.L)}</span>`);
      });
      const ref = api.h("div", "row-ref", s.colors.map((c) => `<span style="background:${C.hsl(c)}"></span>`).join(""));
      board.querySelector(".row-wrap").append(api.h("p", "row-ref-label", "Le bon ordre"), ref);
    },
  });
})();
