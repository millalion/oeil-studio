// Réglages publics du site. Rien de secret ici : les clés secrètes (Stripe, clé « service_role » de Supabase)
// se règlent dans Vercel → Settings → Environment Variables, jamais dans ce fichier.
window.OEIL_CONFIG = {
  contactEmail: "bonjour@oeil.studio", // adresse affichée sur le site : remplace-la par la tienne

  // Supabase (comptes, scores, classements, parties en direct sur plusieurs appareils).
  // Supabase → Project Settings → API : copie « Project URL » et la clé « anon public ».
  supabase: {
    url: "https://jqdjfklucovswmjgqgyh.supabase.co",
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxZGpma2x1Y292c3dtamdxZ3loIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMyNzQ5NzgsImV4cCI6MjEwODg1MDk3OH0.xrkl4I4Z3OVOyWgNfDlFsgqcDTJ3WabHGK7fEq9NWQA",
  },

  // Informations légales affichées dans les mentions légales, les CGV et la page confidentialité.
  legal: {
    editeur: "", // ton prénom et ton nom
    statut: "Entrepreneur individuel (micro-entreprise)",
    adresse: "", // adresse postale complète
    siret: "", // laisse vide tant que l'immatriculation est en cours
    email: "", // adresse de contact légale (sinon contactEmail est utilisée)
    mediateur: "", // nom du médiateur de la consommation choisi
    mediateurUrl: "", // site du médiateur
  },
};
