// Token Detective — un composant et sa fiche de cotes : repère les valeurs hors du design system.
(function () {
  const SYS = {
    space: [4, 8, 16, 24, 32], radius: [4, 8], size: [12, 14, 16, 20, 28],
    color: { "#141413": "Encre", "#5E5D58": "Gris", "#FFFFFF": "Blanc", "#F0447A": "Signal", "#EAE9E3": "Surface" },
  };
  const near = (list, v) => list.reduce((a, b) => (Math.abs(b - v) < Math.abs(a - v) ? b : a));
  const OFF = { space: [6, 10, 12, 14, 18, 20, 28], radius: [2, 3, 5, 6, 10, 12], size: [11, 13, 15, 17, 18, 22, 24] };
  const OFF_COLORS = ["#3A3A3A", "#F25C8A", "#F2F1EC", "#6B6A64", "#E4E3DD"];

  const COMPONENTS = [
    { name: "Bouton", props: [
      ["padX", "Marge horizontale", "space", 16], ["padY", "Marge verticale", "space", 8], ["radius", "Arrondi", "radius", 4],
      ["size", "Taille du texte", "size", 14], ["bg", "Fond", "color", "#141413"], ["fg", "Texte", "color", "#FFFFFF"], ["gap", "Écart icône", "space", 8]],
      render: (p) => `<span style="display:inline-flex;align-items:center;gap:${p.gap}px;padding:${p.padY}px ${p.padX}px;border-radius:${p.radius}px;background:${p.bg};color:${p.fg};font-size:${p.size}px;font-weight:500">Enregistrer<span class="material-symbols-outlined" style="font-size:${p.size + 4}px">arrow_forward</span></span>` },
    { name: "Carte", props: [
      ["pad", "Marge interne", "space", 24], ["radius", "Arrondi", "radius", 8], ["title", "Taille du titre", "size", 20], ["body", "Taille du texte", "size", 14],
      ["gap", "Titre → texte", "space", 8], ["bg", "Fond", "color", "#FFFFFF"], ["muted", "Couleur du texte", "color", "#5E5D58"]],
      render: (p) => `<div style="width:300px;padding:${p.pad}px;border-radius:${p.radius}px;background:${p.bg};border:1px solid #E0DFD8"><div style="font-size:${p.title}px;font-weight:500;letter-spacing:-.01em">Typographie suisse</div><div style="margin-top:${p.gap}px;font-size:${p.body}px;color:${p.muted};line-height:1.5">Une anthologie des grilles modulaires des années 1960.</div></div>` },
    { name: "Champ de saisie", props: [
      ["label", "Taille du libellé", "size", 14], ["gap", "Libellé → champ", "space", 8], ["h", "Marge interne", "space", 16], ["radius", "Arrondi", "radius", 4],
      ["size", "Taille de la saisie", "size", 16], ["border", "Bordure", "color", "#5E5D58"], ["help", "Taille de l'aide", "size", 12]],
      render: (p) => `<div style="width:300px"><div style="font-size:${p.label}px;font-weight:500">Adresse e-mail</div><div style="margin-top:${p.gap}px;padding:10px ${p.h}px;border:1px solid ${p.border};border-radius:${p.radius}px;font-size:${p.size}px;background:#fff">prenom@atelier.fr</div><div style="margin-top:6px;font-size:${p.help}px;color:#5E5D58">Nous ne la partagerons jamais.</div></div>` },
    { name: "Alerte", props: [
      ["pad", "Marge interne", "space", 16], ["radius", "Arrondi", "radius", 8], ["bg", "Fond", "color", "#EAE9E3"], ["accent", "Filet", "color", "#F0447A"],
      ["title", "Taille du titre", "size", 16], ["body", "Taille du texte", "size", 14], ["gap", "Titre → texte", "space", 4]],
      render: (p) => `<div style="width:320px;padding:${p.pad}px;border-radius:${p.radius}px;background:${p.bg};border-left:4px solid ${p.accent}"><div style="font-size:${p.title}px;font-weight:500">Session expirée</div><div style="margin-top:${p.gap}px;font-size:${p.body}px;color:#5E5D58">Reconnecte-toi pour retrouver ta progression.</div></div>` },
    { name: "Élément de liste", props: [
      ["pad", "Marge verticale", "space", 16], ["gap", "Avatar → texte", "space", 16], ["name", "Taille du nom", "size", 16], ["meta", "Taille de la fonction", "size", 14],
      ["radius", "Arrondi de l'avatar", "radius", 8], ["fg", "Couleur du nom", "color", "#141413"], ["sub", "Couleur de la fonction", "color", "#5E5D58"]],
      render: (p) => `<div style="width:320px;display:flex;align-items:center;gap:${p.gap}px;padding:${p.pad}px 0;border-bottom:1px solid #E0DFD8"><span style="width:40px;height:40px;border-radius:${p.radius}px;background:#F7B4CC"></span><span><span style="display:block;font-size:${p.name}px;font-weight:500;color:${p.fg}">Léa Martin</span><span style="display:block;font-size:${p.meta}px;color:${p.sub}">Directrice artistique</span></span></div>` },
  ];
  const order = Oeil.shuffle(COMPONENTS);
  const fmt = (type, v) => (type === "color" ? v : `${v} px`);

  Oeil.play({
    id: "token-detective", name: "Token Detective",
    howto: [
      { icon: "menu_book", text: "Le design system est rappelé à droite : espacements, arrondis, tailles de texte et couleurs autorisés." },
      { icon: "touch_app", text: "Au centre, la fiche du composant : compare chaque valeur à la liste de droite. Si elle n'y figure pas (14 px alors que le système propose 8 ou 16), clique dessus." },
      { icon: "check", text: "Valide quand tu as fini. Les fausses alertes coûtent des points." },
    ],
    brief: (s) => `${s.c.name} : clique les ${s.bad.length} valeurs de la fiche qui n'existent pas dans le design system (à droite).`,
    setup(round) {
      const c = order[round % order.length];
      const p = Object.fromEntries(c.props.map(([k, , , v]) => [k, v]));
      const n = round < 2 ? 2 : 3;
      const bad = Oeil.shuffle(c.props.map((x) => x[0])).slice(0, n);
      bad.forEach((k) => {
        const type = c.props.find((x) => x[0] === k)[2];
        p[k] = type === "color" ? Oeil.pick(OFF_COLORS.filter((x) => x !== p[k])) : Oeil.pick(OFF[type]);
      });
      return { c, p, bad, picked: new Set() };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "td-wrap");
      const prev = api.h("div", "td-preview", s.c.render(s.p));
      const sheet = api.h("div", "td-sheet", `<p class="td-h">Fiche du composant</p>`);
      s.rows = s.c.props.map(([k, label, type]) => {
        const b = api.h("button", "td-row pickable", `<span>${label}</span><b>${type === "color" ? `<i style="background:${s.p[k]}"></i>` : ""}${fmt(type, s.p[k])}</b>`);
        b.type = "button"; b.dataset.k = k; b.setAttribute("aria-pressed", "false");
        b.addEventListener("click", () => {
          if (api.phase !== "play") return;
          s.picked.has(k) ? s.picked.delete(k) : s.picked.add(k);
          b.classList.toggle("is-picked", s.picked.has(k)); b.setAttribute("aria-pressed", String(s.picked.has(k)));
        });
        sheet.append(b);
        return b;
      });
      const sys = api.h("div", "td-sys", `<p class="td-h">Design system</p>
        <dl><div><dt>Espacements</dt><dd>${SYS.space.join(" · ")}</dd></div><div><dt>Arrondis</dt><dd>${SYS.radius.join(" · ")}</dd></div>
        <div><dt>Tailles de texte</dt><dd>${SYS.size.join(" · ")}</dd></div>
        <div><dt>Couleurs</dt><dd class="td-colors">${Object.entries(SYS.color).map(([hex, n]) => `<span title="${n}"><i style="background:${hex}"></i>${hex}</span>`).join("")}</dd></div></dl>`);
      wrap.append(prev, sheet, sys);
      board.append(wrap);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Clique sur les valeurs fautives</span>`;
    },
    evaluate(s) {
      const hits = s.bad.filter((k) => s.picked.has(k)).length;
      const fa = [...s.picked].filter((k) => !s.bad.includes(k)).length;
      return {
        score: Math.max(0, (hits / s.bad.length) * 100 - fa * 25),
        metrics: [
          { label: "Valeurs fautives trouvées", value: `${hits} sur ${s.bad.length}`, good: hits === s.bad.length },
          { label: "Fausses alertes", value: `${fa}`, good: fa === 0 },
        ],
        principle: "Une valeur hors système passe souvent inaperçue seule, mais elles s'accumulent : 14 px ici, 15 px là, et l'interface perd son rythme. Arrondir au jeton le plus proche est presque toujours la bonne correction.",
      };
    },
    reveal(board, s, r, api) {
      s.rows.forEach((b) => {
        b.disabled = true;
        const k = b.dataset.k, [, , type] = s.c.props.find((x) => x[0] === k);
        if (s.bad.includes(k)) {
          b.classList.add(s.picked.has(k) ? "td-found" : "td-missed");
          const fix = type === "color" ? s.c.props.find((x) => x[0] === k)[3] : near(SYS[type], s.p[k]);
          b.insertAdjacentHTML("beforeend", `<span class="tag-ref td-fix">→ ${fmt(type, fix)}</span>`);
        } else if (s.picked.has(k)) b.classList.add("td-false");
      });
    },
  });
})();
