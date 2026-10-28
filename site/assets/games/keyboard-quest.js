// Keyboard Quest — repère ce qui bloque quelqu'un qui navigue au clavier (Tab, Entrée, Échap).
(function () {
  const el = (html, code, bad) => `<div class="kq-el" data-h="${bad ? "bad" : "ok"}"${bad ? ` data-why="${bad}"` : ""}><div class="kq-view">${html}</div><code class="kq-code">${code}</code></div>`;
  Oeil.kits.hunt({
    id: "keyboard-quest", name: "Keyboard Quest",
    howto: [
      { icon: "keyboard", text: "Imagine que tu n'as pas de souris : tu avances avec Tab, tu actives avec Entrée ou Espace, tu fermes avec Échap." },
      { icon: "code", text: "Chaque élément montre à quoi il ressemble et comment il est codé. Certains bloquent la navigation au clavier." },
      { icon: "touch_app", text: "Clique sur les obstacles, puis valide." },
    ],
    items: [
      { prompt: "Repère les obstacles pour la navigation au clavier", html: `<div class="kq-grid">
        ${el('<span class="kq-btn">Envoyer</span>', "&lt;button&gt;Envoyer&lt;/button&gt;")}
        ${el('<span class="kq-btn">Supprimer</span>', '&lt;div onclick="supprimer()"&gt;', "un div cliquable ne reçoit pas le focus et ne réagit pas à Entrée")}
        ${el('<a class="kq-link">Lire la suite</a>', '&lt;a href="/article"&gt;')}
        ${el('<span class="kq-btn kq-focus-none">Payer</span>', "button:focus { outline: none }", "le focus est invisible : on ne sait plus où l'on est")}
        </div>`,
        explain: "Un élément cliquable doit être un vrai bouton ou un vrai lien : c'est ce qui lui donne le focus clavier et l'activation par Entrée. Et le focus doit toujours rester visible." },
      { prompt: "Repère les obstacles dans cette fenêtre modale", html: `<div class="kq-grid">
        ${el('<span class="kq-modal">Fenêtre « Partager »</span>', "le focus reste derrière la fenêtre à l'ouverture", "le focus doit entrer dans la fenêtre dès son ouverture")}
        ${el('<span class="kq-btn">Copier le lien</span>', "&lt;button&gt;Copier le lien&lt;/button&gt;")}
        ${el('<span class="kq-x">×</span>', '&lt;span class="close"&gt;×&lt;/span&gt;', "la croix n'est pas un bouton et n'a pas de nom lisible")}
        ${el('<span class="kq-key">Échap</span>', "Échap ne ferme pas la fenêtre", "Échap doit fermer une fenêtre modale")}
        </div>`,
        explain: "Une fenêtre modale piège le focus à l'intérieur tant qu'elle est ouverte, se ferme avec Échap et rend le focus à l'élément qui l'a ouverte." },
      { prompt: "Repère les obstacles dans ce formulaire", html: `<div class="kq-grid">
        ${el('<span class="kq-input">Nom</span>', "&lt;label for=\"nom\"&gt; + &lt;input id=\"nom\"&gt;")}
        ${el('<span class="kq-input">Ville</span>', 'tabindex="5"', "un tabindex positif casse l'ordre naturel de lecture")}
        ${el('<span class="kq-select">Pays ▾</span>', "liste déroulante maison sans gestion des flèches", "on ne peut pas choisir une option au clavier")}
        ${el('<span class="kq-btn">Valider</span>', '&lt;button type="submit"&gt;')}
        </div>`,
        explain: "L'ordre de tabulation suit l'ordre du code : n'utilise jamais de tabindex positif. Et un composant maison (liste, onglets, curseur) doit reproduire le clavier du composant natif." },
      { prompt: "Repère les obstacles dans cette page d'article", html: `<div class="kq-grid">
        ${el('<span class="kq-link">Aller au contenu</span>', "lien d'évitement en premier dans la page")}
        ${el('<span class="kq-link">cliquez ici</span>', '&lt;a&gt;cliquez ici&lt;/a&gt;', "un lien doit dire où il mène, même lu hors contexte")}
        ${el('<span class="kq-carousel">Carrousel automatique</span>', "défile seul, sans bouton pause", "un contenu qui bouge seul doit pouvoir être mis en pause")}
        ${el('<span class="kq-btn">S\'abonner</span>', "&lt;button&gt;S'abonner&lt;/button&gt;")}
        </div>`,
        explain: "Au clavier ou au lecteur d'écran, on parcourt souvent la liste des liens : « cliquez ici » répété dix fois ne dit rien. Et tout ce qui bouge seul plus de cinq secondes doit pouvoir s'arrêter." },
    ],
  });
})();
