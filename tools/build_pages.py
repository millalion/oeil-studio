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
def page(name, title, active, body, scripts="", auth=False):
    hd = head(title)
    if auth: hd = hd.replace('<html lang="fr">', '<html data-auth="1" lang="fr">')
    (site / name).write_text(f'''{hd}
<body class="bg-ground text-ink">
{SKIP}
{header(active)}
<main class="pt-16" id="contenu">
{body}
</main>
{FOOTER}
<script src="assets/config.js"></script>
<script src="assets/account.js"></script>
{scripts}<script src="assets/site.js"></script>
</body></html>
''')
DEFAULT_LIVE = {"kern-clinic", "color-impostor", "spacing-repair", "ui-detective", "microcopy-duel", "hue-line"}
PRO_ATTR, LOCK = ' data-pro=""', '<b aria-hidden="true" class="material-symbols-outlined mix-lock">lock</b>'
chips = "".join(f'<label class="mix-chip"><input{CHK if g["id"] in DEFAULT_LIVE else ""}{PRO_ATTR if g["pro"] else ""} type="checkbox" value="{g["id"]}"/><span><i style="background:{DOMAINS[g["domain"]]["field"]}"></i>{g["name"]}{LOCK if g["pro"] else ""}</span></label>' for g in GAMES)

exec(compile((SP / 'pages_app.py').read_text(), 'pages_app', 'exec'))
