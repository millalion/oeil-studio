// Pixel Guess — estime une dimension en pixels CSS, sans règle, en faisant défiler la valeur comme dans un outil de design.
(function () {
  const KINDS = [
    { kind: "button", dim: "height", q: "Quelle est la hauteur de ce bouton ?", range: [28, 72] },
    { kind: "bar", dim: "width", q: "Quelle est la largeur de cette barre ?", range: [60, 460] },
    { kind: "square", dim: "width", q: "Quel est le côté de ce carré ?", range: [40, 260] },
    { kind: "circle", dim: "width", q: "Quel est le diamètre de ce cercle ?", range: [24, 240] },
    { kind: "gap", dim: "width", q: "Quel est l'écart entre ces deux blocs ?", range: [8, 120] },
    { kind: "radius", dim: "radius", q: "Quel est le rayon d'arrondi de cette carte ?", range: [4, 40] },
  ];
  const order = Oeil.shuffle(KINDS);

  function shape(s) {
    const v = s.truth;
    switch (s.k.kind) {
      case "button": return `<span class="pg-button" style="height:${v}px;padding:0 ${Math.round(v * 0.6)}px;font-size:${Math.round(Oeil.clamp(v * 0.36, 12, 20))}px">Continuer</span>`;
      case "bar": return `<span class="pg-fill" style="width:${v}px;height:18px"></span>`;
      case "square": return `<span class="pg-fill" style="width:${v}px;height:${v}px"></span>`;
      case "circle": return `<span class="pg-fill" style="width:${v}px;height:${v}px;border-radius:999px"></span>`;
      case "gap": return `<span class="flex"><span class="pg-fill" style="width:72px;height:72px"></span><span style="width:${v}px"></span><span class="pg-fill" style="width:72px;height:72px"></span></span>`;
      case "radius": return `<span class="pg-card" style="border-radius:${v}px"></span>`;
    }
  }

  function apply(s) { s.out.textContent = Math.round(s.guess); }

  Oeil.play({
    id: "pixel-guess", name: "Pixel Guess",
    howto: [
      { icon: "straighten", text: "Une question, un élément : estime sa dimension en pixels, à l'œil." },
      { icon: "swipe", text: "Ta réponse se règle dans le champ sous l'élément : glisse sur le nombre vers la gauche ou la droite (comme dans Figma), tape-le, ou utilise − et +." },
      { icon: "check", text: "Valide : une cote apparaît sur l'élément avec la vraie valeur." },
    ],
    brief: "Estime la dimension demandée, à l'œil, sans règle.",
    setup(round) {
      const k = order[round % order.length];
      const truth = Oeil.randi(k.range[0], k.range[1]);
      return { k, truth, guess: Math.round((k.range[0] + k.range[1]) / 2) };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "pg-wrap");
      s.fig = api.h("div", "pg-figure", shape(s));
      const answer = api.h("div", "pg-answer", `<p class="pg-q">${s.k.q}</p>
        <label class="pg-scrub grab" title="Glisse vers la gauche ou la droite, ou tape la valeur">
          <button aria-label="Moins 1" class="pg-step" data-d="-1" type="button">−</button>
          <input aria-label="Ta réponse en pixels" inputmode="numeric" type="text"/><span class="pg-unit">px</span>
          <button aria-label="Plus 1" class="pg-step" data-d="1" type="button">+</button>
        </label>
        <p class="pg-help"><span class="material-symbols-outlined">swipe</span>Glisse sur le nombre, tape-le, ou utilise ↑ ↓</p>`);
      wrap.append(s.fig, answer);
      board.append(wrap);
      const label = answer.querySelector(".pg-scrub"), input = label.querySelector("input");
      s.out = { set textContent(v) { input.value = v; } };
      apply(s);
      api.drag(input, {
        start: () => ({ g: s.guess }),
        move: (dx, dy, ev, c) => { s.guess = api.clamp(c.g + dx / (ev.shiftKey ? 0.5 : 2), 1, 999); apply(s); },
        end: (ev, c) => { if (Math.round(c.g) === Math.round(s.guess)) { input.focus(); input.select(); } },
      });
      answer.querySelectorAll(".pg-step").forEach((b) => b.addEventListener("click", () => { s.guess = api.clamp(Math.round(s.guess) + +b.dataset.d, 1, 999); apply(s); }));
      input.addEventListener("input", () => { const n = parseInt(input.value, 10); if (!Number.isNaN(n)) s.guess = api.clamp(n, 1, 999); });
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") { e.preventDefault(); api.submit(); }
        if (e.key === "ArrowUp" || e.key === "ArrowDown") { e.preventDefault(); s.guess = api.clamp(Math.round(s.guess) + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1), 1, 999); apply(s); }
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">straighten</span>Pixels CSS, comme dans ton outil de design</span>`;
    },
    keys(e, s) {
      if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
      e.preventDefault();
      s.guess = Oeil.clamp(s.guess + (e.key === "ArrowUp" ? 1 : -1) * (e.shiftKey ? 10 : 1), 1, 999);
      apply(s);
    },
    evaluate(s) {
      const err = Math.round(s.guess) - s.truth;
      const rel = Math.abs(err) / s.truth * 100;
      return {
        score: rel <= 3 ? 100 : Math.max(0, 100 - (rel - 3) * 3),
        metrics: [
          { label: "Ta réponse", value: `${Math.round(s.guess)} px` },
          { label: "Valeur réelle", value: `${s.truth} px` },
          { label: "Écart", value: `${err > 0 ? "+" : ""}${err} px (${rel.toFixed(0)} %)`, good: rel <= 8 },
        ],
        principle: "Mémorise quelques étalons : un bouton confortable fait 40 à 48 px de haut, une icône 20 à 24 px, un texte courant 16 px. On estime mieux par comparaison qu'en valeur absolue.",
      };
    },
    reveal(board, s, r, api) {
      const el = s.fig.firstElementChild;
      const target = s.k.kind === "gap" ? el.children[1] : el;
      const rr = target.getBoundingClientRect(), b = board.getBoundingClientRect();
      const dim = api.h("span", s.k.dim === "height" ? "pg-dim pg-dim-v" : "pg-dim");
      board.querySelectorAll(".pg-scrub button, .pg-scrub input").forEach((n) => (n.disabled = true));
      if (s.k.dim === "height") dim.style.cssText = `left:${rr.left - b.left - 18}px;top:${rr.top - b.top}px;height:${rr.height}px`;
      else if (s.k.dim === "radius") dim.style.cssText = `left:${rr.left - b.left}px;top:${rr.top - b.top - 16}px;width:${s.truth}px`;
      else dim.style.cssText = `left:${rr.left - b.left}px;top:${rr.top - b.top - 16}px;width:${rr.width}px`;
      dim.innerHTML = `<span class="tag-ref">${s.truth} px</span>`;
      board.append(dim);
    },
  });
})();
