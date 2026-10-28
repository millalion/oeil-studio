// Semantic Colors — attribue les couleurs aux états : erreur, succès, alerte, information.
(function () {
  const alert = (title, text, icon) => (t) => `<div class="sc-alert" style="${t ? `border-color:${t.color};background:${t.color}1A` : ""}"><span class="material-symbols-outlined" style="${t ? `color:${t.color}` : "color:#8A8983"}">${icon}</span><span><b>${title}</b><small>${text}</small></span></div>`;
  const tok = (id, color, slot, name) => ({ id, color, slot, html: `<span class="sc-dot" style="background:${color}"></span>${name}` });
  const SLOTS = [
    { id: "error", label: "Erreur", render: alert("Paiement refusé", "Vérifie le numéro de carte.", "error") },
    { id: "success", label: "Succès", render: alert("Projet enregistré", "Toutes les modifications sont sauvegardées.", "check_circle") },
    { id: "warning", label: "Alerte", render: alert("Espace presque plein", "Il te reste 200 Mo.", "warning") },
    { id: "info", label: "Information", render: alert("Nouvelle version", "Découvre les nouveaux jeux.", "info") },
  ];
  const item = (colors, prompt, explain) => ({ prompt, layout: "grid", slots: SLOTS, tokens: colors.map(([id, c, s, n]) => tok(id, c, s, n)), explain });
  Oeil.kits.assign({
    id: "semantic-colors", name: "Semantic Colors",
    howto: [
      { icon: "palette", text: "Quatre messages d'interface, quatre états. Les couleurs ne sont pas encore attribuées." },
      { icon: "drag_pan", text: "Glisse chaque couleur sur l'état qu'elle doit signaler. L'aperçu se colore." },
      { icon: "lightbulb", text: "Une couleur est en trop à certaines manches. Et n'oublie pas : la couleur ne doit jamais être le seul signal, d'où les icônes." },
    ],
    items: [
      item([["r", "#C4222B", "error", "Rouge"], ["g", "#1E7F4F", "success", "Vert"], ["o", "#C77700", "warning", "Ambre"], ["b", "#1F5FBF", "info", "Bleu"]], "Attribue les quatre couleurs aux quatre états", "Rouge pour l'erreur, vert pour le succès, ambre pour l'alerte, bleu pour l'information : ces conventions sont si ancrées qu'aller contre elles crée des contresens. Les icônes doublent la couleur pour les personnes qui la perçoivent mal."),
      item([["r", "#C4222B", "error", "Rouge"], ["g", "#1E7F4F", "success", "Vert"], ["o", "#C77700", "warning", "Ambre"], ["b", "#1F5FBF", "info", "Bleu"], ["p", "#F0447A", null, "Rose (marque)"]], "Attribue les couleurs aux états (une couleur est en trop)", "La couleur de marque ne sert pas d'état : si le rose signale à la fois « clique ici » et « erreur », l'utilisateur ne sait plus ce qu'il voit. Les couleurs sémantiques restent à part."),
      item([["r", "#B3261E", "error", "Rouge foncé"], ["g", "#386A20", "success", "Vert olive"], ["o", "#B26B00", "warning", "Ocre"], ["b", "#0B57D0", "info", "Bleu roi"], ["y", "#F2D74E", null, "Jaune clair"]], "Attribue les couleurs aux états (une couleur est en trop)", "Un jaune clair ne passe pas comme couleur de texte ou d'icône sur fond blanc : contraste trop faible. Pour l'alerte, on prend un ocre ou un ambre assez sombre."),
    ],
  });
})();
