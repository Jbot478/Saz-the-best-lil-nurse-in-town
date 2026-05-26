/* ── dialogue.js ─────────────────────────────────────────
   DialogueSystem: typewriter-style line-by-line dialogue.
   Each line: { speaker: string, sprite: string, text: string }
──────────────────────────────────────────────────────── */
const DialogueSystem = (function () {
  let _queue      = [];
  let _index      = 0;
  let _onComplete = null;
  let _timer      = null;

  const spriteEl  = () => document.getElementById('dialogue-sprite');
  const speakerEl = () => document.getElementById('dialogue-speaker');
  const textEl    = () => document.getElementById('dialogue-text');
  const nextBtn   = () => document.getElementById('btn-dialogue-next');

  function typeText(element, text, speed, onDone) {
    clearInterval(_timer);
    element.textContent = '';
    let i = 0;
    _timer = setInterval(() => {
      // Handle multi-byte emoji characters correctly
      const codePoint = text.codePointAt(i);
      element.textContent += String.fromCodePoint(codePoint);
      i += codePoint > 0xFFFF ? 2 : 1;
      if (i >= text.length) {
        clearInterval(_timer);
        _timer = null;
        if (onDone) onDone();
      }
    }, speed);
  }

  function showLine() {
    if (_index >= _queue.length) {
      close();
      return;
    }
    const line = _queue[_index];
    spriteEl().textContent  = line.sprite  || '';
    speakerEl().textContent = line.speaker || '';
    typeText(textEl(), line.text, 35);
  }

  function close() {
    clearInterval(_timer);
    _timer = null;
    SceneManager.hide('dialogue');
    const cb = _onComplete;
    _onComplete = null;
    if (cb) cb();
  }

  // "Continue" button handler (also registered in main.js)
  function onNext() {
    if (_timer) {
      // Skip typing — show full text immediately
      clearInterval(_timer);
      _timer = null;
      const line = _queue[_index];
      textEl().textContent = line.text;
      return;
    }
    _index++;
    showLine();
  }

  return {
    /** Display a dialogue sequence then call onComplete. */
    show(lines, onComplete) {
      _queue      = lines;
      _index      = 0;
      _onComplete = onComplete || null;
      SceneManager.show('dialogue');
      showLine();
    },

    /** Advance to next line (called by Continue button). */
    next: onNext
  };
})();
