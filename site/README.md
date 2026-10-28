# Œil Studio — site

Site statique construit à partir des maquettes Stitch (Tailwind via CDN, aucune installation).

## Ouvrir le site

- Double-clique sur `index.html` : il s'ouvre dans ton navigateur.
- Ou lance un petit serveur depuis ce dossier, puis va sur http://localhost:8000 :

```bash
python3 -m http.server 8000
```

Après une modification, recharge avec **Cmd + Maj + R** : sinon le navigateur peut garder l'ancienne version des fichiers de `assets/`.

## Pages

| Fichier | Contenu |
| --- | --- |
| `index.html` | Accueil |
| `jeux.html` | Les 44 jeux, filtres et création de mélange |
| `<jeu>.html` | Une page par jeu (liste dans `assets/catalog.js`) |
| `defi.html` | Défi du jour (page d'entrée, série), mélanges et défis reçus par lien |
| `live.html` / `rejoindre.html` | Partie en direct : écran de l'hôte (code, QR code, classement, podium) et page des joueurs |
| `profs.html` | Offre écoles : partie en direct, session en différé, classement par codes, offres |
| `parcours.html` | Le parcours intensif de 14 jours |
| `connexion.html` / `compte.html` | Connexion, inscription, records et historique |
| `contact.html` | Contact, essai et estimation de devis |
| `mentions-legales.html` / `confidentialite.html` | Modèles à compléter |

## Système visuel (v2)

- **Une famille** : Inter Tight (Newsreader seulement pour les mots de Kern Clinic).
- **Une encre, un fond, un signal** : `ink` #141413, `ground` #F7F6F2, `signal` #F0447A (sélection, résultat).
- **Trois aplats** qui identifient les disciplines : citron (couleur), bleu (composition), rose (typographie).
- Titres géants : `text-mega` (accueil, bibliothèque) s'ajuste à la largeur grâce à `data-fit` dans `assets/site.js` ; `text-big` pour les titres de section.
- Aplats pleine largeur : noir (accueil, bibliothèque, pied de page), citron, rose, bleu ; bandeau à la couleur de la discipline en tête de chaque jeu (`.game-band`).
- Pas d'ombres ni de dégradés : les surfaces se séparent par un palier de ton. Boutons noirs, coins de 4px (`.btn`).
- Les anciennes versions sont sauvegardées dans `../.backup-v1/` et `../.backup-v2/`.

## Les jeux

- `assets/engine.js` : le moteur commun (manches, consigne, aide « Comment jouer », résultat sur le plateau, bilan, record personnel, raccourcis).
- `assets/games/<jeu>.js` : un fichier par jeu, avec `setup` (tirer une manche), `mount` (dessiner le plateau), `evaluate` (noter) et `reveal` (montrer la correction).
- `assets/catalog.js` : la liste des jeux (nom, discipline, niveau, durée, description).

**Ajouter un jeu** : écris `assets/games/mon-jeu.js` sur le modèle d'un jeu existant, ajoute sa ligne dans `assets/catalog.js`, puis duplique une page de jeu (par exemple `hue-line.html`) en changeant le titre, la couleur `--field` et le script chargé en bas de page.

## Gabarits de jeux

`assets/kits.js` fournit quatre gabarits : `choice` (choisir), `hunt` (repérer les erreurs), `order` (remettre dans l'ordre), `assign` (glisser des étiquettes). Un jeu basé sur un gabarit ne décrit que son contenu (voir `assets/games/microcopy-duel.js`).

## Ce qu'il faudra brancher côté serveur

- `assets/live.js` : les trois fonctions marquées « SERVEUR » (publier, lire, s'abonner) pour jouer en direct sur plusieurs appareils.
- `assets/account.js` : connexion, inscription, mot de passe oublié.
- Classement automatique des classes, paiement des offres.

## Défis et classes, sans serveur

- `assets/seed.js` donne une graine à chaque session : un lien de défi (`#c=…`) contient la graine, les jeux et le score à battre, et rejoue exactement les mêmes manches.
- Une session de classe ajoute un code de session ; en fin de partie, l'étudiant copie un **code résultat** que l'enseignant colle dans `profs.html` pour construire le classement (enregistré dans son navigateur, export CSV).
- Le classement automatique et les comptes demanderont un serveur : c'est ce que vendent les offres Classe et École.

**À remplacer avant la mise en ligne** : l'adresse provisoire `bonjour@oeil.studio` (formulaire de `contact.html`), les prix d'exemple (3 €/mois, 19 €, 9 €/mois, dès 690 €/an) et les éléments entre crochets des pages légales.

## Où modifier quoi

- `assets/tailwind-config.js` : couleurs, polices et espacements du thème (partagés par toutes les pages).
- `assets/site.js` : date du « défi du jour ».
- L'en-tête et le pied de page sont copiés dans chaque page : une modification doit être reportée dans les 4 fichiers HTML.
