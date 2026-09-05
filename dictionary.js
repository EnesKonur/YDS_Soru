// YDS Temel ve Akademik Kelime Sözlüğü (Çevrimdışı Hızlı Erişim)
// Bu sözlük temel ve YDS'de sık çıkan kelimeleri içerir.
// Sözlükte bulunmayan kelimeler için otomatik çeviri API'si (MyMemory / LibreTranslate) fallback olarak devreye girer.

const BUILTIN_DICTIONARY = {
  // Temel ve Günlük Kelimeler
  "apple": { tr: "elma", type: "isim", sample: "An apple a day keeps the doctor away." },
  "fruit": { tr: "meyve, ürün", type: "isim", sample: "Citrus fruits are rich in vitamin C." },
  "food": { tr: "yiyecek, gıda", type: "isim", sample: "Healthy food is essential for well-being." },
  "agriculture": { tr: "tarım, ziraat", type: "isim", sample: "Modern agriculture relies heavily on technology." },
  "harvest": { tr: "hasat, hasat etmek", type: "isim/fiil", sample: "Farmers expect a bountiful harvest this year." },
  "crop": { tr: "ekin, mahsul", type: "isim", sample: "Severe droughts damaged the wheat crop." },
  
  // YDS Sık Çıkan Akademik Fiiller (Academic Verbs)
  "abandon": { tr: "terk etmek, vazgeçmek", type: "fiil", sample: "They had to abandon their car in the snow." },
  "accelerate": { tr: "hızlanmak, hızlandırmak", type: "fiil", sample: "The government took steps to accelerate economic growth." },
  "accomplish": { tr: "başarmak, tamamlamak", type: "fiil", sample: "She accomplished all her academic goals." },
  "accumulate": { tr: "biriktirmek, toplanmak", type: "fiil", sample: "Dust tends to accumulate in neglected corners." },
  "acquire": { tr: "edinmek, kazanmak, elde etmek", type: "fiil", sample: "Children acquire language at an astonishing speed." },
  "adapt": { tr: "uyum sağlamak, adapte olmak", type: "fiil", sample: "Animals must adapt to changing climates to survive." },
  "allocate": { tr: "tahsis etmek, ayırmak (kaynak, bütçe)", type: "fiil", sample: "More funds were allocated to cancer research." },
  "alter": { tr: "değiştirmek, başkalaşmak", type: "fiil", sample: "Nothing can alter the facts of the matter." },
  "anticipate": { tr: "öngörmek, tahmin etmek, beklemek", type: "fiil", sample: "Economists anticipate a rise in inflation." },
  "assess": { tr: "değerlendirmek, ölçmek", type: "fiil", sample: "The committee will assess the environmental impact." },
  "attain": { tr: "ulaşmak, elde etmek", type: "fiil", sample: "He attained the highest rank in the organization." },
  "boost": { tr: "artırmak, canlandırmak, yükseltmek", type: "fiil", sample: "Vitamin D can boost your immune system." },
  "clarify": { tr: "açıklığa kavuşturmak, netleştirmek", type: "fiil", sample: "The minister clarified the new policy details." },
  "coincide": { tr: "aynı zamana denk gelmek, uyuşmak", type: "fiil", sample: "The strike coincided with the peak holiday season." },
  "collaborate": { tr: "iş birliği yapmak", type: "fiil", sample: "Scientists collaborate across borders." },
  "compensate": { tr: "tazmin etmek, telafi etmek", type: "fiil", sample: "Nothing can compensate for the loss of a life." },
  "comprehend": { tr: "kavramak, anlamak", type: "fiil", sample: "He failed to comprehend the seriousness of the issue." },
  "conduct": { tr: "yürütmek, gerçekleştirmek (deney, araştırma)", type: "fiil", sample: "They conducted a series of clinical trials." },
  "confine": { tr: "sınırlandırmak, hapsetmek", type: "fiil", sample: "The infection was confined to the upper respiratory tract." },
  "confirm": { tr: "doğrulamak, onaylamak", type: "fiil", sample: "X-rays confirmed the fracture in his arm." },
  "conform": { tr: "uymak, itaat etmek", type: "fiil", sample: "All products must conform to safety regulations." },
  "consume": { tr: "tüketmek, harcamak", type: "fiil", sample: "The vehicle consumes less fuel on highways." },
  "contribute": { tr: "katkıda bulunmak, sebep olmak", type: "fiil", sample: "Stress contributes to high blood pressure." },
  "curtail": { tr: "kısmak, kısıtlamak, azaltmak", type: "fiil", sample: "Spending was curtailed due to the recession." },
  "decline": { tr: "azalmak, gerilemek; reddetmek", type: "fiil/isim", sample: "The population began to decline in the 1990s." },
  "demonstrate": { tr: "göstermek, kanıtlamak, sergilemek", type: "fiil", sample: "The research demonstrates a link between diet and health." },
  "depict": { tr: "tasvir etmek, betimlemek", type: "fiil", sample: "The painting depicts a tranquil mountain landscape." },
  "deprive": { tr: "yoksun bırakmak, mahrum etmek", type: "fiil", sample: "Prisoners were deprived of basic medical care." },
  "deteriorate": { tr: "kötüleşmek, bozulmak", type: "fiil", sample: "His health deteriorated rapidly overnight." },
  "diminish": { tr: "azalmak, eksilmek, küçülmek", type: "fiil", sample: "The pain will gradually diminish over time." },
  "disrupt": { tr: "aksatmak, kesintiye uğratmak, düzeni bozmak", type: "fiil", sample: "The storm disrupted rail and flight services." },
  "eliminate": { tr: "ortadan kaldırmak, elemek, yok etmek", type: "fiil", sample: "Vaccines helped eliminate smallpox worldwide." },
  "emerge": { tr: "ortaya çıkmak, belirmek", type: "fiil", sample: "New evidence emerged during the investigation." },
  "enhance": { tr: "artırmak, geliştirmek, zenginleştirmek", type: "fiil", sample: "Exercise can enhance both physical and mental health." },
  "evaluate": { tr: "değerlendirmek, paha biçmek", type: "fiil", sample: "Teachers evaluate students' performance fairly." },
  "exaggerate": { tr: "abartmak", type: "fiil", sample: "The media often exaggerates the danger." },
  "exceed": { tr: "aşmak, sınırın üzerine çıkmak", type: "fiil", sample: "Do not exceed the recommended daily dose." },
  "exhaust": { tr: "tüketmek, bitirmek; çok yormak", type: "fiil", sample: "They exhausted all natural resources in the region." },
  "exhibit": { tr: "sergilemek, göstermek", type: "fiil", sample: "The patient exhibited symptoms of mild pneumonia." },
  "expand": { tr: "genişlemek, büyümek, yayılmak", type: "fiil", sample: "Metals expand when heated." },
  "exploit": { tr: "sömürmek; faydalanmak, istifade etmek", type: "fiil", sample: "The company exploited natural mineral reserves." },
  "fluctuate": { tr: "dalgalanmak, istikrarsız olmak", type: "fiil", sample: "Oil prices fluctuate according to global demand." },
  "foster": { tr: "teşvik etmek, geliştirmek, büyütmek", type: "fiil", sample: "The program aims to foster international cooperation." },
  "generate": { tr: "üretmek, oluşturmak, meydana getirmek", type: "fiil", sample: "Wind turbines generate clean electrical power." },
  "hinder": { tr: "engellemek, aksatmak, mani olmak", type: "fiil", sample: "Dense fog hindered the rescue operations." },
  "implement": { tr: "uygulamaya koymak, yürürlüğe sokmak", type: "fiil", sample: "They plan to implement new educational reforms." },
  "inhibit": { tr: "engellemek, dizginlemek, yavaşlatmak", type: "fiil", sample: "Cold temperatures inhibit bacterial growth." },
  "initiate": { tr: "başlatmak, önayak olmak", type: "fiil", sample: "The government initiated peace negotiations." },
  "innovate": { tr: "yenilik yapmak", type: "fiil", sample: "Companies must innovate constantly to remain competitive." },
  "maintain": { tr: "sürdürmek, korumak; iddia etmek", type: "fiil", sample: "He struggled to maintain his composure." },
  "mitigate": { tr: "hafifletmek, yatıştırmak, azaltmak", type: "fiil", sample: "Forests help mitigate the impact of global warming." },
  "neglect": { tr: "ihmal etmek, savsaklamak", type: "fiil", sample: "Never neglect safety procedures in laboratories." },
  "obtain": { tr: "elde etmek, edinmek, temin etmek", type: "fiil", sample: "You must obtain written permission before entering." },
  "overcome": { tr: "üstesinden gelmek, yenmek", type: "fiil", sample: "She overcame immense difficulties to graduate." },
  "perceive": { tr: "algılamak, farkına varmak", type: "fiil", sample: "Children perceive the world differently from adults." },
  "predict": { tr: "öngörmek, tahmin etmek", type: "fiil", sample: "It is difficult to predict earthquakes accurately." },
  "prevent": { tr: "önlemek, engel olmak", type: "fiil", sample: "Clean drinking water prevents waterborne diseases." },
  "promote": { tr: "teşvik etmek, desteklemek; terfi ettirmek", type: "fiil", sample: "The campaign promotes healthy eating habits." },
  "pursue": { tr: "kovalamak, takip etmek, sürdürmek", type: "fiil", sample: "She decided to pursue a medical career." },
  "reconcile": { tr: "uzlaştırmak, arayı bulmak", type: "fiil", sample: "It is hard to reconcile these opposing opinions." },
  "reinforce": { tr: "güçlendirmek, pekiştirmek", type: "fiil", sample: "The results reinforce our initial hypothesis." },
  "relieve": { tr: "rahatlatmak, dindirmek", type: "fiil", sample: "The medication quickly relieved his headache." },
  "retain": { tr: "muhafaza etmek, elde tutmak", type: "fiil", sample: "The soil retains moisture exceptionally well." },
  "reveal": { tr: "açığa çıkarmak, gözler önüne sermek", type: "fiil", sample: "The study revealed unexpected facts about ocean depths." },
  "stimulate": { tr: "uyarmak, canlandırmak, harekete geçirmek", type: "fiil", sample: "Coffee can stimulate mental alertness." },
  "sustain": { tr: "sürdürmek, devam ettirmek, ayakta tutmak", type: "fiil", sample: "The ecosystem cannot sustain such high pollution." },
  "terminate": { tr: "sonlandırmak, bitirmek", type: "fiil", sample: "The contract was terminated due to breach of terms." },
  "trigger": { tr: "tetiklemek, başlatmak, yol açmak", type: "fiil", sample: "Allergies can trigger severe asthma attacks." },
  "undermine": { tr: "baltalamak, zayıflatmak, sarsmak", type: "fiil", sample: "Corruption undermines public confidence in institutions." },
  "utilize": { tr: "kullanmak, yararlanmak, istifade etmek", type: "fiil", sample: "Solar panels utilize sunlight to create electricity." },

  // Phrasal Verbs (YDS'nin Olmazsa Olmazları)
  "account for": { tr: "oluşturmak (oran); açıklamak, sebebi olmak", type: "phrasal verb", sample: "Computers account for 25% of our total exports." },
  "bring about": { tr: "yol açmak, neden olmak, sebep olmak", type: "phrasal verb", sample: "The industrial revolution brought about major social changes." },
  "bring up": { tr: "büyütmek (çocuk); gündeme getirmek", type: "phrasal verb", sample: "She was brought up in a small coastal village." },
  "call off": { tr: "iptal etmek", type: "phrasal verb", sample: "The football match was called off because of heavy fog." },
  "carry on": { tr: "devam etmek, sürdürmek", type: "phrasal verb", sample: "Carry on with your work until I come back." },
  "carry out": { tr: "yürütmek, gerçekleştirmek, uygulamak", type: "phrasal verb", sample: "Researchers carried out an extensive survey." },
  "catch up with": { tr: "yetişmek, aynı seviyeye gelmek", type: "phrasal verb", sample: "He ran fast to catch up with his classmates." },
  "come across": { tr: "karşılaşmak, rastlamak", type: "phrasal verb", sample: "I came across an ancient coin in the garden." },
  "cope with": { tr: "başa çıkmak, üstesinden gelmek", type: "phrasal verb", sample: "It is challenging to cope with extreme stress." },
  "cut down on": { tr: "kısmak, azaltmak", type: "phrasal verb", sample: "Doctors advised him to cut down on sugar." },
  "do away with": { tr: "yürürlükten kaldırmak, yok etmek", type: "phrasal verb", sample: "Many countries did away with capital punishment." },
  "fall behind": { tr: "geride kalmak", type: "phrasal verb", sample: "If you miss school, you might fall behind in math." },
  "figure out": { tr: "anlamak, çözmek, kavramak", type: "phrasal verb", sample: "We need to figure out how this machine works." },
  "get rid of": { tr: "kurtulmak, elden çıkarmak", type: "phrasal verb", sample: "He wants to get rid of his old furniture." },
  "give in": { tr: "teslim olmak, boyun eğmek", type: "phrasal verb", sample: "The rebels finally gave in after prolonged siege." },
  "give up": { tr: "bırakmak, vazgeçmek, pes etmek", type: "phrasal verb", sample: "Never give up on your dreams." },
  "keep up with": { tr: "ayak uydurmak, gerisinde kalmamak", type: "phrasal verb", sample: "It is hard to keep up with rapid technological changes." },
  "look down on": { tr: "küçümsemek, hor görmek", type: "phrasal verb", sample: "Never look down on someone with less education." },
  "look forward to": { tr: "dört gözle beklemek", type: "phrasal verb", sample: "I look forward to meeting you next week." },
  "make up for": { tr: "telafi etmek, telafi yoluna gitmek", type: "phrasal verb", sample: "Hard work can make up for lack of innate talent." },
  "put off": { tr: "ertelemek", type: "phrasal verb", sample: "Don't put off until tomorrow what you can do today." },
  "put up with": { tr: "katlanmak, tahammül etmek", type: "phrasal verb", sample: "I cannot put up with this unbearable noise anymore." },
  "run out of": { tr: "tükenmek, bitirmek", type: "phrasal verb", sample: "The hikers ran out of clean water in the desert." },
  "set up": { tr: "kurmak, tesis etmek", type: "phrasal verb", sample: "They set up a new scientific laboratory." },
  "take after": { tr: "benzemek (ebeveyne/akrabaya)", type: "phrasal verb", sample: "He takes after his father in temperament." },
  "turn down": { tr: "reddetmek; kısmak (ses, ısı)", type: "phrasal verb", sample: "She turned down the prestigious job offer in Paris." },
  "wipe out": { tr: "yok etmek, kökünü kazımak", type: "phrasal verb", sample: "An epidemic wiped out nearly half the village." },

  // Akademik Sıfatlar (Academic Adjectives)
  "abundant": { tr: "bol, bereketli, çok sayıda", type: "sıfat", sample: "Rainfall is abundant in tropical rainforests." },
  "accurate": { tr: "doğru, kesin, hatasız", type: "sıfat", sample: "The thermometer provides accurate measurements." },
  "adequate": { tr: "yeterli, kafi", type: "sıfat", sample: "We need adequate supplies for the winter trip." },
  "adverse": { tr: "olumsuz, zıt, zararlı", type: "sıfat", sample: "Adverse weather conditions cancelled the expedition." },
  "ambiguous": { tr: "muğlak, belirsiz, birden çok anlama gelen", type: "sıfat", sample: "The wording of the law was ambiguous." },
  "chronic": { tr: "kronik, sürekli, müzmin", type: "sıfat", sample: "He suffers from chronic back pain." },
  "compatible": { tr: "uyumlu, bağdaşan", type: "sıfat", sample: "This software is compatible with both Mac and Windows." },
  "crucial": { tr: "can alıcı, hayati derecede önemli", type: "sıfat", sample: "Early detection is crucial in treating cancer." },
  "deprived": { tr: "yoksun, mahrum", type: "sıfat", sample: "Children in deprived areas need extra support." },
  "detrimental": { tr: "zararlı, hasar veren", type: "sıfat", sample: "Excessive stress is detrimental to heart health." },
  "distinct": { tr: "belirgin, farklı, ayrı", type: "sıfat", sample: "The twin sisters have distinct personalities." },
  "diverse": { tr: "çeşitli, türlü, farklı", type: "sıfat", sample: "The Amazon basin has a diverse ecosystem." },
  "eligible": { tr: "uygun, nitelikli, şartları taşıyan", type: "sıfat", sample: "Only citizens over 18 are eligible to vote." },
  "essential": { tr: "elzem, zorunlu, temel", type: "sıfat", sample: "Water is essential for all living organisms." },
  "evident": { tr: "açık, aşikar, besbelli", type: "sıfat", sample: "It was evident that she had prepared thoroughly." },
  "indispensable": { tr: "vazgeçilmez, olmazsa olmaz", type: "sıfat", sample: "Smartphones have become indispensable in modern life." },
  "inevitable": { tr: "kaçınılmaz, çaresiz", type: "sıfat", sample: "Aging is an inevitable part of human life." },
  "inherent": { tr: "doğuştan gelen, özünde olan, tabiatında bulunan", type: "sıfat", sample: "Every business venture carries inherent risks." },
  "intricate": { tr: "karmaşık, girift, ince ayrıntılı", type: "sıfat", sample: "The human brain has an intricate neural network." },
  "plausible": { tr: "makul, akla yatkın, olası", type: "sıfat", sample: "His explanation for being late sounded plausible." },
  "prevalent": { tr: "yaygın, hakim", type: "sıfat", sample: "Flu viruses are prevalent during cold winter months." },
  "profound": { tr: "derin, köklü, çok büyük", type: "sıfat", sample: "Einstein's theory had a profound impact on physics." },
  "prominent": { tr: "önde gelen, belirgin, tanınmış", type: "sıfat", sample: "She is a prominent researcher in genetics." },
  "reluctant": { tr: "isteksiz, gönülsüz", type: "sıfat", sample: "He was reluctant to admit his obvious mistake." },
  "scarce": { tr: "kıt, az, nadir", type: "sıfat", sample: "Fresh water is scarce in arid regions." },
  "simultaneous": { tr: "eş zamanlı, aynı andaki", type: "sıfat", sample: "There were simultaneous explosions in three cities." },
  "substantial": { tr: "önemli, hatırı sayılır, büyük miktarda", type: "sıfat", sample: "The project received a substantial financial grant." },
  "subtle": { tr: "ince, hemen fark edilmeyen, ustalıklı", type: "sıfat", sample: "There is a subtle difference between the two concepts." },
  "sustainable": { tr: "sürdürülebilir, devam ettirilebilir", type: "sıfat", sample: "Solar energy is an eco-friendly, sustainable resource." },
  "tedious": { tr: "sıkıcı, bıktırıcı, can sıkıcı", type: "sıfat", sample: "Data entry can be a tedious and repetitive job." },
  "ubiquitous": { tr: "her yerde bulunan, yaygın", type: "sıfat", sample: "Plastic pollution is now ubiquitous in the oceans." },
  "vulnerable": { tr: "savunmasız, hassas, incinebilir", type: "sıfat", sample: "Elderly people are especially vulnerable to influenza." },

  // Bağlaçlar ve Geçiş İfadeleri (Conjunctions & Transitions)
  "although": { tr: "e rağmen, karşın, -se de", type: "bağlaç", sample: "Although it rained heavily, they went hiking." },
  "even though": { tr: "e rağmen, -dığı halde", type: "bağlaç", sample: "Even though he had little experience, he got hired." },
  "despite": { tr: "-e rağmen (ardından isim/ing alır)", type: "edat", sample: "Despite the high costs, the project succeeded." },
  "in spite of": { tr: "-e rağmen", type: "edat", sample: "In spite of his illness, he completed the marathon." },
  "however": { tr: "ancak, oysa, yine de", type: "geçiş kelimesi", sample: "The plan sounds great; however, it is costly." },
  "nevertheless": { tr: "yine de, buna rağmen, bununla birlikte", type: "geçiş kelimesi", sample: "It was a difficult test; nevertheless, she passed." },
  "nonetheless": { tr: "buna karşın, yine de", type: "geçiş kelimesi", sample: "The risk was high; nonetheless, they proceeded." },
  "whereas": { tr: "oysaki, halbuki, diğer taraftan", type: "bağlaç", sample: "Some love hot tea, whereas others prefer cold juice." },
  "while": { tr: "iken; oysaki, -e rağmen", type: "bağlaç", sample: "While electric cars are eco-friendly, they are expensive." },
  "therefore": { tr: "bu nedenle, dolayısıyla, bundan ötürü", type: "geçiş kelimesi", sample: "He broke the rules; therefore, he was disqualified." },
  "hence": { tr: "bundan dolayı, bu yüzden", type: "geçiş kelimesi", sample: "The roads were icy; hence, many accidents occurred." },
  "thus": { tr: "böylece, bu doğrultuda, nitekim", type: "geçiş kelimesi", sample: "He worked day and night, thus achieving his goal." },
  "moreover": { tr: "dahası, dahası var ki, üstelik", type: "geçiş kelimesi", sample: "Smoking is unhealthy; moreover, it is expensive." },
  "furthermore": { tr: "üstelik, ayrıca, bundan başka", type: "geçiş kelimesi", sample: "The product is durable; furthermore, it is cheap." },
  "in addition": { tr: "ayrıca, ek olarak", type: "bağlaç", sample: "In addition to English, she speaks fluent Spanish." },
  "on the other hand": { tr: "diğer taraftan, öte yandan", type: "geçiş kelimesi", sample: "City life is exciting; on the other hand, it is noisy." },
  "as a result of": { tr: "sonucu olarak, nedeniyle", type: "edat", sample: "As a result of global warming, glaciers are melting." },
  "due to": { tr: "-den dolayı, yüzünden", type: "edat", sample: "Flights were cancelled due to dense fog." },
  "owing to": { tr: "-den dolayı, sebebiyle", type: "edat", sample: "Owing to his hard work, he won the scholarship." },
  "because of": { tr: "-den dolayı, yüzünden", type: "edat", sample: "The match was delayed because of torrential rain." },
  "in terms of": { tr: "bakımından, açısından", type: "edat öbeği", sample: "In terms of efficiency, this engine ranks first." },
  "with regard to": { tr: "ilişkin olarak, hakkında", type: "edat öbeği", sample: "With regard to your inquiry, we will reply soon." },
  "provided that": { tr: "şartıyla, koşuluyla", type: "bağlaç", sample: "You can go out provided that you finish your homework." },
  "unless": { tr: "-medikçe, -mezse (if not)", type: "bağlaç", sample: "You will fail unless you study regularly." },
  "as long as": { tr: "-dığı sürece", type: "bağlaç", sample: "You can stay here as long as you keep it clean." },
  "so that": { tr: "-sın diye, amacıyla", type: "bağlaç", sample: "He spoke slowly so that everyone could understand." },
  "in order to": { tr: "-mek için, amacıyla", type: "edat öbeği", sample: "She saved money in order to travel to Japan." },

  // Akademik İsimler (Academic Nouns)
  "abundance": { tr: "bolluk, bereket", type: "isim", sample: "The country boasts an abundance of natural gas." },
  "ambiguity": { tr: "belirsizlik, kapalılık", type: "isim", sample: "There was some ambiguity in his statement." },
  "bias": { tr: "ön yargı, yanlılık", type: "isim", sample: "Judges must make decisions without any bias." },
  "breakthrough": { tr: "büyük buluş, çığır açan gelişme", type: "isim", sample: "Gene editing is a major medical breakthrough." },
  "coincidence": { tr: "tesadüf, rastlantı", type: "isim", sample: "Meeting him in London was pure coincidence." },
  "consequence": { tr: "sonuç, netice", type: "isim", sample: "Global climate shifts will have severe consequences." },
  "deprivation": { tr: "mahrumiyet, yoksunluk", type: "isim", sample: "Sleep deprivation impairs concentration and mood." },
  "deterioration": { tr: "kötüleşme, bozulma", type: "isim", sample: "Air pollution causes rapid deterioration of stone monuments." },
  "disaster": { tr: "felaket, afet", type: "isim", sample: "The earthquake was an unprecedented disaster." },
  "diversity": { tr: "çeşitlilik, farklılık", type: "isim", sample: "Cultural diversity enriches our society." },
  "epidemic": { tr: "salgın hastalık", type: "isim", sample: "Health workers struggled to contain the flu epidemic." },
  "evidence": { tr: "kanıt, delil", type: "isim", sample: "There is mounting evidence of climate disruption." },
  "famine": { tr: "kıtlık, açlık", type: "isim", sample: "Drought brought severe famine to the region." },
  "fluctuation": { tr: "dalgalanma, değişkenlik", type: "isim", sample: "Currency fluctuations hurt import businesses." },
  "hazard": { tr: "tehlike, risk", type: "isim", sample: "Chemical waste poses a serious hazard to marine life." },
  "heritage": { tr: "miras, kültürel kalıt", type: "isim", sample: "Historical ruins are part of our world heritage." },
  "hierarchy": { tr: "hiyerarşi, derece sıralaması", type: "isim", sample: "There is a rigid hierarchy in military units." },
  "impact": { tr: "etki, darbe; etkilemek", type: "isim/fiil", sample: "The pandemic had a lasting impact on education." },
  "incentive": { tr: "teşvik, özendirici etken", type: "isim", sample: "Tax reductions act as an incentive for investments." },
  "insight": { tr: "içgörü, kavrayış, derin anlayış", type: "isim", sample: "The book provides deep insight into psychology." },
  "legislation": { tr: "mevzuat, kanun yapma, yasalar", type: "isim", sample: "New environmental legislation was passed today." },
  "obstacle": { tr: "engel, mani", type: "isim", sample: "Lack of funding is the main obstacle to research." },
  "phenomenon": { tr: "olgu, fenomen, doğa olayı", type: "isim", sample: "Aurora borealis is a stunning natural phenomenon." },
  "precaution": { tr: "önlem, tedbir", type: "isim", sample: "Take extra precautions when working with chemicals." },
  "prejudice": { tr: "ön yargı", type: "isim", sample: "Education is the best weapon against prejudice." },
  "prosperity": { tr: "refah, zenginlik, bayındırlık", type: "isim", sample: "Peace brought unprecedented prosperity to the city." },
  "recession": { tr: "durgunluk, ekonomik gerileme", type: "isim", sample: "The country entered a protracted economic recession." },
  "scarcity": { tr: "kıtlık, yetersizlik", type: "isim", sample: "Water scarcity is an acute issue in desert zones." },
  "shift": { tr: "kayma, değişim; vardiye", type: "isim/fiil", sample: "A notable shift towards renewable energy is under way." },
  "species": { tr: "tür (biyolojik)", type: "isim", sample: "Thousands of species face the danger of extinction." },
  "tendency": { tr: "eğilim, meyil", type: "isim", sample: "There is an increasing tendency towards remote work." },
  "threat": { tr: "tehdit, tehlike", type: "isim", sample: "Cyberattacks are a modern threat to infrastructure." },
  "validity": { tr: "geçerlilik, geçerlik", type: "isim", sample: "Scientists questioned the validity of his findings." }
};

