/* ============================================================
   ANALISIS KASUS: ANOMALI DI KAMAR 404 (EDISI MULTI-PROSES INTERAKTIF)
   Modular JavaScript ES6 OOP Game Engine (No Emojis)
   ============================================================ */

// ── 1. MASTER CLUES DICTIONARY ──
const CLUES = {
  "clue-lividity": {
    id: "clue-lividity",
    name: "Lebam Mayat Posterior",
    description: "Lebam mayat terkonsentrasi menetap di punggung, membuktikan korban meninggal telentang di lantai rata selama minimal 8 jam sebelum digantung."
  },
  "clue-neck": {
    id: "clue-neck",
    name: "Jeratan Leher Datar",
    description: "Jejak jeratan melingkar datar di leher bawah membuktikan cekikan pencekikan horizontal dari belakang saat berbaring."
  },
  "clue-anesthetic": {
    id: "clue-anesthetic",
    name: "Temuan Kloroform Paru",
    description: "Uji reagen kimia membuktikan cairan paru mengandung kloroform, membuktikan korban dibius pingsan sebelum dicekik."
  },
  "clue-smartlock": {
    id: "clue-smartlock",
    name: "Master PIN Hendra Wijaya",
    description: "Dekripsi log smart lock menunjukkan pintu kamar dikunci dari luar menggunakan PIN Master atas nama Hendra Wijaya (Tersangka C)."
  },
  "clue-handwriting": {
    id: "clue-handwriting",
    name: "Surat Wasiat Palsu",
    description: "Analisis grafologi membuktikan surat wasiat ditulis oleh Tersangka C, terlihat dari bentuk ekor huruf 'g' terbuka dan kemiringan tegak lurus."
  },
  "clue-drawer-paint": {
    id: "clue-drawer-paint",
    name: "Cat Merah Pada Laci PIN",
    description: "Noda cat anti-karat merah pada gagang laci kunci kantor admin cocok dengan cat koridor Tersangka C hari itu, membuktikan ia mengambil PIN Master."
  },
  "clue-alibi-c": {
    id: "clue-alibi-c",
    name: "Kebohongan Alibi Tersangka C",
    description: "Tersangka C mengaku berada di luar kota hingga pukul 22:30, namun terbukti berada di apartemen korban pukul 21:30 menggunakan PIN Master-nya."
  }
};

const SMARTLOCK_LOGS = [
  { time: "18:15", type: "UNLOCK", user: "PIN Korban (Slot 01)", status: "Berhasil masuk ke apartemen." },
  { time: "19:30", type: "LOCK", user: "Auto-Lock Sistem", status: "Pintu terkunci otomatis dari dalam." },
  { time: "21:30", type: "LOCK", user: "Master PIN (Slot 99)", status: "Pintu dikunci secara manual dari luar apartemen." }
];

const WITNESS_BAP = [
  {
    id: "suspect-a",
    name: "Tersangka A (Rekan Kerja)",
    alibi: "Melakukan siaran langsung (live streaming) game pukul 20:00 - 22:00.",
    transcript: [
      { speaker: "Penyelidik", text: "Di mana posisi Anda pada malam kejadian pukul 20:00 hingga 22:00?" },
      { speaker: "Tersangka A", text: "Saya sedang melakukan siaran langsung game di platform streaming dari kamar apartemen saya. Ratusan penonton melihat saya di kamera tanpa henti." },
      { speaker: "Penyelidik", text: "Apakah Anda memiliki kunci apartemen korban?" },
      { speaker: "Tersangka A", text: "Tidak, saya hanya rekan kerja biasa. Saya tidak memiliki kepentingan dengan apartemennya." }
    ]
  },
  {
    id: "suspect-b",
    name: "Tersangka B (Mantan Pasangan)",
    alibi: "Tidur di rumah pribadi sejak pukul 19:30.",
    transcript: [
      { speaker: "Penyelidik", text: "Bagaimana hubungan Anda dengan korban belakangan ini?" },
      { speaker: "Tersangka B", text: "Kami berpisah secara baik-baik. Saya tidak ada kontak dengannya lagi." },
      { speaker: "Penyelidik", text: "Di mana Anda saat malam kejadian?" },
      { speaker: "Tersangka B", text: "Saya meminum obat penenang dan tertidur lelap di rumah saya sejak pukul 19:30 malam hingga pagi." }
    ]
  },
  {
    id: "suspect-c",
    name: "Tersangka C (Pemilik Apartemen)",
    alibi: "Menghadiri jamuan makan malam bisnis di luar kota.",
    transcript: [
      { speaker: "Penyelidik", text: "Sebagai pemilik, apakah Anda memegang kendali atas kode pintu kamar 404?" },
      { speaker: "Tersangka C", text: "Saya memegang Master PIN darurat untuk semua kamar. Namun saya tidak pernah memakainya tanpa izin tertulis dari penyewa apartemen." },
      { speaker: "Penyelidik", text: "Di mana posisi Anda saat malam pembunuhan?" },
      { speaker: "Tersangka C", text: "Saya menghadiri makan malam di luar kota. Saya baru kembali dan tiba di kompleks apartemen saya pukul 22:30 malam." }
    ]
  }
];

