// Supprime le compte de l'utilisateur connecté, ses scores, et résilie son abonnement éventuel.
import { json, stripe, admin, userFrom, fail } from "./_lib.js";

export async function POST(request) {
  try {
    const user = await userFrom(request);
    const db = admin();
    const { data: profile } = await db.from("profiles").select("stripe_subscription_id").eq("id", user.id).single();
    if (profile && profile.stripe_subscription_id && process.env.STRIPE_SECRET_KEY) {
      try { await stripe().subscriptions.cancel(profile.stripe_subscription_id); } catch (e) { console.error(e); }
    }
    const { error } = await db.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ deleted: true });
  } catch (err) {
    return fail(err);
  }
}
