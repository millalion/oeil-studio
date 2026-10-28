// Tirage reproductible : chaque session a une graine. Partager la graine (lien de défi)
// redonne exactement les mêmes manches à un ami ou à toute une classe.
// Chargé dans <head>, avant les jeux, car certains mélangent leurs listes au chargement.
(function () {
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (str) => { let h = 2166136261; for (const c of String(str)) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };
  const nativeRandom = Math.random.bind(Math);

  function decode(s) { try { return JSON.parse(decodeURIComponent(escape(atob(s.replace(/-/g, "+").replace(/_/g, "/"))))); } catch (e) { return null; } }
  function encode(o) { return btoa(unescape(encodeURIComponent(JSON.stringify(o)))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }

  const params = new URLSearchParams(location.search);
  const m = location.hash.match(/c=([\w-]+)/);
  const challenge = m ? decode(m[1]) : null;
  const today = new Date().toISOString().slice(0, 10);
  const daily = document.documentElement.dataset.daily === "1" && !challenge;
  const seed = challenge?.seed ?? (daily ? hash("oeil-" + today) : Math.floor(nativeRandom() * 1e9));

  Math.random = mulberry32(seed);
  window.OEIL_SEED = {
    seed, challenge, daily, today, params, encode, decode, hash,
    // Chaque manche a sa propre suite de tirages : rejouer une manche redonne la même.
    round(n) { Math.random = mulberry32((seed ^ hash("round-" + n)) >>> 0); },
    free() { Math.random = nativeRandom; },
  };
})();