// ── 2. MODULE: INTERACTIVE AUTOPSY PATHOLOGY & REAGENT SCANNER ──
class AutopsyModule {
  constructor(game) {
    this.game = game;
    this.statusText = document.getElementById("autopsy-scan-status");
    this.scanDetails = document.getElementById("autopsy-scan-details");
    this.hotspots = document.querySelectorAll(".autopsy-hotspot");

    // Reagent UI Elements
    this.selectReagentA = document.getElementById("reagent-a");
    this.selectReagentB = document.getElementById("reagent-b");
    this.btnRunReagent = document.getElementById("btn-run-reagent");
    this.testTube = document.getElementById("test-tube-liquid");

    this.scannedAreas = { neck: false, back: false, legs: false };
    this.init();
  }

  init() {
    this.hotspots.forEach((hs) => {
      hs.addEventListener("click", (e) => {
        e.preventDefault();
        const area = hs.getAttribute("data-area");
        this.scanArea(area);
      });
    });

    if (this.btnRunReagent) {
      this.btnRunReagent.addEventListener("click", () => this.runReagentTest());
    }
  }

  scanArea(area) {
    if (!this.statusText || !this.scanDetails) return;

    this.statusText.textContent = "MEMINDAI DOKUMEN FORENSIK...";
    this.statusText.className = "autopsy-scan-status-indicator scanning";
    this.scanDetails.innerHTML = `<div class="scan-progress-bar"><div class="scan-progress-fill"></div></div>`;

    setTimeout(() => {
      this.statusText.textContent = "PEMINDAIAN SELESAI";
      this.statusText.className = "autopsy-scan-status-indicator ready";

      if (area === "neck") {
        this.scanDetails.innerHTML = `
          <strong>Analisis Area Leher:</strong><br>
          Memar jeratan melingkar datar di leher bawah korban terdeteksi. Tidak ada kenaikan sudut jerat ke belakang telinga (sudut serong gantung diri).<br>
          <span class="unlocked-badge">BUKTI TERBUKA: Jeratan Leher Datar</span>
        `;
        this.scannedAreas.neck = true;
        this.game.unlockClue("clue-neck");
      } else if (area === "back") {
        this.scanDetails.innerHTML = `
          <strong>Analisis Area Punggung:</strong><br>
          Lividity (lebam mayat) terkumpul masif dan menetap penuh di punggung. Posisi jantung berhenti berdenyut saat tubuh berbaring telentang rata selama minimal 8 jam sebelum dipindahkan.<br>
          <span class="unlocked-badge">BUKTI TERBUKA: Lebam Mayat Posterior</span>
        `;
        this.scannedAreas.back = true;
        this.game.unlockClue("clue-lividity");
      } else if (area === "legs") {
        this.scanDetails.innerHTML = `
          <strong>Analisis Area Kaki & Tangan:</strong><br>
          Kondisi jaringan distal normal. Nihil pengendapan eritrosit di ujung kaki atau jari tangan. Membuktikan tubuh tidak dalam posisi vertikal (menggantung) saat darah membeku.<br>
          <span class="unlocked-badge">INFORMASI TERBONGKAR: Gravitasi Menolak Alibi Gantung Diri</span>
        `;
        this.scannedAreas.legs = true;
      }

      this.checkAllScanned();
    }, 1000);
  }

