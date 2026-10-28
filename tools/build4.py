import pathlib, re, sys, json
site = pathlib.Path(sys.argv[1]); SP = pathlib.Path(sys.argv[2])
src = (SP / "redesign.py").read_text()
ns = {"__name__": "lib", "sys": sys}
exec(compile(src.split("# ---------------------------------------------------------------- Accueil")[0], "redesign", "exec"), ns)
head, header, FOOTER, W = ns["head"], ns["header"], ns["FOOTER"], ns["W"]

cat = (site / "assets/catalog.js").read_text()
DOMAINS = {m[0]: {"label": m[1], "field": m[2]} for m in re.findall(r'(\w+): \{ label: "([^"]+)", field: "(#[0-9A-F]+)" \}', cat)}
GAMES = [dict(zip(("id", "name", "domain", "level", "min", "desc", "pro"), m[:6] + (bool(m[6]),))) for m in re.findall(r'\{ id: "([^"]+)", name: "([^"]+)", domain: "([^"]+)", level: "([^"]+)", min: (\d+), desc: "([^"]+)"(, pro: true)? \}', cat)]
assert len(GAMES) == 44, len(GAMES)
LEVEL_KEY = {"Débutant": "debutant", "Intermédiaire": "intermediaire", "Avancé": "avance", "Tous niveaux": "all"}
CUR, CHK, MIXA = ' aria-current="page"', ' checked=""', ' data-mix=""'
MAIL = "bonjour@oeil.studio"  # adresse provisoire, à remplacer
SKIP = '<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] btn" href="#contenu">Aller au contenu</a>'

def page_head(title, kern=False, daily=False):
    hd = head(title, kern=kern)
    if daily: hd = hd.replace('<html lang="fr">', '<html data-daily="1" lang="fr">')
    return hd

def seg(name, values, checked, label=""):
    inner = "".join(f'<label><input{CHK if v == checked else ""} name="{name}" type="radio" value="{v}"/><span>{t}</span></label>' for v, t in values)
    lab = f'<span class="seg-pick-label">{label}</span>' if label else ""
    return f'<span class="flex flex-wrap items-center gap-2">{lab}<span class="seg-pick" role="radiogroup">{inner}</span></span>'

COLS = "grid-cols-[auto_1fr_auto] md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.7fr)_9rem_8rem_1.5rem]"
PRO_BADGE = ' <span class="pro-badge">Pro</span>'
def row(g):
    d = DOMAINS[g["domain"]]
    return f'''<a class="game-row {COLS}" data-domain="{g["domain"]}" data-level="{LEVEL_KEY[g["level"]]}" href="{g["id"]}.html" role="listitem" style="--row:{d["field"]}">
<span aria-hidden="true" class="w-10 h-10 md:w-14 md:h-14 rounded-lg shrink-0 border border-ink" style="background:{d["field"]}"></span>
<span><span class="block text-[22px] md:text-[28px] font-medium tracking-[-0.025em] leading-tight">{g["name"]}{PRO_BADGE if g["pro"] else ""}</span><span class="md:hidden block mt-0.5 text-body-sm text-text-muted">{d["label"]} · {g["min"]} min · {g["level"]}</span></span>
<span class="hidden md:block text-body-md text-on-surface-variant">{g["desc"]}</span>
<span class="hidden md:block text-body-sm">{d["label"]}</span>
<span class="hidden md:block text-body-sm tabular">{g["min"]} min · {g["level"]}</span>
<span aria-hidden="true" class="material-symbols-outlined row-arrow justify-self-end">arrow_forward</span>
</a>'''

SCRIPTS_ALL = "".join(f'<script src="assets/games/{g["id"]}.js"></script>\n' for g in GAMES)

