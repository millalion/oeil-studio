# Pages « application » : direct, rejoindre, connexion, mon compte, contact et pages légales.
# Exécuté par build_pages.py, qui fournit page, seg, W, GAMES, DOMAINS, CHK.

DEFAULT_LIVE = {"kern-clinic", "color-impostor", "spacing-repair", "ui-detective", "microcopy-duel", "hue-line"}
PRO_ATTR, LOCK = ' data-pro=""', '<b aria-hidden="true" class="material-symbols-outlined mix-lock">lock</b>'
QUIZ_GAMES = ["microcopy-duel", "form-rescue", "dark-mode-repair", "responsive-rescue", "boolean-builder", "glyph-memory", "five-second-layout", "negative-space"]
chips = "".join(f'<label class="mix-chip"{" data-quiz=" + chr(34) + chr(34) if g["id"] in QUIZ_GAMES else ""}><input{CHK if g["id"] in DEFAULT_LIVE else ""}{PRO_ATTR if g["pro"] else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}{LOCK if g["pro"] else ""}</span></label>' for g in GAMES)
COLORS = ["#F7B4CC", "#D8EF71", "#B9D9FF", "#FFC08F", "#FFE08A", "#9FE3D0", "#C9B8FF", "#F0447A"]
ICONS = [("", "Aa"), ("visibility", ""), ("palette", ""), ("grid_view", ""), ("format_size", ""), ("gesture", ""), ("bolt", ""), ("local_florist", ""), ("rocket_launch", "")]

def av_picker(prefix, legend="Ton avatar"):
    cols = "".join(f'<label><input{CHK if i == 2 else ""} name="{prefix}-color" type="radio" value="{c}"/><span aria-label="Couleur {i + 1}" class="av-swatch" style="--av:{c}"></span></label>' for i, c in enumerate(COLORS))
    ico = lambda v, t: t if t else f'<span aria-hidden="true" class="material-symbols-outlined">{v}</span>'
    icons = "".join(f'<label><input{CHK if not v else ""} name="{prefix}-icon" type="radio" value="{v}"/><span class="av-icon">{ico(v, t)}</span></label>' for v, t in ICONS)
    return f'''<fieldset class="av-picker"><legend class="text-body-sm text-text-muted mb-2">{legend}</legend>
<div class="flex items-center gap-4"><span data-av-preview="{prefix}"></span><div class="grid gap-2"><div aria-label="Couleur" class="av-row" role="radiogroup">{cols}</div><div aria-label="Symbole" class="av-row" role="radiogroup">{icons}</div></div></div></fieldset>'''

# Lit et prévisualise un sélecteur d'avatar (partagé par plusieurs pages).
AV_JS = '''
  function avatarPicker(prefix, nameInput, initial) {
    const box = document.querySelector(`[data-av-preview="${prefix}"]`);
    const val = () => ({ color: (document.querySelector(`input[name="${prefix}-color"]:checked`) || {}).value, icon: (document.querySelector(`input[name="${prefix}-icon"]:checked`) || {}).value || "" });
    const paint = () => { if (box) box.innerHTML = OeilAvatar({ name: (nameInput && nameInput.value) || "?", avatar: val() }, "avatar-lg"); };
    if (initial) {
      document.querySelectorAll(`input[name="${prefix}-color"]`).forEach((r) => (r.checked = r.value.toLowerCase() === String(initial.color || "").toLowerCase()));
      document.querySelectorAll(`input[name="${prefix}-icon"]`).forEach((r) => (r.checked = r.value === (initial.icon || "")));
      if (!document.querySelector(`input[name="${prefix}-color"]:checked`)) document.querySelector(`input[name="${prefix}-color"]`).checked = true;
    }
    document.querySelectorAll(`input[name^="${prefix}-"]`).forEach((r) => r.addEventListener("change", paint));
    nameInput && nameInput.addEventListener("input", paint);
    paint();
    return val;
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const say = (el, text, kind) => { el.textContent = text; el.className = "form-msg" + (kind ? " is-" + kind : ""); };
'''

