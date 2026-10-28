import pathlib, sys
# Génère tarifs.html et abonnement.html. Réutilise les fonctions communes de build_pages.py.
site = pathlib.Path(sys.argv[1]); SP = pathlib.Path(sys.argv[2])
src = (SP / "build_pages.py").read_text()
ns = {"__name__": "lib", "sys": sys}
sys.argv = [sys.argv[0], str(site), str(SP)]
exec(compile(src[:src.index("DEFAULT_LIVE")], "build_pages", "exec"), ns)
page, seg, W, GAMES = ns["page"], ns["seg"], ns["W"], ns["GAMES"]

NFREE = sum(1 for g in GAMES if not g["pro"])
FEAT = [("Jeux disponibles", f"{NFREE} jeux", f"{len(GAMES)} jeux"), ("Défi du jour", "oui", "oui"), ("Défier ses amis, parties en direct", "oui", "oui"),
        ("Historique et progression", "sur cet appareil", "sur tous tes appareils"), ("Parcours intensif de 14 jours", "–", "inclus"), ("Nouveaux jeux", "certains", "tous")]
feat_rows = "".join(f"<tr><th>{a}</th><td>{b}</td><td><b>{c}</b></td></tr>" for a, b, c in FEAT)
FAQ = lambda q, a, last=False: f"""<details class="faq border-t border-border-subtle{' border-b' if last else ''}"><summary class="flex items-center justify-between gap-6 py-5 text-[19px] font-medium">{q}<span aria-hidden="true" class="faq-icon material-symbols-outlined">add</span></summary><p class="pb-5 text-on-surface-variant">{a}</p></details>"""

