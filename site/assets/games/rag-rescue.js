// Rag Rescue — règle la largeur d'une colonne alignée à gauche pour que son drapeau (le bord droit) soit le plus régulier.
(function () {
  const TEXTS = Oeil.fresh("rag-rescue", [
    "La grille modulaire naît en Suisse dans les années cinquante. Elle organise la page en champs égaux séparés par des gouttières constantes, et donne au texte comme à l'image une place prévisible, ce qui permet de décider vite et juste.",
    "Un drapeau réussi ressemble à une côte douce : les lignes longues et courtes alternent sans former d'escalier, de trou ni de pointe. Le lecteur ne le remarque pas, mais il sent tout de suite quand le bord droit se met à danser.",
    "Le crénage corrige les paires de lettres une à une ; l'approche règle l'espace de toute une police. Ensemble, ils déterminent la texture d'un paragraphe, ce gris régulier que l'on cherche à obtenir avant même de lire le moindre mot.",
    "Avant d'ajuster l'interlignage d'un texte, on choisit sa longueur de ligne. Entre quarante-cinq et soixante-quinze signes, l'œil repart sans effort au début de la ligne suivante ; au-delà, il se perd, en deçà, il s'essouffle.",
  ]);
  const MIN = 240, MAX = 560;

  // Mesure les longueurs de ligne d'un paragraphe à une largeur donnée.
  function lines(p, width) {
    p.style.width = `${width}px`;
    const range = document.createRange(), node = p.firstChild, rows = new Map();
    for (let i = 0; i < node.length; i++) {
      range.setStart(node, i); range.setEnd(node, i + 1);
      const r = range.getBoundingClientRect();
      if (!r.width) continue;
      const key = Math.round(r.top);
      rows.set(key, Math.max(rows.get(key) || 0, r.right));
    }
    const left = p.getBoundingClientRect().left;
    return [...rows.values()].map((x) => x - left);
  }
  // Pénalité : écarts entre lignes voisines + lignes trop courtes (sans compter la dernière).
  function rag(ls, width) {
    const body = ls.slice(0, -1);
    if (body.length < 2) return 99;
    let pen = 0;
    for (let i = 1; i < body.length; i++) pen += Math.abs(body[i] - body[i - 1]) / width;
    body.forEach((x) => { if (x < width * 0.82) pen += (width * 0.82 - x) / width * 3; });
    return pen / (body.length - 1);
  }

  function apply(s) {
    const ls = lines(s.p, s.w);
    s.handle.style.left = `${s.w}px`;
    s.marks.innerHTML = ls.slice(0, -1).map((x, i) => `<span style="top:${i * s.lh}px;left:${x}px;width:${Math.max(0, s.w - x)}px"></span>`).join("");
    return ls;
  }

  Oeil.play({
    id: "rag-rescue", name: "Rag Rescue",
    howto: [
      { icon: "format_align_left", text: "Un texte aligné à gauche a un bord droit irrégulier : on l'appelle le drapeau." },
      { icon: "swap_horiz", text: "Glisse la poignée rose pour élargir ou resserrer la colonne. Les mots se recomposent en direct." },
      { icon: "lightbulb", text: "Vise un drapeau doux : pas de ligne beaucoup plus courte que ses voisines, pas d'escalier." },
    ],
    brief: "Règle la largeur de la colonne pour obtenir le drapeau le plus régulier.",
    hint: { label: "Voir les creux", run(s) { s.marks.classList.toggle("is-on"); } },
    setup() {
      // Chaque paragraphe est recomposé à partir de phrases de tous les textes
      const text = Oeil.shuffle(TEXTS.flatMap((t) => t.match(/[^.]+\./g) || [t])).slice(0, 4).map((x) => x.trim()).join(" ");
      return { text, w: Oeil.randi(MIN, MAX), lh: 27 };
    },
    mount(board, s, api) {
      s.max = Math.min(MAX, board.clientWidth - 80); s.min = Math.min(MIN, s.max - 90); s.w = api.clamp(s.w, s.min, s.max);
      const wrap = api.h("div", "rg-wrap");
      const box = api.h("div", "rg-box");
      s.p = api.h("p", "rg-text", s.text);
      s.marks = api.h("div", "rg-marks");
      s.handle = api.h("span", "handle rg-handle");
      s.handle.tabIndex = 0; s.handle.setAttribute("aria-label", "Largeur de la colonne");
      box.append(s.p, s.marks, s.handle);
      wrap.append(box);
      board.append(wrap);
      api.drag(s.handle, { start: () => ({ w: s.w }), move: (dx, dy, ev, c) => { s.w = api.clamp(c.w + dx, s.min, s.max); apply(s); } });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">swap_horiz</span>Glisse la poignée rose à droite du texte</span>`;
      document.fonts.ready.then(() => apply(s));
    },
    keys(e, s) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      s.w = Oeil.clamp(s.w + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 10 : 2), s.min, s.max);
      apply(s);
    },
    evaluate(s) {
      // Compare au meilleur réglage possible sur toute la plage.
      const mine = rag(lines(s.p, s.w), s.w);
      let best = Infinity, bestW = s.w, worst = 0;
      for (let w = s.min; w <= s.max; w += 4) { const r = rag(lines(s.p, w), w); if (r < best) { best = r; bestW = w; } worst = Math.max(worst, r); }
      lines(s.p, s.w);
      s.bestW = bestW;
      const q = worst === best ? 1 : Oeil.clamp((worst - mine) / (worst - best), 0, 1);
      return {
        score: Math.round(Math.pow(q, 1.6) * 100),
        metrics: [
          { label: "Ta largeur", value: `${Math.round(s.w)} px`, good: q > 0.85 },
          { label: "Meilleur drapeau trouvé", value: `${bestW} px` },
        ],
        principle: "Un bon drapeau ne dépend pas que de la largeur : on reformule, on coupe un mot ou on ajuste l'approche. Mais la largeur de colonne est le premier réglage, et quelques pixels changent tout.",
      };
    },
    reveal(board, s, r, api) {
      s.handle.remove();
      s.marks.classList.add("is-on");
      const ghost = api.h("span", "rg-best");
      ghost.style.left = `${s.bestW}px`;
      ghost.innerHTML = `<span class="tag-ref">meilleur : ${s.bestW} px</span>`;
      s.p.parentElement.append(ghost);
    },
  });
})();