  checkAllScanned() {
    if (this.scannedAreas.neck && this.scannedAreas.back) {
      const chemSec = document.getElementById("autopsy-chemical-section");
      if (chemSec) chemSec.classList.remove("hidden");
    }
  }

  runReagentTest() {
    if (!this.selectReagentA || !this.selectReagentB || !this.testTube) return;

    const rA = this.selectReagentA.value;
    const rB = this.selectReagentB.value;

    if (!rA || !rB) {
      alert("Pilih kedua jenis reagen kimia untuk pengujian.");
      return;
    }

    const isCorrect = rA === "lieberman" && rB === "chloro-detect";

    this.testTube.style.backgroundColor = "#cbd5e1";
    this.btnRunReagent.disabled = true;
    this.btnRunReagent.textContent = "Menguji Cairan...";

    setTimeout(() => {
      this.btnRunReagent.disabled = false;
      this.btnRunReagent.textContent = "Jalankan Tes Reagen";

      if (isCorrect) {
        this.testTube.style.backgroundColor = "#6b21a8"; // purple reaction!
        const resultBox = document.getElementById("reagent-result-text");
        if (resultBox) {
          resultBox.innerHTML = `
            <div style="background: #f3e8ff; border: 1px solid #c084fc; color: #6b21a8; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
              <strong>REAKSI POSITIF (UNGU):</strong><br>
              Cairan paru-paru korban bereaksi terhadap kloroform. Korban dipastikan dibius menggunakan kloroform hingga tidak sadarkan diri sebelum dilakukan pencekikan leher.
              <br><span class="unlocked-badge" style="background:#c084fc; color:#ffffff;">BUKTI TERBUKA: Temuan Kloroform Paru</span>
            </div>
          `;
        }
        this.game.unlockClue("clue-anesthetic");
      } else {
        this.testTube.style.backgroundColor = "#94a3b8"; // grey reaction
        const resultBox = document.getElementById("reagent-result-text");
        if (resultBox) {
          resultBox.innerHTML = `
            <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
              <strong>REAKSI NEGATIF (ABU-ABU):</strong><br>
              Reagen tidak menunjukkan perubahan warna spesifik. Gunakan reagen Lieberman (uji anestesi) dan Chloro-detect untuk mendeteksi senyawa anestetik.
            </div>
          `;
        }
      }
    }, 1200);
  }
}

// ── 3. MODULE: LOG KUNCI & LACI KANTOR ──
class LogsModule {
  constructor(game) {
    this.game = game;
    this.lockTable = document.getElementById("smartlock-table-body");
    this.btnDecryptLock = document.getElementById("btn-decrypt-lock");
    this.lockProgress = document.getElementById("lock-progress-container");

    this.selectDrawerSuspect = document.getElementById("drawer-suspect-match");
    this.btnMatchDrawer = document.getElementById("btn-match-drawer");
    this.drawerResult = document.getElementById("drawer-result-text");

    this.init();
  }

  init() {
    this.renderLockLogs(false);

    if (this.btnDecryptLock) {
      this.btnDecryptLock.addEventListener("click", () => this.runLockDecryption());
    }

    if (this.btnMatchDrawer) {
      this.btnMatchDrawer.addEventListener("click", () => this.verifyDrawerMatch());
    }
  }

  renderLockLogs(decrypted = false) {
    if (!this.lockTable) return;
    this.lockTable.innerHTML = SMARTLOCK_LOGS.map((log) => {
      const statusClass = log.type === "LOCK" ? "status-lock" : "status-unlock";
      const userDisplay = (log.time === "21:30" && !decrypted) ? "Master PIN (Slot 99 - ENCRYPTED)" : log.user;
      return `
        <tr>
          <td><span class="log-time">${log.time}</span></td>
          <td><span class="log-status ${statusClass}">${log.type}</span></td>
          <td><strong>${userDisplay}</strong></td>
          <td>${log.status}</td>
        </tr>
      `;
    }).join("");
  }

