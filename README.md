# Œil Studio

Mini-jeux pour entraîner l'œil des designers : typographie, couleur, composition, UI, UX et motion.

- `site/` : le site, statique (HTML, CSS, JavaScript). C'est ce dossier que Vercel publie.
- `tools/` : les scripts Python qui génèrent les pages (voir `tools/README.md`).
- `accueil_il_studio/`, `biblioth_que_des_jeux/`, `jeu_color_recall/`, `l_il_studio/` : les maquettes Stitch d'origine.

## Voir le site en local

Ouvre `site/index.html` dans ton navigateur, ou lance un petit serveur :

```bash
cd site && python3 -m http.server 8000
```

## Mise en ligne

Le site est publié sur Vercel avec `site` comme dossier racine, sans étape de build.
Avant le lancement, remplis `site/assets/config.js` (adresse de contact, liens de paiement Stripe).
