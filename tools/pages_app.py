# Pages « application » : direct, rejoindre, connexion, mon compte, contact et pages légales.
# Exécuté par build_pages.py, qui fournit page, seg, W, GAMES, DOMAINS, CHK.

DEFAULT_LIVE = {"kern-clinic", "color-impostor", "spacing-repair", "ui-detective", "microcopy-duel", "hue-line"}
PRO_ATTR, LOCK = ' data-pro=""', '<b aria-hidden="true" class="material-symbols-outlined mix-lock">lock</b>'
chips = "".join(f'<label class="mix-chip"><input{CHK if g["id"] in DEFAULT_LIVE else ""}{PRO_ATTR if g["pro"] else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}{LOCK if g["pro"] else ""}</span></label>' for g in GAMES)
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
<label class="grid gap-1 text-body-sm text-text-muted max-w-[28rem]">Nom de la partie<input class="field" id="live-title" placeholder="Ex. : Échauffement typo du mardi" required="" type="text"/></label>
<fieldset><legend class="text-body-sm text-text-muted mb-2">Jeux de la partie</legend><div class="flex flex-wrap gap-2">{chips}</div><p class="mt-3 text-body-sm text-text-muted" hidden="" id="live-pro-note">Les jeux avec un cadenas font partie d'<a class="underline" href="tarifs.html#pro">Œil Pro</a>.</p></fieldset>
<div class="flex flex-wrap items-center gap-4">{seg("live-rounds", [("5", "5"), ("6", "6"), ("8", "8"), ("10", "10")], "6", "Manches")}<span class="form-msg" id="live-msg"></span></div>
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

