// Keyboard Quest — repère ce qui bloque quelqu'un qui navigue au clavier (Tab, Entrée, Échap).
// Chaque carte montre l'élément et ce qui se passe quand on le parcourt au clavier, en clair.
(function () {
  const el = (html, behaviour, bad) => `<div class="kq-el" data-h="${bad ? "bad" : "ok"}"${bad ? ` data-why="${bad}"` : ""}><div class="kq-view">${html}</div><p class="kq-code"><span class="material-symbols-outlined" aria-hidden="true">keyboard</span>${behaviour}</p></div>`;
  Oeil.kits.hunt({
    id: "keyboard-quest", name: "Keyboard Quest",
    howto: [
      { icon: "keyboard", text: "Imagine que tu n'as pas de souris : Tab passe d'un élément au suivant, Entrée l'active, Échap ferme." },
      { icon: "visibility", text: "Sous chaque élément, tu lis ce qui se passe au clavier. Certains comportements bloquent la personne." },
      { icon: "touch_app", text: "Touche les cartes qui posent problème (le nombre à trouver est indiqué en haut), puis valide." },
    ],
    items: [
      { prompt: "Formulaire de paiement : repère les blocages", html: `<div class="kq-grid">
        ${el('<span class="kq-btn">Envoyer</span>', "Tab l'atteint, un cadre le montre, Entrée envoie.")}
        ${el('<span class="kq-btn">Supprimer</span>', "Tab saute par-dessus : impossible de l'atteindre.", "un élément cliquable doit être un vrai bouton pour recevoir le focus")}
        ${el('<a class="kq-link">Lire la suite</a>', "Tab l'atteint, Entrée ouvre l'article.")}
        ${el('<span class="kq-btn kq-focus-none">Payer</span>', "Tab l'atteint, mais rien ne montre qu'il est sélectionné.", "le focus est invisible : on ne sait plus où l'on est")}
        </div>`,
        explain: "Un élément cliquable doit être un vrai bouton ou un vrai lien : c'est ce qui le rend atteignable avec Tab et activable avec Entrée. Et le focus doit toujours rester visible." },
      { prompt: "Fenêtre « Partager » : repère les blocages", html: `<div class="kq-grid">
        ${el('<span class="kq-modal">Fenêtre « Partager »</span>', "À l'ouverture, Tab continue dans la page derrière la fenêtre.", "le focus doit entrer dans la fenêtre dès son ouverture")}
        ${el('<span class="kq-btn">Copier le lien</span>', "Tab l'atteint, Entrée copie le lien.")}
        ${el('<span class="kq-x">×</span>', "Tab ne s'arrête jamais sur la croix.", "la croix doit être un bouton, avec un nom comme « Fermer »")}
        ${el('<span class="kq-key">Échap</span>', "Appuyer sur Échap ne ferme pas la fenêtre.", "Échap doit fermer une fenêtre modale")}
        </div>`,
        explain: "Une fenêtre modale garde le focus à l'intérieur tant qu'elle est ouverte, se ferme avec Échap, puis rend le focus au bouton qui l'a ouverte." },
      { prompt: "Formulaire d'inscription : repère les blocages", html: `<div class="kq-grid">
        ${el('<span class="kq-input">Nom</span>', "Tab arrive ici en premier, le nom du champ est annoncé.")}
        ${el('<span class="kq-input">Ville</span>', "Tab saute ici avant le Nom, puis revient en arrière.", "l'ordre de tabulation doit suivre l'ordre de lecture")}
        ${el('<span class="kq-select">Pays ▾</span>', "La liste s'ouvre, mais les flèches ne changent pas d'option.", "on doit pouvoir choisir une option avec les flèches")}
        ${el('<span class="kq-btn">Valider</span>', "Tab l'atteint en dernier, Entrée envoie le formulaire.")}
        </div>`,
        explain: "L'ordre de tabulation suit l'ordre du code : ne le force jamais (tabindex positif). Et un composant fait maison (liste, onglets, curseur) doit se piloter au clavier comme le composant natif." },
      { prompt: "Page d'article : repère les blocages", html: `<div class="kq-grid">
        ${el('<span class="kq-link">Aller au contenu</span>', "Premier arrêt de Tab : il saute le menu d'un coup.")}
        ${el('<span class="kq-link">cliquez ici</span>', "Lu seul par un lecteur d'écran : « cliquez ici ». Vers où ?", "un lien doit dire où il mène, même lu hors contexte")}
        ${el('<span class="kq-carousel">Carrousel automatique</span>', "Il défile tout seul, aucune touche ne l'arrête.", "un contenu qui bouge seul doit pouvoir être mis en pause")}
        ${el('<span class="kq-btn">S\'abonner</span>', "Tab l'atteint, Entrée t'abonne.")}
        </div>`,
        explain: "Au clavier ou au lecteur d'écran, on parcourt souvent la liste des liens : « cliquez ici » répété dix fois ne dit rien. Et tout ce qui bouge seul plus de cinq secondes doit pouvoir s'arrêter." },
    ],
  });
})();
