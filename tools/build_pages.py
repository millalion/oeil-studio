import pathlib, re, sys
site = pathlib.Path(sys.argv[1]); SP = pathlib.Path(sys.argv[2])
src = (SP / "redesign.py").read_text()
ns = {"__name__": "lib", "sys": sys}
exec(compile(src.split("# ---------------------------------------------------------------- Accueil")[0], "redesign", "exec"), ns)
head, header, FOOTER, W = ns["head"], ns["header"], ns["FOOTER"], ns["W"]
cat = (site / "assets/catalog.js").read_text()
DOMAINS = {m[0]: {"label": m[1], "field": m[2]} for m in re.findall(r'(\w+): \{ label: "([^"]+)", field: "(#[0-9A-F]+)" \}', cat)}
GAMES = [dict(zip(("id", "name", "domain", "level", "min", "desc", "pro"), m[:6] + (bool(m[6]),))) for m in re.findall(r'\{ id: "([^"]+)", name: "([^"]+)", domain: "([^"]+)", level: "([^"]+)", min: (\d+), desc: "([^"]+)"(, pro: true)? \}', cat)]
SKIP = '<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] btn" href="#contenu">Aller au contenu</a>'
MAIL = "bonjour@oeil.studio"
CHK = ' checked=""'
def seg(name, values, checked, label=""):
    inner = "".join(f'<label><input{CHK if v == checked else ""} name="{name}" type="radio" value="{v}"/><span>{t}</span></label>' for v, t in values)
    lab = f'<span class="seg-pick-label">{label}</span>' if label else ""
    return f'<span class="flex flex-wrap items-center gap-2">{lab}<span class="seg-pick" role="radiogroup">{inner}</span></span>'
def page(name, title, active, body, scripts=""):
    (site / name).write_text(f'''{head(title)}
<body class="bg-ground text-ink">
{SKIP}
{header(active)}
<main class="pt-16" id="contenu">
{body}
</main>
{FOOTER}
{scripts}<script src="assets/site.js"></script>
</body></html>
''')
DEFAULT_LIVE = {"kern-clinic", "color-impostor", "spacing-repair", "ui-detective", "microcopy-duel", "hue-line"}
PRO_ATTR, LOCK = ' data-pro=""', '<b aria-hidden="true" class="material-symbols-outlined mix-lock">lock</b>'
chips = "".join(f'<label class="mix-chip"><input{CHK if g["id"] in DEFAULT_LIVE else ""}{PRO_ATTR if g["pro"] else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}{LOCK if g["pro"] else ""}</span></label>' for g in GAMES)
NOTE_LOCAL = '<p class="live-note"><span class="material-symbols-outlined" aria-hidden="true">info</span>Démo sans serveur : la partie fonctionne entre les onglets d\'un même navigateur. Pour jouer depuis plusieurs téléphones, il faudra brancher le serveur dans <code>assets/live.js</code>.</p>'

