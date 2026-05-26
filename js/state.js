/* ── state.js ────────────────────────────────────────────
   Lightweight game-state singleton.
   All other modules read from / write to this object.
──────────────────────────────────────────────────────── */
const GameState = (function () {
  let _helped       = new Set(); // IDs of patients that have been fully helped
  let _currentId    = null;      // Patient ID currently being interacted with
  let _phase        = 'room';    // 'room' | 'dialogue' | 'minigame'

  return {
    /* ── read ── */
    get currentId()  { return _currentId; },
    get phase()      { return _phase; },
    get helpedCount(){ return _helped.size; },

    isHelped(id)     { return _helped.has(id); },
    isComplete()     { return _helped.size >= 6; },

    /* ── write ── */
    setCurrentPatient(id) { _currentId = id; },
    setPhase(p)           { _phase = p; },

    markHelped(id) {
      _helped.add(id);
      _currentId = null;
    },

    reset() {
      _helped.clear();
      _currentId = null;
      _phase = 'room';
    }
  };
})();
