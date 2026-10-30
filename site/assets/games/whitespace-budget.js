// Whitespace Budget — un budget fixe d'espace à répartir entre trois écarts pour créer une hiérarchie.
(function () {
  const CARDS = Oeil.shuffle([
    { budget: 56, target: [8, 16, 32], parts: ["Étiquette", "Titre", "Description", "Bouton"], tip: "Avec un budget fixe, la hiérarchie vient du contraste entre les écarts : petit entre ce qui va ensemble, grand avant l'action. Répartir à parts égales ne dit rien." },
    { budget: 48, target: [24, 8, 16], parts: ["Photo", "Nom", "Fonction", "Statistiques"], tip: "Le nom et la fonction forment une seule information : ils se collent. La photo et les statistiques s'en détachent plus franchement." },
    { budget: 64, target: [8, 40, 16], parts: ["Titre", "Sous-titre", "Paragraphe", "Signature"], tip: "Le plus grand écart marque la rupture principale du composant : ici entre l'en-tête (titre + sous-titre) et le corps du texte." },
    { budget: 40, target: [4, 12, 24], parts: ["Prix", "Mention", "Liste", "Bouton"], tip: "Le prix et sa mention se lisent ensemble (4 px), la liste respire un peu, et le bouton bénéficie de l'écart le plus généreux pour être isolé." },
  ]);
  const html = (p) => ({
    "Étiquette": '<span class="wb-tag">Édition print</span>', "Titre": '<span class="wb-title">Typographie suisse</span>',
    "Description": '<span class="wb-text">Une anthologie des grilles modulaires des années 1960.</span>', "Bouton": '<span class="wb-btn">Ajouter au panier</span>',
    "Photo": '<span class="wb-photo"></span>', "Nom": '<span class="wb-title">Élise Bernard</span>', "Fonction": '<span class="wb-text">Directrice artistique</span>',
    "Statistiques": '<span class="wb-stats"><b>128</b> défis · <b>96 %</b> justesse</span>', "Sous-titre": '<span class="wb-text">Entretien avec une typographe</span>',
    "Paragraphe": '<span class="wb-text">« Dessiner une lettre, c\'est d\'abord dessiner les blancs qui l\'entourent. »</span>', "Signature": '<span class="wb-text"><i>Propos recueillis par Malo</i></span>',
    "Prix": '<span class="wb-price">19 €</span>', "Mention": '<span class="wb-text">une seule fois</span>', "Liste": '<span class="wb-text">✓ 14 défis · ✓ fiches · ✓ accès à vie</span>',
  }[p]);
  function apply(s) {
    s.gaps.forEach((g, i) => (s.gapEls[i].style.height = `${g}px`));
    const t = s.c.budget;
    s.d1.style.left = `${(s.gaps[0] / t) * 100}%`;
    s.d2.style.left = `${((s.gaps[0] + s.gaps[1]) / t) * 100}%`;
    s.segs.forEach((el, i) => { el.style.width = `${(s.gaps[i] / t) * 100}%`; el.textContent = `${Math.round(s.gaps[i])}`; });
  }
  Oeil.play({
    id: "whitespace-budget", name: "Whitespace Budget",
    howto: [
      { icon: "space_bar", text: "Tu disposes d'un budget fixe d'espace (en pixels) à répartir entre les trois écarts du composant." },
      { icon: "drag_pan", text: "Glisse les deux séparateurs de la barre de budget : prendre de l'espace à un écart le donne à son voisin." },
      { icon: "lightbulb", text: "Rapproche ce qui va ensemble, éloigne ce qui doit se détacher." },
    ],
    brief: (s) => `Répartis ${s.c.budget} px d'espace pour créer la hiérarchie de ce composant.`,
    setup(round) {
      const c = CARDS[round % CARDS.length], t = c.budget / 3;
      return { c, gaps: [t, t, t] };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "wb-wrap");
      const card = api.h("div", "wb-card");
      s.gapEls = [];
      s.c.parts.forEach((p, i) => {
        card.insertAdjacentHTML("beforeend", html(p));
        if (i < 3) { const g = api.h("span", "wb-gap"); card.append(g); s.gapEls.push(g); }
      });
      const bar = api.h("div", "wb-bar");
      s.segs = [0, 1, 2].map(() => { const seg = api.h("span", "wb-seg"); bar.append(seg); return seg; });
      s.d1 = api.h("span", "handle wb-div"); s.d2 = api.h("span", "handle wb-div");
      bar.append(s.d1, s.d2);
      wrap.append(card, api.h("p", "wb-cap", `Budget : ${s.c.budget} px à répartir`), bar);
      board.append(wrap);
      const t = s.c.budget;
      api.drag(s.d1, { start: () => ({ a: s.gaps[0], w: bar.clientWidth }), move: (dx, dy, ev, c) => { const a = api.clamp(c.a + (dx / c.w) * t, 0, s.gaps[0] + s.gaps[1]); s.gaps[1] += s.gaps[0] - a; s.gaps[0] = a; apply(s); } });
      api.drag(s.d2, { start: () => ({ ab: s.gaps[0] + s.gaps[1], w: bar.clientWidth }), move: (dx, dy, ev, c) => { const ab = api.clamp(c.ab + (dx / c.w) * t, s.gaps[0], t); s.gaps[1] = ab - s.gaps[0]; s.gaps[2] = t - ab; apply(s); } });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les deux séparateurs roses</span>`;
      apply(s);
    },
    evaluate(s) {
      const err = s.gaps.reduce((a, g, i) => a + Math.abs(g - s.c.target[i]), 0) / 3;
      const rankOk = [0, 1, 2].every((i) => [0, 1, 2].every((j) => (s.c.target[i] < s.c.target[j]) === (s.gaps[i] < s.gaps[j]) || s.c.target[i] === s.c.target[j]));
      return {
        score: Math.max(0, 100 - Math.max(0, err - 2) * 5) * (rankOk ? 1 : 0.6),
        metrics: [
          { label: "Ta répartition", value: s.gaps.map((g) => Math.round(g)).join(" · ") + " px" },
          { label: "Répartition conseillée", value: s.c.target.join(" · ") + " px" },
          { label: "Hiérarchie", value: rankOk ? "dans le bon ordre" : "ordre des écarts inversé", good: rankOk },
        ],
        principle: s.c.tip,
      };
    },
    reveal(board, s, r, api) {
      // Montre la correction sur le composant lui-même
      [s.d1, s.d2].forEach((d) => d.classList.add("is-locked"));
      s.gaps = [...s.c.target];
      apply(s);
      s.gapEls.forEach((g, i) => g.insertAdjacentHTML("beforeend", `<span class="tag-ref wb-tagref">${s.c.target[i]}</span>`));
      board.querySelector(".wb-wrap, .wb-card, [class^=wb-]").insertAdjacentHTML("afterbegin", `<p class="wb-fixed">Correction appliquée</p>`);
    },
  });
})();
