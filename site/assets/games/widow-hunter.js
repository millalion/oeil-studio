// Widow Hunter — veuves, orphelines et coupures malheureuses dans des paragraphes composés ligne à ligne.
(function () {
  const L = (t, bad) => `<span class="wh-line" data-h="${bad ? "bad" : "ok"}"${bad ? ` data-why="${bad}"` : ""}>${t}</span>`;
  const col = (title, lines) => `<div class="wh-col">${title ? `<p class="wh-title">${title}</p>` : ""}${lines.join("")}</div>`;
  Oeil.kits.hunt({
    id: "widow-hunter", name: "Widow Hunter",
    howto: [
      { icon: "article", text: "Chaque ligne du texte se clique. Certaines posent un problème de composition." },
      { icon: "search", text: "Cherche : un mot seul en fin de paragraphe (veuve), une ligne isolée en haut de colonne (orpheline), une coupure qui sépare ce qui doit rester ensemble." },
      { icon: "touch_app", text: "Clique sur les lignes fautives, puis valide." },
    ],
    items: [
      { prompt: "Marque les lignes mal composées", html: `<div class="wh-page">${col("", [
          L("Le regard s'entraîne comme un muscle : à force"), L("de comparer, on finit par sentir l'écart avant de"), L("le mesurer, et la correction devient un réflexe"), L("plutôt qu'une hésitation devant l'écran de"), L("travail.", "veuve : un mot seul en fin de paragraphe"),
        ])}${col("", [L("Mme", "coupure : titre séparé du nom"), L("Dupont présentera son travail le 12"), L("octobre à 18 h, dans l'atelier de typographie.")])}</div>`,
        explain: "Une veuve (un mot seul en dernière ligne) laisse un trou dans le gris typographique. On la rattrape en ajustant l'approche du paragraphe ou en réécrivant légèrement. « Mme » et « Dupont » ne se séparent jamais : on utilise une espace insécable." },
      { prompt: "Marque les lignes mal composées", html: `<div class="wh-page">${col("Colonne 1", [
          L("La grille modulaire naît en Suisse dans les années"), L("cinquante. Elle organise la page en champs égaux,"), L("séparés par des gouttières constantes, et donne"), L("au texte comme à l'image une place prévisible."),
        ])}${col("Colonne 2", [L("dans la page.", "orpheline : fin de paragraphe isolée en haut de colonne"), `<span class="wh-gap"></span>`, L("Ses défenseurs y voient une méthode plus qu'un"), L("style : un moyen de décider vite et juste.")])}</div>`,
        explain: "Une orpheline est un bout de paragraphe qui se retrouve seul en haut de la colonne suivante. On déplace une ligne de plus dans la colonne, ou on ajuste l'interlignage du bloc entier." },
      { prompt: "Marque les coupures malheureuses", html: `<div class="wh-page">${col("", [
          L("Le trajet complet fait environ 12", "coupure : nombre séparé de son unité"), L("km et se parcourt en trois heures. Le départ"), L("se fait place de la Gare, à côté de l'arrêt du"), L("bus no", "coupure : abréviation séparée de son numéro"), L("27, juste avant la boulangerie."),
        ])}</div>`,
        explain: "Un nombre et son unité (12 km), une abréviation et son numéro (no 27), un prénom et un nom courts restent sur la même ligne. L'espace insécable est faite pour ça." },
      { prompt: "Marque les lignes mal composées", html: `<div class="wh-page">${col("", [
          L("Les césures trop nombreuses fatiguent la lec-"), L("ture : trois lignes de suite coupées par un tiret", ), L("forment une échelle visuelle dans la marge de droi-", "troisième césure consécutive"), L("te et donnent une impression de texte mal fini.", "fin de mot de deux lettres rejetée seule"),
        ])}</div>`,
        explain: "On limite les césures à deux lignes consécutives, et on n'isole jamais deux lettres en début de ligne (« te »). Mieux vaut une ligne un peu plus lâche qu'une échelle de tirets." },
    ],
  });
})();
