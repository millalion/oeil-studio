// Five-Second Layout — observe une mise en page cinq secondes, puis retrouve-la parmi des variantes.
(function () {
  // Une maquette en fil de fer : liste de blocs [colonne, ligne, largeur, hauteur, type] sur une grille 6 × 6.
  const wire = (blocks) => `<div class="fs-wire">${blocks.map(([x, y, w, h, t]) => `<span class="fs-b fs-${t}" style="grid-column:${x} / span ${w};grid-row:${y} / span ${h}"></span>`).join("")}</div>`;
  const item = (base, variants, explain) => ({
    memo: { html: wire(base), seconds: 5 },
    prompt: "Quelle mise en page as-tu vue ?",
    cols: 4,
    options: [{ html: wire(base), correct: true }, ...variants.map((v) => ({ html: wire(v) }))],
    explain,
  });
  const A = [[1, 1, 6, 1, "nav"], [1, 2, 4, 2, "title"], [5, 2, 2, 3, "img"], [1, 4, 2, 1, "btn"], [1, 5, 2, 2, "card"], [3, 5, 2, 2, "card"], [5, 5, 2, 2, "card"]];
  const B = [[1, 1, 6, 1, "nav"], [1, 2, 6, 2, "img"], [2, 4, 4, 1, "title"], [3, 5, 2, 1, "btn"], [1, 6, 3, 1, "card"], [4, 6, 3, 1, "card"]];
  const C = [[1, 1, 2, 6, "nav"], [3, 1, 4, 1, "title"], [3, 2, 2, 2, "card"], [5, 2, 2, 2, "card"], [3, 4, 4, 2, "img"], [5, 6, 2, 1, "btn"]];
  const D = [[1, 1, 6, 1, "nav"], [1, 2, 3, 3, "img"], [4, 2, 3, 1, "title"], [4, 3, 3, 1, "card"], [4, 4, 1, 1, "btn"], [1, 5, 6, 2, "card"]];
  const swap = (b, i, j) => { const c = b.map((x) => [...x]); [c[i][4], c[j][4]] = [c[j][4], c[i][4]]; return c; };
  const shift = (b, i, dx, dy) => b.map((x, k) => (k === i ? [x[0] + dx, x[1] + dy, x[2], x[3], x[4]] : [...x]));
  Oeil.kits.choice({
    id: "five-second-layout", name: "Five-Second Layout", memoBrief: "Observe cette mise en page : elle disparaît dans 5 secondes.",
    howto: [
      { icon: "timer", text: "Une mise en page s'affiche cinq secondes, en blocs : navigation, titre, image, bouton, cartes." },
      { icon: "grid_view", text: "Retiens les grandes zones : où est l'image, où est le titre, combien de colonnes." },
      { icon: "touch_app", text: "Retrouve-la parmi quatre variantes très proches." },
    ],
    items: [
      item(A, [swap(A, 1, 2), shift(A, 3, 2, 0), [[1, 1, 6, 1, "nav"], [1, 2, 4, 2, "title"], [5, 2, 2, 3, "img"], [1, 4, 2, 1, "btn"], [1, 5, 3, 2, "card"], [4, 5, 3, 2, "card"]]], "En cinq secondes, l'œil enregistre d'abord les masses : la plus grande zone et sa position. C'est ce que retiendra aussi un visiteur pressé : place le message principal dans la masse dominante."),
      item(B, [swap(B, 1, 2), shift(B, 3, -1, 0), [[1, 1, 6, 1, "nav"], [1, 2, 6, 2, "img"], [2, 4, 4, 1, "title"], [3, 5, 2, 1, "btn"], [1, 6, 2, 1, "card"], [3, 6, 2, 1, "card"], [5, 6, 2, 1, "card"]]], "Une composition centrée se retient par sa symétrie : la moindre rupture (un bouton décalé, une carte de plus) se remarque, d'où l'importance de la tenir."),
      item(C, [swap(C, 4, 2), [[1, 1, 2, 6, "nav"], [3, 1, 4, 1, "title"], [3, 2, 4, 2, "img"], [3, 4, 2, 2, "card"], [5, 4, 2, 2, "card"], [5, 6, 2, 1, "btn"]], shift(C, 5, -2, 0)], "Une barre latérale structure tout l'écran : c'est le premier repère mémorisé. Le reste se lit par rapport à elle."),
      item(D, [swap(D, 1, 5), shift(D, 4, 1, 0), [[1, 1, 6, 1, "nav"], [4, 2, 3, 3, "img"], [1, 2, 3, 1, "title"], [1, 3, 3, 1, "card"], [1, 4, 1, 1, "btn"], [1, 5, 6, 2, "card"]]], "Image à gauche ou à droite : cette inversion est l'erreur la plus fréquente, preuve que l'on mémorise les masses avant leur sens."),
    ],
  });
})();
