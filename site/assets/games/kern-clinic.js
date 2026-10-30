// Kern Clinic — la référence est le crénage dessiné dans Newsreader, mesuré dans le navigateur.
(function () {
  const FONT = "Newsreader";
  const EXTRA = ["TAPIS", "VALISE", "AUTOUR", "PAYSAGE", "LAVANDE", "TOITURE", "ROYAUME", "WAGNER", "AVOCAT", "FAVORI", "TYPOGRAPHE", "ATLAS", "VOILE", "VOYELLE", "PATATE", "LATTE", "AFFICHE", "KAYAK", "YAOURT", "OCTAVE", "VAPEUR", "TAVERNE"];
  const TOL = 5; // unités (1/1000 em) considérées comme parfaites
  const WORDS = [
    { word: "AVANT", tip: "Les diagonales de A et V laissent un grand vide triangulaire : on les rapproche fortement pour que leur blanc paraisse égal à celui de N et T." },
    { word: "VOYAGE", tip: "V–O et Y–A sont des paires à diagonales. Les rondes débordent optiquement de leur boîte : elles se placent plus près de leurs voisines que deux droites." },
    { word: "TRAVAIL", tip: "Sous la barre du T se cache un vide où le R peut s'avancer. I et L, deux droites, gardent un blanc franc." },
    { word: "LYCÉE", tip: "Le L laisse un grand blanc en haut à droite : le Y vient s'y loger. Les accents n'entrent pas dans le calcul." },
    { word: "WAGON", tip: "W et A s'emboîtent comme deux dents de scie. Entre O et N, une ronde et une droite : approche-les un peu plus que deux droites." },
    { word: "FAÇADE", tip: "Le vide sous la barre du F accueille l'épaule du A. Ç et D sont des rondes : leur blanc paraît plus petit qu'il n'est." },
    { word: "PLATEAU", tip: "P et L ont chacun un côté très ouvert : L–A et T–E sont les paires à surveiller." },
    { word: "CRÉNAGE", tip: "Le crénage corrige l'approche par défaut de certaines paires : ici N–A et A–G demandent un rapprochement net." },
  ];
  // Pour les autres mots, le conseil vient de la paire la plus délicate.
  const RULES = [
    [/AV|VA|AW|WA|AY|YA/, "Deux diagonales opposées laissent un grand vide : c'est la paire qu'on rapproche le plus."],
    [/T[AOEY]|TT|LT|LY|LV|FA|PA/, "Sous une barre ou derrière un pied ouvert se cache un vide : la lettre suivante vient s'y loger."],
    [/[VYTW][OE]|O[VYTW]/, "Une ronde à côté d'une diagonale ou d'une barre : le blanc paraît grand, on les rapproche."],
  ];
  const tipOf = (word) => (RULES.find(([re]) => re.test(word)) || [0, "Juge la surface de blanc entre les lettres : deux droites demandent plus d'écart que deux rondes."])[1];
  const words = Oeil.fresh("kern-clinic", [...WORDS, ...EXTRA.map((word) => ({ word, tip: tipOf(word) }))]);
  const units = (em) => Math.round(em * 1000);

  async function measure(word) {
    const size = 200;
    await document.fonts.load(`400 ${size}px ${FONT}`, word);
    const probe = document.createElement("span");
    probe.style.cssText = `position:absolute;left:-9999px;top:0;white-space:pre;font-family:${FONT};font-size:${size}px;font-kerning:normal;line-height:1`;
    probe.textContent = word;
    document.body.appendChild(probe);
    const node = probe.firstChild, base = probe.getBoundingClientRect().left, range = document.createRange();
    const letters = [...word], xs = [];
    let off = 0;
    letters.forEach((ch) => { range.setStart(node, off); range.setEnd(node, off + ch.length); xs.push((range.getBoundingClientRect().left - base) / size); off += ch.length; });
    const width = probe.getBoundingClientRect().width / size;
    // Mêmes mesures sans crénage : c'est le zéro du champ Crénage d'InDesign
    probe.style.fontKerning = "none";
    const flat = [];
    off = 0;
    letters.forEach((ch) => { range.setStart(node, off); range.setEnd(node, off + ch.length); flat.push((range.getBoundingClientRect().left - base) / size); off += ch.length; });
    probe.remove();
    return { letters, xs, flat, width };
  }

  function geometry(board, s) {
    const W = board.clientWidth, H = board.clientHeight;
    s.fs = Math.max(48, Math.min(200, (W * 0.78) / s.width));
    s.x0 = (W - s.width * s.fs) / 2;
    s.y0 = Math.max(20, (H - s.fs * 1.1) / 2 - 20);
  }

  function place(s) {
    s.els.forEach((el, i) => { el.style.left = `${s.x0 + s.pos[i] * s.fs}px`; el.style.top = `${s.y0}px`; el.style.fontSize = `${s.fs}px`; });
    readout(s);
  }

  // Valeur de crénage des deux paires de la lettre active, en millièmes de cadratin
  function readout(s) {
    if (!s.read) return;
    const v = (i) => { const n = units((s.pos[i] - s.pos[i - 1]) - (s.flat[i] - s.flat[i - 1])); return `<span>${s.letters[i - 1]}|${s.letters[i]} <b>${n > 0 ? "+" : ""}${n}</b></span>`; };
    s.read.innerHTML = `<i>Crénage</i>${v(s.sel)}${v(s.sel + 1)}`;
  }

  function select(s, i) {
    s.sel = i;
    s.els.forEach((el, j) => el.classList.toggle("kc-selected", j === i));
    readout(s);
  }

  const movable = (s, i) => i > 0 && i < s.letters.length - 1;

  Oeil.play({
    id: "kern-clinic", name: "Kern Clinic",
    howto: [
      { icon: "drag_pan", text: "Attrape une lettre et glisse-la à gauche ou à droite. La première et la dernière lettre restent fixes." },
      { icon: "visibility", text: "Juge la surface de blanc entre les lettres, pas leur distance. Plisse les yeux ou retourne le mot." },
      { icon: "tune", text: "Le champ Crénage affiche la valeur en millièmes de cadratin, comme dans InDesign : une valeur négative rapproche les lettres." },
      { icon: "keyboard", text: "Tab pour changer de lettre, ← → pour l'ajuster (Maj pour aller plus vite), Entrée pour valider." },
    ],
    brief: "Glisse les lettres pour que les blancs entre elles paraissent égaux.",
    hint: { label: "Retourner le mot", run(s) { s.flip = !s.flip; s.wrap.style.transform = s.flip ? "rotate(180deg)" : ""; } },

    async setup(round) {
      const w = words[round % words.length];
      const t = await measure(w.word);
      const broken = t.xs.map((x, i) => (i === 0 || i === t.letters.length - 1 ? x : x + ((25 + Math.random() * 45) * (Math.random() < 0.5 ? -1 : 1)) / 1000));
      return { ...t, tip: w.tip, word: w.word, broken, pos: [...broken], sel: 1, flip: false };
    },

    mount(board, s, api) {
      geometry(board, s);
      const wrap = api.h("div", "kc-wrap");
      wrap.style.cssText = "position:absolute;inset:0;transition:transform .4s";
      s.wrap = wrap;
      s.els = s.letters.map((ch, i) => {
        const el = api.h("span", "kc-letter" + (movable(s, i) ? " kc-movable grab" : " kc-fixed"), ch);
        if (movable(s, i)) {
          el.tabIndex = 0;
          el.setAttribute("role", "slider");
          el.setAttribute("aria-label", `Lettre ${ch}`);
          el.addEventListener("focus", () => select(s, i));
          api.drag(el, {
            start: () => { select(s, i); return { p: s.pos[i] }; },
            move: (dx, dy, ev, c) => {
              const dir = s.flip ? -1 : 1;
              s.pos[i] = api.clamp(c.p + (dir * dx) / s.fs, s.broken[i] - 0.6, s.broken[i] + 0.6);
              place(s);
            },
          });
        }
        wrap.appendChild(el);
        return el;
      });
      board.appendChild(wrap);
      s.read = api.h("div", "kc-read");
      board.appendChild(s.read);
      place(s);
      select(s, 1);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les lettres</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>← → ajuste la lettre rose</span>`;
    },

    keys(e, s) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      const step = (e.shiftKey ? 20 : 5) / 1000 * (e.key === "ArrowRight" ? 1 : -1) * (s.flip ? -1 : 1);
      s.pos[s.sel] = Oeil.clamp(s.pos[s.sel] + step, s.broken[s.sel] - 0.6, s.broken[s.sel] + 0.6);
      place(s);
    },

    resize(board, s) { geometry(board, s); place(s); if (s.ghosts) s.ghosts.forEach((g, i) => { g.style.left = `${s.x0 + s.xs[i] * s.fs}px`; g.style.top = `${s.y0}px`; g.style.fontSize = `${s.fs}px`; }); },

    evaluate(s) {
      const n = s.letters.length;
      const errs = [];
      for (let i = 1; i < n - 1; i++) errs.push(units(s.pos[i] - s.xs[i]));
      const score = errs.reduce((a, e) => a + (Math.abs(e) <= TOL ? 100 : Math.max(0, 100 - (Math.abs(e) - TOL))), 0) / errs.length;
      const mean = errs.reduce((a, e) => a + Math.abs(e), 0) / errs.length;
      const pairs = [];
      for (let i = 1; i < n; i++) pairs.push({ pair: s.letters[i - 1] + s.letters[i], diff: units((s.pos[i] - s.pos[i - 1]) - (s.xs[i] - s.xs[i - 1])), i });
      s.pairs = pairs;
      const worst = pairs.reduce((a, p) => (Math.abs(p.diff) > Math.abs(a.diff) ? p : a));
      return {
        score,
        metrics: [
          { label: "Écart moyen par lettre", value: `± ${Math.round(mean)} unités`, good: mean <= 10 },
          { label: "Paire la plus éloignée", value: Math.abs(worst.diff) <= 8 ? "Aucune" : `${worst.pair}, ${worst.diff > 0 ? "trop lâche" : "trop serrée"} de ${Math.abs(worst.diff)}`, good: Math.abs(worst.diff) <= 8 },
        ],
        principle: s.tip,
      };
    },

    reveal(board, s, r, api) {
      s.flip = false; s.wrap.style.transform = ""; s.read.remove();
      s.els.forEach((el) => { el.classList.remove("kc-selected", "grab"); el.classList.add("kc-over"); });
      s.ghosts = s.letters.map((ch, i) => {
        const g = api.h("span", "kc-letter kc-ghost", ch);
        g.style.left = `${s.x0 + s.xs[i] * s.fs}px`; g.style.top = `${s.y0}px`; g.style.fontSize = `${s.fs}px`;
        s.wrap.prepend(g);
        return g;
      });
      s.pairs.forEach((p) => {
        const x = s.x0 + ((s.pos[p.i - 1] + s.pos[p.i]) / 2 + 0.25) * s.fs;
        const tag = api.h("span", Math.abs(p.diff) <= 8 ? "tag-you" : "tag-ref", Math.abs(p.diff) <= 8 ? "juste" : `${p.diff > 0 ? "+" : ""}${p.diff}`);
        tag.style.left = `${x}px`; tag.style.top = `${s.y0 + s.fs * 1.2}px`; tag.style.transform = "translateX(-50%)";
        s.wrap.appendChild(tag);
      });
      const legend = api.h("p", "absolute left-4 bottom-4 text-[13px] flex gap-4", `<span><b class="text-signal">Rose</b> : le crénage de la fonte</span><span><b>Noir</b> : ta version</span>`);
      board.appendChild(legend);
    },
  });
})();
