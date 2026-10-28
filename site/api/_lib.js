// Outils partagés des fonctions serveur (les fichiers commençant par « _ » ne sont pas publiés comme routes).
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

export function env(name) {
  const v = process.env[name];
  if (!v) throw Object.assign(new Error(`Variable d'environnement manquante : ${name}`), { status: 500, public: "Le paiement n'est pas encore configuré sur le serveur." });
  return v;
}

export const stripe = () => new Stripe(env("STRIPE_SECRET_KEY"));
// Client Supabase avec la clé service_role : il contourne les règles d'accès, à n'utiliser que côté serveur.
export const admin = () => createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });

// Vérifie le jeton de connexion envoyé par le navigateur et renvoie l'utilisateur Supabase.
export async function userFrom(request) {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) throw Object.assign(new Error("no token"), { status: 401, public: "Connecte-toi pour continuer." });
  const { data, error } = await admin().auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error("bad token"), { status: 401, public: "Ta session a expiré : reconnecte-toi." });
  return data.user;
}

export const origin = (request) => process.env.SITE_URL || new URL(request.url).origin;

export function fail(err) {
  console.error(err);
  return json({ error: err.public || "Erreur du serveur. Réessaie dans un instant." }, err.status || 500);
}
