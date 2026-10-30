// Gradient Repair — des étapes manquent dans un dégradé : replace les bonnes nuances, en évitant les leurres.
(function () {
  const C = Oeil.color;
  const mix = (a, b, t) => ({ h: a.h + (b.h - a.h) * t, s: a.s + (b.s - a.s) * t, l: a.l + (b.l - a.l) * t });
  const sw = (c) => `<span class="gr-sw" style="background:${C.hsl({ h: Math.round(c.h), s: Math.round(c.s), l: Math.round(c.l) })}"></span>`;
  function item(a, b, n, missing, prompt, explain) {
    const steps = Array.from({ length: n }, (_, i) => mix(a, b, i / (n - 1)));
    const slots = steps.map((c, i) => (missing.includes(i)
      ? { id: `g${i}`, render: () => "" }
      : { id: `f${i}`, html: sw(c), fixed: true }));
    const tokens = missing.map((i) => ({ id: `t${i}`, html: sw(steps[i]), slot: `g${i}` }));
    // Leurres : la même étape un peu trop claire, trop saturée ou décalée en teinte
    const m = missing[0], base = steps[m];
    tokens.push({ id: "d1", html: sw({ ...base, l: base.l + 9 }), slot: null }, { id: "d2", html: sw({ ...base, s: Math.min(100, base.s + 22), h: base.h + 12 }), slot: null });
    return { prompt: `${prompt} : glisse les bonnes nuances dans les trous`, layout: "gradient", slots, tokens, explain };
  }
  Oeil.kits.assign({
    id: "gradient-repair", name: "Gradient Repair",
    howto: [
      { icon: "gradient", text: "Un dégradé régulier a perdu quelques étapes : les cases vides sont à remplir." },
      { icon: "drag_pan", text: "Glisse les bonnes nuances dans les trous. Deux nuances sont des leurres : laisse-les de côté." },
      { icon: "lightbulb", text: "Compare chaque case à ses deux voisines : l'écart doit être le même de chaque côté." },
    ],
    items: [
      item({ h: 210, s: 70, l: 30 }, { h: 190, s: 60, l: 85 }, 7, [2, 4], "Complète le dégradé de bleus", "Un dégradé paraît régulier quand chaque marche de clarté est égale. Les leurres sont presque justes : une marche trop claire ou une teinte qui dérive se voit à côté de ses voisines."),
      item({ h: 10, s: 80, l: 45 }, { h: 45, s: 90, l: 70 }, 7, [1, 3, 5], "Complète le dégradé chaud", "En passant du rouge au jaune, la teinte et la clarté changent ensemble : une étape qui monte en clarté sans tourner en teinte paraît grise."),
      item({ h: 150, s: 40, l: 22 }, { h: 150, s: 30, l: 88 }, 8, [2, 5], "Complète la palette de verts (une seule teinte)", "Une palette monochrome se construit par paliers de clarté réguliers : c'est la base des échelles de couleurs d'un design system (vert 100 à vert 900)."),
      item({ h: 280, s: 30, l: 35 }, { h: 340, s: 70, l: 70 }, 7, [3, 4], "Complète le dégradé prune vers rose", "Au milieu d'un dégradé, les erreurs se voient le plus : c'est là que la teinte change le plus vite. Juge chaque case avec ses deux voisines."),
    ],
  });
})();