# ---------------------------------------------------------------- Partie en direct : écran de l'hôte
page("live.html", "Partie en direct — Œil Studio", "live", f'''<section class="{W} pt-6 lg:pt-10 pb-20">

<div class="ticket" id="step-setup">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Partie en direct · à projeter devant la classe ou tes amis</p>
<h1 class="text-big max-w-[13ch]">Lance une partie en direct.</h1>
<p class="mt-4 max-w-[38rem] text-body-lg">Choisis les jeux, crée la salle, projette cet écran. Chacun rejoint avec le code ou le QR code et joue le même tirage.</p>
<form class="mt-8 flex flex-col gap-6" id="live-form">
<label class="grid gap-1 text-body-sm text-text-muted max-w-[28rem]">Nom de la partie<input class="field" id="live-title" placeholder="Ex. : Échauffement typo du mardi" required="" type="text"/></label>
<fieldset><legend class="text-body-sm text-text-muted mb-2">Jeux de la partie</legend><div class="flex flex-wrap gap-2">{chips}</div></fieldset>
<div class="flex flex-wrap items-center gap-4">{seg("live-rounds", [("5", "5"), ("6", "6"), ("8", "8"), ("10", "10")], "6", "Manches")}<span class="text-body-sm text-text-muted" id="live-msg"></span></div>
</form>
</div>
<aside class="ticket-side" style="background:#FFE08A">
<p class="side-title">Comment ça se passe</p>
<ul class="step-list"><li><span aria-hidden="true" class="material-symbols-outlined">add_box</span><span><b>Crée la salle.</b> Un code et un QR code s'affichent à l'écran.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">qr_code_scanner</span><span><b>Les joueurs rejoignent</b> en scannant ou sur rejoindre.html, avec leur prénom.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">play_arrow</span><span><b>Tu lances.</b> Tout le monde joue les mêmes manches, en même temps.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">leaderboard</span><span><b>Le classement</b> bouge à chaque manche, jusqu'au podium.</span></li></ul>
<button class="btn w-full mt-auto" form="live-form" type="submit">Créer la salle<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></button>
</aside>
</div>

<div class="ticket" hidden="" id="step-lobby">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Salle d'attente · <span id="lobby-title"></span></p>
<p class="text-body-lg">Va sur <b id="lobby-url"></b> et entre le code</p>
<p aria-live="polite" class="live-code" id="lobby-code"></p>
<div class="flex flex-wrap items-center gap-6 mt-6"><div class="live-qr" id="lobby-qr"></div><div class="flex flex-col gap-2"><p class="text-body-md">ou scanne ce QR code avec ton téléphone.</p><p class="text-body-sm text-text-muted" id="lobby-meta"></p><a class="btn-line btn-sm w-max mt-2" id="lobby-self" target="_blank">Ouvrir la page joueur dans un onglet</a></div></div>
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
<button class="btn w-full mt-auto" id="live-end" type="button">Terminer et afficher le podium</button>
</aside>
</div>

<div class="dot-board px-5 sm:px-10 pt-16 pb-12" hidden="" id="step-podium">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Fin de partie</p>
<h1 class="text-big text-center">Le podium</h1>
<div class="podium" id="podium"></div>
<ol class="live-board mt-10 max-w-[48rem] mx-auto" id="podium-all"></ol>
<div class="flex justify-center gap-3 mt-8"><a class="btn" href="live.html">Nouvelle partie</a><a class="btn-line" href="profs.html">Espace écoles</a></div>
</div>
{NOTE_LOCAL}
</section>''', f'''<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="assets/catalog.js"></script>
<script src="assets/account.js"></script>
<script src="assets/live.js"></script>
<script>
  (function () {{
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }}[c]));
    const games = window.OEIL_GAMES;
    let room = null;
    if (!(window.OeilAccount && OeilAccount.isPro())) document.querySelectorAll("#live-form input[data-pro]").forEach((b) => {{ b.checked = false; b.disabled = true; }});
    const show = (step) => ["setup", "lobby", "live", "podium"].forEach((k) => ($("step-" + k).hidden = k !== step));
    function joinUrl() {{ return location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "") + "rejoindre.html"; }}
    $("live-form").addEventListener("submit", (e) => {{
      e.preventDefault();
      const ids = [...document.querySelectorAll("#live-form input[type=checkbox]:checked")].map((b) => b.value);
      if (!ids.length) {{ $("live-msg").textContent = "Choisis au moins un jeu."; return; }}
      const rounds = +document.querySelector('input[name="live-rounds"]:checked').value;
      room = OeilLive.createRoom({{ title: $("live-title").value.trim() || "Partie en direct", ids, rounds }});
      $("lobby-code").textContent = room.code;
      $("lobby-url").textContent = joinUrl().replace(/^https?:\\/\\//, "");
      $("lobby-title").textContent = room.title;
      $("lobby-meta").textContent = `${{rounds}} manches · ${{ids.length}} jeu${{ids.length > 1 ? "x" : ""}}`;
      const link = `${{joinUrl()}}?code=${{room.code}}`;
      $("lobby-self").href = link;
      $("lobby-qr").innerHTML = "";
      if (window.QRCode) new QRCode($("lobby-qr"), {{ text: link, width: 200, height: 200, colorDark: "#141413", colorLight: "#ffffff" }});
      else $("lobby-qr").textContent = link;
      show("lobby");
      OeilLive.subscribe(room.code, render);
      render(room);
    }});
    function render(r) {{
      room = r;
      const ranking = OeilLive.ranking(r);
      const n = ranking.length;
      $("lobby-count").textContent = `${{n}} joueur${{n > 1 ? "s" : ""}}`;
      $("lobby-players").innerHTML = n ? ranking.map((p) => `<li><span class="live-avatar">${{esc(p.name[0] || "?").toUpperCase()}}</span>${{esc(p.name)}}</li>`).join("") : '<li class="live-empty">En attente des premiers joueurs…</li>';
      $("lobby-start").disabled = !n;
      if (r.status === "playing") {{
        show("live");
        $("live-code-small").textContent = r.code;
        if (!$("live-qr-small").childElementCount && window.QRCode) new QRCode($("live-qr-small"), {{ text: `${{joinUrl()}}?code=${{r.code}}`, width: 120, height: 120, colorDark: "#141413", colorLight: "#ffffff" }});
        $("live-title-h").textContent = r.title;
        $("live-board").innerHTML = ranking.map((p, i) => `<li class="live-row"><span class="live-rank">${{i + 1}}</span><span class="live-name">${{esc(p.name)}}${{p.done ? ' <small>terminé</small>' : ""}}</span><span class="live-dots">${{Array.from({{ length: r.rounds }}, (_, k) => `<i class="${{p.scores[k] != null ? "is-done" : ""}}" title="${{p.scores[k] != null ? p.scores[k] + " %" : ""}}">${{p.scores[k] != null ? p.scores[k] : ""}}</i>`).join("")}}</span><b class="live-total">${{p.total}} pts</b></li>`).join("");
      }}
      if (r.status === "finished") podium(ranking);
    }}
    function podium(ranking) {{
      show("podium");
      const top = ranking.slice(0, 3), order = [1, 0, 2];
      $("podium").innerHTML = order.filter((i) => top[i]).map((i) => `<div class="podium-step podium-${{i + 1}}"><span class="live-avatar">${{esc(top[i].name[0] || "?").toUpperCase()}}</span><b>${{esc(top[i].name)}}</b><span>${{top[i].total}} pts</span><i>${{i + 1}}</i></div>`).join("");
      $("podium-all").innerHTML = ranking.map((p, i) => `<li class="live-row"><span class="live-rank">${{i + 1}}</span><span class="live-name">${{esc(p.name)}}</span><span class="text-body-sm text-text-muted">${{p.played}} manche${{p.played > 1 ? "s" : ""}} · moyenne ${{Math.round(p.avg)}} %</span><b class="live-total">${{p.total}} pts</b></li>`).join("");
    }}
    $("lobby-start").addEventListener("click", () => room && render(OeilLive.start(room.code)));
    $("lobby-cancel").addEventListener("click", () => {{ show("setup"); room = null; }});
    $("live-end").addEventListener("click", () => room && render(OeilLive.finish(room.code)));
  }})();
</script>
''')

