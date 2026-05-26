/* ── main.js ──────────────────────────────────────────────
   Entry point: patient data, room layout, event bindings,
   and the full game-flow orchestration.
──────────────────────────────────────────────────────── */

/* ═══════════════════════════════════════════════════════
   PATIENT DATA
   Each patient has:
     - id, name, sprite
     - intro dialogue (shown before mini-game)
     - gameTitle / gameDescription
     - winDialogue / loseDialogue (shown after mini-game)
═══════════════════════════════════════════════════════ */
const PATIENTS = [
  {
    id: 1,
    sprite: '😠',
    name: 'The Stubborn One',
    subName: '😠🛌💊',
    intro: [
      { speaker: 'Patient',       sprite: '😠', text: "I'm not taking those." },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Why?' },
      { speaker: 'Patient',       sprite: '😠', text: "Because I don't lose." },
    ],
    gameTitle:       '🗂️ Categories Solitaire',
    gameDescription: 'Sort every emoji into the correct category bucket.',
    winDialogue: [
      { speaker: 'Patient',       sprite: '😠', text: 'Fine. Fair win.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Open wide.' },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '😠', text: 'Ha! Told you so.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "Give me another shot." },
    ],
  },
  {
    id: 2,
    sprite: '😵',
    name: 'Bed Controls Guy',
    subName: '😵🛌⬆️⬇️',
    intro: [
      { speaker: 'Patient',       sprite: '😵', text: "I pressed everything and now I'm sideways." },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'You rotated the mattress.' },
    ],
    gameTitle:       '🟩 Emoji Match Grid',
    gameDescription: 'Make each row show the same colour. Tap to cycle.',
    winDialogue: [
      { speaker: 'Patient',       sprite: '😵', text: 'Oh. That makes sense.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "It really didn't." },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '😵', text: "I'm still sideways, aren't I?" },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'A bit, yes. Let\'s try again.' },
    ],
  },
  {
    id: 3,
    sprite: '🤓',
    name: 'The Know-It-All',
    subName: '🤓🛌📚',
    intro: [
      { speaker: 'Patient',       sprite: '🤓', text: "I don't trust nurses who don't know trivia." },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'This feels personal.' },
    ],
    gameTitle:       '🧩 General Knowledge Quiz',
    gameDescription: '5 questions. Score 3 out of 5 to pass.',
    winDialogue: [
      { speaker: 'Patient',       sprite: '🤓', text: 'Acceptable intelligence level.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "I'll treasure that." },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '🤓', text: 'I knew it.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "I absolutely did not study." },
    ],
  },
  {
    id: 4,
    sprite: '💅',
    name: 'The Drama Queen',
    subName: '💅🛌🎭',
    intro: [
      { speaker: 'Patient',       sprite: '💅', text: 'My heart is doing something DRAMATIC.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "That's just an arrhythmia." },
      { speaker: 'Patient',       sprite: '💅', text: '…still dramatic.' },
    ],
    gameTitle:       '❤️ Heartbeat Timing',
    gameDescription: 'Tap when ❤️ is in the green calm zone. Score 5 hits!',
    winDialogue: [
      { speaker: 'Patient',       sprite: '💅', text: 'Was that good?' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Technically textbook.' },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '💅', text: 'MY HEART CANNOT BE TIMED!' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "Relax. Let's try again." },
    ],
  },
  {
    id: 5,
    sprite: '🎮',
    name: 'The Gamer',
    subName: '🎮🛌😎',
    intro: [
      { speaker: 'Patient',       sprite: '🎮', text: "You think you can beat me? At a memory game?" },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "I'm just here to administer meds." },
      { speaker: 'Patient',       sprite: '🎮', text: 'No meds without a match.' },
    ],
    gameTitle:       '🃏 Emoji Memory Match',
    gameDescription: 'Flip cards to find all 8 matching pairs.',
    winDialogue: [
      { speaker: 'Patient',       sprite: '🎮', text: '…gg I guess.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Take your meds, champ.' },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '🎮', text: "EZ." },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "I let you win. Let's go again." },
    ],
  },
  {
    id: 6,
    sprite: '🏃',
    name: 'The Escape Artist',
    subName: '🏃‍♂️🛌🚪',
    intro: [
      { speaker: 'Patient',       sprite: '🏃', text: "You'll never catch me. I know this layout." },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: "The door is literally right there." },
      { speaker: 'Patient',       sprite: '🏃', text: 'I have a plan.' },
    ],
    gameTitle:       '🔀 Slide Puzzle',
    gameDescription: 'Rearrange tiles 1–8 to block the exit. Tap adjacent tiles!',
    winDialogue: [
      { speaker: 'Patient',       sprite: '🏃', text: '…there goes my plan.' },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Back to bed. Nicely.' },
    ],
    loseDialogue: [
      { speaker: 'Patient',       sprite: '🏃', text: "The exit remains open!" },
      { speaker: 'Nurse Saz 👩‍⚕️', sprite: '👩‍⚕️', text: 'Not for long.' },
    ],
  },
];

