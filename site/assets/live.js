// Parties en direct (façon quiz en classe) : l'hôte crée une salle, les joueurs la rejoignent avec un code
// ou un QR code, tout le monde joue le même tirage et le classement se met à jour à chaque manche.
//
// TRANSPORT ACTUEL : démo locale. Les messages passent par BroadcastChannel et localStorage,
// donc entre onglets d'un même navigateur. Pour jouer sur plusieurs appareils, remplace les
// trois fonctions marquées « SERVEUR » par des appels à ton backend (WebSocket, Supabase, Firebase…).
// Le reste du site n'a pas besoin de changer.
(function () {
  const KEY = (code) => "oeil:live:" + code;
  const read = (code) => { try { return JSON.parse(localStorage.getItem(KEY(code))); } catch (e) { return null; } };
  const write = (code, room) => { try { localStorage.setItem(KEY(code), JSON.stringify(room)); } catch (e) {} };
  const channels = {};
  const chan = (code) => channels[code] || (channels[code] = "BroadcastChannel" in window ? new BroadcastChannel("oeil-live-" + code) : null);
  const ALPHA = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  // SERVEUR — enregistrer l'état de la salle et prévenir tous les participants.
  function publish(code, room) {
    write(code, room);
    const c = chan(code);
    c && c.postMessage({ type: "room", room });
  }
  // SERVEUR — lire l'état de la salle (au chargement d'une page).
  function fetchRoom(code) { return Promise.resolve(read(code)); }
  // SERVEUR — s'abonner aux changements de la salle.
  function subscribe(code, fn) {
    const c = chan(code);
    if (c) c.onmessage = (e) => e.data && e.data.type === "room" && fn(e.data.room);
    window.addEventListener("storage", (e) => { if (e.key === KEY(code) && e.newValue) fn(JSON.parse(e.newValue)); });
  }

  function update(code, fn) {
    const room = read(code);
    if (!room) return null;
    fn(room);
    room.updated = Date.now();
    publish(code, room);
    return room;
  }

  window.OeilLive = {
    createRoom({ title, ids, rounds }) {
      let code = "";
      for (let i = 0; i < 5; i++) code += ALPHA[Math.floor(Math.random() * ALPHA.length)];
      const room = { code, title, ids, rounds, seed: Math.floor(Math.random() * 1e9), status: "lobby", players: {}, created: Date.now() };
      publish(code, room);
      return room;
    },
    fetchRoom,
    subscribe,
    join(code, name) { return update(code, (r) => { r.players[name] = r.players[name] || { name, scores: [], done: false, joined: Date.now() }; }); },
    start(code) { return update(code, (r) => { r.status = "playing"; r.started = Date.now(); }); },
    finish(code) { return update(code, (r) => { r.status = "finished"; }); },
    report(code, name, round, score) { return update(code, (r) => { const p = r.players[name] || (r.players[name] = { name, scores: [], done: false }); p.scores[round] = Math.round(score); }); },
    done(code, name) { return update(code, (r) => { if (r.players[name]) r.players[name].done = true; }); },
    ranking(room) {
      return Object.values(room.players).map((p) => {
        const s = p.scores.filter((x) => x != null);
        return { ...p, played: s.length, total: s.reduce((a, b) => a + b, 0), avg: s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0 };
      }).sort((a, b) => b.total - a.total || b.avg - a.avg);
    },
    // Lien que les joueurs ouvrent pour jouer, une fois la partie lancée.
    playLink(room, name) {
      const S = window.OEIL_SEED;
      const base = location.href.split("#")[0].split("?")[0].replace(/[^/]*$/, "");
      return `${base}defi.html#c=${S.encode({ seed: room.seed, ids: room.ids, rounds: room.rounds, title: room.title, live: room.code, player: name })}`;
    },
  };
})();
