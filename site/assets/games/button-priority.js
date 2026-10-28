// Button Priority — attribue à chaque action son niveau : principal, secondaire, tertiaire, destructif.
(function () {
  const STYLES = {
    primary: { label: "Principal", css: "background:#141413;color:#fff;border:1px solid #141413" },
    secondary: { label: "Secondaire", css: "background:#fff;color:#141413;border:1px solid #141413" },
    tertiary: { label: "Tertiaire", css: "background:transparent;color:#141413;border:1px solid transparent;text-decoration:underline;text-underline-offset:4px" },
    danger: { label: "Destructif", css: "background:#fff;color:#C4222B;border:1px solid #C4222B" },
  };
  const action = (label) => (t) => `<span class="bp-btn" style="${t ? STYLES[t.style].css : "border:1px dashed #CFCEC6;color:#8A8983"}">${label}</span>`;
  const item = (title, text, actions, explain) => ({
    prompt: `${title} : donne à chaque bouton son niveau`, layout: "dialog", explain,
    context: text,
    slots: actions.map(([label]) => ({ id: label, label, render: action(label) })),
    tokens: actions.map(([label, style]) => ({ id: `${style}-${label}`, style, html: `<span class="bp-mini" style="${STYLES[style].css}">Aa</span>${STYLES[style].label}`, slot: label })),
  });
  Oeil.kits.assign({
    id: "button-priority", name: "Button Priority",
    howto: [
      { icon: "smart_button", text: "Un écran propose plusieurs actions. Chacune a une importance différente." },
      { icon: "drag_pan", text: "Glisse chaque style de bouton (principal, secondaire, tertiaire, destructif) sur l'action qui lui convient." },
      { icon: "lightbulb", text: "Un seul bouton principal par écran : c'est l'action que la plupart des gens viennent faire." },
    ],
    items: [
      item("Fenêtre « Supprimer le projet »", "", [["Supprimer définitivement", "danger"], ["Annuler", "secondary"], ["En savoir plus", "tertiary"]], "Une action destructive a son propre style (rouge, mais pas forcément plein) pour éviter le clic réflexe. L'action la plus sûre, Annuler, reste bien visible."),
      item("Page de paiement", "", [["Payer 19 €", "primary"], ["Modifier le panier", "secondary"], ["Conditions de vente", "tertiary"]], "L'action principale est celle qui fait avancer la tâche : payer. Les retours en arrière sont secondaires, les liens d'information tertiaires."),
      item("Brouillon non enregistré", "", [["Enregistrer", "primary"], ["Ne pas enregistrer", "danger"], ["Annuler", "secondary"]], "« Ne pas enregistrer » fait perdre du travail : c'est une action destructive, même si elle s'exprime par une négation."),
      item("Invitation à une équipe", "", [["Rejoindre l'équipe", "primary"], ["Refuser", "secondary"], ["Signaler", "danger"], ["Plus tard", "tertiary"]], "Refuser n'est pas destructif : c'est une réponse normale, donc secondaire. Signaler a des conséquences pour l'autre personne : on le distingue."),
    ],
  });
})();
