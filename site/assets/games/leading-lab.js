// Leading Lab — plusieurs interlignages sont justes : on vise une plage adaptée à l'usage.
(function () {
  const LONG = "Le regard s'entraîne comme un muscle. À force de comparer, on finit par sentir l'écart avant de le mesurer, et la correction devient un réflexe plutôt qu'une hésitation devant l'écran.";
  // Les plages de hauteur de ligne et d'interlettrage dépendent de l'usage ; le corps change à chaque tirage.
  const KINDS = Oeil.fresh("leading-lab", [
    { name: "Texte courant", sizes: [15, 16, 17, 18], width: "32em", min: 1.4, max: 1.65, track: [-0.5, 0.5], text: LONG, weight: 400,
      hint: "Un long texte : l'œil doit retrouver facilement la ligne suivante.", tip: "Un texte long se lit mieux avec un interlignage autour de 150 % : l'œil retrouve facilement le début de la ligne suivante. Il n'a besoin d'aucun interlettrage." },
    { name: "Titre d'affiche", sizes: [44, 52, 60], width: "8em", min: 0.92, max: 1.1, track: [-4, -1.5], text: "Le regard s'entraîne comme un muscle", weight: 500,
      hint: "Un titre court et grand : les lignes forment un seul bloc.", tip: "En grand, les blancs paraissent énormes : un titre se serre sous 110 % de hauteur de ligne et prend un interlettrage négatif, comme dans la plupart des systèmes de design." },
    { name: "Légende", sizes: [11, 12, 13], width: "30em", min: 1.3, max: 1.5, track: [0, 2], text: LONG, weight: 400,
      hint: "Une légende sous une image : compacte, mais lisible.", tip: "Un petit corps a besoin d'air, entre les lignes et entre les lettres : c'est pour ça qu'on ouvre légèrement l'interlettrage sous 13 px." },
    { name: "Colonne étroite", sizes: [15, 16, 17], width: "16em", min: 1.3, max: 1.5, track: [-0.5, 0.5], text: LONG, weight: 400,
      hint: "Des lignes courtes : l'œil revient vite à la ligne.", tip: "Plus la ligne est courte, moins l'œil a de chemin pour revenir : une colonne étroite supporte une hauteur de ligne plus serrée qu'une ligne longue." },
    { name: "Chapô", sizes: [22, 24, 26, 28], width: "18em", min: 1.2, max: 1.38, track: [-1.5, -0.2], text: "Des mini-jeux de cinq minutes pour entraîner ton regard sur la couleur, l'espacement et le crénage.", weight: 400,
      hint: "Un chapô, entre titre et texte : de l'air, sans se disloquer.", tip: "Entre le titre et le texte courant, le chapô prend des réglages intermédiaires : hauteur de ligne et interlettrage diminuent quand le corps augmente." },
  ]);

  function apply(s) {
    s.p.style.lineHeight = s.lh;
    s.p.style.letterSpacing = `${s.ls / 100}em`;
    const lineH = s.lh * s.c.size;
    s.handle.style.top = `${s.p.offsetTop + lineH}px`;
    s.handle.style.left = `${s.p.offsetLeft - 28}px`;
    s.guide.style.cssText = `top:${s.p.offsetTop}px;left:${s.p.offsetLeft - 28}px;height:${lineH}px`;
  }

  Oeil.play({
    id: "leading-lab", name: "Leading Lab", levels: true,
    howto: [
      { icon: "format_line_spacing", text: "L'interlignage, c'est l'espace entre deux lignes de texte. Trop serré, les lignes se collent ; trop lâche, le paragraphe se disloque." },
      { icon: "height", text: "Attrape la poignée rose à gauche du texte et glisse-la vers le bas pour écarter les lignes, vers le haut pour les rapprocher." },
      { icon: "tune", text: "En mode Avancé, le panneau ajoute l'interlettrage, en %, comme dans Figma." },
      { icon: "article", text: "L'usage est indiqué en haut (texte courant, titre, légende…). Plusieurs réglages sont acceptés." },
    ],
    brief: (s) => (s.adv ? `${s.c.name} en ${s.c.size} px : règle la hauteur de ligne et l'interlettrage.` : `${s.c.name} (${s.c.size} px) : écarte ou rapproche les lignes pour qu'elles soient confortables à lire.`),
    setup(round, api) {
      const k = KINDS[round % KINDS.length];
      const c = { ...k, size: Oeil.pick(k.sizes) };
      const off = Math.random() < 0.5 ? -1 : 1;
      const lh = Oeil.clamp((off < 0 ? c.min : c.max) + off * (0.22 + Math.random() * 0.3), 0.75, 2.4);
      const adv = api.level === "adv";
      const ls = adv ? Oeil.pick([c.track[0] - Oeil.randi(2, 3), c.track[1] + Oeil.randi(2, 3)]) : (c.track[0] + c.track[1]) / 2;
      return { c, adv, lh: Math.round(lh * 100) / 100, ls };
    },
    mount(board, s, api) {
      const shell = api.h("div", "insp-wrap" + (s.adv ? "" : " is-plain")), panel = api.h("div", "insp", `<p class="insp-title">Texte</p><p class="insp-row"><span>Corps</span><b>${s.c.size} px</b></p>`);
      s.fLh = Oeil.field({ label: "Hauteur de ligne", unit: "%", min: 75, max: 260, value: Math.round(s.lh * 100), onChange: (v) => { s.lh = v / 100; apply(s); } });
      s.fLs = Oeil.field({ label: "Interlettrage", unit: "%", min: -8, max: 8, step: 0.1, value: s.ls, onChange: (v) => { s.ls = v; apply(s); } });
      panel.append(s.fLh.el, s.fLs.el);
      s.panel = panel;
      const wrap = api.h("div", "ll-wrap");
      s.p = api.h("p", "ll-text", s.c.text);
      s.p.style.cssText = `font-size:${s.c.size}px;max-width:${s.c.width};font-weight:${s.c.weight};max-width:min(${s.c.width},100%)`;
      s.guide = api.h("span", "ll-guide");
      s.handle = api.h("span", "handle");
      s.handle.tabIndex = 0;
      s.handle.setAttribute("role", "slider");
      s.handle.setAttribute("aria-label", "Interlignage");
      wrap.append(s.p, s.guide, s.handle);
      const canvas = api.h("div", "insp-canvas");
      canvas.append(wrap); shell.append(panel, canvas); board.append(shell);
      api.drag(s.handle, {
        start: () => ({ lh: s.lh }),
        move: (dx, dy, ev, c) => { s.lh = api.clamp(c.lh + dy / s.c.size, 0.75, 2.6); s.fLh.set(Math.round(s.lh * 100), true); apply(s); },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">height</span>Glisse la poignée rose vers le haut ou le bas</span><span class="ctl-hint">${s.c.hint}</span>`;
      requestAnimationFrame(() => apply(s));
    },
    keys(e, s) {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      s.lh = Oeil.clamp(s.lh + (e.key === "ArrowDown" ? 1 : -1) * (e.shiftKey ? 0.1 : 0.01), 0.75, 2.6);
      s.fLh.set(Math.round(s.lh * 100), true);
      apply(s);
    },
    resize(board, s) { apply(s); },
    evaluate(s) {
      const { min, max } = s.c;
      const inside = s.lh >= min && s.lh <= max;
      const dist = inside ? 0 : s.lh < min ? min - s.lh : s.lh - max;
      const pc = (x) => `${Math.round(x * 100)} %`, fr = (x) => `${x.toFixed(1).replace(".", ",")} %`;
      const [t0, t1] = s.c.track, tOk = s.ls >= t0 - 0.05 && s.ls <= t1 + 0.05, tDist = tOk ? 0 : s.ls < t0 ? t0 - s.ls : s.ls - t1;
      return {
        score: (s.adv ? 0.7 : 1) * (inside ? 100 : Math.max(0, 100 - dist * 260)) + (s.adv ? 0.3 * Math.max(0, 100 - tDist * 40) : 0),
        metrics: [
          { label: "Hauteur de ligne", value: `${pc(s.lh)} (${Math.round(s.lh * s.c.size)} px)`, good: inside },
          { label: "Plage conseillée", value: `${pc(min)} à ${pc(max)}` },
          ...(s.adv ? [{ label: "Interlettrage", value: fr(s.ls), good: tOk }, { label: "Plage conseillée", value: `${fr(t0)} à ${fr(t1)}` }] : []),
        ],
        principle: s.c.tip,
      };
    },
    reveal(board, s, r, api) {
      s.handle.remove(); s.guide.remove(); s.panel.classList.add("is-locked");
      const mine = s.lh, good = Math.round(((s.c.min + s.c.max) / 2) * 100) / 100, mineLs = s.ls, goodLs = (s.c.track[0] + s.c.track[1]) / 2;
      const label = api.h("p", "ll-label");
      s.p.before(label);
      const setView = (view) => {
        s.p.style.lineHeight = view === "ref" ? good : mine;
        s.p.style.letterSpacing = `${(view === "ref" ? goodLs : mineLs) / 100}em`;
        s.p.classList.toggle("ll-ref", view === "ref");
        label.innerHTML = view === "ref" ? `<span class="tag-ref">Réglage conseillé : ${Math.round(good * 100)} %</span>` : `<span class="tag-you">Ta version : ${Math.round(mine * 100)} %</span>`;
        api.controls.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
      };
      api.controls.innerHTML = `<div class="seg-line" role="group" aria-label="Version affichée"><button data-view="mine" type="button">Ta version</button><button data-view="ref" type="button">Réglage conseillé</button></div><span class="ctl-hint">Bascule pour comparer</span>`;
      api.controls.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
      setView("mine");
    },
  });
})();
