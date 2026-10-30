import pathlib, re, sys, json
site = pathlib.Path(sys.argv[1]); SP = pathlib.Path(sys.argv[2])
src = (SP / "redesign.py").read_text()
ns = {"__name__": "lib", "sys": sys}
exec(compile(src.split("# ---------------------------------------------------------------- Accueil")[0], "redesign", "exec"), ns)
head, header, FOOTER, W = ns["head"], ns["header"], ns["FOOTER"], ns["W"]

cat = (site / "assets/catalog.js").read_text()
DOMAINS = {m[0]: {"label": m[1], "field": m[2]} for m in re.findall(r'(\w+): \{ label: "([^"]+)", field: "(#[0-9A-F]+)" \}', cat)}
GAMES = [dict(zip(("id", "name", "domain", "level", "min", "desc", "pro"), m[:6] + (bool(m[6]),))) for m in re.findall(r'\{ id: "([^"]+)", name: "([^"]+)", domain: "([^"]+)", level: "([^"]+)", min: (\d+), desc: "([^"]+)"(, pro: true)? \}', cat)]
assert len(GAMES) == 48, len(GAMES)
LEVEL_KEY = {"Débutant": "debutant", "Intermédiaire": "intermediaire", "Avancé": "avance", "Tous niveaux": "all"}
CUR, CHK, MIXA = ' aria-current="page"', ' checked=""', ' data-mix=""'
MAIL = "bonjour@oeil.studio"  # adresse provisoire, à remplacer
SKIP = '<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] btn" href="#contenu">Aller au contenu</a>'

def page_head(title, kern=False, daily=False, desc=None):
    hd = head(title, kern=kern, desc=desc or ns["DESC"])
    if daily: hd = hd.replace('<html lang="fr">', '<html data-daily="1" lang="fr">')
    return hd

def seg(name, values, checked, label=""):
    inner = "".join(f'<label><input{CHK if v == checked else ""} name="{name}" type="radio" value="{v}"/><span>{t}</span></label>' for v, t in values)
    lab = f'<span class="seg-pick-label">{label}</span>' if label else ""
    return f'<span class="flex flex-wrap items-center gap-2">{lab}<span class="seg-pick" role="radiogroup">{inner}</span></span>'

COLS = "grid-cols-[auto_1fr_auto] md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.7fr)_9rem_8rem_1.5rem]"
PRO_BADGE = ' <span class="pro-badge">Pro</span>'
# Le niveau se lit au texte et au nombre de barres, pas seulement à la couleur
def lvl(g):
    n = {"Débutant": 1, "Intermédiaire": 2, "Avancé": 3}.get(g["level"], 0)
    return f' <span class="lvl lvl-{n}">{g["level"]}</span>'
def row(g):
    d = DOMAINS[g["domain"]]
    return f'''<a class="game-row {COLS}" data-domain="{g["domain"]}" data-level="{LEVEL_KEY[g["level"]]}" href="{g["id"]}.html" role="listitem" style="--row:{d["field"]}">
<span aria-hidden="true" class="w-10 h-10 md:w-14 md:h-14 rounded-lg shrink-0 border border-ink" style="background:{d["field"]}"></span>
<span><span class="block text-[22px] md:text-[28px] font-medium tracking-[-0.025em] leading-tight">{g["name"]}{PRO_BADGE if g["pro"] else ""}</span><span class="md:hidden block mt-0.5 text-body-sm text-text-muted">{d["label"]} · {g["min"]} min{lvl(g)}</span></span>
<span class="hidden md:block text-body-md text-on-surface-variant">{g["desc"]}</span>
<span class="hidden md:block text-body-sm">{d["label"]}</span>
<span class="hidden md:flex items-center gap-3 text-body-sm tabular">{g["min"]} min{lvl(g)}</span>
<span aria-hidden="true" class="material-symbols-outlined row-arrow justify-self-end">arrow_forward</span>
</a>'''

