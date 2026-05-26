/* ── minigames.js ────────────────────────────────────────
   MiniGames: factory for all 6 patient mini-games.
   API: MiniGames.init(patientId, onWin, onLose)
        MiniGames.cleanup()
──────────────────────────────────────────────────────── */
const MiniGames = (function () {

  let _cleanupFn = null;

  /* ── Utility helpers ─────────────────────────────────── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function contentEl()  { return document.getElementById('minigame-content'); }
  function statusEl()   { return document.getElementById('minigame-status'); }
  function setStatus(t) { const el = statusEl(); if (el) el.textContent = t; }

  /* ════════════════════════════════════════════════════════
     PATIENT 1 — Categories Solitaire
     Sort 9 emoji items into 3 correct category buckets.
  ════════════════════════════════════════════════════════ */
  function initPatient1(onWin, onLose) {
    const CATEGORIES = [
      { key: 'food',   label: '🍴 Food'    },
      { key: 'animal', label: '🐾 Animals' },
      { key: 'sport',  label: '⚽ Sports'  },
    ];
    const ITEMS = [
      { emoji: '🍕', cat: 'food'   },
      { emoji: '🍔', cat: 'food'   },
      { emoji: '🍩', cat: 'food'   },
      { emoji: '🐶', cat: 'animal' },
      { emoji: '🐱', cat: 'animal' },
      { emoji: '🦊', cat: 'animal' },
      { emoji: '⚽', cat: 'sport'  },
      { emoji: '🎾', cat: 'sport'  },
      { emoji: '🏓', cat: 'sport'  },
    ];

    const items   = shuffle(ITEMS);
    let selected  = null;
    let placed    = 0;

    const container = contentEl();
    container.innerHTML = `
      <p class="game-instruction">Select an emoji, then tap the correct bucket.</p>
      <div class="cat-pool" id="cat-pool">
        ${items.map((it, i) => `
          <button class="cat-item" data-idx="${i}" data-cat="${it.cat}" aria-label="${it.emoji}">${it.emoji}</button>
        `).join('')}
      </div>
      <div class="cat-buckets">
        ${CATEGORIES.map(c => `
          <div class="cat-bucket" data-key="${c.key}" role="button" tabindex="0" aria-label="${c.label}">
            <div class="cat-bucket-label">${c.label}</div>
            <div class="cat-bucket-items" id="bucket-${c.key}"></div>
          </div>
        `).join('')}
      </div>
    `;

    setStatus(`0 / 9 sorted`);

    // Item tap
    container.querySelectorAll('.cat-item').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('placed')) return;
        container.querySelectorAll('.cat-item').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selected = btn;
      });
    });

    // Bucket tap
    container.querySelectorAll('.cat-bucket').forEach(bucket => {
      function tryPlace() {
        if (!selected) return;
        const itemCat   = selected.dataset.cat;
        const bucketKey = bucket.dataset.key;

        if (itemCat === bucketKey) {
          // Correct placement
          selected.classList.remove('selected');
          selected.classList.add('placed', 'correct');
          const clone = document.createElement('span');
          clone.textContent = selected.textContent;
          clone.style.cssText = 'font-size:1.3rem;';
          document.getElementById('bucket-' + bucketKey).appendChild(clone);
          selected = null;
          placed++;
          setStatus(`${placed} / 9 sorted`);
          if (placed === 9) {
            setStatus('🎉 All sorted perfectly!');
            setTimeout(onWin, 700);
          }
        } else {
          // Wrong placement
          selected.classList.remove('selected');
          selected.classList.add('wrong');
          const wrongBtn = selected;
          setTimeout(() => wrongBtn.classList.remove('wrong'), 500);
          selected = null;
        }
      }
      bucket.addEventListener('click', tryPlace);
      bucket.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') tryPlace(); });
    });
  }

  /* ════════════════════════════════════════════════════════
     PATIENT 2 — Emoji Match Grid
     Tap a cell to cycle its emoji. Make all 3 rows uniform.
  ════════════════════════════════════════════════════════ */
  function initPatient2(onWin, onLose) {
    const EMOJIS    = ['🟥', '🟨', '🟩'];
    const ROWS      = 3;
    const COLS      = 3;
    const MAX_TAPS  = 18;

    let grid, taps;

    // Keep generating until start is NOT already solved
    do {
      grid = Array.from({ length: ROWS }, () =>
        Array.from({ length: COLS }, () => Math.floor(Math.random() * 3))
      );
    } while (rowsFixed() === ROWS);

    taps = 0;

    function rowsFixed() {
      return grid.filter(row => row.every(c => c === row[0])).length;
    }
    function isComplete() { return rowsFixed() === ROWS; }

    function render() {
      const container = contentEl();
      const fixed  = rowsFixed();
      const remain = MAX_TAPS - taps;
      setStatus(`Taps left: ${remain}  |  Rows fixed: ${fixed} / ${ROWS}`);

      let html = '<div class="match-grid">';
      grid.forEach((row, r) => {
        const rowFixed = row.every(c => c === row[0]);
        html += `<div class="match-row${rowFixed ? ' row-fixed' : ''}">`;
        row.forEach((cell, c) => {
          html += `<button class="match-cell" data-r="${r}" data-c="${c}">${EMOJIS[cell]}</button>`;
        });
        html += '</div>';
      });
      html += '</div>';
      container.querySelector('.match-grid-wrap').innerHTML = html;

      container.querySelectorAll('.match-cell').forEach(btn => {
        btn.addEventListener('click', () => {
          const r   = +btn.dataset.r, co = +btn.dataset.c;
          const row = grid[r];
          if (row.every(cell => cell === row[0])) return; // already fixed
          grid[r][co] = (grid[r][co] + 1) % 3;
          taps++;
          render();
          if (isComplete()) {
            setStatus('🎉 Bed controls restored!');
            setTimeout(onWin, 700);
          } else if (taps >= MAX_TAPS) {
            setStatus('😵 No more taps!');
            setTimeout(onLose, 700);
          }
        });
      });
    }

    contentEl().innerHTML = `
      <p class="game-instruction">Tap a cell to cycle its colour.<br>Make all 3 rows the same!</p>
      <div class="match-grid-wrap"></div>
    `;
    render();
  }

  /* ════════════════════════════════════════════════════════
     PATIENT 3 — General Knowledge Quiz
     5 random questions from pool of 20. Need 3/5 to pass.
  ════════════════════════════════════════════════════════ */
  function initPatient3(onWin, onLose) {
    const ALL_QUESTIONS = [
      { q: 'What planet is known as the Red Planet?',
        opts: ['Venus','Mars','Jupiter','Saturn'], ans: 1 },
      { q: 'How many continents are there?',
        opts: ['5','6','7','8'], ans: 2 },
      { q: 'Which animal is known for having a pouch?',
        opts: ['Dog','Kangaroo','Horse','Elephant'], ans: 1 },
      { q: 'What does "CPU" stand for?',
        opts: ['Central Processing Unit','Computer Power Unit','Core Program Utility','Control Panel User'], ans: 0 },
      { q: 'What is the capital of France?',
        opts: ['Berlin','Madrid','Paris','Rome'], ans: 2 },
      { q: 'How many sides does a hexagon have?',
        opts: ['4','5','6','7'], ans: 2 },
      { q: 'What is H₂O commonly known as?',
        opts: ['Salt','Oxygen','Water','Hydrogen'], ans: 2 },
      { q: 'Which planet is closest to the Sun?',
        opts: ['Venus','Mercury','Earth','Mars'], ans: 1 },
      { q: 'Who painted the Mona Lisa?',
        opts: ['Picasso','Van Gogh','Leonardo da Vinci','Rembrandt'], ans: 2 },
      { q: 'What is the largest ocean?',
        opts: ['Atlantic','Indian','Arctic','Pacific'], ans: 3 },
      { q: 'How many bones are in the adult human body?',
        opts: ['106','206','306','406'], ans: 1 },
      { q: 'What is the chemical symbol for gold?',
        opts: ['Gd','Go','Au','Ag'], ans: 2 },
      { q: 'Which country invented pizza?',
        opts: ['France','Greece','Italy','Spain'], ans: 2 },
      { q: 'What is the fastest land animal?',
        opts: ['Lion','Cheetah','Horse','Jaguar'], ans: 1 },
      { q: 'How many players are on a basketball team on the court?',
        opts: ['4','5','6','7'], ans: 1 },
      { q: 'What does HTML stand for?',
        opts: ['Hyper Text Markup Language','High Tech Modern Language','Hyper Transfer Markup List','Home Text Markup Language'], ans: 0 },
      { q: 'Which month has the fewest days?',
        opts: ['November','February','April','June'], ans: 1 },
      { q: 'What is the square root of 64?',
        opts: ['6','7','8','9'], ans: 2 },
      { q: 'Which is the largest mammal in the world?',
        opts: ['African Elephant','Giraffe','Blue Whale','Hippopotamus'], ans: 2 },
      { q: 'What colour are emeralds?',
        opts: ['Red','Blue','Yellow','Green'], ans: 3 },
    ];

    const questions = shuffle(ALL_QUESTIONS).slice(0, 5);
    let current = 0, correct = 0;

    function showQuestion() {
      const q = questions[current];
      setStatus(`Question ${current + 1} / 5  ·  ✅ ${correct}`);
      const LABELS = ['A','B','C','D'];

      contentEl().innerHTML = `
        <p class="quiz-question">${q.q}</p>
        <div class="quiz-options">
          ${q.opts.map((opt, i) => `
            <button class="quiz-option" data-idx="${i}">${LABELS[i]}) ${opt}</button>
          `).join('')}
        </div>
        <div class="quiz-feedback" id="quiz-feedback"></div>
      `;

      contentEl().querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
          const chosen    = +btn.dataset.idx;
          const isCorrect = chosen === q.ans;
          if (isCorrect) correct++;

          contentEl().querySelectorAll('.quiz-option').forEach((b, i) => {
            b.disabled = true;
            if (i === q.ans) b.classList.add('correct');
            else if (i === chosen) b.classList.add('wrong');
          });

          const fb = document.getElementById('quiz-feedback');
          fb.textContent  = isCorrect ? '✅ Correct!' : `❌ The answer was: ${q.opts[q.ans]}`;
          fb.className    = 'quiz-feedback ' + (isCorrect ? 'success' : 'fail');
          setStatus(`Question ${current + 1} / 5  ·  ✅ ${correct}`);

          setTimeout(() => {
            current++;
            if (current >= 5) {
              if (correct >= 3) {
                setStatus(`🎉 ${correct}/5 — you passed!`);
                setTimeout(onWin, 800);
              } else {
                setStatus(`😬 ${correct}/5 — need 3 to pass.`);
                setTimeout(onLose, 800);
              }
            } else {
              showQuestion();
            }
          }, 1300);
        });
      });
    }

    contentEl().innerHTML = '';
    showQuestion();
  }

  /* ════════════════════════════════════════════════════════
     PATIENT 4 — Heartbeat Timing
     Tap when ❤️ is inside the green calm zone.
     Need 5 successful taps.
  ════════════════════════════════════════════════════════ */
  function initPatient4(onWin, onLose) {
    const GOAL  = 5;
    let hits    = 0;
    let rafId   = null;
    let start   = null;
    let done    = false;
    const PERIOD_MS = 1800; // full oscillation in ms
    // calm zone: 38%–62% of track width
    const ZONE_L = 38, ZONE_R = 62;

    contentEl().innerHTML = `
      <p class="game-instruction">Tap when ❤️ enters the green zone!<br>Score 5 hits to win.</p>
      <div class="hb-track-wrap" id="hb-track">
        <div class="hb-zone" id="hb-zone"></div>
        <div class="hb-indicator" id="hb-indicator">❤️</div>
      </div>
      <div class="hb-taps" id="hb-taps">
        ${Array.from({length: GOAL}, () => `<div class="hb-tap-dot"></div>`).join('')}
      </div>
      <div class="hb-feedback" id="hb-feedback"></div>
    `;
    setStatus(`Hits: 0 / ${GOAL}`);

    const track    = document.getElementById('hb-track');
    const indicator = document.getElementById('hb-indicator');
    const zone     = document.getElementById('hb-zone');
    const feedback = document.getElementById('hb-feedback');

    // Position the visual calm zone
    zone.style.left  = ZONE_L + '%';
    zone.style.width = (ZONE_R - ZONE_L) + '%';

    function getPos(ts) {
      if (!start) start = ts;
      const elapsed = ts - start;
      // oscillate 5%–95%
      return 5 + 90 * (0.5 + 0.5 * Math.sin(elapsed * 2 * Math.PI / PERIOD_MS));
    }

    function tick(ts) {
      if (done) return;
      const pos = getPos(ts);
      indicator.style.left = pos + '%';
      rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    function onTap() {
      if (done) return;
      const pos = parseFloat(indicator.style.left || '50');
      const inZone = pos >= ZONE_L && pos <= ZONE_R;
      const dots   = document.querySelectorAll('.hb-tap-dot');

      if (inZone) {
        hits++;
        if (dots[hits - 1]) {
          dots[hits - 1].classList.add('hit');
        }
        feedback.textContent = '✅ Nice timing!';
        setStatus(`Hits: ${hits} / ${GOAL}`);
        if (hits >= GOAL) {
          done = true;
          cancelAnimationFrame(rafId);
          setStatus('🎉 Perfect rhythm!');
          setTimeout(onWin, 700);
        }
      } else {
        feedback.textContent = '❌ Too early / late!';
        // Flash miss on first unfilled dot
        const missIdx = hits;
        if (dots[missIdx]) {
          dots[missIdx].classList.add('miss');
          setTimeout(() => dots[missIdx].classList.remove('miss'), 400);
        }
      }
      setTimeout(() => { if (feedback) feedback.textContent = ''; }, 600);
    }

    track.addEventListener('click', onTap);
    track.addEventListener('touchstart', e => { e.preventDefault(); onTap(); }, { passive: false });

    _cleanupFn = () => {
      done = true;
      cancelAnimationFrame(rafId);
    };
  }

  /* ════════════════════════════════════════════════════════
     PATIENT 5 — Memory Match
     Flip 4×4 grid of cards. Match all 8 pairs.
  ════════════════════════════════════════════════════════ */
  function initPatient5(onWin, onLose) {
    const EMOJIS  = ['🌈','🦄','🌸','🍀','🌙','⭐','💫','🎈'];
    const pairs   = shuffle([...EMOJIS, ...EMOJIS]);
    const matched = new Array(16).fill(false);
    const flipped = [];
    let   locked  = false;
    let   taps    = 0;

    function render() {
      contentEl().innerHTML = `
        <p class="game-instruction">Flip cards to find matching pairs!</p>
        <div class="mem-grid" id="mem-grid">
          ${pairs.map((emoji, i) => `
            <div class="mem-card ${matched[i] ? 'matched' : ''}" data-idx="${i}" role="button" tabindex="0" aria-label="Card ${i+1}">
              <div class="card-front">${emoji}</div>
              <div class="card-back">🎴</div>
            </div>
          `).join('')}
        </div>
        <p class="slide-moves">Taps: <strong id="mem-taps">${taps}</strong></p>
      `;
      setStatus(`Pairs found: ${matched.filter(Boolean).length / 2} / 8`);

      // Restore flipped state for currently revealed cards
      flipped.forEach(idx => {
        const card = contentEl().querySelector(`.mem-card[data-idx="${idx}"]`);
        if (card) card.classList.add('flipped');
      });

      // Attach click handlers
      contentEl().querySelectorAll('.mem-card').forEach(card => {
        card.addEventListener('click', () => onCardClick(+card.dataset.idx));
        card.addEventListener('keydown', e => {
          if (e.key === 'Enter' || e.key === ' ') onCardClick(+card.dataset.idx);
        });
      });
    }

    function onCardClick(idx) {
      if (locked || matched[idx] || flipped.includes(idx)) return;
      taps++;
      document.getElementById('mem-taps').textContent = taps;

      flipped.push(idx);
      const card = contentEl().querySelector(`.mem-card[data-idx="${idx}"]`);
      if (card) card.classList.add('flipped');

      if (flipped.length === 2) {
        locked = true;
        const [a, b] = flipped;
        if (pairs[a] === pairs[b]) {
          // Match! Update state and apply visual
          matched[a] = true;
          matched[b] = true;
          [a, b].forEach(i => {
            const c = contentEl().querySelector(`.mem-card[data-idx="${i}"]`);
            if (c) { c.classList.remove('flipped'); c.classList.add('matched'); }
          });
          flipped.length = 0;
          locked = false;
          setStatus(`Pairs found: ${matched.filter(Boolean).length / 2} / 8`);

          if (matched.every(Boolean)) {
            setStatus(`🎉 All pairs matched in ${taps} taps!`);
            setTimeout(onWin, 800);
          }
        } else {
          // No match — flip back after delay
          setTimeout(() => {
            [a, b].forEach(i => {
              const c = contentEl().querySelector(`.mem-card[data-idx="${i}"]`);
              if (c) c.classList.remove('flipped');
            });
            flipped.length = 0;
            locked = false;
          }, 900);
        }
      }
    }

    render();
  }

  /* ════════════════════════════════════════════════════════
     PATIENT 6 — Slide Puzzle (8-puzzle)
     Slide tiles into goal order: [1,2,3,4,5,6,7,8, 0].
     Starting state is solvable in ≈8 moves.
  ════════════════════════════════════════════════════════ */
  function initPatient6(onWin, onLose) {
    // 0 = blank tile
    // Start solvable in 8 moves (verified by hand-tracing solution)
    let tiles = [0, 1, 6, 4, 3, 2, 7, 5, 8];
    const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
    const EMOJIS = ['','🏥','🛏️','💊','🩺','🌡️','💉','🩹','🏨'];
    let moves = 0;

    function blankIdx()  { return tiles.indexOf(0); }
    function isComplete(){ return tiles.every((v, i) => v === GOAL[i]); }
    function adjacent(a, b) {
      const rA = Math.floor(a/3), cA = a%3;
      const rB = Math.floor(b/3), cB = b%3;
      return Math.abs(rA-rB) + Math.abs(cA-cB) === 1;
    }

    function render() {
      setStatus(`Moves: ${moves}`);
      const blank = blankIdx();
      let html = '<div class="slide-grid">';
      tiles.forEach((val, i) => {
        if (val === 0) {
          html += `<div class="slide-tile blank" data-idx="${i}"></div>`;
        } else {
          const isCorrect = val === GOAL[i];
          html += `
            <div class="slide-tile ${isCorrect ? 'correct' : ''}" data-idx="${i}" role="button" tabindex="0" aria-label="Tile ${val}">
              <span class="slide-tile-emoji">${EMOJIS[val]}</span>
              <span class="slide-tile-num">${val}</span>
            </div>`;
        }
      });
      html += '</div>';
      html += `<p class="slide-moves">Tip: tap a tile next to the empty space to slide it.</p>`;

      contentEl().querySelector('.slide-wrap').innerHTML = html;

      contentEl().querySelectorAll('.slide-tile:not(.blank)').forEach(tile => {
        function trySlide() {
          const idx = +tile.dataset.idx;
          if (!adjacent(idx, blank)) return;
          [tiles[idx], tiles[blank]] = [tiles[blank], tiles[idx]];
          moves++;
          render();
          if (isComplete()) {
            setStatus('🎉 Exit blocked! Escape foiled!');
            setTimeout(onWin, 800);
          }
        }
        tile.addEventListener('click', trySlide);
        tile.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') trySlide(); });
      });
    }

    contentEl().innerHTML = `
      <p class="game-instruction">Slide 🏥 beds to block the exit!<br>Arrange tiles in order (1-8).</p>
      <div class="slide-wrap"></div>
    `;
    render();
  }

  /* ════════════════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════════════════ */
  const GAMES = {
    1: initPatient1,
    2: initPatient2,
    3: initPatient3,
    4: initPatient4,
    5: initPatient5,
    6: initPatient6,
  };

  return {
    init(patientId, onWin, onLose) {
      this.cleanup();
      const fn = GAMES[patientId];
      if (fn) fn(onWin, onLose);
    },

    cleanup() {
      if (_cleanupFn) {
        _cleanupFn();
        _cleanupFn = null;
      }
    }
  };

})();
