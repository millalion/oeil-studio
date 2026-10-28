// Optical Center — le centre perçu d'une forme dépend de sa masse, pas de sa boîte.
(function () {
  const K = 0.5;          // part de la correction masse ↔ boîte
  const LIFT = 0.02;      // le centre optique d'un cadre est un peu au-dessus du centre géométrique
  const TOL = 1.5;        // % du cadre considéré comme parfait
  const SHAPES = Oeil.shuffle([
    { kind: "path", d: "M22 10 L92 50 L22 90 Z", name: "Lecture", tip: "Un triangle « lecture » posé au centre de sa boîte paraît décalé à gauche : sa masse est du côté de la base. On le pousse vers la pointe." },
    { kind: "path", d: "M50 10 L94 90 L6 90 Z", name: "Alerte", tip: "Un triangle pointe en haut a toute sa masse en bas : centré au calcul, il paraît tomber. On le remonte légèrement." },
    { kind: "glyph", text: "T", name: "T", tip: "La barre du T concentre la masse en haut : centré au calcul, il paraît flotter. On le descend un peu." },
    { kind: "glyph", text: "L", name: "L", tip: "Le L a sa masse en bas à gauche et un grand vide en haut à droite : on le décale vers le vide." },
    { kind: "glyph", text: "?", name: "Point d'interrogation", tip: "La boucle du point d'interrogation pèse plus que son point : le signe paraît haut, on le descend." },
    { kind: "glyph", text: "7", name: "7", tip: "Le 7 est lourd en haut et ouvert en bas à gauche : on le déplace vers le bas et la gauche." },
    { kind: "glyph", text: "→", name: "Flèche", tip: "La pointe d'une flèche est plus dense que sa tige : on recule la flèche du côté de la tige." },
  ]);

  async function rasterize(shape, size) {
    const S = size * 2, c = document.createElement("canvas");
    c.width = c.height = S;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#141413";
    if (shape.kind === "path") {
      ctx.translate(S / 2 - size / 2, S / 2 - size / 2);
      ctx.scale(size / 100, size / 100);
      ctx.fill(new Path2D(shape.d));
    } else {
      await document.fonts.load(`600 ${size}px "Inter Tight"`, shape.text);
      ctx.font = `600 ${size}px "Inter Tight"`;
      ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(shape.text, S / 2, S / 2);
    }
    const data = ctx.getImageData(0, 0, S, S).data;
    let x0 = S, y0 = S, x1 = 0, y1 = 0, m = 0, mx = 0, my = 0;
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
      const a = data[(y * S + x) * 4 + 3] / 255;
      if (a > 0.02) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); m += a; mx += a * x; my += a * y; }
    }
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const crop = (fill) => {
      const o = document.createElement("canvas"); o.width = w; o.height = h;
      const oc = o.getContext("2d"); oc.drawImage(c, x0, y0, w, h, 0, 0, w, h);
      if (fill) { oc.globalCompositeOperation = "source-in"; oc.fillStyle = fill; oc.fillRect(0, 0, w, h); }
      return o;
    };
    return { w, h, cx: mx / m - x0, cy: my / m - y0, crop };
  }

  function layout(board, s) {
    const W = board.clientWidth, H = board.clientHeight;
    s.F = Math.round(Math.min(360, W - 48, H - 60));
    s.fx = (W - s.F) / 2; s.fy = (H - s.F) / 2;
    s.frame.style.cssText = `left:${s.fx}px;top:${s.fy}px;width:${s.F}px;height:${s.F}px`;
    s.tx = 0.5 + s.ox / s.F;
    s.ty = 0.5 + s.oy / s.F - LIFT;
    place(s);
  }
  // s.ux, s.uy : centre de la boîte de la forme, en fraction du cadre
  function place(s) {
    s.el.style.left = `${s.ux * s.F - s.r.w / 2}px`;
    s.el.style.top = `${s.uy * s.F - s.r.h / 2}px`;
  }

  Oeil.play({
    id: "optical-center", name: "Optical Center",
    howto: [
      { icon: "drag_pan", text: "Attrape le signe et glisse-le dans le cadre." },
      { icon: "center_focus_strong", text: "Place-le là où il paraît centré à l'œil. Le centre calculé n'est presque jamais le bon." },
      { icon: "keyboard", text: "Flèches pour l'ajuster au pixel près, Entrée pour valider." },
    ],
    brief: "Glisse le signe jusqu'à ce qu'il paraisse centré dans le cadre.",
    hint: { label: "Plisser les yeux", run(s) { s.frame.classList.toggle("oc-blur"); } },

    async setup(round) {
      const shape = SHAPES[round % SHAPES.length];
      const size = 160;
      const r = await rasterize(shape, size);
      // Référence : la boîte est décalée de K × (centre de la boîte − centre de masse), puis le tout remonte de LIFT.
      const ang = Math.random() * Math.PI * 2, d = 0.12 + Math.random() * 0.1;
      return { shape, r, ox: K * (r.w / 2 - r.cx), oy: K * (r.h / 2 - r.cy), ux: 0.5 + Math.cos(ang) * d, uy: 0.5 + Math.sin(ang) * d };
    },

    mount(board, s, api) {
      s.frame = api.h("div", "oc-frame");
      s.el = s.r.crop();
      s.el.className = "oc-shape grab";
      s.el.tabIndex = 0;
      s.el.setAttribute("role", "img");
      s.el.setAttribute("aria-label", `Signe ${s.shape.name}, déplaçable`);
      s.frame.append(s.el);
      board.append(s.frame);
      layout(board, s);
      api.drag(s.el, {
        start: () => ({ x: s.ux, y: s.uy }),
        move: (dx, dy, ev, c) => { s.ux = api.clamp(c.x + dx / s.F, 0.15, 0.85); s.uy = api.clamp(c.y + dy / s.F, 0.15, 0.85); place(s); },
      });
      api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse le signe</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>Flèches : 1 px, Maj : 10 px</span>`;
    },

    keys(e, s) {
      const st = (e.shiftKey ? 10 : 1) / s.F;
      const m = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
      if (!m) return;
      e.preventDefault();
      s.ux += m[0]; s.uy += m[1]; place(s);
    },

    resize(board, s) { layout(board, s); if (s.ghost) { s.ghost.style.left = `${s.tx * s.F - s.r.w / 2}px`; s.ghost.style.top = `${s.ty * s.F - s.r.h / 2}px`; } },

    evaluate(s) {
      const d = Math.hypot(s.ux - s.tx, s.uy - s.ty) * 100;
      const dGeo = Math.hypot(s.ux - 0.5, s.uy - 0.5) * 100;
      const px = Math.round((d / 100) * s.F);
      return {
        score: d <= TOL ? 100 : Math.max(0, 100 - (d - TOL) * 12),
        metrics: [
          { label: "Distance au centre optique", value: `${px} px`, good: d <= TOL * 2 },
          { label: "Tu es plus près du", value: dGeo < d ? "centre calculé" : "centre optique", good: dGeo >= d && d <= TOL * 3 },
        ],
        principle: s.shape.tip,
      };
    },

    reveal(board, s, r, api) {
      s.el.classList.remove("grab");
      s.frame.classList.remove("oc-blur");
      s.frame.insertAdjacentHTML("afterbegin", `<span class="oc-cross"></span>`);
      s.ghost = s.r.crop("rgba(240,68,122,.55)");
      s.ghost.className = "oc-shape oc-ghost";
      s.ghost.style.left = `${s.tx * s.F - s.r.w / 2}px`;
      s.ghost.style.top = `${s.ty * s.F - s.r.h / 2}px`;
      s.frame.append(s.ghost);
      board.append(api.h("p", "absolute left-4 bottom-4 text-[13px] flex flex-wrap gap-4", `<span><b class="text-signal">Rose</b> : centre optique</span><span><b>Pointillés</b> : centre calculé</span>`));
    },
  });
})();