# ---------------------------------------------------------------- Rejoindre une partie
page("rejoindre.html", "Rejoindre une partie — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot" style="background:#FFE08A"></span>Rejoindre une partie en direct</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
<div class="lg:col-span-6">
<h1 class="text-big">Entre le code.</h1>
<p class="mt-4 text-body-lg max-w-[30rem]">Le code de la partie s'affiche sur l'écran de l'hôte, sous le QR code.</p>
</div>
<div class="lg:col-span-6">
<form class="join-card" id="join-form">
<label class="grid gap-2 text-body-sm text-text-muted">Code de la partie<input autocapitalize="characters" autocomplete="off" class="join-code" id="join-code" maxlength="5" placeholder="K7Q4M" required="" type="text"/></label>
<label class="grid gap-2 text-body-sm text-text-muted">Ton prénom<input autocomplete="given-name" class="h-12 rounded border border-ink bg-white px-3 text-[18px] text-ink" id="join-name" maxlength="24" required="" type="text"/></label>
<button class="btn w-full" type="submit">Rejoindre<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></button>
<p aria-live="polite" class="text-body-sm text-error" id="join-error"></p>
</form>
<div class="join-card" hidden="" id="join-wait">
<p class="text-body-sm text-text-muted">Tu es dans la salle</p>
<p class="text-headline-md" id="wait-title"></p>
<p class="mt-2 flex items-center gap-2 text-body-md"><span class="sm-spin sm-spin-dark"></span>En attente du lancement par l'hôte…</p>
<ul class="live-players mt-4" id="wait-players"></ul>
</div>
</div>
</div>
<div class="px-5 sm:px-10 pb-8">{NOTE_LOCAL}</div>
</div>
</section>''', '''<script src="assets/live.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const q = new URLSearchParams(location.search);
    if (q.get("code")) $("join-code").value = q.get("code").toUpperCase();
    try { $("join-name").value = JSON.parse(localStorage.getItem("oeil:name")) || ""; } catch (e) {}
    $("join-code").addEventListener("input", (e) => (e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")));
    $("join-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const code = $("join-code").value.trim(), name = $("join-name").value.trim();
      const room = await OeilLive.fetchRoom(code);
      if (!room) { $("join-error").textContent = "Code introuvable. Vérifie le code affiché par l'hôte."; return; }
      if (room.status === "finished") { $("join-error").textContent = "Cette partie est terminée."; return; }
      try { localStorage.setItem("oeil:name", JSON.stringify(name)); } catch (e2) {}
      const go = (r) => {
        if (r.status === "playing") { location.href = OeilLive.playLink(r, name); return; }
        $("wait-title").textContent = r.title;
        $("wait-players").innerHTML = Object.values(r.players).map((p) => `<li><span class="live-avatar">${esc(p.name[0] || "?").toUpperCase()}</span>${esc(p.name)}</li>`).join("");
      };
      go(OeilLive.join(code, name));
      $("join-form").hidden = true; $("join-wait").hidden = false;
      OeilLive.subscribe(code, go);
    });
  })();
