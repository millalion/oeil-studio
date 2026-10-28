// Compte utilisateur : authentification, profil, offre, scores et classes, via Supabase.
// Le profil est gardé en cache dans le navigateur (oeil:account) pour que les pages s'affichent sans attendre ;
// il est rafraîchi depuis Supabase à chaque chargement. L'offre (plan) n'est modifiable que par le webhook Stripe.
(function () {
  const CFG = window.OEIL_CONFIG || {};
  const SB = CFG.supabase || {};
  const enabled = !!(SB.url && SB.anonKey);
  const KEY = "oeil:account", GUEST = "oeil:profile";
  const PRO_PLANS = ["pro", "parcours", "classe", "ecole", "classe-eleve"];
  const COLORS = ["#F7B4CC", "#D8EF71", "#B9D9FF", "#FFC08F", "#FFE08A", "#9FE3D0", "#C9B8FF", "#F0447A"];
  const ICONS = ["visibility", "palette", "grid_view", "format_size", "gesture", "bolt", "local_florist", "rocket_launch"];
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  const write = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const emit = () => document.dispatchEvent(new CustomEvent("oeil:account", { detail: read(KEY) }));
  const fail = (msg) => { const e = new Error(msg); e.userMessage = msg; return e; };
  const MESSAGES = {
    "Invalid login credentials": "Adresse e-mail ou mot de passe incorrect.",
    "Email not confirmed": "Confirme d'abord ton adresse : un lien t'a été envoyé par e-mail.",
    "User already registered": "Un compte existe déjà avec cette adresse. Connecte-toi.",
    "Password should be at least": "Le mot de passe est trop court.",
    "For security purposes": "Trop de tentatives : réessaie dans une minute.",
  };
  const human = (err) => {
    if (err && err.userMessage) return err.userMessage;
    const m = (err && err.message) || "";
    const k = Object.keys(MESSAGES).find((x) => m.includes(x));
    return k ? MESSAGES[k] : "Une erreur est survenue. Réessaie dans un instant.";
  };

  // ---------- Client Supabase, chargé à la demande ----------
  let client = null, loading = null;
  function lib() {
    if (window.supabase && window.supabase.createClient) return Promise.resolve(window.supabase);
    if (!loading) loading = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js";
      s.onload = () => resolve(window.supabase);
      s.onerror = () => reject(fail("Connexion au service de comptes impossible. Vérifie ta connexion internet."));
      document.head.appendChild(s);
    });
    return loading;
  }
  async function sb() {
    if (!enabled) throw fail("Les comptes ne sont pas encore ouverts sur ce site.");
    if (client) return client;
    const L = await lib();
    client = L.createClient(SB.url, SB.anonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, storageKey: "oeil-auth" } });
    client.auth.onAuthStateChange((event) => { if (event === "SIGNED_OUT") { write(KEY, null); emit(); } });
    return client;
  }
  const hasSession = () => { try { return !!localStorage.getItem("oeil-auth") || /access_token|code=/.test(location.hash + location.search); } catch (e) { return false; } };

  // ---------- Profil ----------
  async function refresh() {
    if (!enabled) return read(KEY);
    const c = await sb();
    const { data: { session } } = await c.auth.getSession();
    if (!session) { if (read(KEY)) { write(KEY, null); emit(); } return null; }
    const uid = session.user.id;
    const [{ data: p }, { data: access }] = await Promise.all([
      c.from("profiles").select("name, role, avatar_color, avatar_icon, plan, parcours, stripe_customer_id").eq("id", uid).maybeSingle(),
      c.rpc("my_access"),
    ]);
    const u = {
      id: uid, email: session.user.email,
      name: (p && p.name) || session.user.email.split("@")[0],
      role: (p && p.role) || "etudiant",
      avatar: { color: (p && p.avatar_color) || COLORS[0], icon: (p && p.avatar_icon) || "" },
      plan: access || "free", billing: !!(p && p.stripe_customer_id),
    };
    write(KEY, u);
    write("oeil:name", u.name);
    emit();
    return u;
  }

  const api = {
    enabled, COLORS, ICONS, human,
    get: () => read(KEY),
    client: () => (enabled ? sb() : Promise.resolve(null)),
    // Identité affichée en partie en direct et dans les défis, avec ou sans compte.
    identity() {
      const u = read(KEY), g = read(GUEST) || {};
      return { name: (u && u.name) || g.name || read("oeil:name") || "", avatar: (u && u.avatar) || g.avatar || { color: COLORS[2], icon: "" } };
    },
    setGuest({ name, avatar }) { const g = read(GUEST) || {}; if (name != null) { g.name = name; write("oeil:name", name); } if (avatar) g.avatar = avatar; write(GUEST, g); emit(); },
    plan() { const u = read(KEY); return (u && u.plan) || "free"; },
    isPro() { return PRO_PLANS.includes(this.plan()); },
    refresh,
    async signUp({ name, email, password, role, avatar }) {
      const c = await sb();
      const { data, error } = await c.auth.signUp({
        email, password,
        options: { data: { name, role, avatar_color: avatar && avatar.color, avatar_icon: avatar && avatar.icon }, emailRedirectTo: location.origin + "/compte.html" },
      });
      if (error) throw error;
      if (data.user && data.user.identities && !data.user.identities.length) throw fail("Un compte existe déjà avec cette adresse. Connecte-toi.");
      if (data.session) await refresh();
      return { confirm: !data.session };
    },
    async signIn({ email, password }) {
      const c = await sb();
      const { error } = await c.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return refresh();
    },
    async signOut() { if (enabled) { const c = await sb(); await c.auth.signOut(); } write(KEY, null); emit(); },
    async resetPassword(email) {
      const c = await sb();
      const { error } = await c.auth.resetPasswordForEmail(email, { redirectTo: location.origin + "/connexion.html#nouveau" });
      if (error) throw error;
    },
    async updatePassword(password) { const c = await sb(); const { error } = await c.auth.updateUser({ password }); if (error) throw error; },
    async updateProfile({ name, role, avatar }) {
      const c = await sb(); const u = read(KEY);
      if (!u) throw fail("Connecte-toi d'abord.");
      const patch = {};
      if (name != null) patch.name = String(name).slice(0, 40);
      if (role) patch.role = role;
      if (avatar) { patch.avatar_color = avatar.color; patch.avatar_icon = avatar.icon || ""; }
      const { error } = await c.from("profiles").update(patch).eq("id", u.id);
      if (error) throw error;
      return refresh();
    },
    async token() { const c = await sb(); const { data: { session } } = await c.auth.getSession(); return session && session.access_token; },
    // ---------- Paiement (fonctions serveur dans /api) ----------
    async checkout(plan) {
      const t = await this.token();
      if (!t) throw fail("Connecte-toi pour payer : l'offre sera rattachée à ton compte.");
      const r = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + t }, body: JSON.stringify({ plan }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw fail(j.error || "Le paiement n'a pas pu démarrer. Réessaie dans un instant.");
      location.href = j.url;
    },
    async portal() {
      const t = await this.token();
      const r = await fetch("/api/portal", { method: "POST", headers: { Authorization: "Bearer " + t } });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.url) throw fail(j.error || "Impossible d'ouvrir la gestion de l'abonnement.");
      location.href = j.url;
    },
    // ---------- Scores ----------
    async saveScore(entry) {
      const u = read(KEY);
      if (!enabled || !u) return;
      try {
        const c = await sb();
        await c.from("scores").insert({ game_id: entry.id, title: entry.title, avg: entry.avg, rounds: entry.rounds || null, mode: entry.mode || "solo", day: entry.day || null });
      } catch (e) {}
    },
    async scores() {
      const u = read(KEY);
      if (!enabled || !u) return [];
      const c = await sb();
      const { data } = await c.from("scores").select("game_id, title, avg, rounds, mode, day, created_at").order("created_at", { ascending: false }).limit(1000);
      return data || [];
    },
    async dailyBoard(day) {
      if (!enabled) return [];
      const c = await sb();
      const { data } = await c.rpc("daily_leaderboard", { p_day: day });
      return data || [];
    },
    // ---------- Classes ----------
    async joinClass(code) { const c = await sb(); const { data, error } = await c.rpc("join_class", { p_code: String(code).trim().toUpperCase() }); if (error) throw fail(error.message.includes("pleine") ? "Cette classe est complète." : error.message.includes("introuvable") ? "Code de classe introuvable." : human(error)); await refresh(); return data; },
    async leaveClass(id) { const c = await sb(); const { error } = await c.rpc("leave_class", { p_class: id }); if (error) throw error; await refresh(); },
    async createClass(name) { const c = await sb(); const { data, error } = await c.rpc("create_class", { p_name: name }); if (error) throw fail(error.message.includes("offre") ? "Créer une classe demande l'offre Classe ou École." : human(error)); return data; },
    async myClasses() { if (!enabled || !read(KEY)) return []; const c = await sb(); const { data } = await c.rpc("my_classes"); return data || []; },
    async classRoster(id) { const c = await sb(); const { data } = await c.rpc("class_roster", { p_class: id }); return data || []; },
    // ---------- Contact ----------
    async contact(payload) { const c = await sb(); const { error } = await c.from("contact_requests").insert(payload); if (error) throw error; },
    clearAll() { try { Object.keys(localStorage).filter((k) => k.startsWith("oeil:")).forEach((k) => localStorage.removeItem(k)); } catch (e) {} },
  };
  // Rafraîchit le profil quand une session existe (ou quand la page la réclame, comme Mon compte).
  api.ready = enabled && (hasSession() || document.documentElement.dataset.auth) ? refresh().catch(() => read(KEY)) : Promise.resolve(read(KEY));
  window.OeilAccount = api;

  // Avatar : pastille de couleur avec une icône ou l'initiale.
  window.OeilAvatar = function (who, cls) {
    const a = (who && who.avatar) || {}, name = (who && who.name) || "?";
    const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
    const inner = a.icon ? `<span class="material-symbols-outlined" aria-hidden="true">${esc(a.icon)}</span>` : esc((name.trim()[0] || "?").toUpperCase());
    return `<span class="avatar ${cls || ""}" style="--av:${esc(a.color || "#FFE08A")}">${inner}</span>`;
  };
})();
