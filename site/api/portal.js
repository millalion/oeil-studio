// Ouvre le portail client Stripe : changer de carte, voir les factures, résilier.
import { json, stripe, admin, userFrom, origin, fail } from "./_lib.js";

export async function POST(request) {
  try {
    const user = await userFrom(request);
    const { data: profile } = await admin().from("profiles").select("stripe_customer_id").eq("id", user.id).single();
    if (!profile || !profile.stripe_customer_id) return json({ error: "Aucun abonnement à gérer pour ce compte." }, 404);
    const session = await stripe().billingPortal.sessions.create({ customer: profile.stripe_customer_id, return_url: `${origin(request)}/compte.html` });
    return json({ url: session.url });
  } catch (err) {
    return fail(err);
  }
}