def app_shell(title_html, sub_html, mix=False, current_id=None):
    nav = ""
    if current_id:
        i = [g["id"] for g in GAMES].index(current_id)
        prev, nxt = GAMES[i - 1], GAMES[(i + 1) % len(GAMES)]
        info_d = GAMES[i]["domain"]
        same = "".join(f'<a href="{g["id"]}.html">{g["name"]}</a>' for g in GAMES if g["domain"] == info_d and g["id"] != current_id)
        pf, nf = DOMAINS[prev["domain"]]["field"], DOMAINS[nxt["domain"]]["field"]
        nav = f'''<nav aria-label="Autres jeux" class="game-more">
<a class="game-more-card" href="{prev["id"]}.html" style="--card:{pf}"><small><span aria-hidden="true" class="material-symbols-outlined text-[16px]">arrow_back</span>Jeu précédent · {DOMAINS[prev["domain"]]["label"]}</small><b>{prev["name"]}</b><p>{prev["desc"]}</p></a>
<a class="game-more-card is-next" href="{nxt["id"]}.html" style="--card:{nf}"><small>Jeu suivant · {DOMAINS[nxt["domain"]]["label"]}<span aria-hidden="true" class="material-symbols-outlined text-[16px]">arrow_forward</span></small><b>{nxt["name"]}</b><p>{nxt["desc"]}</p></a>
<div class="game-more-same"><span>Aussi en {DOMAINS[info_d]["label"].lower()} :</span>{same}<a class="more-all" href="jeux.html">Les {len(GAMES)} jeux</a></div>
</nav>'''
        next_link = f'<a class="btn" href="{nxt["id"]}.html">Jeu suivant : {nxt["name"]}<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></a>'
    else:
        next_link = '<a class="btn" href="jeux.html#melange">Composer un mélange<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></a>'
    return f'''<div class="game-app" id="game-app"{MIXA if mix else ""}>
<div class="game-head w-full {W}">
<div class="min-w-0">
<a class="game-crumb" href="jeux.html"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_back</span>Bibliothèque</a>
<div class="flex items-center gap-4 min-w-0">
<span aria-hidden="true" class="game-chip"></span>
<div class="min-w-0"><h1 class="game-title">{title_html}</h1><p class="game-sub">{sub_html}</p></div>
</div>
</div>
<div class="flex items-center gap-3 sm:gap-4">
<div aria-label="Manches" class="round-dots" id="round-dots"></div>
<p class="session-score">Moyenne<b id="session-score">–</b></p>
<button class="btn-line btn-sm hidden sm:inline-flex" id="btn-howto" type="button">Comment jouer ?</button>
<button aria-label="Recommencer la session" class="icon-btn" id="btn-reset-session" title="Recommencer la session" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[20px]">restart_alt</span></button>
</div>
</div>
<div class="game-main w-full {W}">
<p class="challenge-banner" hidden="" id="challenge-banner"></p>
<section aria-label="Plateau de jeu" class="stage" id="stage" tabindex="-1">
<p class="stage-brief" id="brief"></p>
<div class="board" id="board"></div>
<div aria-labelledby="coach-title" aria-modal="true" class="coach" hidden="" id="coach" role="dialog">
<div class="coach-card">
<p class="coach-kicker" id="coach-kicker">Comment jouer</p>
<h2 id="coach-title"></h2>
<p class="coach-goal" id="coach-goal"></p>
<ol id="coach-steps"></ol>
<button class="btn w-full" id="btn-coach-go" type="button">C'est parti<kbd>Entrée</kbd></button>
</div>
</div>
<div aria-labelledby="paywall-title" class="coach" hidden="" id="paywall" role="dialog">
<div class="coach-card">
<p class="coach-kicker"><span class="pro-badge">Pro</span> Jeu réservé à Œil Pro</p>
<h2 id="paywall-title">{title_html}</h2>
<p class="coach-goal">Ce jeu fait partie d'Œil Pro. Les {sum(1 for x in GAMES if not x["pro"])} jeux gratuits restent ouverts à tous, et ce jeu peut aussi tomber dans le défi du jour.</p>
<ul class="paywall-list"><li>Les 44 jeux, sans limite</li><li>Historique et progression par discipline</li><li>Résiliable à tout moment</li></ul>
<a class="btn w-full" href="tarifs.html#pro">Passer à Pro · 3 €/mois</a>
<a class="btn-line w-full mt-2" href="jeux.html">Jouer à un jeu gratuit</a>
</div>
</div>
<div aria-live="polite" class="result" hidden="" id="result" role="status">
<div class="result-card">
<div class="result-top"><span id="result-round"></span><button aria-label="Réduire pour voir le plateau" class="result-toggle" id="btn-result-toggle" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[20px]">expand_more</span></button></div>
<div class="result-head"><b id="result-score"></b><span id="result-verdict"></span></div>
<div class="result-body">
<dl class="result-metrics" id="result-metrics"></dl>
<p class="result-principle" id="result-principle"></p>
</div>
<div class="result-actions"><button class="btn-line btn-sm" id="btn-retry" type="button">Rejouer</button><button class="btn btn-sm" id="btn-next" type="button">Suivante<kbd>Entrée</kbd></button></div>
</div>
</div>
<div class="summary" hidden="" id="summary">
<div class="summary-card">
<div class="sum-left">
<p class="coach-kicker">Bilan de la session</p>
<div class="sum-top"><b id="sum-score"></b><span id="sum-grade"></span></div>
<p class="text-body-sm text-text-muted" id="sum-record"></p>
<p class="sum-versus" hidden="" id="sum-versus"></p>
<div class="summary-actions"><button class="btn-line" id="btn-restart" type="button">Rejouer</button>{next_link}</div>
</div>
<div class="sum-right">
<ol id="sum-rounds"></ol>
<div class="sum-share">
<p class="font-medium">Défier un ami sur les mêmes manches</p>
<div class="sum-share-row"><input aria-label="Ton prénom" autocomplete="given-name" id="sum-name" maxlength="24" placeholder="Ton prénom" type="text"/><button class="btn" id="btn-share" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">link</span>Copier le lien</button></div>
<div class="sum-share-out" hidden="" id="sum-share-out"><span></span><input aria-label="Lien de défi" readonly="" type="text"/></div>
<div hidden="" id="sum-class">
<button class="btn w-full" id="btn-class-code" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">school</span>Copier mon code résultat pour l'enseignant</button>
<div class="sum-share-out mt-2" hidden="" id="sum-class-out"><span></span><input aria-label="Code résultat" readonly="" type="text"/></div>
</div>
</div>
</div>
</div>
</div>
</section>
<div class="game-bar">
<div class="controls" id="controls"></div>
<div class="bar-actions">
<button class="btn-line" hidden="" id="btn-hint" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">lightbulb</span><span>Indice</span></button>
<button class="btn" id="btn-submit" type="button">Valider<kbd>Entrée</kbd></button>
</div>
</div>
{nav}
</div>
</div>'''

# ---------------------------------------------------------------- Pages de jeu
for g in GAMES:
    d = DOMAINS[g["domain"]]
    html = f'''{page_head(g["name"] + " — Œil Studio", kern=g["id"] == "kern-clinic")}
<body class="bg-ground text-ink">
{SKIP}
{header("jeux")}
<main class="pt-16" id="contenu">
{app_shell(g["name"], f'{d["label"]} · {g["level"]} · 5 manches · environ {g["min"]} min' + (" · Pro" if g["pro"] else " · gratuit"), current_id=g["id"])}
</main>
{FOOTER}
<script src="assets/catalog.js"></script>
<script src="assets/config.js"></script>
<script src="assets/account.js"></script>
<script src="assets/engine.js"></script>
<script src="assets/kits.js"></script>
<script src="assets/games/{g["id"]}.js"></script>
<script src="assets/site.js"></script>
</body></html>
'''
    (site / f'{g["id"]}.html').write_text(html)

