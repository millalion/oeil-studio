// Auto Layout — un composant se décrit par son sens, son espacement et ses marges : retrouve-les, comme dans Figma.
(function () {
  const STEPS = [0, 4, 8, 12, 16, 24, 32];
  const H = [["start", "Gauche"], ["center", "Centre"], ["end", "Droite"]];
  const V = [["start", "Haut"], ["center", "Milieu"], ["end", "Bas"]];
  const PIECES = [[`<i class="al-av"></i>`, `<i class="al-tx"></i>`, `<i class="al-bt"></i>`], [`<i class="al-ic"></i>`, `<i class="al-tx"></i>`], [`<i class="al-im"></i>`, `<i class="al-tx"></i>`, `<i class="al-tx al-s"></i>`], [`<i class="al-bt"></i>`, `<i class="al-bt al-q"></i>`, `<i class="al-bt al-q"></i>`]];
  // Figma raisonne en gauche/droite et haut/bas : en CSS, les deux axes s'échangent selon le sens
  const box = (p, pieces) => { const main = p.spread ? "space-between" : p.dir === "row" ? p.h : p.v, cross = p.dir === "row" ? p.v : p.h; return `<div class="al-box" style="flex-direction:${p.dir};gap:${p.gap}px;padding:${p.pad}px;justify-content:${main};align-items:${cross}">${pieces.join("")}</div>`; };
  function draw(s) {
    s.mine.innerHTML = box(s.p, s.pieces);
    s.segs.forEach((b) => b.setAttribute("aria-pressed", String(String(s.p[b.dataset.k]) === b.dataset.v)));
  }
  Oeil.play({
    id: "auto-layout", name: "Auto Layout", levels: true,
    howto: [
      { icon: "view_agenda", text: "L'Auto Layout de Figma range des éléments dans un cadre. Il se règle avec quelques valeurs." },
      { icon: "tune", text: "Choisis le sens, l'espace, la marge et l'alignement (gauche, centre, droite) pour reproduire le modèle." },
      { icon: "lightbulb", text: "En mode Avancé, il faut aussi régler l'alignement vertical et la répartition automatique." },
    ],
    brief: "Reproduis le modèle : sens, espace, marge et alignement.",
    setup(round, api) {
      const adv = api.level === "adv";
      const t = { dir: Oeil.pick(["row", "column"]), gap: Oeil.pick(STEPS.slice(1, 6)), pad: Oeil.pick(STEPS.slice(2)), h: Oeil.pick(H)[0], v: adv ? Oeil.pick(V)[0] : "center", spread: adv && Math.random() < 0.3 };
      return { adv, t, pieces: Oeil.pick(PIECES), p: { dir: t.dir === "row" ? "column" : "row", gap: 0, pad: 0, h: "center", v: "center", spread: false } };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "al-wrap");
      const group = (key, title, opts) => `<div class="al-group"><p>${title}</p><div class="seg-line">${opts.map(([v, l]) => `<button data-k="${key}" data-v="${v}" type="button">${l}</button>`).join("")}</div></div>`;
      const panel = api.h("div", "al-panel", group("dir", "Sens", [["row", "→"], ["column", "↓"]]) + group("gap", "Espace entre les éléments", STEPS.map((n) => [n, n])) + group("pad", "Marge intérieure", STEPS.map((n) => [n, n])) + group("h", "Alignement horizontal", H) + (s.adv ? group("v", "Alignement vertical", V) + group("spread", "Répartition", [["false", "Groupés"], ["true", "Espacés"]]) : ""));
      const stage = api.h("div", "al-stage", `<figure><figcaption>Modèle</figcaption>${box(s.t, s.pieces)}</figure><figure><figcaption>Ta version</figcaption><div data-mine></div></figure>`);
      s.mine = stage.querySelector("[data-mine]");
      s.panel = panel; s.stage = stage;
      wrap.append(stage, panel);
      board.append(wrap);
      s.segs = [...panel.querySelectorAll("button")];
      s.segs.forEach((b) => b.addEventListener("click", () => { if (api.phase !== "play") return; const k = b.dataset.k; s.p[k] = k === "gap" || k === "pad" ? +b.dataset.v : k === "spread" ? b.dataset.v === "true" : b.dataset.v; draw(s); }));
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">tune</span>Les espacements suivent une échelle de 4 en 4, puis de 8 en 8</span>`;
    },
    evaluate(s) {
      const near = (a, b) => { const d = Math.abs(STEPS.indexOf(a) - STEPS.indexOf(b)); return d === 0 ? 1 : d === 1 ? 0.5 : 0; };
      const same = (k) => (s.p[k] === s.t[k] ? 1 : 0);
      const parts = [same("dir"), near(s.p.gap, s.t.gap), near(s.p.pad, s.t.pad), same("h"), ...(s.adv ? [same("v"), same("spread")] : [])];
      const lab = (l, v) => l.find((a) => a[0] === v)[1];
      const name = (v) => (v === "row" ? "horizontal" : "vertical");
      return {
        score: (parts.reduce((a, b) => a + b, 0) / parts.length) * 100,
        metrics: [
          { label: "Sens", value: `${name(s.p.dir)} (modèle ${name(s.t.dir)})`, good: parts[0] === 1 },
          { label: "Espace", value: `${s.p.gap} (modèle ${s.t.gap})`, good: parts[1] === 1 },
          { label: "Marge", value: `${s.p.pad} (modèle ${s.t.pad})`, good: parts[2] === 1 },
          { label: "Alignement horizontal", value: `${lab(H, s.p.h)} (modèle ${lab(H, s.t.h)})`, good: parts[3] === 1 },
          ...(s.adv ? [{ label: "Alignement vertical", value: `${lab(V, s.p.v)} (modèle ${lab(V, s.t.v)})`, good: parts[4] === 1 }, { label: "Répartition", value: `${s.p.spread ? "espacés" : "groupés"} (modèle ${s.t.spread ? "espacés" : "groupés"})`, good: parts[5] === 1 }] : []),
        ],
        principle: "Une bonne règle : la marge intérieure est au moins égale à l'espace entre les éléments. Sinon, les éléments paraissent plus liés au bord qu'entre eux. C'est la loi de proximité.",
      };
    },
    reveal(board, s) {
      s.panel.classList.add("is-locked");
      s.segs.forEach((b) => { if (String(s.t[b.dataset.k]) === b.dataset.v) b.classList.add("al-right"); });
    },
  });
})();
