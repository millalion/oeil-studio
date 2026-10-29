import pathlib, re, sys

site = pathlib.Path(sys.argv[1])
W = 'max-w-[1440px] mx-auto px-4 sm:px-8'

def head(title, kern=False):
    news = ('<link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400&amp;display=swap" rel="stylesheet"/>\n' if kern else '')
    return f'''<!DOCTYPE html>
<html lang="fr"><head><meta charset="utf-8"/><meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>{title}</title>
<link href="favicon.svg" rel="icon" type="image/svg+xml"/><link href="favicon.ico" rel="icon" sizes="32x32"/><link href="apple-touch-icon.png" rel="apple-touch-icon"/><link href="site.webmanifest" rel="manifest"/><meta content="#F7F6F2" name="theme-color"/>
<link href="https://fonts.googleapis.com" rel="preconnect"/><link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect"/>
<link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@100..900&amp;display=swap" rel="stylesheet"/>
{news}<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,300..500,0..1,0&amp;display=swap" rel="stylesheet"/>
<script>document.documentElement.classList.add("js")</script>
<script src="assets/seed.js"></script>
<script src="https://cdn.tailwindcss.com/3.4.17"></script>
<script src="assets/tailwind-config.js"></script>
<link href="assets/style.css" rel="stylesheet"/>
</head>'''

LOGO = ('<svg aria-hidden="true" class="h-7 w-7 shrink-0" viewBox="0 0 32 32"><rect fill="#141413" height="32" rx="6" width="32"/>'
        '<path d="M5 16c3-5 6.8-7.5 11-7.5S24 11 27 16c-3 5-6.8 7.5-11 7.5S8 21 5 16Z" fill="#F7F6F2"/>'
        '<circle cx="16" cy="16" fill="#F0447A" r="4.6"/><circle cx="17.6" cy="14.4" fill="#141413" r="1.3"/></svg>')

NAV = [("jeux", "jeux.html", "Jeux"), ("defi", "defi.html", "Défi du jour"), ("live", "live.html", "En direct"),
       ("classement", "classement.html", "Classement"), ("parcours", "parcours.html", "Parcours"), ("profs", "profs.html", "Écoles"), ("tarifs", "tarifs.html", "Tarifs")]

def header(active=None):
    cur = lambda k: ' aria-current="page"' if k == active else ''
    links = "".join(f'<a class="nav-link"{cur(k)} href="{h}">{t}</a>' for k, h, t in NAV)
    mlinks = "".join(f'<a class="py-3 text-[24px] font-medium tracking-[-0.02em]"{cur(k)} href="{h}">{t}</a>' for k, h, t in NAV)
    return f'''<header class="fixed top-0 inset-x-0 z-50 bg-ground">
<div class="h-16 {W} grid grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_1fr] items-center gap-6">
<a aria-label="Œil Studio, accueil" class="flex items-center gap-2.5 text-[18px] font-medium tracking-[-0.03em] w-max" href="index.html">{LOGO}<span>Œil Studio</span></a>
<nav aria-label="Navigation principale" class="hidden lg:flex items-center gap-8 text-[15px]">{links}</nav>
<div class="flex items-center justify-end gap-2">
<a aria-label="Mon compte" class="nav-link inline-flex items-center gap-1.5 text-[15px] px-2 sm:px-3 h-9 rounded hover:bg-surface-container" data-account-link="" href="connexion.html"><span aria-hidden="true" class="material-symbols-outlined text-[22px]">account_circle</span><span class="hidden sm:inline" data-account-name="">Connexion</span></a>
<a class="btn btn-sm" href="jeux.html">Jouer</a>
<button aria-controls="mobile-menu" aria-expanded="false" aria-label="Ouvrir le menu" class="lg:hidden w-9 h-9 rounded-lg hover:bg-surface-container flex items-center justify-center" data-menu-toggle="" type="button"><span class="material-symbols-outlined text-[22px]">menu</span></button>
</div>
</div>
<nav aria-label="Navigation mobile" class="hidden lg:hidden flex-col px-4 sm:px-8 pt-2 pb-6 bg-ground" id="mobile-menu">{mlinks}<a class="py-3 text-[24px] font-medium tracking-[-0.02em] text-text-muted" data-account-link="" href="connexion.html">Connexion</a></nav>
</header>'''