  runLockDecryption() {
    if (!this.btnDecryptLock || !this.lockProgress) return;

    this.btnDecryptLock.disabled = true;
    this.lockProgress.className = "progress-container visible";
    const fill = this.lockProgress.querySelector(".progress-fill");
    const statusText = document.getElementById("lock-status-text");

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (fill) fill.style.width = `${progress}%`;
      if (statusText) statusText.textContent = `Mengurai Log Pintu: ${progress}%...`;

      if (progress >= 100) {
        clearInterval(interval);
        statusText.textContent = "DEKRIPSI SELESAI!";
        this.lockProgress.className = "progress-container hidden";
        this.btnDecryptLock.textContent = "Log Smart Lock Terurai";

        this.renderLockLogs(true);
        this.game.unlockClue("clue-smartlock");
      }
    }, 150);
  }

  verifyDrawerMatch() {
    if (!this.selectDrawerSuspect || !this.drawerResult) return;

    const val = this.selectDrawerSuspect.value;
    if (!val) {
      alert("Pilih aktivitas tersangka yang cocok dengan temuan noda cat merah.");
      return;
    }

    if (val === "suspect-c-pagar") {
      if (this.drawerResult) {
        this.drawerResult.innerHTML = `
          <div style="background: #dcfce7; border: 1px solid #bbf7d0; color: #15803d; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
            <strong>KORELASI JEJAK DITEMUKAN:</strong><br>
            Noda cat merah pada laci berkas PIN Master di kantor administrasi terbukti identik dengan cat besi anti-karat merah yang digunakan Tersangka C (Hendra) untuk merenovasi pagar koridor pada pagi hari kejadian.
            <br><span class="unlocked-badge">BUKTI TERBUKA: Cat Merah Pada Laci PIN</span>
          </div>
        `;
      }
      this.game.unlockClue("clue-drawer-paint");
    } else {
      if (this.drawerResult) {
        this.drawerResult.innerHTML = `
          <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
            <strong>KORELASI TIDAK COCOK:</strong><br>
            Tersangka tersebut tidak memiliki riwayat kontak dengan cat merah pada hari kejadian. Periksa kembali BAP tersangka lain.
          </div>
        `;
      }
    }
  }
}

// ── 4. MODULE: INTERACTIVE HANDWRITING GRAPHOLOGY ──
class GraphologyModule {
  constructor(game) {
    this.game = game;
    this.selectSlant = document.getElementById("graph-slant");
    this.selectLoop = document.getElementById("graph-loop");
    this.selectSpace = document.getElementById("graph-space");
    this.btnVerify = document.getElementById("btn-run-graphology");
    this.resultBox = document.getElementById("graphology-result-text");

    this.init();
  }

  init() {
    if (this.btnVerify) {
      this.btnVerify.addEventListener("click", () => this.verifyGraphology());
    }
  }

  verifyGraphology() {
    if (!this.selectSlant || !this.selectLoop || !this.selectSpace || !this.resultBox) return;

    const slant = this.selectSlant.value;
    const loop = this.selectLoop.value;
    const space = this.selectSpace.value;

    if (!slant || !loop || !space) {
      alert("Lengkapi analisis ketiga kriteria parameter tulisan tangan.");
      return;
    }

    const isCorrect = slant === "lurus-tegak" && loop === "loop-terbuka" && space === "terputus-putus";

    if (isCorrect) {
      this.resultBox.innerHTML = `
        <div style="background: #dcfce7; border: 1px solid #bbf7d0; color: #15803d; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
          <strong>ANALISIS GRAFOLOGI SUKSES:</strong><br>
          Gaya penulisan pada Surat Wasiat (kemiringan lurus tegak, ekor huruf 'g' terbuka, spasi terputus) bertolak belakang dengan tulisan asli korban di Buku Harian (miring kanan, ekor 'g' tertutup). Namun, tulisan wasiat tersebut identik dengan contoh tulisan Tersangka C di formulir kontrak sewa apartemen. Surat Wasiat terbukti PALSU.
          <br><span class="unlocked-badge">BUKTI TERBUKA: Surat Wasiat Palsu</span>
        </div>
      `;
      this.game.unlockClue("clue-handwriting");
    } else {
      this.resultBox.innerHTML = `
        <div style="background: #fee2e2; border: 1px solid #fecaca; color: #991b1b; padding: 12px; font-size: 0.75rem; border-radius: 2px; line-height:1.4;">
          <strong>ANALISIS TIDAK SESUAI:</strong><br>
          Hasil perbandingan ciri tulisan belum cocok. Bandingkan detail kemiringan huruf tegak, bentuk loop bawah huruf 'g' yang terbuka lebar, dan sambungan spasi antar kata.
        </div>
      `;
    }
  }
}

