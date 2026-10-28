// Hue Line — un dégradé de teintes a été mélangé : remets les cases dans l'ordre.
(function () {
  const C = Oeil.color;
  const LEVELS = [{ n: 7, span: 150 }, { n: 8, span: 120 }, { n: 9, span: 100 }, { n: 10, span: 80 }, { n: 11, span: 64 }];

  Oeil.play({
    id: "hue-line", name: "Hue Line",
    howto: [
      { icon: "drag_pan", text: "Attrape une case et glisse-la à sa place : les autres se poussent." },
      { icon: "lock", text: "La première et la dernière case sont fixes : le dégradé va de l'une à l'autre." },
      { icon: "keyboard", text: "Tab pour choisir une case, ← → pour la déplacer, Entrée pour valider." },
    ],
    brief: (s) => `Remets les ${s.n} teintes dans l'ordre, de gauche à droite.`,
    setup(round) {
      const L = LEVELS[round % LEVELS.length];
      const h0 = Oeil.randi(0, 359), sat = Oeil.randi(55, 80), lig = Oeil.randi(48, 62), dir = Math.random() < 0.5 ? 1 : -1;
      const colors = Array.from({ length: L.n }, (_, i) => ({ id: i, h: (h0 + dir * (L.span * i) / (L.n - 1) + 360) % 360, s: sat, l: lig }));
      let mid;
      do { mid = Oeil.shuffle(colors.slice(1, -1)); } while (mid.every((c, i) => c.id === i + 1));
      return { n: L.n, colors, start: [colors[0], ...mid, colors[L.n - 1]] };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "row-wrap");
      const row = api.h("div", "row-track");
      wrap.append(row);
      board.append(wrap);
      const items = s.start.map((c) => { const el = api.h("div", "row-swatch"); el.style.background = C.hsl(c); el.setAttribute("aria-label", `Case ${c.id + 1}`); return { id: c.id, el }; });
      s.sort = api.sortable(row, items, { locked: [0, s.n - 1] });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les cases</span><span class="ctl-hint"><span class="material-symbols-outlined">lock</span>Les bords sont fixes</span>`;
    },
    evaluate(s) {
      const order = s.sort.order();
      const disp = order.reduce((a, id, i) => a + Math.abs(id - i), 0) / (s.n - 2);
      const right = order.filter((id, i) => id === i).length - 2;
      s.order = order;
      return {
        score: Math.max(0, 100 - disp * 28),
        metrics: [
          { label: "Cases bien placées", value: `${right} sur ${s.n - 2}`, good: right === s.n - 2 },
          { label: "Décalage moyen", value: `${disp.toFixed(1)} case`, good: disp < 0.5 },
        ],
        principle: "Quand les teintes sont proches, compare chaque case à ses deux voisines plutôt qu'aux extrémités : l'œil juge bien mieux une différence locale qu'une position absolue.",
      };
    },
    reveal(board, s, r, api) {
      const row = board.querySelector(".row-track");
      [...row.children].forEach((el) => el.classList.remove("grab"));
      s.order.forEach((id, i) => {
        const el = [...row.children].find((c) => c.getAttribute("aria-label") === `Case ${id + 1}`);
        el.insertAdjacentHTML("beforeend", `<span class="${id === i ? "tag-you" : "tag-ref"} row-tag">${id === i ? "✓" : id + 1}</span>`);
      });
      const ref = api.h("div", "row-ref", s.colors.map((c) => `<span style="background:${C.hsl(c)}"></span>`).join(""));
      board.querySelector(".row-wrap").append(api.h("p", "row-ref-label", "Le bon ordre"), ref);
    },
  });
})();
