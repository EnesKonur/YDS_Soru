// YDS Soru Filtreleme ve Pratik Uygulaması - Ana Mantık (app.js)

class YDSApp {
  constructor() {
    this.allQuestions = [];
    this.filteredQuestions = [];
    this.currentIndex = 0;
    this.userAnswers = this.loadUserAnswers();
    this.learningPool = this.loadLearningPool();
    this.favorites = this.loadFavorites();
    this.notes = this.loadNotes();
    this.soundEnabled = true;
    this.activeKeyword = "";
    this.timerInterval = null;
    this.timerSeconds = 0;
    this.timerRunning = false;

    // Flashcard state
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;

    // 80 Soruluk Yıl Denemesi Modu State
    this.isExamMode = false;
    this.currentExamYear = null;
    this.examTimerInterval = null;
    this.examTimerSeconds = 0;
    this.isExamTimerPaused = false;
    this.examSessions = this.loadExamSessions();

    // Kullanıcı Profili ve Görünüm Durumu
    this.userName = localStorage.getItem("yds_user_name") || "";
    this.soundEnabled = localStorage.getItem("yds_sound_enabled") !== "false";
    this.autoPauseEnabled = localStorage.getItem("yds_auto_pause") !== "false";
    this.tacticsUnlocked = localStorage.getItem("yds_tactics_unlocked") === "true";
    this.currentView = "home"; // 'home' | 'question' | 'report'
    this.isPracticeMode = false;

    // Audio Context
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.allQuestions = window.questionRepo ? window.questionRepo.getAll() : [];
    this.setupEventListeners();
    this.applyFilters();
    this.updateStats();
    this.updateHomeStats();
    this.updateLearningPoolBadge();
    this.populateFilterDropdowns();
    this.initDailyTip();

    // İlk açılış isim karşılama kontrolü
    if (!this.userName) {
      setTimeout(() => {
        this.openNameModal();
      }, 400);
    } else {
      const homeName = document.getElementById("homeUserNameText");
      if (homeName) homeName.textContent = this.userName;
      const settingsInput = document.getElementById("settingsNameInput");
      if (settingsInput) settingsInput.value = this.userName;
    }

    // Ayar anahtarlarını senkronize et
    const soundToggle = document.getElementById("settingsSoundToggle");
    if (soundToggle) soundToggle.checked = this.soundEnabled;
    const autoPauseToggle = document.getElementById("settingsAutoPauseToggle");
    if (autoPauseToggle) autoPauseToggle.checked = this.autoPauseEnabled;
  }