</script>
''')

# ---------------------------------------------------------------- Connexion
page("connexion.html", "Connexion — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Ton espace Œil Studio</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<div class="lg:col-span-6">
<h1 class="text-big max-w-[10ch]">Garde ta progression.</h1>
<p class="mt-5 text-body-lg max-w-[32rem]">Un compte retrouve tes records, ta série du défi du jour et ton historique sur tous tes appareils. Les jeux restent jouables sans compte.</p>
<ul class="mt-8 grid gap-3 text-body-md"><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Records et progression par discipline</li><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Série du défi du jour</li><li class="flex gap-3"><span class="material-symbols-outlined text-signal">check</span>Pour les enseignants : classes et classements</li></ul>
</div>
<div class="lg:col-span-6">
<div class="join-card">
<div aria-label="Type de formulaire" class="seg-line w-max" role="group"><button aria-pressed="true" data-tab="login" type="button">Se connecter</button><button aria-pressed="false" data-tab="signup" type="button">Créer un compte</button></div>
<form class="flex flex-col gap-4 mt-2" id="auth-form">
<label class="grid gap-1 text-body-sm text-text-muted" data-only="signup" hidden="">Prénom<input autocomplete="given-name" class="field" id="auth-name" type="text"/></label>
<label class="grid gap-1 text-body-sm text-text-muted">Adresse e-mail<input autocomplete="email" class="field" id="auth-email" required="" type="email"/></label>
<label class="grid gap-1 text-body-sm text-text-muted">Mot de passe<input autocomplete="current-password" class="field" id="auth-pass" minlength="12" required="" type="password"/><span class="text-[12px]" data-only="signup" hidden="">12 caractères minimum. Une phrase fonctionne très bien.</span></label>
<fieldset data-only="signup" hidden=""><legend class="text-body-sm text-text-muted mb-2">Tu es</legend>{seg("role", [("etudiant", "Étudiant·e"), ("enseignant", "Enseignant·e"), ("pro", "Designer en poste")], "etudiant")}</fieldset>
<button class="btn w-full" id="auth-submit" type="submit">Se connecter</button>
<button class="btn-quiet text-[14px] w-max" data-only="login" id="auth-forgot" type="button">Mot de passe oublié ?</button>
<p aria-live="polite" class="text-body-sm" id="auth-msg"></p>
</form>
</div>
<p class="live-note mt-4"><span class="material-symbols-outlined" aria-hidden="true">info</span>Version de démonstration : le compte est enregistré dans ce navigateur et le mot de passe n'est pas conservé. L'authentification se branche dans <code>assets/account.js</code>.</p>
</div>
</div>
</div>
</section>''', '''<script src="assets/account.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    let tab = "login";
    const setTab = (t) => {
      tab = t;
      document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === t)));
      document.querySelectorAll("[data-only]").forEach((n) => (n.hidden = n.dataset.only !== t));
      $("auth-submit").textContent = t === "login" ? "Se connecter" : "Créer mon compte";
      $("auth-pass").autocomplete = t === "login" ? "current-password" : "new-password";
      $("auth-name").required = t === "signup";
      $("auth-msg").textContent = "";
    };
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => setTab(b.dataset.tab)));
    if (location.hash === "#inscription") setTab("signup");
    $("auth-forgot").addEventListener("click", () => {
      const email = $("auth-email").value.trim();
      $("auth-msg").textContent = email ? `Si un compte existe pour ${email}, un lien de réinitialisation vient d'être envoyé.` : "Indique d'abord ton adresse e-mail.";
    });
    $("auth-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const role = (document.querySelector('input[name="role"]:checked') || {}).value;
      OeilAccount.login({ name: $("auth-name").value.trim(), email: $("auth-email").value.trim(), role });
      location.href = "compte.html";
    });
  })();
</script>
''')

