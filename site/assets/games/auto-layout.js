// Auto Layout — un composant se décrit par son sens, son espacement et ses marges : retrouve-les, comme dans Figma.
(function () {
  const STEPS = [0, 4, 8, 12, 16, 24, 32];
  const ALIGN = [["start", "Début"], ["center", "Centre"], ["end", "Fin"]];
  const PIECES = [[`<i class="al-av"></i>`, `<i class="al-tx"></i>`, `<i class="al-bt"></i>`], [`<i class="al-ic"></i>`, `<i class="al-tx"></i>`], [`<i class="al-im"></i>`, `<i class="al-tx"></i>`, `<i class="al-tx al-s"></i>`], [`<i class="al-bt"></i>`, `<i class="al-bt al-q"></i>`, `<i class="al-bt al-q"></i>`]];
  const pad2 = (n) => n;
  const box = (p, pieces) => `<div class="al-box" style="flex-direction:${p.dir};gap:${p.gap * 1.4}px;padding:${pad2(p.pad) * 1.4}px;align-items:${p.align}">${pieces.join("")}</div>`;
  function draw(s) {
    s.mine.innerHTML = box(s.p, s.pieces);
    s.segs.forEach((b) => b.setAttribute("aria-pressed", String(String(s.p[b.dataset.k]) === b.dataset.v)));
  }
  Oeil.play({
    id: "auto-layout", name: "Auto Layout", levels: true,
    howto: [
      { icon: "view_agenda", text: "L'Auto Layout de Figma range des éléments dans un cadre. Il se règle avec quelques valeurs." },
      { icon: "tune", text: "Choisis le sens, l'espace entre les éléments et la marge intérieure pour reproduire le modèle." },
      { icon: "lightbulb", text: "En mode Avancé, il faut aussi retrouver l'alignement." },
    ],
    brief: (s) => (s.adv ? "Retrouve le sens, l'espace, la marge et l'alignement du modèle." : "Retrouve le sens, l'espace et la marge du modèle."),
    setup(round, api) {
      const adv = api.level === "adv";
      const t = { dir: Oeil.pick(["row", "column"]), gap: Oeil.pick(STEPS.slice(1)), pad: Oeil.pick(STEPS.slice(2)), align: adv ? Oeil.pick(ALIGN)[0] : "center" };
      return { adv, t, pieces: Oeil.pick(PIECES), p: { dir: t.dir === "row" ? "column" : "row", gap: 0, pad: 0, align: "center" } };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "al-wrap");
      const group = (key, title, opts) => `<div class="al-group"><p>${title}</p><div class="seg-line">${opts.map(([v, l]) => `<button data-k="${key}" data-v="${v}" type="button">${l}</button>`).join("")}</div></div>`;
      const panel = api.h("div", "al-panel", group("dir", "Sens", [["row", "→"], ["column", "↓"]]) + group("gap", "Espace entre les éléments", STEPS.map((n) => [n, n])) + group("pad", "Marge intérieure", STEPS.map((n) => [n, n])) + (s.adv ? group("align", "Alignement", ALIGN) : ""));
      const stage = api.h("div", "al-stage", `<figure><figcaption>Modèle</figcaption>${box(s.t, s.pieces)}</figure><figure><figcaption>Ta version</figcaption><div data-mine></div></figure>`);
      s.mine = stage.querySelector("[data-mine]");
      s.panel = panel; s.stage = stage;
      wrap.append(stage, panel);
      board.append(wrap);
      s.segs = [...panel.querySelectorAll("button")];
      s.segs.forEach((b) => b.addEventListener("click", () => { if (api.phase !== "play") return; const k = b.dataset.k; s.p[k] = k === "gap" || k === "pad" ? +b.dataset.v : b.dataset.v; draw(s); }));
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">tune</span>Les espacements suivent une échelle de 4 en 4, puis de 8 en 8</span>`;
    },
    evaluate(s) {
      const near = (a, b) => { const d = Math.abs(STEPS.indexOf(a) - STEPS.indexOf(b)); return d === 0 ? 1 : d === 1 ? 0.5 : 0; };
      const parts = [s.p.dir === s.t.dir ? 1 : 0, near(s.p.gap, s.t.gap), near(s.p.pad, s.t.pad), ...(s.adv ? [s.p.align === s.t.align ? 1 : 0] : [])];
      const name = (v) => (v === "row" ? "horizontal" : "vertical");
      return {
        score: (parts.reduce((a, b) => a + b, 0) / parts.length) * 100,
        metrics: [
          { label: "Sens", value: `${name(s.p.dir)} (modèle ${name(s.t.dir)})`, good: parts[0] === 1 },
          { label: "Espace", value: `${s.p.gap} (modèle ${s.t.gap})`, good: parts[1] === 1 },
          { label: "Marge", value: `${s.p.pad} (modèle ${s.t.pad})`, good: parts[2] === 1 },
          ...(s.adv ? [{ label: "Alignement", value: `${ALIGN.find((a) => a[0] === s.p.align)[1]} (modèle ${ALIGN.find((a) => a[0] === s.t.align)[1]})`, good: parts[3] === 1 }] : []),
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