# ---------------------------------------------------------------- Partie en direct : écran de l'hôte
page("live.html", "Partie en direct — Œil Studio", "live", f'''<section class="{W} pt-6 lg:pt-10 pb-20">

<div class="ticket" id="step-setup">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Partie en direct · à projeter devant la classe ou tes amis</p>
<h1 class="text-big">Lance une partie<br/>en direct.</h1>
<p class="mt-4 max-w-[38rem] text-body-lg">Choisis les jeux, crée la salle, projette cet écran. Chacun rejoint depuis son téléphone avec le code ou le QR code, et tout le monde joue le même tirage.</p>
<form class="mt-8 flex flex-col gap-6" id="live-form">
<fieldset><legend class="text-body-sm text-text-muted mb-2">Type de partie</legend>{seg("live-mode", [("rythme", "Chacun à son rythme"), ("quiz", "Quiz projeté, façon Kahoot")], "rythme")}<p class="mt-2 text-body-sm text-text-muted max-w-[36rem]" id="mode-help">Chacun joue les jeux complets sur son téléphone, le classement s'affiche ici.</p></fieldset>
<label class="grid gap-1 text-body-sm text-text-muted max-w-[28rem]">Nom de la partie<input class="field" id="live-title" placeholder="Ex. : Échauffement typo du mardi" required="" type="text"/></label>
<fieldset><legend class="text-body-sm text-text-muted mb-2">Jeux de la partie</legend><div class="flex flex-wrap gap-2">{chips}</div><p class="mt-3 text-body-sm text-text-muted" hidden="" id="live-pro-note">Les jeux avec un cadenas font partie d'<a class="underline" href="tarifs.html#pro">Œil Pro</a>.</p></fieldset>
<div class="flex flex-wrap items-center gap-4">{seg("live-rounds", [("5", "5"), ("6", "6"), ("8", "8"), ("10", "10")], "6", "Manches")}<span hidden="" id="quiz-time">{seg("live-time", [("15", "15 s"), ("20", "20 s"), ("30", "30 s")], "20", "Temps par question")}</span><span class="form-msg" id="live-msg"></span></div>
</form>
</div>
<aside class="ticket-side" style="background:#FFE08A">
<p class="side-title">Comment ça se passe</p>
<ul class="step-list"><li><span aria-hidden="true" class="material-symbols-outlined">add_box</span><span><b>Crée la salle.</b> Un code et un QR code s'affichent à l'écran.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">qr_code_scanner</span><span><b>Les joueurs rejoignent</b> en scannant le QR code, avec leur prénom et leur avatar.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">play_arrow</span><span><b>Tu lances.</b> Tout le monde joue les mêmes manches, en même temps.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">emoji_events</span><span><b>Le classement</b> bouge à chaque manche, jusqu'au podium.</span></li></ul>
<button class="btn w-full mt-auto" form="live-form" type="submit">Créer la salle<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></button>
</aside>
</div>

<div class="ticket" hidden="" id="step-lobby">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Salle d'attente · <span id="lobby-title"></span></p>
<p class="text-body-lg">Va sur <b id="lobby-url"></b> et entre le code</p>
<p aria-live="polite" class="live-code" id="lobby-code"></p>
<div class="flex flex-wrap items-center gap-6 mt-6"><div class="live-qr" id="lobby-qr"></div><div class="flex flex-col gap-2"><p class="text-body-md">ou scanne ce QR code avec ton téléphone.</p><p class="text-body-sm text-text-muted" id="lobby-meta"></p><button class="btn-line btn-sm w-max mt-2" id="lobby-copy" type="button">Copier le lien d'invitation</button></div></div>
</div>
<aside class="ticket-side" style="background:#FFE08A">
<div class="flex items-center justify-between"><p class="font-medium">Joueurs</p><p class="tabular font-medium" id="lobby-count">0 joueur</p></div>
<ul class="live-players" id="lobby-players"><li class="live-empty">En attente des premiers joueurs…</li></ul>
<button class="btn w-full mt-auto" disabled="" id="lobby-start" type="button">Lancer la partie<span aria-hidden="true" class="material-symbols-outlined text-[18px]">play_arrow</span></button>
<button class="btn-quiet text-[14px] w-max" id="lobby-cancel" type="button">Annuler la salle</button>
</aside>
</div>

<div class="ticket" hidden="" id="step-live">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>En cours · <span id="live-title-h"></span></p>
<h1 class="text-headline-lg-mobile md:text-headline-xl">Classement en direct</h1>
<ol class="live-board" id="live-board"></ol>
</div>
<aside class="ticket-side" style="background:#FFE08A">
<p class="text-body-sm">Retardataires : code</p>
<p class="live-code live-code-sm" id="live-code-small"></p>
<div class="live-qr live-qr-sm" id="live-qr-small"></div>
<p class="text-body-sm" id="live-progress"></p>
<button class="btn w-full mt-auto" id="live-end" type="button">Terminer et afficher le podium</button>
</aside>
</div>

<div class="quiz-screen" hidden="" id="step-quiz">
<div class="quiz-top"><span id="qz-count">Question 1 sur 10</span><span class="quiz-game" id="qz-game"></span><span class="quiz-code">Code <b id="qz-code"></b></span></div>
<div class="quiz-timer"><i id="qz-bar"></i></div>
<p class="quiz-prompt" id="qz-prompt"></p>
<p class="quiz-goal" id="qz-goal"></p>
<div class="quiz-board" id="board"></div>
<div class="quiz-foot"><p><b class="tabular" id="qz-answers">0</b> réponse<span id="qz-answers-s">s</span> sur <span id="qz-players">0</span></p><p class="quiz-left tabular" id="qz-left"></p><div class="btn-row"><button class="btn-line" id="qz-skip" type="button">Afficher la réponse</button><button class="btn-line" hidden="" id="qz-show-rank" type="button">Classement</button><button class="btn" hidden="" id="qz-next" type="button">Question suivante<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></button></div></div>
<div class="quiz-rank" hidden="" id="qz-rank"><h2 class="text-big">Classement</h2><ol class="live-board" id="qz-rank-list"></ol><div class="flex justify-center mt-6"><button class="btn btn-lg" id="qz-continue" type="button">Question suivante</button></div></div>
</div>

<div class="dot-board px-5 sm:px-10 pt-16 pb-12" hidden="" id="step-podium">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Fin de partie</p>
<h1 class="text-big text-center">Le podium</h1>
<div class="podium" id="podium"></div>
<ol class="live-board mt-10 max-w-[48rem] mx-auto" id="podium-all"></ol>
<div class="flex flex-wrap justify-center gap-3 mt-8"><a class="btn" href="live.html">Nouvelle partie</a><button class="btn-line" id="podium-csv" type="button">Exporter le classement</button></div>
</div>
</section>''', '''<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&amp;display=swap" rel="stylesheet"/>
<script src="assets/catalog.js"></script>
<script src="assets/live.js"></script>
<script>document.body.dataset.mode = "mix";</script>
<script src="assets/engine.js"></script>
<script src="assets/kits.js"></script>
<script>OEIL_SEED.module("microcopy-duel")</script><script src="assets/games/microcopy-duel.js"></script>
<script>OEIL_SEED.module("form-rescue")</script><script src="assets/games/form-rescue.js"></script>
<script>OEIL_SEED.module("dark-mode-repair")</script><script src="assets/games/dark-mode-repair.js"></script>
<script>OEIL_SEED.module("responsive-rescue")</script><script src="assets/games/responsive-rescue.js"></script>
<script>OEIL_SEED.module("boolean-builder")</script><script src="assets/games/boolean-builder.js"></script>
<script>OEIL_SEED.module("glyph-memory")</script><script src="assets/games/glyph-memory.js"></script>
<script>OEIL_SEED.module("five-second-layout")</script><script src="assets/games/five-second-layout.js"></script>
<script>OEIL_SEED.module("negative-space")</script><script src="assets/games/negative-space.js"></script>
<script>OEIL_SEED.free();</script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let H = null, room = null;
    const QUIZ = ["microcopy-duel", "form-rescue", "dark-mode-repair", "responsive-rescue", "boolean-builder", "glyph-memory", "five-second-layout", "negative-space"];
    const modeOf = () => (document.querySelector('input[name="live-mode"]:checked') || {}).value;
    function applyMode() {
      const quiz = modeOf() === "quiz";
      $("mode-help").textContent = quiz ? "Les questions s'affichent sur cet écran, chacun répond A, B, C ou D sur son téléphone. Plus on répond vite et juste, plus on marque de points." : "Chacun joue les jeux complets sur son téléphone, le classement s'affiche ici.";
      document.querySelectorAll("#live-form .mix-chip").forEach((c) => { const q = c.hasAttribute("data-quiz"); c.hidden = quiz && !q; const b = c.querySelector("input"); if (quiz) b.checked = q && !b.disabled; });
      $("quiz-time").hidden = !quiz;
      document.querySelector('input[name="live-rounds"]').closest(".flex").querySelector(".seg-pick-label").textContent = quiz ? "Questions" : "Manches";
    }
    document.querySelectorAll('input[name="live-mode"]').forEach((r) => r.addEventListener("change", applyMode));
    const lockPro = () => {
      const pro = OeilAccount.isPro();
      document.querySelectorAll("#live-form input[data-pro]").forEach((b) => { b.disabled = !pro; if (!pro) b.checked = false; });
      $("live-pro-note").hidden = pro;
    };
    lockPro(); OeilAccount.ready.then(lockPro);
    const show = (step) => ["setup", "lobby", "live", "quiz", "podium"].forEach((k) => ($("step-" + k).hidden = k !== step));
    const joinUrl = () => location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "") + "rejoindre.html";
    const qr = (el, text, size) => { el.innerHTML = ""; if (window.QRCode) new QRCode(el, { text, width: size, height: size, colorDark: "#141413", colorLight: "#ffffff" }); else el.textContent = text; };
    $("live-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const ids = [...document.querySelectorAll("#live-form input[type=checkbox]:checked")].map((b) => b.value);
      if (!ids.length) { $("live-msg").textContent = "Choisis au moins un jeu."; return; }
      const rounds = +document.querySelector('input[name="live-rounds"]:checked').value;
      H = OeilLive.host({ title: $("live-title").value.trim() || "Partie en direct", ids, rounds, mode: modeOf() }, render);
      room = H.room;
      const link = `${joinUrl()}?code=${room.code}`;
      $("lobby-code").textContent = room.code;
      $("lobby-url").textContent = joinUrl().replace(/^https?:\\/\\//, "");
      $("lobby-title").textContent = room.title;
      $("lobby-meta").textContent = `${rounds} manches · ${ids.length} jeu${ids.length > 1 ? "x" : ""}`;
      $("lobby-copy").onclick = async () => { try { await navigator.clipboard.writeText(link); $("lobby-copy").textContent = "Lien copié"; } catch (err) { prompt("Lien d'invitation", link); } };
      qr($("lobby-qr"), link, 200);
      show("lobby");
      render(room);
    });
    const row = (p, i, r) => `<li class="live-row"><span class="live-rank">${i + 1}</span><span class="live-name">${OeilAvatar(p, "avatar-sm")}${esc(p.name)}${p.done ? " <small>terminé</small>" : ""}</span><span class="live-dots">${Array.from({ length: r.rounds }, (_, k) => `<i class="${p.scores[k] != null ? "is-done" : ""}">${p.scores[k] != null ? p.scores[k] : ""}</i>`).join("")}</span><b class="live-total">${p.total} pts</b></li>`;
    function render(r) {
      room = r;
      const ranking = OeilLive.ranking(r), n = ranking.length;
      $("lobby-count").textContent = `${n} joueur${n > 1 ? "s" : ""}`;
      $("lobby-players").innerHTML = n ? ranking.map((p) => `<li>${OeilAvatar(p, "avatar-sm")}${esc(p.name)}</li>`).join("") : '<li class="live-empty">En attente des premiers joueurs…</li>';
      $("lobby-start").disabled = !n;
      if (r.status === "playing" && r.mode === "quiz") { quizTick(r); return; }
      if (r.status === "playing") {
        show("live");
        $("live-code-small").textContent = r.code;
        if (!$("live-qr-small").childElementCount) qr($("live-qr-small"), `${joinUrl()}?code=${r.code}`, 120);
        $("live-title-h").textContent = r.title;
        $("live-board").innerHTML = ranking.map((p, i) => row(p, i, r)).join("");
        const finished = ranking.filter((p) => p.done).length;
        $("live-progress").textContent = `${finished} sur ${n} joueur${n > 1 ? "s ont" : " a"} terminé.`;
      }
      if (r.status === "finished") podium(ranking);
    }
    function podium(ranking) {
      show("podium");
      const top = ranking.slice(0, 3), order = [1, 0, 2], medal = ["1", "2", "3"];
      $("podium").innerHTML = order.filter((i) => top[i]).map((i) => `<div class="podium-step podium-${i + 1}">${OeilAvatar(top[i])}<b class="truncate max-w-full">${esc(top[i].name)}</b><span>${top[i].total} pts</span><i>${medal[i]}</i></div>`).join("");
      $("podium-all").innerHTML = ranking.map((p, i) => `<li class="live-row"><span class="live-rank">${i + 1}</span><span class="live-name">${OeilAvatar(p, "avatar-sm")}${esc(p.name)}</span><span class="text-body-sm text-text-muted">${p.played} manche${p.played > 1 ? "s" : ""} · moyenne ${Math.round(p.avg)} %</span><b class="live-total">${p.total} pts</b></li>`).join("");
      $("podium-csv").onclick = () => {
        const csv = "rang;joueur;points;moyenne;manches\\n" + ranking.map((p, i) => [i + 1, p.name, p.total, Math.round(p.avg), p.scores.join(" ")].join(";")).join("\\n");
        const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" })); a.download = `classement-${room.code}.csv`; a.click();
      };
    }
    // ---------------------------------------------------------------- Quiz projeté
    const KCOL = ["#F7B4CC", "#D8EF71", "#B9D9FF", "#FFC08F", "#FFE08A", "#9FE3D0"];
    let Q = null; // { list, i, state, timer, T }
    const fakeApi = (board) => ({ board, controls: document.createElement("div"), h: Oeil.h, drag: Oeil.drag, sortable: Oeil.sortable, color: Oeil.color, rand: Oeil.rand, randi: Oeil.randi, pick: Oeil.pick, shuffle: Oeil.shuffle, clamp: Oeil.clamp, setSubmit() {}, setBrief(t) { $("qz-prompt").textContent = t; }, submit() {}, phase: "play", round: 0, hintUsed: false });
    function buildList() {
      const ids = room.ids.filter((id) => Oeil.registry[id]);
      const occ = {}, list = [];
      for (let i = 0; i < room.rounds; i++) { const id = ids[i % ids.length]; occ[id] = (occ[id] || 0); list.push({ id, n: occ[id]++ }); }
      return Oeil.shuffle(list);
    }
    function ask() {
      const item = Q.list[Q.i], game = Oeil.registry[item.id], board = $("board");
      board.innerHTML = ""; $("qz-rank").hidden = true; $("qz-skip").hidden = false; $("qz-next").hidden = true; $("qz-show-rank").hidden = true;
      window.scrollTo(0, 0);
      $("qz-count").textContent = `Question ${Q.i + 1} sur ${Q.list.length}`;
      const info = window.OEIL_GAMES.find((g) => g.id === item.id) || {};
      $("qz-game").textContent = info.name || "";
      $("qz-goal").textContent = "Réponds sur ton téléphone : A, B, C ou D.";
      const api = fakeApi(board);
      Q.state = game.setup(item.n, api); Q.api = api; Q.game = game;
      $("qz-prompt").textContent = Q.state.memo ? "Observe bien…" : Q.state.it.prompt;
      game.mount(board, Q.state, api);
      Q.correct = Q.state.opts.findIndex((o) => o.correct);
      const memo = Q.state.it.memo ? (Q.state.it.memo.seconds || 4) * 1000 : 0;
      H.update((r) => { r.quiz = { i: Q.i, n: Q.state.opts.length, state: memo ? "look" : "question", answers: {}, at: Date.now() }; });
      clearTimeout(Q.open); clearInterval(Q.timer);
      Q.open = setTimeout(() => {
        H.update((r) => { r.quiz.state = "question"; r.quiz.at = Date.now(); });
        const T = Q.T * 1000, t0 = Date.now();
        Q.timer = setInterval(() => {
          const left = Math.max(0, T - (Date.now() - t0));
          $("qz-bar").style.width = `${(left / T) * 100}%`;
          $("qz-left").textContent = `${Math.ceil(left / 1000)} s`;
          const n = Object.keys(room.players).length;
          if (left <= 0 || (n && Object.keys(room.quiz.answers).length >= n)) revealQ();
        }, 200);
      }, memo + 150);
      $("qz-bar").style.width = "100%"; $("qz-left").textContent = memo ? "Mémorise…" : "";
    }
    function revealQ() {
      if (!Q || room.quiz.state !== "question") return;
      clearInterval(Q.timer);
      const q = room.quiz, T = Q.T * 1000, counts = Array(q.n).fill(0);
      H.update((r) => {
        Object.entries(r.quiz.answers).forEach(([name, a]) => {
          counts[a.k] = (counts[a.k] || 0) + 1;
          const p = r.players[name]; if (!p) return;
          const ok = a.k === Q.correct;
          p.scores[Q.i] = ok ? Math.round(500 + 500 * Math.max(0, 1 - (a.at - r.quiz.at) / T)) : 0;
        });
        Object.values(r.players).forEach((p) => { if (p.scores[Q.i] == null) p.scores[Q.i] = 0; });
        r.quiz.state = "reveal"; r.quiz.correct = Q.correct; r.quiz.counts = counts;
      });
      Q.state.picked = -1;
      Q.game.reveal && Q.game.reveal($("board"), Q.state, {}, Q.api);
      document.querySelectorAll("#board .kit-opt").forEach((b, k) => b.insertAdjacentHTML("beforeend", `<span class="quiz-votes">${counts[k] || 0}</span>`));
      // Une phrase d'explication, pas plus
      const ex = String(Q.state.it.explain || ""), m = ex.match(/^.*?[.!?](?=\\s|$)/);
      $("qz-goal").textContent = m ? m[0] : ex;
      $("qz-skip").hidden = true; $("qz-next").hidden = false;
      const last = Q.i >= Q.list.length - 1;
      $("qz-show-rank").hidden = last;
      $("qz-next").firstChild.textContent = last ? "Voir le podium" : "Question suivante";
      $("qz-left").textContent = "";
    }
    function quizTick(r) {
      show("quiz");
      $("qz-code").textContent = r.code;
      const n = Object.keys(r.players).length, a = r.quiz ? Object.keys(r.quiz.answers || {}).length : 0;
      $("qz-players").textContent = n; $("qz-answers").textContent = a; $("qz-answers-s").textContent = a > 1 ? "s" : "";
      if (!Q) { Q = { list: buildList(), i: 0, T: +((document.querySelector('input[name="live-time"]:checked') || {}).value || 20) }; ask(); }
    }
    $("qz-skip").addEventListener("click", revealQ);
    $("qz-next").addEventListener("click", () => { if (Q.i >= Q.list.length - 1) { H.finish(); return; } Q.i++; ask(); });
    $("qz-show-rank").addEventListener("click", () => {
      const rk = OeilLive.ranking(room).slice(0, 5);
      $("qz-rank-list").innerHTML = rk.map((p, i) => `<li class="live-row"><span class="live-rank">${i + 1}</span><span class="live-name">${OeilAvatar(p, "avatar-sm")}${esc(p.name)}</span><span class="text-body-sm text-text-muted">+${p.scores[Q.i] || 0}</span><b class="live-total">${p.total} pts</b></li>`).join("");
      $("qz-rank").hidden = false;
    });
    $("qz-continue").addEventListener("click", () => { Q.i++; ask(); });
    document.querySelectorAll('input[name="live-time"]').forEach((r) => r.addEventListener("change", () => {}));
    applyMode();

    $("lobby-start").addEventListener("click", () => H && H.start());
    $("lobby-cancel").addEventListener("click", () => { show("setup"); H = null; room = null; });
    $("live-end").addEventListener("click", () => H && H.finish());
    window.addEventListener("beforeunload", (e) => { if (room && room.status !== "finished") { e.preventDefault(); e.returnValue = ""; } });
  })();
</script>
''')

