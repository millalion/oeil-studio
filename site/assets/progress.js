// Progression : historique, records, disciplines et badges à débloquer.
// Les données vivent dans le navigateur (oeil:history, oeil:best:<jeu>, oeil:daily) et, avec un compte,
// sont aussi enregistrées dans Supabase puis fusionnées ici pour suivre la progression sur tous les appareils.
(function () {
  const get = (k) => { try { return JSON.parse(localStorage.getItem("oeil:" + k)); } catch (e) { return null; } };
  const set = (k, v) => { try { localStorage.setItem("oeil:" + k, JSON.stringify(v)); } catch (e) {} };
  const games = () => window.OEIL_GAMES || [];
  const doms = () => window.OEIL_DOMAINS || {};
  const gameOf = (id) => games().find((g) => g.id === id);

  function stats() {
    const hist = get("history") || [];
    const daily = get("daily") || { streak: 0, last: null, scores: {} };
    const best = {};
    games().forEach((g) => { const b = get("best:" + g.id); if (b != null) best[g.id] = b; });
    // Les manches jouées en mélange comptent aussi pour les disciplines
    const played = new Set(Object.keys(best));
    hist.forEach((h) => (h.plays || []).forEach((p) => played.add(p.id)));
    const domainStats = Object.entries(doms()).map(([k, d]) => {
      const list = games().filter((g) => g.domain === k);
      const scored = list.filter((g) => best[g.id] != null);
      const avg = scored.length ? scored.reduce((a, g) => a + best[g.id], 0) / scored.length : null;
      return { key: k, label: d.label, field: d.field, total: list.length, tried: list.filter((g) => played.has(g.id)).length, scored: scored.length, avg };
    });
    const today = new Date().toISOString().slice(0, 10), yesterday = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const streak = daily.last === today || daily.last === yesterday ? daily.streak || 0 : 0;
    const month = hist.filter((h) => Date.now() - new Date(h.date) < 30 * 864e5);
    return {
      hist, best, played, domainStats, daily,
      sessions: hist.length,
      avg: hist.length ? hist.reduce((a, h) => a + h.avg, 0) / hist.length : null,
      avg30: month.length ? month.reduce((a, h) => a + h.avg, 0) / month.length : null,
      streak, maxStreak: Math.max(daily.max || 0, streak),
      tried: played.size, total: games().length,
      top: hist.reduce((m, h) => Math.max(m, h.avg), 0),
      wins: get("wins") || 0, podiums: get("podiums") || 0,
    };
  }

  const crown = (k) => (s) => { const d = s.domainStats.find((x) => x.key === k); return { ok: d.scored >= 3 && d.avg >= 85, p: d.scored >= 3 ? Math.min(1, d.avg / 85) : d.scored / 3 * 0.8 }; };
  const count = (n, f) => (s) => { const v = f(s); return { ok: v >= n, p: Math.min(1, v / n) }; };
  function badges() {
    const list = [
      { id: "first", icon: "visibility", name: "Premier regard", text: "Terminer une première session.", test: count(1, (s) => s.sessions) },
      { id: "ten", icon: "repeat", name: "L'habitude", text: "Terminer 10 sessions.", test: count(10, (s) => s.sessions) },
      { id: "fifty", icon: "fitness_center", name: "Œil entraîné", text: "Terminer 50 sessions.", test: count(50, (s) => s.sessions) },
      { id: "sharp", icon: "my_location", name: "Œil de lynx", text: "Une session à 90 % ou plus.", test: count(90, (s) => s.top) },
      { id: "perfect", icon: "military_tech", name: "Sans faute", text: "Une session à 97 % ou plus (note A+).", test: count(97, (s) => s.top) },
      { id: "streak3", icon: "local_fire_department", name: "Trois jours d'affilée", text: "Une série de 3 défis du jour.", test: count(3, (s) => s.maxStreak) },
      { id: "streak7", icon: "local_fire_department", name: "Une semaine", text: "Une série de 7 défis du jour.", test: count(7, (s) => s.maxStreak) },
      { id: "streak30", icon: "whatshot", name: "Un mois entier", text: "Une série de 30 défis du jour.", test: count(30, (s) => s.maxStreak) },
      { id: "allround", icon: "explore", name: "Touche-à-tout", text: "Jouer dans les 6 disciplines.", test: count(6, (s) => s.domainStats.filter((d) => d.tried).length) },
      { id: "twenty", icon: "collections_bookmark", name: "Collectionneur", text: "Essayer 20 jeux différents.", test: count(20, (s) => s.tried) },
      { id: "all", icon: "auto_stories", name: "Encyclopédie", text: "Essayer tous les jeux.", test: (s) => ({ ok: s.tried >= s.total, p: s.tried / s.total }) },
      { id: "duel", icon: "swords", name: "Duelliste", text: "Gagner un défi lancé par un ami.", test: count(1, (s) => s.wins) },
      { id: "podium", icon: "emoji_events", name: "Sur le podium", text: "Finir dans le top 3 d'une partie en direct.", test: count(1, (s) => s.podiums) },
    ];
    Object.entries(doms()).forEach(([k, d]) => list.push({ id: "crown-" + k, icon: "workspace_premium", name: "Couronne " + d.label.split(" ")[0].toLowerCase(), field: d.field, text: `Records à 85 % de moyenne sur 3 jeux de ${d.label.toLowerCase()}.`, test: crown(k) }));
    return list;
  }

  function evaluate() {
    const s = stats();
    return badges().map((b) => { const r = b.test(s); return { ...b, ok: r.ok, p: Math.max(0, Math.min(1, r.p || 0)) }; });
  }
  // Après une session : renvoie les badges qui viennent d'être débloqués.
  function check() {
    const seen = new Set(get("badges") || []);
    const fresh = evaluate().filter((b) => b.ok && !seen.has(b.id));
    if (fresh.length) set("badges", [...seen, ...fresh.map((b) => b.id)]);
    return fresh;
  }
  // Fusionne les scores enregistrés sur le compte avec l'historique de cet appareil.
  function merge(rows) {
    if (!rows || !rows.length) return;
    const hist = get("history") || [];
    const keys = new Set(hist.map((h) => h.id + "|" + String(h.date).slice(0, 16)));
    rows.forEach((r) => {
      const date = r.created_at, k = r.game_id + "|" + String(date).slice(0, 16);
      if (!keys.has(k)) { hist.push({ id: r.game_id, title: r.title || (gameOf(r.game_id) || {}).name || r.game_id, avg: r.avg, date, daily: r.mode === "daily", synced: true }); keys.add(k); }
      if (gameOf(r.game_id)) { const b = get("best:" + r.game_id); if (b == null || r.avg > b) set("best:" + r.game_id, r.avg); }
    });
    hist.sort((a, b) => new Date(b.date) - new Date(a.date));
    set("history", hist.slice(0, 500));
  }
  window.OeilProgress = { stats, badges: evaluate, check, merge };
})();
