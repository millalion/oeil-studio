// Leading Lab — plusieurs interlignages sont justes : on vise une plage adaptée à l'usage.
(function () {
  const LONG = "Le regard s'entraîne comme un muscle. À force de comparer, on finit par sentir l'écart avant de le mesurer, et la correction devient un réflexe plutôt qu'une hésitation devant l'écran.";
  const CONTEXTS = Oeil.shuffle([
    { name: "Texte courant", size: 17, width: "34em", min: 1.4, max: 1.65, text: LONG, weight: 400,
      hint: "Un long texte : l'œil doit retrouver facilement la ligne suivante.", tip: "Un texte long se lit mieux avec un interlignage autour de 1,5 : l'œil retrouve facilement le début de la ligne suivante. Les WCAG recommandent au moins 1,5 pour le texte courant." },
    { name: "Titre d'affiche", size: 60, width: "9em", min: 0.92, max: 1.1, text: "Le regard s'entraîne comme un muscle", weight: 500,
      hint: "Un titre court et grand : les lignes forment un seul bloc.", tip: "En grand, les espaces entre lignes paraissent énormes : un titre se serre souvent sous 1,1. Les capitales et accents restent la limite basse." },
    { name: "Légende", size: 12, width: "30em", min: 1.3, max: 1.5, text: LONG, weight: 400,
      hint: "Une légende sous une image : compacte, mais lisible.", tip: "Un petit corps a besoin d'air, mais une légende reste un bloc compact attaché à son image : entre 1,3 et 1,5." },
    { name: "Colonne étroite", size: 16, width: "16em", min: 1.3, max: 1.5, text: LONG, weight: 400,
      hint: "Des lignes courtes : l'œil revient vite à la ligne.", tip: "Plus la ligne est courte, moins l'œil a de chemin pour revenir : une colonne étroite supporte un interlignage plus serré qu'une ligne longue." },
    { name: "Chapô", size: 26, width: "20em", min: 1.2, max: 1.38, text: "Des mini-jeux de cinq minutes pour entraîner ton regard sur la couleur, l'espacement et le crénage.", weight: 400,
      hint: "Un chapô, entre titre et texte : de l'air, sans se disloquer.", tip: "Entre le titre et le texte courant, le chapô prend un interlignage intermédiaire : l'interlignage diminue quand le corps augmente." },
  ]);

  function apply(s) {
    s.p.style.lineHeight = s.lh;
    const lineH = s.lh * s.c.size;
    s.handle.style.top = `${s.p.offsetTop + lineH}px`;
    s.handle.style.left = `${s.p.offsetLeft - 28}px`;
    s.guide.style.cssText = `top:${s.p.offsetTop}px;left:${s.p.offsetLeft - 28}px;height:${lineH}px`;
  }

  Oeil.play({
    id: "leading-lab", name: "Leading Lab",
    howto: [
      { icon: "format_line_spacing", text: "L'interlignage, c'est l'espace entre deux lignes de texte. Trop serré, les lignes se collent ; trop lâche, le paragraphe se disloque." },
      { icon: "height", text: "Attrape la poignée rose à gauche du texte et glisse-la vers le bas pour écarter les lignes, vers le haut pour les rapprocher." },
      { icon: "article", text: "Le contexte est indiqué en haut (texte courant, titre, légende…). Vise ce qui serait le plus confortable à lire dans ce contexte : plusieurs réglages sont acceptés." },
    ],
    brief: (s) => `${s.c.name} (${s.c.size} px) : écarte ou rapproche les lignes pour qu'elles soient confortables à lire.`,
    setup(round) {
      const c = CONTEXTS[round % CONTEXTS.length];
      const off = Math.random() < 0.5 ? -1 : 1;
      const lh = Oeil.clamp((off < 0 ? c.min : c.max) + off * (0.22 + Math.random() * 0.3), 0.75, 2.4);
      return { c, lh: Math.round(lh * 100) / 100 };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "ll-wrap");
      s.p = api.h("p", "ll-text", s.c.text);
      s.p.style.cssText = `font-size:${s.c.size}px;max-width:${s.c.width};font-weight:${s.c.weight};letter-spacing:${s.c.size > 40 ? "-0.04em" : "-0.005em"}`;
      s.guide = api.h("span", "ll-guide");
      s.handle = api.h("span", "handle");
      s.handle.tabIndex = 0;
      s.handle.setAttribute("role", "slider");
      s.handle.setAttribute("aria-label", "Interlignage");
      wrap.append(s.p, s.guide, s.handle);
      board.append(wrap);
      api.drag(s.handle, {
        start: () => ({ lh: s.lh }),
        move: (dx, dy, ev, c) => { s.lh = api.clamp(c.lh + dy / s.c.size, 0.75, 2.6); apply(s); },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">height</span>Glisse la poignée rose vers le haut ou le bas</span><span class="ctl-hint">${s.c.hint}</span>`;
      requestAnimationFrame(() => apply(s));
    },
    keys(e, s) {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      s.lh = Oeil.clamp(s.lh + (e.key === "ArrowDown" ? 1 : -1) * (e.shiftKey ? 0.1 : 0.01), 0.75, 2.6);
      apply(s);
    },
    resize(board, s) { apply(s); },
    evaluate(s) {
      const { min, max } = s.c;
      const inside = s.lh >= min && s.lh <= max;
      const dist = inside ? 0 : s.lh < min ? min - s.lh : s.lh - max;
      const fmt = (x) => x.toFixed(2).replace(".", ",");
      return {
        score: inside ? 100 : Math.max(0, 100 - dist * 260),
        metrics: [
          { label: "Ton interlignage", value: `${fmt(s.lh)} (${Math.round(s.lh * s.c.size)} px)`, good: inside },
          { label: "Plage conseillée", value: `${fmt(min)} à ${fmt(max)}` },
          { label: "Verdict", value: inside ? "dans la plage" : s.lh < min ? "trop serré" : "trop lâche", good: inside },
        ],
        principle: s.c.tip,
      };
    },
    reveal(board, s, r, api) {
      s.handle.remove(); s.guide.remove();
      const mine = s.lh, good = Math.round(((s.c.min + s.c.max) / 2) * 100) / 100;
      const label = api.h("p", "ll-label");
      s.p.before(label);
      const setView = (view) => {
        s.p.style.lineHeight = view === "ref" ? good : mine;
        s.p.classList.toggle("ll-ref", view === "ref");
        label.innerHTML = view === "ref" ? `<span class="tag-ref">Réglage conseillé : ${good.toFixed(2).replace(".", ",")}</span>` : `<span class="tag-you">Ta version : ${mine.toFixed(2).replace(".", ",")}</span>`;
        api.controls.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
      };
      api.controls.innerHTML = `<div class="seg-line" role="group" aria-label="Version affichée"><button data-view="mine" type="button">Ta version</button><button data-view="ref" type="button">Réglage conseillé</button></div><span class="ctl-hint">Bascule pour comparer</span>`;
      api.controls.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
      setView("mine");
    },
  });
})();