# ---------------------------------------------------------------- Défi du jour / mélange
DEFI = f'''{page_head("Défi du jour — Œil Studio", kern=True, daily=True)}
<body class="bg-ground text-ink" data-mode="mix">
{SKIP}
{header("defi")}
<main class="pt-16" id="contenu">
<section class="{W} pt-6 lg:pt-10 pb-16" hidden="" id="defi-intro">
<div class="ticket">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot" style="background:#F7B4CC"></span>Défi du jour · renouvelé à minuit · le même pour tout le monde</p>
<div class="ticket-date"><span class="ticket-day" data-today="day">28</span><span><span class="ticket-wd" data-today="weekday">mercredi</span><span class="ticket-mo" data-today="monthlong">octobre</span></span></div>
<h1 class="text-big mt-4">Six manches, six disciplines.</h1>
<p class="mt-4 max-w-[36rem] text-body-lg">Un jeu tiré au sort dans chaque discipline. Joue-le une fois par jour, garde ta série, et compare ton score avec tes amis grâce au lien de fin de partie.</p>
<ol class="ticket-games" id="ticket-games"></ol>
</div>
<aside class="ticket-side">
<div class="ticket-stat"><span>Ta série</span><b id="ticket-streak">0 jour</b></div>
<div class="ticket-stat"><span>Ton score aujourd'hui</span><b id="ticket-today">pas encore joué</b></div>
<div class="ticket-stat"><span>Durée</span><b>environ 15 min</b></div>
<button class="btn w-full mt-auto" id="ticket-go" type="button">Commencer le défi<span aria-hidden="true" class="material-symbols-outlined text-[18px]">play_arrow</span></button>
<a class="btn-line w-full" href="jeux.html#melange">Composer mon propre mélange</a>
</aside>
</div>
</section>
<div id="defi-app">
{app_shell('<span id="mix-title">Défi du jour</span>', '<span id="mix-sub">Une manche par jeu</span> · En cours : <b id="mix-current"></b> <span class="text-text-muted" id="mix-domain"></span>', mix=True)}
</div>
</main>
{FOOTER}
<script src="assets/catalog.js"></script>
<script src="assets/config.js"></script>
<script src="assets/account.js"></script>
<script src="assets/engine.js"></script>
<script src="assets/kits.js"></script>
<script src="assets/live.js"></script>
{SCRIPTS_ALL}<script>
  (function () {{
    const S = window.OEIL_SEED, games = window.OEIL_GAMES;
    const known = new Set(games.map((g) => g.id));
    const custom = (S.params.get("jeux") || "").split(",").filter((id) => known.has(id));
    let ids, rounds, title, sub;
    if (S.challenge && S.challenge.ids) {{
      ids = S.challenge.ids.filter((id) => known.has(id)); rounds = S.challenge.rounds || ids.length;
      title = S.challenge.title || (ids.length > 1 ? "Mélange" : "Défi"); sub = "Défi partagé";
    }} else if (custom.length) {{
      ids = Oeil.shuffle(custom); rounds = Math.max(ids.length, +S.params.get("manches") || ids.length);
      title = "Mélange"; sub = `${{rounds}} manches, ${{ids.length}} jeux`;
    }} else {{
      // Défi du jour : un jeu tiré au sort dans chaque discipline, le même pour tout le monde jusqu'à minuit.
      ids = Object.keys(window.OEIL_DOMAINS).map((d) => Oeil.pick(games.filter((g) => g.domain === d)).id);
      rounds = ids.length;
      title = "Défi du " + new Date().toLocaleDateString("fr-FR", {{ weekday: "long", day: "numeric", month: "long" }});
      sub = "5 disciplines, le même tirage pour tout le monde";
    }}
    document.getElementById("mix-title").textContent = title;
    document.getElementById("mix-sub").textContent = sub;
    document.title = title + " — Œil Studio";
    const isDaily = !(S.challenge && S.challenge.ids) && !custom.length;
    if (!isDaily) {{ Oeil.start({{ ids, rounds, title }}); return; }}
    // Page d'entrée du défi du jour : les jeux du jour, la série, le score déjà fait.
    const intro = document.getElementById("defi-intro"), app = document.getElementById("defi-app");
    intro.hidden = false; app.hidden = true;
    const doms = window.OEIL_DOMAINS;
    document.getElementById("ticket-games").innerHTML = ids.map((id) => {{ const g = games.find((x) => x.id === id), d = doms[g.domain]; return `<li style="--field:${{d.field}}"><span class="ticket-chip"></span><span><b>${{g.name}}</b><small>${{d.label}} · ${{g.desc}}</small></span></li>`; }}).join("");
    const daily = Oeil.store.get("daily") || {{ streak: 0, last: null, scores: {{}} }};
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = daily.last === S.today || daily.last === yesterday ? daily.streak : 0;
    document.getElementById("ticket-streak").textContent = `${{streak}} jour${{streak > 1 ? "s" : ""}}`;
    if (daily.scores[S.today] != null) document.getElementById("ticket-today").textContent = `${{daily.scores[S.today]}} %`;
    document.getElementById("ticket-go").addEventListener("click", () => {{ intro.hidden = true; app.hidden = false; Oeil.start({{ ids, rounds, title }}); window.scrollTo(0, 0); }});
  }})();
</script>
<script src="assets/site.js"></script>
</body></html>
'''
(site / "defi.html").write_text(DEFI)

# ---------------------------------------------------------------- Bibliothèque (+ composer un mélange)
CHIP = "chip h-9 px-4 rounded-full text-[14px] font-medium border border-ink transition-colors"
chips = "".join(
    f'<button aria-pressed="false" class="{CHIP}" data-domain="{k}" type="button"><span aria-hidden="true" class="inline-block w-2.5 h-2.5 rounded-full border border-ink mr-1.5 align-[1px]" style="background:{v["field"]}"></span>{v["label"]}</button>'
    for k, v in DOMAINS.items()) + f'<button aria-pressed="false" class="{CHIP}" data-domain="all" type="button">Tous les jeux</button>'
PRO_ATTR, LOCK = ' data-pro=""', '<b aria-hidden="true" class="material-symbols-outlined mix-lock">lock</b>'
mixchips = "".join(f'<label class="mix-chip"><input checked=""{PRO_ATTR if g["pro"] else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}{LOCK if g["pro"] else ""}</span></label>' for g in GAMES)
SOON = ["Bézier Letters", "Type Detective", "Rag Rescue", "Widow Hunter", "Type Scale", "Glyph Memory", "Palette Recall", "Saturation Ladder", "Gradient Repair", "Semantic Colors",
        "Grid Snap", "Whitespace Budget", "Crop It", "Responsive Rescue", "Five-Second Layout", "UI Detective", "State Machine", "Button Priority", "Form Rescue", "Icon Family",
        "Dark Mode Repair", "Focus Order", "Microcopy Duel", "Keyboard Quest", "Node Budget", "Boolean Builder", "Curve Continuity", "Negative Space", "Motion Order"]