<div class="dot-board px-5 sm:px-10 pt-16 pb-12" hidden="" id="step-podium">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Fin de partie</p>
<h1 class="text-big text-center">Le podium</h1>
<div class="podium" id="podium"></div>
<ol class="live-board mt-10 max-w-[48rem] mx-auto" id="podium-all"></ol>
<div class="flex flex-wrap justify-center gap-3 mt-8"><a class="btn" href="live.html">Nouvelle partie</a><button class="btn-line" id="podium-csv" type="button">Exporter le classement</button></div>
</div>
</section>''', '''<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="assets/catalog.js"></script>
<script src="assets/live.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    let H = null, room = null;
    const lockPro = () => {
      const pro = OeilAccount.isPro();
      document.querySelectorAll("#live-form input[data-pro]").forEach((b) => { b.disabled = !pro; if (!pro) b.checked = false; });
      $("live-pro-note").hidden = pro;
    };
    lockPro(); OeilAccount.ready.then(lockPro);
    const show = (step) => ["setup", "lobby", "live", "podium"].forEach((k) => ($("step-" + k).hidden = k !== step));
    const joinUrl = () => location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "") + "rejoindre.html";
    const qr = (el, text, size) => { el.innerHTML = ""; if (window.QRCode) new QRCode(el, { text, width: size, height: size, colorDark: "#141413", colorLight: "#ffffff" }); else el.textContent = text; };
    $("live-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const ids = [...document.querySelectorAll("#live-form input[type=checkbox]:checked")].map((b) => b.value);
      if (!ids.length) { $("live-msg").textContent = "Choisis au moins un jeu."; return; }
      const rounds = +document.querySelector('input[name="live-rounds"]:checked').value;
      H = OeilLive.host({ title: $("live-title").value.trim() || "Partie en direct", ids, rounds }, render);
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
      const go = (r) => {
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
<div class="join-card" id="auth-card">
<div aria-label="Type de formulaire" class="seg-line w-max" role="group"><button aria-pressed="true" data-tab="login" type="button">Se connecter</button><button aria-pressed="false" data-tab="signup" type="button">Créer un compte</button></div>
<form class="flex flex-col gap-4 mt-2" id="auth-form">
<label class="grid gap-1 text-body-sm text-text-muted" data-only="signup" hidden="">Prénom ou pseudo<input autocomplete="given-name" class="field" id="auth-name" maxlength="40" type="text"/></label>
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
      $("auth-name").required = t === "signup";
      say($("auth-msg"), "");
    };
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
    $("auth-forgot").addEventListener("click", () => setTab("forgot"));
    $("auth-back").addEventListener("click", () => setTab("login"));
    if (location.hash === "#inscription") setTab("signup");
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
        else if (tab === "login") { await OeilAccount.signIn({ email, password }); after(); }
        else {
          if (!$("auth-terms").checked) { say($("auth-msg"), "Accepte les conditions générales pour créer ton compte.", "error"); return; }
          const role = (document.querySelector('input[name="role"]:checked') || {}).value;
          const r = await OeilAccount.signUp({ name: $("auth-name").value.trim(), email, password, role, avatar: av() });
          if (r.confirm) say($("auth-msg"), `Compte créé. Ouvre l'e-mail envoyé à ${email} et clique sur le lien pour l'activer.`, "ok");
          else after();
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
<div class="flex items-center gap-5 min-w-0"><span id="acc-avatar"></span><div class="min-w-0"><p class="text-body-md text-text-muted" id="acc-role">Sur cet appareil</p><h1 class="text-[clamp(44px,6.4vw,96px)] font-medium leading-[0.92] tracking-[-0.05em] break-words" id="acc-name">Ta progression</h1></div></div>
<div class="btn-row"><a class="btn" href="defi.html">Défi du jour</a><button class="btn-line" hidden="" id="acc-edit" type="button">Modifier mon profil</button><a class="btn-line" href="connexion.html#inscription" id="acc-signup">Créer un compte</a><a class="btn-line" href="connexion.html" id="acc-login">Se connecter</a></div>
</div>
<div class="acc-guest" hidden="" id="acc-guest"><span class="material-symbols-outlined" aria-hidden="true">cloud_upload</span><span>Ta progression est enregistrée sur cet appareil. <a class="underline" href="connexion.html#inscription">Crée un compte gratuit</a> pour la retrouver partout et apparaître dans le classement du jour.</span></div>
<form class="join-card mt-8 max-w-[40rem]" hidden="" id="profile-form">
<p class="text-headline-md">Mon profil</p>
<label class="grid gap-1 text-body-sm text-text-muted">Prénom ou pseudo<input class="field" id="pf-name" maxlength="40" required="" type="text"/></label>
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

<div class="dash-card c-5" id="plan-card"><h2>Mon offre</h2><p class="mt-2 text-[34px] font-medium tracking-[-0.04em]" id="acc-plan">Gratuit</p><p class="text-body-sm text-text-muted" id="acc-plan-sub">10 jeux gratuits, le défi du jour et les parties en direct.</p><div class="btn-row mt-4"><a class="btn" href="tarifs.html" id="plan-cta">Voir les offres</a><button class="btn-line" hidden="" id="plan-portal" type="button">Gérer mon abonnement</button></div><p class="form-msg mt-2" id="plan-msg"></p></div>
<div class="dash-card c-7" id="class-card" hidden=""><h2 id="class-h">Ma classe</h2>
<div id="class-student"><p class="text-body-sm text-text-muted mt-1">Ton enseignant·e t'a donné un code de classe ? Entre-le pour obtenir l'accès Pro de la classe.</p><form class="sum-share-row mt-3" id="class-join"><input aria-label="Code de classe" autocapitalize="characters" class="field flex-1 min-w-0 uppercase" id="class-code" maxlength="8" placeholder="Code de classe" required="" type="text"/><button class="btn" type="submit">Rejoindre</button></form><ul class="mt-3 grid gap-2" id="class-mine"></ul></div>
<div hidden="" id="class-teacher"><p class="text-body-sm text-text-muted mt-1">Crée une classe, donne son code à tes étudiants : ils obtiennent l'accès Pro (40 par classe) et leurs résultats s'affichent ici.</p><form class="sum-share-row mt-3" id="class-new"><input aria-label="Nom de la classe" class="field flex-1 min-w-0" id="class-name" maxlength="60" placeholder="Ex. : DN MADE 2, groupe B" required="" type="text"/><button class="btn" type="submit">Créer</button></form><div class="mt-4 grid gap-4" id="class-list"></div></div>
<p class="form-msg mt-2" id="class-msg"></p></div>

<div class="dash-card c-12" id="danger-card"><h2>Mes données</h2><p class="text-body-sm text-text-muted mt-1">Tes scores sont enregistrés sur cet appareil<span id="sync-note">, et sur ton compte quand tu es connecté·e</span>.</p><div class="btn-row mt-4"><button class="btn-line" hidden="" id="acc-logout" type="button">Se déconnecter</button><button class="btn-line" id="acc-clear" type="button">Effacer les données de cet appareil</button><button class="btn-line" hidden="" id="acc-delete" type="button">Supprimer mon compte</button></div><p class="form-msg mt-2" id="danger-msg"></p></div>
</div>
</section>''', '''<script src="assets/catalog.js"></script>
<script src="assets/progress.js"></script>
<script>
  (function () {''' + AV_JS + '''
    const $ = (id) => document.getElementById(id);
    const games = window.OEIL_GAMES, doms = window.OEIL_DOMAINS;
    const ROLES = { etudiant: "Étudiant·e", enseignant: "Enseignant·e", pro: "Designer en poste" };
    const PLANS = { free: ["Gratuit", "10 jeux gratuits, le défi du jour et les parties en direct."], pro: ["Œil Pro", "Les 44 jeux, le parcours et ta progression sur tous tes appareils."], parcours: ["Parcours intensif", "Le parcours de 14 jours et tous les jeux, à vie."], classe: ["Offre Classe", "Œil Pro pour toi et 40 étudiants par classe."], ecole: ["Offre École", "Œil Pro pour toute l'équipe et les étudiants."], "classe-eleve": ["Pro via ta classe", "L'accès Pro t'est offert par ta classe."] };
    const plural = (n, w) => `${n} ${w}${n > 1 ? "s" : ""}`;

    function header() {
      const u = OeilAccount.get(), id = OeilAccount.identity();
      $("acc-avatar").innerHTML = OeilAvatar(u || { name: id.name || "?", avatar: id.name ? id.avatar : { color: id.avatar.color, icon: "person" } }, "avatar-lg");
      $("acc-name").textContent = u ? u.name : "Ta progression";
      $("acc-role").textContent = u ? `${ROLES[u.role] || ""} · ${u.email}` : "Sur cet appareil";
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
    $("acc-edit").addEventListener("click", () => {
      const u = OeilAccount.get(); if (!u) return;
      $("pf-name").value = u.name;
      document.querySelectorAll('input[name="pf-role"]').forEach((r) => (r.checked = r.value === u.role));
      pav = avatarPicker("pav", $("pf-name"), u.avatar);
      $("profile-form").hidden = false; $("pf-name").focus();
    });
    $("pf-cancel").addEventListener("click", () => ($("profile-form").hidden = true));
    $("profile-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      try { await OeilAccount.updateProfile({ name: $("pf-name").value.trim(), role: (document.querySelector('input[name="pf-role"]:checked') || {}).value, avatar: pav() }); $("profile-form").hidden = true; header(); }
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

    header(); dashboard();
    OeilAccount.ready.then(async (u) => {
      header();
      if (!u) return;
      OeilProgress.merge(await OeilAccount.scores().catch(() => []));
      dashboard(); classes();
    });
  })();
</script>
''', auth=True)

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
    ("2. Le service", "<p>Œil Studio propose des jeux d'entraînement au regard pour les designers. Sans compte, 10 jeux, le défi du jour, les défis entre amis et les parties en direct sont gratuits. Le compte gratuit conserve la progression sur tous les appareils. Les offres payantes ouvrent les jeux réservés à Œil Pro et les fonctions décrites sur la page <a href=\"tarifs.html\">Tarifs</a>.</p>"),
    ("3. Compte", "<p>Le compte est personnel. Tu t'engages à fournir une adresse e-mail valide et à garder ton mot de passe confidentiel. Un pseudo injurieux ou trompeur peut être modifié ou supprimé. Tu peux supprimer ton compte à tout moment depuis Mon compte.</p>"),
    ("4. Offres et prix", "<ul><li>Œil Pro : 3 € par mois ou 24 € par an, sans engagement.</li><li>Parcours intensif : 19 €, paiement unique, accès à vie.</li><li>Offre Classe : 9 € par mois et par enseignant, après 14 jours d'essai gratuit, pour 40 étudiants par classe.</li><li>Offre École : sur devis.</li></ul><p>Les prix sont indiqués en euros, toutes taxes comprises. TVA non applicable, article 293 B du Code général des impôts.</p>"),
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
