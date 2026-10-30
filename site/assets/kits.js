// Gabarits de jeux réutilisables : un jeu décrit son contenu, le gabarit gère l'interaction.
//  - choice : choisir la bonne proposition (avec phase d'observation facultative)
//  - hunt   : repérer et marquer les éléments fautifs
//  - order  : remettre des cartes dans le bon ordre
//  - assign : déposer des étiquettes sur des emplacements
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pickItems = (items) => Oeil.shuffle(items);

  // ---------------------------------------------------------------- Choix
  function choice(def) {
    const items = pickItems(def.items);
    Oeil.play({
      id: def.id, name: def.name, rounds: def.rounds || Math.min(5, items.length), howto: def.howto,
      brief: (s) => (s.memo ? def.memoBrief || "Observe bien…" : s.it.prompt),
      setup(round) {
        const it = items[round % items.length];
        return { it, opts: Oeil.shuffle(it.options.map((o, i) => ({ ...o, i }))), picked: null, memo: !!it.memo };
      },
      mount(board, s, api) {
        const wrap = api.h("div", "kit-choice" + (s.it.wide ? " is-wide" : ""));
        board.append(wrap);
        const showOptions = () => {
          s.memo = false;
          api.setBrief(s.it.prompt);
          wrap.innerHTML = s.it.context ? `<div class="kit-context">${s.it.context}</div>` : "";
          const grid = api.h("div", `kit-options cols-${Math.min(s.opts.length, s.it.cols || 4)}`);
          s.btns = s.opts.map((o, k) => {
            const b = api.h("button", "kit-opt pickable", `<span class="kit-opt-key">${"ABCDEF"[k]}</span><span class="kit-opt-body">${o.html || ""}</span>${o.label ? `<span class="kit-opt-label">${o.label}</span>` : ""}`);
            b.type = "button";
            b.setAttribute("aria-pressed", "false");
            if (o.draw) o.draw(b.querySelector(".kit-opt-body"));
            b.addEventListener("click", () => {
              if (api.phase !== "play") return;
              s.picked = k;
              s.btns.forEach((x, j) => { x.classList.toggle("is-picked", j === k); x.setAttribute("aria-pressed", String(j === k)); });
              api.setSubmit(true);
            });
            grid.append(b);
            return b;
          });
          wrap.append(grid);
          api.setSubmit(false);
        };
        if (s.it.memo) {
          api.setSubmit(false);
          const sec = s.it.memo.seconds || 4;
          const run = () => {
            wrap.innerHTML = `<div class="kit-memo">${s.it.memo.html}</div><p class="kit-count"><span>${sec}</span></p>`;
            if (s.it.memo.draw) s.it.memo.draw(wrap.querySelector(".kit-memo"));
            if (api.memoBar) api.memoBar(sec);
            let left = sec;
            clearInterval(s.iv);
            s.iv = setInterval(() => { left--; if (left <= 0) { clearInterval(s.iv); if (api.phase === "play") showOptions(); } else wrap.querySelector(".kit-count span").textContent = left; }, 1000);
          };
          if (api.memoGate) api.memoGate(sec, def.memoWhat || "ce qui va s'afficher", run); else run();
        } else showOptions();
        api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Clique sur une proposition, puis valide</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>Touches A, B, C, D</span>`;
      },
      keys(e, s) {
        const k = "abcdef".indexOf(e.key.toLowerCase());
        if (k >= 0 && s.btns && s.btns[k]) { e.preventDefault(); s.btns[k].click(); }
      },
      evaluate(s) {
        clearInterval(s.iv);
        const o = s.opts[s.picked];
        const ok = o && o.correct;
        const best = s.opts.find((x) => x.correct);
        return {
          score: o ? (o.correct ? 100 : o.partial || 0) : 0,
          verdict: ok ? undefined : "Pas celle-là",
          metrics: [
            { label: "Ton choix", value: o ? `${"ABCDEF"[s.picked]}${o.label ? ` · ${o.label}` : ""}` : "aucun", good: !!ok },
            ...(o && o.why ? [{ label: ok ? "Pourquoi" : "Ton choix", value: o.why, good: !!ok }] : []),
            ...(!ok && best && best.why ? [{ label: "La bonne réponse", value: best.why }] : []),
          ],
          principle: s.it.explain,
        };
      },
      reveal(board, s) {
        (s.btns || []).forEach((b, k) => {
          b.disabled = true;
          const o = s.opts[k];
          if (o.correct) b.classList.add("kit-right");
          else if (k === s.picked) b.classList.add("kit-wrong");
          if (o.correct) b.insertAdjacentHTML("beforeend", `<span class="tag-you kit-tag">La bonne</span>`);
        });
      },
    });
  }

  // ---------------------------------------------------------------- Chasse aux erreurs
  // Le contenu contient des éléments [data-h="bad"] (fautifs, avec data-why) et [data-h="ok"].
  function hunt(def) {
    const items = pickItems(def.items);
    Oeil.play({
      id: def.id, name: def.name, rounds: def.rounds || Math.min(5, items.length), howto: def.howto,
      brief: (s) => `${s.it.prompt} (${s.bad} à trouver)`,
      hint: def.hint,
      setup(round) {
        const it = items[round % items.length];
        const bad = (it.html.match(/data-h="bad"/g) || []).length;
        return { it, bad, picked: new Set() };
      },
      mount(board, s, api) {
        const wrap = api.h("div", "kit-hunt", `<div class="kit-hunt-box">${s.it.html}</div>`);
        board.append(wrap);
        s.nodes = [...wrap.querySelectorAll("[data-h]")];
        s.nodes.forEach((n, i) => {
          n.classList.add("pickable", "kit-h");
          n.tabIndex = 0;
          n.setAttribute("role", "button");
          n.setAttribute("aria-pressed", "false");
          const toggle = () => {
            if (api.phase !== "play") return;
            s.picked.has(i) ? s.picked.delete(i) : s.picked.add(i);
            n.classList.toggle("is-picked", s.picked.has(i));
            n.setAttribute("aria-pressed", String(s.picked.has(i)));
            s.count.textContent = `${s.picked.size} marqué${s.picked.size > 1 ? "s" : ""}`;
          };
          n.addEventListener("click", (e) => { e.preventDefault(); toggle(); });
          n.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); toggle(); } });
        });
        api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">touch_app</span>Clique pour marquer, reclique pour annuler</span><span class="ctl-hint" id="kit-count">0 marqué</span>`;
        s.count = api.controls.querySelector("#kit-count");
        if (def.fit) def.fit(wrap);
      },
      evaluate(s) {
        const bads = s.nodes.map((n, i) => (n.dataset.h === "bad" ? i : -1)).filter((i) => i >= 0);
        const hits = bads.filter((i) => s.picked.has(i)).length;
        const fa = [...s.picked].filter((i) => !bads.includes(i)).length;
        return {
          score: Math.max(0, (hits / bads.length) * 100 - fa * 25),
          metrics: [
            { label: "Trouvés", value: `${hits} sur ${bads.length}`, good: hits === bads.length },
            { label: "Fausses alertes", value: `${fa}`, good: fa === 0 },
            ...bads.filter((i) => s.nodes[i].dataset.why).map((i, n) => ({ label: `Problème ${n + 1}`, value: s.nodes[i].dataset.why, good: s.picked.has(i) })),
          ],
          principle: s.it.explain,
        };
      },
      reveal(board, s, r, api) {
        let rank = 0;
        s.nodes.forEach((n, i) => {
          n.classList.remove("pickable");
          n.tabIndex = -1;
          if (n.dataset.h === "bad") {
            n.classList.add(s.picked.has(i) ? "kit-found" : "kit-missed");
            if (n.dataset.why) {
              const t = api.h("span", "tag-ref kit-why", `Problème ${++rank}`);
              n.append(t);
            }
          } else if (s.picked.has(i)) n.classList.add("kit-false");
        });
      },
    });
  }

  // ---------------------------------------------------------------- Remettre dans l'ordre
  function order(def) {
    const items = pickItems(def.items);
    Oeil.play({
      id: def.id, name: def.name, rounds: def.rounds || Math.min(5, items.length), howto: def.howto,
      brief: (s) => s.it.prompt,
      setup(round) {
        const it = items[round % items.length];
        const cards = it.cards.map((c, i) => (typeof c === "string" ? { html: c, rank: i } : { ...c, rank: i }));
        let start;
        do { start = Oeil.shuffle(cards); } while (start.every((c, i) => c.rank === i));
        return { it, cards, start };
      },
      mount(board, s, api) {
        const wrap = api.h("div", "kit-order");
        if (s.it.context) wrap.innerHTML = `<div class="kit-context">${s.it.context}</div>`;
        const ends = api.h("div", "kit-order-ends", `<span>${s.it.from || "Premier"}</span><span>${s.it.to || "Dernier"}</span>`);
        const row = api.h("div", "row-track kit-order-row");
        wrap.append(ends, row);
        board.append(wrap);
        const els = s.start.map((c) => { const el = api.h("div", "kit-card", c.html); el.dataset.rank = c.rank; return { id: c.rank, el }; });
        s.sort = api.sortable(row, els);
        s.row = row;
        api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse les cartes pour les ranger</span><span class="ctl-hint"><span class="material-symbols-outlined">keyboard</span>Tab puis ← →</span>`;
      },
      evaluate(s) {
        const o = s.sort.order();
        s.order = o;
        const disp = o.reduce((a, id, i) => a + Math.abs(id - i), 0) / o.length;
        const right = o.filter((id, i) => id === i).length;
        return {
          score: Math.max(0, 100 - disp * 32),
          metrics: [{ label: "Bien placées", value: `${right} sur ${o.length}`, good: right === o.length }],
          principle: s.it.explain,
        };
      },
      reveal(board, s) {
        [...s.row.children].forEach((el) => {
          el.classList.remove("grab");
          const rank = +el.dataset.rank, i = s.order.indexOf(rank);
          el.insertAdjacentHTML("beforeend", `<span class="${rank === i ? "tag-you" : "tag-ref"} row-tag">${rank === i ? "✓" : `place ${rank + 1}`}</span>`);
        });
      },
    });
  }

  // ---------------------------------------------------------------- Associer
  // slots : [{ id, html | render(token) }], tokens : [{ id, html, slot }] (slot null = leurre)
  function assign(def) {
    const items = pickItems(def.items);
    Oeil.play({
      id: def.id, name: def.name, rounds: def.rounds || Math.min(5, items.length), howto: def.howto,
      brief: (s) => s.it.prompt,
      setup(round) {
        const it = items[round % items.length];
        return { it, tokens: Oeil.shuffle(it.tokens), map: {}, sel: null };
      },
      mount(board, s, api) {
        const wrap = api.h("div", "kit-assign" + (s.it.layout ? ` is-${s.it.layout}` : ""));
        const bank = api.h("div", "kit-bank");
        const slots = api.h("div", "kit-slots");
        wrap.append(bank, slots);
        board.append(wrap);
        s.tokEls = {};
        s.tokens.forEach((t) => {
          const el = api.h("button", "kit-token grab", t.html);
          el.type = "button";
          el.dataset.id = t.id;
          s.tokEls[t.id] = el;
          bank.append(el);
          el.addEventListener("click", () => { if (el._dragged) { el._dragged = false; return; } if (api.phase !== "play") return; s.sel = s.sel === t.id ? null : t.id; Object.values(s.tokEls).forEach((x) => x.classList.toggle("is-picked", x.dataset.id === s.sel)); });
          api.drag(el, {
            start: (e) => { const r = el.getBoundingClientRect(); return { ox: e.clientX - r.left, oy: e.clientY - r.top, moved: false }; },
            move: (dx, dy, ev, c) => {
              if (Math.hypot(dx, dy) > 4) c.moved = true;
              el.style.transform = `translate(${dx}px, ${dy}px)`; el.style.zIndex = 10;
              const under = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n !== el && !el.contains(n));
              const over = under && under.closest(".kit-slot:not(.is-fixed)");
              Object.values(s.slotEls).forEach((x) => x.classList.toggle("is-over", x === over));
            },
            end: (ev, c) => {
              el.style.transform = ""; el.style.zIndex = "";
              Object.values(s.slotEls).forEach((x) => x.classList.remove("is-over"));
              if (!c.moved) return;
              el._dragged = true;
              // L'étiquette tenue est sous le doigt : on cherche ce qu'il y a en dessous d'elle
              const target = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n !== el && !el.contains(n));
              const slot = target && target.closest(".kit-slot:not(.is-fixed)");
              if (slot) place(s, api, t.id, slot.dataset.slotWrap);
              else if (target && target.closest(".kit-bank")) place(s, api, t.id, null);
            },
          });
        });
        s.slotEls = {};
        s.it.slots.forEach((sl) => {
          const el = api.h("div", "kit-slot" + (sl.fixed ? " is-fixed" : ""), `<div class="kit-slot-view">${sl.html || ""}</div>${sl.fixed ? "" : `<div class="kit-drop" data-slot="${sl.id}"><span class="kit-drop-hint">Dépose ici</span></div>`}${sl.label ? `<p class="kit-slot-label">${sl.label}</p>` : ""}`);
          el.dataset.slotWrap = sl.id;
          if (!sl.fixed) el.querySelector(".kit-drop").addEventListener("click", () => { if (api.phase !== "play" || !s.sel) return; place(s, api, s.sel, sl.id); });
          s.slotEls[sl.id] = el;
          slots.append(el);
          if (sl.render) el.querySelector(".kit-slot-view").innerHTML = sl.render(null);
        });
        api.controls.innerHTML = `<span class="ctl-hint"><span class="material-symbols-outlined">drag_pan</span>Glisse chaque étiquette sur sa place</span><span class="ctl-hint">ou clique une étiquette puis une place</span>`;
      },
      evaluate(s) {
        if (def.evaluate) return def.evaluate(s);
        const real = s.it.tokens.filter((t) => t.slot);
        const right = real.filter((t) => s.map[t.id] === t.slot).length;
        const decoys = s.it.tokens.filter((t) => !t.slot && s.map[t.id]).length;
        return {
          score: Math.max(0, (right / real.length) * 100 - decoys * 15),
          metrics: [
            { label: "Bien placées", value: `${right} sur ${real.length}`, good: right === real.length },
            ...(s.it.tokens.some((t) => !t.slot) ? [{ label: "Intrus utilisés", value: `${decoys}`, good: decoys === 0 }] : []),
          ],
          principle: s.it.explain,
        };
      },
      reveal(board, s) {
        Object.values(s.tokEls).forEach((el) => el.classList.remove("grab"));
        s.it.slots.forEach((sl) => {
          if (sl.fixed) return;
          const tokenId = Object.keys(s.map).find((k) => s.map[k] === sl.id);
          const want = s.it.tokens.find((t) => t.slot === sl.id);
          const ok = tokenId && want && tokenId === want.id;
          const wrapEl = s.slotEls[sl.id];
          wrapEl.classList.add(ok ? "kit-right" : "kit-wrong");
          if (!ok && want) wrapEl.insertAdjacentHTML("beforeend", `<span class="tag-ref kit-tag">${want.html.replace(/<[^>]+>/g, "")}</span>`);
        });
      },
    });

    function place(s, api, tokenId, slotId) {
      Object.keys(s.map).forEach((k) => { if (s.map[k] === slotId && slotId) delete s.map[k]; });
      if (slotId) s.map[tokenId] = slotId; else delete s.map[tokenId];
      // Replace les étiquettes
      const bank = api.board.querySelector(".kit-bank");
      Object.entries(s.tokEls).forEach(([id, el]) => {
        const sl = s.map[id];
        const dest = sl ? s.slotEls[sl].querySelector(".kit-drop") : bank;
        if (el.parentElement !== dest) dest.append(el);
        el.classList.remove("is-picked");
      });
      s.sel = null;
      s.it.slots.forEach((sl) => {
        if (sl.fixed) return;
        const drop = s.slotEls[sl.id].querySelector(".kit-drop");
        drop.classList.toggle("is-filled", !!drop.querySelector(".kit-token"));
        if (sl.render) {
          const tid = Object.keys(s.map).find((k) => s.map[k] === sl.id);
          s.slotEls[sl.id].querySelector(".kit-slot-view").innerHTML = sl.render(tid ? s.it.tokens.find((t) => t.id === tid) : null);
        }
      });
    }
  }

  window.Oeil.kits = { choice, hunt, order, assign };
})();