# ---------------------------------------------------------------- Mon compte
game_js = "window.OEIL_GAMES"
page("compte.html", "Mon compte — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Mon compte</p>
<div class="px-5 sm:px-10 pt-16 pb-10">
<div class="flex flex-wrap items-end justify-between gap-4">
<div><p class="text-body-md text-text-muted" id="acc-role">Sans compte</p><h1 class="text-big" id="acc-name">Ta progression</h1></div>
<div class="flex flex-wrap gap-2"><a class="btn" href="defi.html">Défi du jour</a><a class="btn-line" href="connexion.html" id="acc-login">Se connecter</a><button class="btn-line" hidden="" id="acc-logout" type="button">Se déconnecter</button></div>
</div>
<div class="acc-guest" hidden="" id="acc-guest"><span class="material-symbols-outlined" aria-hidden="true">info</span><span>Sans compte, tes scores restent dans ce navigateur : ils disparaissent si tu changes d'appareil ou effaces tes données. <a class="underline" href="connexion.html#inscription">Crée un compte</a> pour les garder.</span></div>
<div class="acc-stats mt-8">
<div class="ticket-stat"><span>Offre</span><b id="acc-plan">Gratuit</b><a class="text-[13px] underline mt-1" href="tarifs.html">Voir les offres</a></div>
<div class="ticket-stat"><span>Sessions jouées</span><b id="st-sessions">0</b></div>
<div class="ticket-stat"><span>Moyenne générale</span><b id="st-avg">–</b></div>
<div class="ticket-stat"><span>Série du défi du jour</span><b id="st-streak">0 jour</b></div>
<div class="ticket-stat"><span>Jeux essayés</span><b id="st-games">0 sur 44</b></div>
</div>
</div>
</div>
</section>
<section class="{W} pb-16 grid lg:grid-cols-12 gap-8 items-start">
<div class="lg:col-span-7">
<h2 class="text-headline-lg-mobile md:text-headline-lg">Records par discipline</h2>
<div class="mt-6 grid gap-6" id="acc-domains"></div>
</div>
<div class="lg:col-span-5">
<h2 class="text-headline-lg-mobile md:text-headline-lg">Dernières sessions</h2>
<ol class="mt-6 acc-history" id="acc-history"><li class="text-text-muted">Aucune session pour l'instant.</li></ol>
<button class="btn-quiet text-[14px] mt-6" id="acc-clear" type="button">Effacer mes données de ce navigateur</button>
</div>
</section>''', '''<script src="assets/catalog.js"></script>
<script src="assets/account.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const get = (k) => { try { return JSON.parse(localStorage.getItem("oeil:" + k)); } catch (e) { return null; } };
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const u = OeilAccount.get();
    const ROLES = { etudiant: "Étudiant·e", enseignant: "Enseignant·e", pro: "Designer en poste" };
    if (u) { $("acc-name").textContent = u.name; $("acc-role").textContent = `${ROLES[u.role] || ""} · ${u.email}`; $("acc-login").hidden = true; $("acc-logout").hidden = false; }
    else {{ $("acc-role").textContent = "Tu n'es pas connecté·e"; $("acc-name").textContent = "Ta progression sur cet appareil"; document.getElementById("acc-guest").hidden = false; }}
    const plan = OeilAccount.plan(), PLANS = {{ free: "Gratuit", pro: "Œil Pro", parcours: "Parcours intensif", classe: "Classe", ecole: "École" }};
    $("acc-plan").textContent = PLANS[plan] || plan;
    $("acc-logout").addEventListener("click", () => { OeilAccount.logout(); location.reload(); });
    $("acc-clear").addEventListener("click", () => { if (confirm("Effacer records, historique et série de ce navigateur ?")) { OeilAccount.clearAll(); location.reload(); } });
    const hist = get("history") || [];
    const daily = get("daily") || { streak: 0 };
    const games = window.OEIL_GAMES, doms = window.OEIL_DOMAINS;
    const bests = Object.fromEntries(games.map((g) => [g.id, get("best:" + g.id)]));
    const tried = games.filter((g) => bests[g.id] != null).length;
    $("st-sessions").textContent = hist.length;
    $("st-avg").textContent = hist.length ? Math.round(hist.reduce((a, h) => a + h.avg, 0) / hist.length) + " %" : "–";
    $("st-streak").textContent = `${daily.streak || 0} jour${(daily.streak || 0) > 1 ? "s" : ""}`;
    $("st-games").textContent = `${tried} sur ${games.length}`;
    $("acc-domains").innerHTML = Object.entries(doms).map(([k, d]) => {
      const list = games.filter((g) => g.domain === k);
      return `<div class="acc-domain" style="--field:${d.field}"><p class="disc-head"><span class="board-dot"></span>${d.label}</p><ul>${list.map((g) => { const b = bests[g.id]; return `<li><a href="${g.id}.html">${g.name}</a><span class="acc-bar"><i style="width:${b != null ? Math.round(b) : 0}%"></i></span><b>${b != null ? Math.round(b) + " %" : "–"}</b></li>`; }).join("")}</ul></div>`;
    }).join("");
    if (hist.length) $("acc-history").innerHTML = hist.slice(0, 15).map((h) => `<li><span>${esc(h.title)}${h.daily ? " · défi du jour" : ""}</span><small>${new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small><b>${h.avg} %</b></li>`).join("");
  })();