page("tarifs.html", "Tarifs — Œil Studio", "tarifs", f"""<section class="{W} pt-6 lg:pt-10">
<div class="dot-board px-5 sm:px-10 pt-16 pb-10">
<p class="board-strip"><span class="board-dot"></span>Tarifs · gratuit pour jouer, Pro pour progresser</p>
<div class="flex flex-wrap items-end justify-between gap-6">
<h1 class="text-big max-w-[13ch]">Joue gratuitement. Progresse avec Pro.</h1>
{seg("billing", [("mensuel", "Mensuel"), ("annuel", "Annuel · 2 mois offerts")], "mensuel")}
</div>
<div class="price-grid mt-10 scroll-mt-24" id="pro">
<div class="offer"><p class="offer-name">Gratuit</p><p class="offer-price">0 €</p><p class="offer-note">pour toujours, sans carte bancaire</p><ul><li>{NFREE} jeux sur {len(GAMES)}</li><li>Le défi du jour, jeux Pro compris</li><li>Défis entre amis et parties en direct</li></ul><a class="btn-line w-full mt-auto" href="jeux.html">Jouer maintenant</a></div>
<div class="offer offer-main" style="--field:#F7B4CC"><p class="offer-name">Œil Pro <span class="pro-badge">Pro</span></p><p class="offer-price"><span data-price-m="">3 €</span><span data-price-y="" hidden="">24 €</span><small data-per-m="">/mois</small><small data-per-y="" hidden="">/an</small></p><p class="offer-note">résiliable à tout moment</p><ul><li>Les {len(GAMES)} jeux, sans limite</li><li>Le parcours intensif inclus</li><li>Progression sur tous tes appareils</li></ul><a class="btn w-full mt-auto" data-plan-link="" href="abonnement.html?plan=pro-mensuel">Passer à Pro</a></div>
<div class="offer" style="--field:#D8EF71"><p class="offer-name">Parcours intensif</p><p class="offer-price">19 €<small>une fois</small></p><p class="offer-note">14 jours, accès à vie</p><ul><li>Un principe et un jeu par jour</li><li>Fiches de synthèse</li><li>Certificat de fin de parcours</li></ul><a class="btn-line w-full mt-auto" href="abonnement.html?plan=parcours">Acheter le parcours</a><a class="btn-quiet text-[14px] w-max" href="parcours.html">Voir le programme</a></div>
</div>
</div>
</section>
<section class="{W} pt-16 lg:pt-24 scroll-mt-20" id="ecoles">
<h2 class="text-headline-lg-mobile md:text-headline-xl">Pour les classes et les écoles</h2>
<div class="price-grid price-grid-2 mt-8">
<div class="offer offer-main" style="--field:#B9D9FF"><p class="offer-name">Classe</p><p class="offer-price">9 €<small>/mois</small></p><p class="offer-note">par enseignant, jusqu'à 40 étudiants · 14 jours d'essai gratuit</p><ul><li>Comptes Pro pour toute la classe</li><li>Parties en direct sur tous les téléphones</li><li>Classement automatique et suivi sur l'année</li></ul><a class="btn w-full mt-auto" href="abonnement.html?plan=classe-mensuel">Commencer l'essai gratuit</a></div>
<div class="offer"><p class="offer-name">École</p><p class="offer-price">dès 690 €<small>/an</small></p><p class="offer-note">plusieurs classes ou campus, sur devis</p><ul><li>Licences pour toute l'équipe pédagogique</li><li>Connexion via l'ENT ou le SSO</li><li>Exports pour les évaluations, bon de commande</li></ul><a class="btn-line w-full mt-auto" href="contact.html?offre=ecole">Estimer et demander un devis</a></div>
</div>
</section>
<section class="{W} py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<div class="lg:col-span-5"><h2 class="text-headline-lg-mobile md:text-headline-xl">Gratuit ou Pro ?</h2><p class="mt-4 text-body-md text-on-surface-variant max-w-[28rem]">Le gratuit suffit pour s'entraîner chaque jour. Pro ouvre les jeux avancés et garde ta progression partout.</p></div>
<div class="lg:col-span-7 overflow-x-auto"><table class="rank-table compare-table"><thead><tr><th></th><th>Gratuit</th><th>Œil Pro</th></tr></thead><tbody>{feat_rows}</tbody></table></div>
</section>
<section class="{W} pb-24 lg:pb-32 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
<h2 class="lg:col-span-5 text-headline-lg-mobile md:text-headline-xl">Paiement et résiliation</h2>
<div class="lg:col-span-7">
{FAQ("Comment se passe le paiement ?", "Par carte bancaire ou Apple Pay, sur la page de paiement sécurisée de Stripe. Œil Studio ne voit jamais ton numéro de carte.")}
{FAQ("Puis-je résilier quand je veux ?", "Oui, depuis Mon compte. Tu gardes Pro jusqu'à la fin de la période payée.")}
{FAQ("Et si ça ne me convient pas ?", "Le parcours est remboursé sous 14 jours sur simple demande. L'offre Classe commence par 14 jours d'essai gratuit.", True)}
</div>
</section>""", """<script>
  (function () {
    const radios = [...document.querySelectorAll('input[name="billing"]')];
    const set = () => {
      const y = radios.find((r) => r.checked).value === "annuel";
      document.querySelectorAll("[data-price-m],[data-per-m]").forEach((n) => (n.hidden = y));
      document.querySelectorAll("[data-price-y],[data-per-y]").forEach((n) => (n.hidden = !y));
      document.querySelectorAll("[data-plan-link]").forEach((a) => (a.href = `abonnement.html?plan=pro-${y ? "annuel" : "mensuel"}`));
    };
    radios.forEach((r) => r.addEventListener("change", set));
    set();
  })();
</script>
""")