# ---------------------------------------------------------------- Rejoindre une partie
page("rejoindre.html", "Rejoindre une partie — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Rejoindre une partie en direct</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
<div class="lg:col-span-6">
<h1 class="text-big">Entre le code.</h1>
<p class="mt-4 text-body-lg max-w-[30rem]">Le code de la partie s'affiche sur l'écran de l'hôte, sous le QR code. Choisis ton prénom et ton avatar : ils apparaîtront dans le classement.</p>
</div>
<div class="lg:col-span-6">
<form class="join-card" id="join-form">
<label class="grid gap-2 text-body-sm text-text-muted">Code de la partie<input autocapitalize="characters" autocomplete="off" class="join-code" id="join-code" maxlength="5" placeholder="K7Q4M" required="" type="text"/></label>
<label class="grid gap-2 text-body-sm text-text-muted">Ton prénom<input autocomplete="given-name" class="h-12 rounded border border-ink bg-white px-3 text-[18px] text-ink" id="join-name" maxlength="24" required="" type="text"/></label>
<div id="join-av">{av_picker("jav")}</div>
<button class="btn w-full" id="join-submit" type="submit">Rejoindre<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></button>
<p aria-live="polite" class="form-msg" id="join-error"></p>
</form>
<div class="join-card" hidden="" id="join-wait">
<p class="text-body-sm text-text-muted">Tu es dans la salle</p>
<p class="text-headline-md" id="wait-title"></p>
<p class="mt-2 flex items-center gap-2 text-body-md"><span class="sm-spin sm-spin-dark"></span>En attente du lancement par l'hôte…</p>
<ul class="live-players mt-4" id="wait-players"></ul>
</div>
<div class="quiz-pad" hidden="" id="quiz-pad">
<p class="quiz-pad-top"><span id="pad-q"></span><b id="pad-score">0 pt</b></p>
<p class="quiz-pad-msg" id="pad-msg">Regarde l'écran…</p>
<div class="quiz-pad-keys" id="pad-keys"></div>
</div>
</div>
</div>
</div>
</section>''', '''<script src="assets/live.js"></script>
<script>
  (function () {''' + AV_JS + '''
    const $ = (id) => document.getElementById(id);
    const q = new URLSearchParams(location.search);
    if (q.get("code")) $("join-code").value = q.get("code").toUpperCase();
    const me = OeilAccount.identity(), acc = OeilAccount.get();
    $("join-name").value = me.name || "";
    const av = avatarPicker("jav", $("join-name"), me.avatar);
    if (acc) $("join-av").hidden = true;
    $("join-code").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")));
    $("join-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = $("join-code").value.trim(), name = $("join-name").value.trim();
      const avatar = acc ? acc.avatar : av();
      $("join-submit").disabled = true; say($("join-error"), "Connexion à la salle…");
      const room = await OeilLive.fetchRoom(code);
      $("join-submit").disabled = false;
      if (!room) { say($("join-error"), "Code introuvable. Vérifie le code affiché par l'hôte, et que son écran est toujours ouvert.", "error"); return; }
      if (room.status === "finished") { say($("join-error"), "Cette partie est terminée.", "error"); return; }
      if (!acc) OeilAccount.setGuest({ name, avatar });
      // Quiz projeté : le téléphone devient une manette A, B, C, D
      const KCOL = ["#F7B4CC", "#D8EF71", "#B9D9FF", "#FFC08F", "#FFE08A", "#9FE3D0"];
      let sentFor = -1;
      const pad = (r) => {
        const q = r.quiz, me = r.players[name] || { scores: [] };
        const rk = OeilLive.ranking(r), pos = rk.findIndex((p) => p.name === name);
        const total = (me.scores || []).reduce((a, b) => a + (b || 0), 0);
        $("join-wait").hidden = true; $("quiz-pad").hidden = false;
        $("pad-score").textContent = `${total} pt${total > 1 ? "s" : ""}`;
        $("pad-q").textContent = q ? `Question ${q.i + 1}` : "";
        const keys = $("pad-keys"), msg = $("pad-msg");
        if (r.status === "finished") { keys.innerHTML = ""; msg.innerHTML = `<b>Partie terminée.</b><br/>Tu finis ${pos + 1}${pos ? "e" : "er"} sur ${rk.length} avec ${total} points.`; return; }
        if (!q || q.state === "look") { keys.innerHTML = ""; msg.textContent = "Regarde l'écran…"; return; }
        if (q.state === "question") {
          if (sentFor === q.i || (q.mine && q.mine[name])) { keys.innerHTML = ""; msg.textContent = "Réponse envoyée. On attend les autres…"; return; }
          msg.textContent = "Ta réponse :";
          if (keys.dataset.q !== String(q.i)) {
            keys.dataset.q = q.i;
            keys.innerHTML = Array.from({ length: q.n }, (_, k) => `<button style="--k:${KCOL[k]}" data-k="${k}" type="button">${"ABCDEF"[k]}</button>`).join("");
            keys.querySelectorAll("button").forEach((b) => (b.onclick = () => { sentFor = q.i; OeilLive.answer(code, name, q.i, +b.dataset.k); if (navigator.vibrate) navigator.vibrate(30); keys.innerHTML = ""; msg.textContent = "Réponse envoyée. On attend les autres…"; }));
          }
          return;
        }
        if (q.state === "reveal") {
          keys.innerHTML = ""; keys.dataset.q = "";
          const pts = (me.scores || [])[q.i] || 0, ok = pts > 0;
          msg.innerHTML = ok ? `<b class="pad-ok">Bonne réponse ! +${pts}</b><br/>Tu es ${pos + 1}${pos ? "e" : "er"} sur ${rk.length}.` : `<b class="pad-ko">Raté.</b> C'était la ${"ABCDEF"[q.correct]}.<br/>Tu es ${pos + 1}${pos ? "e" : "er"} sur ${rk.length}.`;
        }
      };
      const go = (r) => {
        if (r.mode === "quiz" && r.status !== "lobby") { pad(r); return; }
        if (r.status === "playing") { location.href = OeilLive.playLink(r, name); return; }
        $("wait-title").textContent = r.title;
        $("wait-players").innerHTML = Object.values(r.players).map((p) => `<li>${OeilAvatar(p, "avatar-sm")}${esc(p.name)}</li>`).join("");
      };
      $("join-form").hidden = true; $("join-wait").hidden = false;
      go(room);
      OeilLive.watch(code, go);
      OeilLive.join(code, name, avatar);
    });
  })();
</script>
''')

# ---------------------------------------------------------------- Connexion et inscription
page("connexion.html", "Connexion — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Ton espace Œil Studio</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<div class="lg:col-span-6">
<h1 class="text-big">Garde ta<br/>progression.</h1>
<p class="mt-5 text-body-lg max-w-[32rem]">Un compte gratuit retrouve tes records, ta série du défi du jour, tes badges et ton historique sur tous tes appareils. Les jeux gratuits restent jouables sans compte.</p>
<ul class="mt-8 grid gap-3 text-body-md"><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Tableau de progression par discipline</li><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Badges et couronnes à débloquer</li><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Classement du défi du jour</li><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Pour les enseignants : classes et résultats</li></ul>
</div>
<div class="lg:col-span-6">
<p class="ref-banner" hidden="" id="ref-banner"></p>
<div class="join-card" id="auth-card">
<button class="btn-google" id="auth-google" type="button"><svg aria-hidden="true" viewBox="0 0 48 48"><path d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" fill="#FFC107"/><path d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" fill="#FF3D00"/><path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" fill="#4CAF50"/><path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" fill="#1976D2"/></svg>Continuer avec Google</button>
<p class="or-line">ou avec ton adresse e-mail</p>
<div aria-label="Type de formulaire" class="seg-line w-max" role="group"><button aria-pressed="true" data-tab="login" type="button">Se connecter</button><button aria-pressed="false" data-tab="signup" type="button">Créer un compte</button></div>
<form class="flex flex-col gap-4 mt-2" id="auth-form">
<div class="grid sm:grid-cols-2 gap-4" data-only="signup" hidden=""><label class="grid gap-1 text-body-sm text-text-muted">Prénom<input autocomplete="given-name" class="field" id="auth-name" maxlength="40" type="text"/></label><label class="grid gap-1 text-body-sm text-text-muted">Pseudo unique<span class="pseudo-field"><input autocapitalize="none" autocomplete="username" class="field" id="auth-user" maxlength="20" pattern="[a-zA-Z0-9_.]{{3,20}}" placeholder="ton.pseudo" type="text"/></span><span class="text-[12px]" id="auth-user-msg">Visible dans les classements.</span></label></div>
<label class="grid gap-1 text-body-sm text-text-muted">Adresse e-mail<input autocomplete="email" class="field" id="auth-email" required="" type="email"/></label>
<label class="grid gap-1 text-body-sm text-text-muted" data-hide="forgot">Mot de passe<input autocomplete="current-password" class="field" id="auth-pass" minlength="10" required="" type="password"/><span class="text-[12px]" data-only="signup" hidden="">10 caractères minimum. Une phrase fonctionne très bien.</span></label>
<fieldset data-only="signup" hidden=""><legend class="text-body-sm text-text-muted mb-2">Tu es</legend>{seg("role", [("etudiant", "Étudiant·e"), ("enseignant", "Enseignant·e"), ("pro", "Designer en poste")], "etudiant")}</fieldset>
<div data-only="signup" hidden="">{av_picker("sav")}</div>
<label class="flex gap-2 items-start text-body-sm" data-only="signup" hidden=""><input class="mt-1 accent-ink" id="auth-terms" type="checkbox"/><span>J'accepte les <a class="underline" href="cgv.html" target="_blank">conditions générales</a> et la <a class="underline" href="confidentialite.html" target="_blank">politique de confidentialité</a>.</span></label>
<button class="btn w-full" id="auth-submit" type="submit">Se connecter</button>
<div class="flex flex-wrap justify-between gap-2"><button class="btn-quiet text-[14px] w-max" data-only="login" id="auth-forgot" type="button">Mot de passe oublié ?</button><button class="btn-quiet text-[14px] w-max" data-only="forgot" hidden="" id="auth-back" type="button">Retour à la connexion</button></div>
<p aria-live="polite" class="form-msg" id="auth-msg"></p>
</form>
</div>
<form class="join-card" hidden="" id="reset-form">
<p class="text-headline-md">Nouveau mot de passe</p>
<label class="grid gap-1 text-body-sm text-text-muted">Choisis un nouveau mot de passe<input autocomplete="new-password" class="field" id="reset-pass" minlength="10" required="" type="password"/></label>
<button class="btn w-full" type="submit">Enregistrer</button>
<p aria-live="polite" class="form-msg" id="reset-msg"></p>
</form>
</div>
</div>
</div>
</section>''', '''<script>
  (function () {''' + AV_JS + '''
    const $ = (id) => document.getElementById(id);
    const next = new URLSearchParams(location.search).get("suite");
    const after = () => { location.href = next && /^[a-z0-9-]+\\.html/i.test(next) ? next : "compte.html"; };
    let tab = "login";
    const av = avatarPicker("sav", $("auth-name"));
    const setTab = (t) => {
      tab = t;
      document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === t)));
      document.querySelectorAll("[data-only]").forEach((n) => (n.hidden = n.dataset.only !== t));
      document.querySelectorAll("[data-hide]").forEach((n) => (n.hidden = n.dataset.hide === t));
      $("auth-submit").textContent = { login: "Se connecter", signup: "Créer mon compte", forgot: "Recevoir le lien" }[t];
      $("auth-pass").autocomplete = t === "login" ? "current-password" : "new-password";
      $("auth-pass").required = t !== "forgot";
      $("auth-name").required = t === "signup"; $("auth-user").required = t === "signup";
      say($("auth-msg"), "");
    };
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
    $("auth-forgot").addEventListener("click", () => setTab("forgot"));
    // Pseudo : proposé depuis le prénom, vérifié en direct
    const slug = (t) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9_.]/g, "").slice(0, 20);
    let touched = false, chk;
    $("auth-name").addEventListener("input", () => { if (!touched) { $("auth-user").value = slug($("auth-name").value); $("auth-user").dispatchEvent(new Event("check")); } });
    const check = () => { clearTimeout(chk); const v = $("auth-user").value.trim(); if (v.length < 3) { say($("auth-user-msg"), "Visible dans les classements."); return; } chk = setTimeout(async () => { const ok = await OeilAccount.usernameFree(v).catch(() => true); say($("auth-user-msg"), ok ? `@${v.toLowerCase()} est libre.` : `@${v.toLowerCase()} est déjà pris.`, ok ? "ok" : "error"); }, 350); };
    $("auth-user").addEventListener("input", () => { touched = true; $("auth-user").value = $("auth-user").value.replace(/[^a-zA-Z0-9_.]/g, ""); check(); });
    $("auth-user").addEventListener("check", check);
    $("auth-google").addEventListener("click", async () => {
      try { await OeilAccount.signInWithGoogle(next); }
      catch (err) { say($("auth-msg"), err && /provider is not enabled|Unsupported provider/i.test(err.message || "") ? "La connexion avec Google n'est pas encore activée. Utilise ton adresse e-mail en attendant." : OeilAccount.human(err), "error"); }
    });
    $("auth-back").addEventListener("click", () => setTab("login"));
    if (location.hash === "#inscription") setTab("signup");
    // Lien d'invitation d'un ami
    const ref = new URLSearchParams(location.search).get("parrain");
    if (ref) {
      setTab("signup");
      OeilAccount.referrerName(ref).then((who) => { if (!who) return; const b = $("ref-banner"); b.hidden = false; b.innerHTML = `<span class="material-symbols-outlined" aria-hidden="true">redeem</span><span><b>${esc(who)} t'invite sur Œil Studio.</b> Crée ton compte : vous recevez chacun 14 jours d'Œil Pro offerts, et vous devenez amis.</span>`; });
    }
    // Retour du lien « mot de passe oublié »
    if (location.hash.includes("type=recovery") || location.hash === "#nouveau") {
      OeilAccount.client().then((c) => c && c.auth.onAuthStateChange((ev) => { if (ev === "PASSWORD_RECOVERY") { $("auth-card").hidden = true; $("reset-form").hidden = false; } }));
      OeilAccount.ready.then((u) => { if (u) { $("auth-card").hidden = true; $("reset-form").hidden = false; } });
    } else OeilAccount.ready.then((u) => { if (u && !next) location.replace("compte.html"); });
    $("reset-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await OeilAccount.updatePassword($("reset-pass").value); say($("reset-msg"), "Mot de passe enregistré. Redirection…", "ok"); setTimeout(after, 900); }
      catch (err) { say($("reset-msg"), OeilAccount.human(err), "error"); }
    });
    $("auth-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = $("auth-email").value.trim(), password = $("auth-pass").value;
      const btn = $("auth-submit"); btn.disabled = true;
      try {
        if (tab === "forgot") { await OeilAccount.resetPassword(email); say($("auth-msg"), `Si un compte existe pour ${email}, un lien pour choisir un nouveau mot de passe vient d'être envoyé.`, "ok"); }
        else if (tab === "login") { await OeilAccount.signIn({ email, password }); await OeilAccount.claimReferral().catch(() => {}); after(); }
        else {
          if (!$("auth-terms").checked) { say($("auth-msg"), "Accepte les conditions générales pour créer ton compte.", "error"); return; }
          const role = (document.querySelector('input[name="role"]:checked') || {}).value;
          const username = $("auth-user").value.trim().toLowerCase();
          if (!(await OeilAccount.usernameFree(username))) { say($("auth-msg"), "Ce pseudo est déjà pris ou n'est pas valide (3 à 20 caractères : lettres, chiffres, point, tiret bas).", "error"); return; }
          const r = await OeilAccount.signUp({ name: $("auth-name").value.trim(), username, email, password, role, avatar: av() });
          if (r.confirm) say($("auth-msg"), `Compte créé. Ouvre l'e-mail envoyé à ${email} et clique sur le lien pour l'activer.`, "ok");
          else { await OeilAccount.claimReferral().catch(() => {}); after(); }
        }
      } catch (err) { say($("auth-msg"), OeilAccount.human(err), "error"); }
      finally { btn.disabled = false; }
    });
  })();
</script>
''')