JEUX = f'''{page_head("Bibliothèque des jeux — Œil Studio")}
<body class="bg-ground text-ink">
{SKIP}
{header("jeux")}
<main class="pt-16" id="contenu">
<section class="{W} pt-6 lg:pt-10">
<div class="dot-board px-5 sm:px-10 pt-16 pb-10 lg:pb-14">
<p class="board-strip"><span class="board-dot"></span>{len(GAMES)} jeux · 6 disciplines · gratuits, sans compte</p>
<h1 class="text-[clamp(4.25rem,9.6vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.06em] reveal">Bibliothèque</h1>
<p class="mt-6 lg:mt-10 max-w-[38rem] text-[20px] sm:text-[24px] leading-[1.35] tracking-[-0.015em] reveal" style="--d:80ms">Des jeux de 2 à 5 minutes en typographie, couleur, composition, UI, UX et motion. Joue-les un par un, ou mélange-les : une manche, un jeu.</p>
<div class="mt-8 flex flex-wrap gap-3 reveal" style="--d:140ms"><a class="btn" href="#melange">Composer un mélange</a><a class="btn-line" href="defi.html">Défi du jour</a></div>
</div>
</section>
<section aria-label="Jeux disponibles" class="{W} pt-12 lg:pt-16">
<div class="lib-bar">
<div aria-label="Filtrer par discipline" class="lib-chips" role="group">{chips}</div>
<div class="lib-level">{seg("level", [("all", "Tous"), ("debutant", "Débutant"), ("intermediaire", "Intermédiaire"), ("avance", "Avancé")], "all")}<span aria-live="polite" class="text-body-sm text-text-muted tabular whitespace-nowrap" id="filter-count">{len(GAMES)} jeux</span></div>
</div>
<div id="games-list" role="list">{"".join(row(g) for g in GAMES)}</div>
<div class="hidden py-14" id="no-results"><p class="text-headline-sm">Aucun jeu ne correspond à ces filtres.</p><button class="btn-quiet mt-2 text-[15px] font-medium" id="reset-filters" type="button">Réinitialiser les filtres</button></div>
</section>
<section class="{W} pt-20 lg:pt-28 scroll-mt-20" id="melange">
<div class="panel-line bg-white p-5 sm:p-10 grid lg:grid-cols-12 gap-8">
<div class="lg:col-span-4">
<h2 class="text-big">Mélange</h2>
<p class="mt-4 text-body-md text-on-surface-variant max-w-[26rem]">Choisis tes jeux : chaque manche en tire un différent. Idéal pour s'échauffer, ou pour défier un ami avec le lien envoyé à la fin.</p>
</div>
<form class="lg:col-span-8 flex flex-col gap-5" id="mix-form">
<fieldset><legend class="text-body-sm text-text-muted mb-2">Jeux inclus <button class="underline ml-2" id="mix-all" type="button">tout cocher</button><button class="underline ml-2" id="mix-none" type="button">tout décocher</button></legend>
<div class="flex flex-wrap gap-2">{mixchips}</div><p class="mt-3 text-body-sm text-text-muted" hidden="" id="mix-pro-note">Les jeux avec un cadenas font partie d'<a class="underline" href="tarifs.html#pro">Œil Pro</a>. Les autres sont gratuits.</p></fieldset>
<div class="flex flex-wrap items-center gap-4">
{seg("rounds", [("5", "5"), ("8", "8"), ("10", "10"), ("15", "15")], "8", "Manches")}
<button class="btn" type="submit">Lancer le mélange<span aria-hidden="true" class="material-symbols-outlined text-[18px]">play_arrow</span></button>
<span class="text-body-sm text-text-muted" id="mix-msg"></span>
</div>
</form>
</div>
</section>
<div class="pb-24 lg:pb-32"></div>
</main>
{FOOTER}
<script src="assets/catalog.js"></script>
<script src="assets/account.js"></script>
<script>window.OEIL_DOMAINS_KEYS = Object.keys(window.OEIL_DOMAINS);</script>
<script>
  (function () {{
    const wanted = new URLSearchParams(location.search).get("d");
    const state = {{ domain: wanted && (wanted === "all" || window.OEIL_DOMAINS_KEYS.includes(wanted)) ? wanted : "typo", level: "all" }};
    const rows = [...document.querySelectorAll("#games-list .game-row")];
    const chips = [...document.querySelectorAll(".chip")];
    const levels = [...document.querySelectorAll('input[name="level"]')];
    const count = document.getElementById("filter-count");
    const empty = document.getElementById("no-results");
    function apply() {{
      let n = 0;
      rows.forEach((r) => {{
        const ok = (state.domain === "all" || r.dataset.domain === state.domain) && (state.level === "all" || r.dataset.level === "all" || r.dataset.level === state.level);
        r.classList.toggle("hidden", !ok); if (ok) n++;
      }});
      chips.forEach((c) => {{ const on = c.dataset.domain === state.domain; c.setAttribute("aria-pressed", String(on)); c.classList.toggle("bg-ink", on); c.classList.toggle("text-white", on); }});
      count.textContent = n + (n > 1 ? " jeux" : " jeu");
      empty.classList.toggle("hidden", n > 0);
    }}
    chips.forEach((c) => c.addEventListener("click", () => {{ state.domain = c.dataset.domain; apply(); }}));
    levels.forEach((r) => r.addEventListener("change", () => {{ state.level = r.value; apply(); }}));
    document.getElementById("reset-filters").addEventListener("click", () => {{ state.level = "all"; levels[0].checked = true; apply(); }});
    apply();
    // Composer un mélange : les jeux Pro sont verrouillés sans l'offre Pro
    const pro = window.OeilAccount && window.OeilAccount.isPro();
    document.querySelectorAll("#mix-form input[data-pro]").forEach((b) => {{
      if (pro) return;
      b.checked = false; b.disabled = true; b.parentElement.title = "Jeu Pro";
      b.parentElement.addEventListener("click", () => {{ document.getElementById("mix-msg").innerHTML = `Le cadenas indique un jeu Pro. <a class="underline" href="tarifs.html#pro">Passe à Pro</a> pour l'ajouter à tes mélanges.`; }});
    }});
    if (!pro) document.getElementById("mix-pro-note").hidden = false;
    const boxes = [...document.querySelectorAll("#mix-form input[type=checkbox]:not(:disabled)")];
    document.getElementById("mix-all").onclick = () => boxes.forEach((b) => (b.checked = true));
    document.getElementById("mix-none").onclick = () => boxes.forEach((b) => (b.checked = false));
    document.getElementById("mix-form").addEventListener("submit", (e) => {{
      e.preventDefault();
      const ids = boxes.filter((b) => b.checked).map((b) => b.value);
      if (ids.length < 2) {{ document.getElementById("mix-msg").textContent = "Choisis au moins deux jeux."; return; }}
      location.href = `defi.html?jeux=${{ids.join(",")}}&manches=${{document.querySelector('input[name="rounds"]:checked').value}}`;
    }});
  }})();
</script>
<script src="assets/site.js"></script>
</body></html>
'''
(site / "jeux.html").write_text(JEUX)

