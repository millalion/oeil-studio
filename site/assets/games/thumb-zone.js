// Thumb Zone — sur un téléphone tenu d'une main, le bas de l'écran est facile à atteindre, le haut demande un effort.
(function () {
  const ACTIONS = {
    bas: [["Acheter", "L'action principale va là où le pouce arrive sans effort"], ["Publier", "L'action principale va là où le pouce arrive sans effort"], ["Nouveau message", "Ce qu'on fait le plus souvent doit rester sous le pouce"], ["Payer", "L'action principale va là où le pouce arrive sans effort"], ["Accueil", "La navigation fréquente se place en bas, comme sur toutes les applications"], ["Scanner", "Une action répétée doit rester sous le pouce"]],
    milieu: [["Liste des articles", "Le contenu se parcourt au milieu de l'écran"], ["Photos du produit", "Le contenu se regarde au milieu, il n'a pas besoin du pouce"], ["Fil d'actualité", "Le contenu se parcourt au milieu de l'écran"], ["Détail de la commande", "Le contenu se lit au milieu de l'écran"]],
    haut: [["Supprimer le compte", "Une action grave se place loin du pouce pour éviter le geste par erreur"], ["Déconnexion", "Une action rare ou gênante se place loin du pouce"], ["Réglages", "Une action rare peut demander un effort"], ["Signaler", "Une action rare peut demander un effort"]],
  };
  const ZONES = [{ id: "haut", label: "Haut : difficile à atteindre" }, { id: "milieu", label: "Milieu : atteignable" }, { id: "bas", label: "Bas : sous le pouce" }];
  const item = () => {
    const pick = (z) => Oeil.pick(ACTIONS[z]);
    const chosen = { haut: pick("haut"), milieu: pick("milieu"), bas: pick("bas") };
    return {
      prompt: "Place chaque élément dans la bonne zone de l'écran",
      layout: "stack",
      explain: `${chosen.bas[1]}. ${chosen.haut[1]}. Sur un téléphone tenu d'une main, c'est le pouce qui décide de la mise en page.`,
      slots: ZONES.map((z) => ({ id: z.id, label: z.label, render: () => "" })),
      tokens: Oeil.shuffle(ZONES.map((z) => ({ id: z.id + "-t", html: chosen[z.id][0], slot: z.id }))),
    };
  };
  Oeil.kits.assign({
    id: "thumb-zone", name: "Thumb Zone",
    howto: [
      { icon: "smartphone", text: "Un téléphone se tient souvent d'une main : le pouce atteint facilement le bas de l'écran, difficilement le haut." },
      { icon: "drag_pan", text: "Glisse chaque élément dans une zone (ou touche un élément, puis une zone)." },
      { icon: "lightbulb", text: "Ce qui est fréquent va sous le pouce, ce qui est rare ou risqué s'en éloigne." },
    ],
    items: Array.from({ length: 12 }, item),
  });
})();
