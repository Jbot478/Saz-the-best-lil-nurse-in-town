/* ── scene.js ────────────────────────────────────────────
   SceneManager: controls which scene / overlay is visible.
   Scenes: 'room' | 'dialogue' | 'minigame' | 'closing'
──────────────────────────────────────────────────────── */
const SceneManager = (function () {

  const OVERLAY_SCENES = new Set(['dialogue', 'minigame']);

  function el(sceneName) {
    return document.getElementById('scene-' + sceneName);
  }

  function hideAll() {
    document.querySelectorAll('.scene').forEach(s => {
      s.classList.remove('active');
      s.classList.add('hidden');
    });
  }

  return {
    /**
     * Show a scene.
     * Overlay scenes (dialogue, minigame) are layered on top of room.
     * Full scenes (room, closing) replace everything.
     */
    show(sceneName) {
      const target = el(sceneName);
      if (!target) return;

      if (OVERLAY_SCENES.has(sceneName)) {
        // Keep underlying scenes visible; just reveal overlay
        target.classList.remove('hidden');
        // Trigger CSS transition on next frame
        requestAnimationFrame(() => target.classList.add('active'));
      } else {
        hideAll();
        requestAnimationFrame(() => {
          target.classList.remove('hidden');
          requestAnimationFrame(() => target.classList.add('active'));
        });
      }
    },

    /** Hide a specific scene / overlay. */
    hide(sceneName) {
      const target = el(sceneName);
      if (!target) return;
      target.classList.remove('active');
      setTimeout(() => target.classList.add('hidden'), 350);
    },

    /** Show room and hide all overlays. */
    showRoom() {
      ['dialogue', 'minigame'].forEach(s => {
        const t = el(s);
        if (t) { t.classList.remove('active'); t.classList.add('hidden'); }
      });
      // Room should already be visible; just make sure
      const room = el('room');
      room.classList.remove('hidden');
      requestAnimationFrame(() => room.classList.add('active'));
    }
  };
})();
