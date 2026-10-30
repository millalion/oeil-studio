// UI Detective — une interface contient des incohérences de système : à toi de les trouver.
(function () {
  const btn = (txt, style, h = "ok", why = "") => `<span class="uix-btn" data-h="${h}"${why ? ` data-why="${why}"` : ""} style="${style}">${txt}</span>`;
  const BASE = "background:#141413;color:#fff;border-radius:4px;padding:10px 16px;font-size:14px;font-weight:500";
  const GHOST = "border:1px solid #141413;border-radius:4px;padding:9px 16px;font-size:14px;font-weight:500";
  Oeil.kits.hunt({
    id: "ui-detective", name: "UI Detective",
    howto: [
      { icon: "search", text: "Cet écran suit un système : mêmes arrondis, mêmes tailles, même casse, mêmes alignements. Quelques éléments s'en écartent." },
      { icon: "touch_app", text: "Clique sur chaque élément incohérent avec le reste de l'écran." },
      { icon: "check", text: "Valide : chaque incohérence est expliquée." },
    ],
    items: [
      { prompt: "Trouve les éléments incohérents de cette page de réglages", html: `<div class="uix-screen">
        <p class="uix-h">Réglages du compte</p>
        <div class="uix-field"><span class="uix-label" data-h="ok">Nom affiché</span><span class="uix-input">Léa Martin</span></div>
        <div class="uix-field"><span class="uix-label" data-h="bad" data-why="casse : Title Case au lieu de la casse de phrase">Adresse E-Mail</span><span class="uix-input">lea@atelier.fr</span></div>
        <div class="uix-field"><span class="uix-label" data-h="ok">Langue</span><span class="uix-input">Français</span></div>
        <div class="uix-actions">${btn("Annuler", GHOST)}${btn("Enregistrer", BASE.replace("border-radius:4px", "border-radius:999px"), "bad", "arrondi : 999 px au lieu de 4 px")}</div>
        <p class="uix-foot" data-h="ok">Dernière modification le 12 octobre.</p></div>`,
        explain: "Un système se casse par petites touches : une casse différente ici, un arrondi là. Chaque exception oblige l'œil à se demander si elle a un sens." },
      { prompt: "Trouve les éléments incohérents de cette liste de projets", html: `<div class="uix-screen">
        <p class="uix-h">Projets récents</p>
        <div class="uix-item"><span class="material-symbols-outlined" data-h="ok" style="font-size:20px">folder</span><span>Affiche Bauhaus</span><span class="uix-meta">il y a 2 j</span></div>
        <div class="uix-item"><span class="material-symbols-outlined" data-h="bad" data-why="icône plus grande (28 px au lieu de 20)" style="font-size:28px">folder</span><span>Identité Lumen</span><span class="uix-meta">il y a 5 j</span></div>
        <div class="uix-item" style="padding-left:14px" data-h="bad" data-why="retrait de 14 px : la ligne n'est plus alignée"><span class="material-symbols-outlined" style="font-size:20px">folder</span><span>Catalogue 2025</span><span class="uix-meta">il y a 1 sem.</span></div>
        <div class="uix-item"><span class="material-symbols-outlined" data-h="ok" style="font-size:20px">folder</span><span>Site Atelier</span><span class="uix-meta" data-h="bad" data-why="format de date différent">03/10/2025</span></div></div>`,
        explain: "Dans une liste, l'œil compare chaque ligne à la précédente : une icône plus grande, un retrait ou un format de date différent se voient immédiatement, même si chacun paraît « correct » seul." },
      { prompt: "Trouve les éléments incohérents de cette carte d'offre", html: `<div class="uix-screen uix-card">
        <p class="uix-tag" data-h="ok">Populaire</p>
        <p class="uix-price" data-h="ok">9 € <small>/ mois</small></p>
        <ul class="uix-list"><li data-h="ok">Sessions illimitées</li><li data-h="bad" data-why="point final : les autres lignes n'en ont pas">Classement automatique.</li><li data-h="ok">Comptes étudiants</li></ul>
        <div class="uix-actions">${btn("Choisir cette offre", BASE)}</div>
        <p class="uix-foot" data-h="bad" data-why="couleur hors palette (#3D7BFF)" style="color:#3D7BFF">Voir les conditions</p></div>`,
        explain: "La ponctuation des listes et la couleur des liens font partie du système au même titre que les marges. Une seule exception suffit à donner une impression de bricolage." },
      { prompt: "Trouve les éléments incohérents de cette barre d'outils", html: `<div class="uix-screen">
        <div class="uix-toolbar">
          <span class="uix-tool" data-h="ok"><span class="material-symbols-outlined">format_bold</span></span>
          <span class="uix-tool" data-h="ok"><span class="material-symbols-outlined">format_italic</span></span>
          <span class="uix-tool" data-h="bad" data-why="icône pleine au milieu d'icônes au trait"><span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">format_underlined</span></span>
          <span class="uix-tool" data-h="ok"><span class="material-symbols-outlined">format_list_bulleted</span></span>
          <span class="uix-tool" data-h="bad" data-why="bouton de 32 px au lieu de 40" style="width:32px;height:32px"><span class="material-symbols-outlined" style="font-size:18px">link</span></span>
          <span class="uix-tool" data-h="ok"><span class="material-symbols-outlined">image</span></span>
        </div><p class="uix-foot">Éditeur de texte</p></div>`,
        explain: "Une barre d'outils est une famille : même taille de cible, même style d'icône. Une icône pleine ou un bouton plus petit attire l'œil sans raison et brouille la hiérarchie." },
    ],
  });
})();