</script>
''')

# ---------------------------------------------------------------- Contact et devis
page("contact.html", "Contact et devis — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board">
<p class="board-strip"><span class="board-dot" style="background:#B9D9FF"></span>Contact, essai et devis</p>
<div class="px-5 sm:px-10 pt-16 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<div class="lg:col-span-5">
<h1 class="text-big max-w-[10ch]">Parlons de ton projet.</h1>
<p class="mt-5 text-body-lg max-w-[30rem]">Un essai pour ta classe, un devis pour ton école ou une simple question : on te répond sous deux jours ouvrés.</p>
<div class="estimate panel-line mt-8 p-5" id="estimate" hidden="">
<p class="text-body-sm text-text-muted">Estimation indicative</p>
<p class="offer-price mt-1" id="est-price">690 €</p>
<p class="text-body-sm mt-1" id="est-detail"></p>
</div>
</div>
<form class="lg:col-span-7 join-card" id="contact-form">
<fieldset><legend class="text-body-sm text-text-muted mb-2">Ta demande concerne</legend>{seg("offre", [("etudiant", "Étudiant"), ("parcours", "Parcours"), ("classe", "Classe"), ("ecole", "École"), ("autre", "Autre")], "classe")}</fieldset>
<div class="grid sm:grid-cols-2 gap-4">
<label class="grid gap-1 text-body-sm text-text-muted">Nom<input autocomplete="name" class="field" id="c-name" required="" type="text"/></label>
<label class="grid gap-1 text-body-sm text-text-muted">Adresse e-mail<input autocomplete="email" class="field" id="c-email" required="" type="email"/></label>
</div>
<label class="grid gap-1 text-body-sm text-text-muted" data-for="classe ecole">Établissement<input autocomplete="organization" class="field" id="c-org" type="text"/></label>
<label class="grid gap-2 text-body-sm text-text-muted" data-for="classe ecole">Nombre d'étudiants : <b class="text-ink tabular" id="c-n-out">120</b><input aria-describedby="c-n-help" class="w-full accent-ink" id="c-n" max="2000" min="1" step="1" type="range" value="120"/></label>
<label class="grid gap-1 text-body-sm text-text-muted" data-for="classe ecole">Ou tape le nombre exact<input class="field w-40" id="c-n-num" inputmode="numeric" max="20000" min="1" type="number" value="120"/><span id="c-n-help" class="text-[12px]">De 1 à 20 000 étudiants.</span></label>
<label class="grid gap-1 text-body-sm text-text-muted">Message<textarea class="field min-h-[120px] py-2" id="c-msg" placeholder="Tes besoins, tes dates, tes questions…"></textarea></label>
<button class="btn w-full" type="submit">Envoyer la demande</button>
<p class="text-body-sm text-text-muted">Le bouton ouvre ton logiciel de messagerie avec le message prérempli, à envoyer à {MAIL}.</p>
</form>
</div>
</div>
</section>''', f'''<script>
  (function () {{
    const $ = (id) => document.getElementById(id);
    const radios = [...document.querySelectorAll('input[name="offre"]')];
    const q = new URLSearchParams(location.search).get("offre");
    if (q) radios.forEach((r) => (r.checked = r.value === q));
    const offer = () => (radios.find((r) => r.checked) || {{}}).value;
    // Grille indicative : école = 290 € + 4,50 € par étudiant et par an, au moins 690 € ; classe = 9 € par mois et par enseignant (≈ 40 étudiants).
    function update(exact) {{
      const o = offer(), n = typeof exact === "number" ? exact : +$("c-n-num").value || +$("c-n").value;
      $("c-n-out").textContent = n;
      document.querySelectorAll("[data-for]").forEach((el) => (el.hidden = !el.dataset.for.split(" ").includes(o)));
      const est = $("estimate");
      if (o === "ecole") {{ const p = Math.max(690, Math.round((290 + 4.5 * n) / 10) * 10); est.hidden = false; $("est-price").textContent = `${{p.toLocaleString("fr-FR")}} €/an`; $("est-detail").textContent = `Pour ${{n}} étudiants, soit ${{(p / n).toFixed(2).replace(".", ",")}} € par étudiant et par an. Le devis final dépend du nombre de campus et des options (SSO, exports).`; }}
      else if (o === "classe") {{ const t = Math.max(1, Math.ceil(n / 40)); est.hidden = false; $("est-price").textContent = `${{9 * t}} €/mois`; $("est-detail").textContent = `${{t}} enseignant${{t > 1 ? "s" : ""}} pour ${{n}} étudiants (jusqu'à 40 par enseignant).`; }}
      else if (o === "parcours") {{ est.hidden = false; $("est-price").textContent = "19 €"; $("est-detail").textContent = "Payé une fois, accès à vie au parcours de 14 jours."; }}
      else if (o === "etudiant") {{ est.hidden = false; $("est-price").textContent = "3 €/mois"; $("est-detail").textContent = "Ou 24 € par an, résiliable à tout moment."; }}
      else est.hidden = true;
    }}
    radios.forEach((r) => r.addEventListener("change", update));
    $("c-n").addEventListener("input", () => {{ $("c-n-num").value = $("c-n").value; update(); }});
    $("c-n-num").addEventListener("input", () => {{ const v = Math.max(1, Math.min(20000, +$("c-n-num").value || 1)); $("c-n").value = Math.min(2000, v); update(v); }});
    update();
    $("contact-form").addEventListener("submit", (e) => {{
      e.preventDefault();
      const o = offer(), labels = {{ etudiant: "Offre étudiant", parcours: "Parcours intensif", classe: "Offre classe", ecole: "Devis école", autre: "Question" }};
      const body = [`Nom : ${{$("c-name").value}}`, `E-mail : ${{$("c-email").value}}`, $("c-org").value && !$("c-org").parentElement.hidden ? `Établissement : ${{$("c-org").value}}` : "", !$("c-n").parentElement.hidden ? `Nombre d'étudiants : ${{$("c-n-num").value}}` : "", "", $("c-msg").value].filter((x) => x !== "").join("\\n");
      location.href = `mailto:{MAIL}?subject=${{encodeURIComponent(labels[o] + " — Œil Studio")}}&body=${{encodeURIComponent(body)}}`;
    }});
  }})();
</script>
''')

