// Glyph Memory — observe une lettre trois secondes, puis retrouve-la parmi des variantes d'autres polices.
(function () {
  const FONTS = [
    { css: "'Inter Tight'", name: "Inter Tight" }, { css: "Newsreader", name: "Newsreader" }, { css: "Georgia", name: "Georgia" },
    { css: "'Times New Roman'", name: "Times" }, { css: "Arial", name: "Arial" }, { css: "Verdana", name: "Verdana" },
    { css: "'Trebuchet MS'", name: "Trebuchet" }, { css: "'Courier New'", name: "Courier" },
  ];
  const glyph = (ch, f, size = 120) => `<span class="gm-glyph" style="font-family:${f.css};font-size:${size}px">${ch}</span>`;
  const make = (ch, target, others, explain) => {
    const t = FONTS.find((f) => f.name === target);
    return {
      memo: { html: glyph(ch, t, 220), seconds: 3 },
      prompt: "Laquelle as-tu vue ?",
      options: [{ html: glyph(ch, t), correct: true, label: t.name }, ...others.map((n) => ({ html: glyph(ch, FONTS.find((f) => f.name === n)), label: n }))],
      explain,
    };
  };
  Oeil.kits.choice({
    id: "glyph-memory", name: "Glyph Memory", memoBrief: "Observe cette lettre : elle va disparaître.",
    howto: [
      { icon: "visibility", text: "Une lettre s'affiche trois secondes. Retiens sa forme précise : ses terminaisons, son contraste, son ouverture." },
      { icon: "touch_app", text: "Choisis ensuite la même parmi quatre variantes dessinées dans d'autres polices." },
      { icon: "lightbulb", text: "Astuce : concentre-toi sur un seul détail distinctif (la queue du g, la jambe du R)." },
    ],
    items: [
      make("g", "Newsreader", ["Georgia", "Times", "Arial"], "Le g à deux étages (comme une paire de lunettes) est typique des romains. Newsreader a une oreille fine et une boucle basse plus ouverte que Georgia ou Times."),
      make("R", "Inter Tight", ["Arial", "Verdana", "Trebuchet"], "La jambe du R est la signature d'une grotesque : droite chez Inter, courbe chez Arial, très large chez Verdana."),
      make("a", "Georgia", ["Newsreader", "Times", "Courier"], "Le a de Georgia a un œil très grand et une panse arrondie, pensés pour l'écran. Times est plus serré, Newsreader plus contrasté."),
      make("Q", "Trebuchet", ["Inter Tight", "Arial", "Verdana"], "La queue du Q varie énormément d'une police à l'autre : c'est l'un des meilleurs indices pour reconnaître une famille."),
      make("&", "Times", ["Georgia", "Newsreader", "Inter Tight"], "L'esperluette est souvent la lettre la plus expressive d'une police : chaque dessinateur la réinvente."),
    ],
  });
})();
