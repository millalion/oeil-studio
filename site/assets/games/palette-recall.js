// Palette Recall — mémorise une palette de quatre couleurs, puis retrouve chacune parmi des nuances voisines.
(function () {
  const C = Oeil.color;
  const PALETTES = Oeil.shuffle([
    { name: "Atelier", colors: [{ h: 14, s: 58, l: 52 }, { h: 45, s: 78, l: 55 }, { h: 160, s: 30, l: 38 }, { h: 220, s: 25, l: 88 }] },
    { name: "Bord de mer", colors: [{ h: 200, s: 70, l: 40 }, { h: 190, s: 45, l: 70 }, { h: 40, s: 55, l: 82 }, { h: 15, s: 70, l: 60 }] },
    { name: "Herbier", colors: [{ h: 95, s: 30, l: 40 }, { h: 70, s: 45, l: 62 }, { h: 340, s: 35, l: 72 }, { h: 30, s: 20, l: 25 }] },
    { name: "Néon sage", colors: [{ h: 330, s: 80, l: 60 }, { h: 260, s: 30, l: 30 }, { h: 175, s: 55, l: 50 }, { h: 55, s: 85, l: 65 }] },
    { name: "Papeterie", colors: [{ h: 0, s: 0, l: 15 }, { h: 30, s: 25, l: 90 }, { h: 210, s: 55, l: 45 }, { h: 5, s: 75, l: 50 }] },
  ]);
  const near = (c) => {
    const opts = [c];
    const moves = Oeil.shuffle([[0, 0, 9], [0, 0, -9], [0, 16, 0], [0, -16, 0], [14, 0, 0], [-14, 0, 0], [8, 10, 5]]).slice(0, 4);
    moves.forEach(([dh, ds, dl]) => opts.push({ h: (c.h + dh + 360) % 360, s: Oeil.clamp(c.s + ds, 0, 100), l: Oeil.clamp(c.l + dl, 5, 95) }));
    return Oeil.shuffle(opts.map((o, i) => ({ ...o, ok: i === 0 })));
  };
  const lab = (c) => C.lab(C.hslToRgb(c.h, c.s, c.l));
  Oeil.play({
    id: "palette-recall", name: "Palette Recall",
    howto: [
      { icon: "palette", text: "Une palette de quatre couleurs s'affiche quatre secondes. Retiens chaque couleur et sa place." },
      { icon: "touch_app", text: "Pour chaque position, choisis la bonne nuance parmi cinq très proches." },
      { icon: "lightbulb", text: "Les leurres sont un peu plus clairs, plus sombres, plus vifs ou décalés en teinte." },
    ],
    brief: (s) => (s.phase === "memo" ? "Mémorise cette palette." : "Retrouve chaque couleur de la palette."),
    setup(round) {
      const p = PALETTES[round % PALETTES.length];
      return { p, cols: p.colors.map(near), picks: [null, null, null, null], phase: "memo" };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "pr-wrap");
      board.append(wrap);
      api.setSubmit(false);
const run = () => {
      wrap.innerHTML = `<div class="pr-memo">${s.p.colors.map((c) => `<span style="background:${C.hsl(c)}"></span>`).join("")}</div><p class="kit-count"><span>4</span></p>`;
      api.memoBar(4);
      let left = 4;
      clearInterval(s.iv);
      s.iv = setInterval(() => {
        left--;
        if (left > 0) { wrap.querySelector(".kit-count span").textContent = left; return; }
        clearInterval(s.iv);
        s.phase = "pick";
        api.setBrief("Retrouve chaque couleur de la palette, position par position.");
        wrap.innerHTML = s.cols.map((col, k) => `<div class="pr-col"><p class="pr-pos">Couleur ${k + 1}</p>${col.map((c, j) => `<button class="pr-opt pickable" data-k="${k}" data-j="${j}" style="background:${C.hsl(c)}" type="button" aria-label="Couleur ${k + 1}, option ${j + 1}"></button>`).join("")}</div>`).join("");
        wrap.querySelectorAll(".pr-opt").forEach((b) => b.addEventListener("click", () => {
          if (api.phase !== "play") return;
          const k = +b.dataset.k;
          s.picks[k] = +b.dataset.j;
          wrap.querySelectorAll(`.pr-opt[data-k="${k}"]`).forEach((x) => x.classList.toggle("is-picked", x === b));
          api.setSubmit(s.picks.every((x) => x != null));
        }));
      }, 1000);
      };
      api.memoGate(4, "cette palette", run);
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Une nuance par colonne</span>`;
    },
    evaluate(s) {
      clearInterval(s.iv);
      const scores = s.cols.map((col, k) => {
        const pick = col[s.picks[k]];
        if (!pick) return 0;
        return pick.ok ? 100 : Math.max(0, 100 - C.deltaE(lab(pick), lab(col.find((c) => c.ok))) * 5);
      });
      const right = s.cols.filter((col, k) => col[s.picks[k]] && col[s.picks[k]].ok).length;
      return {
        score: scores.reduce((a, b) => a + b, 0) / 4,
        metrics: [{ label: "Couleurs exactes", value: `${right} sur 4`, good: right === 4 }, { label: "Palette", value: s.p.name }],
        principle: "On retient mieux une palette par ses relations (la plus sombre, la plus vive, deux tons chauds) que couleur par couleur. C'est aussi comme ça qu'on la décrit à un client.",
      };
    },
    reveal(board, s) {
      board.querySelectorAll(".pr-opt").forEach((b) => {
        b.disabled = true;
        const c = s.cols[+b.dataset.k][+b.dataset.j];
        if (c.ok) b.classList.add("pr-right");
        else if (s.picks[+b.dataset.k] === +b.dataset.j) b.classList.add("pr-wrong");
      });
    },
  });
})();
