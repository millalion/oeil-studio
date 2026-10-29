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
      { icon: "drag_pan", text: "Glisse chaque taille sur un niveau (ou touche une taille, puis un niveau). L'aperçu se met à jour." },
      { icon: "check", text: "Plusieurs réponses sont justes : les tailles doivent descendre du titre à la légende, avec un vrai écart entre deux niveaux." },
      { icon: "lightbulb", text: "Une échelle se construit par un rapport constant (par exemple ×1,25) : les écarts grandissent avec la taille." },
    ],
    // Plusieurs réponses sont justes : il suffit que les tailles descendent du titre à la légende,
    // avec des marches franches (au moins 10 % d'écart entre deux niveaux voisins).
    evaluate(s) {
      const roles = Object.keys(TEXT);
      const size = (role) => { const id = Object.keys(s.map).find((k) => s.map[k] === role); return id ? parseInt(s.it.tokens.find((t) => t.id === id).html, 10) : null; };
      const sizes = roles.map(size);
      const filled = sizes.filter((x) => x != null).length;
      let good = 0, flat = 0, wrong = 0;
      for (let i = 0; i < roles.length - 1; i++) {
        const a = sizes[i], b = sizes[i + 1];
        if (a == null || b == null) continue;
        if (a <= b) wrong++; else if (a / b < 1.1) flat++; else good++;
      }
      const score = (good + flat * 0.5) / (roles.length - 1) * 100 * (filled / roles.length);
      return {
        score,
        metrics: [
          { label: "Niveaux remplis", value: `${filled} sur ${roles.length}`, good: filled === roles.length },
          { label: "Marches dans le bon sens", value: `${good + flat} sur ${roles.length - 1}`, good: wrong === 0 && filled === roles.length },
          ...(flat ? [{ label: "Marches trop faibles (moins de 10 %)", value: `${flat}`, good: false }] : []),
        ],
        principle: s.it.explain,
      };
    },
    items: [
      scale([48, 30, 20, 16, 13], "Une échelle modulaire multiplie chaque taille par le même rapport (ici environ 1,5 puis 1,25). La hiérarchie se lit d'un coup d'œil, et les tailles intermédiaires inventées disparaissent.", "Attribue les tailles de l'échelle aux cinq niveaux de texte"),
      scale([40, 28, 20, 16, 12, 18], "Une taille de trop (18 px) se glisse souvent entre le corps et le chapô : trop proche des deux, elle brouille la hiérarchie. Une bonne échelle garde des marches franches.", "Attribue les tailles aux niveaux. Attention, une taille est en trop"),
      scale([64, 32, 22, 17, 13], "Un titre très grand (64 px) supporte un saut important vers le sous-titre : le contraste de taille crée l'entrée de page, le reste de l'échelle reste serré.", "Attribue les tailles de cette échelle contrastée"),
      scale([36, 24, 18, 15, 12, 14], "Pour un texte d'interface dense, l'échelle est plus resserrée. 14 et 15 px côte à côte sont indiscernables : c'est l'intrus.", "Échelle d'interface : attribue les tailles (une est en trop)"),
    ],
  });
})();
