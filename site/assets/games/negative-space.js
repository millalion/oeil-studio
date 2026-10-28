// Negative Space — on ne montre que les contre-formes (les blancs intérieurs) d'une lettre : laquelle est-ce ?
(function () {
  // Dessine la lettre, remplit l'extérieur depuis les bords, et ne garde en noir que les blancs fermés.
  function counters(ch, font, size, target) {
    const W = Math.round(size * 1.3), H = Math.round(size * 1.3);
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const ctx = c.getContext("2d");
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#000"; ctx.font = `${font.weight} ${size}px ${font.css}`; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(ch, W / 2, H / 2);
    const img = ctx.getImageData(0, 0, W, H), d = img.data;
    const ink = (i) => d[i * 4] < 128;
    const outside = new Uint8Array(W * H), stack = [];
    for (let x = 0; x < W; x++) { stack.push(x, (H - 1) * W + x); }
    for (let y = 0; y < H; y++) { stack.push(y * W, y * W + W - 1); }
    while (stack.length) {
      const i = stack.pop();
      if (outside[i] || ink(i)) continue;
      outside[i] = 1;
      const x = i % W, y = (i / W) | 0;
      if (x > 0) stack.push(i - 1); if (x < W - 1) stack.push(i + 1); if (y > 0) stack.push(i - W); if (y < H - 1) stack.push(i + W);
    }
    const out = ctx.createImageData(W, H);
    for (let i = 0; i < W * H; i++) {
      const counter = !outside[i] && !ink(i);
      const v = counter ? 20 : ink(i) ? 238 : 255;
      out.data[i * 4] = out.data[i * 4 + 1] = out.data[i * 4 + 2] = v; out.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    c.className = "ns-canvas";
    target.append(c);
  }
  const F = { css: "Newsreader", weight: 400 };
  const G = { css: "'Inter Tight'", weight: 600 };
  const letter = (ch, font) => `<span class="ns-letter" style="font-family:${font.css};font-weight:${font.weight}">${ch}</span>`;
  const item = (ch, font, others, explain) => ({
    prompt: "Ces formes noires sont les blancs intérieurs d'une lettre. Laquelle ?", cols: 4,
    context: '<div class="ns-ctx" data-ns=""></div>',
    options: [{ html: letter(ch, font), correct: true }, ...others.map((o) => ({ html: letter(o, font) }))].map((o) => ({ ...o })),
    explain, ch, font,
  });
  const items = [
    item("B", G, ["P", "R", "8"], "Le B a deux contre-formes de tailles différentes : celle du haut est plus petite, pour que la lettre ne paraisse pas tomber vers l'avant."),
    item("a", F, ["e", "o", "g"], "La contre-forme fermée du a (son œil) est petite et basse, avec une ouverture au-dessus : c'est elle qui fait la lisibilité de la lettre en petit corps."),
    item("g", F, ["a", "e", "8"], "Le g à deux étages a deux contre-formes empilées, reliées par un col : on le reconnaît à son seul négatif."),
    item("R", G, ["P", "B", "A"], "La contre-forme du R ressemble à celle du P, mais elle est plus petite : la jambe vient s'appuyer sous la panse."),
    item("e", G, ["a", "o", "c"], "L'œil du e (sa contre-forme fermée) est dessiné plus grand que celui du a : ces blancs intérieurs règlent l'équilibre de tout un paragraphe."),
  ];
  Oeil.kits.choice({
    id: "negative-space", name: "Negative Space",
    howto: [
      { icon: "invert_colors", text: "On t'affiche seulement les contre-formes d'une lettre : les espaces blancs fermés à l'intérieur, ici en noir." },
      { icon: "touch_app", text: "Retrouve la lettre parmi quatre propositions." },
      { icon: "lightbulb", text: "Les typographes dessinent autant les blancs que les noirs : c'est eux qui font la lisibilité." },
    ],
    items: items.map((it) => ({ ...it, context: it.context.replace('data-ns=""', `data-ns="${encodeURIComponent(JSON.stringify({ ch: it.ch, font: it.font }))}"`) })),
  });
  // Dessin des contre-formes une fois le plateau monté
  new MutationObserver(() => {
    document.querySelectorAll("[data-ns]:not(.is-drawn)").forEach((el) => {
      el.classList.add("is-drawn");
      const { ch, font } = JSON.parse(decodeURIComponent(el.dataset.ns));
      document.fonts.load(`${font.weight} 220px ${font.css}`, ch).then(() => counters(ch, font, 220, el));
    });
  }).observe(document.getElementById("board") || document.body, { childList: true, subtree: true });
})();
