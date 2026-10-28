// Reçoit les événements Stripe et met à jour l'offre du compte dans Supabase.
// Dans Stripe → Développeurs → Webhooks, l'adresse est https://TON-DOMAINE/api/stripe-webhook.
import { json, env, stripe, admin } from "./_lib.js";

const ACTIVE = ["active", "trialing", "past_due"];

export async function POST(request) {
  const s = stripe(), db = admin();
  let event;
  try {
    event = s.webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature"), env("STRIPE_WEBHOOK_SECRET"));
  } catch (err) {
    return json({ error: "Signature invalide" }, 400);
  }
  try {
    const obj = event.data.object;
    if (event.type === "checkout.session.completed") {
      const uid = obj.client_reference_id || (obj.metadata && obj.metadata.user_id);
      const plan = obj.metadata && obj.metadata.plan;
      if (uid && plan === "parcours") await db.from("profiles").update({ parcours: true, stripe_customer_id: obj.customer }).eq("id", uid);
      else if (uid && plan) await db.from("profiles").update({ plan, plan_until: null, stripe_customer_id: obj.customer, stripe_subscription_id: obj.subscription }).eq("id", uid);
    }
    if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
      const live = event.type === "customer.subscription.updated" && ACTIVE.includes(obj.status);
      const plan = live ? (obj.metadata && obj.metadata.plan) || "pro" : "free";
      await db.from("profiles").update({ plan, plan_until: null, stripe_subscription_id: live ? obj.id : null }).eq("stripe_customer_id", obj.customer);
    }
    return json({ received: true });
  } catch (err) {
    console.error(err);
    return json({ error: "Traitement impossible" }, 500);
  }
}
