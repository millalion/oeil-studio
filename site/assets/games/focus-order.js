// Focus Order — reconstruis l'ordre logique de tabulation d'un écran.
(function () {
  const chip = (label, kind = "field") => `<span class="fo-kind fo-${kind}"></span><span class="fo-name">${label}</span>`;
  const layout = (cells) => `<div class="fo-layout">${cells.map(([label, area, kind]) => `<span class="fo-cell fo-${kind}" style="grid-area:${area}">${label}</span>`).join("")}</div>`;
  Oeil.kits.order({
    id: "focus-order", name: "Focus Order", from: "Premier Tab", to: "Dernier Tab",
    howto: [
      { icon: "keyboard_tab", text: "En haut, un écran. En bas, ses éléments interactifs, dans le désordre." },
      { icon: "drag_pan", text: "Range-les dans l'ordre où la touche Tab devrait les parcourir." },
      { icon: "lightbulb", text: "L'ordre suit la lecture (de haut en bas, de gauche à droite) et la logique de la tâche." },
    ],
    items: [
      { prompt: "Dans quel ordre la touche Tab doit-elle parcourir ce formulaire ?",
        context: layout([["Prénom", "1 / 1 / 2 / 2", "field"], ["Nom", "1 / 2 / 2 / 3", "field"], ["E-mail", "2 / 1 / 3 / 3", "field"], ["Annuler", "3 / 1 / 4 / 2", "ghost"], ["Envoyer", "3 / 2 / 4 / 3", "btn"]]),
        cards: [chip("Prénom"), chip("Nom"), chip("E-mail"), chip("Annuler", "ghost"), chip("Envoyer", "btn")],
        explain: "L'ordre de tabulation suit l'ordre visuel de lecture : ligne par ligne, de gauche à droite. Si la mise en page change selon l'écran, c'est l'ordre du code qu'il faut corriger, pas un tabindex." },
      { prompt: "Dans quel ordre la touche Tab doit-elle parcourir cet en-tête ?",
        context: layout([["Aller au contenu", "1 / 1 / 2 / 2", "link"], ["Logo", "2 / 1 / 3 / 2", "link"], ["Jeux", "2 / 2 / 3 / 3", "link"], ["Recherche", "2 / 3 / 3 / 4", "field"], ["Connexion", "2 / 4 / 3 / 5", "btn"]]),
        cards: [chip("Aller au contenu", "link"), chip("Logo (accueil)", "link"), chip("Jeux", "link"), chip("Recherche"), chip("Connexion", "btn")],
        explain: "Le lien « Aller au contenu » est le tout premier arrêt : il permet de sauter la navigation répétée sur chaque page. Ensuite, l'en-tête se parcourt de gauche à droite." },
      { prompt: "Dans quel ordre parcourir cette fenêtre de confirmation ?",
        context: layout([["Fermer ×", "1 / 3 / 2 / 4", "ghost"], ["Supprimer « Affiche » ?", "1 / 1 / 2 / 3", "text"], ["Annuler", "3 / 2 / 4 / 3", "ghost"], ["Supprimer", "3 / 3 / 4 / 4", "btn"]]),
        cards: [chip("Titre de la fenêtre", "text"), chip("Fermer ×", "ghost"), chip("Annuler", "ghost"), chip("Supprimer", "btn")],
        explain: "À l'ouverture d'une fenêtre, le focus va sur son titre (ou son premier élément) pour que la personne sache où elle est, puis suit l'ordre de lecture. Sur une action destructive, on évite de placer le focus directement sur « Supprimer »." },
      { prompt: "Dans quel ordre parcourir cette carte produit ?",
        context: layout([["Image (lien)", "1 / 1 / 3 / 2", "link"], ["Titre (lien)", "1 / 2 / 2 / 3", "link"], ["♡ Favori", "1 / 3 / 2 / 4", "ghost"], ["Taille", "2 / 2 / 3 / 3", "field"], ["Ajouter au panier", "2 / 3 / 3 / 4", "btn"]]),
        cards: [chip("Titre (lien)", "link"), chip("Favori", "ghost"), chip("Taille"), chip("Ajouter au panier", "btn")],
        explain: "Quand une image et un titre mènent au même endroit, un seul des deux reçoit le focus (ici le titre) : sinon on tabule deux fois pour la même destination." },
    ],
  });
})();
