// Motion Order — dans quel ordre faire apparaître les éléments d'un écran ?
(function () {
  const c = (icon, label) => `<span class="material-symbols-outlined mo-icon">${icon}</span><span class="fo-name">${label}</span>`;
  Oeil.kits.order({
    id: "motion-order", name: "Motion Order", from: "Apparaît en premier", to: "En dernier",
    howto: [
      { icon: "animation", text: "Un écran s'affiche avec une animation d'entrée : ses éléments apparaissent les uns après les autres." },
      { icon: "drag_pan", text: "Range-les dans l'ordre où ils doivent apparaître, du premier au dernier." },
      { icon: "lightbulb", text: "Le mouvement guide le regard : ce qui arrive en premier est lu en premier." },
    ],
    items: [
      { prompt: "Page d'accueil : dans quel ordre faire entrer les éléments ?",
        cards: [c("title", "Titre principal"), c("subject", "Phrase d'accroche"), c("image", "Grande image"), c("smart_button", "Bouton d'action"), c("more_horiz", "Logos partenaires")],
        explain: "On anime dans l'ordre de lecture et d'importance : le titre porte le message, l'accroche le précise, l'image l'illustre, puis l'action. Les éléments secondaires arrivent en dernier, ou sans animation." },
      { prompt: "Fenêtre de confirmation de paiement : quel ordre ?",
        cards: [c("check_circle", "Coche de succès"), c("title", "« Paiement accepté »"), c("receipt_long", "Récapitulatif"), c("smart_button", "Bouton « Voir ma commande »")],
        explain: "Le signe de réussite arrive d'abord pour rassurer en un coup d'œil, puis le texte qui le confirme, le détail et enfin l'action suivante." },
      { prompt: "Liste de résultats de recherche : quel ordre ?",
        cards: [c("tune", "Barre de filtres"), c("filter_1", "Premier résultat"), c("filter_2", "Deuxième résultat"), c("filter_3", "Troisième résultat"), c("expand_more", "Bouton « Plus de résultats »")],
        explain: "Dans une liste, un léger décalage entre les éléments (40 à 80 ms) donne une sensation de fluidité, en suivant l'ordre de lecture. Au-delà de 8 à 10 éléments, on n'anime plus les suivants." },
      { prompt: "Carte de profil qui s'ouvre : quel ordre ?",
        cards: [c("crop_square", "Le fond de la carte"), c("account_circle", "Photo"), c("badge", "Nom et fonction"), c("bar_chart", "Statistiques"), c("smart_button", "Bouton « Suivre »")],
        explain: "Le conteneur apparaît d'abord, pour que le contenu ait une place où arriver, puis le contenu dans l'ordre d'importance. Un contenu qui apparaît avant son conteneur paraît flotter." },
    ],
  });
})();