SEEDED = lambda gid: f'<script>OEIL_SEED.module("{gid}")</script><script src="assets/games/{gid}.js"></script>\n'
SCRIPTS_ALL = "".join(SEEDED(g["id"]) for g in GAMES)

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
<button aria-label="Accessibilité : daltonisme et contraste" class="btn-line btn-sm" data-vision-open="" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">accessibility_new</span><span class="hidden sm:inline">Accessibilité</span></button>
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
<details class="coach-more"><summary>Voir le détail</summary><ol id="coach-steps"></ol></details>
<button class="btn w-full" id="btn-coach-go" type="button">C'est parti<kbd>Entrée</kbd></button>
</div>
</div>
<div aria-labelledby="paywall-title" class="coach" hidden="" id="paywall" role="dialog">
<div class="coach-card">
<p class="coach-kicker"><span class="pro-badge">Pro</span> Jeu réservé à Œil Pro</p>
<h2 id="paywall-title">{title_html}</h2>
<p class="coach-goal">Ce jeu fait partie d'Œil Pro. Les {sum(1 for x in GAMES if not x["pro"])} jeux gratuits restent ouverts à tous, et ce jeu peut aussi tomber dans le défi du jour.</p>
<ul class="paywall-list"><li>Les 48 jeux, sans limite</li><li>Historique et progression par discipline</li><li>Résiliable à tout moment</li></ul>
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
<p class="unlock-toast" hidden="" id="sum-unlock"></p>
<div class="summary-actions"><button class="btn-line" id="btn-restart" type="button">Rejouer</button>{next_link}</div>
</div>
<div class="sum-right">
<div class="sum-rank" hidden="" id="sum-rank"></div>
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
</div>
</div>
{f'<div class="w-full {W}">{nav}</div>' if nav else ""}'''

# ---------------------------------------------------------------- Pages de jeu
for g in GAMES:
    d = DOMAINS[g["domain"]]
    html = f'''{page_head(g["name"] + " — Œil Studio", kern=g["id"] == "kern-clinic", desc=g["desc"] + " Un mini-jeu Œil Studio pour entraîner ton œil de designer.")}
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
<script src="assets/progress.js"></script>
<script src="assets/engine.js"></script>
<script src="assets/kits.js"></script>
<script src="assets/live.js"></script>
{SEEDED(g["id"])}
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
<section class="{W} pt-6 lg:pt-10 pb-20" hidden="" id="defi-intro">
<div class="dot-board daily-head">
<p class="board-strip"><span class="board-dot" style="background:#F7B4CC"></span><span class="truncate">Défi du jour · le même pour tout le monde</span><span class="daily-next" id="daily-next"></span></p>
<div class="daily-copy">
<p class="daily-date"><span aria-hidden="true" class="material-symbols-outlined">calendar_today</span><span data-today="long">jeudi 29 octobre</span></p>
<h1 class="daily-title">Six manches,<br/>six disciplines.</h1>
<p class="daily-lead">Un jeu tiré au sort dans chaque discipline, environ 15 minutes. Joue-le une fois par jour pour garder ta série, puis compare ton score.</p>
<div class="btn-row mt-8"><button class="btn btn-lg" id="ticket-go" type="button">Commencer le défi<span aria-hidden="true" class="material-symbols-outlined text-[20px]">play_arrow</span></button><a class="btn-line btn-lg" href="jeux.html#melange">Composer mon mélange</a></div>
</div>
<aside class="daily-side">
<dl class="daily-stats">
<div><dt><span aria-hidden="true" class="material-symbols-outlined">local_fire_department</span>Ta série</dt><dd id="ticket-streak">0 jour</dd></div>
<div><dt><span aria-hidden="true" class="material-symbols-outlined">target</span>Aujourd'hui</dt><dd id="ticket-today">à jouer</dd></div>
<div><dt><span aria-hidden="true" class="material-symbols-outlined">timer</span>Durée</dt><dd>15 min</dd></div>
</dl>
<div class="daily-rank">
<div class="flex items-baseline justify-between gap-3"><p class="font-medium">Classement du jour</p><a class="text-[13px] underline" href="classement.html">La semaine</a></div>
<ol class="ticket-rank mt-3" id="ticket-board"><li class="daily-empty">Personne n'a encore joué aujourd'hui. À toi d'ouvrir le classement.</li></ol>
</div>
</aside>
</div>
<div class="daily-program">
<h2 class="daily-sub">Au programme</h2>
<ol class="daily-rounds" id="ticket-games"></ol>
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
<script src="assets/progress.js"></script>
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
      S.module("defi-du-jour");
      ids = Object.keys(window.OEIL_DOMAINS).map((d) => Oeil.pick(games.filter((g) => g.domain === d)).id);
      rounds = ids.length;
      title = "Défi du " + new Date().toLocaleDateString("fr-FR", {{ weekday: "long", day: "numeric", month: "long" }});
      sub = "6 disciplines, le même tirage pour tout le monde";
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
    document.getElementById("ticket-games").innerHTML = ids.map((id, i) => {{ const g = games.find((x) => x.id === id), d = doms[g.domain]; return `<li style="--field:${{d.field}}"><p class="daily-round-top"><b>${{i + 1}}</b><span>${{d.label}}</span></p><div class="daily-round-body"><p class="daily-round-name">${{g.name}}</p><p class="daily-round-desc">${{g.desc}}</p></div></li>`; }}).join("");
    // Compte à rebours jusqu'au prochain défi (minuit)
    const tick = () => {{ const n = new Date(), m = new Date(n); m.setHours(24, 0, 0, 0); const t = Math.max(0, m - n), h = Math.floor(t / 36e5), mi = Math.floor(t / 6e4) % 60; document.getElementById("daily-next").textContent = `Prochain défi dans ${{h}} h ${{String(mi).padStart(2, "0")}}`; }};
    tick(); setInterval(tick, 30000);
    const daily = Oeil.store.get("daily") || {{ streak: 0, last: null, scores: {{}} }};
    const yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = daily.last === S.today || daily.last === yesterday ? daily.streak : 0;
    document.getElementById("ticket-streak").textContent = `${{streak}} jour${{streak > 1 ? "s" : ""}}`;
    if (daily.scores[S.today] != null) document.getElementById("ticket-today").textContent = `${{daily.scores[S.today]}} %`;
    // Classement du jour (comptes connectés)
    if (window.OeilAccount && OeilAccount.enabled) OeilAccount.dailyBoard(S.today).then((rows) => {{
      if (!rows.length) return;
      const me = OeilAccount.get();
      document.getElementById("ticket-board").innerHTML = rows.slice(0, 5).map((r, i) => `<li><span>${{i + 1}}</span>${{OeilAvatar({{ name: r.name, pro: r.pro, avatar: {{ color: r.avatar_color, icon: r.avatar_icon }} }}, "avatar-sm")}}<span class="truncate">${{OeilWho(r.name, r.username)}}${{me && r.name === me.name ? " <small>(moi)</small>" : ""}}</span><b>${{r.best}} %</b></li>`).join("");
    }}).catch(() => {{}});
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
    for k, v in DOMAINS.items())
