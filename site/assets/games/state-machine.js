// State Machine — reconnais les états d'un composant : normal, survol, focus, désactivé, erreur, chargement.
(function () {
  const states = {
    normal: { label: "Normal", btn: "background:#141413;color:#fff", input: "border:1px solid #8A8983" },
    hover: { label: "Survol", btn: "background:#4A4945;color:#fff;box-shadow:0 3px 0 #141413;transform:translateY(-2px)", input: "border:1px solid #141413;background:#F0EFEA" },
    focus: { label: "Focus clavier", btn: "background:#141413;color:#fff;outline:2px solid #F0447A;outline-offset:3px", input: "border:1px solid #141413;outline:2px solid #F0447A;outline-offset:2px" },
    disabled: { label: "Désactivé", btn: "background:#D8D7CF;color:#8A8983", input: "border:1px dashed #CFCEC6;color:#B5B4AE;background:#F0EFEA" },
    error: { label: "Erreur", btn: "background:#C4222B;color:#fff", input: "border:2px solid #C4222B" },
    loading: { label: "Chargement", btn: "background:#141413;color:#fff;opacity:.85", input: "border:1px solid #8A8983" },
  };
  const btn = (k) => `<span class="sm-btn" style="${states[k].btn}">${k === "loading" ? '<span class="sm-spin"></span>Envoi…' : k === "error" ? '<span class="material-symbols-outlined" style="font-size:16px">error</span>Réessayer' : "Envoyer"}</span>`;
  const input = (k) => `<span class="sm-input" style="${states[k].input}">${k === "loading" ? 'lea@atelier.fr<span class="sm-spin sm-spin-dark"></span>' : k === "disabled" ? "Non modifiable" : "lea@atelier.fr"}</span>${k === "error" ? '<small class="sm-err">Adresse introuvable</small>' : ""}`;
  const item = (keys, kind, prompt, explain) => ({
    prompt, layout: "grid", explain,
    slots: Oeil.shuffle(keys).map((k, i) => ({ id: `v${k}`, html: kind === "btn" ? btn(k) : input(k) })),
    tokens: keys.map((k) => ({ id: k, html: states[k].label, slot: `v${k}` })),
  });
  Oeil.kits.assign({
    id: "state-machine", name: "State Machine",
    howto: [
      { icon: "toggle_on", text: "Le même composant est montré dans plusieurs états." },
      { icon: "drag_pan", text: "Glisse chaque nom d'état sous le rendu qui lui correspond." },
      { icon: "lightbulb", text: "Chaque état doit se distinguer des autres sans dépendre de la couleur seule." },
    ],
    items: [
      item(["normal", "hover", "focus", "disabled"], "btn", "Nomme les états de ce bouton", "Survol et focus ne doivent pas se ressembler : le survol suit la souris, le focus montre où l'on est au clavier. Le focus doit rester visible même sans survol."),
      item(["normal", "focus", "error", "disabled"], "input", "Nomme les états de ce champ", "Un champ en erreur se signale par la bordure, mais aussi par un texte : la couleur seule ne suffit pas. Le champ désactivé se distingue par sa forme (pointillés, fond grisé)."),
      item(["normal", "hover", "loading", "error"], "btn", "Nomme les états de ce bouton d'envoi", "L'état de chargement garde la taille du bouton et remplace le libellé par une indication de progression : la mise en page ne doit pas sauter."),
    ],
  });
})();