page("abonnement.html", "Abonnement — Œil Studio", "tarifs", f"""<section class="{W} pt-6 lg:pt-10 pb-20">
<div class="ticket">
<div class="ticket-main">
<p class="board-strip"><span class="board-dot"></span>Abonnement · paiement sécurisé par Stripe</p>
<div id="co-checkout">
<p class="text-body-sm text-text-muted">Ta commande</p>
<h1 class="text-headline-lg-mobile md:text-headline-xl" id="co-name">Œil Pro</h1>
<p class="course-amount tabular mt-2" id="co-price">3 €</p>
<p class="text-body-md" id="co-detail"></p>
<ul class="course-list mt-6" id="co-list"></ul>
</div>
<div hidden="" id="co-success">
<p class="text-body-sm text-text-muted">Paiement confirmé</p>
<h1 class="text-big">Bienvenue dans <span id="co-ok-name">Œil Pro</span>.</h1>
<p class="mt-4 text-body-lg max-w-[34rem]">Ton offre est active. Stripe t'a envoyé le reçu par e-mail.</p>
<div class="mt-8 flex flex-wrap gap-3"><a class="btn" href="jeux.html">Jouer maintenant</a><a class="btn-line" href="compte.html">Mon compte</a></div>
</div>
</div>
<aside class="ticket-side" id="co-side">
<p class="font-medium">Ton compte</p>
<form class="flex flex-col gap-3" id="co-form">
<label class="grid gap-1 text-body-sm">Prénom<input autocomplete="given-name" class="field" id="co-first" required="" type="text"/></label>
<label class="grid gap-1 text-body-sm">Adresse e-mail<input autocomplete="email" class="field" id="co-email" required="" type="email"/></label>
<p class="text-[12px]">Le reçu et l'accès sont envoyés à cette adresse.</p>
<button class="btn w-full mt-2" type="submit">Payer avec Stripe<span aria-hidden="true" class="material-symbols-outlined text-[18px]">lock</span></button>
<p aria-live="polite" class="text-body-sm" id="co-msg"></p>
</form>
<p class="text-[12px] mt-auto">Carte bancaire ou Apple Pay. Résiliable à tout moment depuis Mon compte.</p>
<a class="btn-quiet text-[14px] w-max" href="tarifs.html">Changer d'offre</a>
</aside>
</div>
</section>""", """<script src="assets/config.js"></script>
<script src="assets/account.js"></script>
<script>
  (function () {
    const $ = (id) => document.getElementById(id);
    const PRO = ["Les 44 jeux, sans limite", "Le parcours intensif inclus", "Progression sur tous tes appareils"];
    const PLANS = {
      "pro-mensuel": { name: "Œil Pro", price: "3 €", detail: "par mois, résiliable à tout moment", plan: "pro", list: PRO },
      "pro-annuel": { name: "Œil Pro", price: "24 €", detail: "par an, soit 2 mois offerts", plan: "pro", list: PRO },
      parcours: { name: "Parcours intensif", price: "19 €", detail: "payé une fois, accès à vie", plan: "parcours", list: ["14 jours, un principe et un jeu par jour", "Fiches de synthèse", "Certificat de fin de parcours"] },
      "classe-mensuel": { name: "Offre Classe", price: "9 €", detail: "par mois et par enseignant, après 14 jours d'essai gratuit", plan: "classe", list: ["Comptes Pro pour 40 étudiants", "Parties en direct sur tous les téléphones", "Classement automatique et suivi"] },
    };
    const q = new URLSearchParams(location.search), key = q.get("plan"), P = PLANS[key];
    if (!P) { location.replace("tarifs.html"); return; }
    $("co-name").textContent = P.name; $("co-price").textContent = P.price; $("co-detail").textContent = P.detail;
    $("co-list").innerHTML = P.list.map((x) => `<li>${x}</li>`).join("");
    const u = OeilAccount.get();
    if (u) { $("co-first").value = u.name || ""; $("co-email").value = u.email || ""; }
    if (q.get("succes") === "1") {
      // Retour de Stripe. Sans serveur, l'offre est notée dans ce navigateur ; avec un backend, c'est le webhook Stripe qui l'active.
      OeilAccount.setPlan(P.plan);
      $("co-checkout").hidden = true; $("co-side").hidden = true; $("co-success").hidden = false; $("co-ok-name").textContent = P.name;
      return;
    }
    $("co-form").addEventListener("submit", (e) => {
      e.preventDefault();
      OeilAccount.login({ name: $("co-first").value.trim(), email: $("co-email").value.trim(), role: key.startsWith("classe") ? "enseignant" : (u && u.role) || "etudiant" });
      const link = (window.OEIL_CONFIG && window.OEIL_CONFIG.stripe[key]) || "";
      if (!link) { $("co-msg").textContent = "Paiement pas encore relié : ajoute le lien Stripe de cette offre dans assets/config.js."; return; }
      location.href = `${link}${link.includes("?") ? "&" : "?"}prefilled_email=${encodeURIComponent($("co-email").value.trim())}`;
    });
  })();
</script>
""")
print("ok")