FOOTER = f'''<footer class="bg-ink text-ground pt-16 lg:pt-24 overflow-hidden">
<div class="{W}">
<div class="grid grid-cols-2 md:grid-cols-12 gap-8 pb-4 text-[15px] relative z-10">
<p class="col-span-2 md:col-span-6 max-w-[28rem] text-body-md text-ground">Œil Studio entraîne le regard typographique, chromatique et géométrique des designers. Pas de score vaniteux : un geste, une correction, un principe.</p>
<div class="md:col-span-3 flex flex-col gap-2"><a class="foot-link w-max" href="jeux.html">Les 44 jeux</a><a class="foot-link w-max" href="defi.html">Défi du jour</a><a class="foot-link w-max" href="classement.html">Classement de la semaine</a><a class="foot-link w-max" href="jeux.html#melange">Créer un mélange</a><a class="foot-link w-max" href="live.html">Partie en direct</a><a class="foot-link w-max" href="rejoindre.html">Rejoindre une partie</a></div>
<div class="md:col-span-3 flex flex-col gap-2"><a class="foot-link w-max" href="tarifs.html">Tarifs et abonnements</a><a class="foot-link w-max" href="parcours.html">Parcours</a><a class="foot-link w-max" href="profs.html">Écoles et enseignants</a><a class="foot-link w-max" href="contact.html">Contact et devis</a><a class="foot-link w-max" href="compte.html">Mon compte</a><a class="foot-link w-max" href="index.html#faq">Questions fréquentes</a><a class="foot-link w-max" href="cgv.html">Conditions générales</a></div>
</div>
<p aria-hidden="true" class="font-medium whitespace-nowrap leading-[0.78] tracking-[-0.065em] text-[clamp(3rem,24.5vw,360px)] text-field-typography pointer-events-none select-none mt-10 lg:mt-16" data-fit="" data-fit-always="">Œil Studio</p>
<div class="flex flex-col sm:flex-row justify-between gap-2 py-6 text-body-sm text-ground/60"><p>© 2026 Œil Studio · <a class="foot-link" href="mentions-legales.html">Mentions légales</a> · <a class="foot-link" href="cgv.html">CGV</a> · <a class="foot-link" href="confidentialite.html">Confidentialité</a></p><p>Accessible au clavier · Conçu selon le RGAA et les WCAG 2.1 AA</p></div>
</div>
</footer>'''

def swatch(cls):
    return f'<span aria-hidden="true" class="w-10 h-10 md:w-14 md:h-14 rounded-lg shrink-0 {cls}"></span>'

GAMES = [
    dict(href="color-recall.html", field="#D8EF71", sw="bg-domain-color", name="Color Recall", domain="color", dlabel="Couleur",
         desc="Mémorise une nuance trois secondes, puis recompose-la en HSL.", dur="3 min", level="debutant", llabel="Débutant"),
    dict(href="spacing-repair.html", field="#B9D9FF", sw="bg-domain-composition", name="Spacing Repair", domain="composition", dlabel="Composition",
         desc="Recale à l'œil les écarts cassés d'une interface sur l'échelle 4-8-16-24-32.", dur="4 min", level="intermediaire", llabel="Intermédiaire"),
    dict(href="kern-clinic.html", field="#F7B4CC", sw="bg-domain-typography", name="Kern Clinic", domain="typography", dlabel="Typographie",
         desc="Rééquilibre les blancs entre les lettres d'un mot en capitales.", dur="5 min", level="all", llabel="Tous niveaux"),
]
COLS = "grid-cols-[auto_1fr_auto] md:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.7fr)_8rem_8rem_1.5rem]"

