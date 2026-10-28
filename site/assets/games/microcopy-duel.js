// Microcopy Duel — deux ou trois formulations pour le même moment : laquelle aide vraiment ?
(function () {
  const msg = (text, kind = "info") => `<div class="mc-msg mc-${kind}">${text}</div>`;
  Oeil.kits.choice({
    id: "microcopy-duel", name: "Microcopy Duel",
    howto: [
      { icon: "chat", text: "Chaque manche décrit une situation, puis propose plusieurs messages possibles." },
      { icon: "touch_app", text: "Choisis celui qui aide le plus la personne à comprendre et à agir." },
      { icon: "lightbulb", text: "Un bon message dit ce qui se passe, ce que ça change, et quoi faire ensuite." },
    ],
    items: [
      { prompt: "Le paiement a échoué. Quel message afficher ?", cols: 3, context: '<p class="kit-situation">Situation : la carte bancaire a été refusée par la banque.</p>', options: [
          { html: msg("Ta banque a refusé le paiement. Aucun montant n'a été prélevé. Essaie une autre carte ou contacte ta banque.", "error"), correct: true, why: "cause, conséquence, solution" },
          { html: msg("Erreur 402 : transaction refusée.", "error"), why: "un code technique, sans solution" },
          { html: msg("Oups ! Quelque chose s'est mal passé 😕", "error"), why: "sympathique mais vide" },
        ], explain: "Un message d'erreur répond à trois questions : que s'est-il passé, qu'est-ce que ça change pour moi (ici : rien n'a été prélevé, ça rassure), que puis-je faire maintenant." },
      { prompt: "Quel libellé pour le bouton qui supprime un projet ?", cols: 3, context: '<p class="kit-situation">Situation : fenêtre de confirmation avant de supprimer « Affiche Bauhaus ».</p>', options: [
          { html: `<span class="mc-btn mc-danger">Supprimer le projet</span>`, correct: true, why: "dit exactement ce qui va arriver" },
          { html: `<span class="mc-btn mc-danger">Oui</span>`, why: "« Oui » à quoi ? il faut relire la question" },
          { html: `<span class="mc-btn mc-danger">OK</span>`, why: "ne distingue pas confirmer et fermer" },
        ], explain: "Un bouton se lit souvent seul : il doit nommer l'action (verbe + objet). « Oui / Non » oblige à relire la question, et provoque des erreurs sur les actions irréversibles." },
      { prompt: "La liste de projets est vide. Quel message ?", cols: 3, context: '<p class="kit-situation">Situation : première connexion, aucun projet encore.</p>', options: [
          { html: msg("Aucun résultat."), why: "fait penser à une recherche ratée" },
          { html: msg("Tu n'as pas encore de projet. Crée le premier pour y ranger tes planches.<br/><b>Créer un projet</b>"), correct: true, why: "explique et propose la prochaine action" },
          { html: msg("Liste vide (0 élément)."), why: "description technique, aucune aide" },
        ], explain: "Un état vide est une occasion : dire pourquoi c'est vide et proposer l'action qui le remplira. C'est souvent le premier écran que voit un nouvel utilisateur." },
      { prompt: "L'enregistrement automatique a réussi. Quel retour ?", cols: 3, context: '<p class="kit-situation">Situation : le document vient d\'être enregistré en arrière-plan.</p>', options: [
          { html: msg("Enregistré il y a quelques secondes", "info"), correct: true, why: "discret, factuel, au bon endroit" },
          { html: msg("🎉 Bravo ! Ton document a été enregistré avec succès !", "success"), why: "disproportionné pour une action automatique" },
          { html: msg("Synchronisation terminée (code 200).", "info"), why: "jargon technique" },
        ], explain: "Le ton du retour doit être proportionné à l'action : une action automatique et fréquente mérite une confirmation discrète, pas une célébration." },
    ],
  });
})();
