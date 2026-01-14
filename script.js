const masterData = [
  { e: "🍎🥧", a: "pai apel" },
  { e: "🏠🔥", a: "rumah kebakaran" },
  { e: "🐈🔔", a: "kucing garong" },
  { e: "📖🐛", a: "kutu buku" },
  { e: "🦷🔵", a: "pasta gigi" },
  { e: "⚽👟", a: "sepak bola" },
  { e: "🕶️", a: "kacamata hitam" },
  { e: "👃🩸", a: "mimisan" },
  { e: "🌙🥡", a: "makan malam" },
  { e: "⚡🚗", a: "mobil listrik" },
  { e: "🧥🌧️", a: "jas hujan" },
  { e: "🔥🚄", a: "kereta api" },
  { e: "🍉🔪", a: "potong semangka" },
  { e: "🧊☕", a: "es kopi" },
  { e: "🐄🥛", a: "susu sapi" },
  { e: "👂🔥", a: "telinga panas" },
  { e: "🖐️💎", a: "tangan kanan" },
  { e: "🧂💧", a: "air garam" },
  { e: "🕰️🚀", a: "mesin waktu" },
  { e: "👑🐝", a: "ratu lebah" },
  { e: "📦🌑", a: "kotak hitam" },
  { e: "🧗‍♂️🏔️", a: "panjat tebing" },
  { e: "🍫🧊", a: "cokelat dingin" },
  { e: "🐍🪜", a: "ular tangga" },
  { e: "🦆🥚", a: "telur bebek" },
  { e: "🎤🌊", a: "penyanyi laut" },
  { e: "👣🏖️", a: "jejak kaki" },
  { e: "🍿🎬", a: "nonton bioskop" },
  { e: "🍌🏃", a: "lari pagi" },
  { e: "🧱🧱", a: "tembok cina" },
  { e: "🛌💸", a: "tidur siang" },
  { e: "🏹❤️", a: "panah asmara" },
  { e: "🌋🥣", a: "bubur panas" },
  { e: "🧟‍♂️🧠", a: "zombie lapar" },
  { e: "🎭😭", a: "drama sedih" },
  { e: "👔💼", a: "kerja kantoran" },
  { e: "🛕🗿", a: "candi borobudur" },
  { e: "🚑🚨", a: "suara ambulans" },
  { e: "📸🌲", a: "foto pemandangan" },
  { e: "🧶🐈", a: "benang wol" },
  { e: "🧂🍭", a: "manis asin" },
  { e: "🛸👽", a: "piring terbang" },
  { e: "🔭🌌", a: "melihat bintang" },
  { e: "🧼🫧", a: "sabun mandi" },
  { e: "📻🎶", a: "mendengar lagu" },
  { e: "🥥🌴", a: "es kelapa muda" },
  { e: "🏜️🐪", a: "padang pasir" },
  { e: "🦋🕸️", a: "jaring laba laba" },
  { e: "🧠🔥", a: "otak panas" },
  { e: "🏁🔚", a: "garis finish" },
];

let players = JSON.parse(localStorage.getItem("gamePlayers")) || {};
let currentPlayer = localStorage.getItem("activePlayer") || "";
let lives = 4;
let sessionQuestions = [];

// --- FUNGSI SUARA ---
function playSound(type) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);

  if (type === "correct") {
    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1); // A5
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.2);
  } else if (type === "wrong") {
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(150, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.3);
  } else if (type === "lvlup") {
    osc.type = "square";
    [440, 554, 659, 880].forEach((f, i) => {
      const o = audioCtx.createOscillator();
      o.connect(audioCtx.destination);
      o.frequency.value = f;
      o.start(audioCtx.currentTime + i * 0.1);
      o.stop(audioCtx.currentTime + i * 0.1 + 0.1);
    });
  }
}

