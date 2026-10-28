# Brief pour Codex : brancher Supabase et Stripe sur Œil Studio

## Contexte
- Site statique dans `site/`, publié sur Vercel (`https://oeil-studio-site.vercel.app`) depuis le dépôt GitHub `millalion/oeil-studio`, branche `main`. Root Directory Vercel : `site`, aucune commande de build.
- Pages HTML générées par des scripts Python 3.9 dans `tools/` (voir `tools/README.md`). Ne modifie pas les `.html` à la main : modifie le générateur, puis relance les trois scripts.
- Comptes, scores, classes, classement du jour : Supabase (`site/assets/account.js`, schéma dans `supabase/schema.sql`).
- Parties en direct : Supabase Realtime en diffusion (`site/assets/live.js`), sans table.
- Paiement : fonctions Vercel dans `site/api/` (`checkout.js`, `stripe-webhook.js`, `portal.js`, `delete-account.js`, outils partagés dans `_lib.js`).
- Le guide complet pour la propriétaire est dans `MISE-EN-SERVICE.md`.

## Ce que la propriétaire fait elle-même (comptes et clés)
Ces étapes demandent de créer des comptes et de manipuler des clés secrètes : elle les fait elle-même, en suivant `MISE-EN-SERVICE.md`.
1. Créer le projet Supabase, exécuter `supabase/schema.sql`, régler Site URL et Redirect URLs.
2. Créer le compte Stripe en mode test, les 4 prix, le webhook et le portail client.
3. Saisir les variables secrètes dans Vercel : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MENSUEL`, `STRIPE_PRICE_PRO_ANNUEL`, `STRIPE_PRICE_PARCOURS`, `STRIPE_PRICE_CLASSE_MENSUEL`, `SITE_URL`.

Ne demande jamais la clé `service_role` ni les clés Stripe, et ne les écris dans aucun fichier du dépôt.

## Ce que Codex fait
1. Dans `site/assets/config.js`, renseigne `supabase.url` et `supabase.anonKey` (valeurs publiques fournies par la propriétaire), `contactEmail`, et le bloc `legal` si elle donne ses informations.
2. Vérifie `site/api/*.js` : ce sont des fonctions Vercel Node au format Web (`export async function POST(request)`), ES modules (`"type": "module"` dans `site/package.json`). Corrige-les si les journaux de build ou d'exécution Vercel montrent une erreur.
3. Commits signés `Milla Lion <lion.milla32@gmail.com>` (déjà réglé dans le dépôt). Sur l'offre Vercel Hobby, un commit d'un autre auteur est bloqué. Ne réécris pas l'historique.
4. Après le déploiement, teste dans l'ordre :
   - inscription, e-mail de confirmation, connexion ;
   - modification du profil et de l'avatar dans `compte.html` ;
   - une session de jeu, puis présence du score dans la table `scores` ;
   - partie en direct entre deux appareils (`live.html` et `rejoindre.html`) ;
   - commande en mode test avec la carte `4242 4242 4242 4242`, activation de l'offre par le webhook, puis « Gérer mon abonnement » ;
   - formulaire de contact, puis ligne dans `contact_requests`.

## Style
Textes du site en français, tutoiement, sans jargon. Conserve la direction artistique : contours fins de 1 px `#141413`, aplats de couleur, grands titres Inter Tight.