chips = f'<button aria-pressed="false" class="{CHIP}" data-domain="all" type="button">Tous</button>' + chips
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
<p class="board-strip"><span class="board-dot"></span>{len(GAMES)} jeux · 6 disciplines</p>
<h1 class="text-[clamp(4.25rem,9.6vw,9.5rem)] font-medium leading-[0.88] tracking-[-0.06em] reveal">Bibliothèque</h1>
<p class="mt-6 lg:mt-10 max-w-[38rem] text-[20px] sm:text-[24px] leading-[1.35] tracking-[-0.015em] reveal" style="--d:80ms">Des jeux de 2 à 5 minutes en typographie, couleur, composition, UI, UX et motion. Joue-les un par un, ou mélange-les : une manche, un jeu.</p>
<div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 reveal" style="--d:140ms"><button class="btn" id="rand-game" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">casino</span>Jeu au hasard</button><a class="lib-link" href="#melange">Composer un mélange</a><a class="lib-link" href="live.html">Jouer à plusieurs</a></div>
</div>
</section>
<section aria-label="Jeux disponibles" class="{W} pt-12 lg:pt-16">
<div class="lib-bar">
<div aria-label="Filtrer par discipline" class="lib-chips" role="group">{chips}</div>
<div class="lib-tools">
<label class="lib-pill lib-find"><span aria-hidden="true" class="material-symbols-outlined">search</span><input aria-label="Rechercher un jeu" autocomplete="off" id="game-search" placeholder="Rechercher" type="search"/></label>
<label class="lib-pill"><select aria-label="Filtrer par niveau" id="level-pick"><option value="all">Tous niveaux</option><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option><option value="avance">Avancé</option></select><span aria-hidden="true" class="material-symbols-outlined">expand_more</span></label>
<span aria-live="polite" class="text-body-sm text-text-muted tabular whitespace-nowrap" id="filter-count">{len(GAMES)} jeux</span>
</div>
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
<fieldset><legend class="pick-legend"><span>Jeux inclus</span><button class="btn-line btn-sm" id="mix-rand" type="button"><span aria-hidden="true" class="material-symbols-outlined text-[18px]">casino</span>Aléatoire</button><button class="underline" id="mix-all" type="button">tout cocher</button><button class="underline" id="mix-none" type="button">tout décocher</button></legend>
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
<script src="assets/config.js"></script>
<script src="assets/account.js"></script>
<script>window.OEIL_DOMAINS_KEYS = Object.keys(window.OEIL_DOMAINS);</script>
<script>
  (function () {{
    const wanted = new URLSearchParams(location.search).get("d");
    const state = {{ domain: wanted && (wanted === "all" || window.OEIL_DOMAINS_KEYS.includes(wanted)) ? wanted : "all", level: "all" }};
    const rows = [...document.querySelectorAll("#games-list .game-row")];
    const chips = [...document.querySelectorAll(".chip")];
    const levelPick = document.getElementById("level-pick");
    const count = document.getElementById("filter-count");
    const empty = document.getElementById("no-results");
    const search = document.getElementById("game-search");
    const norm = (t) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    function apply() {{
      let n = 0;
      // Une recherche porte sur tous les jeux, quelle que soit la discipline choisie
      const q = norm(search.value.trim());
      rows.forEach((r) => {{
        const ok = q ? norm(r.textContent).includes(q) : (state.domain === "all" || r.dataset.domain === state.domain) && (state.level === "all" || r.dataset.level === "all" || r.dataset.level === state.level);
        r.classList.toggle("hidden", !ok); if (ok) n++;
      }});
      chips.forEach((c) => {{ const on = c.dataset.domain === state.domain; c.setAttribute("aria-pressed", String(on)); c.classList.toggle("bg-ink", on); c.classList.toggle("text-white", on); }});
      count.textContent = n + (n > 1 ? " jeux" : " jeu");
      empty.classList.toggle("hidden", n > 0);
    }}
    search.addEventListener("input", apply);
    chips.forEach((c) => c.addEventListener("click", () => {{ state.domain = c.dataset.domain; search.value = ""; apply(); }}));
    levelPick.addEventListener("change", () => {{ state.level = levelPick.value; apply(); }});
    document.getElementById("reset-filters").addEventListener("click", () => {{ state.level = "all"; levelPick.value = "all"; search.value = ""; apply(); }});
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
    // Au hasard : parmi les jeux auxquels on a accès
    const allowed = () => boxes.map((b) => b.value);
    const shuffled = (l) => l.map((x) => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
    document.getElementById("rand-game").onclick = () => {{ location.href = `${{shuffled(allowed())[0]}}.html`; }};
    document.getElementById("mix-rand").onclick = () => {{ const n = +document.querySelector('input[name="rounds"]:checked').value, pick = new Set(shuffled(allowed()).slice(0, Math.max(n, 2))); boxes.forEach((b) => (b.checked = pick.has(b.value))); }};
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

DEMOS = {
    "typo": ('<span class="demo-fixed">A</span><span class="demo-obj">V</span>', "--t0:translateX(26px);--t1:translateX(16px);--t2:translateX(0)", ("Geste : tu rapproches le V", "Écart : encore 10 px de trop", "Principe : on égalise les blancs")),
    "color": ('<span class="demo-ref"></span><span class="demo-obj"></span>', "--c0:#7FB23A;--c1:#A9C94F;--c2:#D8EF71", ("Geste : tu ajustes la teinte", "Écart : 12° de différence", "Principe : la teinte se juge à côté d'une référence")),
    "layout": ('<span class="demo-cols"><i></i><i></i><i></i><i></i></span><span class="demo-obj"></span>', "--t0:translateX(-34px);--t1:translateX(-14px);--t2:translateX(-24px)", ("Geste : tu déplaces le bloc", "Écart : 10 px hors de la colonne", "Principe : les bords suivent la grille")),
    "ui": ('<span class="demo-btn"><span class="demo-obj">Valider</span></span>', "--t0:translateX(18px);--t1:translateX(9px);--t2:translateX(0)", ("Geste : tu centres le libellé", "Écart : 9 px à droite", "Principe : marges égales de chaque côté")),
    "ux": ('<span class="demo-zone"></span><span class="demo-obj"></span>', "--t0:scale(.45);--t1:scale(.7);--t2:scale(1)", ("Geste : tu agrandis la cible", "Écart : 14 px de moins que prévu", "Principe : 44 px minimum pour un doigt")),
    "motion": ('<span class="demo-rail"></span><span class="demo-obj"></span>', "--t0:translateX(-70px);--t1:translateX(30px);--t2:translateX(70px)", ("Geste : tu règles la vitesse", "Écart : l'arrivée est trop brusque", "Principe : ce qui entre ralentit à la fin")),
}
def demo(k):
    html, vars_, cap = DEMOS[k]
    return f'''<div aria-hidden="true" class="demo demo-{k}" style="{vars_}"><div class="demo-scene">{html}</div><p class="demo-cap"><span>{cap[0]}</span><span>{cap[1]}</span><span>{cap[2]}</span></p></div>'''
def disc_card(k, d):
    lst = [g for g in GAMES if g["domain"] == k]
    items = "".join(f'<li><a href="{g["id"]}.html"><span>{g["name"]}</span><span aria-hidden="true" class="material-symbols-outlined">arrow_forward</span></a></li>' for g in lst[:5])
    return f'''<div class="disc-card" style="--field:{d["field"]}">
<p class="disc-head"><span class="board-dot"></span>{d["label"]}</p>
{demo(k)}
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
<p class="board-strip"><span class="board-dot"></span>Le terrain d'entraînement des designers · {len(GAMES)} jeux · compte gratuit</p>
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
<p class="text-body-sm text-ink/70">Test éclair · 5 secondes, sans inscription</p>
<h2 class="mt-1 text-[24px] sm:text-[28px] font-medium tracking-[-0.03em] leading-tight">Lequel est centré à l'œil ?</h2>
<div class="mt-5 grid grid-cols-2 gap-3 quiz-opts" id="quiz-opts">
<button aria-label="Réponse A" aria-pressed="false" class="quiz-opt" id="quiz-btn-a" onclick="testEye('A')" type="button"><span class="quiz-fake"><span>Valider</span><span class="material-symbols-outlined text-[16px] pl-2">check</span></span><span class="quiz-letter">A</span></button>
<button aria-label="Réponse B" aria-pressed="false" class="quiz-opt" id="quiz-btn-b" onclick="testEye('B')" type="button"><span class="quiz-fake"><span>Valider</span><span class="material-symbols-outlined text-[16px]">check</span></span><span class="quiz-letter">B</span></button>
<svg aria-hidden="true" class="quiz-mouse" viewBox="0 0 32 40"><path d="M6 4v26l7-6 5 12 6-3-5-11h10z" fill="#141413" transform="translate(2 2)"/><path d="M4 2v26l7-6 5 12 6-3-5-11h10z" fill="#fff" stroke="#141413" stroke-linejoin="round" stroke-width="2"/></svg>
</div>
<p class="mt-3 text-body-sm text-ink/70" id="quiz-hint">Clique sur ta réponse, ou appuie sur A ou B.</p>
<div aria-live="polite" class="hidden mt-5" id="quiz-feedback"><p class="font-medium text-[17px]" id="feedback-verdict"></p><p class="mt-1 text-body-sm" id="feedback-expl"></p><a class="btn btn-sm mt-3" href="optical-center.html">Jouer à Optical Center<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></a></div>
</div>
</div>
</div>
</div>
</section>

<section class="{W} py-24 lg:py-32 scroll-mt-20" id="jeux">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-12">
<h2 class="text-big reveal"><span class="nw">{len(GAMES)} jeux,</span> <span class="nw">6 disciplines.</span></h2>
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
<div class="lg:col-span-5 btn-row lg:justify-end reveal" style="--d:140ms"><a class="btn btn-invert" href="live.html">Lancer une partie en direct</a><a class="btn-line btn-line-invert" href="profs.html">L'offre pour les écoles</a></div>
</div>
</section>

<section class="{W} py-24 lg:py-32" id="methode">
<div class="method-head">
<h2 class="text-big reveal"><span class="nw">Joue, compare,</span> <span class="nw">comprends.</span></h2>
<p class="reveal text-body-lg max-w-[30rem]" style="--d:60ms">Chaque manche suit les mêmes trois temps. Exemple avec Spacing Repair, sur une carte produit.</p>
</div>
<div class="reveal" style="--d:120ms">
<div aria-label="Les trois temps d'une manche" class="method-line" id="method-line" role="tablist">
<button aria-controls="method-show" aria-selected="true" class="method-tab" data-step="0" role="tab" type="button"><b>1</b><span><strong>Le geste</strong><small>Tu règles à l'œil, sans valeur affichée.</small></span><i class="method-progress"></i></button>
<button aria-controls="method-show" aria-selected="false" class="method-tab" data-step="1" role="tab" type="button"><b>2</b><span><strong>L'écart</strong><small>La correction se pose sur ta version.</small></span><i class="method-progress"></i></button>
<button aria-controls="method-show" aria-selected="false" class="method-tab" data-step="2" role="tab" type="button"><b>3</b><span><strong>Le principe</strong><small>La règle en jeu est nommée.</small></span><i class="method-progress"></i></button>
</div>
<div class="dot-board method-show" data-step="0" id="method-show" role="tabpanel">
<div class="method-stage">
<div class="method-card">
<span class="method-tag">Édition print</span><span class="method-gap" data-g="0"><i></i></span>
<span class="method-title">Typographie suisse</span><span class="method-gap" data-g="1"><i></i></span>
<span class="method-text">Une anthologie des grilles modulaires et des casses asymétriques des années 1960.</span><span class="method-gap" data-g="2"><i></i></span>
<span class="method-btn">Ajouter au panier</span>
</div>
</div>
<div class="method-caption" id="method-caption">
<p aria-hidden="true" class="method-num" id="method-num">01</p>
<p class="method-cap-title" id="method-cap-title">Le geste</p>
<p class="method-cap-text" id="method-cap-text"></p>
<p class="method-principle" id="method-box"></p>
<a class="btn-line btn-sm w-max" href="spacing-repair.html">Jouer à Spacing Repair</a>
</div>
</div>
</div>
</section>

<section class="{W} pb-24 lg:pb-32 scroll-mt-20" id="offres">
<div class="method-head"><h2 class="text-big reveal">Gratuit pour jouer.</h2><p class="reveal text-body-lg max-w-[30rem]" style="--d:60ms">Ta première partie est offerte, sans compte. Un compte gratuit suffit pour continuer, sans carte bancaire.</p></div>
<div class="plan-grid reveal" style="--d:100ms">
<article class="plan-card"><h3>Gratuit</h3><p class="plan-price tabular">0 €</p><p class="plan-note">Pour toujours</p><ul><li>{sum(1 for g in GAMES if not g["pro"])} jeux</li><li>Le défi du jour</li><li>Parties en direct et défis entre amis</li><li>Un compte gratuit, sans carte</li></ul><a class="btn-line" href="jeux.html">Commencer à jouer</a></article>
<article class="plan-card is-top"><p class="plan-flag">Le plus complet</p><h3>Œil Pro</h3><p class="plan-price tabular">3 €<small> / mois</small></p><p class="plan-note">Ou 24 € par an, soit 2 mois offerts</p><ul><li>Les {len(GAMES)} jeux, sans limite</li><li>Le parcours de 14 jours inclus</li><li>Progression sur tous tes appareils</li><li>Résiliable à tout moment</li></ul><a class="btn" href="abonnement.html?plan=pro-mensuel">Passer à Pro</a></article>
<article class="plan-card"><h3>Parcours intensif</h3><p class="plan-price tabular">19 €</p><p class="plan-note">Payé une fois, accès à vie</p><ul><li>14 jours, un principe et un jeu par jour</li><li>Fiches de synthèse à garder</li><li>Certificat de fin de parcours</li><li>Sans abonnement</li></ul><a class="btn-line" href="parcours.html">Voir le programme</a></article>
</div>
<p class="mt-5 text-body-sm"><a class="underline" href="tarifs.html">Comparer toutes les offres</a>, dont l'offre Classe pour les écoles.</p>
</section>

<section class="{W} pb-24 lg:pb-36 grid lg:grid-cols-12 gap-10 lg:gap-8 items-start scroll-mt-16" id="faq">
<h2 class="lg:col-span-5 text-big reveal">Questions fréquentes</h2>
<div class="lg:col-span-7 reveal" style="--d:80ms">
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Faut-il être designer senior pour s'entraîner ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Non. Chaque jeu a un niveau indiqué et une aide au premier lancement. Étudiant, développeur front ou directrice artistique : la correction est claire et sans jugement.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Comment défier un ami ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">À la fin d'une session, écris ton prénom et copie le lien de défi. Ton ami rejoue exactement les mêmes manches et voit ton score à battre.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Mon écran fausse-t-il les couleurs ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Un peu : la perception varie avec le calibrage et la luminosité. Les jeux de couleur comparent ta réponse à la cible sur le même écran, avec une tolérance dans le score.</p></details>
<details class="faq border-y border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Qu'est-ce qui est gratuit ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">{sum(1 for g in GAMES if not g["pro"])} jeux, le défi du jour (jeux Pro compris), les défis entre amis et les parties en direct sont gratuits avec un compte gratuit. La première partie se joue sans compte, et rejoindre une partie en direct n'en demande jamais. <a class="underline" href="tarifs.html">Œil Pro</a> ouvre les {len(GAMES)} jeux pour 3 € par mois.</p></details>
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
    document.querySelectorAll(".quiz-opt").forEach((b) => {{ b.setAttribute("aria-pressed", String(b.id === "quiz-btn-" + choice.toLowerCase())); b.classList.toggle("is-answer", b.id === "quiz-btn-b"); }});
    document.getElementById("quiz-hint").hidden = true;
    document.getElementById("quiz-opts").classList.add("is-answered");
  }}
  document.addEventListener("keydown", (e) => {{
    if (e.metaKey || e.ctrlKey || e.altKey || e.target.closest("input, textarea, select")) return;
    const k = e.key.toUpperCase();
    if ((k === "A" || k === "B") && document.getElementById("quiz-hint") && !document.getElementById("quiz-hint").hidden) testEye(k);
  }});
  // Démonstration de la méthode : la frise avance seule, la carte change sur place ; un clic reprend la main.
  (function () {{
    const show = document.getElementById("method-show"), line = document.getElementById("method-line"), tabs = [...line.querySelectorAll(".method-tab")];
    const gaps = [[26, 22, 38], [26, 22, 38], [16, 4, 18]], target = [16, 4, 18];
    const CAP = [
      ["Le geste", "Tu étires les écarts de la carte à l'œil. Aucune valeur n'est affichée : c'est ton regard qui décide."],
      ["L'écart", "Tu valides : la correction se pose sur ta version, au pixel près. Tu vois exactement où ton œil s'est trompé."],
      ["Le principe", "La règle en jeu est nommée en une phrase, pour la retenir et la réutiliser dans tes maquettes."],
    ];
    const BOX = [
      "<b>Consigne.</b> Recale les trois écarts de la carte pour que chaque élément soit à sa juste distance.",
      "<b>Ton écart : 12 px en moyenne.</b> Le titre est trop loin de sa description, le bouton trop près du texte.",
      "<b>Proximité.</b> Ce qui va ensemble est plus proche que ce qui est séparé : le titre colle à sa description, le bouton s'en détache.",
    ];
    const T = 4200;
    line.style.setProperty("--method-t", T + "ms");
    let cur = 0, timer;
    function go(n) {{
      cur = n; show.dataset.step = n;
      tabs.forEach((b, i) => {{ b.setAttribute("aria-selected", String(i === n)); b.tabIndex = i === n ? 0 : -1; const p = b.querySelector(".method-progress"); p.style.animation = "none"; p.offsetWidth; p.style.animation = ""; }});
      document.getElementById("method-num").textContent = "0" + (n + 1);
      document.getElementById("method-cap-title").textContent = CAP[n][0];
      document.getElementById("method-cap-text").textContent = CAP[n][1];
      document.getElementById("method-box").innerHTML = BOX[n];
      document.querySelectorAll(".method-gap").forEach((g, i) => {{ g.style.height = gaps[n][i] + "px"; g.querySelector("i").textContent = n === 1 ? `${{gaps[0][i]}} → ${{target[i]}}` : ""; }});
    }}
    const stop = () => {{ clearInterval(timer); line.classList.add("is-paused"); }};
    tabs.forEach((b) => b.addEventListener("click", () => {{ stop(); go(+b.dataset.step); }}));
    line.addEventListener("keydown", (e) => {{ if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return; stop(); const n = (cur + (e.key === "ArrowRight" ? 1 : 2)) % 3; go(n); tabs[n].focus(); }});
    go(0);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) line.classList.add("is-paused");
    else timer = setInterval(() => go((cur + 1) % 3), T);
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
<h1 class="text-big reveal">Échauffe <span class="nw">toute ta classe</span> <span class="nw">en cinq minutes.</span></h1>
<p class="reveal mt-6 max-w-[38rem] text-body-lg" style="--d:80ms">Une partie en direct ou un lien de session, et chaque étudiant joue les mêmes manches sur son poste ou son téléphone. Le classement s'affiche à la fin de chaque partie.</p>
</div>
<div class="lg:col-span-4 btn-row lg:justify-end reveal" style="--d:140ms"><a class="btn" href="live.html">Lancer une partie en direct</a><a class="btn-line" href="#offres">Voir les offres</a></div>
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
<h2 class="text-headline-lg-mobile md:text-headline-xl mt-3"><span class="nw">Un code,</span> <span class="nw">un QR code,</span><br/><span class="nw">toute la classe joue.</span></h2>
<p class="mt-4 text-body-lg max-w-[36rem]">Tu projettes l'écran de l'hôte. Les étudiants scannent le QR code ou tapent le code sur rejoindre.html, entrent leur prénom, et attendent ton signal. Chaque manche met à jour le classement à l'écran, jusqu'au podium.</p>
<div class="mt-6 btn-row"><a class="btn" href="live.html">Créer une partie</a><a class="btn-line" href="rejoindre.html">Page à donner aux étudiants</a></div>
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
<p class="mt-4 text-body-md text-on-surface-variant">Colle les codes résultats envoyés par tes étudiants, un par ligne. Le classement est gardé sur cet ordinateur et s'exporte en CSV. Avec l'offre Classe, les résultats remontent tout seuls dans Mon compte.</p>
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
<h2 class="feature-title">Gratuit pour essayer,<br/>payant pour suivre.</h2>
<p class="feature-text">Les parties en direct et les sessions par lien sont gratuites. L'offre Classe donne l'accès Pro à 40 étudiants, avec leurs résultats dans ton compte ; l'offre École couvre toute l'équipe.</p>
</div>
<div class="course-price">
<p class="text-body-sm text-text-muted">Classe</p><p class="course-amount tabular">9 €<small>/mois</small></p>
<p class="text-body-sm">par enseignant · École dès 690 €/an</p>
<div class="course-actions"><a class="btn" href="tarifs.html#ecoles">Voir les tarifs écoles</a><a class="btn-line" href="contact.html?offre=ecole">Demander un devis</a></div>
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
<h1 class="text-big reveal">14 jours pour <span class="nw">composer juste.</span></h1>
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
