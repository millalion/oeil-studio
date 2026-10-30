// Micro Typo — chaque texte est composé au hasard avec de vraies fautes de typographie française à repérer.
(function () {
  // Une faute : la forme fautive, la forme juste et la règle. Le texte alterne mots normaux et emplacements à risque.
  const F = {
    colon: (w) => ({ bad: `${w}:`, good: `${w} :`, why: "Le deux-points prend une espace insécable avant lui." }),
    q: (w) => ({ bad: `${w}?`, good: `${w} ?`, why: "Le point d'interrogation prend une espace insécable avant lui." }),
    ex: (w) => ({ bad: `${w}!`, good: `${w} !`, why: "Le point d'exclamation prend une espace insécable avant lui." }),
    dots: (w) => ({ bad: `${w}...`, good: `${w}…`, why: "Les points de suspension sont un seul signe : … et non trois points." }),
    quote: (w) => ({ bad: `"${w}"`, good: `« ${w} »`, why: "En français, on utilise les guillemets « » avec des espaces insécables." }),
    apos: (a, b) => ({ bad: `${a}'${b}`, good: `${a}’${b}`, why: "L'apostrophe typographique est courbe : ’ et non '." }),
    acc: (bad, good) => ({ bad, good, why: "Les capitales gardent leurs accents : École, À, Élise." }),
    lig: (bad, good) => ({ bad, good, why: "Le o et le e s'écrivent liés dans œil, cœur, œuvre." }),
    unit: (bad, good) => ({ bad, good, why: "Un nombre et son unité sont séparés par une espace insécable : 12 km, 20 €." }),
    dash: () => ({ bad: "-", good: "—", why: "Un tiret long — sépare une incise, le trait d'union sert à relier des mots." }),
  };
  const OPEN = [
    ["Ce", "matin", "à", "l'atelier", F.colon("programme"), "lecture", "et", "maquette."],
    ["La", "revue", "paraît", "demain,", F.dash(), "enfin,", "après", "des", "mois", "d'attente."],
    ["Elle", "a", "répondu", F.quote("bonjour"), "sans", "lever", "les", "yeux", "de", "son", "écran."],
    [F.acc("Ecole", "École"), "de", "dessin", "ouverte", "le", "samedi,", "visites", "sur", "rendez-vous."],
    ["Le", "dossier", "pèse", F.unit("12Mo", "12 Mo"), "et", "part", "ce", "soir", "chez", "l'imprimeur."],
    ["Tu", "viens", "voir", "l'exposition", F.q("demain"), "Elle", "ferme", "à", F.unit("18h", "18 h") , "pile."],
    ["Une", F.lig("oeuvre", "œuvre"), "immense,", "peinte", "en", "trois", "ans", "à", F.acc("Evian", "Évian"), "."],
    ["Il", "hésite,", "recommence,", F.dots("attend"), "puis", "envoie", "la", "version", "finale."],
    [F.apos("L", "affiche"), "coûte", F.unit("20€", "20 €"), "et", "se", "vend", "à", "l'entrée", "du", "musée."],
    ["Quel", "beau", F.ex("travail"), "Le", F.lig("coeur", "cœur"), "du", "projet", "se", "voit", "tout", "de", "suite."],
    [F.apos("D", "abord"), "le", "fond,", "ensuite", "la", "forme", F.colon("simple"), "une", "règle", "à", "garder."],
    ["Le", "titre", "dit", F.quote("regarde"), "et", "tout", "le", "reste", "se", "tait."],
  ];
  const order = Oeil.fresh("micro-typo", OPEN);
  Oeil.play({
    id: "micro-typo", name: "Micro Typo",
    howto: [
      { icon: "spellcheck", text: "Un texte contient des fautes de typographie française : espaces, guillemets, apostrophes, accents." },
      { icon: "touch_app", text: "Touche chaque mot ou signe fautif. Touche-le encore pour annuler." },
      { icon: "lightbulb", text: "Attention : une fausse alerte fait perdre des points." },
    ],
    brief: (s) => `Trouve ${s.total > 1 ? `les ${s.total} fautes` : "la faute"} de typographie.`,
    setup(round) {
      const lines = [0, 1, 2].map((i) => order[(round * 3 + i) % order.length]);
      const tokens = lines.map((l) => l.map((t) => {
        if (typeof t === "string") return { text: t.replace(/'/g, "’") };
        const wrong = Math.random() < 0.72;
        return wrong ? { text: t.bad, fix: t.good, why: t.why } : { text: t.good };
      }));
      // Toujours au moins deux fautes
      const spots = lines.flat().filter((x) => typeof x !== "string"), all = tokens.flat();
      for (const t of spots) { if (all.filter((x) => x.fix).length >= 2) break; const tk = all.find((x) => x.text === t.good && !x.fix); if (tk) { tk.text = t.bad; tk.fix = t.good; tk.why = t.why; } }
      return { tokens, total: tokens.flat().filter((t) => t.fix).length };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "mt-wrap");
      s.btns = [];
      s.tokens.forEach((line) => {
        const p = api.h("p", "mt-line");
        line.forEach((t, i) => {
          const b = api.h("button", "mt-word", t.text);
          b.type = "button"; b.setAttribute("aria-pressed", "false");
          b.addEventListener("click", () => { if (api.phase !== "play") return; b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true")); });
          s.btns.push({ b, t });
          p.append(b);
          if (i < line.length - 1) p.append(" ");
        });
        wrap.append(p);
      });
      board.append(wrap);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Touche les mots ou signes fautifs</span>`;
    },
    evaluate(s) {
      const on = s.btns.filter(({ b }) => b.getAttribute("aria-pressed") === "true");
      const found = on.filter(({ t }) => t.fix).length, wrong = on.length - found;
      const rules = [...new Set(s.btns.filter(({ t }) => t.why).map(({ t }) => t.why))];
      return {
        score: Math.max(0, (found / s.total) * 100 - wrong * 15),
        metrics: [{ label: "Fautes trouvées", value: `${found} sur ${s.total}`, good: found === s.total }, { label: "Fausses alertes", value: `${wrong}`, good: wrong === 0 }],
        principle: rules.join(" "),
      };
    },
    reveal(board, s) {
      s.btns.forEach(({ b, t }) => {
        const on = b.getAttribute("aria-pressed") === "true";
        b.disabled = true;
        if (t.fix) { b.textContent = t.fix; b.classList.add(on ? "mt-found" : "mt-missed"); }
        else if (on) b.classList.add("mt-false");
      });
    },
  });
})();