# ---------------------------------------------------------------- Accueil
def disc_card(k, d):
    lst = [g for g in GAMES if g["domain"] == k]
    items = "".join(f'<li><a href="{g["id"]}.html"><span>{g["name"]}</span><span aria-hidden="true" class="material-symbols-outlined">arrow_forward</span></a></li>' for g in lst[:5])
    return f'''<div class="disc-card" style="--field:{d["field"]}">
<p class="disc-head"><span class="board-dot"></span>{d["label"]}</p>
<ul>{items}</ul>
<a class="disc-more" href="jeux.html?d={k}">{"+ " + str(len(lst) - 5) + " autres jeux" if len(lst) > 5 else "Voir la discipline"}<span aria-hidden="true" class="material-symbols-outlined">arrow_forward</span></a>
</div>'''
by_domain = "".join(disc_card(k, d) for k, d in DOMAINS.items())
INDEX = f'''{page_head("Œil Studio — Affine ton œil")}
<body class="bg-ground text-ink">
{SKIP}
{header()}
<main class="pt-16" id="contenu">
<section class="{W} pt-6 lg:pt-10">
<div class="dot-board">
<p class="board-strip"><span class="board-dot"></span>Le terrain d'entraînement des designers · {len(GAMES)} jeux · gratuit, sans compte</p>
<div class="grid lg:grid-cols-12 gap-10 lg:gap-8 items-end px-5 sm:px-10 pt-16 lg:pt-20 pb-8 lg:pb-12">
<div class="lg:col-span-7">
<h1 class="text-[clamp(4.25rem,9.6vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.06em] reveal">Affine<br/>ton œil.</h1>
<p class="reveal mt-8 max-w-[32rem] text-[20px] sm:text-[22px] leading-[1.4] tracking-[-0.012em]" style="--d:80ms">Des mini-jeux de 2 à 5 minutes sur la typo, la couleur, la composition, l'UI, l'UX et le mouvement. Tu fais le geste, puis tu vois l'écart exact.</p>
<div class="reveal mt-8 flex flex-wrap items-center gap-3" style="--d:160ms">
<a class="btn" href="jeux.html">Choisir un jeu<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
<a class="btn-line" href="defi.html">Défi du jour</a>
</div>
</div>
<div class="lg:col-span-5 reveal" style="--d:220ms">
<div class="quiz-card">
<p class="text-body-sm text-ink/70">Test éclair, sans inscription</p>
<h2 class="mt-1 text-[24px] sm:text-[28px] font-medium tracking-[-0.03em] leading-tight">Lequel est centré à l'œil ?</h2>
<div class="mt-5 grid grid-cols-2 gap-3">
<button aria-pressed="false" class="quiz-opt" id="quiz-btn-a" onclick="testEye('A')" type="button"><span class="quiz-fake"><span>Valider</span><span class="material-symbols-outlined text-[16px] pl-2">check</span></span><span class="text-body-sm font-medium">A</span></button>
<button aria-pressed="false" class="quiz-opt" id="quiz-btn-b" onclick="testEye('B')" type="button"><span class="quiz-fake"><span>Valider</span><span class="material-symbols-outlined text-[16px]">check</span></span><span class="text-body-sm font-medium">B</span></button>
</div>
<div aria-live="polite" class="hidden mt-5" id="quiz-feedback"><p class="font-medium text-[17px]" id="feedback-verdict"></p><p class="mt-1 text-body-sm" id="feedback-expl"></p><a class="btn-quiet inline-block mt-3 text-[14px] font-medium" href="optical-center.html">Jouer à Optical Center</a></div>
</div>
</div>
</div>
</div>
</section>

<section class="{W} py-24 lg:py-32 scroll-mt-20" id="jeux">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-12">
<h2 class="text-big max-w-[12ch] reveal">{len(GAMES)} jeux, 6 disciplines.</h2>
<a class="btn-line w-max reveal" href="jeux.html">Toute la bibliothèque</a>
</div>
<div class="disc-grid reveal" style="--d:80ms">{by_domain}</div>
</section>

<section class="{W} pb-24 lg:pb-32 grid lg:grid-cols-2 gap-4 lg:gap-6" id="defi">
<a class="feature-card reveal" href="defi.html" style="--field:#F7B4CC">
<p class="feature-kicker"><span class="board-dot"></span>Chaque jour à minuit</p>
<h2 class="feature-title">Le défi du <span data-today="long">jour</span></h2>
<p class="feature-text">Six manches, une par discipline, avec le même tirage pour tout le monde. Garde ta série et compare ton score avec tes amis.</p>
<span class="btn w-max mt-auto">Relever le défi<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></span>
</a>
<a class="feature-card reveal" href="jeux.html#melange" style="--field:#B9D9FF;--d:80ms">
<p class="feature-kicker"><span class="board-dot"></span>Entre amis</p>
<h2 class="feature-title">Défie qui tu veux.</h2>
<p class="feature-text">Compose un mélange de jeux, joue, puis envoie le lien : ton ami rejoue exactement les mêmes manches et vous comparez vos scores.</p>
<span class="btn w-max mt-auto">Composer un mélange<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></span>
</a>
</section>

<section class="bg-ink text-ground">
<div class="{W} py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-8 items-end">
<div class="lg:col-span-7">
<h2 class="text-big reveal">Pour les écoles.</h2>
<p class="reveal mt-6 max-w-[36rem] text-body-lg text-ground/85" style="--d:80ms">Projette un code et un QR code : la classe rejoint la partie depuis ses téléphones, tout le monde joue les mêmes manches et le classement s'affiche en direct.</p>
</div>
<div class="lg:col-span-5 flex flex-wrap gap-3 lg:justify-end reveal" style="--d:140ms"><a class="btn btn-invert" href="live.html">Lancer une partie en direct</a><a class="btn-quiet text-ground text-[15px] font-medium" href="profs.html">L'offre écoles</a></div>
</div>
</section>

<section class="{W} py-24 lg:py-32" id="methode">
<div class="grid lg:grid-cols-12 gap-10 lg:gap-8 items-center">
<div class="lg:col-span-5">
<h2 class="text-big reveal">Joue, compare, comprends.</h2>
<p class="reveal mt-5 max-w-[30rem] text-body-lg" style="--d:60ms">Chaque manche suit les mêmes trois temps. Exemple avec Spacing Repair, sur une carte produit.</p>
<div class="method-steps reveal" role="tablist" aria-label="Les trois temps d'une manche" style="--d:120ms">
<button aria-selected="true" class="method-step" data-step="0" role="tab" type="button"><b>1</b><span><strong>Le geste</strong><small>Tu étires les écarts à l'œil, sans valeur affichée.</small></span></button>
<button aria-selected="false" class="method-step" data-step="1" role="tab" type="button"><b>2</b><span><strong>L'écart</strong><small>La correction se pose sur ta version, au pixel près.</small></span></button>
<button aria-selected="false" class="method-step" data-step="2" role="tab" type="button"><b>3</b><span><strong>Le principe</strong><small>La règle en jeu est nommée, pour la retenir.</small></span></button>
</div>
</div>
<div class="lg:col-span-7 reveal" style="--d:160ms">
<div class="dot-board method-board" data-step="0" id="method-board">
<p class="board-strip"><span class="board-dot" style="background:#B9D9FF"></span><span id="method-label">Le geste : à toi de recaler les écarts</span></p>
<div class="method-stage">
<div class="method-card">
<span class="method-tag">Édition print</span><span class="method-gap" data-g="0"><i></i></span>
<span class="method-title">Typographie suisse</span><span class="method-gap" data-g="1"><i></i></span>
<span class="method-text">Une anthologie des grilles modulaires et des casses asymétriques des années 1960.</span><span class="method-gap" data-g="2"><i></i></span>
<span class="method-btn">Ajouter au panier</span>
</div>
<p class="method-principle"><b>Proximité.</b> Ce qui va ensemble est plus proche que ce qui est séparé : le titre colle à sa description, le bouton s'en détache.</p>
</div>
<div class="method-foot"><a class="btn-line btn-sm" href="spacing-repair.html">Jouer à Spacing Repair</a></div>
</div>
</div>
</div>
</section>

<section class="{W} pb-24 lg:pb-32">
<div class="course-banner reveal">
<div class="course-copy">
<p class="feature-kicker"><span class="board-dot"></span>Programme guidé · 14 jours</p>
<h2 class="feature-title">14 jours pour composer juste.</h2>
<p class="feature-text">Chaque jour, un principe, un jeu pour le sentir et une fiche pour le retenir. Dix minutes suffisent.</p>
<ul class="course-list"><li>14 défis commentés, dans l'ordre</li><li>Fiches de synthèse à garder</li><li>Certificat de fin de parcours</li></ul>
</div>
<div class="course-price">
<p class="text-body-sm text-text-muted">Paiement unique</p>
<p class="course-amount tabular">19 €</p>
<p class="text-body-sm">Accès à vie, sans abonnement.</p>
<a class="btn w-full mt-auto" href="abonnement.html?plan=parcours">Acheter le parcours</a>
<a class="btn-quiet text-[14px] font-medium w-max" href="parcours.html">Voir le programme jour par jour</a>
</div>
</div>
</section>

<section class="{W} pb-24 lg:pb-36 grid lg:grid-cols-12 gap-10 lg:gap-8 items-start scroll-mt-16" id="faq">
<h2 class="lg:col-span-5 text-big reveal">Questions fréquentes</h2>
<div class="lg:col-span-7 reveal" style="--d:80ms">
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Faut-il être designer senior pour s'entraîner ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Non. Chaque jeu a un niveau indiqué et une aide au premier lancement. Étudiant, développeur front ou directrice artistique : la correction est claire et sans jugement.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Comment défier un ami ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">À la fin d'une session, écris ton prénom et copie le lien de défi. Ton ami rejoue exactement les mêmes manches et voit ton score à battre.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Mon écran fausse-t-il les couleurs ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Un peu : la perception varie avec le calibrage et la luminosité. Les jeux de couleur comparent ta réponse à la cible sur le même écran, avec une tolérance dans le score.</p></details>
<details class="faq border-y border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Qu'est-ce qui est gratuit ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">{sum(1 for g in GAMES if not g["pro"])} jeux, le défi du jour (jeux Pro compris), les défis entre amis et les parties en direct sont gratuits, sans compte. <a class="underline" href="tarifs.html">Œil Pro</a> ouvre les {len(GAMES)} jeux pour 3 € par mois.</p></details>
</div>
</section>
</main>
{FOOTER}
<script>
  function testEye(choice) {{
    const ok = choice === "B";
    document.getElementById("quiz-feedback").classList.remove("hidden");
    document.getElementById("feedback-verdict").textContent = ok ? "Bien vu : B est centré à l'œil." : "Piège classique : A est centré au calcul, pas à l'œil.";
    document.getElementById("feedback-expl").textContent = ok
      ? "L'icône à droite alourdit le bouton. B la rapproche du texte pour garder le centre de gravité ressenti au milieu."
      : "Les marges de A sont égales dans le code, mais l'icône éloignée tire le regard vers la droite. L'œil demande une compensation.";
    document.querySelectorAll(".quiz-opt").forEach((b) => b.setAttribute("aria-pressed", String(b.id === "quiz-btn-" + choice.toLowerCase())));
  }}
  // Démonstration de la méthode : trois états de la même carte, qui défilent seuls jusqu'au premier clic.
  (function () {{
    const board = document.getElementById("method-board"), steps = [...document.querySelectorAll(".method-step")];
    const gaps = [[26, 22, 38], [26, 22, 38], [16, 4, 18]], target = [16, 4, 18];
    const labels = ["Le geste : à toi de recaler les écarts", "L'écart : la correction se pose sur ta version", "Le principe : la règle en jeu est nommée"];
    let cur = 0, auto = true, timer;
    function go(n) {{
      cur = n; board.dataset.step = n;
      steps.forEach((b, i) => b.setAttribute("aria-selected", String(i === n)));
      document.getElementById("method-label").textContent = labels[n];
      document.querySelectorAll(".method-gap").forEach((g, i) => {{ g.style.height = gaps[n][i] + "px"; g.querySelector("i").textContent = n === 1 ? `${{gaps[0][i]}} → ${{target[i]}}` : ""; }});
    }}
    steps.forEach((b) => b.addEventListener("click", () => {{ auto = false; clearInterval(timer); go(+b.dataset.step); }}));
    go(0);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) timer = setInterval(() => auto && go((cur + 1) % 3), 3600);
  }})();
</script>
<script src="assets/site.js"></script>
</body></html>
'''
(site / "index.html").write_text(INDEX)

