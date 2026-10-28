# Génération des pages

Depuis le dossier `site` :

```bash
python3 ../tools/build4.py "$PWD" ../tools && python3 ../tools/build_pages.py "$PWD" ../tools && python3 ../tools/build_pricing.py "$PWD" ../tools
```

`redesign.py` contient l’en-tête, le pied de page et la tête HTML communs ; `build4.py` génère les jeux, la bibliothèque, l’accueil, le défi, les écoles et le parcours ; `build_pages.py` génère, via `pages_app.py`, le direct, la connexion, le compte, le contact et les pages légales ; `build_pricing.py` génère les tarifs et la commande.
