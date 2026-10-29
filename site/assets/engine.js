// Œil Studio — moteur de jeu commun.
// Chaque jeu (assets/games/*.js) s'enregistre avec Oeil.play({...}).
// Sur une page de jeu, la partie démarre aussitôt. Sur une page de mélange (body[data-mode="mix"]),
// la page appelle Oeil.start({ ids }) et chaque manche peut être un jeu différent.
(function () {
  const ROUNDS_DEFAULT = 5;
  const $ = (sel, root = document) => root.querySelector(sel);
  const h = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem("oeil:" + k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem("oeil:" + k, JSON.stringify(v)); } catch (e) {} },
  };
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- Couleur ----------
  const color = {
    hslToRgb(h, s, l) {
      s /= 100; l /= 100;
      const a = s * Math.min(l, 1 - l);
      const f = (n) => { const k = (n + h / 30) % 12; return l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1); };
      return [f(0), f(8), f(4)].map((v) => Math.round(v * 255));
    },
    hex(rgb) { return "#" + rgb.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase(); },
    hsl(c) { return `hsl(${c.h}, ${c.s}%, ${c.l}%)`; },
    lin(c) { c /= 255; return c > 0.04045 ? Math.pow((c + 0.055) / 1.055, 2.4) : c / 12.92; },
    luminance(rgb) { const [r, g, b] = rgb.map(color.lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; },
    contrast(a, b) { const la = color.luminance(a), lb = color.luminance(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); },
    lab(rgb) {
      const [R, G, B] = rgb.map(color.lin);
      const x = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, y = R * 0.2126 + G * 0.7152 + B * 0.0722, z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
      const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
      return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
    },
    deltaE(a, b) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); },
  };

  // ---------- Glisser (souris, doigt, stylet) ----------
  function drag(el, { start, move, end } = {}) {
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const x0 = e.clientX, y0 = e.clientY;
      const ctx = start ? start(e) : null;
      el.classList.add("is-dragging");
      document.body.classList.add("is-dragging-any");
      const onMove = (ev) => move && move(ev.clientX - x0, ev.clientY - y0, ev, ctx);
      const onUp = (ev) => {
        el.classList.remove("is-dragging");
        document.body.classList.remove("is-dragging-any");
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerup", onUp);
        el.removeEventListener("pointercancel", onUp);
        end && end(ev, ctx);
      };
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerup", onUp);
      el.addEventListener("pointercancel", onUp);
    });
  }

  // ---------- Rangée réordonnable (Hue Line, Lightness Ladder…) ----------
  function sortable(container, items, { locked = [], onChange } = {}) {
    let order = items.map((it) => it.id);
    const byId = Object.fromEntries(items.map((it) => [it.id, it]));
    container.classList.add("sortable");
    const layout = (skip) => {
      const w = container.clientWidth / order.length;
      order.forEach((id, i) => {
        const it = byId[id];
        it.el.style.width = `${w - 6}px`;
        if (id !== skip) it.el.style.transform = `translateX(${i * w + 3}px)`;
      });
      return w;
    };
    items.forEach((it) => {
      container.appendChild(it.el);
      const idx = () => order.indexOf(it.id);
      if (locked.includes(idx())) { it.el.classList.add("is-locked"); return; }
      it.el.classList.add("grab");
      it.el.tabIndex = 0;
      drag(it.el, {
        start: () => ({ w: container.clientWidth / order.length, from: idx() }),
        move: (dx, dy, ev, c) => {
          const x = c.from * c.w + 3 + dx;
          it.el.style.transform = `translateX(${x}px) translateY(-6px)`;
          let to = clamp(Math.round((x - 3) / c.w), 0, order.length - 1);
          while (locked.includes(to)) to += to > idx() ? -1 : 1;
          if (to !== idx()) { order.splice(idx(), 1); order.splice(to, 0, it.id); layout(it.id); }
        },
        end: () => { layout(); onChange && onChange(order); },
      });
      it.el.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
        e.preventDefault();
        const i = idx(); const to = i + (e.key === "ArrowRight" ? 1 : -1);
        if (to < 0 || to >= order.length || locked.includes(to)) return;
        order.splice(i, 1); order.splice(to, 0, it.id); layout(); onChange && onChange(order);
      });
    });
    if (container.clientWidth) layout();
    requestAnimationFrame(() => layout());
    // Recalcule dès que la rangée change de taille (affichage du plateau, rotation du téléphone…)
    if ("ResizeObserver" in window) new ResizeObserver(() => { if (!container.querySelector(".is-dragging")) layout(); }).observe(container);
    else window.addEventListener("resize", () => layout());
    return { order: () => [...order], layout };
  }

  const VERDICTS = [[97, "Impeccable"], [90, "Très juste"], [75, "Pas loin"], [50, "À reprendre"], [0, "Raté, rejoue-la"]];
  const verdictFor = (s) => VERDICTS.find(([min]) => s >= min)[1];
  const gradeFor = (p) => (p >= 97 ? "A+" : p >= 92 ? "A" : p >= 85 ? "B" : p >= 75 ? "C" : "D");

  const registry = {};
  const catalog = () => window.OEIL_GAMES || [];
  const domains = () => window.OEIL_DOMAINS || {};
  const info = (id) => catalog().find((g) => g.id === id) || { id, name: id, domain: "typo" };

  // ---------- Session ----------
  function start({ ids, rounds = ROUNDS_DEFAULT, title } = {}) {
    const S = window.OEIL_SEED || { round() {}, encode: (o) => btoa(JSON.stringify(o)), challenge: null, seed: 0 };
    const app = $("#game-app");
    const mix = ids.length > 1;
    const board = $("#board"), stage = $("#stage"), controls = $("#controls");
    const brief = $("#brief"), dots = $("#round-dots"), scoreEl = $("#session-score");
    const submitBtn = $("#btn-submit"), hintBtn = $("#btn-hint"), coach = $("#coach"), result = $("#result"), summary = $("#summary");
    const ROUNDS = rounds;
    const plan = Array.from({ length: ROUNDS }, (_, i) => ids[i % ids.length]);
    let round = 0, scores = [], state = null, phase = "play", hintUsed = false, game = null;
    const challenge = S.challenge;

    const api = {
      board, controls, stage, drag, sortable, color, rand, randi, pick, shuffle, clamp, h,
      setSubmit(enabled) { submitBtn.disabled = !enabled; },
      setBrief(text) { brief.textContent = text; },
      submit: () => submit(),
      get phase() { return phase; },
      get round() { return round; },
      get hintUsed() { return hintUsed; },
    };

    function setGame(id) {
      game = registry[id];
      const g = info(id), d = domains()[g.domain] || {};
      app.style.setProperty("--field", d.field || "#EAE9E3");
      if (mix) {
        $("#mix-current").textContent = g.name;
        $("#mix-domain").textContent = d.label || "";
      }
      $("#coach-title").textContent = g.name;
      $("#coach-goal").textContent = g.desc || "";
      // Tutoriel court : une phrase par étape, sans les raccourcis clavier (ils marchent quand même).
      const short = (t) => { const m = String(t).match(/^.*?[.!?](?=\s|$)/); return (m ? m[0] : t).replace(/^Astuce\s*:\s*/i, ""); };
      const steps = game.howto.filter((st) => st.icon !== "keyboard").slice(0, 3);
      $("#coach-steps").innerHTML = steps.map((st, i) => `<li><b class="coach-n">${i + 1}</b><span class="material-symbols-outlined" aria-hidden="true">${st.icon}</span><span>${short(st.text)}</span></li>`).join("");
      $("#coach-kicker").textContent = mix ? `Manche ${round + 1} sur ${ROUNDS}` : "Comment jouer";
      hintBtn.hidden = !game.hint;
      if (game.hint) hintBtn.querySelector("span:last-child").textContent = game.hint.label;
    }

    const showCoach = (on) => { coach.hidden = !on; if (on) $("#btn-coach-go").focus({ preventScroll: true }); };
    // Le jeu (et ses comptes à rebours de mémorisation) ne démarre qu'après « C'est parti ».
    let coachWait = null;
    $("#btn-coach-go").addEventListener("click", () => { showCoach(false); store.set("coach:" + game.id, 1); if (coachWait) { const go = coachWait; coachWait = null; go(); } });
    $("#btn-howto") && $("#btn-howto").addEventListener("click", () => showCoach(true));
    hintBtn.addEventListener("click", () => { if (phase !== "play" || !game.hint) return; hintUsed = true; game.hint.run(state, api); });

    function renderDots() {
      dots.innerHTML = "";
      for (let i = 0; i < ROUNDS; i++) {
        const d = h("span", "round-dot" + (i < scores.length ? " is-done" : i === round && phase !== "done" ? " is-current" : ""));
        const name = info(plan[i]).name;
        d.title = i < scores.length ? `Manche ${i + 1}${mix ? ` (${name})` : ""} : ${Math.round(scores[i])} %` : `Manche ${i + 1}${mix ? ` : ${name}` : ""}`;
        if (mix) d.style.setProperty("--dot", (domains()[info(plan[i]).domain] || {}).field || "#EAE9E3");
        if (i < scores.length) d.textContent = Math.round(scores[i]);
        dots.appendChild(d);
      }
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
      scoreEl.textContent = avg == null ? "–" : `${Math.round(avg)} %`;
    }

    async function startRound() {
      const bar = document.querySelector(".game-bar"); if (bar) bar.classList.remove("is-done");
      phase = "play"; hintUsed = false;
      result.hidden = true; summary.hidden = true;
      board.innerHTML = ""; controls.innerHTML = "";
      stage.classList.remove("is-result");
      setGame(plan[round]);
      submitBtn.disabled = false;
      submitBtn.firstChild.textContent = "Valider";
      hintBtn.disabled = false;
      S.round(round);
      // En mélange, un jeu qui revient prend l'exercice suivant de sa liste au lieu de répéter le premier.
      const occ = plan.slice(0, round).filter((x) => x === plan[round]).length;
      state = await game.setup(mix ? occ : round, api);
      S.round(round + 1000);
      renderDots();
      if (mix || !store.get("coach:" + game.id)) {
        brief.textContent = "Lis la consigne, puis lance la manche.";
        showCoach(true);
        await new Promise((go) => (coachWait = go));
      }
      brief.textContent = typeof game.brief === "function" ? game.brief(state, round) : game.brief;
      game.mount(board, state, api);
    }

    function submit() {
      if (phase !== "play" || submitBtn.disabled) return;
      phase = "result";
      const r = game.evaluate(state, api);
      const score = clamp(r.score, 0, 100);
      scores[round] = score;
      if (window.OeilLive && challenge?.live) window.OeilLive.report(challenge.live, challenge.player, round, score);
      stage.classList.add("is-result");
      submitBtn.firstChild.textContent = round < ROUNDS - 1 ? "Manche suivante" : "Voir le bilan";
      hintBtn.disabled = true;
      if (game.resize) game.resize(board, state, api, "result");
      game.reveal && game.reveal(board, state, r, api);
      $("#result-round").textContent = `Manche ${round + 1} sur ${ROUNDS}`;
      $("#result-score").textContent = `${Math.round(score)} %`;
      $("#result-verdict").textContent = r.verdict || verdictFor(score);
      $("#result-metrics").innerHTML = (r.metrics || []).map((m) => `<div class="metric${m.good ? " is-good" : m.good === false ? " is-off" : ""}"><dt>${m.label}</dt><dd>${m.value}</dd></div>`).join("");
      $("#result-principle").textContent = r.principle || "";
      $("#result-principle").hidden = !r.principle;
      $("#btn-next").firstChild.textContent = round < ROUNDS - 1 ? "Suivante" : "Bilan";
      result.classList.remove("is-min");
      result.hidden = false;
      $("#btn-next").focus({ preventScroll: true });
      renderDots();
    }

    function next() {
      if (phase !== "result") return;
      if (round < ROUNDS - 1) { round++; startRound(); }
      else showSummary();
    }

    // ---------- Bilan, défi entre amis, code de classe ----------
    function showSummary() {
      phase = "done";
      result.hidden = true;
      submitBtn.disabled = true;
      board.innerHTML = ""; controls.innerHTML = "";
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      const key = "best:" + (mix ? "mix" : ids[0]);
      const best = store.get(key);
      const isRecord = best == null || avg > best;
      if (isRecord) store.set(key, avg);
      // Historique (page « Mon compte ») et série du défi du jour
      const hist = store.get("history") || [];
      const entry = { id: mix ? "mix" : ids[0], title: mix ? (title || "Mélange") : info(ids[0]).name, avg: Math.round(avg), date: new Date().toISOString(), daily: !!S.daily, plays: scores.map((sc, i) => ({ id: plan[i], s: Math.round(sc) })) };
      hist.unshift(entry);
      store.set("history", hist.slice(0, 500));
      if (mix) scores.forEach((sc, i) => { const k = "best:" + plan[i], b = store.get(k); if (b == null || sc > b) store.set(k, sc); });
      if (window.OeilAccount) window.OeilAccount.saveScore({ id: entry.id, title: entry.title, avg: entry.avg, rounds: scores.map(Math.round), mode: S.daily ? "daily" : challenge?.live ? "live" : mix ? "mix" : "solo", day: S.daily ? S.today : null });
      // Chaque manche d'un mélange compte aussi pour le record et le classement de son jeu
      if (window.OeilAccount && mix) scores.forEach((sc, i) => window.OeilAccount.saveScore({ id: plan[i], title: info(plan[i]).name, avg: Math.round(sc), mode: "round" }));
      if (S.daily) {
        const d = store.get("daily") || { streak: 0, last: null, scores: {} };
        const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
        if (d.last !== S.today) d.streak = d.last === yesterday ? d.streak + 1 : 1;
        d.last = S.today;
        d.max = Math.max(d.max || 0, d.streak);
        d.scores[S.today] = Math.max(d.scores[S.today] || 0, Math.round(avg));
        store.set("daily", d);
      }
      if (window.OeilLive && challenge?.live) window.OeilLive.done(challenge.live, challenge.player);
      $("#sum-score").textContent = `${Math.round(avg)} %`;
      $("#sum-grade").textContent = gradeFor(avg);
      $("#sum-record").textContent = isRecord ? "Nouveau record personnel." : `Ton record : ${Math.round(best)} %.`;
      $("#sum-rounds").innerHTML = scores.map((sc, i) => { const g = info(plan[i]), d = domains()[g.domain] || {}; return `<li class="sum-round" style="--dot:${d.field || "#EAE9E3"}"><i aria-hidden="true"></i><span class="sum-round-name"><b>${mix ? esc(g.name) : `Manche ${i + 1}`}</b><small>${mix ? esc(d.label || "") : esc(g.name)}</small></span><strong>${Math.round(sc)}<small> %</small></strong><em aria-hidden="true"><u style="width:${Math.round(sc)}%"></u></em></li>`; }).join("");
      document.querySelector(".game-bar").classList.add("is-done");

      const vs = $("#sum-versus");
      if (challenge && challenge.name != null && challenge.score != null) {
        const diff = Math.round(avg) - Math.round(challenge.score);
        vs.hidden = false;
        vs.innerHTML = `<b>${diff > 0 ? "Tu gagnes" : diff < 0 ? "Défi perdu" : "Égalité"}</b> : toi ${Math.round(avg)} %, ${esc(challenge.name)} ${Math.round(challenge.score)} %.`;
        if (diff > 0) store.set("wins", (store.get("wins") || 0) + 1);
      } else vs.hidden = true;

      // Badges débloqués par cette session
      const unlock = $("#sum-unlock");
      if (unlock && window.OeilProgress) {
        const fresh = window.OeilProgress.check();
        unlock.hidden = !fresh.length;
        if (fresh.length) unlock.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">${fresh[0].icon}</span><span><b>Badge débloqué : ${esc(fresh.map((b) => b.name).join(", "))}.</b> <a class="underline" href="compte.html#badges">Voir mes badges</a></span>`;
      }
      // Partie en direct : classement mis à jour au fil des joueurs
      const rankBox = $("#sum-rank");
      if (rankBox && window.OeilLive && challenge?.live) {
        rankBox.hidden = false;
        rankBox.innerHTML = `<p class="font-medium">Classement de la partie</p><ol><li><span></span><span></span><span>En attente des autres joueurs…</span></li></ol>`;
        window.OeilLive.watch(challenge.live, (room) => {
          const rk = window.OeilLive.ranking(room), me = rk.findIndex((p) => p.name === challenge.player);
          if (room.status === "finished" && me > -1 && me < 3 && !store.get("podium:" + room.code)) { store.set("podium:" + room.code, 1); store.set("podiums", (store.get("podiums") || 0) + 1); }
          rankBox.innerHTML = `<p class="font-medium">${room.status === "finished" ? "Classement final" : "Classement en cours"}${me > -1 ? ` · tu es ${me + 1}${me ? "e" : "er"} sur ${rk.length}` : ""}</p><ol>${rk.slice(0, 5).map((p, i) => `<li><b>${i + 1}</b>${window.OeilAvatar ? window.OeilAvatar(p, "avatar-sm") : ""}<span class="truncate">${esc(p.name)}${p.name === challenge.player ? " (toi)" : ""}</span><b>${p.total} pts</b></li>`).join("")}</ol>`;
        });
      }
      const nameInput = $("#sum-name");
      nameInput.value = (window.OeilAccount && window.OeilAccount.identity().name) || store.get("name") || "";
      const makeLink = () => {
        const name = nameInput.value.trim() || "Quelqu'un";
        store.set("name", nameInput.value.trim());
        const payload = { seed: S.seed, ids, rounds: ROUNDS, name, score: Math.round(avg), scores: scores.map(Math.round), cls: challenge?.cls, title: challenge?.title || title };
        const base = location.href.split("#")[0].split("?")[0];
        return { link: `${base}#c=${S.encode(payload)}`, code: challenge?.cls ? S.encode({ cls: challenge.cls, name, score: Math.round(avg), scores: scores.map(Math.round), ids }) : null };
      };
      const out = $("#sum-share-out");
      out.hidden = true;
      const classBox = $("#sum-class");
      classBox.hidden = !challenge?.cls;
      $("#btn-share").onclick = async () => {
        const { link } = makeLink();
        out.hidden = false;
        out.querySelector("input").value = link;
        try { await navigator.clipboard.writeText(link); out.querySelector("span").textContent = "Lien copié. Envoie-le : ton ami jouera les mêmes manches."; }
        catch (e) { out.querySelector("span").textContent = "Copie ce lien et envoie-le : ton ami jouera les mêmes manches."; out.querySelector("input").select(); }
      };
      $("#btn-class-code") && ($("#btn-class-code").onclick = async () => {
        const { code } = makeLink();
        const box = $("#sum-class-out");
        box.hidden = false;
        box.querySelector("input").value = code;
        try { await navigator.clipboard.writeText(code); box.querySelector("span").textContent = "Code copié : colle-le dans le formulaire de ton enseignant."; }
        catch (e) { box.querySelector("input").select(); }
      });
      brief.textContent = "Session terminée.";
      summary.hidden = false;
      renderDots();
      $("#btn-restart").focus({ preventScroll: true });
    }

    $("#btn-result-toggle").addEventListener("click", () => {
      const min = result.classList.toggle("is-min");
      $("#btn-result-toggle").setAttribute("aria-label", min ? "Afficher le détail" : "Réduire pour voir le plateau");
    });
    $("#btn-retry").addEventListener("click", () => { if (phase !== "result") return; scores.splice(round, 1); startRound(); });
    $("#btn-next").addEventListener("click", next);
    submitBtn.addEventListener("click", () => (phase === "play" ? submit() : next()));
    $("#btn-restart").addEventListener("click", () => { round = 0; scores = []; startRound(); });
    $("#btn-reset-session").addEventListener("click", () => { round = 0; scores = []; startRound(); });

    window.addEventListener("keydown", (e) => {
      if (!coach.hidden) { if (e.key === "Enter" || e.key === "Escape") { e.preventDefault(); $("#btn-coach-go").click(); } return; }
      if (e.target.closest && e.target.closest("input, select, textarea")) return;
      if (e.key === "Enter") {
        if (e.target.closest && e.target.closest("button, a") && !e.target.closest("#board")) return;
        e.preventDefault();
        if (phase === "play") submit(); else if (phase === "result") next();
        return;
      }
      if (phase === "play" && game.keys) game.keys(e, state, api);
    });
    let rt;
    window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (game && game.resize && state && phase !== "done") game.resize(board, state, api, phase); }, 100); });

    // Bandeau de défi reçu
    const banner = $("#challenge-banner");
    if (banner && challenge && challenge.name != null && challenge.score != null) {
      banner.hidden = false;
      banner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">swords</span><span><b>${esc(challenge.name)}</b> t'a défié·e et a fait <b>${Math.round(challenge.score)} %</b>. Mêmes manches, à toi de jouer.</span>`;
    } else if (banner && challenge?.live) {
      banner.hidden = false;
      banner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">podcasts</span><span>Partie en direct <b>${esc(challenge.title || challenge.live)}</b> : tu joues en tant que <b>${esc(challenge.player)}</b>. Tes scores s'affichent sur l'écran de l'hôte à chaque manche.</span>`;
    } else if (banner && challenge?.cls) {
      banner.hidden = false;
      banner.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">school</span><span>Session de classe <b>${esc(challenge.title || challenge.cls)}</b> : à la fin, envoie ton code résultat à ton enseignant.</span>`;
    }

    // Freemium : un jeu Pro joué seul demande l'offre Pro (le défi du jour et les défis reçus restent ouverts).
    if (!mix && info(ids[0]).pro && !(window.OeilAccount && window.OeilAccount.isPro()) && !challenge) {
      const pw = $("#paywall");
      if (pw) { pw.hidden = false; submitBtn.disabled = true; hintBtn.hidden = true; brief.textContent = "Ce jeu fait partie d'Œil Pro."; return; }
    }
    startRound();
  }

  function play(def) {
    registry[def.id] = def;
    if (document.body.dataset.mode === "mix") return;
    start({ ids: [def.id] });
  }

  window.Oeil = { play, start, registry, color, drag, sortable, rand, randi, pick, shuffle, clamp, h, store, info };
})();
