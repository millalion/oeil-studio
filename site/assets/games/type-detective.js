// Type Detective — des lettres d'une autre police, graisse ou fausse italique se sont glissées dans la ligne.
(function () {
  const row = (letters, base, bad, why, size = 92) => `<div class="tdx-row" style="font-size:${size}px">${[...letters].map((ch, i) => {
    const b = bad[i];
    return `<span class="tdx-glyph" data-h="${b ? "bad" : "ok"}"${b ? ` data-why="${why}"` : ""} style="${b || base}">${ch}</span>`;
  }).join("")}</div>`;
  const INTER = "font-family:'Inter Tight';font-weight:500";
  const NEWS = "font-family:Newsreader;font-weight:400";
  // Un mot et des intruses tirés au sort
  const WORDS = ["Ragesty", "Bonheur", "Grafique", "Hamburg", "Agenda", "Rythmes", "Gabarit", "Quartet", "Galerie", "Marque"];
  const TRAPS = [
    [INTER, "font-family:Arial;font-weight:400", "Arial", "Inter Tight", "Arial et Inter se ressemblent de loin, mais leurs terminaisons et leur a diffèrent. Deux grotesques proches dans une ligne la font vibrer."],
    [NEWS, "font-family:Georgia", "Georgia", "Newsreader", "Georgia a un œil plus grand et des empattements plus épais : la différence de hauteur d'x saute aux yeux une fois repérée."],
    [INTER, "font-family:'Inter Tight';font-weight:700", "une autre graisse", "Inter Tight Medium", "Une graisse différente change le gris du mot : le regard accroche la lettre plus noire, même sans savoir pourquoi."],
    [NEWS, "font-family:'Times New Roman',serif", "Times", "Newsreader", "Times est plus étroit et plus contrasté : ses lettres paraissent serrées à côté d'une serif plus ouverte."],
    [INTER, "font-family:'Inter Tight';font-weight:500;display:inline-block;transform:skewX(-11deg)", "une fausse italique", "Inter Tight", "Une fausse italique penche la lettre sans la redessiner : les courbes se déforment et les traits perdent leur régularité."],
  ];
  function randomRow() {
    const word = Oeil.pick(WORDS), [base, bad, name, ref, explain] = Oeil.pick(TRAPS);
    const spots = Oeil.shuffle([...word].map((_, i) => i)).slice(0, 2);
    return { prompt: `Repère les lettres qui ne sont pas en ${ref}`, html: row(word, base, Object.fromEntries(spots.map((i) => [i, bad])), name), explain };
  }
  Oeil.kits.hunt({
    id: "type-detective", name: "Type Detective",
    howto: [
      { icon: "search", text: "Toutes les lettres devraient venir de la même police, à la même graisse." },
      { icon: "touch_app", text: "Clique sur chaque lettre intruse. Reclique pour annuler." },
      { icon: "visibility", text: "Regarde les détails : terminaisons, ouverture des courbes, angle du R ou du a, épaisseur des traits." },
    ],
    items: [
      ...Array.from({ length: 14 }, randomRow),
      { prompt: "Repère les lettres qui ne sont pas en Inter Tight", html: row("Ragesty", INTER, { 1: "font-family:Arial;font-weight:400", 4: "font-family:Arial;font-weight:400" }, "Arial"),
        explain: "Arial et Inter se ressemblent de loin, mais le R d'Arial a une jambe courbe et le a des terminaisons coupées en biais. Mélanger deux grotesques proches donne une ligne qui « vibre »." },
      { prompt: "Repère les lettres qui ne sont pas en Newsreader", html: row("agendaR", NEWS, { 0: "font-family:Georgia", 5: "font-family:Georgia" }, "Georgia"),
        explain: "Georgia a un œil plus grand et des empattements plus épais que Newsreader : dans un même mot, la différence de hauteur d'x saute aux yeux une fois repérée." },
      { prompt: "Repère les lettres plus grasses que les autres", html: row("Contrast", "font-family:'Inter Tight';font-weight:400", { 2: "font-family:'Inter Tight';font-weight:520", 6: "font-family:'Inter Tight';font-weight:520" }, "graisse 520 au lieu de 400"),
        explain: "Un écart de graisse de 100 à 120 unités suffit à créer une tache. C'est l'erreur typique d'un texte collé depuis un autre document." },
      { prompt: "Repère les fausses italiques (lettres penchées par le logiciel)", html: row("italique", "font-family:Newsreader;font-style:italic", { 1: "font-family:Newsreader;font-style:normal;display:inline-block;transform:skewX(-12deg)", 5: "font-family:Newsreader;font-style:normal;display:inline-block;transform:skewX(-12deg)" }, "romain penché"),
        explain: "Une vraie italique est un dessin à part : le a passe à un seul étage, les courbes changent. Pencher le romain (fausse italique) déforme les courbes et l'œil le sent." },
      { prompt: "Repère les chiffres qui ne sont pas de la même police", html: row("2025 €47", INTER, { 1: "font-family:'Courier New';font-weight:400", 6: "font-family:Verdana;font-weight:400" }, "police différente", 80),
        explain: "Dans un tableau de prix, un chiffre d'une autre police se repère à sa largeur : les chiffres tabulaires d'une même famille ont tous la même chasse." },
    ],
  });
})();