# ---------------------------------------------------------------- Écoles
gamechecks = "".join(f'<label class="mix-chip"><input{CHK if g["id"] in ("kern-clinic", "color-recall", "spacing-repair", "contrast-rescue", "easing-lab") else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}</span></label>' for g in GAMES)
PROFS = f'''{page_head("Œil Studio pour les écoles")}
<body class="bg-ground text-ink">
{SKIP}
{header("profs")}
<main class="pt-16" id="contenu">
<section class="{W} pt-6 lg:pt-10">
<div class="dot-board px-5 sm:px-10 pt-16 pb-10 lg:pb-14 grid lg:grid-cols-12 gap-8 items-end">
<p class="board-strip"><span class="board-dot" style="background:#B9D9FF"></span>Écoles de design, BTS, DN MADE, masters, universités</p>
<div class="lg:col-span-8">
<h1 class="text-big reveal">Échauffe toute ta classe en cinq minutes.</h1>
<p class="reveal mt-6 max-w-[38rem] text-body-lg" style="--d:80ms">Une session, un lien, et chaque étudiant joue les mêmes manches sur son poste ou son téléphone. Pas de compte élève : le classement se construit à partir des codes résultats.</p>
</div>
<div class="lg:col-span-4 flex flex-wrap gap-3 lg:justify-end reveal" style="--d:140ms"><a class="btn" href="live.html">Lancer une partie en direct</a><a class="btn-line" href="#offres">Voir les offres</a></div>
</div>
</section>

<section class="{W} py-20 lg:py-28">
<h2 class="text-big mb-10 lg:mb-14 reveal">En cours, en trois temps.</h2>
<div class="grid md:grid-cols-3 gap-4 reveal" style="--d:80ms">
<div class="panel-line bg-white p-6"><span aria-hidden="true" class="step-icon material-symbols-outlined">timer</span><p class="mt-4 font-medium text-[20px]">L'échauffement</p><p class="mt-2 text-body-sm text-on-surface-variant">Cinq minutes en début de cours de typo ou de composition : le regard est frais, la classe est concentrée.</p></div>
<div class="panel-line bg-white p-6"><span aria-hidden="true" class="step-icon material-symbols-outlined">swords</span><p class="mt-4 font-medium text-[20px]">Le défi collectif</p><p class="mt-2 text-body-sm text-on-surface-variant">Tout le monde joue le même tirage. À la fin, chacun t'envoie son code résultat.</p></div>
<div class="panel-line bg-white p-6"><span aria-hidden="true" class="step-icon material-symbols-outlined">leaderboard</span><p class="mt-4 font-medium text-[20px]">La correction commentée</p><p class="mt-2 text-body-sm text-on-surface-variant">Projette le classement et la manche la plus ratée : c'est le point de départ de ton cours.</p></div>
</div>
</section>

<section class="{W} pb-20 lg:pb-28">
<div class="live-promo panel-line p-5 sm:p-10 grid lg:grid-cols-12 gap-8 items-center">
<div class="lg:col-span-7">
<p class="feature-kicker"><span class="board-dot" style="background:#fff"></span>En direct, comme un quiz en classe</p>
<h2 class="text-headline-lg-mobile md:text-headline-xl mt-3">Un code, un QR code, toute la classe joue.</h2>
<p class="mt-4 text-body-lg max-w-[36rem]">Tu projettes l'écran de l'hôte. Les étudiants scannent le QR code ou tapent le code sur rejoindre.html, entrent leur prénom, et attendent ton signal. Chaque manche met à jour le classement à l'écran, jusqu'au podium.</p>
<div class="mt-6 flex flex-wrap gap-3"><a class="btn" href="live.html">Créer une partie</a><a class="btn-line" href="rejoindre.html">Page à donner aux étudiants</a></div>
</div>
<ul class="lg:col-span-5 step-list"><li><span aria-hidden="true" class="material-symbols-outlined">tune</span><span>Tu choisis les jeux et le nombre de manches.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">qr_code_2</span><span>Le code et le QR code s'affichent : la salle d'attente se remplit.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">play_arrow</span><span>Tu lances : tout le monde joue le même tirage.</span></li><li><span aria-hidden="true" class="material-symbols-outlined">leaderboard</span><span>Le classement évolue à chaque manche, puis le podium.</span></li></ul>
</div>
</section>

<section class="{W} pb-20 lg:pb-28 scroll-mt-20" id="session">
<div class="panel-line bg-white p-5 sm:p-10 grid lg:grid-cols-12 gap-8">
<div class="lg:col-span-4">
<h2 class="text-headline-lg-mobile md:text-headline-lg">Session en différé</h2>
<p class="mt-4 text-body-md text-on-surface-variant">Pour un devoir ou un échauffement à faire chez soi : un lien à partager (ENT, Teams…), chacun joue quand il veut et t'envoie son code résultat.</p>
</div>
<form class="lg:col-span-8 flex flex-col gap-5" id="class-form">
<label class="grid gap-1 text-body-sm text-text-muted">Nom de la session<input class="h-11 rounded border border-ink bg-white px-3 text-[16px] text-ink" id="class-title" placeholder="Ex. : DN MADE 2 — typo, mardi" required="" type="text"/></label>
<fieldset><legend class="text-body-sm text-text-muted mb-2">Jeux</legend><div class="flex flex-wrap gap-2">{gamechecks}</div></fieldset>
<div class="flex flex-wrap items-center gap-4">
{seg("class-rounds", [("5", "5"), ("8", "8"), ("10", "10")], "8", "Manches")}
<button class="btn" type="submit">Générer le lien de la session</button>
</div>
<div class="sum-share-out" hidden="" id="class-out">
<span>Lien à partager avec la classe :</span>
<input aria-label="Lien de la session" readonly="" type="text"/>
<p class="text-body-sm text-text-muted">Code de session : <b id="class-code"></b>. Tous les étudiants jouent le même tirage.</p>
<div class="flex flex-wrap gap-2 mt-1"><button class="btn-line btn-sm" id="class-copy" type="button">Copier le lien</button><a class="btn-line btn-sm" id="class-try" target="_blank">Tester la session</a></div>
</div>
</form>
</div>
</section>

<section class="{W} pb-20 lg:pb-28 scroll-mt-20" id="classement">
<div class="panel-line bg-white p-5 sm:p-10 grid lg:grid-cols-12 gap-8">
<div class="lg:col-span-4">
<h2 class="text-headline-lg-mobile md:text-headline-lg">Classement</h2>
<p class="mt-4 text-body-md text-on-surface-variant">Colle les codes résultats envoyés par tes étudiants, un par ligne. Le classement reste enregistré dans ce navigateur.</p>
</div>
<div class="lg:col-span-8 flex flex-col gap-4">
<textarea class="min-h-[120px] rounded border border-ink bg-white p-3 text-[14px]" id="codes" placeholder="Colle ici les codes résultats…"></textarea>
<div class="flex flex-wrap gap-2"><button class="btn" id="codes-add" type="button">Ajouter au classement</button><button class="btn-line" id="codes-csv" type="button">Exporter en CSV</button><button class="btn-quiet text-[14px]" id="codes-clear" type="button">Vider</button><span class="text-body-sm text-text-muted self-center" id="codes-msg"></span></div>
<div class="overflow-x-auto"><table class="rank-table"><thead><tr><th>Rang</th><th>Étudiant</th><th>Session</th><th>Score</th><th>Manches</th></tr></thead><tbody id="rank-body"><tr><td class="text-text-muted" colspan="5">Aucun résultat pour l'instant.</td></tr></tbody></table></div>
</div>
</div>
</section>

<section class="{W} pb-24 lg:pb-32 scroll-mt-20" id="offres">
<div class="course-banner" style="--field:#B9D9FF">
<div class="course-copy">
<p class="feature-kicker"><span class="board-dot"></span>Offres pour les classes et les écoles</p>
<h2 class="feature-title">Gratuit pour essayer, payant pour suivre.</h2>
<p class="feature-text">Les parties en direct et les sessions par lien sont gratuites. L'offre Classe ajoute les comptes étudiants, le classement automatique et le suivi sur l'année ; l'offre École couvre toute l'équipe.</p>
</div>
<div class="course-price">
<p class="text-body-sm text-text-muted">Classe</p><p class="course-amount tabular">9 €<small>/mois</small></p>
<p class="text-body-sm">par enseignant · École dès 690 €/an</p>
<a class="btn w-full mt-auto" href="tarifs.html#ecoles">Voir les tarifs écoles</a>
<a class="btn-quiet text-[14px] font-medium w-max" href="contact.html?offre=ecole">Demander un devis</a>
</div>
</div>
</section>
</main>
{FOOTER}
<script>
  (function () {{
    const S = window.OEIL_SEED;
    // Créer une session
    const form = document.getElementById("class-form");
    form.addEventListener("submit", (e) => {{
      e.preventDefault();
      const ids = [...form.querySelectorAll("input[type=checkbox]:checked")].map((b) => b.value);
      if (!ids.length) return;
      const title = document.getElementById("class-title").value.trim();
      const cls = Math.random().toString(36).slice(2, 7).toUpperCase();
      const payload = {{ seed: Math.floor(Math.random() * 1e9), ids, rounds: +document.querySelector('input[name="class-rounds"]:checked').value, cls, title }};
      const link = location.href.split("#")[0].replace(/profs\\.html.*$/, "defi.html") + "#c=" + S.encode(payload);
      const out = document.getElementById("class-out");
      out.hidden = false;
      out.querySelector("input").value = link;
      document.getElementById("class-code").textContent = cls;
      document.getElementById("class-try").href = link;
    }});
    document.getElementById("class-copy").addEventListener("click", async () => {{
      const input = document.querySelector("#class-out input");
      try {{ await navigator.clipboard.writeText(input.value); document.getElementById("class-copy").textContent = "Lien copié"; }} catch (e) {{ input.select(); }}
    }});
    // Classement à partir des codes résultats
    const KEY = "oeil:class-results";
    const load = () => {{ try {{ return JSON.parse(localStorage.getItem(KEY)) || []; }} catch (e) {{ return []; }} }};
    const save = (rows) => {{ try {{ localStorage.setItem(KEY, JSON.stringify(rows)); }} catch (e) {{}} }};
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({{ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }}[c]));
    let rows = load();
    function render() {{
      const body = document.getElementById("rank-body");
      if (!rows.length) {{ body.innerHTML = '<tr><td class="text-text-muted" colspan="5">Aucun résultat pour l\\'instant.</td></tr>'; return; }}
      const sorted = [...rows].sort((a, b) => b.score - a.score);
      body.innerHTML = sorted.map((r, i) => `<tr><td>${{i + 1}}</td><td>${{esc(r.name)}}</td><td>${{esc(r.cls)}}</td><td><b>${{r.score}} %</b></td><td>${{(r.scores || []).join(" · ")}}</td></tr>`).join("");
    }}
    document.getElementById("codes-add").addEventListener("click", () => {{
      const lines = document.getElementById("codes").value.split(/\\s+/).filter(Boolean);
      let ok = 0, bad = 0;
      lines.forEach((l) => {{
        const r = S.decode(l.trim());
        if (r && r.cls && r.name != null && typeof r.score === "number") {{
          rows = rows.filter((x) => !(x.cls === r.cls && x.name === r.name));
          rows.push({{ cls: r.cls, name: String(r.name).slice(0, 24), score: Math.max(0, Math.min(100, Math.round(r.score))), scores: (r.scores || []).slice(0, 20).map((n) => Math.round(+n) || 0) }});
          ok++;
        }} else bad++;
      }});
      save(rows); render();
      document.getElementById("codes").value = "";
      document.getElementById("codes-msg").textContent = `${{ok}} ajouté${{ok > 1 ? "s" : ""}}${{bad ? `, ${{bad}} code${{bad > 1 ? "s" : ""}} illisible${{bad > 1 ? "s" : ""}}` : ""}}.`;
    }});
    document.getElementById("codes-clear").addEventListener("click", () => {{ rows = []; save(rows); render(); }});
    document.getElementById("codes-csv").addEventListener("click", () => {{
      const csv = "rang;etudiant;session;score;manches\\n" + [...rows].sort((a, b) => b.score - a.score).map((r, i) => [i + 1, r.name, r.cls, r.score, (r.scores || []).join(" ")].join(";")).join("\\n");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([csv], {{ type: "text/csv" }}));
      a.download = "classement-oeil-studio.csv"; a.click();
    }});
    render();
  }})();
</script>
<script src="assets/site.js"></script>
</body></html>
'''
(site / "profs.html").write_text(PROFS)

