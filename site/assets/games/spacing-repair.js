// Spacing Repair — étire directement les écarts cassés d'une interface, à l'œil.
(function () {
  const TOL = 2;
  const MAX_GAP = 48;
  const SCALE = [
    { px: 4, name: "micro" },
    { px: 8, name: "serré" },
    { px: 16, name: "moyen" },
    { px: 24, name: "large" },
    { px: 32, name: "très large" },
  ];
  const tokenName = (px) => SCALE.find((s) => s.px === px).name;
  const v = (id) => `<div class="sr-gap sr-v" data-gap="${id}"></div>`;
  const h = (id) => `<div class="sr-gap sr-h" data-gap="${id}"></div>`;

  const TEMPLATES = [
    {
      name: "Carte produit",
      brief: "Le titre reste collé à sa description, l'étiquette s'en détache et le bouton respire.",
      tip: "Loi de proximité (Gestalt) : ce qui va ensemble doit être plus proche que ce qui est séparé. Le titre et sa description forment un bloc ; l'action d'achat mérite un vide plus large pour être isolée.",
      gaps: [
        { id: "pad", label: "Marge interne", target: 24, pad: true },
        { id: "tag-title", label: "Étiquette → titre", target: 16 },
        { id: "title-desc", label: "Titre → description", target: 8 },
        { id: "desc-btn", label: "Description → bouton", target: 24 },
      ],
      html: `<div class="w-full max-w-sm bg-surface-card rounded-xl shadow-sm flex flex-col" data-pad="pad">
        <div class="flex justify-between items-center">
          <span class="px-2.5 py-0.5 rounded font-mono-sm text-mono-sm bg-domain-composition text-text-primary">Édition print</span>
          <span class="font-mono-metric text-mono-metric font-bold text-text-primary">45,00 €</span>
        </div>
        ${v("tag-title")}
        <h4 class="font-headline-md text-headline-md text-text-primary leading-tight">Typographie Suisse</h4>
        ${v("title-desc")}
        <p class="font-body-sm text-body-sm text-on-surface-variant">Une anthologie critique des grilles modulaires et des casses asymétriques des années 1960.</p>
        ${v("desc-btn")}
        <button class="w-full py-2.5 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md" tabindex="-1" type="button">Ajouter au panier</button>
      </div>`,
    },
    {
      name: "Formulaire de connexion",
      brief: "Chaque libellé colle à son champ, les champs se séparent clairement, le bouton marque la fin.",
      tip: "Un libellé trop éloigné de son champ devient ambigu : l'œil ne sait plus à quel champ il appartient. Un écart libellé → champ plus petit que l'écart entre deux champs règle le problème sans aucune bordure.",
      gaps: [
        { id: "title-sub", label: "Titre → sous-titre", target: 8 },
        { id: "sub-field", label: "Sous-titre → 1er champ", target: 24 },
        { id: "label-input", label: "Libellé → champ (×2)", target: 8 },
        { id: "field-field", label: "Champ → champ", target: 16 },
        { id: "field-btn", label: "Dernier champ → bouton", target: 24 },
      ],
      html: `<div class="w-full max-w-sm bg-surface-card rounded-xl shadow-sm p-8 flex flex-col">
        <h4 class="font-headline-md text-headline-md text-text-primary leading-tight">Bon retour</h4>
        ${v("title-sub")}
        <p class="font-body-sm text-body-sm text-text-muted">Connecte-toi pour retrouver ta progression.</p>
        ${v("sub-field")}
        <span class="font-label-md text-label-md text-text-primary">Adresse e-mail</span>
        ${v("label-input")}
        <div class="h-10 rounded-lg bg-surface-canvas border border-border-subtle px-3 flex items-center font-body-sm text-body-sm text-text-muted">prenom@atelier.fr</div>
        ${v("field-field")}
        <span class="font-label-md text-label-md text-text-primary">Mot de passe</span>
        ${v("label-input")}
        <div class="h-10 rounded-lg bg-surface-canvas border border-border-subtle px-3 flex items-center font-body-sm text-body-sm text-text-muted">••••••••</div>
        ${v("field-btn")}
        <button class="w-full py-2.5 bg-text-primary text-surface-card rounded-lg font-label-md text-label-md" tabindex="-1" type="button">Se connecter</button>
      </div>`,
    },
    {
      name: "Notification",
      brief: "Le nom et le message forment un bloc serré, les actions se détachent, les deux boutons restent groupés.",
      tip: "Dans un composant horizontal, l'écart avatar → texte fixe la « respiration » de toute la ligne. Les boutons d'une même action doivent être plus proches entre eux qu'avec le texte qui les précède.",
      gaps: [
        { id: "avatar-text", label: "Avatar → texte", target: 16, axis: "h" },
        { id: "name-msg", label: "Nom → message", target: 4 },
        { id: "msg-actions", label: "Message → actions", target: 16 },
        { id: "btn-btn", label: "Bouton → bouton", target: 8, axis: "h" },
      ],
      html: `<div class="w-full max-w-md bg-surface-card rounded-xl shadow-sm p-4 flex items-start">
        <div class="w-10 h-10 rounded-full bg-domain-typography flex items-center justify-center font-mono-sm text-mono-sm font-bold text-text-primary shrink-0">LM</div>
        ${h("avatar-text")}
        <div class="flex flex-col flex-1 min-w-0">
          <span class="font-label-md text-label-md text-text-primary">Léa Martin</span>
          ${v("name-msg")}
          <p class="font-body-sm text-body-sm text-text-muted">A commenté ta planche « Affiche Bauhaus » : le crénage du titre est parfait.</p>
          ${v("msg-actions")}
          <div class="flex items-center">
            <button class="px-3 py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md" tabindex="-1" type="button">Répondre</button>
            ${h("btn-btn")}
            <button class="px-3 py-1.5 rounded-lg bg-surface-container text-text-primary font-label-md text-label-md" tabindex="-1" type="button">Ignorer</button>
          </div>
        </div>
      </div>`,
    },
    {
      name: "Carte tarif",
      brief: "Le libellé surplombe le prix de près, la liste a un rythme régulier, le bouton est bien isolé.",
      tip: "Une liste se lit comme un seul bloc quand l'écart entre ses lignes est nettement plus petit que l'écart qui la sépare du reste. Un rythme irrégulier entre les items fait croire à des sous-groupes qui n'existent pas.",
      gaps: [
        { id: "pad", label: "Marge interne", target: 24, pad: true },
        { id: "label-price", label: "Libellé → prix", target: 8 },
        { id: "price-list", label: "Prix → liste", target: 24 },
        { id: "item-item", label: "Ligne → ligne (×2)", target: 8 },
        { id: "list-btn", label: "Liste → bouton", target: 32 },
      ],
      html: `<div class="w-full max-w-xs bg-surface-card rounded-xl shadow-sm flex flex-col" data-pad="pad">
        <span class="font-label-caps text-label-caps text-text-muted">Parcours complet</span>
        ${v("label-price")}
        <div class="flex items-baseline gap-2"><span class="font-headline-lg text-headline-lg text-text-primary">19 €</span><span class="font-body-sm text-body-sm text-text-muted">une seule fois</span></div>
        ${v("price-list")}
        <div class="flex items-center gap-2 font-body-sm text-body-sm text-text-primary"><span class="material-symbols-outlined text-primary-container text-[18px]">done</span>14 micro-défis commentés</div>
        ${v("item-item")}
        <div class="flex items-center gap-2 font-body-sm text-body-sm text-text-primary"><span class="material-symbols-outlined text-primary-container text-[18px]">done</span>Fiches de synthèse</div>
        ${v("item-item")}
        <div class="flex items-center gap-2 font-body-sm text-body-sm text-text-primary"><span class="material-symbols-outlined text-primary-container text-[18px]">done</span>Accès à vie</div>
        ${v("list-btn")}
        <button class="w-full py-3 bg-primary-container text-on-primary rounded-lg font-label-md text-label-md" tabindex="-1" type="button">Rejoindre le parcours</button>
      </div>`,
    },
    {
      name: "Carte profil",
      brief: "Le nom et le rôle sont presque soudés, les statistiques sont bien espacées entre elles.",
      tip: "Un nom et sa fonction sont une seule information : un écart micro (4px) suffit. Des statistiques côte à côte ont besoin d'un écart très large pour que chaque chiffre reste associé à son propre libellé.",
      gaps: [
        { id: "avatar-name", label: "Avatar → nom", target: 16 },
        { id: "name-role", label: "Nom → rôle", target: 4 },
        { id: "role-stats", label: "Rôle → statistiques", target: 24 },
        { id: "stat-stat", label: "Statistique → statistique (×2)", target: 32, axis: "h" },
        { id: "stats-btn", label: "Statistiques → bouton", target: 24 },
      ],
      html: `<div class="w-full max-w-xs bg-surface-card rounded-xl shadow-sm p-6 flex flex-col items-center text-center">
        <div class="w-16 h-16 rounded-full bg-domain-color flex items-center justify-center font-headline-md text-headline-md text-text-primary">É</div>
        ${v("avatar-name")}
        <span class="font-headline-sm text-headline-sm text-text-primary">Élise Bernard</span>
        ${v("name-role")}
        <span class="font-body-sm text-body-sm text-text-muted">Directrice artistique</span>
        ${v("role-stats")}
        <div class="flex items-start">
          <div class="flex flex-col"><span class="font-mono-metric text-mono-metric font-bold text-text-primary">128</span><span class="font-mono-sm text-mono-sm text-text-muted">défis</span></div>
          ${h("stat-stat")}
          <div class="flex flex-col"><span class="font-mono-metric text-mono-metric font-bold text-text-primary">96%</span><span class="font-mono-sm text-mono-sm text-text-muted">justesse</span></div>
          ${h("stat-stat")}
          <div class="flex flex-col"><span class="font-mono-metric text-mono-metric font-bold text-text-primary">14j</span><span class="font-mono-sm text-mono-sm text-text-muted">série</span></div>
        </div>
        ${v("stats-btn")}
        <button class="w-full py-2.5 bg-surface-container text-text-primary rounded-lg font-label-md text-label-md" tabindex="-1" type="button">Suivre</button>
      </div>`,
    },
    {
      name: "Aperçu d'article",
      brief: "Catégorie, titre et extrait forment un bloc serré ; l'auteur ferme la carte avec plus d'air.",
      tip: "La marge interne d'une carte doit être au moins égale au plus grand écart intérieur : sinon le contenu paraît trop à l'étroit dans son cadre, même si chaque écart pris seul est juste.",
      gaps: [
        { id: "pad", label: "Marge interne", target: 16, pad: true },
        { id: "cat-title", label: "Catégorie → titre", target: 8 },
        { id: "title-excerpt", label: "Titre → extrait", target: 8 },
        { id: "excerpt-author", label: "Extrait → auteur", target: 16 },
      ],
      html: `<div class="w-full max-w-sm bg-surface-card rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div class="h-28 bg-domain-vector/60 flex items-center justify-center"><span class="material-symbols-outlined text-[40px] text-text-primary/60">image</span></div>
        <div class="flex flex-col" data-pad="pad">
          <span class="font-label-caps text-label-caps text-primary-container">Composition</span>
          ${v("cat-title")}
          <h4 class="font-headline-sm text-headline-sm text-text-primary">Pourquoi la grille de 8 points a gagné</h4>
          ${v("title-excerpt")}
          <p class="font-body-sm text-body-sm text-text-muted">Des multiples simples, un rythme prévisible et des écrans qui se redimensionnent sans casser l'équilibre.</p>
          ${v("excerpt-author")}
          <div class="flex items-center gap-2"><span class="w-6 h-6 rounded-full bg-domain-composition"></span><span class="font-mono-sm text-mono-sm text-text-muted">Par Malo · 4 min</span></div>
        </div>
      </div>`,
    },
  ];

  const order = Oeil.shuffle(TEMPLATES);

  function apply(s, spacing) {
    s.t.gaps.forEach((g) => {
      const px = spacing[g.id];
      if (g.pad) s.root.querySelectorAll(`[data-pad="${g.id}"]`).forEach((n) => { n.style.padding = `${px}px`; n.style.setProperty("--pad", `${px}px`); });
      else s.root.querySelectorAll(`[data-gap="${g.id}"]`).forEach((n) => { if (n.classList.contains("sr-h")) n.style.width = `${px}px`; else n.style.height = `${px}px`; });
    });
    placePadHandles(s, spacing);
  }

  function placePadHandles(s, spacing) {
    const k = s.k || 1;
    (s.padHandles || []).forEach(({ el, node, id }) => {
      const r = node.getBoundingClientRect(), b = s.root.getBoundingClientRect();
      el.style.left = `${(r.left - b.left) / k + spacing[id]}px`;
      el.style.top = `${(r.top - b.top) / k + spacing[id]}px`;
    });
  }

  function select(s, id) {
    s.sel = id;
    s.root.querySelectorAll("[data-gap]").forEach((n) => n.classList.toggle("is-active", n.dataset.gap === id));
    s.root.querySelectorAll("[data-pad]").forEach((n) => n.classList.toggle("sr-pad-active", n.dataset.pad === id));
    const g = s.t.gaps.find((x) => x.id === id);
    if (s.readout) s.readout.innerHTML = `<b class="text-ink">${g.label}</b> · attendu : ${tokenName(g.target)}`;
  }

  // Agrandit le composant pour qu'il occupe le plateau (les glissés sont divisés par l'échelle).
  function fitRoot(board, s) {
    s.root.style.transform = "";
    const w = s.root.firstElementChild.offsetWidth, h = s.root.firstElementChild.offsetHeight;
    s.k = Math.max(1, Math.min(1.15, (board.clientWidth - 80) / w, (board.clientHeight - 90) / h));
    s.root.style.transform = `scale(${s.k})`;
  }

  function setGap(s, id, px) { s.values[id] = Oeil.clamp(Math.round(px), 0, MAX_GAP); apply(s, s.values); }

  Oeil.play({
    id: "spacing-repair", name: "Spacing Repair",
    howto: [
      { icon: "height", text: "Les bandes bleues sont les écarts de l'interface. Attrape-en une et étire-la vers le haut ou le bas (ou sur le côté)." },
      { icon: "straighten", text: "Chaque écart a un niveau attendu (micro, serré, moyen, large, très large) : compare-le à la règle sous le plateau." },
      { icon: "visibility", text: "Les repères bleus gênent ? « Aperçu sans repères » (touche V) montre le rendu réel." },
      { icon: "keyboard", text: "Tab pour passer d'un écart à l'autre, ↑ ↓ pour l'ajuster au pixel, Entrée pour valider." },
    ],
    brief: (s) => s.t.brief,
    hint: { label: "Grille 8 px", run(s) { s.root.parentElement.classList.toggle("sr-show-grid"); } },

    setup(round) {
      const t = order[round % order.length];
      const values = {};
      t.gaps.forEach((g) => {
        let px;
        do { px = g.target + (4 + Math.floor(Math.random() * 9)) * (Math.random() < 0.5 ? -1 : 1); } while (px < 0 || px > MAX_GAP);
        values[g.id] = px;
      });
      return { t, values, start: { ...values }, sel: t.gaps[0].id };
    },

    mount(board, s, api) {
      const frame = api.h("div", "sr-frame");
      frame.innerHTML = `<div class="sr-grid-overlay"></div>`;
      s.root = api.h("div", "relative flex justify-center sr-repairing", s.t.html);
      s.root.style.cssText = "transform-origin:center;width:28rem;max-width:100%";
      frame.append(s.root);
      board.append(frame);
      s.t.gaps.forEach((g) => {
        if (g.pad) return;
        s.root.querySelectorAll(`[data-gap="${g.id}"]`).forEach((n) => {
          n.classList.add("grab");
          n.tabIndex = 0;
          n.setAttribute("role", "slider");
          n.setAttribute("aria-label", g.label);
          n.addEventListener("focus", () => select(s, g.id));
          const horiz = n.classList.contains("sr-h");
          api.drag(n, {
            start: () => { select(s, g.id); return { v: s.values[g.id] }; },
            move: (dx, dy, ev, c) => setGap(s, g.id, c.v + (horiz ? dx : dy) / s.k),
          });
        });
      });
      s.padHandles = [];
      s.t.gaps.filter((g) => g.pad).forEach((g) => {
        s.root.querySelectorAll(`[data-pad="${g.id}"]`).forEach((node) => {
          const el = api.h("span", "handle sr-pad-handle");
          el.tabIndex = 0;
          el.setAttribute("aria-label", g.label);
          el.title = "Marge interne : glisse en diagonale";
          el.addEventListener("focus", () => select(s, g.id));
          api.drag(el, {
            start: () => { select(s, g.id); return { v: s.values[g.id] }; },
            move: (dx, dy, ev, c) => setGap(s, g.id, c.v + (dx + dy) / 2 / s.k),
          });
          s.root.append(el);
          s.padHandles.push({ el, node, id: g.id });
        });
      });
      api.controls.innerHTML = `<button aria-pressed="false" class="btn-line btn-sm" id="sr-clean" type="button"><span class="material-symbols-outlined text-[18px]">visibility</span>Aperçu sans repères <kbd>V</kbd></button><span class="sr-ruler" aria-label="Règle d'atelier">${SCALE.map((x) => `<span><i style="height:${x.px}px"></i>${x.px}</span>`).join("")}</span><span class="ctl-hint" id="sr-readout"></span>`;
      s.readout = api.controls.querySelector("#sr-readout");
      s.toggleClean = () => {
        const on = s.root.classList.toggle("sr-clean");
        const b = api.controls.querySelector("#sr-clean");
        if (b) { b.setAttribute("aria-pressed", String(on)); b.lastChild.previousSibling.textContent = on ? "Afficher les repères " : "Aperçu sans repères "; }
      };
      api.controls.querySelector("#sr-clean").addEventListener("click", () => s.toggleClean());
      apply(s, s.values);
      fitRoot(board, s);
      select(s, s.sel);
      requestAnimationFrame(() => placePadHandles(s, s.values));
    },

    keys(e, s) {
      if (e.key === "v" || e.key === "V") { s.toggleClean(); return; }
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
      e.preventDefault();
      const d = (e.shiftKey ? 4 : 1) * (e.key === "ArrowUp" || e.key === "ArrowRight" ? 1 : -1);
      setGap(s, s.sel, s.values[s.sel] + d);
    },

    resize(board, s) { fitRoot(board, s); placePadHandles(s, s.view === "target" ? s.target : s.values); if (s.retag) s.retag(); },

    evaluate(s) {
      const d = s.t.gaps.map((g) => {
        const err = s.values[g.id] - g.target, a = Math.abs(err);
        return { ...g, value: s.values[g.id], err, score: a <= TOL ? 100 : Math.max(0, 100 - (a - TOL) * 8) };
      });
      s.details = d;
      const ok = d.filter((x) => Math.abs(x.err) <= TOL).length;
      const worst = d.reduce((a, x) => (Math.abs(x.err) > Math.abs(a.err) ? x : a));
      return {
        score: d.reduce((a, x) => a + x.score, 0) / d.length,
        metrics: [
          { label: "Écarts dans la tolérance", value: `${ok} sur ${d.length}`, good: ok === d.length },
          { label: "Écart moyen", value: `± ${(d.reduce((a, x) => a + Math.abs(x.err), 0) / d.length).toFixed(1)} px` },
          { label: "Le plus loin", value: Math.abs(worst.err) <= TOL ? "aucun" : `${worst.label}, ${worst.err > 0 ? "trop large" : "trop serré"}`, good: Math.abs(worst.err) <= TOL },
        ],
        principle: s.t.tip,
      };
    },

    reveal(board, s, r, api) {
      s.root.classList.remove("sr-repairing");
      (s.padHandles || []).forEach(({ el }) => el.remove());
      s.target = Object.fromEntries(s.t.gaps.map((g) => [g.id, g.target]));
      const tags = () => {
        s.root.querySelectorAll(".sr-tag, .sr-leader").forEach((n) => n.remove());
        s.details.forEach((d) => {
          const node = s.root.querySelector(d.pad ? `[data-pad="${d.id}"]` : `[data-gap="${d.id}"]`);
          if (!node) return;
          const good = Math.abs(d.err) <= TOL;
          const tag = api.h("span", (good ? "tag-you" : "tag-ref") + " sr-tag", good ? `${d.target} ✓` : `${d.value} → ${d.target}`);
          const rr = node.getBoundingClientRect(), b = s.root.getBoundingClientRect(), k = s.k;
          const card = s.root.firstElementChild.getBoundingClientRect();
          tag.style.transform = `translateY(-50%) scale(${1 / k})`;
          tag.style.transformOrigin = "left center";
          if (d.pad) { tag.style.left = `${(card.right - b.left) / k + 10}px`; tag.style.top = `${(card.top - b.top) / k + 10}px`; tag.textContent = `marge ${tag.textContent}`; }
          else if (node.classList.contains("sr-h")) { tag.style.left = `${(rr.left - b.left) / k}px`; tag.style.top = `${(rr.top - b.top) / k - 12}px`; tag.style.transform = `translate(-25%, -100%) scale(${1 / k})`; }
          else { tag.style.left = `${(card.right - b.left) / k + 10}px`; tag.style.top = `${(rr.top - b.top + rr.height / 2) / k}px`; }
          const line = api.h("span", "sr-leader");
          if (!d.pad && !node.classList.contains("sr-h")) { line.style.cssText = `left:${(rr.right - b.left) / k}px;width:${(card.right - rr.right) / k + 10}px;top:${(rr.top - b.top + rr.height / 2) / k}px`; s.root.append(line); }
          s.root.append(tag);
        });
      };
      s.retag = () => requestAnimationFrame(tags);
      const setView = (view) => {
        s.view = view;
        apply(s, view === "target" ? s.target : s.values);
        api.controls.querySelectorAll("[data-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.view === view)));
        requestAnimationFrame(tags);
      };
      api.controls.innerHTML = `<div class="seg-line" role="group" aria-label="Version affichée"><button data-view="user" type="button">Ta version</button><button data-view="target" type="button">Correction</button></div>`;
      api.controls.querySelectorAll("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));
      setView("user");
    },
  });
})();
