// Icon Family — une famille d'icônes partage épaisseur, remplissage, taille et alignement.
(function () {
  const ic = (name, style, bad) => `<span class="if-cell" data-h="${bad ? "bad" : "ok"}"${bad ? ` data-why="${bad}"` : ""}><span class="material-symbols-outlined" style="${style}">${name}</span></span>`;
  const N = "font-size:40px;font-variation-settings:'wght' 300,'FILL' 0";
  const set = (names, faults) => `<div class="if-grid">${names.map((n, i) => ic(n, faults[i] ? faults[i][0] : N, faults[i] && faults[i][1])).join("")}</div>`;
  Oeil.kits.hunt({
    id: "icon-family", name: "Icon Family",
    howto: [
      { icon: "category", text: "Ces icônes devraient former une famille : même épaisseur de trait, même remplissage, même taille, même ligne de base." },
      { icon: "touch_app", text: "Clique sur celles qui sortent de la famille." },
      { icon: "visibility", text: "Plisse les yeux : une icône plus noire ou plus grande ressort comme une tache." },
    ],
    items: [
      { prompt: "Trouve les icônes qui sortent de la famille", html: set(["home", "search", "favorite", "settings", "person", "mail", "calendar_month", "share"], { 2: ["font-size:40px;font-variation-settings:'wght' 300,'FILL' 1", "remplie au lieu de trait"], 5: ["font-size:40px;font-variation-settings:'wght' 500,'FILL' 0", "trait plus épais (500 au lieu de 300)"] }),
        explain: "Dans une famille d'icônes, le remplissage et l'épaisseur portent du sens : une icône pleine se lit comme « active ». Si elle ne l'est pas, elle ment." },
      { prompt: "Trouve les icônes qui sortent de la famille", html: set(["photo_camera", "mic", "videocam", "headphones", "brush", "palette", "draw", "print"], { 3: ["font-size:48px;font-variation-settings:'wght' 300,'FILL' 0", "taille 48 au lieu de 40"], 6: ["font-size:40px;font-variation-settings:'wght' 300,'FILL' 0;transform:translateY(5px);display:inline-block", "décalée de 5 px vers le bas"] }),
        explain: "Les icônes se posent sur une grille commune (souvent 24 px avec une zone de sécurité). Une icône plus grande ou décalée casse la ligne de lecture de toute la barre." },
      { prompt: "Trouve les icônes qui sortent de la famille", html: set(["cloud", "bolt", "water_drop", "sunny", "air", "eco", "park", "landscape"], { 1: ["font-size:40px;font-variation-settings:'wght' 600,'FILL' 0", "trait 600, bien plus épais"], 4: ["font-size:40px;font-variation-settings:'wght' 300,'FILL' 1", "remplie"], 7: ["font-size:34px;font-variation-settings:'wght' 300,'FILL' 0", "taille 34, trop petite"] }),
        explain: "L'œil compare surtout la quantité de noir : un trait plus épais, une forme pleine ou une icône réduite changent le « gris » de l'ensemble." },
      { prompt: "Trouve les icônes qui sortent de la famille", html: set(["add", "remove", "close", "check", "arrow_forward", "arrow_back", "refresh", "more_horiz"], { 0: ["font-size:40px;font-variation-settings:'wght' 300,'FILL' 0;color:#5E5D58", "couleur grise au lieu de l'encre"], 6: ["font-size:40px;font-variation-settings:'wght' 500,'FILL' 0", "trait plus épais"] }),
        explain: "Une couleur différente dans une famille d'icônes neutres suggère un état (désactivé, secondaire). Si ce n'est pas voulu, c'est une fausse information." },
    ],
  });
})();
