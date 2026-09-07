// YDS Soru Filtreleme ve Pratik Uygulaması - Ana Mantık (app.js)

class YDSApp {
  constructor() {
    this.allQuestions = [];
    this.filteredQuestions = [];
    this.currentIndex = 0;
    this.practiceAnswers = this.loadPracticeAnswers();
    this.examAnswers = this.loadExamAnswers();
    this.learningPool = this.loadLearningPool();
    this.masteredWords = this.loadMasteredWords();
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

  // --- Sayfa Kaydırma Kilidi (Mobile & Modal Scroll Lock) ---
  lockScroll() {
    if (this._scrollLocked) return;
    this._scrollLocked = true;
    this._savedScrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
    
    document.body.style.position = 'fixed';
    document.body.style.top = `-${this._savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';
  }

  unlockScroll() {
    if (!this._scrollLocked) return;
    this._scrollLocked = false;
    const scrollY = this._savedScrollY || 0;
    
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    document.body.style.overflow = '';
    
    window.scrollTo(0, scrollY);
  }


  get activeAnswers() {
    return this.isExamMode ? this.examAnswers : this.practiceAnswers;
  }

  get userAnswers() {
    return this.activeAnswers;
  }

  set userAnswers(val) {
    if (this.isExamMode) {
      this.examAnswers = val;
    } else {
      this.practiceAnswers = val;
    }
  }

  init() {
    this.allQuestions = window.questionRepo ? window.questionRepo.getAll() : [];
    this.activePool = this.allQuestions;
    this.setupEventListeners();
    this.applyFilters();
    this.updateStats();
    this.updateHomeStats();
    this.updateLearningPoolBadge();
    this.populateFilterDropdowns();
    this.initDailyTip();
    this.showHomeView();

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

  // --- LocalStorage Yönetimi (Deneme ve Alıştırma İzolasyonu) ---
  loadPracticeAnswers() {
    try {
      const p = localStorage.getItem("yds_practice_answers");
      if (p) return JSON.parse(p);
      const legacy = localStorage.getItem(STORAGE_KEYS?.USER_ANSWERS || "yds_user_answers");
      return legacy ? JSON.parse(legacy) : {};
    } catch { return {}; }
  }

  savePracticeAnswers() {
    try {
      localStorage.setItem("yds_practice_answers", JSON.stringify(this.practiceAnswers));
      localStorage.setItem(STORAGE_KEYS?.USER_ANSWERS || "yds_user_answers", JSON.stringify(this.practiceAnswers));
    } catch (e) { console.error("Pratik cevapları kaydetme hatası:", e); }
    this.updateStats();
  }

  loadExamAnswers() {
    try {
      const e = localStorage.getItem("yds_exam_answers");
      return e ? JSON.parse(e) : {};
    } catch { return {}; }
  }

  saveExamAnswers() {
    try {
      localStorage.setItem("yds_exam_answers", JSON.stringify(this.examAnswers));
    } catch (e) { console.error("Sınav cevapları kaydetme hatası:", e); }
    this.updateStats();
  }

  loadUserAnswers() {
    return this.loadPracticeAnswers();
  }

  saveUserAnswers() {
    if (this.isExamMode) {
      this.saveExamAnswers();
    } else {
      this.savePracticeAnswers();
    }
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

  loadMasteredWords() {
    try {
      return JSON.parse(localStorage.getItem('yds_mastered_words')) || [];
    } catch { return []; }
  }

  saveMasteredWords() {
    localStorage.setItem('yds_mastered_words', JSON.stringify(this.masteredWords));
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
    const searchScope = document.getElementById("searchScopeFilter")?.value || "practice";

    const hasFilter = keyword !== "" || category !== "all" || year !== "all" || status !== "all" || (this.isPracticeMode && searchScope !== "practice");
    
    if (this._lastHasFilter === undefined) this._lastHasFilter = false;
    if (!this._lastHasFilter && hasFilter) {
      this.savedUnfilteredIndex = this.currentIndex;
    }

    this.activeKeyword = keyword;

    let poolToSearch = this.activePool || this.allQuestions;

    if (this.isPracticeMode) {
      if (searchScope === "exams") {
        poolToSearch = window.questionRepo ? window.questionRepo.getAll() : [];
      } else if (searchScope === "all") {
        const practicePool = window.PRACTICE_YDS_QUESTIONS || [];
        const examPool = window.questionRepo ? window.questionRepo.getAll() : [];
        poolToSearch = [...practicePool, ...examPool];
      } else {
        poolToSearch = window.PRACTICE_YDS_QUESTIONS || [];
      }
    }

    this.filteredQuestions = poolToSearch.filter(q => {
      // 1. Kelime Filtresi (Örn: "apple", "conduct", "although")
      if (keyword) {
        const keywordRegex = new RegExp('\\b' + keyword.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\b', 'i');
        const qText = q.questionText || q.text || "";
        const inQuestion = keywordRegex.test(qText);
        const inPassage = keywordRegex.test(q.passage || "");
        const inOptions = Object.values(q.options || {}).some(opt => keywordRegex.test(String(opt)));
        const inTags = (q.tags || []).some(t => keywordRegex.test(String(t)));
        const inAnalysis = q.wordAnalysis && Object.keys(q.wordAnalysis).some(w => keywordRegex.test(w));

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

    if (this._lastHasFilter && !hasFilter) {
      this.currentIndex = this.savedUnfilteredIndex || 0;
    } else if (hasFilter) {
      this.currentIndex = 0;
    }

    if (this.currentIndex >= this.filteredQuestions.length) {
       this.currentIndex = Math.max(0, this.filteredQuestions.length - 1);
    }

    this._lastHasFilter = hasFilter;

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
      if (this.isPracticeMode) {
        const searchScope = document.getElementById("searchScopeFilter")?.value || "practice";
        if (searchScope === "exams") {
          if (keywordSpan) {
            keywordSpan.textContent = `🎯 Yalnızca Çıkmışlar: "${this.activeKeyword}" (${this.filteredQuestions.length} soruda çıktı)`;
          }
        } else if (searchScope === "all") {
          if (keywordSpan) {
            keywordSpan.textContent = `🌐 Tüm Sorular: "${this.activeKeyword}" (${this.filteredQuestions.length} soru bulundu)`;
          }
        } else {
          if (keywordSpan) {
            keywordSpan.textContent = `"${this.activeKeyword}" (${this.filteredQuestions.length} soru)`;
          }
        }
      } else {
        if (keywordSpan) {
          keywordSpan.textContent = `"${this.activeKeyword}"`;
        }
      }
      if (clearBtn) clearBtn.classList.remove("hidden");
    } else if (
      (document.getElementById("categoryFilter")?.value !== "all") ||
      (document.getElementById("yearFilter")?.value !== "all") ||
      (document.getElementById("statusFilter")?.value !== "all") ||
      (this.isPracticeMode && document.getElementById("searchScopeFilter")?.value !== "practice")
    ) {
      badge.classList.remove("hidden");
      if (keywordSpan) {
        const sc = document.getElementById("searchScopeFilter")?.value;
        if (sc === "exams") keywordSpan.textContent = "🎯 Yalnızca Çıkmış Sınavlar";
        else if (sc === "all") keywordSpan.textContent = "🌐 Tüm Soru Havuzu";
        else keywordSpan.textContent = "Seçili Kriterler";
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
    const scSelect = document.getElementById("searchScopeFilter");

    if (kwInput) kwInput.value = "";
    if (clearBtn) clearBtn.classList.add("hidden");
    if (catSelect) catSelect.value = "all";
    if (yrSelect) yrSelect.value = "all";
    if (stSelect) stSelect.value = "all";
    if (scSelect) scSelect.value = "practice";

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

      const sampleOptText = (q.options?.A || "") + " " + (q.options?.B || "");
      const isTurkishOptions = (q.subCategory && q.subCategory.includes("İngilizce -> Türkçe")) ||
                               (q.questionNumber >= 37 && q.questionNumber <= 39) ||
                               /[çğışöüÇĞİŞÖÜ]/.test(sampleOptText);

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

        const interactiveOptText = isTurkishOptions ? optText : this.tokenizeInteractiveText(optText);

        optBtn.innerHTML = `
<div class="flex flex-col w-full min-w-0">
  ${badgeHtml ? `<div class="w-full flex justify-start sm:justify-end mb-2">${badgeHtml}</div>` : ''}
  <div class="flex items-start gap-3 w-full">
    <span class="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 flex items-center justify-center font-bold text-sm group-hover:bg-indigo-600 group-hover:text-white transition-colors mt-0.5">
      ${key}
    </span>
    <div class="flex-1 text-gray-800 dark:text-gray-100 leading-relaxed font-medium break-words min-w-0 pt-1">
      ${interactiveOptText}
    </div>
  </div>
</div>
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

    const turkWords = ['bir', 've', 'i�in', 'olarak', 'bu', 'ile', 'da', 'de', 'daha', 'olan', 'gibi', 'en', '�ok', 'veya', 'ki', 'kadar', 'ise', 'g�re', 'oldu�unu', 'yap�lan', 'edilmesi', 'etmek', '��nk�', 'ancak', 'nedeniyle', 'y�z�nden', 'ra�men', 'gerekir', '�nemli', 'b�y�k', 'taraf�ndan'];
    const words = rawText.toLowerCase().split(/[\s,.'"-]+/);
    let trCount = 0;
    for(let w of words) {
       if (turkWords.includes(w)) trCount++;
    }
    const charMatch = rawText.match(/[�����������]/g);
    if (trCount >= 2 || (trCount >= 1 && charMatch && charMatch.length >= 1) || (charMatch && charMatch.length >= 3)) {
       return rawText; // T�rk�e kelimeleri interaktif yapma!
    }

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
      const isSearchMatch = kw && (cleanForLookup === kw);

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
      const allAnswered = this.activePool.length > 0 && this.activePool.every(item => this.userAnswers[item.id]);
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
    this.lockScroll();
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
    this.unlockScroll();
    document.getElementById("wordInspectorModal")?.classList.add("hidden");
  }

  // Kelimeyi anında ve gecikmesiz telaffuz et
  speakWord(text) {
    if (!text) return;
    const clean = text.trim();

    // 1. Cihazın yerleşik Web Speech API motorunu kullan (0 ms gecikme, çevrimdışı ve anında çalışır)
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = "en-US";
        utterance.rate = 0.92;
        utterance.pitch = 1.0;

        const voices = window.speechSynthesis.getVoices();
        const enVoice = voices.find(v => v.lang && (v.lang === 'en-US' || v.lang.startsWith('en')));
        if (enVoice) {
          utterance.voice = enVoice;
        }

        window.speechSynthesis.speak(utterance);
        return;
      } catch (err) {
        console.warn("Web Speech API hatası, online TTS servisine geçiliyor:", err);
      }
    }

    // 2. Yedek: Google Translate Hızlı TTS Motoru
    this.fallbackSpeak(clean);
  }

  fallbackSpeak(text) {
    if (!this.audioCache) this.audioCache = {};
    const lowerText = text.toLowerCase();
    
    if (this.audioCache[lowerText]) {
      this.audioCache[lowerText].currentTime = 0;
      this.audioCache[lowerText].play().catch(() => {});
      return;
    }

    try {
      const url = "https://translate.googleapis.com/translate_tts?ie=UTF-8&q=" + encodeURIComponent(lowerText) + "&tl=en-US&client=tw-ob";
      const audio = new Audio(url);
      this.audioCache[lowerText] = audio;
      audio.play().catch(e => console.warn("Ses çalma hatası:", e));
    } catch (_) {}
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
    this.lockScroll();
    modal.classList.remove("hidden");
    this.renderLearningPoolList();
  }

  closeLearningPoolModal() {
    this.unlockScroll(); document.getElementById("learningPoolModal")?.classList.add("hidden");
  }

  getExamOccurrenceCount(word) {
    const pool = window.questionRepo ? window.questionRepo.getAll() : [];
    const keywordRegex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&') + '\\b', 'i');
    let count = 0;
    pool.forEach(q => {
      const qText = q.questionText || q.text || "";
      const inQuestion = keywordRegex.test(qText);
      const inPassage = keywordRegex.test(q.passage || "");
      const inOptions = Object.values(q.options || {}).some(opt => keywordRegex.test(String(opt)));
      const inTags = (q.tags || []).some(t => keywordRegex.test(String(t)));
      const inAnalysis = q.wordAnalysis && Object.keys(q.wordAnalysis).some(w => keywordRegex.test(w));
      if (inQuestion || inPassage || inOptions || inTags || inAnalysis) count++;
    });
    return count;
  }

  searchWordInExams(word) {
    this.closeLearningPoolModal();
    if (this.currentView !== "home") {
        this.showHomeView();
    }
    this.startPracticeMode();

    const kwInput = document.getElementById("keywordInput");
    const clearBtn = document.getElementById("clearKeywordBtn");
    const scSelect = document.getElementById("searchScopeFilter");
    
    if (kwInput) {
      kwInput.value = word;
      if (clearBtn) clearBtn.classList.remove("hidden");
    }
    if (scSelect) {
      scSelect.value = "exams";
    }
    
    this.applyFilters();
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
      const occurrenceCount = this.getExamOccurrenceCount(item.word);
      const card = document.createElement("div");
      card.className = "p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col space-y-3";
      card.innerHTML = `
        <div class="flex items-start justify-between">
          <div>
            <div class="flex items-center space-x-2">
              <span class="font-bold text-lg text-indigo-600 dark:text-indigo-400">${item.word}</span>
              <button class="text-gray-400 hover:text-indigo-600" onclick="ydsApp.speakWord('${item.word}')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
              </button>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">${item.meaning}</p>
            ${item.sample ? `<p class="text-xs text-gray-500 italic mt-1 font-serif">"${item.sample}"</p>` : ''}
          </div>
          <button class="text-gray-400 hover:text-rose-500 p-2" onclick="ydsApp.removeFromPool('${item.id}')" title="Havuzdan Kaldır">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
        <div class="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
          <span class="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center">
            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            YDS'de ${occurrenceCount} defa soruldu
          </span>
          <button class="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-xs font-bold rounded-lg hover:bg-indigo-100 transition" onclick="ydsApp.searchWordInExams('${item.word}')">
            Sorulara Git
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
    this.lockScroll();
    modal.classList.remove("hidden");
    this.flashcardIndex = 0;
    this.flashcardFlipped = false;
    this.renderFlashcard();
  }

  closeFlashcardsModal() {
    this.unlockScroll();
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
      const cardInner = document.getElementById("flashcardInner");
      if (cardInner) {
        cardInner.classList.add("flashcard-mastered-out");
      }

      setTimeout(() => {
        if (cardInner) {
          cardInner.classList.remove("flashcard-mastered-out");
          cardInner.classList.remove("flipped");
        }
        this.flashcardFlipped = false;

        const masteredWord = this.learningPool[this.flashcardIndex];
        if (masteredWord) {
          this.masteredWords.push({ word: masteredWord.word, date: new Date().toISOString() });
          this.saveMasteredWords();
          this.learningPool.splice(this.flashcardIndex, 1);
          this.saveLearningPool();
          this.updateLearningPoolBadge();
          this.renderLearningPoolList();
        }

        if (this.learningPool.length === 0) {
          this.closeFlashcardsModal();
          alert("🎉 Tebrikler! Öğrenme havuzundaki tüm kelimeleri başarıyla öğrendiniz.");
          return;
        }

        this.flashcardIndex = this.flashcardIndex % this.learningPool.length;
        this.renderFlashcard();

        if (cardInner) {
          cardInner.classList.add("flashcard-next-in");
          setTimeout(() => cardInner.classList.remove("flashcard-next-in"), 320);
        }
      }, 340);
      return;
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

  toggleExamTimerManually() {
    if (this.isExamTimerPaused) {
      this.resumeExamSmartTimer();
    } else {
      this.pauseExamSmartTimer();
    }
  }

  updateExamSmartTimerUI() {
    const display = document.getElementById("examSmartTimerDisplay");
    const badge = document.getElementById("examSmartTimerBadge");
    const dot = document.getElementById("examSmartTimerDot");
    const statusText = document.getElementById("examSmartTimerStatusText");
    const playIcon = document.getElementById("examTimerPlayIcon");
    const pauseIcon = document.getElementById("examTimerPauseIcon");

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
        statusText.textContent = "⏸️ Süre Duraklatıldı (Manuel/Açıklama)";
        if (playIcon) playIcon.classList.remove("hidden");
        if (pauseIcon) pauseIcon.classList.add("hidden");
      } else {
        badge.className = "flex items-center space-x-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30";
        dot.className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
        statusText.textContent = "🟢 Süre İşliyor";
        if (playIcon) playIcon.classList.add("hidden");
        if (pauseIcon) pauseIcon.classList.remove("hidden");
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
    this.lockScroll();
    const modal = document.getElementById("yearExamModal");
    if (!modal) return;
    this.renderYearExamCards();
    modal.classList.remove("hidden");
  }

  closeYearExamModal() {
    this.unlockScroll();
    document.getElementById("yearExamModal")?.classList.add("hidden");
  }

  renderYearExamCards() {
    const grid = document.getElementById("yearExamCardsGrid");
    if (!grid) return;

    const availableExams = window.questionRepo ? window.questionRepo.getAvailableExams() : [];
    grid.innerHTML = "";

    availableExams.forEach(exam => {
      const examQuestions = window.questionRepo.getByExam(exam.name);
      const totalQ = examQuestions.length;
      
      const answeredInExam = examQuestions.filter(q => this.examAnswers[q.id]);
      const lastSession = this.examSessions[exam.name] || this.examSessions[exam.year];

      const card = document.createElement("div");
      card.className = "p-4 sm:p-5 rounded-2xl bg-white dark:bg-gray-750 border border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-400 transition-all shadow-sm hover:shadow-md flex flex-col justify-between space-y-4 group";

      let statusBadge = "";
      if (lastSession) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">Puan: ${lastSession.score}</span>`;
      } else if (answeredInExam.length > 0) {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">${answeredInExam.length}/${totalQ} Çözüldü</span>`;
      } else {
        statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">Henüz Çözülmedi</span>`;
      }

      let actionButtons = "";
      if (lastSession) {
        actionButtons = `
          <button class="restart-year-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 transition active:scale-95">Baştan Başla</button>
          <button class="view-scorecard-btn px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm shadow-emerald-500/20 active:scale-95 flex items-center space-x-1">
            <span>🏆</span>
            <span>Karneni Gör</span>
          </button>
        `;
      } else if (answeredInExam.length > 0 && answeredInExam.length < totalQ) {
        actionButtons = `
          <button class="restart-year-btn px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 transition active:scale-95">Baştan Başla</button>
          <button class="continue-year-btn px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 active:scale-95">Devam Et</button>
        `;
      } else {
        actionButtons = `
          <button class="start-year-btn px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 active:scale-95">Sınavı Başlat →</button>
        `;
      }

      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <span class="text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-0.5 rounded-lg">${exam.year} ÖSYM</span>
            ${statusBadge}
          </div>
          <h4 class="text-base sm:text-lg font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            ${exam.name}
          </h4>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            ${totalQ} Soru • Orijinal Çıkmış ÖSYM Kitapçığı
          </p>
        </div>

        <div class="pt-2 border-t border-gray-100 dark:border-gray-700/80">
          <div class="flex items-center justify-between mb-2">
            <div class="text-[11px] text-gray-400 flex items-center space-x-1">
              <svg class="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd"/></svg>
              <span>Akıllı Süre Sayacı</span>
            </div>
          </div>
          <div class="flex items-center gap-2 justify-end">
            ${actionButtons}
          </div>
        </div>
      `;

      card.querySelector(".start-year-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.startExamMode(exam.name);
      });
      card.querySelector(".continue-year-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.startExamMode(exam.name);
      });
      card.querySelector(".view-scorecard-btn")?.addEventListener("click", () => {
        this.closeYearExamModal();
        this.showExamScorecard(exam.name);
      });
      card.querySelector(".restart-year-btn")?.addEventListener("click", () => {
        const confirmRestart = confirm("Tüm çözümleriniz ve süreniz sıfırlanacak. Baştan başlamak istediğinize emin misiniz?");
        if (confirmRestart) {
          examQuestions.forEach(q => {
            delete this.examAnswers[q.id];
            delete this.userAnswers[q.id];
          });
          this.saveExamAnswers();
          this.saveUserAnswers();
          
          let states = {};
          try { states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {}; } catch (e) {}
          delete states[exam.name];
          delete states[exam.year];
          localStorage.setItem("yds_exam_timers", JSON.stringify(states));
          try {
            let pos = JSON.parse(localStorage.getItem("yds_exam_positions")) || {};
            delete pos[exam.name];
            delete pos[exam.year];
            localStorage.setItem("yds_exam_positions", JSON.stringify(pos));
          } catch (e) {}

          delete this.examSessions[exam.name];
          delete this.examSessions[exam.year];
          this.saveExamSessions();
          
          this.closeYearExamModal();
          this.startExamMode(exam.name);
        }
      });

      grid.appendChild(card);
    });
  }

  startExamMode(examIdentifier) {
    this.isPracticeMode = false;
    this.isExamMode = true;

    let examQuestions = [];
    let title = "";

    if (typeof examIdentifier === "string" && isNaN(Number(examIdentifier))) {
      examQuestions = window.questionRepo.getByExam(examIdentifier);
      this.currentExamName = examIdentifier;
      this.currentExamYear = examQuestions[0]?.year || null;
      title = examIdentifier;
    } else {
      const year = parseInt(examIdentifier);
      this.currentExamYear = year;
      this.currentExamName = null;
      examQuestions = window.questionRepo.getByYear(year);
      title = `${year} YDS Tam Deneme Sınavı`;
    }

    if (!examQuestions || examQuestions.length === 0) {
      alert(`${examIdentifier} için soru bulunamadı.`);
      return;
    }

    this.activePool = examQuestions;
    this.filteredQuestions = examQuestions;
    
    // Resume timer if exists
    const sessionKey = this.currentExamName || this.currentExamYear;
    let savedTime = 0;
    try { 
        const states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {};
        savedTime = states[sessionKey] || 0;
    } catch (e) {}
    this.examTimerSeconds = savedTime;

    // Find first unsolved question
    this.currentIndex = 0;
    for (let i = 0; i < this.filteredQuestions.length; i++) {
        if (!this.userAnswers[this.filteredQuestions[i].id]) {
            this.currentIndex = i;
            break;
        }
    }

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

    // Soru çözüm ekranını göster
    this.showQuestionView("exam");

    // Üst bannerı göster
    const banner = document.getElementById("examModeBanner");
    const titleEl = document.getElementById("activeExamTitle");
    if (banner) banner.classList.remove("hidden");
    if (titleEl) titleEl.textContent = title;

    this.updateExamProgressBanner();

    // Akıllı süreyi başlat (ilk soru cevaplanmamışsa süre akar, çözülmüşse duraklatılır)
    const currentQ = this.filteredQuestions[this.currentIndex];
    if (currentQ && this.userAnswers[currentQ.id]) {
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
      
      // Save timer progress
      const key = this.currentExamName || this.currentExamYear;
      if (key) {
        let states = {};
        try { states = JSON.parse(localStorage.getItem("yds_exam_timers")) || {}; } catch (e) {}
        states[key] = this.examTimerSeconds;
        localStorage.setItem("yds_exam_timers", JSON.stringify(states));
      }
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
  showExamScorecard(targetExamKey = null) {
    let isViewingPast = false;
    let questions = [];
    let year = 2024;
    let examTitle = "";

    if (targetExamKey) {
      // Geçmiş tamamlanmış bir sınavın karnesini görüntülüyoruz
      isViewingPast = true;
      questions = window.questionRepo ? window.questionRepo.getByExam(targetExamKey) : [];
      if (!questions || questions.length === 0) {
        questions = window.questionRepo ? window.questionRepo.getByYear(parseInt(targetExamKey) || 2024) : [];
      }
      year = questions[0]?.year || 2024;
      examTitle = targetExamKey;
      this.currentExamName = targetExamKey;
      this.currentExamYear = year;
    } else {
      // Aktif sınav oturumunu sonlandırıp karneye bakıyoruz
      if (this.isExamMode) {
        const confirmFinish = confirm(
          "⚠️ Deneme Sınavını Sonlandırmak Üzeresiniz!\n\n" +
          "Karnenizi görüntülediğinizde deneme sınavınız sonlandırılacak, resmi puanınız ve analizleriniz hesaplanacaktır. " +
          "Daha sonra kaldığınız yerden teste devam edemezsiniz.\n\n" +
          "Sınavı bitirip sonuçlarınızı görmek istiyor musunuz?"
        );
        if (!confirmFinish) {
          return;
        }
      }

      this.stopExamSmartTimer();
      this.isExamMode = false;
      document.getElementById("examModeBanner")?.classList.add("hidden");

      year = this.currentExamYear || (this.filteredQuestions[0]?.year) || 2024;
      questions = this.filteredQuestions.length > 0 ? this.filteredQuestions : (window.questionRepo ? window.questionRepo.getByYear(year) : []);
      examTitle = this.currentExamName || `${year} YDS Tam Deneme Sınavı`;
    }

    this.lockScroll();

    const totalQuestions = questions.length || 80;
    const answeredList = questions.map(q => this.examAnswers[q.id] || this.userAnswers[q.id]).filter(Boolean);
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

    if (nameEl) nameEl.textContent = examTitle;
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

    // Süre hesabı
    const sessionKey = this.currentExamName || `${year} YDS`;
    let durationSecs = this.examTimerSeconds || 0;
    if (isViewingPast && this.examSessions[sessionKey]) {
      durationSecs = this.examSessions[sessionKey].netSeconds || 0;
    }

    const netTimeStr = this.formatDuration(durationSecs);
    if (netTimeEl) netTimeEl.textContent = netTimeStr;

    const avgSeconds = totalAnswered > 0 ? Math.round(durationSecs / totalAnswered) : 0;
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
        const ans = this.examAnswers[q.id] || this.userAnswers[q.id];
        if (ans?.isCorrect) {
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

    // Oturumu kaydet (aktif sınav tamamlandığında)
    if (!isViewingPast) {
      this.examSessions[sessionKey] = {
        exam: sessionKey,
        year: year,
        score: ydsScore,
        correct: correctCount,
        wrong: wrongCount,
        blank: blankCount,
        netSeconds: durationSecs,
        timestamp: Date.now()
      };
      this.saveExamSessions();
      this.renderYearExamCards();
    }

    // Reklam gösterimi
    if (!isViewingPast) {
      window.ydsAdService?.showInterstitial();
    }

    // Modalı aç
    document.getElementById("examScorecardModal")?.classList.remove("hidden");
  }

  closeExamScorecard() {
    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");

    // Sınav modundan tamamen çık ve ana menüye dön
    this.stopExamSmartTimer();
    this.isExamMode = false;
    this.currentExamYear = null;
    document.getElementById("examModeBanner")?.classList.add("hidden");
    
    const yrSelect = document.getElementById("yearFilter");
    if (yrSelect) yrSelect.value = "all";
    this.applyFilters();
    this.showHomeView();
  }

  reviewWrongQuestions() {
    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");
    this.stopExamSmartTimer();
    this.isExamMode = false;
    document.getElementById("examModeBanner")?.classList.add("hidden");

    const target = this.currentExamName || this.currentExamYear || 2024;
    const questions = this.currentExamName 
      ? window.questionRepo.getByExam(this.currentExamName)
      : window.questionRepo.getByYear(this.currentExamYear || 2024);

    const wrongOnly = questions.filter(q => (this.examAnswers[q.id] || this.userAnswers[q.id]) && !(this.examAnswers[q.id] || this.userAnswers[q.id]).isCorrect);
    if (wrongOnly.length === 0) {
      alert("Tebrikler! Bu denemede yanlış yaptığınız soru bulunmuyor.");
      this.showHomeView();
      return;
    }

    this.showQuestionView("practice");
    this.filteredQuestions = wrongOnly;
    this.currentIndex = 0;
    this.renderQuestion();
    this.renderQuestionGrid();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  restartCurrentExam() {
    const confirmRestart = confirm("Bu deneme sınavındaki tüm cevaplarınızı sıfırlayıp baştan başlamak istediğinize emin misiniz?");
    if (!confirmRestart) return;

    this.unlockScroll();
    document.getElementById("examScorecardModal")?.classList.add("hidden");
    const target = this.currentExamName || this.currentExamYear || 2021;
    const questions = this.currentExamName 
      ? window.questionRepo.getByExam(this.currentExamName)
      : window.questionRepo.getByYear(target);

    // Bu sınavın cevaplarını sil
    questions.forEach(q => {
      delete this.userAnswers[q.id];
      delete this.examAnswers[q.id];
    });
    this.saveUserAnswers();
    this.saveExamAnswers();

    delete this.examSessions[this.currentExamName];
    delete this.examSessions[target];
    this.saveExamSessions();

    this.startExamMode(target);
  }

  // --- Filtre Dropdown Doldurma ---
  populateFilterDropdowns() {
    const catSelect = document.getElementById("categoryFilter");
    const yrSelect = document.getElementById("yearFilter");

    if (catSelect) {
      catSelect.innerHTML = '<option value="all">Tüm Konular</option>';
      const categories = [...new Set(this.allQuestions.map(q => q.category).filter(Boolean))];
      categories.forEach(cat => {
        const opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        catSelect.appendChild(opt);
      });
    }

    if (yrSelect) {
      yrSelect.innerHTML = '<option value="all">Tüm Yıllar</option>';
      const years = [...new Set(this.allQuestions.map(q => q.year).filter(y => typeof y === 'number'))].sort((a, b) => b - a);
      years.forEach(yr => {
        const opt = document.createElement("option");
        opt.value = yr;
        opt.textContent = `${yr} Yılı`;
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
        this.unlockScroll();
        if (statusBox) statusBox.classList.add("hidden");
      }, 1500);

    } catch (err) {
      console.error("PDF yükleme hatası:", err);
      alert("PDF işlenirken bir hata oluştu: " + err.message);
      if (statusBox) statusBox.classList.add("hidden");
    }
  }

  // --- Ana Menü, Sayfa Gezinimi ve Dashboard ---
  goBack() {
    if (this.currentView === "report" && this.previousView === "question") {
      this.showQuestionView(this.isExamMode ? "exam" : "practice");
    } else if (this.isExamMode && this.currentView === "question") {
      this.exitExamMode();
    } else {
      this.showHomeView();
    }
  }

  saveExamCurrentProgress() {
    if (!this.isExamMode) return;
    const sessionKey = this.currentExamName || this.currentExamYear;
    if (sessionKey) {
      try {
        const timers = JSON.parse(localStorage.getItem("yds_exam_timers")) || {};
        timers[sessionKey] = this.examTimerSeconds;
        localStorage.setItem("yds_exam_timers", JSON.stringify(timers));

        const positions = JSON.parse(localStorage.getItem("yds_exam_positions")) || {};
        positions[sessionKey] = this.currentIndex;
        localStorage.setItem("yds_exam_positions", JSON.stringify(positions));
      } catch (e) {}
    }
  }

  handleHeaderHomeClick() {
    if (this.isExamMode && this.currentView === "question") {
      this.saveExamCurrentProgress();
      this.pauseExamSmartTimer();
      this.showHomeView();
    } else {
      this.showHomeView();
    }
  }

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

    // Header ve Filtre Çubuğu: Ana Menü tertemiz ve sade olmalı
    document.getElementById("headerSearchContainer")?.classList.add("hidden");
    document.getElementById("filterBarContainer")?.classList.add("hidden");
    document.getElementById("searchScopeFilterWrapper")?.classList.add("hidden");
    document.getElementById("searchScopeFilterWrapper")?.classList.remove("flex");
    document.getElementById("headerBackHomeBtn")?.classList.add("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("inline-flex");

    this.previousView = this.currentView;
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

    // Header ve Filtre Çubuğu: Soru Çözüm Modunda Arama ve Filtreler aktif
    document.getElementById("headerSearchContainer")?.classList.remove("hidden");
    document.getElementById("filterBarContainer")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.add("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("inline-flex");

    const yearWrapper = document.getElementById("yearFilterWrapper");
    if (yearWrapper) {
      if (mode === "exam") {
        yearWrapper.classList.add("hidden");
        yearWrapper.classList.remove("flex");
      } else {
        yearWrapper.classList.remove("hidden");
        yearWrapper.classList.add("flex");
      }
    }

    const scopeWrapper = document.getElementById("searchScopeFilterWrapper");
    if (scopeWrapper) {
      if (mode === "practice") {
        scopeWrapper.classList.remove("hidden");
        scopeWrapper.classList.add("flex");
      } else {
        scopeWrapper.classList.add("hidden");
        scopeWrapper.classList.remove("flex");
      }
    }

    this.previousView = this.currentView;
    this.currentView = "question";

    const modeBadge = document.getElementById("questionViewModeBadge");
    if (modeBadge) {
      if (mode === "practice") {
        modeBadge.textContent = "⚡ Alıştırma Modu (Bağımsız Havuz)";
        modeBadge.className = "px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300";
      } else if (mode === "exam") {
        modeBadge.textContent = `📝 ${this.currentExamName || (this.currentExamYear ? this.currentExamYear + ' YDS' : 'YDS Tam Deneme')}`;
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

    // Header ve Filtre Çubuğu: Rapor ekranında arama & filtre yok, Ana Menüye dönüş var
    document.getElementById("headerSearchContainer")?.classList.add("hidden");
    document.getElementById("filterBarContainer")?.classList.add("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.remove("hidden");
    document.getElementById("headerBackHomeBtn")?.classList.add("inline-flex");
    document.getElementById("headerBrandTitle")?.classList.remove("hidden");
    document.getElementById("navReportBtn")?.classList.add("hidden");
    document.getElementById("navReportBtn")?.classList.remove("inline-flex");

    this.previousView = this.currentView;
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

    const repLearnedTotal = document.getElementById("repLearnedTotal");
    const repLearnedWeek = document.getElementById("repLearnedWeek");
    
    if (repLearnedTotal) repLearnedTotal.textContent = this.masteredWords.length;
    
    if (repLearnedWeek) {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const weeklyCount = this.masteredWords.filter(item => {
         if (!item.date) return false;
         return new Date(item.date) >= oneWeekAgo;
      }).length;
      repLearnedWeek.textContent = weeklyCount;
    }

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
    this.activePool = practiceQuestions;

    // Preserve session state if already active
    if (!this.practiceSessionActive || !this.filteredQuestions || this.filteredQuestions.length === 0) {
      const shuffled = [...practiceQuestions].sort(() => Math.random() - 0.5);
      this.filteredQuestions = shuffled;
      this.currentIndex = 0;
      this.savedUnfilteredIndex = 0;
      this.practiceSessionActive = true;
    } else {
      // Restore previously saved unfiltered index if returning from report etc.
      this.currentIndex = this.savedUnfilteredIndex || this.currentIndex || 0;
    }

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
    const scSelect = document.getElementById("searchScopeFilter");
    if (scSelect) scSelect.value = "practice";

    this.showQuestionView("practice");
    this.renderQuestion();
    this.renderQuestionGrid();
  }

  // --- Kullanıcı İsmi ve Onboarding ---
  openNameModal() {
    this.lockScroll();
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
    this.unlockScroll();
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
    this.lockScroll();
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
    this.unlockScroll();
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
    localStorage.removeItem("yds_practice_answers");
    localStorage.removeItem("yds_exam_answers");
    localStorage.removeItem(STORAGE_KEYS.EXAM_SESSIONS);
    localStorage.removeItem("yds_tactics_unlocked");
    localStorage.removeItem("yds_mastered_words");

    this.practiceAnswers = {};
    this.examAnswers = {};
    this.examSessions = {};
    this.masteredWords = [];
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
    document.getElementById("searchScopeFilter")?.addEventListener("change", () => this.applyFilters());
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
      this.lockScroll();
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
