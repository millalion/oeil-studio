// Boolean Builder — quelle opération booléenne entre A et B donne la silhouette cible ?
(function () {
  const svg = (inner) => `<svg class="bb-svg" viewBox="0 0 120 100" aria-hidden="true">${inner}</svg>`;
  const ops = {
    union: (A, B) => `<path d="${A} ${B}" fill="#141413"/>`,
    subtract: (A, B, id) => `<defs><mask id="m${id}"><rect width="120" height="100" fill="#fff"/><path d="${B}" fill="#000"/></mask></defs><path d="${A}" fill="#141413" mask="url(#m${id})"/>`,
    intersect: (A, B, id) => `<defs><clipPath id="c${id}"><path d="${B}"/></clipPath></defs><path d="${A}" fill="#141413" clip-path="url(#c${id})"/>`,
    exclude: (A, B) => `<path d="${A} ${B}" fill="#141413" fill-rule="evenodd"/>`,
    subtractBA: (A, B, id) => `<defs><mask id="n${id}"><rect width="120" height="100" fill="#fff"/><path d="${A}" fill="#000"/></mask></defs><path d="${B}" fill="#141413" mask="url(#n${id})"/>`,
  };
  const LABELS = { union: "Union", subtract: "Soustraire B de A", intersect: "Intersection", exclude: "Exclusion", subtractBA: "Soustraire A de B" };
  const ICONS = { union: "join_full", subtract: "join_left", intersect: "join_inner", exclude: "join", subtractBA: "join_right" };
  const circ = (cx, cy, r) => `M${cx - r} ${cy} a${r} ${r} 0 1 0 ${r * 2} 0 a${r} ${r} 0 1 0 ${-r * 2} 0Z`;
  const rect = (x, y, w, h) => `M${x} ${y}h${w}v${h}h${-w}Z`;
  let uid = 0;
  const item = (A, B, op, explain) => {
    const id = ++uid;
    return {
      prompt: "Quelle opération entre A et B donne la forme cible ?", cols: 4,
      context: `<div class="bb-ctx"><figure>${svg(`<path d="${A}" fill="none" stroke="#141413" stroke-width="1.5"/><path d="${B}" fill="rgba(240,68,122,.25)" stroke="#F0447A" stroke-width="1.5"/><text x="8" y="14" class="bb-t">A</text><text x="104" y="14" class="bb-t bb-tb">B</text>`)}<figcaption>A (noir) et B (rose)</figcaption></figure><span class="material-symbols-outlined">arrow_forward</span><figure>${svg(ops[op](A, B, id))}<figcaption>Forme cible</figcaption></figure></div>`,
      options: Object.keys(LABELS).filter((k) => k !== (op === "subtract" ? "subtractBA" : op === "subtractBA" ? "subtract" : "subtractBA")).slice(0, 4).map((k) => ({ html: `<span class="material-symbols-outlined bb-icon">${ICONS[k]}</span>`, label: LABELS[k], correct: k === op })),
      explain,
    };
  };
  Oeil.kits.choice({
    id: "boolean-builder", name: "Boolean Builder",
    howto: [
      { icon: "join", text: "Deux formes, A (noire) et B (rose), et une forme cible obtenue en les combinant." },
      { icon: "touch_app", text: "Choisis l'opération qui produit la cible : union, soustraction, intersection ou exclusion." },
      { icon: "lightbulb", text: "Regarde la zone où A et B se chevauchent : est-elle pleine, vide, ou seule à rester ?" },
    ],
    items: [
      item(circ(48, 50, 30), circ(72, 50, 30), "intersect", "L'intersection ne garde que la zone commune : c'est ainsi qu'on dessine une lentille ou une feuille à partir de deux cercles."),
      item(circ(50, 50, 32), circ(78, 38, 22), "subtract", "Soustraire un cercle d'un autre crée un croissant : la forme du dessus emporte un morceau de celle du dessous."),
      item(rect(20, 30, 60, 40), circ(80, 50, 24), "union", "L'union fusionne les formes en une seule silhouette, sans trait intérieur : la base de beaucoup de pictogrammes."),
      item(circ(46, 50, 30), circ(74, 50, 30), "exclude", "L'exclusion garde tout sauf la zone commune : utile pour les motifs et les logos à contre-forme."),
      item(rect(30, 20, 60, 60), circ(60, 50, 18), "subtract", "Percer un carré d'un cercle (soustraction) donne un cadre : c'est la base de nombreuses icônes « objectif » ou « cible »."),
    ],
  });
})();