# ---------------------------------------------------------------- Mon compte : tableau de progression
page("compte.html", "Mon compte — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Mon compte · progression</p>
<div class="px-5 sm:px-10 pt-16 pb-8">
<div class="flex flex-wrap items-end justify-between gap-6">
<div class="flex items-center gap-5 min-w-0"><span id="acc-avatar"></span><div class="min-w-0"><p class="text-body-md text-text-muted"><span id="acc-role">Sur cet appareil</span></p><h1 class="text-[clamp(44px,6.4vw,96px)] font-medium leading-[0.92] tracking-[-0.05em] break-words" id="acc-name">Ta progression</h1></div></div>
<div class="btn-row"><a class="btn" href="defi.html">Défi du jour</a><button class="btn-line" hidden="" id="acc-edit" type="button">Modifier mon profil</button><a class="btn-line" href="connexion.html#inscription" id="acc-signup">Créer un compte</a><a class="btn-line" href="connexion.html" id="acc-login">Se connecter</a></div>
</div>
<div class="acc-guest" hidden="" id="acc-guest"><span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span><span>Ta progression est enregistrée sur cet appareil. <a class="underline" href="connexion.html#inscription">Crée un compte gratuit</a> pour la retrouver partout et apparaître dans le classement du jour.</span></div>
<form class="join-card mt-8 max-w-[40rem]" hidden="" id="profile-form">
<p class="text-headline-md">Mon profil</p>
<div class="grid sm:grid-cols-2 gap-4"><label class="grid gap-1 text-body-sm text-text-muted">Prénom<input class="field" id="pf-name" maxlength="40" required="" type="text"/></label><label class="grid gap-1 text-body-sm text-text-muted">Pseudo unique<span class="pseudo-field"><input autocapitalize="none" class="field" id="pf-user" maxlength="20" pattern="[a-zA-Z0-9_.]{{3,20}}" required="" type="text"/></span></label></div>
<fieldset><legend class="text-body-sm text-text-muted mb-2">Tu es</legend>{seg("pf-role", [("etudiant", "Étudiant·e"), ("enseignant", "Enseignant·e"), ("pro", "Designer en poste")], "etudiant")}</fieldset>
{av_picker("pav")}
<div class="btn-row"><button class="btn" type="submit">Enregistrer</button><button class="btn-line" id="pf-cancel" type="button">Annuler</button></div>
<p aria-live="polite" class="form-msg" id="pf-msg"></p>
</form>
</div>
</div>
</section>

<section class="{W} pt-4 pb-24">
<div class="dash-grid">
<div class="dash-card c-3 dash-kpi"><span>Sessions jouées</span><b id="k-sessions">0</b><small id="k-sessions-sub">aucune pour l'instant</small></div>
<div class="dash-card c-3 dash-kpi"><span>Moyenne sur 30 jours</span><b id="k-avg">–</b><small id="k-avg-sub">toutes sessions : –</small></div>
<div class="dash-card c-3 dash-kpi"><span>Série du défi du jour</span><b id="k-streak">0 jour</b><small id="k-streak-sub">record : 0 jour</small></div>
<div class="dash-card c-3 dash-kpi"><span>Jeux essayés</span><b id="k-games">0 sur 44</b><small id="k-badges">0 badge débloqué</small></div>

<div class="dash-card c-7"><h2>Ta courbe</h2><p class="text-body-sm text-text-muted mt-1">Moyenne de tes 30 dernières sessions.</p><div id="spark"></div></div>
<div class="dash-card c-5"><h2>Tes disciplines</h2><p class="text-body-sm text-text-muted mt-1">Moyenne de tes records, et jeux essayés.</p><div class="dom-bars" id="dom-bars"></div></div>

<div class="dash-card c-12 scroll-mt-24" id="badges"><div class="flex flex-wrap items-baseline justify-between gap-2"><h2>Badges et couronnes</h2><p class="text-body-sm text-text-muted" id="badge-count"></p></div><div class="badges" id="badge-list"></div></div>

<div class="dash-card c-7"><h2>Records par discipline</h2><div class="dash-tabs" id="rec-tabs" role="group" aria-label="Discipline"></div><ol class="records" id="rec-list"></ol></div>
<div class="dash-card c-5"><h2>Dernières sessions</h2><ol class="mt-3 acc-history" id="acc-history"><li class="text-text-muted">Aucune session pour l'instant. <a class="underline" href="jeux.html">Choisis un jeu</a>.</li></ol></div>

<div class="dash-card c-5" id="plan-card"><h2>Mon offre</h2><p class="mt-2 text-[34px] font-medium tracking-[-0.04em]" id="acc-plan">Gratuit</p><p class="text-body-sm text-text-muted" id="acc-plan-sub">__NFREE__ jeux gratuits, le défi du jour et les parties en direct.</p><div class="btn-row mt-4"><a class="btn" href="tarifs.html" id="plan-cta">Voir les offres</a><button class="btn-line" hidden="" id="plan-portal" type="button">Gérer mon abonnement</button></div><p class="form-msg mt-2" id="plan-msg"></p></div>
<div class="dash-card c-7" id="class-card" hidden=""><h2 id="class-h">Ma classe</h2>
<div id="class-student"><p class="text-body-sm text-text-muted mt-1">Ton enseignant·e t'a donné un code de classe ? Entre-le pour obtenir l'accès Pro de la classe.</p><form class="sum-share-row mt-3" id="class-join"><input aria-label="Code de classe" autocapitalize="characters" class="field flex-1 min-w-0 uppercase" id="class-code" maxlength="8" placeholder="Code de classe" required="" type="text"/><button class="btn" type="submit">Rejoindre</button></form><ul class="mt-3 grid gap-2" id="class-mine"></ul></div>
<div hidden="" id="class-teacher"><p class="text-body-sm text-text-muted mt-1">Crée une classe, donne son code à tes étudiants : ils obtiennent l'accès Pro (40 par classe) et leurs résultats s'affichent ici.</p><form class="sum-share-row mt-3" id="class-new"><input aria-label="Nom de la classe" class="field flex-1 min-w-0" id="class-name" maxlength="60" placeholder="Ex. : DN MADE 2, groupe B" required="" type="text"/><button class="btn" type="submit">Créer</button></form><div class="mt-4 grid gap-4" id="class-list"></div></div>
<p class="form-msg mt-2" id="class-msg"></p></div>

<div class="dash-card c-5" hidden="" id="invite-card"><h2>Invite tes amis</h2>
<p class="text-body-sm text-text-muted mt-1">Chaque ami qui s'inscrit avec ton lien vous offre <b class="text-ink">14 jours d'Œil Pro à chacun</b> (jusqu'à 10 amis), et vous devenez amis automatiquement.</p>
<div class="invite-code mt-4"><span>Ton code ami</span><b id="my-code">––––––</b></div>
<div class="btn-row mt-3"><button class="btn" id="invite-copy" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">link</span>Copier mon lien</button><button class="btn-line" hidden="" id="invite-share" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">ios_share</span>Partager</button></div>
<p class="text-body-sm mt-3" id="invite-stats"></p></div>
<div class="dash-card c-7" hidden="" id="friends-card"><div class="flex flex-wrap items-baseline justify-between gap-2"><h2>Mes amis</h2><a class="text-[13px] underline" href="classement.html?amis=1">Classement entre amis</a></div>
<form class="sum-share-row mt-3" id="friend-add"><input aria-label="Code ami" autocapitalize="characters" class="field flex-1 min-w-0 uppercase" id="friend-code" maxlength="6" placeholder="Code ami ou @pseudo" required="" type="text"/><button class="btn" type="submit">Ajouter</button></form>
<p class="form-msg mt-2" id="friend-msg"></p>
<ol class="friend-list mt-2" id="friend-list"><li class="friend-empty">Ajoute un ami avec son code, ou envoie-lui ton lien d'invitation.</li></ol></div>

<div class="dash-card c-12" id="danger-card"><h2>Mes données</h2><p class="text-body-sm text-text-muted mt-1">Tes scores sont enregistrés sur cet appareil<span id="sync-note">, et sur ton compte quand tu es connecté·e</span>.</p><div class="btn-row mt-4"><button class="btn-line" hidden="" id="acc-logout" type="button">Se déconnecter</button><button class="btn-line" id="acc-clear" type="button">Effacer les données de cet appareil</button><button class="btn-line" hidden="" id="acc-delete" type="button">Supprimer mon compte</button></div><p class="form-msg mt-2" id="danger-msg"></p></div>
</div>
</section>''', '''<script src="assets/catalog.js"></script>
<script src="assets/progress.js"></script>
<script>
  (function () {''' + AV_JS + '''
    const $ = (id) => document.getElementById(id);
    const games = window.OEIL_GAMES, doms = window.OEIL_DOMAINS;
    const ROLES = { etudiant: "Étudiant·e", enseignant: "Enseignant·e", pro: "Designer en poste" };
    const PLANS = { free: ["Gratuit", "__NFREE__ jeux gratuits, le défi du jour et les parties en direct."], pro: ["Œil Pro", "Les 44 jeux, le parcours et ta progression sur tous tes appareils."], parcours: ["Parcours intensif", "Le parcours de 14 jours et tous les jeux, à vie."], classe: ["Offre Classe", "Œil Pro pour toi et 40 étudiants par classe."], ecole: ["Offre École", "Œil Pro pour toute l'équipe et les étudiants."], "classe-eleve": ["Pro via ta classe", "L'accès Pro t'est offert par ta classe."] };
    const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;

    function header() {
      const u = OeilAccount.get(), id = OeilAccount.identity();
      $("acc-avatar").innerHTML = OeilAvatar(u || { name: id.name || "?", avatar: id.name ? id.avatar : { color: id.avatar.color, icon: "person" } }, "avatar-lg");
      $("acc-name").textContent = u ? u.name : "Ta progression";
      $("acc-role").innerHTML = u ? `${u.username ? `<a class="underline" href="profil.html?u=${encodeURIComponent(u.username)}">@${esc(u.username)}</a> · ` : ""}${ROLES[u.role] || ""}${OeilAccount.isPro() ? " · Membre Œil Pro" : ""}` : "Sur cet appareil";
      ["acc-login", "acc-signup"].forEach((k) => ($(k).hidden = !!u));
      ["acc-edit", "acc-logout", "acc-delete"].forEach((k) => ($(k).hidden = !u));
      $("acc-guest").hidden = !!u;
      $("sync-note").hidden = !OeilAccount.enabled;
      const plan = OeilAccount.plan(), P = PLANS[plan] || [plan, ""];
      $("acc-plan").textContent = P[0]; $("acc-plan-sub").textContent = P[1];
      $("plan-cta").hidden = plan !== "free"; $("plan-portal").hidden = !(u && u.billing);
      $("class-card").hidden = !u;
      if (u) { const teacher = u.role === "enseignant" || plan === "classe" || plan === "ecole"; $("class-teacher").hidden = !teacher; $("class-student").hidden = teacher; $("class-h").textContent = teacher ? "Mes classes" : "Ma classe"; }
    }

    function dashboard() {
      const S = OeilProgress.stats();
      $("k-sessions").textContent = S.sessions;
      $("k-sessions-sub").textContent = S.sessions ? `dernière : ${new Date(S.hist[0].date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}` : "aucune pour l'instant";
      $("k-avg").textContent = S.avg30 != null ? Math.round(S.avg30) + " %" : "–";
      $("k-avg-sub").textContent = `toutes sessions : ${S.avg != null ? Math.round(S.avg) + " %" : "–"}`;
      $("k-streak").textContent = plural(S.streak, "jour");
      $("k-streak-sub").textContent = `record : ${plural(S.maxStreak, "jour")}`;
      $("k-games").textContent = `${S.tried} sur ${S.total}`;
      // Courbe
      const pts = S.hist.slice(0, 30).reverse().map((h) => h.avg);
      if (pts.length > 1) {
        const W = 600, Hh = 120, x = (i) => (i / (pts.length - 1)) * (W - 16) + 8, y = (v) => Hh - 10 - (v / 100) * (Hh - 20);
        const d = pts.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
        $("spark").innerHTML = `<svg class="spark" viewBox="0 0 ${W} ${Hh}" preserveAspectRatio="none" role="img" aria-label="Évolution de tes scores"><line x1="0" x2="${W}" y1="${y(50)}" y2="${y(50)}" stroke="#E0DFD8" stroke-dasharray="4 4"/><line x1="0" x2="${W}" y1="${y(90)}" y2="${y(90)}" stroke="#E0DFD8" stroke-dasharray="4 4"/><path d="${d} L${x(pts.length - 1)} ${Hh} L${x(0)} ${Hh} Z" fill="#B9D9FF" opacity=".5"/><path d="${d}" fill="none" stroke="#141413" stroke-width="2" vector-effect="non-scaling-stroke"/>${pts.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="#fff" stroke="#141413" vector-effect="non-scaling-stroke"/>`).join("")}</svg><p class="flex justify-between text-[12px] text-text-muted"><span>il y a ${pts.length} sessions</span><span>lignes : 50 % et 90 %</span><span>aujourd'hui</span></p>`;
      } else $("spark").innerHTML = `<p class="mt-6 text-body-md text-text-muted">Joue deux sessions pour voir ta courbe.</p>`;
      // Disciplines
      $("dom-bars").innerHTML = S.domainStats.map((d) => `<div class="dom-bar" style="--field:${d.field}"><span><i class="board-dot"></i>${d.label.split(" ")[0]}</span><span class="track" title="${d.tried} jeux essayés sur ${d.total}"><i style="width:${d.avg != null ? Math.round(d.avg) : 0}%"></i></span><b>${d.avg != null ? Math.round(d.avg) + " %" : "–"}</b></div><p class="text-[12px] text-text-muted -mt-2 pl-[18px]">${d.tried} jeu${d.tried > 1 ? "x" : ""} essayé${d.tried > 1 ? "s" : ""} sur ${d.total}</p>`).join("");
      // Badges
      const B = OeilProgress.badges(), got = B.filter((b) => b.ok).length;
      OeilProgress.check();
      $("badge-count").textContent = `${got} sur ${B.length} débloqués`;
      $("k-badges").textContent = plural(got, "badge") + " débloqué" + (got > 1 ? "s" : "");
      $("badge-list").innerHTML = B.map((b) => `<div class="badge${b.ok ? "" : " is-locked"}" style="${b.ok && b.field ? `--field:${b.field}` : b.ok ? "--field:#FFE08A" : ""}"><i><span aria-hidden="true" class="material-symbols-outlined">${b.icon}</span></i><b>${b.name}</b><small>${b.text}</small>${b.ok ? "" : `<span class="badge-prog" aria-label="Progression ${Math.round(b.p * 100)} %"><em style="width:${Math.round(b.p * 100)}%"></em></span>`}</div>`).join("");
      // Records
      const keys = Object.keys(doms);
      let cur = keys.find((k) => S.domainStats.find((d) => d.key === k && d.scored)) || keys[0];
      const recs = () => {
        $("rec-tabs").innerHTML = keys.map((k) => `<button aria-pressed="${k === cur}" data-k="${k}" type="button">${doms[k].label.split(" ")[0]}</button>`).join("");
        $("rec-tabs").querySelectorAll("button").forEach((b) => (b.onclick = () => { cur = b.dataset.k; recs(); }));
        const list = games.filter((g) => g.domain === cur).sort((a, b) => (S.best[b.id] ?? -1) - (S.best[a.id] ?? -1));
        $("rec-list").innerHTML = list.map((g) => { const v = S.best[g.id]; return `<li><span aria-hidden="true" class="material-symbols-outlined">${v >= 90 ? "workspace_premium" : v != null ? "check_circle" : ""}</span><a class="truncate hover:underline" href="${g.id}.html">${g.name}${g.pro ? ' <span class="pro-badge">Pro</span>' : ""}</a><span class="track"><i style="width:${v != null ? Math.round(v) : 0}%"></i></span><b>${v != null ? Math.round(v) + " %" : "–"}</b></li>`; }).join("");
      };
      recs();
      if (S.hist.length) $("acc-history").innerHTML = S.hist.slice(0, 12).map((h) => `<li><span class="truncate">${esc(h.title)}${h.daily ? " · défi du jour" : ""}</span><small>${new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</small><b>${h.avg} %</b></li>`).join("");
    }

    // Classes
    async function classes() {
      const u = OeilAccount.get();
      if (!u || !OeilAccount.enabled) return;
      const list = await OeilAccount.myClasses().catch(() => []);
      const teacher = !$("class-teacher").hidden;
      if (!teacher) { $("class-mine").innerHTML = list.map((c) => `<li class="flex items-center justify-between gap-3 p-3 border border-ink rounded-lg"><span><b>${esc(c.name)}</b><small class="block text-text-muted">avec ${esc(c.teacher_name || "ton enseignant·e")}</small></span><button class="btn-quiet text-[13px]" data-leave="${c.id}" type="button">Quitter</button></li>`).join(""); document.querySelectorAll("[data-leave]").forEach((b) => (b.onclick = async () => { await OeilAccount.leaveClass(b.dataset.leave); header(); classes(); })); return; }
      const own = list.filter((c) => c.is_teacher);
      $("class-list").innerHTML = own.length ? "" : `<p class="text-body-sm text-text-muted">Aucune classe pour l'instant.</p>`;
      for (const c of own) {
        const roster = await OeilAccount.classRoster(c.id).catch(() => []);
        const box = document.createElement("div");
        box.className = "p-4 border border-ink rounded-lg";
        box.innerHTML = `<div class="flex flex-wrap items-center justify-between gap-2"><p><b>${esc(c.name)}</b> · code <b class="tabular tracking-[.08em]">${esc(c.code)}</b></p><span class="text-body-sm text-text-muted">${roster.length} sur 40 étudiants</span></div><div class="overflow-x-auto mt-3"><table class="rank-table"><thead><tr><th>Étudiant</th><th>Sessions</th><th>Moyenne</th><th>Dernière</th></tr></thead><tbody>${roster.length ? roster.map((r) => `<tr><td><span class="inline-flex items-center gap-2">${OeilAvatar({ name: r.name, avatar: { color: r.avatar_color, icon: r.avatar_icon } }, "avatar-sm")}${esc(r.name)}</span></td><td>${r.sessions}</td><td><b>${r.avg != null ? r.avg + " %" : "–"}</b></td><td>${r.last ? new Date(r.last).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : "–"}</td></tr>`).join("") : `<tr><td class="text-text-muted" colspan="4">Donne le code ${esc(c.code)} à tes étudiants : ils l'entrent dans Mon compte.</td></tr>`}</tbody></table></div>`;
        $("class-list").append(box);
      }
    }
    $("class-join").addEventListener("submit", async (e) => { e.preventDefault(); try { await OeilAccount.joinClass($("class-code").value); say($("class-msg"), "Tu as rejoint la classe.", "ok"); $("class-code").value = ""; header(); classes(); } catch (err) { say($("class-msg"), OeilAccount.human(err), "error"); } });
    $("class-new").addEventListener("submit", async (e) => { e.preventDefault(); try { await OeilAccount.createClass($("class-name").value.trim()); $("class-name").value = ""; say($("class-msg"), "Classe créée.", "ok"); classes(); } catch (err) { say($("class-msg"), OeilAccount.human(err), "error"); } });

    // Profil
    let pav = null;
    const openProfile = () => {
      const u = OeilAccount.get(); if (!u) return;
      $("pf-name").value = u.name; $("pf-user").value = u.username || "";
      document.querySelectorAll('input[name="pf-role"]').forEach((r) => (r.checked = r.value === u.role));
      pav = avatarPicker("pav", $("pf-name"), u.avatar);
      $("profile-form").hidden = false; $("pf-name").focus(); $("profile-form").scrollIntoView({ block: "center", behavior: "smooth" });
    };
    $("acc-edit").addEventListener("click", openProfile);
    $("pf-cancel").addEventListener("click", () => ($("profile-form").hidden = true));
    $("profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await OeilAccount.updateProfile({ name: $("pf-name").value.trim(), username: $("pf-user").value.trim(), role: (document.querySelector('input[name="pf-role"]:checked') || {}).value, avatar: pav() }); $("profile-form").hidden = true; header(); }
      catch (err) { say($("pf-msg"), OeilAccount.human(err), "error"); }
    });
    $("plan-portal").addEventListener("click", async () => { try { await OeilAccount.portal(); } catch (err) { say($("plan-msg"), OeilAccount.human(err), "error"); } });
    $("acc-logout").addEventListener("click", async () => { await OeilAccount.signOut(); location.reload(); });
    $("acc-clear").addEventListener("click", () => { if (confirm("Effacer les records, l'historique et la série enregistrés sur cet appareil ?")) { OeilAccount.clearAll(); location.reload(); } });
    $("acc-delete").addEventListener("click", async () => {
      if (!confirm("Supprimer définitivement ton compte et tes scores ? Un abonnement en cours est aussi résilié.")) return;
      try {
        const t = await OeilAccount.token();
        const r = await fetch("/api/delete-account", { method: "POST", headers: { Authorization: "Bearer " + t } });
        if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || "");
        await OeilAccount.signOut(); OeilAccount.clearAll(); location.href = "index.html";
      } catch (err) { say($("danger-msg"), err.message || "La suppression n'a pas abouti. Écris-nous depuis la page contact.", "error"); }
    });

    // Amis et parrainage
    const fmtDay = (d) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    async function social() {
      const u = OeilAccount.get();
      $("invite-card").hidden = $("friends-card").hidden = !(u && OeilAccount.enabled);
      if (!u || !OeilAccount.enabled) return;
      $("my-code").textContent = u.friendCode || "––––––";
      const link = OeilAccount.inviteLink();
      $("invite-copy").onclick = async () => { try { await navigator.clipboard.writeText(link); $("invite-copy").lastChild.textContent = "Lien copié"; } catch (e) { prompt("Ton lien d'invitation", link); } };
      if (navigator.share) { $("invite-share").hidden = false; $("invite-share").onclick = () => navigator.share({ title: "Œil Studio", text: "Entraîne ton œil de designer avec moi sur Œil Studio : 14 jours d'Œil Pro offerts avec mon lien.", url: link }).catch(() => {}); }
      const n = await OeilAccount.referrals().catch(() => 0);
      const bonus = u.bonusUntil && new Date(u.bonusUntil) > new Date() ? ` Œil Pro offert jusqu'au ${fmtDay(u.bonusUntil)}.` : "";
      $("invite-stats").textContent = (n ? `${n} ami${n > 1 ? "s" : ""} parrainé${n > 1 ? "s" : ""}.` : "Aucun ami parrainé pour l'instant.") + bonus;
      const list = await OeilAccount.friends().catch(() => []);
      $("friend-list").innerHTML = list.length ? list.map((f) => `<li>${OeilAvatar({ name: f.name, pro: f.pro, avatar: { color: f.avatar_color, icon: f.avatar_icon } })}<span class="friend-name"><b>${OeilWho(f.name, f.username)}</b><small>${f.week_games ? `${f.week_points} pts cette semaine · ${f.week_games} jeu${f.week_games > 1 ? "x" : ""}` : f.last ? `dernière partie le ${fmtDay(f.last)}` : "pas encore joué"}</small></span><button aria-label="Retirer ${esc(f.name)} de mes amis" class="friend-x" data-id="${f.id}" type="button"><span aria-hidden="true" class="material-symbols-outlined">person_remove</span></button></li>`).join("") : '<li class="friend-empty">Ajoute un ami avec son code, ou envoie-lui ton lien d’invitation.</li>';
      $("friend-list").querySelectorAll("[data-id]").forEach((b) => (b.onclick = async () => { if (!confirm("Retirer cet ami ?")) return; await OeilAccount.removeFriend(b.dataset.id).catch(() => {}); social(); }));
    }
    $("friend-add").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { const who = await OeilAccount.addFriend($("friend-code").value); say($("friend-msg"), `${who} fait maintenant partie de tes amis.`, "ok"); $("friend-code").value = ""; social(); }
      catch (err) { say($("friend-msg"), OeilAccount.human(err), "error"); }
    });

    header(); dashboard();
    OeilAccount.ready.then(async (u) => {
      header();
      if (!u) return;
      if (location.hash === "#profil") openProfile();
      OeilProgress.merge(await OeilAccount.scores().catch(() => []));
      dashboard(); classes(); social();
      if (OeilAccount.justReferred) say($("friend-msg"), `Bienvenue ! Toi et ${OeilAccount.justReferred} avez 14 jours d'Œil Pro offerts.`, "ok");
    });
  })();