/* ═══════════════════════════════════════════════════════
   ROOM RENDERING
═══════════════════════════════════════════════════════ */
function renderRoom() {
  const grid = document.getElementById('room-grid');
  grid.innerHTML = PATIENTS.map(p => `
    <div
      class="patient-bed ${GameState.isHelped(p.id) ? 'helped' : ''}"
      data-patient-id="${p.id}"
      role="button"
      tabindex="0"
      aria-label="Patient ${p.id}: ${p.name}"
    >
      <span class="patient-bed-number">#${p.id}</span>
      ${GameState.isHelped(p.id) ? '<span class="helped-badge">✅</span>' : ''}
      <span class="patient-sprite-big">${p.sprite}</span>
      <span class="patient-bed-name">${p.name}</span>
    </div>
  `).join('');

  // Re-attach tap handlers
  grid.querySelectorAll('.patient-bed').forEach(bed => {
    const pid = +bed.dataset.patientId;
    function handleTap() { onPatientTap(pid); }
    bed.addEventListener('click', handleTap);
    bed.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') handleTap();
    });
  });

  // Update progress
  const count = GameState.helpedCount;
  document.getElementById('progress-badge').textContent = `${count}/6`;
  document.getElementById('progress-text').textContent =
    count === 0 ? 'Tap a patient to help them!'  :
    count < 6   ? `${count}/6 patients helped — keep going!` :
                  '🎉 All patients helped!';
}

/* ═══════════════════════════════════════════════════════
   GAME FLOW
═══════════════════════════════════════════════════════ */
function onPatientTap(patientId) {
  if (GameState.isHelped(patientId)) {
    showToast('Already helped! 😊');
    return;
  }

  const patient = PATIENTS.find(p => p.id === patientId);
  if (!patient) return;

  GameState.setCurrentPatient(patientId);
  GameState.setPhase('dialogue');

  // Step 1: Show intro dialogue
  DialogueSystem.show(patient.intro, () => {
    // Step 2: After dialogue, launch mini-game
    launchMiniGame(patient);
  });
}

function launchMiniGame(patient) {
  GameState.setPhase('minigame');

  document.getElementById('minigame-title').textContent       = patient.gameTitle;
  document.getElementById('minigame-description').textContent = patient.gameDescription;
  document.getElementById('minigame-content').innerHTML       = '';
  document.getElementById('minigame-status').textContent      = '';

  SceneManager.show('minigame');

  MiniGames.init(
    patient.id,
    () => onMiniGameResult(patient, true),
    () => onMiniGameResult(patient, false)
  );
}

function onMiniGameResult(patient, won) {
  MiniGames.cleanup();

  // Slight delay so the player sees the final status message
  setTimeout(() => {
    SceneManager.hide('minigame');

    const lines = won ? patient.winDialogue : patient.loseDialogue;

    DialogueSystem.show(lines, () => {
      if (won) {
        GameState.markHelped(patient.id);
        renderRoom();

        if (GameState.isComplete()) {
          // Short pause then show closing scene
          setTimeout(showClosingScene, 600);
        }
      }
      // If lost, player can tap the patient again to retry
    });
  }, 400);
}

/* ═══════════════════════════════════════════════════════
   CLOSING SCENE
═══════════════════════════════════════════════════════ */
function showClosingScene() {
  SceneManager.show('closing');
  spawnConfetti();
}

function spawnConfetti() {
  const container = document.getElementById('closing-confetti');
  container.innerHTML = '';
  const PIECES = ['🎉','🎈','⭐','🌸','💫','🎊','🎁','✨'];
  for (let i = 0; i < 30; i++) {
    const piece = document.createElement('div');
    piece.className   = 'confetti-piece';
    piece.textContent = PIECES[i % PIECES.length];
    piece.style.left     = (Math.random() * 100) + '%';
    piece.style.fontSize = (1.2 + Math.random() * 1.4) + 'rem';
    piece.style.animationDuration  = (4 + Math.random() * 5) + 's';
    piece.style.animationDelay     = (Math.random() * 4) + 's';
    container.appendChild(piece);
  }
}

/* ═══════════════════════════════════════════════════════
   TOAST
═══════════════════════════════════════════════════════ */
let _toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.add('hidden'), 2200);
}

/* ═══════════════════════════════════════════════════════
   GLOBAL EVENT LISTENERS
═══════════════════════════════════════════════════════ */
document.getElementById('btn-dialogue-next').addEventListener('click', () => {
  DialogueSystem.next();
});

document.getElementById('btn-play-again').addEventListener('click', () => {
  GameState.reset();
  SceneManager.show('room');
  renderRoom();
});

document.getElementById('btn-send-cake').addEventListener('click', () => {
  showToast('🎂 Cake sent with love! 🎂');
});

/* ═══════════════════════════════════════════════════════
   BOOT
═══════════════════════════════════════════════════════ */
(function boot() {
  renderRoom();
  // Room is already .active from HTML; no scene transition needed at startup.
})();
