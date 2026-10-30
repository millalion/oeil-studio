// Weight Match — la graisse perçue change avec la taille : retrouve la référence. En Avancé, on règle les axes d'une fonte variable.
(function () {
  const WORDS = Oeil.fresh("weight-match", ["Rythme", "Atelier", "Contraste", "Œil", "Graisse", "Signal", "Échelle", "Lumière", "Trame", "Gabarit", "Papier", "Nuance", "Encre", "Maquette"]);
  const AXES = [
    { key: "wght", label: "Graisse", min: 100, max: 900, step: 10, tol: 30, span: 400 },
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
    if (s.css) s.css.textContent = `font-variation-settings: ${s.used.map((a) => `"${a.key}" ${s.v[a.key]}`).join(", ")};`;
    if (s.handle) s.handle.style.left = `${((s.v.wght - 100) / 800) * 100}%`;
  }
  Oeil.play({
    id: "weight-match", name: "Weight Match", levels: true,
    howto: [
      { icon: "compare", text: "À gauche, la référence. À droite, le même mot à une autre taille." },
      { icon: "swipe", text: "Glisse la poignée de la jauge jusqu'à ce que les deux mots paraissent de même graisse." },
      { icon: "tune", text: "En mode Avancé, tu règles une vraie fonte variable : graisse, puis largeur et inclinaison." },
    ],
    brief: (s) => (s.adv ? "Règle les axes de la fonte pour retrouver la référence." : "Donne au mot de droite la même graisse que la référence."),
    async setup(round, api) {
      await font();
      const adv = api.level === "adv";
      const used = adv ? AXES.slice(0, round < 1 ? 1 : round < 3 ? 2 : 3) : AXES.slice(0, 1);
      const on = (i) => used.includes(AXES[i]);
      const ref = { wght: Oeil.randi(20, 85) * 10, wdth: on(1) ? Oeil.randi(62, 140) : 100, slnt: on(2) ? Oeil.randi(-10, -4) : 0 };
      const bigRef = round % 2 === 0;
      return { adv, word: WORDS[round % WORDS.length], used, ref, v: { wght: ref.wght > 500 ? 300 : 700, wdth: 100, slnt: 0 }, refSize: bigRef ? 96 : 40, mineSize: bigRef ? 40 : 96 };
    },
    mount(board, s, api) {
      const shell = api.h("div", "insp-wrap" + (s.adv ? "" : " is-plain")), panel = api.h("div", "insp", `<p class="insp-title">Fonte variable</p>`);
      s.panel = panel;
      s.used.forEach((a) => panel.append(Oeil.field({ label: a.label, min: a.min, max: a.max, step: a.step, value: s.v[a.key], onChange: (x) => { s.v[a.key] = x; apply(s); } }).el));
      if (s.adv) { s.css = api.h("code", "insp-code"); panel.append(s.css); }
      const canvas = api.h("div", "insp-canvas wm-canvas");
      const cell = (board.clientWidth < 720 || !s.adv ? board.clientWidth : board.clientWidth - 248) / 2 - 32;
      const k = Math.min(1, cell / (s.word.length * 0.72 * Math.max(s.refSize, s.mineSize)));
      canvas.innerHTML = `<figure class="wm-cell"><span class="wm-word" style="font-size:${Math.round(s.refSize * k)}px;font-variation-settings:${code(s.ref)}">${s.word}</span><figcaption>Référence</figcaption></figure><figure class="wm-cell"><span class="wm-word" data-mine style="font-size:${Math.round(s.mineSize * k)}px">${s.word}</span><figcaption>Ta version</figcaption></figure>`;
      s.mine = canvas.querySelector("[data-mine]");
      shell.append(panel, canvas);
      board.append(shell);
      if (!s.adv) {
        const track = api.h("div", "wm-track wm-gauge grab", `<span class="wm-end">Fin</span><span class="wm-end wm-end-r">Gras</span>`);
        s.handle = api.h("span", "handle");
        s.handle.tabIndex = 0; s.handle.setAttribute("role", "slider"); s.handle.setAttribute("aria-label", "Graisse");
        track.append(s.handle);
        board.append(track);
        const from = (ev) => { const r = track.getBoundingClientRect(); s.v.wght = Math.round((100 + api.clamp((ev.clientX - r.left) / r.width, 0, 1) * 800) / 10) * 10; apply(s); };
        api.drag(track, { start: from, move: (dx, dy, ev) => from(ev) });
      }
      apply(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">swipe</span>${s.adv ? "Glisse les curseurs ou tape une valeur" : "Glisse sur la jauge"}</span>`;
    },
    keys(e, s) {
      if (s.adv || (e.key !== "ArrowLeft" && e.key !== "ArrowRight")) return;
      e.preventDefault();
      s.v.wght = Oeil.clamp(s.v.wght + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 50 : 10), 100, 900);
      apply(s);
    },
    evaluate(s) {
      const parts = s.used.map((a) => ({ a, d: s.v[a.key] - s.ref[a.key] }));
      const score = parts.reduce((t, { a, d }) => t + Math.max(0, 100 - (Math.max(0, Math.abs(d) - a.tol) / a.span) * 100), 0) / parts.length;
      return {
        score,
        metrics: parts.map(({ a, d }) => ({ label: a.label, value: `${s.v[a.key]} (référence ${s.ref[a.key]})`, good: Math.abs(d) <= a.tol * 1.5 })),
        principle: s.mineSize > s.refSize
          ? "En grand, les traits sont plus épais en valeur absolue : à réglage égal, le grand mot paraît plus noir. On choisit souvent trop léger pour compenser."
          : "En petit, les traits fondent et le mot paraît plus clair : à réglage égal, on a tendance à choisir trop gras pour compenser.",
      };
    },
    reveal(board, s) {
      if (s.panel) s.panel.classList.add("is-locked");
      // Correction : le mot de droite, redessiné avec les bons réglages, sous ta version
      const fix = s.mine.cloneNode(true);
      fix.removeAttribute("data-mine"); fix.classList.add("wm-fix"); fix.style.fontVariationSettings = code(s.ref);
      s.mine.after(fix);
      s.mine.parentElement.querySelector("figcaption").textContent = "En noir : ta version. En rose : la bonne graisse";
      if (s.css) s.css.textContent = `Référence : ${s.used.map((a) => `"${a.key}" ${s.ref[a.key]}`).join(", ")}`;
    },
  });
})();
