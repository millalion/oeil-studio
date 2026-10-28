// Compte utilisateur — version de démonstration enregistrée dans ce navigateur.
// Pour un vrai compte, remplace login / logout / get par des appels à ton backend (authentification, base de données).
(function () {
  const KEY = "oeil:account";
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } };
  window.OeilAccount = {
    get: read,
    login({ name, email, role }) { const prev = read(); const u = { name: String(name || email.split("@")[0]).slice(0, 40), email, role: role || "etudiant", plan: (prev && prev.plan) || "free", since: new Date().toISOString() }; try { localStorage.setItem(KEY, JSON.stringify(u)); localStorage.setItem("oeil:name", JSON.stringify(u.name)); } catch (e) {} return u; },
    logout() { try { localStorage.removeItem(KEY); } catch (e) {} },
    // Offre active : "free" par défaut. Sans serveur, elle est notée dans ce navigateur après le retour de Stripe ;
    // avec un backend, elle viendra du webhook Stripe et ne pourra plus être modifiée côté navigateur.
    plan() { const u = read(); return (u && u.plan) || "free"; },
    isPro() { return ["pro", "parcours", "classe", "ecole"].includes(this.plan()); },
    setPlan(plan) { const u = read() || { name: "", email: "", role: "etudiant" }; u.plan = plan; try { localStorage.setItem(KEY, JSON.stringify(u)); } catch (e) {} return u; },
    clearAll() { try { Object.keys(localStorage).filter((k) => k.startsWith("oeil:")).forEach((k) => localStorage.removeItem(k)); } catch (e) {} },
  };
})();