def row(g):
    return f'''<a class="game-row {COLS}" data-domain="{g["domain"]}" data-level="{g["level"]}" href="{g["href"]}" role="listitem" style="--row:{g["field"]}">
{swatch(g["sw"])}
<span><span class="block text-[22px] md:text-[28px] font-medium tracking-[-0.025em] leading-tight">{g["name"]}</span><span class="md:hidden block mt-0.5 text-body-sm text-text-muted">{g["dlabel"]} · {g["dur"]} · {g["llabel"]}</span></span>
<span class="hidden md:block text-body-md text-on-surface-variant">{g["desc"]}</span>
<span class="hidden md:block text-body-sm">{g["dlabel"]}</span>
<span class="hidden md:block text-body-sm tabular">{g["dur"]} · {g["llabel"]}</span>
<span aria-hidden="true" class="material-symbols-outlined row-arrow justify-self-end">arrow_forward</span>
</a>'''

SOON = [("Bézier Letters", "Tracer une lettre avec le moins de points possible."),
        ("Optical Center", "Placer un élément au centre optique d'un cadre."),
        ("Contrast Rescue", "Rendre un texte lisible sans trahir la couleur de marque."),
        ("Token Detective", "Retrouver la règle cachée derrière une palette.")]

def soon_rows():
    return "".join(f'''<div aria-disabled="true" class="game-row grid-cols-[1fr_auto] md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)_auto]" role="listitem">
<span class="text-[20px] md:text-[22px] font-medium tracking-[-0.02em] text-ink">{n}</span>
<span class="hidden md:block text-body-md text-text-muted">{d}</span>
<span class="text-body-sm">Bientôt</span>
</div>''' for n, d in SOON)

H2 = "text-big"

