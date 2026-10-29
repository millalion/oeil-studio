// Lightness Ladder — classe des couleurs de teintes différentes par clarté perçue (L* de CIE-Lab).
(function () {
  const C = Oeil.color;
  const LEVELS = [{ n: 5, gap: 12 }, { n: 6, gap: 10 }, { n: 7, gap: 8 }, { n: 7, gap: 6.5 }, { n: 8, gap: 5.5 }];
  const Lstar = (c) => C.lab(C.hslToRgb(c.h, c.s, c.l))[0];

  // Trouve la clarté HSL qui donne la L* voulue pour une teinte et une saturation.
  function forL(h, s, target) {
    let lo = 2, hi = 98;
    for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; if (Lstar({ h, s, l: mid }) < target) lo = mid; else hi = mid; }
    return Math.round((lo + hi) / 2 * 10) / 10;
  }

  Oeil.play({
    id: "lightness-ladder", name: "Lightness Ladder",
    howto: [
      { icon: "drag_pan", text: "Glisse les cases pour les ranger de la plus sombre (à gauche) à la plus claire (à droite)." },
      { icon: "contrast", text: "Ignore la teinte : un jaune paraît toujours plus clair qu'un bleu. Plisse les yeux pour ne voir que des gris." },
      { icon: "keyboard", text: "Tab pour choisir une case, ← → pour la déplacer, Entrée pour valider." },
    ],
    brief: "Range les couleurs de la plus sombre à la plus claire.",
    hint: { label: "Voir en gris", run(s) { s.row.classList.toggle("is-gray"); } },
    setup(round) {
      const L = LEVELS[round % LEVELS.length];
      const base = Oeil.rand(32, 85 - L.gap * (L.n - 1));
      const hues = Oeil.shuffle(Array.from({ length: 12 }, (_, i) => i * 30 + Oeil.randi(0, 20))).slice(0, L.n);
      const colors = hues.map((h, i) => { const s = Oeil.randi(45, 85); const t = base + i * L.gap + Oeil.rand(-0.6, 0.6); return { id: i, h, s, l: forL(h, s, t), L: t }; });
      let start;
      do { start = Oeil.shuffle(colors); } while (start.filter((c, i) => c.id === i).length > 1);
      return { n: L.n, colors, start };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "row-wrap");
      s.row = api.h("div", "row-track");
      wrap.append(s.row, api.h("p", "row-axis", `<span><span class="material-symbols-outlined">dark_mode</span>Plus sombre</span><i></i><span>Plus claire<span class="material-symbols-outlined">light_mode</span></span>`));
      board.append(wrap);
      const items = s.start.map((c) => { const el = api.h("div", "row-swatch"); el.style.background = C.hsl(c); el.dataset.id = c.id; el.setAttribute("aria-label", `Couleur ${c.id + 1}`); return { id: c.id, el }; });
      s.sort = api.sortable(s.row, items);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">dark_mode</span>Sombre à gauche</span><span class="ctl-hint"><span class="material-symbols-outlined">light_mode</span>Clair à droite</span>`;
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
          { label: "Écart de clarté entre voisines", value: `${s.colors[1].L - s.colors[0].L > 9 ? "large" : "fin"}` },
        ],
        principle: yellowish.length
          ? "Tu as placé un jaune ou un vert trop à droite : ces teintes paraissent lumineuses même quand leur clarté réelle est moyenne. Le gris révèle la vraie valeur."
          : "La clarté perçue (L* de CIE-Lab) ne suit pas la clarté HSL : à valeur égale, un jaune paraît bien plus clair qu'un bleu. C'est elle qui décide du contraste d'un texte.",
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
