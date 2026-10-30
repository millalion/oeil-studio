// Weight Match — la graisse perçue change avec la taille : retrouve celle de la référence.
(function () {
  const WORDS = Oeil.fresh("weight-match", ["Rythme", "Atelier", "Contraste", "Œil", "Graisse", "Signal", "Échelle"]);
  const MIN = 100, MAX = 900;

  function apply(s) {
    s.mine.style.fontWeight = Math.round(s.w);
    s.handle.style.left = `${((s.w - MIN) / (MAX - MIN)) * 100}%`;
  }

  Oeil.play({
    id: "weight-match", name: "Weight Match",
    howto: [
      { icon: "compare", text: "À gauche, la référence. À droite, le même mot à une autre taille." },
      { icon: "swipe", text: "Glisse la poignée de la jauge, ou directement sur le mot de droite, jusqu'à ce que les deux paraissent de même graisse." },
      { icon: "keyboard", text: "← → pour affiner, Entrée pour valider. La valeur exacte reste cachée jusqu'à la correction." },
    ],
    brief: "Donne au mot de droite la même graisse que la référence.",
    setup(round) {
      const ref = Oeil.randi(2, 8) * 100 + Oeil.pick([0, 50]);
      const bigRef = round % 2 === 0;
      let w;
      do { w = Oeil.randi(1, 9) * 100; } while (Math.abs(w - ref) < 200);
      return { word: WORDS[round % WORDS.length], ref: Math.min(ref, 900), w, refSize: bigRef ? 120 : 44, mineSize: bigRef ? 44 : 120 };
    },
    mount(board, s, api) {
      const wrap = api.h("div", "wm-wrap");
      const k = Math.min(1, board.clientWidth / 760);
      const left = api.h("figure", "wm-cell", `<figcaption>Référence</figcaption>`);
      const refEl = api.h("span", "wm-word", s.word);
      refEl.style.cssText = `font-size:${Math.round(s.refSize * k)}px;font-weight:${s.ref}`;
      left.prepend(refEl);
      const right = api.h("figure", "wm-cell", `<figcaption>Ta version</figcaption>`);
      s.mine = api.h("span", "wm-word grab", s.word);
      s.mine.style.fontSize = `${Math.round(s.mineSize * k)}px`;
      right.prepend(s.mine);
      const track = api.h("div", "wm-track grab", `<span class="wm-end">Fin</span><span class="wm-end wm-end-r">Gras</span>`);
      s.handle = api.h("span", "handle");
      s.handle.tabIndex = 0; s.handle.setAttribute("role", "slider"); s.handle.setAttribute("aria-label", "Graisse");
      track.append(s.handle);
      wrap.append(left, right, track);
      board.append(wrap);
      const fromTrack = (ev) => { const r = track.getBoundingClientRect(); return MIN + api.clamp((ev.clientX - r.left) / r.width, 0, 1) * (MAX - MIN); };
      api.drag(track, { start: (e) => { s.w = fromTrack(e); apply(s); }, move: (dx, dy, ev) => { s.w = fromTrack(ev); apply(s); } });
      api.drag(s.mine, { start: () => ({ w: s.w }), move: (dx, dy, ev, c) => { s.w = api.clamp(c.w + dx * 2, MIN, MAX); apply(s); } });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">swipe</span>Glisse sur la jauge ou sur le mot</span>`;
      apply(s);
    },
    keys(e, s) {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault();
      s.w = Oeil.clamp(s.w + (e.key === "ArrowRight" ? 1 : -1) * (e.shiftKey ? 50 : 10), MIN, MAX);
      apply(s);
    },
    evaluate(s) {
      const d = Math.round(s.w - s.ref);
      const bigMine = s.mineSize > s.refSize;
      return {
        score: Math.max(0, 100 - Math.max(0, Math.abs(d) - 20) / 5),
        metrics: [
          { label: "Ta graisse", value: `${Math.round(s.w)}`, good: Math.abs(d) <= 40 },
          { label: "Référence", value: `${s.ref}` },
          { label: "Écart", value: Math.abs(d) <= 20 ? "juste" : `${d > 0 ? "+" : ""}${d}`, good: Math.abs(d) <= 40 },
        ],
        principle: bigMine
          ? "En grand, les traits sont plus épais en valeur absolue : à graisse égale, le grand mot paraît plus noir. On choisit souvent trop léger pour compenser."
          : "En petit, les traits fondent et le mot paraît plus clair : à graisse égale, on a tendance à choisir trop gras pour compenser.",
      };
    },
    reveal(board, s, r, api) {
      s.mine.classList.remove("grab");
      const ghost = s.handle.cloneNode(); ghost.className = "wm-mark"; ghost.style.left = `${((s.ref - MIN) / (MAX - MIN)) * 100}%`;
      s.handle.parentElement.append(ghost);
      s.handle.parentElement.insertAdjacentHTML("beforeend", `<span class="tag-ref" style="left:${((s.ref - MIN) / (MAX - MIN)) * 100}%;top:-30px;transform:translateX(-50%)">${s.ref}</span>`);
    },
  });
})();
