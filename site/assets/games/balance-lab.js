// Balance Lab — le centre de masse visuel d'une composition doit tomber au centre optique du cadre.
(function () {
  const FW = 600, FH = 400;       // repère interne du cadre
  const TX = FW / 2, TY = FH * 0.47; // centre optique, un peu au-dessus du milieu
  const TOL = 2;                  // % de la diagonale

  const mass = (o) => o.w * o.h * (o.round ? Math.PI / 4 : 1) * o.ink;

  function makeRound() {
    for (let k = 0; k < 200; k++) {
      const fixed = Array.from({ length: Oeil.randi(2, 3) }, () => {
        const w = Oeil.randi(50, 170), h = Oeil.pick([w, Oeil.randi(40, 170)]);
        return { w, h, x: Oeil.randi(20, FW - w - 20), y: Oeil.randi(20, FH - h - 20), round: Math.random() < 0.3, ink: Oeil.pick([1, 1, 0.55]) };
      });
      const d = Oeil.randi(90, 150);
      const mov = { w: d, h: d, round: true, ink: 1 };
      const M = fixed.reduce((a, o) => a + mass(o), 0) + mass(mov);
      const sx = fixed.reduce((a, o) => a + mass(o) * (o.x + o.w / 2), 0);
      const sy = fixed.reduce((a, o) => a + mass(o) * (o.y + o.h / 2), 0);
      const cx = (M * TX - sx) / mass(mov), cy = (M * TY - sy) / mass(mov);
      // Le disque doit peser assez pour que sa place compte, et partir loin de la bonne position.
      const pos = { x: Oeil.randi(d, FW - d), y: Oeil.randi(d, FH - d) };
      if (mass(mov) / M >= 0.3 && Math.hypot(pos.x - cx, pos.y - cy) > 170 && cx - d / 2 > 10 && cx + d / 2 < FW - 10 && cy - d / 2 > 10 && cy + d / 2 < FH - 10) {
        return { fixed, mov, target: { x: cx, y: cy }, pos };
      }
    }
    return makeRound();
  }

  function centroid(s, p) {
    const all = [...s.fixed.map((o) => ({ m: mass(o), x: o.x + o.w / 2, y: o.y + o.h / 2 })), { m: mass(s.mov), x: p.x, y: p.y }];
    const M = all.reduce((a, o) => a + o.m, 0);
    return { x: all.reduce((a, o) => a + o.m * o.x, 0) / M, y: all.reduce((a, o) => a + o.m * o.y, 0) / M };
  }

  function place(s) {
    s.movEl.style.left = `${s.pos.x - s.mov.w / 2}px`; s.movEl.style.top = `${s.pos.y - s.mov.h / 2}px`;
    const c = centroid(s, s.pos);
    s.cross.style.left = `${c.x}px`; s.cross.style.top = `${c.y}px`;
  }
  function fit(board, s) {
    const k = Math.min((board.clientWidth - 48) / FW, (board.clientHeight - 56) / FH, 1.4);
    s.k = k;
    s.frame.style.transform = `translate(-50%, -50%) scale(${k})`;
  }

  Oeil.play({
    id: "balance-lab", name: "Balance Lab",
    howto: [
      { icon: "drag_pan", text: "Les formes noires sont fixes. Seul le disque pointillé bouge." },
      { icon: "balance", text: "La croix noire montre le centre de gravité de ta composition : amène-la dans le rond rose." },
      { icon: "check", text: "Quand la croix est dans le rond, la composition est équilibrée." },
    ],
    brief: "Déplace le disque pointillé pour amener la croix noire dans le rond rose.",
    setup() { return makeRound(); },
    mount(board, s, api) {
      s.frame = api.h("div", "bl-frame bl-show-target");
      s.frame.style.cssText = `width:${FW}px;height:${FH}px`;
      s.fixed.forEach((o) => {
        const el = api.h("span", "bl-shape");
        el.style.cssText = `left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;border-radius:${o.round ? "999px" : "2px"};opacity:${o.ink}`;
        s.frame.append(el);
      });
      s.frame.insertAdjacentHTML("beforeend", `<span class="bl-target" style="left:${TX}px;top:${TY}px"></span>`);
      s.movEl = api.h("span", "bl-shape bl-mov grab");
      s.movEl.style.cssText = `width:${s.mov.w}px;height:${s.mov.h}px;border-radius:999px`;
      s.movEl.tabIndex = 0; s.movEl.setAttribute("aria-label", "Disque à déplacer");
      s.frame.append(s.movEl);
      s.cross = api.h("span", "bl-centroid");
      s.frame.append(s.cross);
      board.append(s.frame);
      fit(board, s);
      place(s);
      api.drag(s.movEl, {
        start: () => ({ ...s.pos }),
        move: (dx, dy, ev, c) => {
          s.pos.x = api.clamp(c.x + dx / s.k, s.mov.w / 2, FW - s.mov.w / 2);
          s.pos.y = api.clamp(c.y + dy / s.k, s.mov.h / 2, FH - s.mov.h / 2);
          place(s);
        },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse le disque pointillé</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>Flèches pour affiner</span>`;
    },
    keys(e, s) {
      const st = e.shiftKey ? 10 : 2;
      const m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (!m) return;
      e.preventDefault();
      s.pos.x = Oeil.clamp(s.pos.x + m[0], s.mov.w / 2, FW - s.mov.w / 2);
      s.pos.y = Oeil.clamp(s.pos.y + m[1], s.mov.h / 2, FH - s.mov.h / 2);
      place(s);
    },
    resize(board, s) { fit(board, s); },
    evaluate(s) {
      const c = centroid(s, s.pos);
      const diag = Math.hypot(FW, FH);
      const d = (Math.hypot(c.x - TX, c.y - TY) / diag) * 100;
      s.c = c;
      const side = Math.abs(c.x - TX) > Math.abs(c.y - TY) ? (c.x > TX ? "à droite" : "à gauche") : c.y > TY ? "vers le bas" : "vers le haut";
      return {
        score: d <= TOL ? 100 : Math.max(0, 100 - (d - TOL) * 9),
        metrics: [
          { label: "Écart du centre de masse", value: `${d.toFixed(1).replace(".", ",")} % du cadre`, good: d <= TOL * 1.5 },
          { label: "La composition penche", value: d <= TOL ? "nulle part" : side, good: d <= TOL },
        ],
        principle: "Un petit élément loin du centre peut équilibrer un gros élément proche, comme sur une balance. Le centre optique d'un cadre est légèrement au-dessus du milieu : une masse posée pile au centre paraît tomber.",
      };
    },
    reveal(board, s, r, api) {
      s.movEl.classList.remove("grab");
      s.frame.classList.add("bl-show-target");
      s.frame.insertAdjacentHTML("beforeend", `<span class="bl-ghost" style="left:${s.target.x - s.mov.w / 2}px;top:${s.target.y - s.mov.h / 2}px;width:${s.mov.w}px;height:${s.mov.h}px"></span>`);
    },
  });
})();
