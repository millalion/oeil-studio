// Parties en direct (façon quiz en classe) : l'hôte crée une salle, les joueurs la rejoignent avec un code
// ou un QR code, tout le monde joue le même tirage et le classement se met à jour à chaque manche.
//
// L'écran de l'hôte garde l'état de la salle et le diffuse ; les joueurs lui envoient leurs messages
// (arrivée, score de chaque manche, fin). Le transport passe par Supabase Realtime quand il est configuré
// (téléphones, ordinateurs, n'importe où), sinon par BroadcastChannel (onglets d'un même navigateur).
(function () {
  const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const KEY = (code) => "oeil:live:" + code;
  const save = (room) => { try { localStorage.setItem(KEY(room.code), JSON.stringify(room)); } catch (e) {} };
  const load = (code) => { try { return JSON.parse(localStorage.getItem(KEY(code))); } catch (e) { return null; } };
  const channels = {};

  // Ouvre (une seule fois) le canal d'une salle et renvoie { send, on }.
  function channel(code) {
    if (channels[code]) return channels[code];
    const handlers = [];
    const deliver = (msg) => handlers.forEach((fn) => fn(msg));
    const ch = { on: (fn) => handlers.push(fn), send: () => {}, ready: null };
    const A = window.OeilAccount;
    ch.ready = (A && A.enabled ? A.client() : Promise.resolve(null)).then((client) => new Promise((resolve) => {
      if (!client) {
        const bc = "BroadcastChannel" in window ? new BroadcastChannel("oeil-live-" + code) : null;
        if (bc) bc.onmessage = (e) => deliver(e.data);
        ch.send = (msg) => bc && bc.postMessage(msg);
        return resolve(ch);
      }
      const rt = client.channel("live-" + code, { config: { broadcast: { self: false } } });
      rt.on("broadcast", { event: "msg" }, ({ payload }) => deliver(payload));
      ch.send = (msg) => rt.send({ type: "broadcast", event: "msg", payload: msg });
      rt.subscribe((status) => { if (status === "SUBSCRIBED") resolve(ch); });
      setTimeout(() => resolve(ch), 6000);
    }));
    return (channels[code] = ch);
  }
  const send = (code, msg) => channel(code).ready.then((c) => c.send(msg));

  const ranking = (room) => Object.values(room.players || {}).map((p) => {
    const s = (p.scores || []).filter((x) => x != null);
    return { ...p, played: s.length, total: s.reduce((a, b) => a + b, 0), avg: s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0 };
  }).sort((a, b) => b.total - a.total || b.avg - a.avg);

  window.OeilLive = {
    ranking,
    // ---------- Écran de l'hôte ----------
    host({ title, ids, rounds }, onChange) {
      let code = "";
      for (let i = 0; i < 5; i++) code += ALPHA[Math.floor(Math.random() * ALPHA.length)];
      const room = { code, title, ids, rounds, seed: Math.floor(Math.random() * 1e9), status: "lobby", players: {}, created: Date.now() };
      const publish = () => { room.updated = Date.now(); save(room); send(code, { t: "room", room }); onChange && onChange(room); };
      const player = (name, avatar) => room.players[name] || (room.players[name] = { name, avatar, scores: [], done: false, joined: Date.now() });
      channel(code).on((m) => {
        if (!m || !m.t) return;
        if (m.t === "hello") return send(code, { t: "room", room });
        if (!m.name) return;
        const name = String(m.name).slice(0, 24);
        if (m.t === "join") { if (room.status === "finished") return; const p = player(name, m.avatar); if (m.avatar) p.avatar = m.avatar; }
        else if (m.t === "report") { const p = player(name, m.avatar); const r = +m.round; if (r >= 0 && r < 50) p.scores[r] = Math.max(0, Math.min(100, Math.round(+m.score || 0))); }
        else if (m.t === "done") { const p = room.players[name]; if (p) p.done = true; }
        else return;
        publish();
      });
      channel(code).ready.then(publish);
      return {
        room,
        start() { room.status = "playing"; room.started = Date.now(); publish(); },
        finish() { room.status = "finished"; publish(); },
        kick(name) { delete room.players[name]; publish(); },
      };
    },
    // ---------- Joueurs ----------
    // Récupère l'état de la salle auprès de l'hôte (null si personne ne répond).
    fetchRoom(code) {
      return new Promise((resolve) => {
        let done = false;
        const finish = (room) => { if (!done) { done = true; resolve(room); } };
        channel(code).on((m) => m && m.t === "room" && m.room && m.room.code === code && finish(m.room));
        send(code, { t: "hello" });
        setTimeout(() => finish(load(code)), 5000);
        setTimeout(() => !done && send(code, { t: "hello" }), 1800);
      });
    },
    watch(code, fn) { channel(code).on((m) => m && m.t === "room" && m.room && fn(m.room)); send(code, { t: "hello" }); },
    join(code, name, avatar) { return send(code, { t: "join", name, avatar }); },
    report(code, name, round, score) {
      const id = window.OeilAccount ? window.OeilAccount.identity() : {};
      return send(code, { t: "report", name, round, score: Math.round(score), avatar: id.avatar });
    },
    done(code, name) { return send(code, { t: "done", name }); },
    // Lien que les joueurs ouvrent pour jouer, une fois la partie lancée.
    playLink(room, name) {
      const S = window.OEIL_SEED;
      const base = location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "");
      return `${base}defi.html#c=${S.encode({ seed: room.seed, ids: room.ids, rounds: room.rounds, title: room.title, live: room.code, player: name })}`;
    },
  };
})();
