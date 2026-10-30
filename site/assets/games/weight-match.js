// Weight Match — une fonte variable se règle par axes : retrouve graisse, largeur et inclinaison d'un mot de référence.
(function () {
  const WORDS = Oeil.fresh("weight-match", ["Rythme", "Atelier", "Contraste", "Œil", "Graisse", "Signal", "Échelle", "Lumière", "Trame", "Gabarit", "Papier", "Nuance", "Encre", "Maquette"]);
  const AXES = [
    { key: "wght", label: "Graisse", min: 100, max: 1000, step: 10, tol: 30, span: 400 },
    { key: "wdth", label: "Largeur", min: 50, max: 151, step: 1, tol: 5, span: 45 },
    { key: "slnt", label: "Inclinaison", min: -10, max: 0, step: 1, tol: 1, span: 8 },
  ];
  const code = (v) => AXES.map((a) => `"${a.key}" ${v[a.key]}`).join(", ");
  const font = () => {
    if (!document.querySelector("[data-roboto-flex]")) document.head.insertAdjacentHTML("beforeend", `<link data-roboto-flex rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto+Flex:slnt,wdth,wght@-10..0,25..151,100..1000&display=swap"/>`);
    return document.fonts.load('400 40px "Roboto Flex"', "Rythme").catch(() => {});
  };
  function apply(s) {
    s.mine.style.fontVariationSettings = code(s.v);
    s.css.textContent = `font-variation-settings: ${AXES.filter((a) => s.used.includes(a)).map((a) => `"${a.key}" ${s.v[a.key]}`).join(", ")};`;
  }
  Oeil.play({
    id: "weight-match", name: "Weight Match",
    howto: [
      { icon: "tune", text: "Une fonte variable contient toutes ses graisses et largeurs : on la règle par axes, comme dans le panneau Texte de Figma." },
      { icon: "compare", text: "Règle les axes pour que ton mot ait le même dessin que la référence, affichée à une autre taille." },
      { icon: "lightbulb", text: "Les axes s'ajoutent au fil des manches : graisse, puis largeur, puis inclinaison." },
    ],
    brief: (s) => `Règle ${s.used.length > 1 ? "les axes" : "l'axe de graisse"} pour retrouver la référence.`,
    async setup(round) {
      await font();
      const used = AXES.slice(0, round < 2 ? 1 : round < 4 ? 2 : 3);
      const pickIn = (a, lo, hi) => Math.round(Oeil.randi(lo, hi) / a.step) * a.step;
      const ref = { wght: pickIn(AXES[0], 200, 900), wdth: used.includes(AXES[1]) ? pickIn(AXES[1], 62, 140) : 100, slnt: used.includes(AXES[2]) ? pickIn(AXES[2], -10, -4) : 0 };
      const v = { wght: ref.wght > 500 ? 300 : 700, wdth: 100, slnt: 0 };
      const bigRef = round % 2 === 0;
      return { word: WORDS[round % WORDS.length], used, ref, v, refSize: bigRef ? 96 : 40, mineSize: bigRef ? 40 : 96 };
    },
    mount(board, s, api) {
      const shell = api.h("div", "insp-wrap"), panel = api.h("div", "insp", `<p class="insp-title">Axes de la fonte variable</p>`);
      s.panel = panel;
      s.used.forEach((a) => panel.append(Oeil.field({ label: a.label, min: a.min, max: a.max, step: a.step, value: s.v[a.key], onChange: (x) => { s.v[a.key] = x; apply(s); } }).el));
      s.css = api.h("code", "insp-code");
      panel.append(s.css);
      const canvas = api.h("div", "insp-canvas wm-canvas");
      // Le grand mot doit tenir dans sa moitié de canevas, même en pleine largeur
      const cell = (board.clientWidth < 720 ? board.clientWidth : board.clientWidth - 248) / 2 - 32;
      const k = Math.min(1, cell / (s.word.length * 0.72 * Math.max(s.refSize, s.mineSize)));
      canvas.innerHTML = `<figure class="wm-cell"><span class="wm-word" style="font-size:${Math.round(s.refSize * k)}px;font-variation-settings:${code(s.ref)}">${s.word}</span><figcaption>Référence</figcaption></figure><figure class="wm-cell"><span class="wm-word" data-mine style="font-size:${Math.round(s.mineSize * k)}px">${s.word}</span><figcaption>Ta version</figcaption></figure>`;
      s.mine = canvas.querySelector("[data-mine]");
      shell.append(panel, canvas);
      board.append(shell);
      apply(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">tune</span>Glisse sur le nom d'un axe ou tape la valeur</span>`;
    },
    evaluate(s) {
      const parts = s.used.map((a) => ({ a, d: s.v[a.key] - s.ref[a.key] }));
      const score = parts.reduce((t, { a, d }) => t + Math.max(0, 100 - (Math.max(0, Math.abs(d) - a.tol) / a.span) * 100), 0) / parts.length;
      const bigMine = s.mineSize > s.refSize;
      return {
        score,
        metrics: parts.map(({ a, d }) => ({ label: a.label, value: `${s.v[a.key]} (référence ${s.ref[a.key]})`, good: Math.abs(d) <= a.tol * 1.5 })),
        principle: bigMine
          ? "En grand, les traits sont plus épais en valeur absolue : à réglage égal, le grand mot paraît plus noir. On choisit souvent trop léger pour compenser."
          : "En petit, les traits fondent et le mot paraît plus clair : à réglage égal, on a tendance à choisir trop gras pour compenser.",
      };
    },
    reveal(board, s) {
      s.panel.classList.add("is-locked");
      s.css.textContent = `Référence : ${s.used.map((a) => `"${a.key}" ${s.ref[a.key]}`).join(", ")}`;
    },
  });
})();