  // --- LocalStorage Yönetimi ---
  loadUserAnswers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USER_ANSWERS)) || {};
    } catch { return {}; }
  }

  saveUserAnswers() {
    localStorage.setItem(STORAGE_KEYS.USER_ANSWERS, JSON.stringify(this.userAnswers));
    this.updateStats();
  }

  loadExamSessions() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EXAM_SESSIONS)) || {};
    } catch { return {}; }
  }

  saveExamSessions() {
    localStorage.setItem(STORAGE_KEYS.EXAM_SESSIONS, JSON.stringify(this.examSessions));
  }

  loadLearningPool() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LEARNING_POOL)) || [];
    } catch { return []; }
  }

  saveLearningPool() {
    localStorage.setItem(STORAGE_KEYS.LEARNING_POOL, JSON.stringify(this.learningPool));
    this.updateLearningPoolBadge();
  }

  loadFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES)) || [];
    } catch { return []; }
  }

  saveFavorites() {
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(this.favorites));
  }

  loadNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTES)) || {};
    } catch { return {}; }
  }

  saveNotes() {
    localStorage.setItem(STORAGE_KEYS.NOTES, JSON.stringify(this.notes));
  }

  // --- Ses Efektleri (Web Audio API) ---
  getAudioContext() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  playCorrectSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.24); // G5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    } catch (e) { console.warn("Audio error:", e); }
  }

  playWrongSound() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(190, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    } catch (e) { console.warn("Audio error:", e); }
  }

  // --- Filtreleme Motoru ---
  applyFilters() {
    const kwInput = document.getElementById("keywordInput");
    const isFocused = (document.activeElement === kwInput);
    const selStart = (isFocused && kwInput) ? kwInput.selectionStart : null;
    const selEnd = (isFocused && kwInput) ? kwInput.selectionEnd : null;

    const keyword = (kwInput?.value || "").trim().toLowerCase();
    const category = document.getElementById("categoryFilter")?.value || "all";
    const year = document.getElementById("yearFilter")?.value || "all";
    const status = document.getElementById("statusFilter")?.value || "all";

    this.activeKeyword = keyword;

    this.filteredQuestions = this.allQuestions.filter(q => {
      // 1. Kelime Filtresi (Örn: "apple", "conduct", "although")
      if (keyword) {
        const inQuestion = (q.questionText || "").toLowerCase().includes(keyword);
        const inPassage = (q.passage || "").toLowerCase().includes(keyword);
        const inOptions = Object.values(q.options || {}).some(opt => opt.toLowerCase().includes(keyword));
        const inTags = (q.tags || []).some(t => t.toLowerCase().includes(keyword));
        const inAnalysis = q.wordAnalysis && Object.keys(q.wordAnalysis).some(w => w.toLowerCase().includes(keyword));

        if (!inQuestion && !inPassage && !inOptions && !inTags && !inAnalysis) {
          return false;
        }
      }

      // 2. Kategori Filtresi
      if (category !== "all" && q.category !== category) {
        return false;
      }

      // 3. Yıl Filtresi
      if (year !== "all" && String(q.year) !== String(year)) {
        return false;
      }

      // 4. Çözüm Durumu Filtresi
      const ans = this.userAnswers[q.id];
      const isFav = this.favorites.includes(q.id);

      if (status === "unsolved" && ans) return false;
      if (status === "correct" && (!ans || !ans.isCorrect)) return false;
      if (status === "wrong" && (!ans || ans.isCorrect)) return false;
      if (status === "favorites" && !isFav) return false;

      return true;
    });

    this.currentIndex = 0;
    this.renderQuestion();
    this.updateFilterStatusBadge();
    this.renderQuestionGrid();

    // İmleç konumunu koru (Android sanal klavyede başa atlama ve kelimeyi ters çevirme sorununu önler)
    if (isFocused && kwInput && document.activeElement === kwInput && selStart !== null) {
      try {
        kwInput.setSelectionRange(selStart, selEnd);
      } catch (_) {}
    }
  }

  updateFilterStatusBadge() {
    const badge = document.getElementById("filterInfoBanner");
    const countSpan = document.getElementById("filteredCount");
    const keywordSpan = document.getElementById("filterKeywordName");
    const clearBtn = document.getElementById("clearFilterBtn");

    if (!badge || !countSpan) return;

    countSpan.textContent = this.filteredQuestions.length;

    if (this.activeKeyword) {
      badge.classList.remove("hidden");
      if (keywordSpan) {
        keywordSpan.textContent = `"${this.activeKeyword}"`;
      }
      if (clearBtn) clearBtn.classList.remove("hidden");
    } else if (
      (document.getElementById("categoryFilter")?.value !== "all") ||
      (document.getElementById("yearFilter")?.value !== "all") ||
      (document.getElementById("statusFilter")?.value !== "all")
    ) {
      badge.classList.remove("hidden");
      if (keywordSpan) {
        keywordSpan.textContent = "Seçili Kriterler";
      }
      if (clearBtn) clearBtn.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
      if (clearBtn) clearBtn.classList.add("hidden");
    }
  }

  clearAllFilters() {
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const yrSelect = document.getElementById("yearFilter");
    const stSelect = document.getElementById("statusFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";
    if (stSelect) stSelect.value = "all";

    this.applyFilters();
  }

  // --- Soru Renderlama & İnteraktif Kelime Ayrıştırma ---
  renderQuestion() {
    const container = document.getElementById("questionContainer");
    const emptyState = document.getElementById("emptyStateContainer");

    if (this.filteredQuestions.length === 0) {
      if (container) container.classList.add("hidden");
      if (emptyState) emptyState.classList.remove("hidden");
      this.updateNavigationControls();
      return;
    }

    if (container) container.classList.remove("hidden");
    if (emptyState) emptyState.classList.add("hidden");

    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    // Soru Başlığı Bilgileri
    const examBadge = document.getElementById("qExamBadge");
    const categoryBadge = document.getElementById("qCategoryBadge");
    const subCategoryBadge = document.getElementById("qSubCategoryBadge");
    const difficultyBadge = document.getElementById("qDifficultyBadge");
    const qNumberDisplay = document.getElementById("qNumberDisplay");
    const favoriteBtn = document.getElementById("favoriteBtn");

    if (examBadge) examBadge.textContent = `${q.exam || "YDS"} - ${q.year || ""}`;
    if (categoryBadge) categoryBadge.textContent = q.category || "Genel";
    if (subCategoryBadge) subCategoryBadge.textContent = q.subCategory || "";
    if (difficultyBadge) difficultyBadge.textContent = q.difficulty || "Orta";
    if (qNumberDisplay) qNumberDisplay.textContent = `Soru ${this.currentIndex + 1} / ${this.filteredQuestions.length} (YDS No: ${q.questionNumber || this.currentIndex + 1})`;

    // Favori durumu
    const isFav = this.favorites.includes(q.id);
    if (favoriteBtn) {
      favoriteBtn.innerHTML = isFav 
        ? `<svg class="w-5 h-5 fill-amber-400 text-amber-500" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>`
        : `<svg class="w-5 h-5 text-gray-400 hover:text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>`;
    }

    // Paragraf varsa göster
    const passageContainer = document.getElementById("passageContainer");
    const passageTextEl = document.getElementById("passageText");
    if (q.passage && q.passage.trim().length > 0) {
      passageContainer.classList.remove("hidden");
      passageTextEl.innerHTML = this.tokenizeInteractiveText(q.passage);
    } else {
      passageContainer.classList.add("hidden");
    }

    // ÖSYM Resmi Soru Yönergesi
    const directiveEl = document.getElementById("questionDirectiveText");
    if (directiveEl) {
      directiveEl.textContent = this.getQuestionDirective(q);
    }

    // Soru Metnini İnteraktif Hale Getir
    const questionTextEl = document.getElementById("questionText");
    if (questionTextEl) {
      questionTextEl.innerHTML = this.tokenizeInteractiveText(q.questionText);
    }

    // Şıkları Renderla
    const optionsContainer = document.getElementById("optionsContainer");
    if (optionsContainer) {
      optionsContainer.innerHTML = "";
      const existingAnswer = this.userAnswers[q.id];

      const optKeys = ["A", "B", "C", "D", "E"];
      optKeys.forEach(key => {
        const optText = q.options ? q.options[key] : null;
        if (!optText) return;

        const optBtn = document.createElement("button");
        optBtn.className = "option-btn w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-left flex items-start space-x-3 group relative shadow-sm";
        optBtn.dataset.option = key;

        let statusClass = "";
        let badgeHtml = "";

        if (existingAnswer) {
          optBtn.disabled = true;
          if (key === q.correctAnswer) {
            statusClass = "option-correct";
            badgeHtml = `<span class="ml-auto text-emerald-600 dark:text-emerald-400 font-bold flex items-center text-sm"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> Doğru Cevap</span>`;
          } else if (key === existingAnswer.selected && !existingAnswer.isCorrect) {
            statusClass = "option-wrong";
            badgeHtml = `<span class="ml-auto text-rose-600 dark:text-rose-400 font-bold flex items-center text-sm"><svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg> Yanlış</span>`;
          }
        }

        if (statusClass) {
          optBtn.className += ` ${statusClass}`;
        }

        const interactiveOptText = this.tokenizeInteractiveText(optText);

        optBtn.innerHTML = `
          <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            ${key}
          </span>
          <div class="flex-1 pt-0.5 text-gray-800 dark:text-gray-100 leading-relaxed font-medium break-words min-w-0">
            ${interactiveOptText}
          </div>
          ${badgeHtml}
        `;

        optBtn.addEventListener("click", (e) => {
          // Eğer tıklanan eleman interaktif kelime ise şıkkı işaretleme, kelimeyi aç
          if (e.target.classList.contains("interactive-word")) return;
          this.handleOptionSelect(key);
        });

        optionsContainer.appendChild(optBtn);
      });
    }

    // Açıklama / Çözüm Kartı
    this.renderExplanationSection(q);

    // Navigasyon butonlarını güncelle
    this.updateNavigationControls();
  }

  // ÖSYM Resmi Soru Yönergesi Üretici
  getQuestionDirective(q) {
    if (!q) return "Verilen soruyu en uygun seçeneği belirleyerek cevaplayınız.";
    const num = q.questionNumber || 0;
    const cat = (q.category || "").toLowerCase();

    if (cat.includes("kelime") || (num >= 1 && num <= 6)) {
      return "1 - 6. sorularda, cümlede boş bırakılan yere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("dilbilgisi") || (num >= 7 && num <= 16)) {
      return "7 - 16. sorularda, cümlede boş bırakılan yere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("cloze") || (num >= 17 && num <= 26)) {
      return "17 - 26. sorularda, aşağıdaki parçada numaralanmış yerlere uygun düşen sözcük veya ifadeyi bulunuz.";
    }
    if (cat.includes("cümle tamamlama") || (num >= 27 && num <= 36)) {
      return "27 - 36. sorularda, verilen cümleyi uygun şekilde tamamlayan ifadeyi bulunuz.";
    }
    if ((q.subCategory && q.subCategory.includes("İngilizce -> Türkçe")) || (num >= 37 && num <= 39)) {
      return "37 - 39. sorularda, verilen İngilizce cümlenin Türkçe dengini bulunuz.";
    }
    if ((q.subCategory && q.subCategory.includes("Türkçe -> İngilizce")) || (num >= 40 && num <= 42)) {
      return "40 - 42. sorularda, verilen Türkçe cümlenin İngilizce dengini bulunuz.";
    }
    if (cat.includes("anlamca en yakın") || (num >= 68 && num <= 71)) {
      return "68 - 71. sorularda, verilen cümleye anlamca en yakın ifadeyi bulunuz (Restatement).";
    }
    if (cat.includes("okuma") || cat.includes("parça") || (num >= 43 && num <= 62)) {
      return "43 - 62. sorularda, verilen parçaya göre soruları cevaplayınız.";
    }
    if (cat.includes("diyalog") || (num >= 63 && num <= 67)) {
      return "63 - 67. sorularda, karşılıklı konuşmanın boş bırakılan kısmını tamamlayabilecek ifadeyi bulunuz.";
    }
    if (cat.includes("paragraf tamamlama") || (num >= 72 && num <= 75)) {
      return "72 - 75. sorularda, parçada boş bırakılan yere anlam bütünlüğünü sağlamak için getirilebilecek cümleyi bulunuz.";
    }
    if (cat.includes("anlatım") || cat.includes("akışı bozan") || (num >= 76 && num <= 80)) {
      return "76 - 80. sorularda, cümleler sırasıyla okunduğunda parçanın anlam bütünlüğünü bozan cümleyi bulunuz.";
    }
    return "Verilen soruyu en uygun seçeneği belirleyerek cevaplayınız.";
  }

  // Metni interaktif kelimelere bölme ve arama kelimesini vurgulama
  tokenizeInteractiveText(rawText) {
    if (!rawText) return "";

    const kw = this.activeKeyword;

    // Boşluklar ve kelimeleri yakala
    return rawText.split(/(\s+)/).map(part => {
      if (/^\s+$/.test(part)) return part; // Boşlukları olduğu gibi bırak

      // Kelimenin başındaki ve sonundaki noktalama işaretlerini ayıkla
      const match = part.match(/^([.,/#!$%^&*;:{}=\-_`~()?"'“”—]*)(.*?)([.,/#!$%^&*;:{}=\-_`~()?"'“”—]*)$/);
      if (!match) return part;

      const leading = match[1];
      const coreWord = match[2];
      const trailing = match[3];

      if (!coreWord) return part;

      const cleanForLookup = coreWord.toLowerCase();
      const isSearchMatch = kw && cleanForLookup.includes(kw);

      const highlightClass = isSearchMatch ? "search-highlight" : "";

      return `${leading}<span class="interactive-word ${highlightClass}" data-word="${encodeURIComponent(cleanForLookup)}">${coreWord}</span>${trailing}`;
    }).join("");
  }

  // Şık Seçimi ve Anında Değerlendirme
  handleOptionSelect(selectedOption) {
    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    if (this.userAnswers[q.id]) {
      return; // Zaten çözülmüş
    }

    // 80 SORULUK DENEME MODU: Kullanıcı şıkkı işaretlediği AN süreyi OTOMATİK DURDUR!
    // Böylece çözümü, çeviriyi ve taktiği incelerken sınav süresi haksız yere akmaz.
    if (this.isExamMode && this.autoPauseEnabled) {
      this.pauseExamSmartTimer();
    }

    const isCorrect = selectedOption === q.correctAnswer;

    this.userAnswers[q.id] = {
      selected: selectedOption,
      isCorrect: isCorrect,
      timestamp: Date.now()
    };

    this.saveUserAnswers();
    this.updateHomeStats();

    // Ses çal
    if (isCorrect) {
      this.playCorrectSound();
    } else {
      this.playWrongSound();
    }

    // Sayfayı yeniden renderla (renkler, çözüm yöntemi ve açıklama açılacak)
    this.renderQuestion();
    this.renderQuestionGrid();

    // Normal serbest soru çözme modunda periyodik geçiş reklamı kontrolü (her 20 soruda bir)
    if (!this.isExamMode) {
      window.ydsAdService?.onQuestionAnswered();
    }

    // Sınav modundaysa ilerleme rozetini güncelle
    if (this.isExamMode) {
      this.updateExamProgressBanner();

      // Eğer 80 sorunun tamamı cevaplandıysa otomatik olarak tebrik et ve karnesini göster
      const allAnswered = this.filteredQuestions.every(item => this.userAnswers[item.id]);
      if (allAnswered) {
        setTimeout(() => {
          this.showExamScorecard();
        }, 1200);
      }
    }
  }

  // Çözüm ve Türkçe Açıklama Kartı
  renderExplanationSection(q) {
    const section = document.getElementById("explanationSection");
    if (!section) return;

    const answer = this.userAnswers[q.id];
    if (!answer) {
      section.classList.add("hidden");
      return;
    }

    section.classList.remove("hidden");

    // Akıllı Süre Duraklatıldı Bildirimi
    const timerNotice = document.getElementById("explanationTimerNotice");
    if (timerNotice) {
      if (this.isExamMode) {
        timerNotice.classList.remove("hidden");
      } else {
        timerNotice.classList.add("hidden");
      }
    }

    // 🎯 Özel Çözüm Yöntemi & YDS Soru Taktiği Kartı
    const solutionCard = document.getElementById("solutionMethodCard");
    const solutionContent = document.getElementById("solutionMethodContent");
    if (solutionCard && solutionContent) {
      if (q.solutionMethod && q.solutionMethod.trim().length > 0) {
        solutionCard.classList.remove("hidden");
        solutionContent.innerHTML = q.solutionMethod.replace(/\n/g, "<br>");
      } else {
        solutionCard.classList.add("hidden");
      }
    }

    const feedbackBanner = document.getElementById("answerFeedbackBanner");
    if (feedbackBanner) {
      if (answer.isCorrect) {
        feedbackBanner.className = "p-4 rounded-xl mb-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 flex items-center space-x-3";
        feedbackBanner.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0 text-emerald-600 dark:text-emerald-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-base">Tebrikler! Doğru Cevap: (${q.correctAnswer})</h4>
            <p class="text-sm opacity-90">Soruyu başarıyla çözdünüz. Aşağıdaki özel taktiği ve açıklamayı inceleyebilirsiniz.</p>
          </div>
        `;
      } else {
        feedbackBanner.className = "p-4 rounded-xl mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 flex items-center space-x-3";
        feedbackBanner.innerHTML = `
          <div class="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center flex-shrink-0 text-rose-600 dark:text-rose-400">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </div>
          <div>
            <h4 class="font-bold text-base">Yanlış Cevap! İşaretlediğiniz: (${answer.selected}) | Doğru Seçenek: (${q.correctAnswer})</h4>
            <p class="text-sm opacity-90">Aşağıdaki çözüm yöntemini inceleyerek doğru cevabın mantığını öğrenebilirsiniz.</p>
          </div>
        `;
      }
    }

    const explanationContent = document.getElementById("explanationContent");
    if (explanationContent) {
      explanationContent.innerHTML = (q.explanation || "Açıklama bulunmuyor.").replace(/\n/g, "<br>");
    }

    // Sorudaki Önemli Kelimeler Tablosu / Listesi
    const keyWordsContainer = document.getElementById("keyWordsContainer");
    if (keyWordsContainer) {
      keyWordsContainer.innerHTML = "";

      if (q.wordAnalysis && Object.keys(q.wordAnalysis).length > 0) {
        document.getElementById("keyWordsCard")?.classList.remove("hidden");

        Object.entries(q.wordAnalysis).forEach(([word, meaning]) => {
          const isSaved = this.learningPool.some(item => item.word.toLowerCase() === word.toLowerCase());
          const badge = document.createElement("div");
          badge.className = "flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-sm";
          badge.innerHTML = `
            <div>
              <span class="font-bold text-indigo-600 dark:text-indigo-400 cursor-pointer hover:underline" onclick="ydsApp.openWordModal('${word}')">${word}</span>
              <span class="text-gray-600 dark:text-gray-300 ml-2">: ${meaning}</span>
            </div>
            <button class="add-to-pool-btn p-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 ${isSaved ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 hover:bg-indigo-100'}">
              ${isSaved ? '<span>✓ Havuzda</span>' : '<span>+ Havuza Ekle</span>'}
            </button>
          `;

          badge.querySelector(".add-to-pool-btn")?.addEventListener("click", () => {
            this.toggleLearningPool(word, meaning, q.questionText);
            this.renderExplanationSection(q);
          });

          keyWordsContainer.appendChild(badge);
        });
      } else {
        document.getElementById("keyWordsCard")?.classList.add("hidden");
      }
    }
  }

  // --- Kelimeye Tıklayınca Açılan Sözlük Penceresi ---
  async openWordModal(word) {
    if (!word) return;

    const modal = document.getElementById("wordInspectorModal");
    const titleEl = document.getElementById("modalWordTitle");
    const typeEl = document.getElementById("modalWordType");
    const meaningEl = document.getElementById("modalWordMeaning");
    const sampleEl = document.getElementById("modalWordSample");
    const addPoolBtn = document.getElementById("modalAddPoolBtn");
    const filterByWordBtn = document.getElementById("modalFilterByWordBtn");

    if (!modal) return;

    modal.classList.remove("hidden");
    titleEl.textContent = word;
    typeEl.textContent = "yükleniyor...";
    meaningEl.textContent = "Anlam aranıyor...";
    sampleEl.textContent = "";

    // Sözlükten ara
    const result = await window.ydsDictionary.lookup(word);

    if (result) {
      titleEl.textContent = result.word || word;
      typeEl.textContent = result.type ? `(${result.type})` : "";
      meaningEl.textContent = result.tr || "Türkçe anlamı bulunamadı.";
      sampleEl.textContent = result.sample ? `Örnek: "${result.sample}"` : "";

      // Havuzda var mı?
      const isSaved = this.learningPool.some(item => item.word.toLowerCase() === word.toLowerCase());
      this.updateModalAddBtn(isSaved);

      addPoolBtn.onclick = () => {
        const isNowSaved = this.toggleLearningPool(word, result.tr, result.sample || "");
        this.updateModalAddBtn(isNowSaved);
      };

      // Bu kelimeye göre filtrele butonu
      filterByWordBtn.onclick = () => {
        modal.classList.add("hidden");
        const kwInput = document.getElementById("keywordInput");
        const clearBtn = document.getElementById("clearKeywordBtn");
        if (kwInput) {
          kwInput.value = word;
          if (clearBtn) clearBtn.classList.remove("hidden");
        }
        this.applyFilters();
      };
    }
  }

  updateModalAddBtn(isSaved) {
    const btn = document.getElementById("modalAddPoolBtn");
    if (!btn) return;
    if (isSaved) {
      btn.className = "w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-emerald-600 text-white hover:bg-emerald-700 transition";
      btn.innerHTML = `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg> <span>Öğrenme Havuzunda Ekli (Kaldır)</span>`;
    } else {
      btn.className = "w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 bg-indigo-600 text-white hover:bg-indigo-700 transition";
      btn.innerHTML = `<span>⭐️ Öğrenme Havuzuma Ekle</span>`;
    }
  }

  closeWordModal() {
    document.getElementById("wordInspectorModal")?.classList.add("hidden");
  }

  // Kelimeyi telaffuz et (Web Speech API)
  speakWord(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  }

  // --- Öğrenme Havuzu (Vocabulary Learning Pool & Flashcards) ---
  toggleLearningPool(word, meaning, sample) {
    const cleanWord = word.trim().toLowerCase();
    const index = this.learningPool.findIndex(item => item.word.toLowerCase() === cleanWord);

    let isSaved = false;
    if (index >= 0) {
      this.learningPool.splice(index, 1);
      isSaved = false;
    } else {
      this.learningPool.push({
        id: "v-" + Date.now(),
        word: word.trim(),
        meaning: meaning || "YDS Kelimesi",
        sample: sample || "",
        dateAdded: new Date().toLocaleDateString("tr-TR"),
        mastered: false
      });
      isSaved = true;
    }

    this.saveLearningPool();
    return isSaved;
  }

  updateLearningPoolBadge() {
    const badge = document.getElementById("learningPoolCountBadge");
    if (badge) {
      badge.textContent = this.learningPool.length;
    }
  }

  openLearningPoolModal() {
    const modal = document.getElementById("learningPoolModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    this.renderLearningPoolList();
  }

  closeLearningPoolModal() {
    document.getElementById("learningPoolModal")?.classList.add("hidden");
  }

  renderLearningPoolList() {
    const listContainer = document.getElementById("learningPoolList");
    const countEl = document.getElementById("poolTotalWords");
    if (!listContainer) return;

    if (countEl) countEl.textContent = this.learningPool.length;

    if (this.learningPool.length === 0) {
      listContainer.innerHTML = `
        <div class="text-center py-12 text-gray-500 dark:text-gray-400">
          <p class="text-lg font-medium">Öğrenme havuzunuzda henüz kelime bulunmuyor.</p>
          <p class="text-sm mt-1">Sorulardaki kelimelerin üzerine tıklayarak veya açıklamalar kısmından tek tıkla havuza ekleyebilirsiniz.</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = "";
    this.learningPool.forEach(item => {
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between";
      card.innerHTML = `
        <div>
          <div class="flex items-center space-x-2">
            <span class="font-bold text-lg text-indigo-600 dark:text-indigo-400">${item.word}</span>
            <button class="text-gray-400 hover:text-indigo-600" onclick="ydsApp.speakWord('${item.word}')">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
            </button>
            ${item.mastered ? '<span class="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">Öğrenildi</span>' : ''}
          </div>
          <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">${item.meaning}</p>
          ${item.sample ? `<p class="text-xs text-gray-500 italic mt-1 font-serif">"${item.sample}"</p>` : ''}
        </div>
        <div class="flex items-center space-x-2">
          <button class="text-gray-400 hover:text-rose-500 p-2" onclick="ydsApp.removeFromPool('${item.id}')" title="Kelimeden Kaldır">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      `;
      listContainer.appendChild(card);
    });
  }

  removeFromPool(id) {
    this.learningPool = this.learningPool.filter(i => i.id !== id);
    this.saveLearningPool();
    this.renderLearningPoolList();
  }

  // Flashcard Modu
  openFlashcardsModal() {
    if (this.learningPool.length === 0) {
      alert("Flaş kart çalışması için önce sorulardan birkaç kelimeyi öğrenme havuzuna eklemelisiniz.");
      return;
    }
    const modal = document.getElementById("flashcardModal");
    if (!modal) return;
    modal.classList.remove("hidden");
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;
    this.renderFlashcard();
  }

  closeFlashcardsModal() {
    document.getElementById("flashcardModal")?.classList.add("hidden");
  }

  renderFlashcard() {
    const card = this.learningPool[this.flashcardIndex];
    if (!card) return;

    const inner = document.getElementById("flashcardInner");
    const frontWord = document.getElementById("flashcardFrontWord");
    const frontSample = document.getElementById("flashcardFrontSample");
    const backMeaning = document.getElementById("flashcardBackMeaning");
    const progressEl = document.getElementById("flashcardProgress");

    if (inner) inner.classList.remove("flipped");
    this.flashcardFlipped = false;

    if (frontWord) frontWord.textContent = card.word;
    if (frontSample) frontSample.textContent = card.sample ? `"${card.sample}"` : "Örnek cümle bulunmuyor.";
    if (backMeaning) backMeaning.textContent = card.meaning;
    if (progressEl) progressEl.textContent = `${this.flashcardIndex + 1} / ${this.learningPool.length}`;
  }

  flipFlashcard() {
    const inner = document.getElementById("flashcardInner");
    this.flashcardFlipped = !this.flashcardFlipped;
    if (inner) {
      inner.classList.toggle("flipped", this.flashcardFlipped);
    }
  }

  nextFlashcard(markAsMastered = false) {
    if (markAsMastered && this.learningPool[this.flashcardIndex]) {
      this.learningPool[this.flashcardIndex].mastered = true;
      this.saveLearningPool();
    }
    this.flashcardIndex = (this.flashcardIndex + 1) % this.learningPool.length;
    this.renderFlashcard();
  }

  prevFlashcard() {
    this.flashcardIndex = (this.flashcardIndex - 1 + this.learningPool.length) % this.learningPool.length;
    this.renderFlashcard();
  }

  exportLearningPool(format = "csv") {
    if (this.learningPool.length === 0) {
      alert("Dışa aktarılacak kelime bulunmuyor.");
      return;
    }

    let dataStr = "";
    let fileName = `yds_ogrenme_havuzu_${Date.now()}`;

    if (format === "csv") {
      dataStr = "Kelime,Türkçe Anlamı,Örnek Cümle,Eklenme Tarihi\n" + 
        this.learningPool.map(i => `"${i.word}","${i.meaning}","${i.sample || ''}","${i.dateAdded}"`).join("\n");
      fileName += ".csv";
    } else {
      dataStr = JSON.stringify(this.learningPool, null, 2);
      fileName += ".json";
    }

    const blob = new Blob([dataStr], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Favori Soruları Yönetme ---
  toggleFavorite() {
    const q = this.filteredQuestions[this.currentIndex];
    if (!q) return;

    const idx = this.favorites.indexOf(q.id);
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push(q.id);
    }
    this.saveFavorites();
    this.renderQuestion();
    this.renderQuestionGrid();
  }

  // --- Soru Navigasyonu ---
  nextQuestion() {
    if (this.currentIndex < this.filteredQuestions.length - 1) {
      this.currentIndex++;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevQuestion() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  jumpToQuestion(idx) {
    if (idx >= 0 && idx < this.filteredQuestions.length) {
      this.currentIndex = idx;
      this.onQuestionChanged();
      this.renderQuestion();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onQuestionChanged() {
    if (!this.isExamMode) return;
    this.updateExamProgressBanner();

    const currentQ = this.filteredQuestions[this.currentIndex];
    if (!currentQ) return;

    // Eğer geçilen soru henüz cevaplanmamışsa: Akıllı süreyi otomatik olarak DEVAM ETTİR!
    // Eğer soru önceden cevaplanmışsa: Çözüm incelendiği için süreyi duraklatılmış tut!
    if (!this.userAnswers[currentQ.id]) {
      this.resumeExamSmartTimer();
    } else {
      if (this.autoPauseEnabled) {
        this.pauseExamSmartTimer();
      }
    }
  }

  updateNavigationControls() {
    const prevBtn = document.getElementById("prevQuestionBtn");
    const nextBtn = document.getElementById("nextQuestionBtn");
    const countIndicator = document.getElementById("navQuestionIndicator");

    if (prevBtn) prevBtn.disabled = this.currentIndex <= 0;
    if (nextBtn) nextBtn.disabled = this.currentIndex >= this.filteredQuestions.length - 1;
    if (countIndicator) {
      countIndicator.textContent = this.filteredQuestions.length > 0
        ? `${this.currentIndex + 1} / ${this.filteredQuestions.length}`
        : "0 / 0";
    }
  }

  // Hızlı Soru Izgarası (Question Number Grid)
  renderQuestionGrid() {
    const grid = document.getElementById("questionNumberGrid");
    if (!grid) return;

    grid.innerHTML = "";
    this.filteredQuestions.forEach((q, idx) => {
      const btn = document.createElement("button");
      const ans = this.userAnswers[q.id];
      const isFav = this.favorites.includes(q.id);
      const isCurrent = idx === this.currentIndex;

      let bgClass = "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200";
      if (ans) {
        bgClass = ans.isCorrect
          ? "bg-emerald-500 text-white font-bold"
          : "bg-rose-500 text-white font-bold";
      }

      let borderClass = isCurrent ? "ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-gray-900" : "";

      btn.className = `w-8 h-8 rounded-lg text-xs font-semibold flex items-center justify-center transition ${bgClass} ${borderClass} relative`;
      btn.textContent = idx + 1;
      btn.title = `Soru ${idx + 1} (${q.category})`;

      if (isFav) {
        const star = document.createElement("span");
        star.className = "absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full";
        btn.appendChild(star);
      }

      btn.addEventListener("click", () => this.jumpToQuestion(idx));
      grid.appendChild(btn);
    });
  }

  // --- İstatistikler ---
  updateStats() {
    const totalQuestions = this.allQuestions.length;
    const answeredEntries = Object.values(this.userAnswers);
    const totalAnswered = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a.isCorrect).length;
    const totalWrong = totalAnswered - totalCorrect;
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

    const statTotalEl = document.getElementById("statTotalQuestions");
    const statAnsweredEl = document.getElementById("statAnswered");
    const statCorrectEl = document.getElementById("statCorrect");
    const statWrongEl = document.getElementById("statWrong");
    const statAccuracyEl = document.getElementById("statAccuracy");
    const statProgressBar = document.getElementById("statProgressBar");

    if (statTotalEl) statTotalEl.textContent = totalQuestions;
    if (statAnsweredEl) statAnsweredEl.textContent = totalAnswered;
    if (statCorrectEl) statCorrectEl.textContent = totalCorrect;
    if (statWrongEl) statWrongEl.textContent = totalWrong;
    if (statAccuracyEl) statAccuracyEl.textContent = `%${accuracy}`;
    if (statProgressBar) statProgressBar.style.width = `${accuracy}%`;

    this.updateHomeStats();
  }

  // --- Sınav Süre Sayacı ---
  toggleTimer() {
    const timerBtn = document.getElementById("timerToggleBtn");
    const display = document.getElementById("timerDisplay");

    if (this.timerRunning) {
      clearInterval(this.timerInterval);
      this.timerRunning = false;
      if (timerBtn) timerBtn.textContent = "Başlat";
    } else {
      this.timerRunning = true;
      if (timerBtn) timerBtn.textContent = "Durdur";
      this.timerInterval = setInterval(() => {
        this.timerSeconds++;
        const mins = String(Math.floor(this.timerSeconds / 60)).padStart(2, "0");
        const secs = String(this.timerSeconds % 60).padStart(2, "0");
        if (display) display.textContent = `${mins}:${secs}`;
      }, 1000);
    }
  }

  resetTimer() {
    clearInterval(this.timerInterval);
    this.timerRunning = false;
    this.timerSeconds = 0;
    const timerBtn = document.getElementById("timerToggleBtn");
    const display = document.getElementById("timerDisplay");
    if (timerBtn) timerBtn.textContent = "Başlat";
    if (display) display.textContent = "00:00";
  }

  // ============================================================
  // --- 80 SORULUK YIL DENEMESİ & AKILLI SÜRE MOTORU (EXAM ENGINE) ---
  // ============================================================

  startExamSmartTimer() {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
    }
    this.isExamTimerPaused = false;
    this.updateExamSmartTimerUI();

    this.examTimerInterval = setInterval(() => {
      if (!this.isExamTimerPaused) {
        this.examTimerSeconds++;
        this.updateExamSmartTimerUI();
      }
    }, 1000);
  }

  pauseExamSmartTimer() {
    this.isExamTimerPaused = true;
    this.updateExamSmartTimerUI();
  }

  resumeExamSmartTimer() {
    this.isExamTimerPaused = false;
    if (!this.examTimerInterval) {
      this.startExamSmartTimer();
    } else {
      this.updateExamSmartTimerUI();
    }
  }

  stopExamSmartTimer() {
    if (this.examTimerInterval) {
      clearInterval(this.examTimerInterval);
      this.examTimerInterval = null;
    }
  }

  updateExamSmartTimerUI() {
    const display = document.getElementById("examSmartTimerDisplay");
    const badge = document.getElementById("examSmartTimerBadge");
    const dot = document.getElementById("examSmartTimerDot");
    const statusText = document.getElementById("examSmartTimerStatusText");

    const hours = Math.floor(this.examTimerSeconds / 3600);
    const mins = Math.floor((this.examTimerSeconds % 3600) / 60);
    const secs = this.examTimerSeconds % 60;

    const timeStr = hours > 0
      ? `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
      : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

    if (display) display.textContent = timeStr;

    if (badge && statusText && dot) {
      if (this.isExamTimerPaused) {
        badge.className = "flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/40";
        dot.className = "w-2 h-2 rounded-full bg-amber-400";
        statusText.textContent = "⏸️ Süre Duraklatıldı (Çözüm İnceleniyor)";
      } else {
        badge.className = "flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30";
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        statusText.textContent = "🟢 Süre İşliyor";
      }
    }
  }

  formatDuration(totalSecs) {
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;

    if (hours > 0) {
      return `${hours} sa ${mins} dk ${secs} sn`;
    }
    return `${mins} dk ${secs} sn`;
  }

  // --- Yıl Denemesi Modalı ve Seçimi ---
  openYearExamModal() {
    const modal = document.getElementById("yearExamModal");
    if (!modal) return;
    this.renderYearExamCards();
    modal.classList.remove("hidden");
  }

  closeYearExamModal() {
    document.getElementById("yearExamModal")?.classList.add("hidden");
  }

  renderYearExamCards() {
    const grid = document.getElementById("yearExamCardsGrid");
    if (!grid) return;

    const availableYears = [2024, 2023, 2022, 2021, 2020, 2019, 2018];
    grid.innerHTML = "";

    availableYears.forEach(year => {
      const yearQuestions = window.questionRepo.getByYear(year);
      const totalQ = yearQuestions.length || 80;
      
      const answeredInYear = yearQuestions.filter(q => this.userAnswers[q.id]);
      const lastSession = this.examSessions[year];

      const card = document.createElement("div");
      card.className = "p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group";

      let statusBadge = "";
      if (lastSession) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Puan: ${lastSession.score}</span>`;
      } else if (answeredInYear.length > 0) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">${answeredInYear.length}/${totalQ} Çözüldü</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Henüz Çözülmedi</span>`;
      }

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg">${year} YDS</span>
            ${statusBadge}
          </div>
          <h4 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            ${year} YDS Tam Deneme Sınavı
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${totalQ} Soru • Standart ÖSYM Soru Tipleri (Kelime, Dilbilgisi, Cloze, Paragraf, Diyalog)
          </p>
        </div>

        <div class="pt-2 border-t border-gray-100 dark:border-gray-700/80 flex items-center justify-between gap-2">
          <div class="text-[11px] text-gray-400 flex items-center space-x-1">
            <svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
            <span>Akıllı Süre Sayacı</span>
          </div>

          <button class="start-year-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 active:scale-95">
            Sınavı Başlat →
          </button>
        </div>
      `;

      card.querySelector(".start-year-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.startExamMode(year);
      });

      grid.appendChild(card);
    });
  }

  startExamMode(year) {
    this.isPracticeMode = false;
    this.isExamMode = true;
    this.currentExamYear = parseInt(year);

    // Filtreleri hazırla
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const stSelect = document.getElementById("statusFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (yrSelect) yrSelect.value = year.toString();

    // Sadece bu yılın sorularını al
    const examQuestions = window.questionRepo.getByYear(year);
    if (!examQuestions || examQuestions.length === 0) {
      alert(`${year} yılı için soru bulunamadı.`);
      return;
    }

    this.filteredQuestions = examQuestions;
    this.currentIndex = 0;
    this.examTimerSeconds = 0;

    // Soru çözüm ekranını göster
    this.showQuestionView("exam");

    // Üst bannerı göster
    const banner = document.getElementById("examModeBanner");
    const titleEl = document.getElementById("activeExamTitle");
    if (banner) banner.classList.remove("hidden");
    if (titleEl) titleEl.textContent = `${year} YDS Tam Deneme Sınavı`;

    this.updateExamProgressBanner();

    // Akıllı süreyi başlat (ilk soru cevaplanmamışsa süre akar, çözülmüşse duraklatılır)
    const firstQ = this.filteredQuestions[0];
    if (firstQ && this.userAnswers[firstQ.id]) {
      this.pauseExamSmartTimer();
    } else {
      this.resumeExamSmartTimer();
    }

    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exitExamMode() {
    if (this.isExamMode) {
      const confirmExit = confirm("Deneme sınavından çıkmak istediğinize emin misiniz? Verdiğiniz cevaplar kaydedilecek ve ana menüye döneceksiniz.");
      if (!confirmExit) return;
    }

    this.stopExamSmartTimer();
    this.isExamMode = false;
    this.currentExamYear = null;

    document.getElementById("examModeBanner")?.classList.add("hidden");
    const yrSelect = document.getElementById("yearFilter");
    if (yrSelect) yrSelect.value = "all";
    this.applyFilters();
    this.showHomeView();
  }

  updateExamProgressBanner() {
    const badge = document.getElementById("activeExamProgressBadge");
    if (badge && this.isExamMode) {
      badge.textContent = `Soru ${this.currentIndex + 1} / ${this.filteredQuestions.length}`;
    }
  }

  // --- Sınav Karnesi & Sonuç Raporu ---
  showExamScorecard() {
    // Sınav süresini duraklat
    this.pauseExamSmartTimer();

    const year = this.currentExamYear || (this.filteredQuestions[0]?.year) || 2024;
    const questions = this.isExamMode ? this.filteredQuestions : window.questionRepo.getByYear(year);
    const totalQuestions = questions.length || 80;

    const answeredList = questions.map(q => this.userAnswers[q.id]).filter(Boolean);
    const totalAnswered = answeredList.length;
    const correctCount = answeredList.filter(a => a.isCorrect).length;
    const wrongCount = answeredList.filter(a => !a.isCorrect).length;
    const blankCount = totalQuestions - totalAnswered;

    // Resmi ÖSYM YDS Puanı: Doğru Sayısı x 1.25 (100 üzerinden)
    const ydsScore = Math.round(correctCount * 1.25 * 100) / 100;

    // Resmi YDS Seviyesi
    let levelText = "E Seviyesi (50-59)";
    let levelColor = "bg-amber-600";
    if (ydsScore >= 90) {
      levelText = "A Seviyesi (90-100) - Mükemmel";
      levelColor = "bg-emerald-600";
    } else if (ydsScore >= 80) {
      levelText = "B Seviyesi (80-89) - Çok Başarılı";
      levelColor = "bg-blue-600";
    } else if (ydsScore >= 70) {
      levelText = "C Seviyesi (70-79) - Başarılı";
      levelColor = "bg-indigo-600";
    } else if (ydsScore >= 60) {
      levelText = "D Seviyesi (60-69) - Orta Seviye";
      levelColor = "bg-yellow-600";
    } else if (ydsScore < 50) {
      levelText = "Geliştirilmeli (<50 Puan)";
      levelColor = "bg-rose-600";
    }

    // Skor Karnesi Elemanlarını Doldur
    const nameEl = document.getElementById("scorecardExamName");
    const pointsEl = document.getElementById("scorecardPoints");
    const levelBadge = document.getElementById("scorecardLevelBadge");
    const percentBadge = document.getElementById("scorecardPercentBadge");
    const correctEl = document.getElementById("scorecardCorrect");
    const wrongEl = document.getElementById("scorecardWrong");
    const blankEl = document.getElementById("scorecardBlank");
    const netTimeEl = document.getElementById("scorecardNetTime");
    const avgTimeEl = document.getElementById("scorecardAvgPerQuestion");

    if (nameEl) nameEl.textContent = `${year} YDS Deneme Sınavı`;
    if (pointsEl) pointsEl.textContent = ydsScore.toFixed(2);
    
    if (levelBadge) {
      levelBadge.textContent = levelText;
      levelBadge.className = `px-3.5 py-1 rounded-full text-xs sm:text-sm font-extrabold text-white shadow-xs ${levelColor}`;
    }

    if (percentBadge) {
      const accuracy = totalAnswered > 0 ? Math.round((correctCount / totalAnswered) * 100) : 0;
      percentBadge.textContent = `%${accuracy} Başarı Oranı`;
    }

    if (correctEl) correctEl.textContent = correctCount;
    if (wrongEl) wrongEl.textContent = wrongCount;
    if (blankEl) blankEl.textContent = blankCount;

    // Net Süre (Açıklama incelemeleri çıkarılmış)
    const netTimeStr = this.formatDuration(this.examTimerSeconds);
    if (netTimeEl) netTimeEl.textContent = netTimeStr;

    const avgSeconds = totalAnswered > 0 ? Math.round(this.examTimerSeconds / totalAnswered) : 0;
    if (avgTimeEl) avgTimeEl.textContent = `${avgSeconds} sn / soru`;

    // Soru Tipi Bazlı Başarı Analizi
    const catContainer = document.getElementById("scorecardCategoryList");
    if (catContainer) {
      catContainer.innerHTML = "";
      const catMap = {};
      questions.forEach(q => {
        const cat = q.category || "Genel";
        if (!catMap[cat]) catMap[cat] = { total: 0, correct: 0 };
        catMap[cat].total++;
        if (this.userAnswers[q.id]?.isCorrect) {
          catMap[cat].correct++;
        }
      });

      Object.entries(catMap).forEach(([catName, data]) => {
        const pct = Math.round((data.correct / data.total) * 100);
        const row = document.createElement("div");
        row.className = "space-y-1";
        row.innerHTML = `
          <div class="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300">
            <span>${catName}</span>
            <span>${data.correct} / ${data.total} (%${pct})</span>
          </div>
          <div class="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div class="h-full ${pct >= 70 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'} transition-all duration-300" style="width: ${pct}%"></div>
          </div>
        `;
        catContainer.appendChild(row);
      });
    }

    // Oturumu kaydet
    this.examSessions[year] = {
      year: year,
      score: ydsScore,
      correct: correctCount,
      wrong: wrongCount,
      blank: blankCount,
      netSeconds: this.examTimerSeconds,
      timestamp: Date.now()
    };
    this.saveExamSessions();

    // Sınav bittiğinde tam ekran geçiş reklamını göster
    window.ydsAdService?.showInterstitial();

    // Modalı aç
    document.getElementById("examScorecardModal")?.classList.remove("hidden");
  }

  closeExamScorecard() {
    document.getElementById("examScorecardModal")?.classList.add("hidden");
  }

  reviewWrongQuestions() {
    this.closeExamScorecard();
    const wrongOnly = this.filteredQuestions.filter(q => this.userAnswers[q.id] && !this.userAnswers[q.id].isCorrect);
    if (wrongOnly.length === 0) {
      alert("Tebrikler! Bu denemede yanlış yaptığınız soru bulunmuyor.");
      return;
    }
    this.filteredQuestions = wrongOnly;
    this.currentIndex = 0;
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  restartCurrentExam() {
    const confirmRestart = confirm("Bu deneme sınavındaki tüm cevaplarınızı sıfırlayıp baştan başlamak istediğinize emin misiniz?");
    if (!confirmRestart) return;

    this.closeExamScorecard();
    const year = this.currentExamYear || 2024;
    const questions = window.questionRepo.getByYear(year);

    // Bu sınavın cevaplarını sil
    questions.forEach(q => {
      delete this.userAnswers[q.id];
    });
    this.saveUserAnswers();

    this.startExamMode(year);
  }

  // --- Filtre Dropdown Doldurma ---
  populateFilterDropdowns() {
    const catSelect = document.getElementById("categoryFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (catSelect) {
      const categories = [...new Set(this.allQuestions.map(q => q.category).filter(Boolean))];
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
    }

    if (yrSelect) {
      const years = [...new Set(this.allQuestions.map(q => q.year).filter(Boolean))].sort((a, b) => b - a);
      years.forEach(yr => {
        const opt = document.createElement("option");
        opt.value = yr;
        opt.textContent = yr;
        yrSelect.appendChild(opt);
      });
    }
  }

  // --- PDF İçe Aktarma Mantığı ---
  async handlePDFImport(file) {
    const statusBox = document.getElementById("pdfImportStatus");
    const statusText = document.getElementById("pdfStatusText");
    const progressBar = document.getElementById("pdfProgressBar");

    if (statusBox) statusBox.classList.remove("hidden");
    if (statusText) statusText.textContent = "PDF dosyası okunuyor...";
    if (progressBar) progressBar.style.width = "30%";

    try {
      const { fullText } = await window.ydsPDFParser.extractTextFromPDF(file);
      if (statusText) statusText.textContent = "YDS soruları ayrıştırılıyor...";
      if (progressBar) progressBar.style.width = "70%";

      const examName = file.name.replace(/\.[^/.]+$/, "");
      const customAnswers = document.getElementById("pdfAnswerKeyInput")?.value || "";
      let parsedQuestions = window.ydsPDFParser.parseQuestions(fullText, examName);

      if (customAnswers.trim()) {
        parsedQuestions = window.ydsPDFParser.applyCustomAnswerKey(parsedQuestions, customAnswers);
      }

      if (parsedQuestions.length === 0) {
        alert("PDF'te uygun YDS soru formatı tespit edilemedi. Lütfen geçerli bir ÖSYM veya YDS kitapçığı yüklediğinizden emin olun.");
        if (statusBox) statusBox.classList.add("hidden");
        return;
      }

      const addedCount = window.questionRepo.addQuestions(parsedQuestions);
      if (progressBar) progressBar.style.width = "100%";
      if (statusText) statusText.textContent = `${addedCount} adet yeni soru başarıyla soru bankasına eklendi!`;

      // Uygulamayı güncelle
      this.allQuestions = window.questionRepo.getAll();
      this.populateFilterDropdowns();
      this.applyFilters();
      this.updateStats();

      setTimeout(() => {
        document.getElementById("pdfImportModal")?.classList.add("hidden");
        if (statusBox) statusBox.classList.add("hidden");
      }, 1500);

    } catch (err) {
      console.error("PDF yükleme hatası:", err);
      alert("PDF işlenirken bir hata oluştu: " + err.message);
      if (statusBox) statusBox.classList.add("hidden");
    }
  }

  // --- Ana Menü, Sayfa Gezinimi ve Dashboard ---
  showHomeView() {
    if (this.isExamMode) {
      this.pauseExamSmartTimer();
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.remove("hidden");
    if (questionView) questionView.classList.add("hidden");
    if (reportView) reportView.classList.add("hidden");

    this.currentView = "home";
    this.updateHomeStats();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showQuestionView(mode = "practice") {
    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.add("hidden");
    if (questionView) questionView.classList.remove("hidden");
    if (reportView) reportView.classList.add("hidden");

    this.currentView = "question";

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      if (mode === "practice") {
        modeBadge.textContent = "⚡ Alıştırma Modu (Bağımsız Havuz)";
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
      } else if (mode === "exam") {
        modeBadge.textContent = `📝 ${this.currentExamYear || 2024} YDS Tam Deneme`;
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300";
      } else {
        modeBadge.textContent = "🔍 Soru Bankası";
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300";
      }
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  showReportView() {
    if (this.isExamMode) {
      this.pauseExamSmartTimer();
    }

    const homeView = document.getElementById("homeView");
    const questionView = document.getElementById("questionView");
    const reportView = document.getElementById("reportView");

    if (homeView) homeView.classList.add("hidden");
    if (questionView) questionView.classList.add("hidden");
    if (reportView) reportView.classList.remove("hidden");

    this.currentView = "report";
    this.renderReportView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  updateHomeStats() {
    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName || "Aday";

    const answeredEntries = Object.values(this.userAnswers);
    const totalSolved = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a.isCorrect).length;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;
    const totalExams = Object.keys(this.examSessions).length;

    const kpiSolved = document.getElementById("homeKpiSolved");
    const kpiAccuracy = document.getElementById("homeKpiAccuracy");
    const kpiExams = document.getElementById("homeKpiExams");

    if (kpiSolved) kpiSolved.textContent = totalSolved;
    if (kpiAccuracy) kpiAccuracy.textContent = `%${accuracy}`;
    if (kpiExams) kpiExams.textContent = totalExams;
  }

  initDailyTip() {
    const tipEl = document.getElementById("homeDailyTipText");
    if (!tipEl) return;
    const tips = [
      "Zıtlık bağlaçlarında (Although, While, Even though, In spite of) iki cümlenin anlam kutuplarına (+ / -) bakın. Biri başarı veya olumluluk anlatıyorsa diğeri engel veya zorluk anlatmalıdır.",
      "Çeviri sorularında cümlenin 'Ana Yüklemini (Main Verb)' ve 'Öznesini (Subject)' tespit edin. Şıklarda bu iki öğeyi tam karşılamayanları hemen eleyerek sürenizi yarı yarıya kısaltabilirsiniz.",
      "Paragraf tamamlama sorularında boşluğun hemen öncesindeki ve sonrasındaki referans zamirlere (this, these, such, however, therefore) odaklanın. Kopukluğu bu zamirler giderir.",
      "Preposition (edat) sorularında boşluktan önceki fiili veya boşluktan sonraki ismi kontrol edin; 'depend on', 'contribute to', 'prevent from' gibi kalıplaşmış edatlar belirleyicidir.",
      "Zaman (Tense) uyumu kuralını unutmayın: Yan cümlecikte 'Past' bir yapı varsa ana cümlede de 'Past' arayın; 'Since' kuralı hariç 'Present' ve 'Past' tense'ler doğrudan birbiriyle bağlanmaz.",
      "Akışı bozan cümle (Irrelevant Sentence) sorularında paragraftaki konunun odağını veya bakış açısını değiştiren, aşırı özele veya genele kayan cümleyi arayın.",
      "Restatement (Anlamca En Yakın) sorularında cümlenin kesinlik derecesine (must, may, might, certainly, probably) çok dikkat edin; olasılık anlatan cümle kesinlik şıkkıyla eşleşmez.",
      "Diyalog tamamlama sorularında boşluktan hemen sonraki kişinin verdiği tepkiye ve soruya dikkat edin. Verilen yanıt, boşluktaki cümlenin niteliğini doğrudan ele verir.",
      "Kelime sorularında özellikle Phrasal Verbleri (bring about, give up, put off, call off) ve sıfat-isim tamlamalarını eş anlamlılarıyla birlikte tekrar etmeyi unutmayın."
    ];
    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    tipEl.textContent = `"${randomTip}"`;
  }

  // --- Karne & Rapor Ekranı Hesaplamaları ---
  renderReportView() {
    const answeredEntries = Object.values(this.userAnswers);
    const totalSolved = answeredEntries.length;
    const totalCorrect = answeredEntries.filter(a => a.isCorrect).length;
    const totalWrong = totalSolved - totalCorrect;
    const accuracy = totalSolved > 0 ? Math.round((totalCorrect / totalSolved) * 100) : 0;

    const repTotal = document.getElementById("repTotalSolved");
    const repCorr = document.getElementById("repCorrectCount");
    const repWr = document.getElementById("repWrongCount");
    const repRate = document.getElementById("repSuccessRate");

    if (repTotal) repTotal.textContent = totalSolved;
    if (repCorr) repCorr.textContent = totalCorrect;
    if (repWr) repWr.textContent = totalWrong;
    if (repRate) repRate.textContent = `%${accuracy}`;

    // Kategori Dağılım Çubukları
    this.renderCategoryReportBars();

    // Ödüllü Reklam Taktik Durumu
    this.tacticsUnlocked = localStorage.getItem("yds_tactics_unlocked") === "true";
    const lockedBanner = document.getElementById("lockedTacticsBanner");
    const unlockedBanner = document.getElementById("unlockedTacticsBanner");

    if (this.tacticsUnlocked) {
      if (lockedBanner) lockedBanner.classList.add("hidden");
      if (unlockedBanner) unlockedBanner.classList.remove("hidden");
      this.renderPersonalizedTactics();
    } else {
      if (lockedBanner) lockedBanner.classList.remove("hidden");
      if (unlockedBanner) unlockedBanner.classList.add("hidden");
    }
  }

  renderCategoryReportBars() {
    const container = document.getElementById("repCategoryBarsList");
    if (!container) return;
    container.innerHTML = "";

    const questionMap = new Map();
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const standardCategories = [
      { name: "Kelime Bilgisi (Vocabulary & Phrasal Verbs)", match: ["kelime", "vocabulary", "phrasal"], icon: "📚" },
      { name: "Dilbilgisi & Zamanlar (Grammar & Tenses)", match: ["dilbilgisi", "grammar", "tenses", "preposition"], icon: "📐" },
      { name: "Cloze Test (Parça İçi Boşluk)", match: ["cloze"], icon: "🧩" },
      { name: "Cümle Tamamlama (Sentence Completion)", match: ["cümle tamamlama", "sentence"], icon: "🔗" },
      { name: "Çeviri (İngilizce ↔ Türkçe)", match: ["çeviri", "translation"], icon: "🌐" },
      { name: "Okuma Parçaları (Reading Passages)", match: ["okuma", "parça", "reading"], icon: "📖" },
      { name: "Diyalog Tamamlama (Dialogue)", match: ["diyalog", "dialogue"], icon: "💬" },
      { name: "Anlamca En Yakın Cümle (Restatement)", match: ["anlamca en yakın", "restatement"], icon: "🔄" },
      { name: "Paragraf Tamamlama (Paragraph Completion)", match: ["paragraf tamamlama"], icon: "📝" },
      { name: "Anlatım Bütünlüğü / Akışı Bozan (Irrelevant)", match: ["anlatım", "akışı bozan", "irrelevant"], icon: "✂️" }
    ];

    const statsByCategory = standardCategories.map(cat => ({
      ...cat,
      total: 0,
      correct: 0
    }));

    let otherTotal = 0;
    let otherCorrect = 0;

    Object.entries(this.userAnswers).forEach(([qId, ans]) => {
      const q = questionMap.get(qId);
      if (!q) return;

      const qCat = ((q.category || "") + " " + (q.subCategory || "")).toLowerCase();
      let matched = false;

      for (const stat of statsByCategory) {
        if (stat.match.some(keyword => qCat.includes(keyword))) {
          stat.total++;
          if (ans.isCorrect) stat.correct++;
          matched = true;
          break;
        }
      }

      if (!matched) {
        otherTotal++;
        if (ans.isCorrect) otherCorrect++;
      }
    });

    const totalAnswered = Object.keys(this.userAnswers).length;
    if (totalAnswered === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-gray-400 text-xs sm:text-sm">
          Henüz soru çözülmedi. Alıştırma veya deneme çözdükçe soru tipi başarı dağılımınız burada görüntülenecektir.
        </div>
      `;
      return;
    }

    statsByCategory.forEach(stat => {
      if (stat.total === 0) return;
      const pct = Math.round((stat.correct / stat.total) * 100);
      let barColor = "bg-rose-500";
      let badgeTextColor = "text-rose-600 dark:text-rose-400";
      if (pct >= 70) {
        barColor = "bg-emerald-500";
        badgeTextColor = "text-emerald-600 dark:text-emerald-400";
      } else if (pct >= 50) {
        barColor = "bg-amber-500";
        badgeTextColor = "text-amber-600 dark:text-amber-400";
      }

      const row = document.createElement("div");
      row.className = "space-y-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700/60";
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs sm:text-sm">
          <span class="font-bold text-gray-800 dark:text-gray-200 flex items-center space-x-1.5">
            <span>${stat.icon}</span>
            <span>${stat.name}</span>
          </span>
          <span class="font-extrabold ${badgeTextColor}">
            ${stat.correct} / ${stat.total} Doğru (%${pct})
          </span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-full ${barColor} transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    });

    if (otherTotal > 0) {
      const pct = Math.round((otherCorrect / otherTotal) * 100);
      const row = document.createElement("div");
      row.className = "space-y-1.5 p-3 rounded-2xl bg-gray-50 dark:bg-gray-750/50 border border-gray-100 dark:border-gray-700/60";
      row.innerHTML = `
        <div class="flex items-center justify-between text-xs sm:text-sm">
          <span class="font-bold text-gray-800 dark:text-gray-200">📌 Diğer Soru Tipleri</span>
          <span class="font-extrabold text-indigo-600 dark:text-indigo-400">
            ${otherCorrect} / ${otherTotal} Doğru (%${pct})
          </span>
        </div>
        <div class="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
          <div class="h-full rounded-full bg-indigo-500 transition-all duration-500" style="width: ${pct}%"></div>
        </div>
      `;
      container.appendChild(row);
    }
  }

  // --- Ödüllü Reklam ile Taktik Rehberini Açma ---
  requestRewardedTactics() {
    if (!window.ydsAdService) {
      this.unlockPersonalizedTactics();
      return;
    }

    window.ydsAdService.showRewarded(() => {
      this.unlockPersonalizedTactics();
    });
  }

  unlockPersonalizedTactics() {
    localStorage.setItem("yds_tactics_unlocked", "true");
    this.tacticsUnlocked = true;

    const lockedBanner = document.getElementById("lockedTacticsBanner");
    const unlockedBanner = document.getElementById("unlockedTacticsBanner");

    if (lockedBanner) lockedBanner.classList.add("hidden");
    if (unlockedBanner) unlockedBanner.classList.remove("hidden");

    this.renderPersonalizedTactics();
    this.playCorrectSound();
    alert("🎉 Harika! Ödüllü video izlendi ve Kişiselleştirilmiş Hata & Sınav Taktikleri Rehberinizin kilidi açıldı!");
  }

  renderPersonalizedTactics() {
    const container = document.getElementById("unlockedTacticsContent");
    if (!container) return;

    const questionMap = new Map();
    (this.allQuestions || []).forEach(q => questionMap.set(q.id, q));
    if (window.PRACTICE_YDS_QUESTIONS) {
      window.PRACTICE_YDS_QUESTIONS.forEach(q => questionMap.set(q.id, q));
    }

    const wrongList = [];
    Object.entries(this.userAnswers).forEach(([qId, ans]) => {
      if (!ans.isCorrect) {
        const q = questionMap.get(qId);
        if (q) wrongList.push({ id: qId, ans, q });
      }
    });

    if (wrongList.length === 0) {
      container.innerHTML = `
        <div class="space-y-4">
          <div class="p-3.5 rounded-xl bg-indigo-500/20 border border-indigo-400/30">
            <h5 class="font-extrabold text-amber-300 text-sm sm:text-base">🌟 Tebrikler! Henüz Yanlış Cevabınız Bulunmuyor.</h5>
            <p class="mt-1 text-xs sm:text-sm text-indigo-100">
              YDS hazırlığınız harika gidiyor! Sınavda 80+ üstü puanı garantilemek için altın değerindeki bu 4 evrensel YDS taktiğini mutlaka uygulayın:
            </p>
          </div>
          
          <div class="space-y-3">
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">1. Çeviri Sorularında "Özne + Yüklem" Formülü:</span>
              <span class="text-xs text-indigo-100">ÖSYM çeviri sorularında cümlenin ana yüklemini ve öznesini bulun. 5 şıktan en az 3'ü yalnızca yüklemin zamanı (Tense) veya öznenin eksikliği nedeniyle anında elenir. Soruyu 30 saniyede çözebilirsiniz.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">2. Zıtlık Bağlaçlarında Kutup (+ / -) Analizi:</span>
              <span class="text-xs text-indigo-100">Although, While, Despite gibi zıtlık bağlaçlarında iki cümlenin anlam kutbunu belirleyin. Bir taraf pozitif bir gelişmeden bahsediyorsa diğer taraf kesinlikle engel veya negatif bir durum içermelidir.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">3. Paragraf Sorularında Kesinlik Tuzakları:</span>
              <span class="text-xs text-indigo-100">Şıklarda "all, always, never, solely, only, entirely" gibi aşırı kesinlik belirten sözcükler varsa dikkatli olun. Parçada açıkça belirtilmedikçe bu şıklar neredeyse her zaman çeldiricidir. ÖSYM ılımlı (may, might, likely, tend to) şıkları sever.</span>
            </div>
            <div class="p-3 rounded-xl bg-white/10 border border-white/10">
              <span class="font-bold text-amber-300 block">4. Akıllı Zaman Yönetimi:</span>
              <span class="text-xs text-indigo-100">YDS 80 soru ve 180 dakikadır. İlk 36 soruyu (Kelime, Dilbilgisi, Cloze, Cümle Tamamlama) 45-50 dakikada tamamlayıp, kalan süreyi okuma parçalarına ayırmak sınav başarısının anahtarıdır.</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    const categoryMistakes = {};
    wrongList.forEach(item => {
      const cat = item.q.category || "Genel";
      categoryMistakes[cat] = (categoryMistakes[cat] || 0) + 1;
    });

    const sortedWeak = Object.entries(categoryMistakes).sort((a, b) => b[1] - a[1]);

    let tacticsHtml = `
      <div class="space-y-4">
        <div class="p-3.5 rounded-xl bg-rose-500/20 border border-rose-400/30">
          <h5 class="font-extrabold text-amber-300 text-sm sm:text-base">🎯 Kişiselleştirilmiş Hata Analiziniz (${wrongList.length} Yanlış Tespit Edildi)</h5>
          <p class="mt-1 text-xs sm:text-sm text-indigo-100">
            Yapay zeka analiz motorumuz hata yaptığınız soruları kategorize etti. İşte en çok puan kaybettiğiniz alanlar ve nokta atışı çözüm reçeteleri:
          </p>
        </div>

        <div class="space-y-3">
    `;

    sortedWeak.forEach(([catName, count]) => {
      const lower = catName.toLowerCase();
      let tacticTitle = `📌 ${catName} (${count} Hata)`;
      let tacticBody = "";

      if (lower.includes("kelime") || lower.includes("vocabulary")) {
        tacticBody = "Kelimeleri tek başına Türkçe anlamıyla değil, yanındaki edatıyla (collocation) öğrenin. Örneğin 'rely ON', 'result IN/FROM', 'comply WITH'. Boşluktan sonraki edat veya isim, doğru cevabı ele verir. Hata yaptığınız kelimeleri 'Öğrenme Havuzu'na ekleyip flaş kart olarak tekrar edin.";
      } else if (lower.includes("dilbilgisi") || lower.includes("grammar") || lower.includes("zaman")) {
        tacticBody = "Zaman (Tense) uyumuna dikkat edin. Yan cümlede 'past' bir yapı varsa ana cümlede present/future aranmaz. Ayrıca 'Since' yapısı hariç Past Perfect (had V3) tek başına bir cümlede duramaz; mutlaka öncesinde Simple Past (V2) bir olay olmalıdır.";
      } else if (lower.includes("çeviri") || lower.includes("translation")) {
        tacticBody = "Çeviri sorularında tüm cümleyi çevirmeye kalkışmayın! Önce ana cümlenin yüklemini ve tense'ini bulun. Ardından özneyi bulun. Bu iki kural ile 5 seçenekten en az 3'ü saniyeler içinde elenir.";
      } else if (lower.includes("cümle tamamlama") || lower.includes("sentence")) {
        tacticBody = "Bağlacın türünü belirleyin: Zıtlık (Although/However) mı, Neden-Sonuç (Because/Therefore) mı? İki cümlenin kutuplarını (+ / -) eşleştirin ve şıklardaki referans zamirlere (they, this, such) dikkat edin.";
      } else if (lower.includes("okuma") || lower.includes("parça") || lower.includes("reading")) {
        tacticBody = "Önce paragrafı değil, soru kökünü okuyun. 'According to the passage' sorularında kendi yorumunuzu katmayın, sadece metindeki eşanlamlı kelimeyi (paraphrasing) arayın. 'Only, all, never' gibi radikal kelimeler içeren şıklardan uzak durun.";
      } else if (lower.includes("diyalog") || lower.includes("dialogue")) {
        tacticBody = "Boşluktan HEMEN SONRA gelen kişinin verdiği cevaba bakın. Karşı taraf 'I don't think so' diyorsa boşlukta bir fikir veya öneri cümlesi olmalıdır. Duygu ve nezaket derecesini eşleştirin.";
      } else if (lower.includes("anlatım") || lower.includes("akışı bozan") || lower.includes("irrelevant")) {
        tacticBody = "Her cümlenin ana fikrini tek bir kelimeyle özetleyin. Akışı bozan cümle aynı konudan bahsediyor gibi görünse de konunun yönünü (örneğin faydalarından bahsederken aniden maliyetine geçmek) değiştirir.";
      } else {
        tacticBody = "Bu soru tipinde şıkları doğrudan doğruya soru kökündeki anahtar kelimelerle eşleştirin. Çeldirici şıklar genellikle sorudaki kelimeleri birebir geçirip anlamı ters yüz eder; doğru cevap ise eş anlamlı kelimelerle ifade edilir.";
      }

      tacticsHtml += `
        <div class="p-3.5 rounded-xl bg-white/10 border border-white/15 space-y-1">
          <span class="font-extrabold text-amber-300 text-xs sm:text-sm block">${tacticTitle}</span>
          <p class="text-xs sm:text-sm text-indigo-100 leading-relaxed">${tacticBody}</p>
        </div>
      `;
    });

    tacticsHtml += `
        </div>
      </div>
    `;

    container.innerHTML = tacticsHtml;
  }

  // --- Alıştırmalık Sorular Modu (Denemelerden Tamamen Bağımsız Havuz) ---
  startPracticeMode() {
    if (this.isExamMode) {
      this.stopExamSmartTimer();
      this.isExamMode = false;
      this.currentExamYear = null;
      document.getElementById("examModeBanner")?.classList.add("hidden");
    }

    this.isPracticeMode = true;

    const practiceQuestions = window.PRACTICE_YDS_QUESTIONS || [];
    if (practiceQuestions.length === 0) {
      alert("Alıştırmalık soru havuzu yüklenemedi.");
      return;
    }

    // Karışık sıra ile başlat (Deneme sorularıyla kesinlikle karışmaz)
    const shuffled = [...practiceQuestions].sort(() => Math.random() - 0.5);
    this.filteredQuestions = shuffled;
    this.currentIndex = 0;

    // Filtreleri sıfırla
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const catSelect = document.getElementById("categoryFilter");
    const stSelect = document.getElementById("statusFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";

    this.showQuestionView("practice");
    this.renderQuestion();
    this.renderQuestionGrid();
  }

  // --- Kullanıcı İsmi ve Onboarding ---
  openNameModal() {
    const modal = document.getElementById("namePromptModal");
    const input = document.getElementById("nameModalInput");
    if (modal) {
      modal.classList.remove("hidden");
      if (input) {
        input.value = this.userName || "";
        setTimeout(() => input.focus(), 200);
      }
    }
  }

  closeNameModal() {
    document.getElementById("namePromptModal")?.classList.add("hidden");
  }

  saveNameModal() {
    const input = document.getElementById("nameModalInput");
    const name = input ? input.value.trim() : "";
    this.userName = name || "Aday";
    localStorage.setItem("yds_user_name", this.userName);

    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName;
    const settingsInput = document.getElementById("settingsNameInput");
    if (settingsInput) settingsInput.value = this.userName;

    this.closeNameModal();
  }

  // --- Uygulama Ayarları Modalı ---
  openSettingsModal() {
    const modal = document.getElementById("settingsModal");
    const input = document.getElementById("settingsNameInput");
    const soundToggle = document.getElementById("settingsSoundToggle");
    const autoPauseToggle = document.getElementById("settingsAutoPauseToggle");

    if (input) input.value = this.userName || "";
    if (soundToggle) soundToggle.checked = this.soundEnabled;
    if (autoPauseToggle) autoPauseToggle.checked = this.autoPauseEnabled;

    if (modal) modal.classList.remove("hidden");
  }

  closeSettingsModal() {
    document.getElementById("settingsModal")?.classList.add("hidden");
  }

  saveSettingsName() {
    const input = document.getElementById("settingsNameInput");
    const name = input ? input.value.trim() : "";
    if (!name) {
      alert("Lütfen geçerli bir isim giriniz.");
      return;
    }
    this.userName = name;
    localStorage.setItem("yds_user_name", this.userName);

    const homeName = document.getElementById("homeUserNameText");
    if (homeName) homeName.textContent = this.userName;

    alert("İsminiz başarıyla kaydedildi! ✓");
  }

  toggleSoundSetting(checked) {
    this.soundEnabled = !!checked;
    localStorage.setItem("yds_sound_enabled", this.soundEnabled ? "true" : "false");
  }

  toggleAutoPauseSetting(checked) {
    this.autoPauseEnabled = !!checked;
    localStorage.setItem("yds_auto_pause", this.autoPauseEnabled ? "true" : "false");
  }

  resetAllProgress() {
    const confirmed = confirm("Tüm çözülen sorular, sınav karneleri ve başarı verileriniz silinecektir. Devam etmek istediğinize emin misiniz?");
    if (!confirmed) return;

    localStorage.removeItem(STORAGE_KEYS.USER_ANSWERS);
    localStorage.removeItem(STORAGE_KEYS.EXAM_SESSIONS);
    localStorage.removeItem("yds_tactics_unlocked");

    this.userAnswers = {};
    this.examSessions = {};
    this.tacticsUnlocked = false;

    this.updateStats();
    this.updateHomeStats();
    if (this.currentView === "report") {
      this.renderReportView();
    }

    this.renderQuestion();
    this.renderQuestionGrid();

    this.closeSettingsModal();
    alert("Tüm ilerlemeniz başarıyla sıfırlandı.");
  }

  // --- Event Listener'lar ---
  setupEventListeners() {
    // Arama Çubuğu (Ters yazım engelleme, imleç koruması ve klavye desteği)
    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");

    if (kwInput) {
      let debounceTimer = null;
      let isComposing = false;

      // Sanal klavye kelime tamamlama / heceleme (IME composition) kontrolü
      kwInput.addEventListener("compositionstart", () => {
        isComposing = true;
      });

      kwInput.addEventListener("compositionend", () => {
        isComposing = false;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.applyFilters(), 350);
      });

      kwInput.addEventListener("input", () => {
        if (clearBtn) {
          clearBtn.classList.toggle("hidden", !kwInput.value);
        }
        if (isComposing) return;

        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => this.applyFilters(), 350);
      });

      kwInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          clearTimeout(debounceTimer);
          this.applyFilters();
        }
      });

      if (clearBtn) {
        clearBtn.addEventListener("click", () => {
          kwInput.value = "";
          clearBtn.classList.add("hidden");
          this.applyFilters();
          kwInput.focus();
        });
      }
    }

    // Filtre Seçiciler
    document.getElementById("categoryFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("yearFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("statusFilter")?.addEventListener("change", () => this.applyFilters());
    document.getElementById("clearFilterBtn")?.addEventListener("click", () => this.clearAllFilters());

    // Navigasyon
    document.getElementById("prevQuestionBtn")?.addEventListener("click", () => this.prevQuestion());
    document.getElementById("nextQuestionBtn")?.addEventListener("click", () => this.nextQuestion());
    document.getElementById("favoriteBtn")?.addEventListener("click", () => this.toggleFavorite());

    // Zamanlayıcı
    document.getElementById("timerToggleBtn")?.addEventListener("click", () => this.toggleTimer());
    document.getElementById("timerResetBtn")?.addEventListener("click", () => this.resetTimer());

    // 80 Soruluk Yıl Denemesi Modu Olayları
    document.getElementById("openYearExamBtn")?.addEventListener("click", () => this.openYearExamModal());
    document.getElementById("closeYearExamModalBtn")?.addEventListener("click", () => this.closeYearExamModal());
    document.getElementById("finishExamBtn")?.addEventListener("click", () => this.showExamScorecard());
    document.getElementById("exitExamBtn")?.addEventListener("click", () => this.exitExamMode());

    // Sınav Karnesi Modalı Olayları
    document.getElementById("closeScorecardModalBtn")?.addEventListener("click", () => this.closeExamScorecard());
    document.getElementById("scorecardReviewWrongBtn")?.addEventListener("click", () => this.reviewWrongQuestions());
    document.getElementById("scorecardRestartExamBtn")?.addEventListener("click", () => this.restartCurrentExam());
    document.getElementById("scorecardChangeYearBtn")?.addEventListener("click", () => {
      this.closeExamScorecard();
      this.openYearExamModal();
    });
    document.getElementById("scorecardRewardedAdBtn")?.addEventListener("click", () => {
      this.requestRewardedTactics();
    });

    // İsim Giriş Inputları (Enter Desteği)
    document.getElementById("nameModalInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.saveNameModal();
    });
    document.getElementById("settingsNameInput")?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") this.saveSettingsName();
    });

    // Modallar
    document.getElementById("openPoolBtn")?.addEventListener("click", () => this.openLearningPoolModal());
    document.getElementById("closePoolModalBtn")?.addEventListener("click", () => this.closeLearningPoolModal());
    document.getElementById("openFlashcardsBtn")?.addEventListener("click", () => {
      this.closeLearningPoolModal();
      this.openFlashcardsModal();
    });
    document.getElementById("closeFlashcardsModalBtn")?.addEventListener("click", () => this.closeFlashcardsModal());

    // Flaş Kart Butonları
    document.getElementById("flashcardInner")?.addEventListener("click", () => this.flipFlashcard());
    document.getElementById("flashcardPrevBtn")?.addEventListener("click", () => this.prevFlashcard());
    document.getElementById("flashcardNextBtn")?.addEventListener("click", () => this.nextFlashcard(false));
    document.getElementById("flashcardMasteredBtn")?.addEventListener("click", () => this.nextFlashcard(true));

    // Dışa aktarma
    document.getElementById("exportCsvBtn")?.addEventListener("click", () => this.exportLearningPool("csv"));
    document.getElementById("exportJsonBtn")?.addEventListener("click", () => this.exportLearningPool("json"));

    // PDF Modalı
    document.getElementById("openPdfModalBtn")?.addEventListener("click", () => {
      document.getElementById("pdfImportModal")?.classList.remove("hidden");
    });
    document.getElementById("closePdfModalBtn")?.addEventListener("click", () => {
      document.getElementById("pdfImportModal")?.classList.add("hidden");
    });

    const pdfFileInput = document.getElementById("pdfFileInput");
    if (pdfFileInput) {
      pdfFileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handlePDFImport(e.target.files[0]);
        }
      });
    }

    // Kelime Arama Modal Kapatma
    document.getElementById("closeWordModalBtn")?.addEventListener("click", () => this.closeWordModal());

    // Tıklanabilir Kelimeler Olayı (Event Delegation)
    document.addEventListener("click", (e) => {
      const wordSpan = e.target.closest(".interactive-word");
      if (wordSpan) {
        e.preventDefault();
        e.stopPropagation();
        const word = decodeURIComponent(wordSpan.dataset.word || wordSpan.textContent);
        this.openWordModal(word);
      }
    });

    // Sesli Telaffuz Butonu
    document.getElementById("modalSpeakBtn")?.addEventListener("click", () => {
      const word = document.getElementById("modalWordTitle")?.textContent;
      if (word) this.speakWord(word);
    });

    // Klavye Kısayolları (A-B-C-D-E şıkları için 1-5 veya A-E, sağ-sol ok tuşları ile soru geçişi)
    document.addEventListener("keydown", (e) => {
      // Eğer input odaklıysa kısayolları yoksay
      if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;

      const key = e.key.toUpperCase();
      if (["A", "B", "C", "D", "E"].includes(key)) {
        this.handleOptionSelect(key);
      } else if (e.key === "ArrowRight") {
        this.nextQuestion();
      } else if (e.key === "ArrowLeft") {
        this.prevQuestion();
      } else if (e.key === "f" || e.key === "F") {
        this.toggleFavorite();
      } else if (e.key === " " && !document.getElementById("flashcardModal")?.classList.contains("hidden")) {
        e.preventDefault();
        this.flipFlashcard();
      }
    });

    // Gece/Gündüz Modu Butonu
    document.getElementById("themeToggleBtn")?.addEventListener("click", () => {
      document.documentElement.classList.toggle("dark");
      const isDark = document.documentElement.classList.contains("dark");
      localStorage.setItem("yds_theme", isDark ? "dark" : "light");
    });

    // Kayıtlı tema yükleme
    if (localStorage.getItem("yds_theme") === "dark" || (!localStorage.getItem("yds_theme") && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add("dark");
    }
  }
}

// Uygulamayı Başlat
window.addEventListener("DOMContentLoaded", () => {
  window.ydsApp = new YDSApp();
});