# ---------------------------------------------------------------- Accueil
INDEX = f'''{head("Œil Studio — Affine ton œil")}
<body class="bg-ground text-ink">
<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] btn" href="#contenu">Aller au contenu</a>
{header()}
<main class="pt-16" id="contenu">
<section class="bg-ink text-ground">
<div class="{W} pt-10 lg:pt-14 pb-12 lg:pb-16">
<h1 class="text-mega reveal" data-fit="">Affine<br class="md:hidden"/> ton œil.</h1>
<div class="mt-10 lg:mt-16 grid lg:grid-cols-12 gap-10 lg:gap-8 items-end">
<div class="lg:col-span-6">
<p class="reveal max-w-[34rem] text-[20px] sm:text-[24px] leading-[1.35] tracking-[-0.015em] text-ground" style="--d:80ms">Des mini-jeux de 3 à 5 minutes pour entraîner ton regard sur la couleur, l'espacement et le crénage. Chaque réponse est corrigée au pixel près.</p>
<div class="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-4" style="--d:160ms">
<a class="btn btn-invert" href="jeux.html">Commencer à jouer<span aria-hidden="true" class="material-symbols-outlined text-[18px]">arrow_forward</span></a>
<a class="btn-quiet text-ground text-[15px] font-medium" href="#defi">Voir le défi du jour</a>
</div>
<p class="reveal mt-5 text-body-sm text-ground/70" style="--d:200ms">Gratuit, sans compte.</p>
</div>
<div class="lg:col-span-6 text-ink reveal" style="--d:240ms">
<div class="bg-field-color rounded-xl p-5 sm:p-8">
<h2 class="text-[22px] sm:text-[26px] font-medium tracking-[-0.025em] leading-tight">Lequel est centré à l'œil ?</h2>
<p class="mt-1 text-body-sm text-ink/70">Fais confiance à ta première impression.</p>
<div class="mt-6 grid grid-cols-2 gap-3">
<button aria-pressed="false" class="quiz-opt group h-36 sm:h-44 rounded-lg bg-white/60 hover:bg-white flex flex-col items-center justify-center gap-5 transition-colors" id="quiz-btn-a" onclick="testEye('A')" type="button">
<span class="w-[82%] h-10 rounded bg-ink text-white flex items-center justify-center gap-1.5 text-[14px] font-medium"><span>Valider</span><span class="material-symbols-outlined text-[16px] pl-2">check</span></span>
<span class="text-body-sm font-medium">Option A</span>
</button>
<button aria-pressed="false" class="quiz-opt group h-36 sm:h-44 rounded-lg bg-white/60 hover:bg-white flex flex-col items-center justify-center gap-5 transition-colors" id="quiz-btn-b" onclick="testEye('B')" type="button">
<span class="w-[82%] h-10 rounded bg-ink text-white flex items-center justify-center gap-1.5 text-[14px] font-medium"><span>Valider</span><span class="material-symbols-outlined text-[16px]">check</span></span>
<span class="text-body-sm font-medium">Option B</span>
</button>
</div>
<div aria-live="polite" class="hidden mt-6" id="quiz-feedback">
<p class="font-medium text-[17px]" id="feedback-verdict"></p>
<p class="mt-1 text-body-sm" id="feedback-expl"></p>
<a class="btn-quiet inline-block mt-3 text-[14px] font-medium" href="jeux.html">Tester d'autres cas</a>
</div>
</div>
</div>
</div>
</div>
</section>

<section class="{W} py-24 lg:py-36 scroll-mt-20" id="jeux">
<div class="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10 lg:mb-14">
<h2 class="{H2} max-w-[13ch] reveal">Trois jeux, trois réflexes.</h2>
<a class="btn-quiet text-[15px] font-medium w-max reveal" href="jeux.html">Toute la bibliothèque</a>
</div>
<div class="reveal" role="list" style="--d:80ms">{"".join(row(g) for g in GAMES)}</div>
</section>

<section class="bg-field-typography scroll-mt-16" id="defi">
<div class="{W} py-20 lg:py-28 grid lg:grid-cols-12 gap-12 lg:gap-8 items-end">
<div class="lg:col-span-7">
<h2 class="{H2} max-w-[16ch] reveal">Le défi du <span data-today="long">jour</span></h2>
<p class="reveal mt-6 max-w-[36rem] text-body-lg" style="--d:80ms">Une manche de chaque jeu, enchaînées. Cinq minutes, le même défi pour tout le monde, renouvelé chaque nuit à minuit.</p>
<a class="btn mt-8 reveal" href="bientot.html?jeu=defi-du-jour" style="--d:160ms">Relever le défi</a>
</div>
<ol class="lg:col-span-5 flex flex-col gap-3 reveal" style="--d:200ms">
<li class="flex items-center gap-4 bg-white/55 rounded-lg p-4"><span aria-hidden="true" class="w-10 h-10 rounded bg-domain-color shrink-0"></span><span><span class="block font-medium">Une nuance à retenir</span><span class="block text-body-sm text-ink/70">Couleur, trois secondes d'observation</span></span></li>
<li class="flex items-center gap-4 bg-white/55 rounded-lg p-4"><span aria-hidden="true" class="w-10 h-10 rounded bg-domain-composition shrink-0"></span><span><span class="block font-medium">Une carte aux marges cassées</span><span class="block text-body-sm text-ink/70">Composition, tolérance de 2 pixels</span></span></li>
<li class="flex items-center gap-4 bg-white/55 rounded-lg p-4"><span aria-hidden="true" class="w-10 h-10 rounded bg-ink shrink-0"></span><span><span class="block font-medium">Un mot à créner</span><span class="block text-body-sm text-ink/70">Typographie, le crénage de la fonte comme référence</span></span></li>
</ol>
</div>
</section>

<section class="{W} py-24 lg:py-36" id="methode">
<h2 class="{H2} reveal mb-12 lg:mb-20">Joue, compare, comprends.</h2>
<div class="grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
<div class="lg:col-span-5">
<p class="reveal max-w-[30rem] text-body-lg" style="--d:80ms">Tu fais d'abord le geste. Ensuite seulement, tu vois la référence et l'écart exact, en pixels, en degrés ou en unités de crénage.</p>
<dl class="mt-10 flex flex-col gap-6 max-w-[30rem] reveal" style="--d:160ms">
<div><dt class="font-medium text-[17px]">Une correction mesurée</dt><dd class="mt-1 text-on-surface-variant">Chaque exercice affiche la distance entre ta réponse et la référence.</dd></div>
<div><dt class="font-medium text-[17px]">Un principe à chaque fois</dt><dd class="mt-1 text-on-surface-variant">Proximité, contraste simultané, crénage optique : la correction nomme la règle en jeu.</dd></div>
<div><dt class="font-medium text-[17px]">Des sessions courtes</dt><dd class="mt-1 text-on-surface-variant">Après dix minutes, l'œil s'habitue aux défauts. Cinq minutes suffisent.</dd></div>
</dl>
</div>
<div class="lg:col-span-7 reveal" style="--d:120ms">
<div class="bg-surface-container-low rounded-xl p-4 sm:p-8">
<div class="flex flex-wrap items-center justify-between gap-3">
<p class="font-medium">Carte produit, espacements</p>
<div aria-label="Version affichée" class="inline-flex p-1 rounded-lg bg-surface-container" role="group">
<button aria-pressed="true" class="seg px-3 h-8 rounded text-[14px] font-medium" id="toggle-before" onclick="setComparison('before')" type="button">Avant</button>
<button aria-pressed="false" class="seg px-3 h-8 rounded text-[14px] font-medium" id="toggle-after" onclick="setComparison('after')" type="button">Après</button>
</div>
</div>
<div class="mt-5 bg-ground rounded-lg p-5 sm:p-10 min-h-[340px] flex items-center justify-center">
<div class="w-full max-w-sm bg-white rounded-xl p-6 flex flex-col" id="comp-view-before">
<div class="flex justify-between items-center mb-6"><span class="px-2 py-0.5 rounded bg-surface-container text-body-sm">Édition print</span><span class="text-body-sm tabular">45,00 €</span></div>
<p class="text-[26px] font-medium tracking-[-0.025em] leading-tight">Typographie suisse</p>
<p class="text-body-sm text-text-muted mt-5">Une anthologie critique des grilles modulaires et des casses asymétriques des années 1960.</p>
<span class="mt-9 w-full h-10 rounded bg-ink text-white flex items-center justify-center text-[14px] font-medium">Ajouter au panier</span>
</div>
<div class="hidden w-full max-w-sm bg-white rounded-xl p-6 flex-col gap-4" id="comp-view-after">
<div class="flex justify-between items-center"><span class="px-2 py-0.5 rounded bg-domain-composition text-body-sm">Édition print</span><span class="text-body-sm font-medium tabular">45,00 €</span></div>
<div class="flex flex-col gap-1"><p class="text-[26px] font-medium tracking-[-0.025em] leading-tight">Typographie suisse</p><p class="text-body-sm text-on-surface-variant">Une anthologie critique des grilles modulaires et des casses asymétriques des années 1960.</p></div>
<span class="mt-2 w-full h-10 rounded bg-ink text-white flex items-center justify-center text-[14px] font-medium">Ajouter au panier</span>
</div>
</div>
<p aria-live="polite" class="mt-4 text-body-sm text-on-surface-variant" id="comp-caption"></p>
</div>
</div>
</div>
</section>

<section class="bg-field-color scroll-mt-16" id="parcours">
<div class="{W} py-24 lg:py-32 grid lg:grid-cols-12 gap-12 lg:gap-8 items-start">
<div class="lg:col-span-7">
<h2 class="{H2} reveal">14 jours pour composer juste.</h2>
<p class="reveal mt-6 max-w-[34rem] text-body-lg" style="--d:80ms">L'œil UI est un parcours quotidien pour ne plus tâtonner. Chaque jour, un micro-défi commenté et une fiche qui résume le principe en jeu.</p>
<ul class="reveal mt-10 grid sm:grid-cols-2 gap-x-8 gap-y-4 max-w-[40rem]" style="--d:160ms">
<li class="flex gap-3"><span aria-hidden="true" class="material-symbols-outlined text-[20px] text-signal">check</span>14 micro-défis progressifs commentés</li>
<li class="flex gap-3"><span aria-hidden="true" class="material-symbols-outlined text-[20px] text-signal">check</span>Fiches de synthèse téléchargeables</li>
<li class="flex gap-3"><span aria-hidden="true" class="material-symbols-outlined text-[20px] text-signal">check</span>Accès à vie, sans abonnement</li>
<li class="flex gap-3"><span aria-hidden="true" class="material-symbols-outlined text-[20px] text-signal">check</span>Certificat d'acuité optique</li>
</ul>
</div>
<div class="lg:col-span-5 bg-ground rounded-xl p-6 sm:p-10 reveal" style="--d:120ms">
<p class="text-[88px] sm:text-[112px] font-medium tracking-[-0.06em] leading-[0.9] tabular">19 €</p>
<p class="mt-4 text-body-md">TTC, payé une seule fois. Pas d'abonnement, pas de reconduction.</p>
<a class="btn w-full mt-8" href="bientot.html?jeu=parcours">Rejoindre le parcours</a>
<p class="mt-4 text-body-sm text-text-muted">Remboursé sous 14 jours si ça ne te convient pas · Facture avec TVA · CB et Apple Pay</p>
</div>
</div>
</section>

<section class="bg-field-composition scroll-mt-16" id="profs">
<div class="{W} py-20 lg:py-28 grid lg:grid-cols-12 gap-10 lg:gap-8 items-end">
<div class="lg:col-span-8">
<h2 class="{H2} reveal">Tu enseignes le design ?</h2>
<p class="reveal mt-6 max-w-[40rem] text-body-lg" style="--d:80ms">Échauffe tes promotions en cinq minutes avant un cours de composition ou de typographie. Licences de groupe, mode classe et export des progressions pour tes TD.</p>
</div>
<div class="lg:col-span-4 lg:justify-self-end reveal" style="--d:160ms"><a class="btn" href="bientot.html?jeu=profs">Découvrir l'espace enseignant</a></div>
</div>
</section>

<section class="{W} py-24 lg:py-36 grid lg:grid-cols-12 gap-10 lg:gap-8 items-start scroll-mt-16" id="faq">
<h2 class="lg:col-span-5 {H2} reveal">Questions fréquentes</h2>
<div class="lg:col-span-7 reveal" style="--d:80ms">
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Faut-il être designer senior pour s'entraîner ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Non. Les exercices calibrent l'intuition : étudiant curieux, développeur front qui soigne ses finitions ou directrice artistique qui entretient son acuité, chaque épreuve donne une correction claire et sans jugement.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Pourquoi des sessions de 5 minutes ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Après une dizaine de minutes d'observation soutenue, le cerveau s'habitue aux déséquilibres et finit par tolérer les défauts. Des sessions courtes gardent le regard frais.</p></details>
<details class="faq border-t border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Mon écran fausse-t-il les couleurs ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Un peu : la perception varie avec le calibrage et la luminosité. Mais Color Recall compare ta réponse à la cible sur le même écran, donc l'écart mesuré reste juste.</p></details>
<details class="faq border-y border-border-subtle"><summary class="flex items-center justify-between gap-6 py-6 text-[19px] sm:text-[21px] font-medium tracking-[-0.015em]">Les jeux gratuits le resteront-ils ?<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-6 max-w-[40rem] text-on-surface-variant">Oui. Le défi du jour et les trois jeux restent libres et sans inscription. Seuls les parcours sur plusieurs semaines sont payants, une seule fois.</p></details>
</div>
</section>
</main>
{FOOTER}
<script>
  // Test éclair : centrage optique
  function testEye(choice) {{
    const ok = choice === "B";
    document.getElementById("quiz-feedback").classList.remove("hidden");
    document.getElementById("feedback-verdict").textContent = ok
      ? "Bien vu : B est centré à l'œil."
      : "Piège classique : A est centré au calcul, pas à l'œil.";
    document.getElementById("feedback-expl").textContent = ok
      ? "L'icône à droite alourdit le bouton. B rapproche l'icône du texte pour garder le centre de gravité ressenti au milieu."
      : "Les marges de A sont égales dans le code, mais l'icône éloignée tire le regard vers la droite. L'œil demande une compensation.";
    document.querySelectorAll(".quiz-opt").forEach((b) => {{
      const picked = b.id === "quiz-btn-" + choice.toLowerCase();
      b.setAttribute("aria-pressed", String(picked));
      b.classList.toggle("bg-white", picked);
      b.classList.toggle("ring-2", picked);
      b.classList.toggle("ring-ink", picked);
    }});
  }}
  // Comparateur avant / après
  const captions = {{
    before: "Avant : 24 px sous l'étiquette, 20 px au texte, 36 px au bouton. Aucun rythme, le titre flotte.",
    after: "Après : une échelle 4 – 16 px. Le titre et sa description forment un bloc, le bouton s'en détache.",
  }};
  function setComparison(state) {{
    const after = state === "after";
    const b = document.getElementById("comp-view-before"), a = document.getElementById("comp-view-after");
    b.classList.toggle("hidden", after); b.classList.toggle("flex", !after);
    a.classList.toggle("hidden", !after); a.classList.toggle("flex", after);
    document.querySelectorAll(".seg").forEach((s) => {{
      const on = s.id === "toggle-" + state;
      s.setAttribute("aria-pressed", String(on));
      s.classList.toggle("bg-white", on);
      s.classList.toggle("text-text-muted", !on);
    }});
    document.getElementById("comp-caption").textContent = captions[state];
  }}
  setComparison("before");
</script>
<script src="assets/site.js"></script>
</body></html>
'''