// ── 5. MODULE: BAP & ALIBI DEBUNKER ──
class BAPModule {
  constructor(game) {
    this.game = game;
    this.witnessTabs = document.querySelectorAll(".witness-tab");
    this.transcriptBox = document.getElementById("bap-dialog-box");
    this.witnessName = document.getElementById("bap-witness-name");
    this.witnessAlibi = document.getElementById("bap-witness-alibi");
    this.debunkArea = document.getElementById("bap-debunk-area");

    this.currentWitness = "suspect-a";
    this.init();
  }

  init() {
    this.witnessTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        this.currentWitness = tab.getAttribute("data-witness");
        this.witnessTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        this.renderWitness();
      });
    });
    this.renderWitness();
  }

  renderWitness() {
    const data = WITNESS_BAP.find((w) => w.id === this.currentWitness);
    if (!data) return;

    if (this.witnessName) this.witnessName.textContent = data.name;
    if (this.witnessAlibi) this.witnessAlibi.textContent = `Alibi: ${data.alibi}`;

    if (this.transcriptBox) {
      this.transcriptBox.innerHTML = data.transcript
        .map(
          (line) => `
          <div class="bap-line">
            <span class="bap-speaker">${line.speaker}:</span>
            <span class="bap-text">${line.text}</span>
          </div>
        `
        )
        .join("");
    }

    this.renderDebunkControls();
  }

  renderDebunkControls() {
    if (!this.debunkArea) return;

    if (this.currentWitness === "suspect-c") {
      const isAlreadyDebunked = this.game.unlockedClues.includes("clue-alibi-c");

      if (isAlreadyDebunked) {
        this.debunkArea.innerHTML = `
          <div class="bap-debunk-result success">
            <strong>ALIBI TERBONGKAR:</strong> Kesaksian Tersangka C bahwa ia baru tiba di apartemen pukul 22:30 malam terbantahkan secara telak oleh sensor Smart Lock yang membuktikan Master PIN miliknya digunakan mengunci pintu kamar 404 dari luar pada pukul 21:30.
          </div>
        `;
      } else {
        this.debunkArea.innerHTML = `
          <div class="bap-debunk-form">
            <label class="form-label" style="font-size: 0.72rem; color: var(--text-secondary);">Bantah alibi makan luar kota Tersangka C dengan bukti:</label>
            <div style="display: flex; gap: 8px; margin-top: 6px;">
              <select id="debunk-evidence-select" class="form-select" style="font-size: 0.75rem; padding: 4px 8px; max-width: 250px;">
                <option value="">-- Pilih Bukti --</option>
                <option value="autopsy">Laporan Otopsi: Kematian 20:00 - 21:00</option>
                <option value="lock-2130">Log Smart Lock: PIN Master pukul 21:30</option>
                <option value="graphology">Buku Harian: Hasil Grafologi Tulisan</option>
              </select>
              <button class="verify-btn" onclick="window.gameController.bapModule.submitDebunk()">Debunk</button>
            </div>
          </div>
        `;
      }
    } else {
      this.debunkArea.innerHTML = "";
    }
  }

  submitDebunk() {
    const select = document.getElementById("debunk-evidence-select");
    if (!select) return;

    const value = select.value;

    const smartLockUnlocked = this.game.unlockedClues.includes("clue-smartlock");

    if (!smartLockUnlocked) {
      alert("Dekripsi log smart lock terlebih dahulu di tab Log Pintu & Laci Kantor.");
      return;
    }

    if (value === "lock-2130") {
      this.game.unlockClue("clue-alibi-c");
      this.renderWitness();
    } else {
      alert("Tersangka C menyangkal tuduhan Anda. Bukti tersebut tidak mematahkan alibi waktu kepulangannya.");
    }
  }
}

