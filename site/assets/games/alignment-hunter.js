// Alignment Hunter — quelques éléments sont décalés de 2 à 5 px. Trouve-les tous, sans fausse alerte.
(function () {
  const NAMES = ["Léa Martin", "Malo Ferrand", "Inès Roux", "Yanis Caron", "Chloé Petit", "Sacha Morel", "Nina Vidal", "Hugo Laurent"];
  const ROLES = ["Directrice artistique", "Designer produit", "Typographe", "Illustrateur", "Designer UI", "Motion designer", "Chercheuse UX", "Développeur front"];
  const TYPES = ["list", "grid", "form"];

  function build(type) {
    const items = [];
    if (type === "list") {
      for (let i = 0; i < 7; i++) items.push({ x: 0, y: i * 58, w: 380, h: 46, html: `<span class="ah-avatar"></span><span><b>${NAMES[i]}</b><small>${ROLES[i]}</small></span>`, cls: "ah-row" });
    } else if (type === "grid") {
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) items.push({ x: c * 156, y: r * 112, w: 140, h: 96, html: `<span class="ah-thumb"></span><small>${NAMES[r * 3 + c] || "Projet"}</small>`, cls: "ah-card" });
    } else {
      ["Nom", "Adresse e-mail", "Entreprise", "Message"].forEach((l, i) => {
        items.push({ x: 0, y: i * 84, w: 400, h: 20, html: `<small>${l}</small>`, cls: "ah-label" });
        items.push({ x: 0, y: i * 84 + 24, w: 400, h: 40, html: "", cls: "ah-field" });
      });
    }
    return items;
  }

  Oeil.play({
    id: "alignment-hunter", name: "Alignment Hunter",
    howto: [
      { icon: "search", text: "Certains éléments sont décalés de quelques pixels par rapport à leurs voisins." },
      { icon: "touch_app", text: "Clique sur chaque élément décalé pour le marquer. Reclique pour annuler." },
      { icon: "check", text: "Valide quand tu as tout trouvé. Les fausses alertes coûtent des points." },
    ],
    brief: (s) => `Marque les éléments décalés (il y en a ${s.bad.length}).`,
    hint: { label: "Plisser les yeux", run(s) { s.box.classList.toggle("ah-blur"); } },
    setup(round) {
      const type = TYPES[round % TYPES.length];
      const items = build(type);
      const n = round < 2 ? 2 : 3;
      const bad = Oeil.shuffle(items.map((_, i) => i)).slice(0, n);
      bad.forEach((i) => {
        const d = Oeil.randi(2, 5) * (Math.random() < 0.5 ? -1 : 1);
        const axis = type === "grid" && Math.random() < 0.5 ? "y" : "x";
        items[i].off = { axis, d };
        items[i][axis] += d;
      });
      return { type, items, bad, picked: new Set() };
    },
    mount(board, s, api) {
      const W = Math.max(...s.items.map((i) => i.x + i.w)), H = Math.max(...s.items.map((i) => i.y + i.h));
      s.box = api.h("div", "ah-box");
      s.box.style.cssText = `width:${W}px;height:${H}px`;
      s.els = s.items.map((it, i) => {
        const el = api.h("button", `ah-item pickable ${it.cls}`, it.html);
        el.type = "button";
        el.style.cssText = `left:${it.x}px;top:${it.y}px;width:${it.w}px;height:${it.h}px`;
        el.setAttribute("aria-pressed", "false");
        el.addEventListener("click", () => {
          if (api.phase !== "play") return;
          s.picked.has(i) ? s.picked.delete(i) : s.picked.add(i);
          el.classList.toggle("is-picked", s.picked.has(i));
          el.setAttribute("aria-pressed", String(s.picked.has(i)));
          s.count.textContent = `${s.picked.size} marqué${s.picked.size > 1 ? "s" : ""}`;
        });
        s.box.append(el);
        return el;
      });
      board.append(s.box);
      fit(board, s, W, H);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Clique pour marquer</span><span class="ctl-hint" id="ah-count">0 marqué</span>`;
      s.count = api.controls.querySelector("#ah-count");
    },
    resize(board, s) { fit(board, s, s.box.offsetWidth, s.box.offsetHeight); },
    evaluate(s) {
      const hits = s.bad.filter((i) => s.picked.has(i)).length;
      const fa = [...s.picked].filter((i) => !s.bad.includes(i)).length;
      return {
        score: Math.max(0, (hits / s.bad.length) * 100 - fa * 25),
        metrics: [
          { label: "Trouvés", value: `${hits} sur ${s.bad.length}`, good: hits === s.bad.length },
          { label: "Fausses alertes", value: `${fa}`, good: fa === 0 },
        ],
        principle: "Un décalage de 2 à 3 px suffit à casser une colonne : l'œil suit les bords alignés comme une ligne invisible. Dans un outil, aligne toujours sur un bord commun plutôt qu'à l'œil.",
      };
    },
    reveal(board, s, r, api) {
      s.box.classList.remove("ah-blur");
      s.els.forEach((el, i) => {
        el.disabled = true;
        const it = s.items[i];
        if (it.off) {
          el.classList.add(s.picked.has(i) ? "ah-found" : "ah-missed");
          const g = api.h("span", "ah-guide" + (it.off.axis === "y" ? " ah-guide-h" : ""));
          g.style.cssText = it.off.axis === "x" ? `left:${it.x - it.off.d}px;top:-12px;bottom:-12px` : `top:${it.y - it.off.d}px;left:-12px;right:-12px`;
          s.box.append(g);
          const t = api.h("span", "tag-ref", `${it.off.d > 0 ? "+" : ""}${it.off.d} px`);
          t.style.cssText = `left:${it.x + it.w + 8}px;top:${it.y + it.h / 2 - 10}px`;
          if (s.type === "grid") t.style.cssText = `left:${it.x + 4}px;top:${it.y + 4}px`;
          s.box.append(t);
        } else if (s.picked.has(i)) el.classList.add("ah-false");
      });
    },
  });

  function fit(board, s, W, H) {
    const k = Math.min(1.5, (board.clientWidth - 48) / W, (board.clientHeight - 60) / H);
    s.box.style.transform = `translate(-50%, -50%) scale(${k})`;
  }
})();
