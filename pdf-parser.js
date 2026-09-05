// YDS PDF Ayrıştırıcı (In-Browser PDF Parser with PDF.js)
// ÖSYM ve YDS formatındaki PDF kitapçıklarından soruları, şıkları ve varsa cevap anahtarlarını ayıklar.

class YDSPDFParser {
  constructor() {
    this.pdfjsLib = window['pdfjs-dist/build/pdf'];
    if (this.pdfjsLib) {
      this.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    }
  }

  // PDF dosyasından metinleri sayfa sayfa oku
  async extractTextFromPDF(file) {
    if (!this.pdfjsLib) {
      this.pdfjsLib = window['pdfjs-dist/build/pdf'];
    }

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = this.pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = "";
    const pageTexts = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      
      // Satırları dikey konumlarına (y ekseni) göre sıralayarak düzgün metin elde et
      const items = textContent.items;
      let lastY = null;
      let pageStr = "";

      for (let item of items) {
        if (lastY === null || Math.abs(item.transform[5] - lastY) > 5) {
          pageStr += "\n" + item.str;
        } else {
          pageStr += " " + item.str;
        }
        lastY = item.transform[5];
      }

      pageTexts.push(pageStr);
      fullText += pageStr + "\n";
    }

    return { fullText, pageTexts, numPages: pdf.numPages };
  }

  // Metinden YDS Sorularını Ayrıştır
  parseQuestions(fullText, examName = "İçe Aktarılan YDS Sınavı", year = new Date().getFullYear()) {
    const questions = [];
    
    // Cevap anahtarını yakalamaya çalış (Örn: "CEVAP ANAHTARI: 1. A 2. C ..." veya "1-A 2-B")
    const answerKey = this.extractAnswerKey(fullText);

    // Soruları ayırmak için regex: 1'den 80'e kadar soru başlangıçları
    // Örnek: "1.", "2.", "45." gibi satır başı numaralandırmalar
    const lines = fullText.split("\n").map(l => l.trim()).filter(l => l.length > 0);
    
    let currentQuestion = null;
    let currentOption = null;
    let currentPassage = "";
    let questionCounter = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Paragraf yönergesi kontrolü (Örn: "43. - 46. soruları aşağıdaki parçaya göre...")
      const passageMatch = line.match(/(\d{1,2})\s*[-–]\s*(\d{1,2})\.?\s*soruları\s+aşağıdaki/i);
      if (passageMatch) {
        currentPassage = "";
        // Bir sonraki satırları paragraf olarak topla
        let j = i + 1;
        while (j < lines.length && !lines[j].match(/^\d{1,2}\./)) {
          currentPassage += lines[j] + " ";
          j++;
        }
        i = j - 1;
        continue;
      }

      // Soru numarası kontrolü (Örn: "1. Scientists have recently..." veya "1.")
      const qMatch = line.match(/^(\d{1,2})\.\s*(.*)$/);
      if (qMatch && parseInt(qMatch[1], 10) > 0 && parseInt(qMatch[1], 10) <= 80) {
        const qNum = parseInt(qMatch[1], 10);
        
        // Önceki soru bitti, listeye ekle
        if (currentQuestion && currentQuestion.questionText && Object.keys(currentQuestion.options).length >= 2) {
          questions.push(this.finalizeQuestion(currentQuestion, answerKey));
        }

        currentQuestion = {
          id: `imported-${Date.now()}-${qNum}`,
          exam: examName,
          year: parseInt(year, 10) || 2024,
          term: "PDF Aktarımı",
          questionNumber: qNum,
          category: this.guessCategory(qNum),
          subCategory: "YDS Sorusu",
          difficulty: "Orta",
          passage: currentPassage || "",
          questionText: qMatch[2] ? qMatch[2].trim() : "",
          options: {},
          correctAnswer: answerKey[qNum] || "A",
          explanation: "PDF üzerinden içe aktarılan soru. Sorudaki herhangi bir kelimeye tıklayarak Türkçe anlamına bakabilir ve kelime havuzuna ekleyebilirsiniz.",
          tags: ["pdf_import"]
        };
        currentOption = null;
        continue;
      }

      // Şık kontrolü (A), B), C), D), E) veya A., B., C.)
      const optMatch = line.match(/^([A-E])[\.\)]\s*(.*)$/i);
      if (optMatch && currentQuestion) {
        currentOption = optMatch[1].toUpperCase();
        currentQuestion.options[currentOption] = optMatch[2].trim();
        continue;
      }

      // Şık devamı mı yoksa soru metni devamı mı?
      if (currentQuestion) {
        if (currentOption && currentQuestion.options[currentOption]) {
          // Şıkkın devamı
          currentQuestion.options[currentOption] += " " + line;
        } else {
          // Soru metninin devamı
          currentQuestion.questionText += (currentQuestion.questionText ? " " : "") + line;
        }
      }
    }

    // Son soruyu ekle
    if (currentQuestion && currentQuestion.questionText && Object.keys(currentQuestion.options).length >= 2) {
      questions.push(this.finalizeQuestion(currentQuestion, answerKey));
    }

    return questions;
  }

  // Cevap anahtarını metinden çek
  extractAnswerKey(text) {
    const keys = {};
    // "1-A 2-B" veya "1.A 2.B" veya "1. A  2. B" eşleşmeleri
    const regex = /(\d{1,2})\s*[\.-]?\s*([A-E])\b/gi;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const qNum = parseInt(match[1], 10);
      const ans = match[2].toUpperCase();
      if (qNum >= 1 && qNum <= 80) {
        keys[qNum] = ans;
      }
    }
    return keys;
  }

  // Soru tipini YDS soru numarasına göre tahmin et (Klasik ÖSYM Dağılımı)
  guessCategory(num) {
    if (num >= 1 && num <= 6) return "Kelime Bilgisi";
    if (num >= 7 && num <= 16) return "Dilbilgisi";
    if (num >= 17 && num <= 26) return "Cloze Test";
    if (num >= 27 && num <= 36) return "Cümle Tamamlama";
    if (num >= 37 && num <= 42) return "Çeviri";
    if (num >= 43 && num <= 62) return "Paragraf / Okuduğunu Anlama";
    if (num >= 63 && num <= 67) return "Diyalog Tamamlama";
    if (num >= 68 && num <= 71) return "Anlamca En Yakın Cümle (Restatement)";
    if (num >= 72 && num <= 75) return "Paragraf Tamamlama";
    if (num >= 76 && num <= 80) return "Anlatım Bütünlüğünü Bozan Cümle";
    return "Genel YDS Sorusu";
  }

  finalizeQuestion(q, answerKey) {
    if (answerKey[q.questionNumber]) {
      q.correctAnswer = answerKey[q.questionNumber];
    }
    // Tag olarak metindeki önemli kelimeleri ekle
    const words = (q.questionText || "").toLowerCase().split(/\W+/).filter(w => w.length > 4);
    q.tags = [...new Set(["pdf_import", ...words.slice(0, 5)])];
    return q;
  }

  // Elle girilen cevap anahtarını eşleştir (Örn: "A, B, C, D..." veya "1-A 2-B...")
  applyCustomAnswerKey(questions, answerKeyString) {
    const parsedKey = this.extractAnswerKey(answerKeyString);
    
    // Eğer basitçe "A B C D E" gibi boşluk veya virgülle girilmişse
    if (Object.keys(parsedKey).length === 0) {
      const letters = answerKeyString.match(/[A-E]/gi);
      if (letters) {
        letters.forEach((letter, idx) => {
          parsedKey[idx + 1] = letter.toUpperCase();
        });
      }
    }

    // Sorulara uygula
    questions.forEach(q => {
      if (parsedKey[q.questionNumber]) {
        q.correctAnswer = parsedKey[q.questionNumber];
      }
    });

    return questions;
  }
}

window.ydsPDFParser = new YDSPDFParser();
