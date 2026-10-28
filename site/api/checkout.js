// Crée une session de paiement Stripe Checkout pour l'utilisateur connecté.
import { json, env, stripe, admin, userFrom, origin, fail } from "./_lib.js";

const PLANS = {
  "pro-mensuel": { price: "STRIPE_PRICE_PRO_MENSUEL", mode: "subscription", plan: "pro" },
  "pro-annuel": { price: "STRIPE_PRICE_PRO_ANNUEL", mode: "subscription", plan: "pro" },
  parcours: { price: "STRIPE_PRICE_PARCOURS", mode: "payment", plan: "parcours" },
  "classe-mensuel": { price: "STRIPE_PRICE_CLASSE_MENSUEL", mode: "subscription", plan: "classe", trial: 14 },
};

export async function POST(request) {
  try {
    const user = await userFrom(request);
    const { plan: key } = await request.json().catch(() => ({}));
    const P = PLANS[key];
    if (!P) return json({ error: "Offre inconnue." }, 400);
    const s = stripe(), db = admin();
    const { data: profile } = await db.from("profiles").select("stripe_customer_id, name").eq("id", user.id).single();
    // Un client Stripe par compte, créé au premier achat
    let customer = profile && profile.stripe_customer_id;
    if (!customer) {
      customer = (await s.customers.create({ email: user.email, name: profile && profile.name, metadata: { user_id: user.id } })).id;
      await db.from("profiles").update({ stripe_customer_id: customer }).eq("id", user.id);
    }
    const site = origin(request);
    const meta = { user_id: user.id, plan: P.plan, offer: key };
    const session = await s.checkout.sessions.create({
      mode: P.mode,
      customer,
      client_reference_id: user.id,
      line_items: [{ price: env(P.price), quantity: 1 }],
      metadata: meta,
      locale: "fr",
      allow_promotion_codes: true,
      ...(P.mode === "subscription"
        ? { subscription_data: { metadata: meta, ...(P.trial ? { trial_period_days: P.trial } : {}) } }
        : { payment_intent_data: { metadata: meta }, invoice_creation: { enabled: true } }),
      success_url: `${site}/abonnement.html?succes=1&plan=${key}`,
      cancel_url: `${site}/abonnement.html?plan=${key}`,
    });
    return json({ url: session.url });
  } catch (err) {
    return fail(err);
  }
}