function showPage(id) {
  document.querySelectorAll(".page").forEach((p) => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

window.onload = () => {
  refreshPlayerList();
  showPage("page-welcome");
};

function refreshPlayerList() {
  const list = document.getElementById("playerList");
  list.innerHTML = "";
  const keys = Object.keys(players);
  if (keys.length === 0) {
    list.innerHTML = "<option disabled selected>Belum ada profil</option>";
  } else {
    keys.forEach((name) => {
      let opt = document.createElement("option");
      opt.value = name;
      opt.innerText = name;
      list.appendChild(opt);
    });
  }
}

// --- PERBAIKAN HAPUS PROFIL ---
function deleteProfile() {
  const list = document.getElementById("playerList");
  const name = list.value;
  if (!name || name.includes("Belum ada profil")) {
    alert("Pilih profil yang ingin dihapus!");
    return;
  }
  if (confirm(`Hapus permanen profil "${name}"?`)) {
    delete players[name];
    saveAllData();
    refreshPlayerList();
  }
}

function createNewPlayer() {
  const name = document.getElementById("playerNameInput").value.trim();
  if (name && !players[name]) {
    players[name] = { currentIdx: 0, score: 0 };
    saveAllData();
    currentPlayer = name;
    localStorage.setItem("activePlayer", name);
    setupReadyPage();
  } else {
    alert("Nama tidak valid atau sudah ada!");
  }
}

function loginPlayer() {
  const name = document.getElementById("playerList").value;
  if (name && players[name]) {
    currentPlayer = name;
    localStorage.setItem("activePlayer", name);
    setupReadyPage();
  }
}

function setupReadyPage() {
  const data = players[currentPlayer];
  document.getElementById("displayName").innerText = currentPlayer;
  document.getElementById("savedLvl").innerText = Math.floor(data.currentIdx / 5) + 1;
  document.getElementById("savedScore").innerText = data.score;
  showPage("page-ready");
}

function startGame() {
  const data = players[currentPlayer];
  const lvl = Math.floor(data.currentIdx / 5);
  const end = (lvl + 1) * 5;
  sessionQuestions = masterData.slice(data.currentIdx, end).sort(() => Math.random() - 0.5);

  if (sessionQuestions.length === 0 && data.currentIdx < masterData.length) {
    // Jika sisa di level ini 0 tapi total belum tamat
    players[currentPlayer].currentIdx = end;
    startGame();
    return;
  }
  showPage("page-game");
  loadQuestion();
}

function loadQuestion() {
  if (sessionQuestions.length === 0) {
    playSound("lvlup");
    document.getElementById("nextLvlText").innerText = Math.floor(players[currentPlayer].currentIdx / 5) + 1;
    showPage("page-levelup");
    return;
  }
  const q = sessionQuestions[0];
  document.getElementById("emojiBox").innerText = q.e;
  document.getElementById("userInput").value = "";
  document.getElementById("hintBox").innerHTML = q.a
    .split("")
    .map((c) => (c === " " ? "\u00A0" : "_"))
    .join(" ");
  updateHUD();
}

function checkAnswer() {
  const userVal = document.getElementById("userInput").value.toLowerCase().trim();
  const realVal = sessionQuestions[0].a.toLowerCase();

  if (userVal === realVal) {
    playSound("correct");
    let oldLvl = Math.floor(players[currentPlayer].currentIdx / 5) + 1;
    players[currentPlayer].score += 10;
    players[currentPlayer].currentIdx++;
    let newLvl = Math.floor(players[currentPlayer].currentIdx / 5) + 1;
    sessionQuestions.shift();
    saveAllData();
    loadQuestion();
  } else {
    playSound("wrong");
    lives--;
    updateHUD();
    document.getElementById("gameCard").classList.add("shake");
    setTimeout(() => document.getElementById("gameCard").classList.remove("shake"), 400);
    if (lives <= 0) startCooldown();
  }
}

function updateHUD() {
  const data = players[currentPlayer];
  document.getElementById("lvlDisplay").innerText = Math.floor(data.currentIdx / 5) + 1;
  document.getElementById("scoreDisplay").innerText = data.score;
  let h = "";
  for (let i = 0; i < lives; i++) h += "❤️";
  document.getElementById("livesDisplay").innerText = h || "💀";
}

function getSmartHint() {
  const data = players[currentPlayer];
  if (data.score < 5) {
    alert("Skor tidak cukup!");
    return;
  }
  data.score -= 5;
  saveAllData();
  updateHUD();
  const ans = sessionQuestions[0].a;
  document.getElementById("hintBox").innerHTML = ans
    .split("")
    .map((c, i) => {
      if (c === " ") return "\u00A0";
      return i === 0 || i === ans.length - 1 || Math.random() > 0.7 ? c.toUpperCase() : "_";
    })
    .join(" ");
}

function saveAllData() {
  localStorage.setItem("gamePlayers", JSON.stringify(players));
}
function goToLanding() {
  showPage("page-landing");
}
function logout() {
  localStorage.removeItem("activePlayer");
  location.reload();
}
function resetCurrentData() {
  if (confirm("Reset progres?")) {
    players[currentPlayer] = { currentIdx: 0, score: 0 };
    saveAllData();
    setupReadyPage();
  }
}
function startCooldown() {
  showPage("page-wait");
  playSound("wrong");
  let sec = 15;
  const timer = setInterval(() => {
    sec--;
    document.getElementById("timer").innerText = sec;
    if (sec <= 0) {
      clearInterval(timer);
      lives = 4;
      setupReadyPage();
    }
  }, 1000);
}

// Enter Key Support
document.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const gameActive = document.getElementById("page-game").classList.contains("active");
    if (gameActive) checkAnswer();
  }
});

let isPaused = false;

function togglePause() {
    const overlay = document.getElementById('pause-overlay');
    const userInput = document.getElementById('userInput');
    
    isPaused = !isPaused;
    
    if (isPaused) {
        overlay.classList.add('pause-active');
        userInput.blur(); // Hilangkan fokus keyboard agar tidak mengganggu
    } else {
        overlay.classList.remove('pause-active');
        userInput.focus(); // Fokus kembali ke input setelah lanjut
    }
}

// Tambahan: Pastikan tombol cek jawaban tidak bekerja saat pause
const originalCheckAnswer = checkAnswer;
checkAnswer = function() {
    if (isPaused) return; 
    originalCheckAnswer();
};

// musik
const audio = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
const musicIcon = document.getElementById('musicIcon');

function toggleMusic() {
    if (audio.paused) {
        audio.play();
        musicBtn.classList.remove('off');
        musicIcon.innerText = "🔊"; // Ikon saat musik nyala
    } else {
        audio.pause();
        musicBtn.classList.add('off');
        musicIcon.innerText = "🔇"; // Ikon saat musik mati
    }
}