// ── 6. MODULE: DEDUCTION MATRIX ──
class DeductionModule {
  constructor(game) {
    this.game = game;
    this.selectPhysical = document.getElementById("deduction-physical");
    this.selectDigital = document.getElementById("deduction-digital");
    this.selectDrawerPaint = document.getElementById("deduction-drawer-paint");
    this.selectSmartLock = document.getElementById("deduction-smartlock");
    this.selectSuspect = document.getElementById("deduction-suspect");
    
    this.btnSubmit = document.getElementById("btn-deduction-submit");
    this.feedback = document.getElementById("deduction-feedback");

    this.init();
  }

  init() {
    if (this.btnSubmit) {
      this.btnSubmit.addEventListener("click", () => this.verifyDeduction());
    }
    this.updateDropdownOptions();
  }

  updateDropdownOptions() {
    if (
      !this.selectPhysical || 
      !this.selectDigital || 
      !this.selectDrawerPaint ||
      !this.selectSmartLock ||
      !this.selectSuspect
    )
      return;

    const updateSelect = (selectElement, requiredClues, correctValue, correctText) => {
      const allCluesUnlocked = requiredClues.every((clueId) => this.game.unlockedClues.includes(clueId));
      selectElement.innerHTML = `<option value="">-- Pilih Bukti --</option>`;
      if (allCluesUnlocked) {
        selectElement.innerHTML += `<option value="${correctValue}">${correctText}</option>`;
      } else {
        selectElement.innerHTML += `<option value="locked" disabled>-- Bukti Terkunci --</option>`;
      }
    };

    updateSelect(
      this.selectPhysical,
      ["clue-lividity", "clue-neck", "clue-anesthetic"],
      "lebam-punggung-kloroform",
      "Lebam mayat posterior, jeratan datar, dan kloroform cairan paru"
    );

    updateSelect(
      this.selectDigital,
      ["clue-handwriting"],
      "wasiat-palsu-hendra",
      "Surat wasiat palsu buatan Tersangka C berdasarkan uji grafologi"
    );

    updateSelect(
      this.selectDrawerPaint,
      ["clue-drawer-paint"],
      "cat-merah-laci",
      "Noda cat anti-karat merah koridor pada laci kunci PIN Master"
    );

    updateSelect(
      this.selectSmartLock,
      ["clue-smartlock"],
      "master-pin-2130",
      "Penguncian pintu dari luar menggunakan PIN Master pukul 21:30"
    );

    updateSelect(
      this.selectSuspect,
      ["clue-alibi-c"],
      "tersangka-c-staged-suicide",
      "Tersangka C membius & mencekik korban, lalu merekayasa gantung diri"
    );
  }

  verifyDeduction() {
    const physical = this.selectPhysical.value;
    const digital = this.selectDigital.value;
    const drawerPaint = this.selectDrawerPaint.value;
    const smartLock = this.selectSmartLock.value;
    const suspect = this.selectSuspect.value;

    if (!physical || !digital || !drawerPaint || !smartLock || !suspect) {
      this.showError("Lengkapi kelima parameter Matriks Deduksi.");
      return;
    }

    if (
      physical === "lebam-punggung-kloroform" &&
      digital === "wasiat-palsu-hendra" &&
      drawerPaint === "cat-merah-laci" &&
      smartLock === "master-pin-2130" &&
      suspect === "tersangka-c-staged-suicide"
    ) {
      this.hideError();
      this.game.showVictory();
    } else {
      this.showError("Logika waktumu berantakan. Cek kembali posisi gravitasi pada darah mayat.");
    }
  }

  showError(message) {
    if (this.feedback) {
      this.feedback.textContent = message;
      this.feedback.className = "feedback-banner error";
    }
  }