</script>
''', auth=True)

# ---------------------------------------------------------------- Classement national de la semaine
domtabs = "".join(f'<button aria-pressed="false" data-dom="{k}" type="button"><i class="board-dot" style="--field:{d["field"]}"></i>{d["label"].split(" ")[0]}</button>' for k, d in DOMAINS.items())
page("classement.html", "Classement de la semaine — Œil Studio", "classement", f"""<section class="{W} pt-6 lg:pt-10">
<div class="dot-board px-5 sm:px-10 pt-16 pb-10 grid lg:grid-cols-12 gap-8 items-end">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Classement national · remis à zéro chaque lundi</p>
<div class="lg:col-span-8">
<h1 class="text-big">Qui a l'œil<br/>cette semaine ?</h1>
<p class="mt-5 text-body-lg max-w-[36rem]">Ton meilleur score de la semaine dans chaque jeu compte, défi du jour compris. Le classement général additionne tes meilleurs scores : plus tu joues de jeux différents, plus tu montes.</p>
</div>
<div class="lg:col-span-4 dash-card dash-kpi"><span>Ta place cette semaine</span><b id="me-rank">–</b><small id="me-sub">Connecte-toi pour apparaître dans le classement.</small></div>
</div>
</section>
<section class="{W} pt-8 pb-24">
<div class="rank-filters">
<div aria-label="Qui" class="seg-line" hidden="" id="who-tabs" role="group"><button aria-pressed="true" data-who="all" type="button">Tout le monde</button><button aria-pressed="false" data-who="friends" type="button">Mes amis</button></div>
<div aria-label="Discipline" class="dash-tabs" id="dom-tabs" role="group"><button aria-pressed="true" data-dom="" type="button">Général</button>{domtabs}</div>
<div class="pick" hidden="" id="game-pick-wrap"><button aria-expanded="false" aria-haspopup="listbox" class="pick-btn" id="game-pick" type="button"><span></span><span aria-hidden="true" class="material-symbols-outlined">expand_more</span></button><div aria-label="Jeu" class="pick-list" hidden="" id="game-pick-list" role="listbox"></div></div>
</div>
<div class="dash-card mt-4 p-0 overflow-hidden"><ol class="rank-list" id="rank-list"><li class="rank-empty">Chargement du classement…</li></ol></div>
<p class="mt-4 text-body-sm text-text-muted" id="rank-week"></p>
</section>""", """<script src="assets/catalog.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const games = window.OEIL_GAMES;
    let dom = "", game = "", friendsOnly = new URLSearchParams(location.search).get("amis") === "1";
    const monday = new Date(); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    $("rank-week").textContent = `Semaine du ${monday.toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}. Seuls les joueurs connectés apparaissent.`;
    // Menu de choix du jeu, dans le style du site
    const btn = $("game-pick"), menu = $("game-pick-list"), wrap = $("game-pick-wrap");
    const field = () => (window.OEIL_DOMAINS[dom] || {}).field;
    const open = (on) => { menu.hidden = !on; wrap.classList.toggle("is-open", on); btn.setAttribute("aria-expanded", String(on)); if (on) (menu.querySelector('[aria-selected="true"]') || menu.firstChild).focus(); };
    function paintPick() {
      const list = games.filter((g) => g.domain === dom), g = list.find((x) => x.id === game);
      wrap.style.setProperty("--field", field());
      btn.firstElementChild.innerHTML = g ? `<i></i>${esc(g.name)}` : "";
      menu.innerHTML = list.map((x) => `<button aria-selected="${x.id === game}" data-id="${x.id}" role="option" type="button"><i></i>${esc(x.name)}${x.pro ? '<span class="pro-mini">Pro</span>' : ""}</button>`).join("");
      menu.querySelectorAll("button").forEach((b) => (b.onclick = () => { game = b.dataset.id; open(false); paintPick(); btn.focus(); load(); }));
    }
    btn.addEventListener("click", () => open(menu.hidden));
    menu.addEventListener("keydown", (e) => {
      const items = [...menu.querySelectorAll("button")], i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      if (e.key === "ArrowUp") { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
      if (e.key === "Escape") { open(false); btn.focus(); }
    });
    document.addEventListener("click", (e) => { if (!wrap.contains(e.target)) open(false); });
    function picker() {
      const list = games.filter((g) => g.domain === dom);
      wrap.hidden = !dom;
      game = dom ? list[0].id : "";
      open(false);
      paintPick();
    }
    async function load() {
      const box = $("rank-list");
      if (!OeilAccount.enabled) { box.innerHTML = '<li class="rank-empty">Le classement ouvre avec les comptes, très bientôt.</li>'; return; }
      box.innerHTML = '<li class="rank-empty">Chargement du classement…</li>';
      let rows = [];
      try { rows = await OeilAccount.weeklyBoard(game, friendsOnly && !!OeilAccount.get()); } catch (e) { box.innerHTML = '<li class="rank-empty">Impossible de charger le classement. Réessaie dans un instant.</li>'; return; }
      const unit = game ? " %" : " pts";
      box.innerHTML = rows.length ? rows.map((r, i) => `<li class="${r.is_me ? "is-me" : ""}${i < 3 ? " is-top" : ""}"><span class="rank-n">${i < 3 ? `<span class="material-symbols-outlined" aria-label="${i + 1}">${i ? "military_tech" : "workspace_premium"}</span>` : i + 1}</span>${OeilAvatar({ name: r.name, pro: r.pro, avatar: { color: r.avatar_color, icon: r.avatar_icon } })}<span class="rank-name">${OeilWho(r.name, r.username)}${r.is_me ? " <small>(toi)</small>" : ""}<small>${game ? "meilleur score" : `${r.games} jeu${r.games > 1 ? "x" : ""}`}</small></span><b>${r.points}${unit}</b></li>`).join("") : `<li class="rank-empty">Personne n'a encore joué ${game ? "à ce jeu " : ""}cette semaine. <a class="underline" href="${game ? game + ".html" : "defi.html"}">Lance-toi</a>.</li>`;
      const me = rows.findIndex((r) => r.is_me);
      $("me-rank").textContent = me > -1 ? `${me + 1}${me ? "e" : "er"} sur ${rows.length}` : "–";
      $("me-sub").textContent = OeilAccount.get() ? (me > -1 ? `${rows[me].points}${unit} ${game ? "dans ce jeu" : "au total"}.` : "Joue une partie pour entrer dans le classement.") : "Connecte-toi pour apparaître dans le classement.";
    }
    $("dom-tabs").querySelectorAll("button").forEach((b) => (b.onclick = () => { dom = b.dataset.dom; $("dom-tabs").querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); picker(); load(); }));
    const whoTabs = $("who-tabs");
    whoTabs.querySelectorAll("button").forEach((b) => (b.onclick = () => { friendsOnly = b.dataset.who === "friends"; whoTabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); load(); }));
    OeilAccount.ready.then((u) => {
      whoTabs.hidden = !u;
      if (!u) friendsOnly = false;
      whoTabs.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String((x.dataset.who === "friends") === friendsOnly)));
      load();
    });
  })();
</script>
""")

# ---------------------------------------------------------------- Profil public d'un joueur
page("profil.html", "Profil — Œil Studio", None, f"""<section class="{W} pt-6 lg:pt-10">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Profil joueur</p>
<div class="px-5 sm:px-10 pt-16 pb-8">
<div class="flex flex-wrap items-end justify-between gap-6">
<div class="flex items-center gap-5 min-w-0"><span id="pp-avatar"></span><div class="min-w-0"><p class="text-body-md text-text-muted" id="pp-meta">Chargement du profil…</p><h1 class="text-[clamp(44px,6.4vw,96px)] font-medium leading-[0.92] tracking-[-0.05em] break-words" id="pp-name">Profil</h1></div></div>
<div class="btn-row" id="pp-actions"></div>
</div>
<p class="form-msg mt-3" id="pp-msg"></p>
</div>
</div>
</section>
<section class="{W} pt-4 pb-24" hidden="" id="pp-body">
<div class="dash-grid">
<div class="dash-card c-4 dash-kpi"><span>Sessions jouées</span><b id="pp-sessions">0</b></div>
<div class="dash-card c-4 dash-kpi"><span>Points cette semaine</span><b id="pp-week">0</b><small><a class="underline" href="classement.html">Voir le classement</a></small></div>
<div class="dash-card c-4 dash-kpi"><span>Jeux essayés</span><b id="pp-games">0 sur 44</b></div>
<div class="dash-card c-6"><h2>Ses disciplines</h2><p class="text-body-sm text-text-muted mt-1">Moyenne de ses records.</p><div class="dom-bars" id="pp-doms"></div></div>
<div class="dash-card c-6"><h2>Ses meilleurs records</h2><ol class="records" id="pp-records"></ol></div>
</div>
</section>""", """<script src="assets/catalog.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const esc = (t) => String(t || "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const games = window.OEIL_GAMES, doms = window.OEIL_DOMAINS;
    const ROLES = { etudiant: "Étudiant·e", enseignant: "Enseignant·e", pro: "Designer en poste" };
    const who = new URLSearchParams(location.search).get("u") || (OeilAccount.get() || {}).username;
    async function load() {
      if (!who || !OeilAccount.enabled) { $("pp-meta").textContent = "Aucun profil à afficher."; return; }
      let p = null;
      try { p = await OeilAccount.publicProfile(who); } catch (e) {}
      if (!p) { $("pp-meta").textContent = `Aucun joueur ne s'appelle @${who}.`; $("pp-name").textContent = "Profil introuvable"; return; }
      document.title = `${p.name} (@${p.username}) — Œil Studio`;
      $("pp-avatar").innerHTML = OeilAvatar({ name: p.name, pro: p.pro, avatar: { color: p.avatar_color, icon: p.avatar_icon } }, "avatar-lg");
      $("pp-name").textContent = p.name;
      $("pp-meta").textContent = `@${p.username} · ${ROLES[p.role] || ""}${p.pro ? " · Membre Œil Pro" : ""} · sur Œil Studio depuis ${new Date(p.since).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}`;
      const me = OeilAccount.get();
      const acts = $("pp-actions");
      if (p.is_me) acts.innerHTML = '<a class="btn-line" href="compte.html#profil">Modifier mon profil</a>';
      else if (p.is_friend) acts.innerHTML = '<span class="pro-chip" style="height:32px;padding:0 12px;font-size:13px">Vous êtes amis</span>';
      else if (me) { acts.innerHTML = '<button class="btn" id="pp-add" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">person_add</span>Ajouter en ami</button>'; $("pp-add").onclick = async () => { try { await OeilAccount.addFriendByUsername(p.username); load(); } catch (err) { $("pp-msg").textContent = OeilAccount.human(err); $("pp-msg").className = "form-msg is-error"; } }; }
      else acts.innerHTML = `<a class="btn" href="connexion.html?suite=${encodeURIComponent("profil.html?u=" + p.username)}">Se connecter pour l'ajouter</a>`;
      const bests = p.bests || {};
      $("pp-body").hidden = false;
      $("pp-sessions").textContent = p.sessions;
      $("pp-week").textContent = `${p.week_points} pts`;
      $("pp-games").textContent = `${Object.keys(bests).filter((k) => games.some((g) => g.id === k)).length} sur ${games.length}`;
      $("pp-doms").innerHTML = Object.entries(doms).map(([k, d]) => { const list = games.filter((g) => g.domain === k && bests[g.id] != null); const avg = list.length ? list.reduce((a, g) => a + bests[g.id], 0) / list.length : null; return `<div class="dom-bar" style="--field:${d.field}"><span><i class="board-dot"></i>${d.label.split(" ")[0]}</span><span class="track"><i style="width:${avg != null ? Math.round(avg) : 0}%"></i></span><b>${avg != null ? Math.round(avg) + " %" : "–"}</b></div>`; }).join("");
      const top = games.filter((g) => bests[g.id] != null).sort((a, b) => bests[b.id] - bests[a.id]).slice(0, 8);
      $("pp-records").innerHTML = top.length ? top.map((g) => `<li><span aria-hidden="true" class="material-symbols-outlined">${bests[g.id] >= 90 ? "workspace_premium" : "check_circle"}</span><a class="truncate hover:underline" href="${g.id}.html">${esc(g.name)}</a><span class="track"><i style="width:${bests[g.id]}%"></i></span><b>${bests[g.id]} %</b></li>`).join("") : '<li class="text-text-muted">Pas encore de record.</li>';
    }
    OeilAccount.ready.then(load);
  })();
</script>
""")

# ---------------------------------------------------------------- Contact et devis
page("contact.html", "Contact et devis — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot" style="background:#B9D9FF"></span>Contact, essai et devis</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<div class="lg:col-span-5">
<h1 class="text-big">Parlons de<br/>ton projet.</h1>
<p class="mt-5 text-body-lg max-w-[30rem]">Un essai pour ta classe, un devis pour ton école ou une simple question : réponse sous deux jours ouvrés.</p>
<p class="mt-4 text-body-md">Ou écris directement à <a class="underline" data-mail="" href="contact.html">notre adresse</a>.</p>
<div class="estimate panel-line mt-8 p-5" id="estimate" hidden="">
<p class="text-body-sm text-text-muted">Estimation indicative</p>
<p class="offer-price mt-1" id="est-price">690 €</p>
<p class="text-body-sm mt-1" id="est-detail"></p>
</div>
</div>
<form class="lg:col-span-7 join-card" id="contact-form">
<fieldset><legend class="text-body-sm text-text-muted mb-2">Ta demande concerne</legend>{seg("offre", [("etudiant", "Étudiant"), ("parcours", "Parcours"), ("classe", "Classe"), ("ecole", "École"), ("autre", "Autre")], "classe")}</fieldset>
<div class="grid sm:grid-cols-2 gap-4">
<label class="grid gap-1 text-body-sm text-text-muted">Nom<input autocomplete="name" class="field" id="c-name" maxlength="80" required="" type="text"/></label>
<label class="grid gap-1 text-body-sm text-text-muted">Adresse e-mail<input autocomplete="email" class="field" id="c-email" maxlength="120" required="" type="email"/></label>
</div>
<label class="grid gap-1 text-body-sm text-text-muted" data-for="classe ecole">Établissement<input autocomplete="organization" class="field" id="c-org" maxlength="120" type="text"/></label>
<label class="grid gap-2 text-body-sm text-text-muted" data-for="classe ecole">Nombre d'étudiants : <b class="text-ink tabular" id="c-n-out">120</b><input aria-describedby="c-n-help" class="w-full accent-ink" id="c-n" max="2000" min="1" step="1" type="range" value="120"/></label>
<label class="grid gap-1 text-body-sm text-text-muted" data-for="classe ecole">Ou tape le nombre exact<input class="field w-40" id="c-n-num" inputmode="numeric" max="20000" min="1" type="number" value="120"/><span id="c-n-help" class="text-[12px]">De 1 à 20 000 étudiants.</span></label>
<label class="grid gap-1 text-body-sm text-text-muted">Message<textarea class="field min-h-[120px] py-2" id="c-msg" maxlength="4000" placeholder="Tes besoins, tes dates, tes questions…"></textarea></label>
<button class="btn w-full" id="c-submit" type="submit">Envoyer la demande</button>
<p aria-live="polite" class="form-msg" id="c-out"></p>
<p class="text-[12px] text-text-muted">Tes coordonnées servent uniquement à te répondre. <a class="underline" href="confidentialite.html">Confidentialité</a></p>
</form>
</div>
</div>
</section>''', '''<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const MAIL = (window.OEIL_CONFIG && OEIL_CONFIG.contactEmail) || "";
    document.querySelectorAll("[data-mail]").forEach((a) => { a.href = "mailto:" + MAIL; a.textContent = MAIL; });
    const radios = [...document.querySelectorAll('input[name="offre"]')];
    const q = new URLSearchParams(location.search).get("offre");
    if (q) radios.forEach((r) => (r.checked = r.value === q));
    const offer = () => (radios.find((r) => r.checked) || {}).value;
    // Grille indicative : école = 290 € + 4,50 € par étudiant et par an, au moins 690 € ; classe = 9 € par mois et par enseignant (40 étudiants).
    function update(exact) {
      const o = offer(), n = typeof exact === "number" ? exact : +$("c-n-num").value || +$("c-n").value;
      $("c-n-out").textContent = n;
      document.querySelectorAll("[data-for]").forEach((el) => (el.hidden = !el.dataset.for.split(" ").includes(o)));
      const est = $("estimate");
      if (o === "ecole") { const p = Math.max(690, Math.round((290 + 4.5 * n) / 10) * 10); est.hidden = false; $("est-price").textContent = `${p.toLocaleString("fr-FR")} €/an`; $("est-detail").textContent = `Pour ${n} étudiants, soit ${(p / n).toFixed(2).replace(".", ",")} € par étudiant et par an. Le devis final dépend du nombre de campus et des options.`; }
      else if (o === "classe") { const t = Math.max(1, Math.ceil(n / 40)); est.hidden = false; $("est-price").textContent = `${9 * t} €/mois`; $("est-detail").textContent = `${t} enseignant${t > 1 ? "s" : ""} pour ${n} étudiants (jusqu'à 40 par classe).`; }
      else if (o === "parcours") { est.hidden = false; $("est-price").textContent = "19 €"; $("est-detail").textContent = "Payé une fois, accès à vie au parcours de 14 jours."; }
      else if (o === "etudiant") { est.hidden = false; $("est-price").textContent = "3 €/mois"; $("est-detail").textContent = "Ou 24 € par an, résiliable à tout moment."; }
      else est.hidden = true;
    }
    radios.forEach((r) => r.addEventListener("change", update));
    $("c-n").addEventListener("input", () => { $("c-n-num").value = $("c-n").value; update(); });
    $("c-n-num").addEventListener("input", () => { const v = Math.max(1, Math.min(20000, +$("c-n-num").value || 1)); $("c-n").value = Math.min(2000, v); update(v); });
    update();
    $("contact-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const o = offer(), labels = { etudiant: "Offre étudiant", parcours: "Parcours intensif", classe: "Offre classe", ecole: "Devis école", autre: "Question" };
      const school = !$("c-org").parentElement.hidden;
      const payload = { offer: o, name: $("c-name").value.trim(), email: $("c-email").value.trim(), org: school ? $("c-org").value.trim() : null, students: school ? +$("c-n-num").value || null : null, message: $("c-msg").value.trim() };
      const out = $("c-out"), btn = $("c-submit");
      btn.disabled = true; out.textContent = "Envoi…"; out.className = "form-msg";
      try {
        await OeilAccount.contact(payload);
        out.textContent = "Merci, ta demande est bien arrivée. Réponse sous deux jours ouvrés."; out.className = "form-msg is-ok";
        $("contact-form").reset(); update();
      } catch (err) {
        // Sans service de comptes, la demande part par le logiciel de messagerie
        const body = [`Nom : ${payload.name}`, `E-mail : ${payload.email}`, payload.org ? `Établissement : ${payload.org}` : "", payload.students ? `Nombre d'étudiants : ${payload.students}` : "", "", payload.message].filter((x) => x !== "").join("\\n");
        location.href = `mailto:${MAIL}?subject=${encodeURIComponent(labels[o] + " — Œil Studio")}&body=${encodeURIComponent(body)}`;
        out.textContent = "Ta messagerie s'ouvre avec le message prérempli : il ne reste qu'à l'envoyer."; out.className = "form-msg";
      } finally { btn.disabled = false; }
    });
  })();
</script>
''')

