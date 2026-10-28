// Dark Mode Repair — choisis la version sombre réussie d'un composant.
(function () {
  const card = ({ bg, surface, text, muted, accent, border = "transparent" }) => `<div class="dm-card" style="background:${bg}">
    <div class="dm-inner" style="background:${surface};border:1px solid ${border}">
      <p style="color:${text};font-weight:500;font-size:16px">Séance de typographie</p>
      <p style="color:${muted};font-size:13px;margin-top:4px">Mardi, 14 h · salle 2</p>
      <span class="dm-btn" style="background:${accent}">S'inscrire</span>
    </div></div>`;
  Oeil.kits.choice({
    id: "dark-mode-repair", name: "Dark Mode Repair",
    howto: [
      { icon: "dark_mode", text: "Chaque manche propose plusieurs versions sombres du même composant." },
      { icon: "touch_app", text: "Choisis la plus réussie : lisible, sans éblouir, avec une hiérarchie claire." },
      { icon: "lightbulb", text: "Regarde le fond (noir pur ou gris très sombre ?), la couleur d'accent (saturée ou adoucie ?) et le contraste du texte secondaire." },
    ],
    items: [
      { prompt: "Quelle version sombre est la plus réussie ?", cols: 3, options: [
          { html: card({ bg: "#121212", surface: "#1E1E1E", text: "#EDEDED", muted: "#A3A3A3", accent: "#E46A8E" }), correct: true, why: "fond gris très sombre, surface plus claire, accent adouci" },
          { html: card({ bg: "#000000", surface: "#000000", text: "#FFFFFF", muted: "#5A5A5A", accent: "#FF0055" }), why: "noir pur et blanc pur éblouissent, gris secondaire illisible" },
          { html: card({ bg: "#1E1E1E", surface: "#121212", text: "#EDEDED", muted: "#A3A3A3", accent: "#E46A8E" }), why: "la carte est plus sombre que le fond : la hiérarchie s'inverse" },
        ], explain: "En mode sombre, on évite le noir pur, on éclaircit les surfaces qui « montent » vers l'utilisateur (au lieu de leur mettre une ombre), et on désature les couleurs vives qui vibrent sur fond noir." },
      { prompt: "Quelle version garde le meilleur texte secondaire ?", cols: 3, options: [
          { html: card({ bg: "#141413", surface: "#22221F", text: "#F2F1EC", muted: "#5E5D58", accent: "#D8EF71" }), why: "le gris de la version claire est repris tel quel : contraste trop faible" },
          { html: card({ bg: "#141413", surface: "#22221F", text: "#F2F1EC", muted: "#B5B4AE", accent: "#D8EF71" }), correct: true, why: "le gris secondaire est éclairci pour rester lisible" },
          { html: card({ bg: "#141413", surface: "#22221F", text: "#F2F1EC", muted: "#F2F1EC", accent: "#D8EF71" }), why: "plus de hiérarchie entre titre et texte secondaire" },
        ], explain: "On ne peut pas reprendre les gris du thème clair : un gris moyen lisible sur blanc devient illisible sur noir. Chaque couleur de texte se recalcule pour garder au moins 4,5:1." },
      { prompt: "Quelle version sépare le mieux les surfaces ?", cols: 3, options: [
          { html: card({ bg: "#101012", surface: "#101012", text: "#ECECEC", muted: "#A0A0A8", accent: "#8FB4FF", border: "#2C2C33" }), correct: true, why: "un filet discret sépare la carte du fond" },
          { html: card({ bg: "#101012", surface: "#101012", text: "#ECECEC", muted: "#A0A0A8", accent: "#8FB4FF" }), why: "carte et fond se confondent" },
          { html: card({ bg: "#101012", surface: "#101012", text: "#ECECEC", muted: "#A0A0A8", accent: "#8FB4FF", border: "#FFFFFF" }), why: "filet blanc trop contrasté : la carte devient un cadre" },
        ], explain: "Les ombres disparaissent presque sur fond sombre : on sépare les surfaces par un palier de clarté ou un filet très discret, jamais par un contour blanc." },
    ],
  });
})();