# ---------------------------------------------------------------- Pages légales (modèles à compléter)
LEGAL_NOTE = '<p class="live-note"><span class="material-symbols-outlined" aria-hidden="true">edit_note</span>Modèle à compléter : remplace les éléments entre crochets avant la mise en ligne.</p>'
def legal(name, title, sections):
    body = "".join(f'<section class="legal-sec"><h2>{h}</h2>{t}</section>' for h, t in sections)
    page(name, f"{title} — Œil Studio", None, f'''<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="dot-board px-5 sm:px-10 pt-16 pb-12">
<p class="board-strip"><span class="board-dot"></span>{title}</p>
<h1 class="text-big">{title}</h1>
<div class="mt-6 max-w-[46rem]">{LEGAL_NOTE}</div>
<div class="legal mt-8 max-w-[46rem]">{body}</div>
</div>
</section>''')
legal("mentions-legales.html", "Mentions légales", [
    ("Éditeur du site", "<p>[Nom ou raison sociale], [forme juridique], [adresse]. SIRET : [numéro]. Directeur ou directrice de la publication : [nom]. Contact : <a href=\"contact.html\">formulaire de contact</a>.</p>"),
    ("Hébergement", "<p>[Nom de l'hébergeur], [adresse], [téléphone ou site].</p>"),
    ("Propriété intellectuelle", "<p>Les jeux, textes et visuels d'Œil Studio sont protégés. Les polices Inter Tight et Newsreader sont distribuées sous licence SIL Open Font License ; les icônes Material Symbols sous licence Apache 2.0.</p>"),
    ("Accessibilité", "<p>Le site est conçu pour être utilisable au clavier et respecter les WCAG 2.1 niveau AA. Pour signaler un obstacle, utilise le <a href=\"contact.html\">formulaire de contact</a>.</p>"),
])
legal("confidentialite.html", "Confidentialité", [
    ("Ce que le site enregistre", "<p>Sans compte, tes records, ton historique, ta série du défi du jour et ton prénom (si tu le saisis pour un défi) sont enregistrés <b>uniquement dans ton navigateur</b> (stockage local). Rien n'est envoyé à un serveur Œil Studio dans cette version.</p>"),
    ("Défis et sessions de classe", "<p>Un lien de défi ou un code résultat contient ton prénom, tes scores et le tirage de la partie. Il n'est partagé qu'avec les personnes à qui tu l'envoies.</p>"),
    ("Services tiers", "<p>Pour afficher les pages, ton navigateur charge des polices depuis Google Fonts, des scripts depuis cdn.tailwindcss.com et cdnjs.cloudflare.com. Ces services reçoivent ton adresse IP. [À remplacer par un hébergement local des polices et scripts si tu veux l'éviter.]</p>"),
    ("Mesure d'audience et cookies", "<p>Aucun cookie et aucun outil de mesure d'audience ne sont utilisés. [À mettre à jour si tu en ajoutes.]</p>"),
    ("Tes droits", "<p>Tu peux effacer toutes tes données depuis <a href=\"compte.html\">Mon compte</a>. Pour toute question : [adresse de contact du ou de la responsable du traitement].</p>"),
])

# La page d'attente n'est plus utilisée
(site / "bientot.html").unlink(missing_ok=True)
print("ok")
