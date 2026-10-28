// Responsive Rescue — une page de bureau doit passer sur mobile : choisis la meilleure adaptation.
(function () {
  const wire = (blocks, cls = "") => `<div class="fs-wire ${cls}">${blocks.map(([x, y, w, h, t]) => `<span class="fs-b fs-${t}" style="grid-column:${x} / span ${w};grid-row:${y} / span ${h}"></span>`).join("")}</div>`;
  const mob = (blocks) => wire(blocks, "fs-mobile");
  const item = (desk, options, explain, prompt = "Quelle version mobile garde le mieux la page ?") => ({
    context: `<div class="rr-desk"><p class="rr-cap">Version bureau</p>${wire(desk)}</div>`, prompt, cols: 3, wide: true,
    options: options.map(([b, ok, why]) => ({ html: mob(b), correct: ok, why })), explain,
  });
  Oeil.kits.choice({
    id: "responsive-rescue", name: "Responsive Rescue",
    howto: [
      { icon: "devices", text: "À gauche, une page pensée pour un grand écran. À droite, trois façons de la passer sur un téléphone." },
      { icon: "touch_app", text: "Choisis celle qui garde la hiérarchie : le message principal d'abord, l'action visible, rien d'illisible." },
      { icon: "check", text: "Valide : chaque option est commentée." },
    ],
    items: [
      item([[1, 1, 6, 1, "nav"], [1, 2, 3, 2, "title"], [4, 2, 3, 3, "img"], [1, 4, 2, 1, "btn"], [1, 5, 2, 2, "card"], [3, 5, 2, 2, "card"], [5, 5, 2, 2, "card"]], [
        [[[1, 1, 6, 1, "nav"], [1, 2, 6, 1, "title"], [1, 3, 6, 2, "img"], [1, 5, 6, 1, "btn"], [1, 6, 6, 1, "card"]], true, "titre, image, puis l'action : la hiérarchie est intacte"],
        [[[1, 1, 6, 1, "nav"], [1, 2, 3, 2, "title"], [4, 2, 3, 2, "img"], [1, 4, 2, 1, "btn"], [1, 5, 2, 2, "card"], [3, 5, 2, 2, "card"], [5, 5, 2, 2, "card"]], false, "la page de bureau rétrécie : tout devient minuscule"],
        [[[1, 1, 6, 1, "nav"], [1, 2, 6, 2, "img"], [1, 4, 6, 1, "card"], [1, 5, 6, 1, "card"], [1, 6, 6, 1, "title"]], false, "le titre et l'action sont relégués en bas"],
      ], "Sur mobile, on empile dans l'ordre d'importance plutôt que dans l'ordre visuel du bureau. L'action principale doit rester visible sans faire défiler longtemps."),
      item([[1, 1, 2, 6, "nav"], [3, 1, 4, 1, "title"], [3, 2, 2, 2, "card"], [5, 2, 2, 2, "card"], [3, 4, 4, 2, "img"], [5, 6, 2, 1, "btn"]], [
        [[[1, 1, 6, 1, "nav"], [1, 2, 6, 1, "title"], [1, 3, 6, 1, "card"], [1, 4, 6, 1, "card"], [1, 5, 6, 1, "img"], [1, 6, 6, 1, "btn"]], true, "la barre latérale devient une barre en haut (menu)"],
        [[[1, 1, 2, 6, "nav"], [3, 1, 4, 1, "title"], [3, 2, 4, 2, "card"], [3, 4, 4, 2, "img"], [3, 6, 4, 1, "btn"]], false, "la barre latérale mange un tiers de l'écran"],
        [[[1, 1, 6, 1, "title"], [1, 2, 6, 2, "img"], [1, 4, 6, 1, "card"], [1, 5, 6, 1, "btn"]], false, "la navigation a disparu et une carte avec"],
      ], "Une navigation latérale se replie en barre ou en menu sur mobile : elle ne disparaît jamais, et le contenu récupère toute la largeur."),
      item([[1, 1, 6, 1, "nav"], [1, 2, 2, 2, "card"], [3, 2, 2, 2, "card"], [5, 2, 2, 2, "card"], [1, 4, 2, 2, "card"], [3, 4, 2, 2, "card"], [5, 4, 2, 2, "card"]], [
        [[[1, 1, 6, 1, "nav"], [1, 2, 3, 2, "card"], [4, 2, 3, 2, "card"], [1, 4, 3, 2, "card"], [4, 4, 3, 2, "card"], [1, 6, 3, 1, "card"], [4, 6, 3, 1, "card"]], true, "deux colonnes : les vignettes restent lisibles et comparables"],
        [[[1, 1, 6, 1, "nav"], [1, 2, 2, 1, "card"], [3, 2, 2, 1, "card"], [5, 2, 2, 1, "card"], [1, 3, 2, 1, "card"], [3, 3, 2, 1, "card"], [5, 3, 2, 1, "card"]], false, "trois colonnes de vignettes trop petites"],
        [[[1, 1, 6, 1, "nav"], [1, 2, 6, 1, "card"], [1, 3, 6, 1, "card"], [1, 4, 6, 1, "card"]], false, "une seule colonne : seules trois cartes restent visibles"],
      ], "Une grille de produits passe souvent de trois colonnes à deux sur mobile : on garde la comparaison sans rendre les vignettes illisibles."),
    ],
  });
})();