# ---------------------------------------------------------------- Parcours
DAYS = [
    ("kern-clinic", "Le crénage optique", "On juge des surfaces de blanc, pas des distances."),
    ("optical-center", "Le centre optique", "La masse d'une forme déplace son centre perçu."),
    ("spacing-repair", "La proximité", "Ce qui va ensemble est plus proche que ce qui est séparé."),
    ("color-recall", "La mémoire des couleurs", "On se souvient des couleurs plus vives qu'elles ne sont."),
    ("lightness-ladder", "La clarté perçue", "Un jaune paraît toujours plus clair qu'un bleu."),
    ("contrast-rescue", "Le contraste lisible", "4,5:1 pour le texte courant, 3:1 pour le grand texte."),
    ("leading-lab", "L'interlignage", "Plus le corps grandit, plus l'interlignage se resserre."),
    ("weight-match", "La graisse et la taille", "À graisse égale, un grand mot paraît plus noir."),
    ("alignment-hunter", "Les alignements", "Deux pixels suffisent à casser une colonne."),
    ("balance-lab", "L'équilibre des masses", "Un petit poids loin du centre compense un gros poids proche."),
    ("pixel-guess", "Les étalons de taille", "On estime mieux par comparaison qu'en valeur absolue."),
    ("token-detective", "Le design system", "Une valeur hors système en appelle d'autres."),
    ("hue-line", "Les écarts de teinte", "On compare mieux deux voisines que deux extrêmes."),
    ("easing-lab", "Le mouvement naturel", "Rien ne démarre ni ne s'arrête sans accélérer."),
]
gm = {g["id"]: g for g in GAMES}
days_html = "".join(f'''<li class="day-row" style="--field:{DOMAINS[gm[gid]["domain"]]["field"]}"><span class="day-num">Jour {i + 1}</span><span class="day-title">{t}</span><span class="day-text">{p}</span><a class="day-game" href="{gid}.html"><i></i>{gm[gid]["name"]}</a></li>''' for i, (gid, t, p) in enumerate(DAYS))
PARCOURS = f'''{page_head("L'œil UI, le parcours — Œil Studio")}
<body class="bg-ground text-ink">
{SKIP}
{header("parcours")}
<main class="pt-16" id="contenu">
<section class="{W} pt-6 lg:pt-10">
<div class="dot-board px-5 sm:px-10 pt-16 pb-10 lg:pb-14 grid lg:grid-cols-12 gap-8 items-end">
<p class="board-strip"><span class="board-dot" style="background:#D8EF71"></span>L'œil UI · programme guidé</p>
<div class="lg:col-span-8">
<h1 class="text-big reveal">14 jours pour composer juste.</h1>
<p class="reveal mt-6 max-w-[38rem] text-body-lg" style="--d:80ms">Chaque jour, un principe, un jeu pour le sentir et une fiche pour le retenir. Dix minutes par jour, et à la fin, des décisions de mise en page que tu sais justifier.</p>
</div>
<div class="lg:col-span-4 panel-line bg-white p-6 reveal" style="--d:140ms">
<p class="text-[88px] font-medium tracking-[-0.06em] leading-[0.9] tabular">19 €</p>
<p class="mt-3 text-body-sm">TTC, payé une fois. Accès à vie, sans abonnement. Inclus dans Œil Pro.</p>
<a class="btn w-full mt-6" href="abonnement.html?plan=parcours">Acheter le parcours</a>
<p class="mt-3 text-body-sm text-text-muted">Remboursé sous 14 jours si ça ne te convient pas.</p>
</div>
</div>
</section>
<section class="{W} py-20 lg:py-28">
<h2 class="text-big mb-10 lg:mb-14 reveal">Le programme.</h2>
<ol class="day-list reveal" style="--d:80ms">{days_html}</ol>
<p class="mt-6 text-body-sm text-text-muted">Tous ces jeux sont déjà jouables gratuitement. Le parcours ajoute l'ordre, les fiches de synthèse, les corrections commentées et le certificat de fin.</p>
</section>
</main>
{FOOTER}
<script src="assets/site.js"></script>
</body></html>
'''
(site / "parcours.html").write_text(PARCOURS)
print("ok")