// Çeviri Motoru: Önce yerel sözlüğe bakar, bulamazsa harici ücretsiz API'yi çağırır.
class YDSDictionaryEngine {
  constructor() {
    this.cache = new Map();
  }

  // Kelimeyi temizle (noktalama işaretlerini, tireleri ayıkla)
  cleanWord(rawWord) {
    if (!rawWord) return "";
    return rawWord
      .toLowerCase()
      .replace(/^[.,/#!$%^&*;:{}=\-_`~()?"'“”—]+|[.,/#!$%^&*;:{}=\-_`~()?"'“”—]+$/g, "")
      .trim();
  }

  // Sözlükten ara
  async lookup(word) {
    const cleaned = this.cleanWord(word);
    if (!cleaned) return null;

    // 1. Önbellekte varsa hemen dön
    if (this.cache.has(cleaned)) {
      return this.cache.get(cleaned);
    }

    // 2. Dahili zengin sözlükte ara (Doğrudan eşleşme)
    if (BUILTIN_DICTIONARY[cleaned]) {
      const res = {
        word: cleaned,
        ...BUILTIN_DICTIONARY[cleaned],
        source: "yerel_sozluk"
      };
      this.cache.set(cleaned, res);
      return res;
    }

    // 3. Basit kök bulma varyasyonları (çoğul -s, geçmiş zaman -ed, -ing)
    const variations = [];
    if (cleaned.endsWith("ies")) variations.push(cleaned.slice(0, -3) + "y");
    if (cleaned.endsWith("es")) variations.push(cleaned.slice(0, -2));
    if (cleaned.endsWith("s") && !cleaned.endsWith("ss")) variations.push(cleaned.slice(0, -1));
    if (cleaned.endsWith("ed")) {
      variations.push(cleaned.slice(0, -2));
      variations.push(cleaned.slice(0, -1)); // e.g. altered -> alter, liked -> like
    }
    if (cleaned.endsWith("ing")) {
      variations.push(cleaned.slice(0, -3));
      variations.push(cleaned.slice(0, -3) + "e"); // e.g. making -> make
    }

    for (const v of variations) {
      if (BUILTIN_DICTIONARY[v]) {
        const res = {
          word: cleaned,
          baseWord: v,
          tr: BUILTIN_DICTIONARY[v].tr,
          type: BUILTIN_DICTIONARY[v].type,
          sample: BUILTIN_DICTIONARY[v].sample,
          source: "kok_turetme"
        };
        this.cache.set(cleaned, res);
        return res;
      }
    }

    // 4. Çevrimdışı eşleşme bulunamadıysa, ücretsiz API ile çevir (İnternet varsa)
    try {
      const apiResult = await this.fetchOnlineTranslation(cleaned);
      if (apiResult) {
        this.cache.set(cleaned, apiResult);
        return apiResult;
      }
    } catch (err) {
      console.warn("Online çeviri hatası:", err);
    }

    // 5. Hiçbir sonuç bulunamadığında varsayılan geri dönüş
    const fallback = {
      word: cleaned,
      tr: "Anlam aranıyor...",
      type: "kelime",
      source: "varsayilan"
    };
    return fallback;
  }

  // Ücretsiz MyMemory Çeviri Servisi
  async fetchOnlineTranslation(word) {
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2500); // 2.5 saniye timeout

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();

      if (data && data.responseData && data.responseData.translatedText) {
        let trText = data.responseData.translatedText.toLowerCase();
        // Eğer geri dönen kelime İngilizcesiyle tıpatıp aynıysa çevrilememiş demektir
        if (trText.trim() === word.trim()) return null;

        return {
          word: word,
          tr: trText,
          type: "kelime",
          source: "online_api"
        };
      }
    } catch (e) {
      // Offline veya ağ hatası
      return null;
    }
    return null;
  }
}

// Global nesneler
window.ydsDictionary = new YDSDictionaryEngine();
window.BUILTIN_DICTIONARY = BUILTIN_DICTIONARY;