# ---------------------------------------------------------------- Bibliothèque
CHIP = "chip h-9 px-4 rounded-full text-[14px] font-medium transition-colors"
JEUX = f'''{head("Bibliothèque des jeux — Œil Studio")}
<body class="bg-ground text-ink">
<a class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] btn" href="#contenu">Aller au contenu</a>
{header("jeux")}
<main class="pt-16" id="contenu">
<section class="bg-ink text-ground">
<div class="{W} pt-10 lg:pt-14 pb-12 lg:pb-16">
<h1 class="text-mega reveal" data-fit="">Bibliothèque</h1>
<p class="mt-8 lg:mt-12 max-w-[34rem] text-[20px] sm:text-[24px] leading-[1.35] tracking-[-0.015em] reveal" style="--d:80ms">Des exercices de 3 à 5 minutes pour développer des réflexes visuels précis. Tous jouables sans inscription, au clavier, à la souris ou au doigt.</p>
</div>
</section>

<section aria-label="Jeux disponibles" class="{W} pt-10 lg:pt-14">
<div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5">
<div aria-label="Filtrer par discipline" class="flex flex-wrap gap-2" role="group">
<button aria-pressed="true" class="{CHIP}" data-domain="all" type="button">Tout</button>
<button aria-pressed="false" class="{CHIP}" data-domain="color" type="button">Couleur</button>
<button aria-pressed="false" class="{CHIP}" data-domain="composition" type="button">Composition</button>
<button aria-pressed="false" class="{CHIP}" data-domain="typography" type="button">Typographie</button>
</div>
<div class="flex items-center gap-4">
<label class="flex items-center gap-2 text-body-sm">Niveau
<select class="h-9 rounded-lg bg-surface-container pl-3 pr-8 text-[14px] font-medium" id="filter-level"><option value="all">Tous</option><option value="debutant">Débutant</option><option value="intermediaire">Intermédiaire</option></select>
</label>
<span aria-live="polite" class="text-body-sm text-text-muted tabular" id="filter-count">3 jeux</span>
</div>
</div>
<div id="games-list" role="list">{"".join(row(g) for g in GAMES)}</div>
<div class="hidden py-14" id="no-results"><p class="text-headline-sm">Aucun jeu ne correspond à ces filtres.</p><button class="btn-quiet mt-2 text-[15px] font-medium" id="reset-filters" type="button">Réinitialiser les filtres</button></div>
</section>

<section class="{W} pt-20 lg:pt-28 scroll-mt-16" id="defi">
<div class="bg-field-typography rounded-xl p-6 sm:p-10 grid md:grid-cols-[auto_1fr_auto] gap-6 md:gap-10 items-center reveal">
<p class="leading-none"><span class="block text-[72px] sm:text-[96px] font-medium tracking-[-0.06em] tabular" data-today="day">28</span><span class="block text-body-md mt-1" data-today="monthlong">octobre</span></p>
<div><h2 class="text-headline-md">Défi du jour : le crénage de « Minimalist »</h2><p class="mt-2 text-body-md max-w-[36rem]">Ajuste le rythme des capitales en moins de 90 secondes. Le même mot pour tout le monde, jusqu'à minuit.</p></div>
<a class="btn w-max" href="bientot.html?jeu=defi-du-jour">Relever le défi</a>
</div>
</section>

<section class="{W} py-24 lg:py-32 grid lg:grid-cols-12 gap-10 lg:gap-8 items-start">
<div class="lg:col-span-5">
<h2 class="{H2} reveal">En préparation</h2>
<p class="reveal mt-5 max-w-[28rem] text-body-md text-on-surface-variant" style="--d:80ms">Ces jeux sont testés en ce moment avec des écoles d'art et des directeurs artistiques. Disponibles au troisième trimestre.</p>
</div>
<div class="lg:col-span-7 reveal" role="list" style="--d:120ms">{soon_rows()}</div>
</section>
</main>
{FOOTER}
<script>
  (function () {{
    const state = {{ domain: "all", level: "all" }};
    const rows = [...document.querySelectorAll("#games-list .game-row")];
    const chips = [...document.querySelectorAll(".chip")];
    const level = document.getElementById("filter-level");
    const count = document.getElementById("filter-count");
    const empty = document.getElementById("no-results");
    function apply() {{
      let n = 0;
      rows.forEach((r) => {{
        const ok = (state.domain === "all" || r.dataset.domain === state.domain)
          && (state.level === "all" || r.dataset.level === "all" || r.dataset.level === state.level);
        r.classList.toggle("hidden", !ok);
        if (ok) n++;
      }});
      chips.forEach((c) => {{
        const on = c.dataset.domain === state.domain;
        c.setAttribute("aria-pressed", String(on));
        c.classList.toggle("bg-ink", on); c.classList.toggle("text-white", on);
        c.classList.toggle("bg-surface-container", !on); c.classList.toggle("hover:bg-surface-container-high", !on);
      }});
      count.textContent = n + (n > 1 ? " jeux" : " jeu");
      empty.classList.toggle("hidden", n > 0);
    }}
    chips.forEach((c) => c.addEventListener("click", () => {{ state.domain = c.dataset.domain; apply(); }}));
    level.addEventListener("change", () => {{ state.level = level.value; apply(); }});
    document.getElementById("reset-filters").addEventListener("click", () => {{ state.domain = "all"; state.level = level.value = "all"; apply(); }});
    apply();
  }})();
</script>
<script src="assets/site.js"></script>
</body></html>
'''

