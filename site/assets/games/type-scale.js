// Type Scale — une échelle typographique se résume à une taille de base et un rapport : retrouve-les à l'œil.
(function () {
  const RATIOS = [
    { r: 1.125, name: "Seconde majeure", use: "très resserré, pour les interfaces denses" },
    { r: 1.2, name: "Tierce mineure", use: "discret, pour les applications et tableaux de bord" },
    { r: 1.25, name: "Tierce majeure", use: "polyvalent, pour la plupart des sites" },
    { r: 1.333, name: "Quarte juste", use: "affirmé, pour les sites éditoriaux" },
    { r: 1.5, name: "Quinte juste", use: "très contrasté, pour les pages d'accueil et les affiches" },
    { r: 1.618, name: "Nombre d'or", use: "spectaculaire, à réserver aux pages très courtes" },
  ];
  const LEVELS = [
    { name: "Titre", token: "text-3xl", step: 3, text: "Regard", weight: 600 },
    { name: "Sous-titre", token: "text-2xl", step: 2, text: "Cinq minutes", weight: 600 },
    { name: "Intertitre", token: "text-xl", step: 1, text: "Chaque jour", weight: 500 },
    { name: "Corps", token: "text-base", step: 0, text: "La correction se pose sur ta version.", weight: 400 },
    { name: "Légende", token: "text-sm", step: -1, text: "Atelier de typographie", weight: 400 },
  ];
  const ZOOM = 0.72;
  const px = (b, r, l) => b * Math.pow(r, l.step);
  const page = (b, r) => LEVELS.map((l) => `<span data-step="${l.step}" style="font-size:${px(b, r, l) * ZOOM}px;font-weight:${l.weight}">${l.text}</span>`).join("");
  function draw(s) {
    s.mine.innerHTML = page(s.base, s.ratio);
    s.table.innerHTML = LEVELS.map((l) => `<p class="insp-row"><span>${l.token}</span><b>${Math.round(px(s.base, s.ratio, l))} px</b></p>`).join("");
    s.btns.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.r === s.ratio)));
  }
  Oeil.play({
    id: "type-scale", name: "Type Scale",
    howto: [
      { icon: "format_size", text: "Une échelle typographique se construit avec une taille de base et un rapport : chaque niveau multiplie le précédent." },
      { icon: "tune", text: "Dans le panneau, règle la taille de base et choisis un rapport. Tes variables de texte se recalculent." },
      { icon: "compare", text: "Compare ta page au modèle : regarde surtout l'écart entre le titre et le corps." },
    ],
    brief: "Retrouve la taille de base et le rapport de l'échelle du modèle.",
    setup() {
      const t = Oeil.pick(RATIOS), base = Oeil.randi(14, 18);
      const start = Oeil.pick(RATIOS.filter((x) => Math.abs(x.r - t.r) > 0.1));
      return { t, tBase: base, ratio: start.r, base: base >= 16 ? base - 2 : base + 2 };
    },
    mount(board, s, api) {
      const shell = api.h("div", "insp-wrap"), panel = api.h("div", "insp", `<p class="insp-title">Échelle</p>`);
      s.panel = panel;
      s.fBase = Oeil.field({ label: "Taille de base", unit: "px", min: 12, max: 22, value: s.base, onChange: (v) => { s.base = v; draw(s); } });
      panel.append(s.fBase.el);
      const list = api.h("div", "insp-list");
      s.btns = RATIOS.map((x) => {
        const b = api.h("button", "", `<span>${x.name}</span><b>${String(x.r).replace(".", ",")}</b>`);
        b.type = "button"; b.dataset.r = x.r;
        b.addEventListener("click", () => { if (api.phase !== "play") return; s.ratio = x.r; draw(s); });
        list.append(b);
        return b;
      });
      s.table = api.h("div", "insp-table");
      panel.append(list, api.h("p", "insp-title", "Variables de texte"), s.table);
      const canvas = api.h("div", "insp-canvas ts-canvas");
      canvas.innerHTML = `<figure><figcaption>Modèle</figcaption><div class="ts-page">${page(s.tBase, s.t.r)}</div></figure><figure><figcaption>Ta version</figcaption><div class="ts-page" data-mine></div></figure>`;
      s.mine = canvas.querySelector("[data-mine]");
      shell.append(panel, canvas);
      board.append(shell);
      draw(s);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">tune</span>Glisse sur « Taille de base » ou tape la valeur</span>`;
    },
    evaluate(s) {
      const err = LEVELS.reduce((a, l) => a + Math.abs(Math.log(px(s.base, s.ratio, l) / px(s.tBase, s.t.r, l))), 0) / LEVELS.length;
      const mine = RATIOS.find((x) => x.r === s.ratio);
      const same = mine === s.t;
      return {
        score: Math.max(0, 100 - Math.max(0, err - 0.01) * 450),
        metrics: [
          { label: "Taille de base", value: `${s.base} px (modèle ${s.tBase} px)`, good: s.base === s.tBase },
          { label: "Rapport", value: `${String(s.ratio).replace(".", ",")} (modèle ${String(s.t.r).replace(".", ",")})`, good: same },
        ],
        principle: `Le modèle utilise la ${s.t.name.toLowerCase().startsWith("nombre") ? "proportion du nombre d'or" : s.t.name.toLowerCase()}, un rapport ${s.t.use}. Les noms viennent de la musique : une échelle fonctionne comme une gamme, chaque taille garde le même intervalle avec la suivante.`,
      };
    },
    reveal(board, s) {
      s.panel.classList.add("is-locked");
      s.mine.classList.add("ts-done");
      s.mine.insertAdjacentHTML("beforeend", `<div class="ts-ghost">${page(s.tBase, s.t.r)}</div>`);
    },
  });
})();
