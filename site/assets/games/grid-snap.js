// Grid Snap — replace et redimensionne les blocs pour que leurs bords tombent sur les colonnes d'une grille de 12.
(function () {
  const W = 720, COLS = 12, GUT = 16, COL = (W - GUT * (COLS - 1)) / COLS;
  const edgeL = (i) => i * (COL + GUT);          // bord gauche de la colonne i
  const edgeR = (i) => i * (COL + GUT) + COL;    // bord droit de la colonne i
  const LAYOUTS = Oeil.shuffle([
    [{ label: "Titre", span: [0, 8], h: 56 }, { label: "Image", span: [0, 6], h: 120 }, { label: "Texte", span: [6, 12], h: 120 }, { label: "Bouton", span: [0, 3], h: 40 }],
    [{ label: "Navigation", span: [0, 12], h: 40 }, { label: "Barre latérale", span: [0, 3], h: 180 }, { label: "Contenu", span: [3, 12], h: 180 }],
    [{ label: "Carte", span: [0, 4], h: 140 }, { label: "Carte", span: [4, 8], h: 140 }, { label: "Carte", span: [8, 12], h: 140 }, { label: "Légende", span: [0, 6], h: 40 }],
    [{ label: "Chapô", span: [2, 10], h: 70 }, { label: "Citation", span: [1, 7], h: 90 }, { label: "Photo", span: [7, 12], h: 140 }],
  ]);
  function place(b) { b.el.style.left = `${b.x}px`; b.el.style.width = `${b.w}px`; }
  function fit(board, s) { const k = Math.min(1.2, (board.clientWidth - 60) / W, (board.clientHeight - 60) / s.H); s.k = k; s.frame.style.transform = `translate(-50%, -50%) scale(${k})`; }
  Oeil.play({
    id: "grid-snap", name: "Grid Snap",
    howto: [
      { icon: "view_column", text: "Les bandes roses sont les 12 colonnes de la grille. Les blocs sont posés de travers." },
      { icon: "drag_pan", text: "Glisse chaque bloc pour le déplacer, et sa poignée de droite pour l'élargir ou le rétrécir." },
      { icon: "lightbulb", text: "Les deux bords de chaque bloc doivent tomber sur des bords de colonne, jamais dans une gouttière." },
    ],
    brief: "Cale chaque bloc sur les colonnes de la grille.",
    setup(round) {
      const L = LAYOUTS[round % LAYOUTS.length];
      let y = 0;
      const blocks = L.map((b) => {
        const tx = edgeL(b.span[0]), tw = edgeR(b.span[1] - 1) - tx;
        const row = { ...b, y, tx, tw, x: Oeil.clamp(tx + Oeil.randi(-40, 40), 0, W - 60), w: Oeil.clamp(tw + Oeil.randi(-36, 36), 50, W) };
        if (row.x + row.w > W) row.w = W - row.x;
        y += b.h + 16;
        return row;
      });
      return { blocks, H: y - 16 };
    },
    mount(board, s, api) {
      s.frame = api.h("div", "gs-frame");
      s.frame.style.cssText = `width:${W}px;height:${s.H}px`;
      s.frame.innerHTML = Array.from({ length: COLS }, (_, i) => `<span class="gs-col" style="left:${edgeL(i)}px;width:${COL}px"></span>`).join("");
      s.blocks.forEach((b) => {
        b.el = api.h("div", "gs-block grab", `<span>${b.label}</span><span class="gs-span"></span>`);
        b.el.style.cssText = `top:${b.y}px;height:${b.h}px`;
        const hd = api.h("span", "gs-resize");
        hd.setAttribute("aria-label", `Largeur de ${b.label}`);
        hd.addEventListener("pointerdown", (e) => e.stopPropagation());
        b.el.append(hd);
        s.frame.append(b.el);
        place(b);
        api.drag(b.el, { start: (e) => (e.target === hd ? null : { x: b.x }), move: (dx, dy, ev, c) => { if (!c) return; b.x = api.clamp(c.x + dx / s.k, 0, W - b.w); place(b); } });
        api.drag(hd, { start: () => ({ w: b.w }), move: (dx, dy, ev, c) => { b.w = api.clamp(c.w + dx / s.k, 30, W - b.x); place(b); } });
      });
      board.append(s.frame);
      fit(board, s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse un bloc pour le déplacer</span><span class="ctl-hint"><span class="material-symbols-outlined">width</span>Sa poignée droite pour le redimensionner</span>`;
    },
    resize(board, s) { fit(board, s); },
    evaluate(s) {
      const d = s.blocks.map((b) => Math.abs(b.x - b.tx) + Math.abs(b.x + b.w - (b.tx + b.tw)));
      const score = d.reduce((a, x) => a + Math.max(0, 100 - Math.max(0, x - 3) * 2.5), 0) / d.length;
      const ok = d.filter((x) => x <= 4).length;
      return {
        score,
        metrics: [{ label: "Blocs calés sur la grille", value: `${ok} sur ${d.length}`, good: ok === d.length }, { label: "Écart moyen des bords", value: `${(d.reduce((a, x) => a + x, 0) / d.length / 2).toFixed(1).replace(".", ",")} px` }],
        principle: "Une grille ne sert que si on la respecte : un bloc qui s'arrête dans une gouttière casse l'alignement de toute la colonne. Dans un outil, active le magnétisme sur les colonnes plutôt que d'aligner à l'œil.",
      };
    },
    reveal(board, s, r, api) {
      s.blocks.forEach((b) => {
        b.el.classList.remove("grab");
        const g = api.h("span", "gs-ghost");
        g.style.cssText = `left:${b.tx}px;width:${b.tw}px;top:${b.y}px;height:${b.h}px`;
        s.frame.append(g);
      });
    },
  });
})();