(site / "index.html").write_text(INDEX)
(site / "jeux.html").write_text(JEUX)

# ---------------------------------------------------------------- Jeux + page « bientôt » : nouvelle tête, en-tête, pied
TITLES = {"color-recall.html": "Color Recall — Œil Studio", "spacing-repair.html": "Spacing Repair — Œil Studio",
          "kern-clinic.html": "Kern Clinic — Œil Studio", "bientot.html": "Bientôt — Œil Studio"}
for name, title in TITLES.items():
    p = site / name
    h = p.read_text()
    body_start = h.index("<body")
    body_tag_end = h.index(">", body_start) + 1
    h = head(title, kern=name == "kern-clinic.html") + '\n<body class="bg-ground text-ink">' + h[body_tag_end:]
    active = None if name == "bientot.html" else "jeux"
    h = re.sub(r"<header class=\"fixed.*?</header>", lambda m: header(active), h, count=1, flags=re.S)
    h = re.sub(r"<footer class=\"w-full bg-surface-canvas border-t.*?</footer>", lambda m: FOOTER, h, count=1, flags=re.S)
    h = h.replace('<main class="w-full pt-16 bg-surface-canvas min-h-screen">', '<main class="w-full pt-16 min-h-screen" id="contenu">')
    p.write_text(h)
print("ok")
