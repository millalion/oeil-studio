// Grid Snap — replace et redimensionne les blocs pour que leurs bords tombent sur les colonnes d'une grille de 12.
(function () {
  const W = 720, COLS = 12, GUT = 16, COL = (W - GUT * (COLS - 1)) / COLS;
  const edgeL = (i) => i * (COL + GUT);          // bord gauche de la colonne i
  const edgeR = (i) => i * (COL + GUT) + COL;    // bord droit de la colonne i
  // La consigne décrit la maquette, comme un brief : à toi de la traduire en colonnes.
  const LAYOUTS = Oeil.fresh("grid-snap", [
    { brief: "Trois cartes de même largeur, sur toute la grille", blocks: [{ label: "Carte", span: [0, 4], h: 150 }, { label: "Carte", span: [4, 8], h: 150 }, { label: "Carte", span: [8, 12], h: 150 }], tip: "12 ÷ 3 = 4 : trois cartes font 4 colonnes chacune. C'est pour ça que 12 est si pratique : il se divise par 2, 3, 4 et 6." },
    { brief: "Une barre latérale d'un quart, le contenu prend tout le reste", blocks: [{ label: "Barre latérale", span: [0, 3], h: 240 }, { label: "Contenu", span: [3, 12], h: 240 }], tip: "Un quart de 12 colonnes, c'est 3 colonnes. Le contenu garde les 9 autres : la proportion reste juste à toutes les tailles d'écran." },
    { brief: "Un texte centré sur les deux tiers de la grille", blocks: [{ label: "Texte", span: [2, 10], h: 170 }], tip: "Deux tiers de 12 font 8 colonnes. Pour centrer, on laisse le même nombre de colonnes vides de chaque côté : 2 à gauche, 2 à droite." },
    { brief: "Un bandeau pleine largeur, puis deux colonnes égales", blocks: [{ label: "Bandeau", span: [0, 12], h: 70 }, { label: "Colonne", span: [0, 6], h: 150 }, { label: "Colonne", span: [6, 12], h: 150 }], tip: "Deux colonnes égales font 6 colonnes de grille chacune. Le bandeau, lui, reprend les 12 : les bords s'alignent parfaitement." },
    { brief: "Une image sur deux tiers, sa légende sur le tiers restant", blocks: [{ label: "Image", span: [0, 8], h: 220 }, { label: "Légende", span: [8, 12], h: 220 }], tip: "8 + 4 = 12 : deux tiers, un tiers. La gouttière entre les deux reste celle de la grille, sans réglage à la main." },
  ]);
  // Toute position calée sur la grille est juste : on cherche les bords de colonne les plus proches.
  const nearL = (x) => { let i = Oeil.clamp(Math.round(x / (COL + GUT)), 0, COLS - 1); return { i, x: edgeL(i) }; };
  const nearR = (x, from) => { let i = Oeil.clamp(Math.round((x - COL) / (COL + GUT)), from, COLS - 1); return { i, x: edgeR(i) }; };
  function snapOf(b) { const l = nearL(b.x), r = nearR(b.x + b.w, l.i); return { l, r, d: Math.abs(b.x - l.x) + Math.abs(b.x + b.w - r.x) }; }
  function place(b) {
    b.el.style.left = `${b.x}px`; b.el.style.width = `${b.w}px`;
    const n = snapOf(b);
    const tag = b.el.querySelector(".gs-span");
    tag.textContent = `${n.r.i - n.l.i + 1} col.`;
  }
  function fit(board, s) { const pad = board.clientWidth < 600 ? 16 : 60; const k = Math.min(1.2, (board.clientWidth - pad) / W, (board.clientHeight - pad) / s.H); s.k = k; s.frame.style.transform = `translate(-50%, -50%) scale(${k})`; }
  Oeil.play({
    id: "grid-snap", name: "Grid Snap",
    howto: [
      { icon: "view_column", text: "Une grille de 12 colonnes, comme dans Figma. La consigne décrit une mise en page." },
      { icon: "drag_pan", text: "Déplace les blocs, tire leur poignée droite pour régler leur largeur. Ils s'aimantent aux colonnes." },
    ],
    brief: (s) => `${s.L.brief}.`,
    setup(round) {
      const L = LAYOUTS[round % LAYOUTS.length];
      let y = 0;
      const blocks = L.blocks.map((b) => {
        const tx = edgeL(b.span[0]), tw = edgeR(b.span[1] - 1) - tx;
        // Les blocs partent tous à gauche, empilés, avec une largeur de départ quelconque
        const it = { ...b, y, tx, tw, x: Oeil.randi(0, 3) * (COL + GUT), w: edgeR(Oeil.randi(1, 4)) };
        y += b.h + 16;
        return it;
      });
      return { L, blocks, H: y - 16 };
    },
    mount(board, s, api) {
      s.frame = api.h("div", "gs-frame");
      s.frame.style.cssText = `width:${W}px;height:${s.H}px`;
      s.frame.innerHTML = Array.from({ length: COLS }, (_, i) => `<span class="gs-col" style="left:${edgeL(i)}px;width:${COL}px"><i>${i + 1}</i></span>`).join("");
      s.blocks.forEach((b) => {
        b.el = api.h("div", "gs-block grab", `<span>${b.label}</span><span class="gs-span"></span>`);
        b.el.style.cssText = `top:${b.y}px;height:${b.h}px`;
        const hd = api.h("span", "gs-resize");
        hd.setAttribute("aria-label", `Largeur de ${b.label}`);
        hd.addEventListener("pointerdown", (e) => e.stopPropagation());
        b.el.append(hd);
        s.frame.append(b.el);
        place(b);
        // Aimant : au lâcher, un bord proche d'une colonne se cale dessus
        const magnet = () => { const n = snapOf(b); if (Math.abs(b.x - n.l.x) < 14) { const right = b.x + b.w; b.x = n.l.x; b.w = right - b.x; } const m = snapOf(b); if (Math.abs(b.x + b.w - m.r.x) < 14) b.w = m.r.x - b.x; place(b); };
        api.drag(b.el, { start: (e) => (e.target === hd ? null : { x: b.x }), move: (dx, dy, ev, c) => { if (!c) return; b.x = api.clamp(c.x + dx / s.k, 0, W - b.w); place(b); }, end: magnet });
        api.drag(hd, { start: () => ({ w: b.w }), move: (dx, dy, ev, c) => { b.w = api.clamp(c.w + dx / s.k, 30, W - b.x); place(b); }, end: magnet });
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
        metrics: [{ label: "Blocs bien placés", value: `${ok} sur ${d.length}`, good: ok === d.length }, { label: "Écart moyen des bords", value: `${(d.reduce((a, x) => a + x, 0) / d.length / 2).toFixed(1).replace(".", ",")} px` }],
        principle: s.L.tip,
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