  hideError() {
    if (this.feedback) {
      this.feedback.className = "feedback-banner hidden";
      this.feedback.innerHTML = "";
    }
  }
}

// ── 7. MAIN GAMESTATE MANAGER ──
class GameController {
  constructor() {
    this.unlockedClues = [];
    this.tabButtons = document.querySelectorAll(".nav-item");
    this.subTabButtons = document.querySelectorAll(".sub-nav-btn");
    this.tabPanels = document.querySelectorAll(".tab-panel");
    this.modal = document.getElementById("victory-modal");
    this.btnModalClose = document.getElementById("btn-modal-close");
    this.btnModalAction = document.getElementById("btn-modal-close-action");
    this.clueBinder = document.getElementById("clue-binder-container");

    // Briefing Welcome Modal
    this.briefingModal = document.getElementById("briefing-modal");
    this.btnBriefingClose = document.getElementById("btn-briefing-close");
    this.btnBriefingStart = document.getElementById("btn-briefing-start");

    // Mobile Panel Switchers
    this.btnMobileTabBukti = document.getElementById("mobile-tab-bukti");
    this.btnMobileTabDeduksi = document.getElementById("mobile-tab-deduksi");
    this.mainWorkspace = document.querySelector(".main-workspace");
    this.rightPanel = document.querySelector(".right-panel");

    this.init();
  }