# ---------------------------------------------------------------- Pages légales
# Les informations de l'éditeur viennent de assets/config.js (OEIL_CONFIG.legal).
L = lambda k, ph: f'<span data-legal="{k}">{ph}</span>'
LEGAL_JS = '''<script>
  (function () {
    const C = window.OEIL_CONFIG || {}, G = C.legal || {};
    const v = { ...G, email: G.email || C.contactEmail };
    document.querySelectorAll("[data-legal]").forEach((n) => {
      const k = n.dataset.legal, val = v[k];
      if (k === "siret") { n.textContent = val ? "SIRET : " + val : "Immatriculation en cours"; return; }
      if (k === "email") { n.innerHTML = val ? `<a href="mailto:${val}">${val}</a>` : n.innerHTML; return; }
      if (k === "mediateur") { n.innerHTML = val ? (v.mediateurUrl ? `${val} (<a href="${v.mediateurUrl}" target="_blank" rel="noopener">${v.mediateurUrl.replace(/^https?:\\/\\//, "")}</a>)` : val) : n.innerHTML; return; }
      if (val) n.textContent = val; else n.classList.add("todo");
    });
  })();
</script>
'''
def legal(name, title, intro, sections):
    body = "".join(f'<section class="legal-sec"><h2>{h}</h2>{t}</section>' for h, t in sections)
    page(name, f"{title} — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board px-5 sm:px-10 pt-16 pb-12">
<p class="board-strip"><span class="board-dot"></span>{title}</p>
<h1 class="text-big">{title}</h1>
<p class="mt-4 text-body-md text-text-muted max-w-[46rem]">{intro}</p>
<div class="legal mt-8 max-w-[46rem]">{body}</div>
</div>
</section>''', LEGAL_JS)

ED = f'{L("editeur", "[prénom et nom]")}, {L("statut", "entrepreneur individuel")}'
legal("mentions-legales.html", "Mentions légales", "Dernière mise à jour : octobre 2026.", [
    ("Éditeur du site", f"<p>Le site Œil Studio est édité par {ED}.<br/>Adresse : {L('adresse', '[adresse postale]')}.<br/>{L('siret', 'Immatriculation en cours')}.<br/>Contact : {L('email', 'voir la page contact')} · <a href=\"contact.html\">formulaire de contact</a>.</p><p>Directeur ou directrice de la publication : {L('editeur', '[prénom et nom]')}.</p>"),
    ("Hébergement", "<p>Vercel Inc., 440 N Barranca Avenue #4133, Covina, CA 91723, États-Unis · <a href=\"https://vercel.com\" target=\"_blank\" rel=\"noopener\">vercel.com</a>.</p><p>Comptes et données de jeu : Supabase Inc., 970 Toa Payoh North #07-04, Singapour 318992, avec un hébergement des données dans l'Union européenne. Paiements : Stripe Payments Europe Ltd, 1 Grand Canal Street Lower, Dublin 2, Irlande.</p>"),
    ("Propriété intellectuelle", "<p>Les jeux, textes, illustrations et la marque Œil Studio sont protégés par le droit d'auteur. Toute reproduction sans autorisation est interdite. Les polices Inter Tight et Newsreader sont distribuées sous licence SIL Open Font License ; les icônes Material Symbols sous licence Apache 2.0.</p>"),
    ("Accessibilité", "<p>Le site est conçu pour être utilisable au clavier et respecter les WCAG 2.1 niveau AA. Pour signaler un obstacle, utilise le <a href=\"contact.html\">formulaire de contact</a>.</p>"),
    ("Conditions de vente et données personnelles", "<p>Les achats et abonnements sont régis par les <a href=\"cgv.html\">conditions générales</a>. Le traitement des données personnelles est décrit dans la <a href=\"confidentialite.html\">politique de confidentialité</a>.</p>"),
])
legal("cgv.html", "Conditions générales", "Conditions générales d'utilisation et de vente du site Œil Studio. Dernière mise à jour : octobre 2026.", [
    ("1. Objet", f"<p>Ces conditions encadrent l'utilisation du site Œil Studio et la vente de ses offres payantes. Le site est édité par {ED} (voir les <a href=\"mentions-legales.html\">mentions légales</a>). Créer un compte ou passer commande vaut acceptation de ces conditions.</p>"),
    ("2. Le service", "<p>Œil Studio propose des jeux d'entraînement au regard pour les designers. Sans compte, __NFREE__ jeux, le défi du jour, les défis entre amis et les parties en direct sont gratuits. Le compte gratuit conserve la progression sur tous les appareils. Les offres payantes ouvrent les jeux réservés à Œil Pro et les fonctions décrites sur la page <a href=\"tarifs.html\">Tarifs</a>.</p>"),
    ("3. Compte", "<p>Le compte est personnel. Tu t'engages à fournir une adresse e-mail valide et à garder ton mot de passe confidentiel. Un pseudo injurieux ou trompeur peut être modifié ou supprimé. Tu peux supprimer ton compte à tout moment depuis Mon compte.</p>"),
    ("4. Offres et prix", "<ul><li>Œil Pro : 3 € par mois ou 24 € par an, sans engagement.</li><li>Parcours intensif : 19 €, paiement unique, accès à vie.</li><li>Offre Classe : 9 € par mois et par enseignant, après 14 jours d'essai gratuit, pour 40 étudiants par classe.</li><li>Offre École : sur devis.</li></ul><p>Les prix sont indiqués en euros, toutes taxes comprises. TVA non applicable, article 293 B du Code général des impôts.</p><p><b>Parrainage.</b> Quand une personne crée son compte avec ton lien d'invitation, vous recevez chacun 14 jours d'Œil Pro offerts, sans paiement ni engagement. Le bonus du parrain est limité à 10 filleuls. Les comptes créés uniquement pour obtenir le bonus peuvent être supprimés.</p>"),
    ("5. Commande et paiement", "<p>Le paiement est réalisé par carte bancaire (ou Apple Pay et Google Pay) sur la page sécurisée de Stripe. Œil Studio n'a jamais accès à tes données bancaires. L'accès est activé dès la confirmation du paiement et un reçu est envoyé par e-mail.</p>"),
    ("6. Abonnement et résiliation", "<p>Les abonnements se renouvellent automatiquement à la fin de chaque période (mois ou année). Tu peux résilier à tout moment depuis Mon compte, rubrique « Gérer mon abonnement » : l'accès reste ouvert jusqu'à la fin de la période déjà payée, et aucun nouveau prélèvement n'a lieu. Pendant l'essai de l'offre Classe, une résiliation avant la fin des 14 jours évite tout prélèvement.</p>"),
    ("7. Droit de rétractation", "<p>Pour un contenu numérique fourni immédiatement, le droit de rétractation de 14 jours prend fin dès que tu demandes l'accès avant la fin de ce délai et que tu reconnais y renoncer (article L221-28 du Code de la consommation). Œil Studio te rembourse tout de même le parcours intensif et le premier paiement d'un abonnement si tu le demandes dans les 14 jours suivant l'achat, depuis la page <a href=\"contact.html\">contact</a>.</p>"),
    ("8. Disponibilité", "<p>Le site est accessible en continu, sauf maintenance ou incident. Les jeux peuvent évoluer, être améliorés ou remplacés. Une interruption prolongée d'un service payant donne droit à un remboursement au prorata.</p>"),
    ("9. Responsabilité", "<p>Les scores et corrections ont une valeur pédagogique. Les perceptions de couleur dépendent de l'écran utilisé. La responsabilité d'Œil Studio ne peut être engagée pour une mauvaise utilisation du service ou une panne du matériel de l'utilisateur.</p>"),
    ("10. Réclamations et médiation", f"<p>Pour toute réclamation, écris depuis la page <a href=\"contact.html\">contact</a>. À défaut d'accord, tu peux recourir gratuitement au médiateur de la consommation : {L('mediateur', '[médiateur à désigner]')}. Tu peux aussi utiliser la plateforme européenne de règlement des litiges.</p>"),
    ("11. Droit applicable", "<p>Ces conditions sont soumises au droit français. En cas de litige, et après tentative de résolution amiable, les tribunaux français sont compétents.</p>"),
])
legal("confidentialite.html", "Confidentialité", "Comment Œil Studio traite tes données personnelles. Dernière mise à jour : octobre 2026.", [
    ("Responsable du traitement", f"<p>{ED}, {L('adresse', '[adresse postale]')}. Contact : {L('email', 'voir la page contact')}.</p>"),
    ("Sans compte", "<p>Tes records, ton historique, ta série du défi du jour, ton prénom et ton avatar (si tu les saisis) sont enregistrés uniquement dans ton navigateur (stockage local). Ils ne sont envoyés à personne.</p>"),
    ("Avec un compte", "<ul><li>Données : adresse e-mail, prénom ou pseudo, statut (étudiant, enseignant, designer), avatar, scores et sessions jouées, classes rejointes.</li><li>Finalité : faire fonctionner ton compte, ta progression, les classements et les classes. Base légale : l'exécution du service que tu demandes.</li><li>Conservation : tant que le compte existe ; tout est supprimé quand tu supprimes ton compte.</li><li>Hébergement : Supabase, dans l'Union européenne.</li></ul>"),
    ("Classements et classes", "<p>Ton pseudo, ton avatar et ton meilleur score du jour apparaissent dans le classement du défi du jour. Si tu rejoins une classe, ton enseignant·e voit ton pseudo, ton nombre de sessions et ta moyenne. En partie en direct, ton prénom et tes scores s'affichent sur l'écran de l'hôte.</p>"),
    ("Paiement", "<p>Les paiements sont traités par Stripe, qui reçoit tes données de paiement et ton adresse e-mail. Œil Studio conserve seulement l'offre achetée et l'identifiant client Stripe. Les factures sont conservées 10 ans (obligation comptable).</p>"),
    ("Demandes de contact", "<p>Les informations du formulaire de contact servent uniquement à te répondre et sont supprimées au bout de 3 ans sans échange.</p>"),
    ("Cookies et mesure d'audience", "<p>Le site n'utilise aucun cookie publicitaire et aucun outil de mesure d'audience. Il utilise uniquement le stockage local du navigateur, nécessaire au fonctionnement (progression, session de connexion). Aucun bandeau de consentement n'est donc requis.</p>"),
    ("Services tiers", "<p>Pour afficher les pages, ton navigateur charge des polices depuis Google Fonts et des scripts depuis cdn.tailwindcss.com, cdn.jsdelivr.net et cdnjs.cloudflare.com, qui reçoivent ton adresse IP.</p>"),
    ("Tes droits", "<p>Tu peux accéder à tes données, les corriger, les exporter ou les supprimer depuis Mon compte, ou en écrivant depuis la page <a href=\"contact.html\">contact</a>. Tu peux aussi saisir la CNIL (<a href=\"https://www.cnil.fr\" target=\"_blank\" rel=\"noopener\">cnil.fr</a>).</p>"),
])
print("ok")
