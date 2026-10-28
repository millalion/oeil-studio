// Type Scale — attribue les tailles d'une échelle typographique aux bons niveaux de texte.
(function () {
  const TEXT = { "Titre": "Le regard s'entraîne", "Sous-titre": "Cinq minutes par jour", "Chapô": "Des exercices courts pour sentir l'écart avant de le mesurer.", "Corps": "La correction se pose sur ta version : en pixels, en degrés ou en unités de crénage.", "Légende": "Photo : atelier de typographie, 2025" };
  const scale = (sizes, explain, prompt) => ({
    prompt, layout: "stack", explain,
    slots: Object.keys(TEXT).map((role, i) => ({ id: role, label: role, render: (t) => `<span class="ts-sample" style="font-size:${t ? parseInt(t.html, 10) : 15}px;${t ? "" : "color:#8A8983"}">${TEXT[role]}</span>` })),
    tokens: sizes.map((s, i) => ({ id: `s${s}`, html: `${s} px`, slot: Object.keys(TEXT)[i] || null })),
  });
  Oeil.kits.assign({
    id: "type-scale", name: "Type Scale",
    howto: [
      { icon: "format_size", text: "Un texte a plusieurs niveaux : titre, sous-titre, chapô, corps, légende." },
      { icon: "drag_pan", text: "Glisse chaque taille sur le niveau qui lui correspond. L'aperçu se met à jour." },
      { icon: "lightbulb", text: "Une échelle se construit par un rapport constant (par exemple ×1,25) : les écarts grandissent avec la taille." },
    ],
    items: [
      scale([48, 30, 20, 16, 13], "Une échelle modulaire multiplie chaque taille par le même rapport (ici environ 1,5 puis 1,25). La hiérarchie se lit d'un coup d'œil, et les tailles intermédiaires inventées disparaissent.", "Attribue les tailles de l'échelle aux cinq niveaux de texte"),
      scale([40, 28, 20, 16, 12, 18], "Une taille de trop (18 px) se glisse souvent entre le corps et le chapô : trop proche des deux, elle brouille la hiérarchie. Une bonne échelle garde des marches franches.", "Attribue les tailles aux niveaux. Attention, une taille est en trop"),
      scale([64, 32, 22, 17, 13], "Un titre très grand (64 px) supporte un saut important vers le sous-titre : le contraste de taille crée l'entrée de page, le reste de l'échelle reste serré.", "Attribue les tailles de cette échelle contrastée"),
      scale([36, 24, 18, 15, 12, 14], "Pour un texte d'interface dense, l'échelle est plus resserrée. 14 et 15 px côte à côte sont indiscernables : c'est l'intrus.", "Échelle d'interface : attribue les tailles (une est en trop)"),
    ],
  });
})();