  init() {
    this.autopsyModule = new AutopsyModule(this);
    this.logsModule = new LogsModule(this);
    this.graphologyModule = new GraphologyModule(this);
    this.bapModule = new BAPModule(this);
    this.deductionModule = new DeductionModule(this);

    // Desktop Tab clicks
    this.tabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-tab");
        this.switchTab(tabId);
      });
    });

    // Mobile Sub-tab clicks
    this.subTabButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const tabId = btn.getAttribute("data-sub-tab");
        this.switchTab(tabId);
      });
    });

    // Mobile Main Panel clicks
    if (this.btnMobileTabBukti && this.btnMobileTabDeduksi && this.mainWorkspace && this.rightPanel) {
      this.btnMobileTabBukti.addEventListener("click", () => {
        this.btnMobileTabBukti.classList.add("active");
        this.btnMobileTabDeduksi.classList.remove("active");
        this.mainWorkspace.classList.remove("hidden-mobile");
        this.rightPanel.classList.add("hidden-mobile");
      });

      this.btnMobileTabDeduksi.addEventListener("click", () => {
        this.btnMobileTabDeduksi.classList.add("active");
        this.btnMobileTabBukti.classList.remove("active");
        this.rightPanel.classList.remove("hidden-mobile");
        this.mainWorkspace.classList.add("hidden-mobile");
      });
    }

    // Modal Close
    if (this.btnModalClose) {
      this.btnModalClose.addEventListener("click", () => this.hideVictory());
    }
    if (this.btnModalAction) {
      this.btnModalAction.addEventListener("click", () => this.hideVictory());
    }

    // Briefing Close
    if (this.btnBriefingClose) {
      this.btnBriefingClose.addEventListener("click", () => this.hideBriefing());
    }
    if (this.btnBriefingStart) {
      this.btnBriefingStart.addEventListener("click", () => this.hideBriefing());
    }

    // Initial Mobile View Setting
    if (window.innerWidth < 1100 && this.rightPanel) {
      this.rightPanel.classList.add("hidden-mobile");
    }

    this.updateAutopsyConclusions();
    this.renderClueBinder();
  }

  hideBriefing() {
    if (this.briefingModal) {
      this.briefingModal.classList.remove("visible");
    }
  }

  switchTab(tabId) {
    // Desktop Nav Active State
    this.tabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-tab") === tabId);
    });

    // Mobile Sub-Nav Active State
    this.subTabButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.getAttribute("data-sub-tab") === tabId);
    });

    // Toggle Content Panels
    this.tabPanels.forEach((panel) => {
      panel.classList.toggle("hidden", panel.id !== `tab-${tabId}`);
    });

    // Header Title Update
    const headerTitle = document.getElementById("page-header-title");
    if (headerTitle) {
      headerTitle.textContent = this.getTabTitle(tabId);
    }
  }

  getTabTitle(tabId) {
    const titles = {
      autopsy: "Laporan Patologi (Otopsi) Forensik",
      logs: "Log Pintu & Laci Kantor",
      graphology: "Pemeriksaan Dokumen Fisik",
      bap: "Transkrip BAP Tersangka"
    };
    return titles[tabId] || "Analisis Kamar 404";
  }

  updateAutopsyConclusions() {
    const conclusionsList = document.getElementById("autopsy-conclusions");
    if (!conclusionsList) return;

    const hasNeck = this.unlockedClues.includes("clue-neck");
    const hasBack = this.unlockedClues.includes("clue-lividity");
    const hasChloro = this.unlockedClues.includes("clue-anesthetic");

    if (!hasNeck && !hasBack && !hasChloro) {
      conclusionsList.innerHTML = `<li id="autopsy-empty-conclusion" style="color: var(--text-muted); font-style: italic;">[Menunggu pemindaian sensorik leher & punggung]</li>`;
      return;
    }

    conclusionsList.innerHTML = "";

    if (hasNeck) {
      conclusionsList.innerHTML += `<li><strong>Diagnosis Cedera Leher:</strong> Pola jeratan melingkar datar di bagian leher bawah menunjukkan adanya pencekikan mekanis horizontal sebelum korban diposisikan menggantung.</li>`;
    }
    if (hasBack) {
      conclusionsList.innerHTML += `<li><strong>Diagnosis Lebam Mayat:</strong> Lebam masif posterior (punggung) menetap membuktikan darah membeku saat tubuh telentang datar selama minimal 8 jam pasca henti jantung.</li>`;
    }
    if (hasChloro) {
      conclusionsList.innerHTML += `<li><strong>Diagnosis Toksikologi:</strong> Analisis toksikologi cairan paru positif mengandung kloroform, membuktikan adanya pembiusan sebelum eksekusi gantung diri rekayasa.</li>`;
    }
  }

  unlockClue(clueId) {
    if (this.unlockedClues.includes(clueId)) return;

    this.unlockedClues.push(clueId);
    this.updateAutopsyConclusions();
    this.renderClueBinder();
    this.deductionModule.updateDropdownOptions();
  }

  renderClueBinder() {
    if (!this.clueBinder) return;

    if (this.unlockedClues.length === 0) {
      this.clueBinder.innerHTML = `
        <div style="font-size: 0.72rem; color: #94a3b8; text-align: center; padding: 12px; border: 1px dashed #374151; border-radius: var(--radius);">
          Belum ada petunjuk bukti yang disematkan di papan desk penyidikan.
        </div>
      `;
      return;
    }

    const getClueIcon = (clueId) => {
      if (clueId === "clue-lividity" || clueId === "clue-neck") {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>`;
      }
      if (clueId === "clue-anesthetic") {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><path d="M10 2v8L4 20h16L14 10V2h-4z"/></svg>`;
      }
      if (clueId === "clue-smartlock") {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`;
      }
      if (clueId === "clue-handwriting") {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>`;
      }
      if (clueId === "clue-drawer-paint") {
        return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"/><path d="M12 16V12"/><path d="M12 8H12.01"/></svg>`;
      }
      return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="clue-badge-photo-icon"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`;
    };

    this.clueBinder.innerHTML = this.unlockedClues
      .map((clueId) => {
        const clue = CLUES[clueId];
        return `
          <div class="clue-badge-card">
            <div class="clue-badge-photo-box">
              ${getClueIcon(clueId)}
            </div>
            <div class="clue-badge-title">${clue.name}</div>
            <div class="clue-badge-desc">${clue.description}</div>
          </div>
        `;
      })
      .join("");
  }

  showVictory() {
    if (this.modal) {
      this.modal.classList.add("visible");
    }
  }

  hideVictory() {
    if (this.modal) {
      this.modal.classList.remove("visible");
    }
  }
}

// ── 8. INITIALIZATION ──
document.addEventListener("DOMContentLoaded", () => {
  window.gameController = new GameController();
});
