// Form Rescue — choisis le champ de formulaire le mieux conçu : libellé, aide, message d'erreur.
(function () {
  const field = ({ label = "", ph = "", value = "", help = "", error = "", labelIn = false, red = false }) => `<div class="fr-field">
    ${label && !labelIn ? `<span class="fr-label">${label}</span>` : ""}
    <span class="fr-input${error || red ? " is-error" : ""}">${value || `<i>${labelIn ? label : ph}</i>`}</span>
    ${help ? `<span class="fr-help">${help}</span>` : ""}${error ? `<span class="fr-error">${error}</span>` : ""}</div>`;
  Oeil.kits.choice({
    id: "form-rescue", name: "Form Rescue",
    howto: [
      { icon: "edit_note", text: "Chaque manche montre plusieurs versions du même champ de formulaire." },
      { icon: "touch_app", text: "Choisis celle qui aide le mieux la personne à remplir sans se tromper." },
      { icon: "check", text: "Valide : chaque version est commentée." },
    ],
    items: [
      { prompt: "Quel champ « date de naissance » est le plus clair ?", cols: 3, options: [
          { html: field({ label: "Date de naissance", ph: "JJ/MM/AAAA", help: "Par exemple : 14/07/1995" }), correct: true, why: "libellé visible, format indiqué, exemple" },
          { html: field({ label: "Date de naissance", labelIn: true }), why: "le libellé disparaît dès qu'on tape" },
          { html: field({ label: "Date", ph: "..." }), why: "on ne sait ni quelle date, ni quel format" },
        ], explain: "Un libellé placé dans le champ (placeholder) disparaît à la saisie : on ne sait plus ce qu'on remplit. Le format attendu s'écrit à côté du champ, pas seulement dans le message d'erreur." },
      { prompt: "Quel message d'erreur est le plus utile ?", cols: 3, options: [
          { html: field({ label: "Adresse e-mail", value: "lea@atelier", error: "Il manque la fin de l'adresse, par exemple lea@atelier.fr" }), correct: true, why: "dit ce qui ne va pas et comment corriger" },
          { html: field({ label: "Adresse e-mail", value: "lea@atelier", error: "Erreur de saisie." }), why: "ne dit pas quoi corriger" },
          { html: field({ label: "Adresse e-mail", value: "lea@atelier", red: true }), why: "seule la couleur signale l'erreur" },
        ], explain: "Un bon message d'erreur dit ce qui ne va pas et comment le corriger, sans accuser. La couleur seule ne suffit pas : une partie des gens ne la perçoit pas." },
      { prompt: "Quel champ « mot de passe » aide le mieux ?", cols: 3, options: [
          { html: field({ label: "Mot de passe", value: "••••••", help: "12 caractères minimum. Tu peux utiliser une phrase." }), correct: true, why: "la règle est visible avant l'erreur" },
          { html: field({ label: "Mot de passe", value: "••••••", error: "Mot de passe invalide." }), why: "la règle n'apparaît qu'après l'échec" },
          { html: field({ label: "Mot de passe", value: "••••••", help: "Doit contenir une majuscule, un chiffre, un symbole, sans espace, 8 à 14 caractères." }), why: "règles longues et contraignantes" },
        ], explain: "Les contraintes s'affichent avant la saisie, à côté du champ, et restent raisonnables : une longueur minimale protège mieux qu'une liste de règles qui pousse à noter le mot de passe." },
      { prompt: "Quelle mise en forme des champs « nom » est la plus claire ?", cols: 3, options: [
          { html: `<div class="fr-pair">${field({ label: "Prénom", value: "Léa" })}${field({ label: "Nom", value: "Martin" })}</div>`, correct: true, why: "deux champs, deux libellés" },
          { html: field({ label: "Nom complet", value: "Léa Martin", help: "Prénom puis nom" }), correct: true, why: "un seul champ, accepté aussi : plus inclusif pour les noms composés" },
          { html: `<div class="fr-pair">${field({ label: "Nom", labelIn: true })}${field({ label: "Prénom", labelIn: true })}</div>`, why: "libellés dans les champs, ordre inversé" },
        ], explain: "Plusieurs solutions sont justes ici : deux champs bien libellés, ou un seul champ « nom complet », plus souple pour les noms d'autres cultures. Ce qui est faux, ce sont les libellés qui disparaissent." },
    ],
  });
})();
