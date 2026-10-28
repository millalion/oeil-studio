# Mise en service : comptes, paiement, parties en direct

Le site fonctionne déjà sans ces réglages (jeux, défi du jour, progression sur l'appareil).
Ces trois étapes activent les vrais comptes, le paiement Stripe et les parties en direct sur plusieurs téléphones.
Compte environ 30 minutes.

## 1. Supabase : comptes, scores, classements, direct

1. Va sur supabase.com, clique sur **Start your project** et connecte-toi avec GitHub.
2. **New project** : nom `oeil-studio`, choisis un mot de passe (garde-le), région **West EU (Paris)**, offre gratuite.
3. Menu **SQL Editor** → **New query** : colle tout le fichier `supabase/schema.sql`, puis **Run**. « Success » doit s'afficher.
4. Menu **Authentication** → **URL Configuration** :
   - Site URL : `https://oeil-studio-site.vercel.app`
   - Redirect URLs : ajoute `https://oeil-studio-site.vercel.app/**`
5. Menu **Project Settings** → **API** : note ces trois valeurs.
   - **Project URL** et la clé **anon public** : elles sont publiques, elles vont dans `site/assets/config.js`.
   - La clé **service_role** : elle est secrète. Elle va seulement dans Vercel (étape 3). Ne la colle jamais dans le site ni dans une conversation.

Les e-mails de confirmation partent du serveur de Supabase, limité à quelques envois par heure. Avant d'ouvrir le site au public, branche un service d'envoi dans **Authentication** → **Emails** → **SMTP Settings** (Brevo et Resend ont une offre gratuite).

## 2. Stripe : paiement

1. Crée ton compte sur dashboard.stripe.com. Tu peux tout régler en **mode test** dès maintenant ; l'activation des vrais paiements demandera ton SIRET.
2. **Catalogue de produits** → **Ajouter un produit**, quatre fois :

   | Produit | Prix | Type |
   |---|---|---|
   | Œil Pro | 3,00 € | récurrent, mensuel |
   | Œil Pro (même produit, 2e prix) | 24,00 € | récurrent, annuel |
   | Parcours intensif | 19,00 € | ponctuel |
   | Offre Classe | 9,00 € | récurrent, mensuel |

   Pour chaque prix, copie son identifiant `price_…`.
3. **Développeurs** → **Clés API** : copie la **clé secrète** (`sk_test_…`, puis `sk_live_…` une fois le compte activé).
4. **Développeurs** → **Webhooks** → **Ajouter une destination** :
   - URL : `https://oeil-studio-site.vercel.app/api/stripe-webhook`
   - Événements : `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
   - Copie le **secret de signature** (`whsec_…`).
5. **Paramètres** → **Facturation** → **Portail client** : active-le, autorise la résiliation et le changement de carte.
6. **Paramètres** → **Virements** : ajoute ton IBAN. Stripe y verse automatiquement l'argent encaissé, moins ses frais.

## 3. Vercel : variables secrètes

Dans ton projet Vercel → **Settings** → **Environment Variables**, ajoute :

| Nom | Valeur |
|---|---|
| `SUPABASE_URL` | Project URL de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | clé service_role de Supabase |
| `STRIPE_SECRET_KEY` | clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | secret de signature du webhook |
| `STRIPE_PRICE_PRO_MENSUEL` | `price_…` à 3 €/mois |
| `STRIPE_PRICE_PRO_ANNUEL` | `price_…` à 24 €/an |
| `STRIPE_PRICE_PARCOURS` | `price_…` à 19 € |
| `STRIPE_PRICE_CLASSE_MENSUEL` | `price_…` à 9 €/mois |
| `SITE_URL` | `https://oeil-studio-site.vercel.app` (ou ton nom de domaine) |

Puis **Deployments** → les trois points du dernier déploiement → **Redeploy**.

## 4. Le fichier `site/assets/config.js`

Remplis `supabase.url`, `supabase.anonKey`, ton adresse `contactEmail` et le bloc `legal` (nom, adresse, SIRET dès que tu l'as, médiateur de la consommation). Ces informations s'affichent dans les mentions légales, les CGV et la page confidentialité. Ensuite, dans GitHub Desktop : **Commit to main**, puis **Push origin**.

## Au quotidien

- **Demandes de contact et de devis** : Supabase → **Table Editor** → `contact_requests`.
- **Offre École** (sur devis) : Supabase → **Table Editor** → `profiles` → passe la colonne `plan` de l'enseignant à `ecole`.
- **Abonnés et paiements** : tableau de bord Stripe.
- **Passer en vrais paiements** : remplace dans Vercel la clé `sk_test_…` par `sk_live_…`, recrée les prix et le webhook en mode production, puis redéploie.
