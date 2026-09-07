// YDS Temel ve Akademik Kelime Sözlüğü (Çevrimdışı & Yüksek Doğruluk)
// 600+ doğrulanmış YDS sözcüğü, kök türetme ve Google Çeviri GTX fallback motoru.

const BUILTIN_DICTIONARY = {
  "the": { tr: "O (Belirteç, Anlamı Yok)", type: "belirteç", sample: "The book is on the table." },
  "to": { tr: "-e, -a (yönelme eki) / mek, mak için", type: "edat", sample: "I go to school." },
  "a": { tr: "Bir (herhangi bir)", type: "belirteç", sample: "I have a pen." },
  "an": { tr: "Bir (herhangi bir)", type: "belirteç", sample: "I have an apple." },
  "of": { tr: "-in, -ın (aitlik)", type: "edat", sample: "The color of the car." },
  "in": { tr: "İçinde, -de, -da", type: "edat", sample: "He is in the room." },
  "on": { tr: "Üzerinde, -de, -da", type: "edat", sample: "The book is on the table." },
  "at": { tr: "-de, -da (bulunma)", type: "edat", sample: "He is at the door." },
  "is": { tr: "olmak (durum bildirir)", type: "fiil", sample: "He is happy." },
  "are": { tr: "olmak (durum bildirir)", type: "fiil", sample: "They are happy." },
  "am": { tr: "olmak (durum bildirir)", type: "fiil", sample: "I am happy." },
  "was": { tr: "olmak (geçmiş durum bildirir)", type: "fiil", sample: "He was happy." },
  "were": { tr: "olmak (geçmiş durum bildirir)", type: "fiil", sample: "They were happy." },
  "abandon": { tr: "terk etmek, vazgeçmek", type: "fiil", sample: "They had to abandon their car in the snow." },
  "abrupt": { tr: "ani", type: "kelime/ifade", sample: "" },
  "abruptly": { tr: "aniden, pat diye", type: "kelime/ifade", sample: "" },
  "abundance": { tr: "bolluk, bereket", type: "isim", sample: "The country boasts an abundance of natural gas." },
  "abundant": { tr: "bol, bereketli, çok sayıda", type: "sıfat", sample: "Rainfall is abundant in tropical rainforests." },
  "accelerate": { tr: "hızlanmak, hızlandırmak", type: "fiil", sample: "The government took steps to accelerate economic growth." },
  "accomplish": { tr: "başarmak, tamamlamak", type: "fiil", sample: "She accomplished all her academic goals." },
  "account for": { tr: "oluşturmak (oran); açıklamak, sebebi olmak", type: "phrasal verb", sample: "Computers account for 25% of our total exports." },
  "accumulate": { tr: "biriktirmek, toplanmak", type: "fiil", sample: "Dust tends to accumulate in neglected corners." },
  "accuracy": { tr: "doğruluk", type: "kelime/ifade", sample: "" },
  "accurate": { tr: "doğru, kesin, hatasız", type: "sıfat", sample: "The thermometer provides accurate measurements." },
  "accurately": { tr: "isabetli şekilde", type: "kelime/ifade", sample: "" },
  "acquire": { tr: "edinmek, kazanmak, elde etmek", type: "fiil", sample: "Children acquire language at an astonishing speed." },
  "acuity": { tr: "keskinlik", type: "kelime/ifade", sample: "" },
  "adapt": { tr: "uyum sağlamak, adapte olmak", type: "fiil", sample: "Animals must adapt to changing climates to survive." },
  "adequate": { tr: "yeterli, kafi", type: "sıfat", sample: "We need adequate supplies for the winter trip." },
  "administrative": { tr: "idari", type: "kelime/ifade", sample: "" },
  "adopt": { tr: "benimsemek", type: "kelime/ifade", sample: "" },
  "adoption": { tr: "benimseme", type: "kelime/ifade", sample: "" },
  "advancement": { tr: "ilerleme, gelişim", type: "isim", sample: "Technological advancement changes lives." },
  "adverse": { tr: "olumsuz, ters, zararlı", type: "sıfat", sample: "Medicine had no adverse side effects." },
  "aerodynamic": { tr: "hava hareketine uygun", type: "kelime/ifade", sample: "" },
  "aerosol": { tr: "aerosol, asıltı", type: "kelime/ifade", sample: "" },
  "aerospace": { tr: "havacılık ve uzay", type: "kelime/ifade", sample: "" },
  "afflict": { tr: "zarar vermek, vurmak", type: "kelime/ifade", sample: "" },
  "aftermath": { tr: "sonrası, neticesi", type: "kelime/ifade", sample: "" },
  "agriculture": { tr: "tarım, ziraat", type: "isim", sample: "Modern agriculture relies heavily on technology." },
  "agronomist": { tr: "tarım bilimci", type: "kelime/ifade", sample: "" },
  "alarming": { tr: "endişe verici, korkutucu", type: "kelime/ifade", sample: "" },
  "allocate": { tr: "tahsis etmek, ayırmak (kaynak, bütçe)", type: "fiil", sample: "More funds were allocated to cancer research." },
  "alter": { tr: "değiştirmek, başkalaşmak", type: "fiil", sample: "Nothing can alter the facts of the matter." },
  "although": { tr: "-e rağmen, karşın", type: "bağlaç", sample: "Although it was cold, we went swimming." },
  "ambiguity": { tr: "belirsizlik, kapalılık", type: "isim", sample: "There was some ambiguity in his statement." },
  "ambiguous": { tr: "muğlak, belirsiz, birden çok anlama gelen", type: "sıfat", sample: "The wording of the law was ambiguous." },
  "ancestor": { tr: "ata, cet", type: "kelime/ifade", sample: "" },
  "ancestral": { tr: "atasal", type: "kelime/ifade", sample: "" },
  "anticipate": { tr: "öngörmek, tahmin etmek, beklemek", type: "fiil", sample: "Economists anticipate a rise in inflation." },
  "antimicrobial": { tr: "mikrop karşıtı", type: "kelime/ifade", sample: "" },
  "antioxidant": { tr: "antioksidan", type: "kelime/ifade", sample: "" },
  "anxiety": { tr: "kaygı, endişe", type: "kelime/ifade", sample: "" },
  "appearance": { tr: "görünüş", type: "kelime/ifade", sample: "" },
  "apple": { tr: "elma", type: "isim", sample: "An apple a day keeps the doctor away." },
  "aquifer": { tr: "yeraltı su katmanı, akifer", type: "kelime/ifade", sample: "" },
  "archaeologist": { tr: "arkeolog", type: "kelime/ifade", sample: "" },
  "arid": { tr: "kurak, çorak", type: "sıfat", sample: "Cacti thrive in arid environments." },
  "as a result of": { tr: "-in sonucu olarak", type: "edat öbeği", sample: "As a result of the accident, traffic stopped." },
  "as if": { tr: "-mış gibi", type: "bağlaç", sample: "He looks as if he knows the secret." },
  "as long as": { tr: "-dığı sürece", type: "bağlaç", sample: "As long as you try, I am proud." },
  "assess": { tr: "değerlendirmek, ölçmek", type: "fiil", sample: "The committee will assess the environmental impact." },
  "assimilation": { tr: "asimilasyon, benzeşme", type: "kelime/ifade", sample: "" },
  "assistance": { tr: "yardım", type: "kelime/ifade", sample: "" },
  "astronomer": { tr: "gökbilimci", type: "kelime/ifade", sample: "" },
  "astronomical": { tr: "astronomik", type: "kelime/ifade", sample: "" },
  "astrophysicist": { tr: "astrofizikçi", type: "kelime/ifade", sample: "" },
  "atmospheric": { tr: "atmosfere ait", type: "kelime/ifade", sample: "" },
  "attain": { tr: "ulaşmak, elde etmek", type: "fiil", sample: "He attained the highest rank in the organization." },
  "attract": { tr: "cezbetmek, çekmek", type: "kelime/ifade", sample: "" },
  "autonomous": { tr: "otonom, sürücüsüz", type: "kelime/ifade", sample: "" },
  "awareness": { tr: "farkındalık, bilinç", type: "kelime/ifade", sample: "" },
  "baseload": { tr: "taban yük, kesintisiz güç", type: "kelime/ifade", sample: "" },
  "because of": { tr: "-den dolayı, yüzünden", type: "edat", sample: "The match was delayed because of torrential rain." },
  "behavioral": { tr: "davranışsal", type: "kelime/ifade", sample: "" },
  "bias": { tr: "ön yargı, yanlılık", type: "isim", sample: "Judges must make decisions without any bias." },
  "biodiversity": { tr: "biyoçeşitlilik", type: "isim", sample: "Tropical rainforests have rich biodiversity." },
  "biofilm": { tr: "biyofilm", type: "kelime/ifade", sample: "" },
  "bioswale": { tr: "biyo-hendek, yeşil su kanalı", type: "kelime/ifade", sample: "" },
  "bleaching": { tr: "beyazlama", type: "kelime/ifade", sample: "" },
  "blend": { tr: "harmanlamak", type: "kelime/ifade", sample: "" },
  "bloodstream": { tr: "kan dolaşımı", type: "kelime/ifade", sample: "" },
  "boost": { tr: "artırmak, canlandırmak, yükseltmek", type: "fiil", sample: "Vitamin D can boost your immune system." },
  "breakthrough": { tr: "büyük buluş, çığır açan gelişme", type: "isim", sample: "Gene editing is a major medical breakthrough." },
  "bred": { tr: "yetiştirilmiş, üretilmiş", type: "kelime/ifade", sample: "" },
  "bring about": { tr: "yol açmak, neden olmak, sebep olmak", type: "phrasal verb", sample: "The industrial revolution brought about major social changes." },
  "bring up": { tr: "büyütmek (çocuk); gündeme getirmek", type: "phrasal verb", sample: "She was brought up in a small coastal village." },
  "call off": { tr: "iptal etmek", type: "phrasal verb", sample: "The football match was called off because of heavy fog." },
  "caloric deficit": { tr: "kalori açığı", type: "kelime/ifade", sample: "" },
  "capacity": { tr: "kapasite, yetenek, hacim", type: "isim", sample: "The stadium was filled to capacity." },
  "cardiovascular": { tr: "kalp-damar", type: "kelime/ifade", sample: "" },
  "carry on": { tr: "devam etmek, sürdürmek", type: "phrasal verb", sample: "Carry on with your work until I come back." },
  "carry out": { tr: "yürütmek, gerçekleştirmek, uygulamak", type: "phrasal verb", sample: "Researchers carried out an extensive survey." },
  "cataclysmic": { tr: "yıkıcı, tufan gibi", type: "kelime/ifade", sample: "" },
  "catch up with": { tr: "yetişmek, aynı seviyeye gelmek", type: "phrasal verb", sample: "He ran fast to catch up with his classmates." },
  "cerebrospinal": { tr: "beyin omurilik", type: "kelime/ifade", sample: "" },
  "challenging": { tr: "zorlayıcı", type: "kelime/ifade", sample: "" },
  "chlorophyll": { tr: "klorofil", type: "kelime/ifade", sample: "" },
  "chronic": { tr: "kronik, sürekli, müzmin", type: "sıfat", sample: "He suffers from chronic back pain." },
  "circadian": { tr: "günlük biyolojik ritim", type: "kelime/ifade", sample: "" },
  "circulation": { tr: "dolaşım, akıntı", type: "kelime/ifade", sample: "" },
  "citadel": { tr: "kale, hisar", type: "kelime/ifade", sample: "" },
  "clarify": { tr: "açıklığa kavuşturmak, netleştirmek", type: "fiil", sample: "The minister clarified the new policy details." },
  "climatologist": { tr: "iklimbilimci", type: "kelime/ifade", sample: "" },
  "clinical trial": { tr: "klinik deneme/test", type: "kelime/ifade", sample: "" },
  "coast": { tr: "kıyı, sahil", type: "kelime/ifade", sample: "" },
  "coastal": { tr: "kıyıya ait", type: "kelime/ifade", sample: "" },
  "coincide": { tr: "aynı zamana denk gelmek, uyuşmak", type: "fiil", sample: "The strike coincided with the peak holiday season." },
  "coincidence": { tr: "tesadüf, rastlantı", type: "isim", sample: "Meeting him in London was pure coincidence." },
  "collaborate": { tr: "iş birliği yapmak", type: "fiil", sample: "Scientists collaborate across borders." },
  "collapse": { tr: "çökmek, yıkılmak", type: "kelime/ifade", sample: "" },
  "come across": { tr: "karşılaşmak, rastlamak", type: "phrasal verb", sample: "I came across an ancient coin in the garden." },
  "commodity": { tr: "ticari mal, eşya", type: "kelime/ifade", sample: "" },
  "compatible": { tr: "uyumlu, bağdaşan", type: "sıfat", sample: "This software is compatible with both Mac and Windows." },
  "compensate": { tr: "tazmin etmek, telafi etmek", type: "fiil", sample: "Nothing can compensate for the loss of a life." },
  "complication": { tr: "yan etki, karmaşa", type: "kelime/ifade", sample: "" },
  "compound": { tr: "bileşik, bileşen; artırmak", type: "isim/fiil", sample: "Water is a chemical compound of H and O." },
  "comprehend": { tr: "kavramak, anlamak", type: "fiil", sample: "He failed to comprehend the seriousness of the issue." },
  "comprehension": { tr: "anlama, kavrama", type: "kelime/ifade", sample: "" },
  "comprehensively": { tr: "kapsamlı bir şekilde", type: "kelime/ifade", sample: "" },
  "computational": { tr: "hesaplamalı, işlemci", type: "kelime/ifade", sample: "" },
  "condition": { tr: "şart, durum, koşul", type: "isim", sample: "Weather conditions were poor." },
  "conditions": { tr: "koşullar, şartlar", type: "isim", sample: "Harsh working conditions must improve." },
  "conduct": { tr: "yürütmek, gerçekleştirmek (deney, araştırma)", type: "fiil", sample: "They conducted a series of clinical trials." },
  "conduit": { tr: "kanal, vasıta", type: "kelime/ifade", sample: "" },
  "confine": { tr: "sınırlandırmak, hapsetmek", type: "fiil", sample: "The infection was confined to the upper respiratory tract." },
  "confinement": { tr: "hapis, sınırlandırma, kısıtlama", type: "isim", sample: "Solitary confinement has severe psychological effects." },
  "confirm": { tr: "doğrulamak, onaylamak", type: "fiil", sample: "X-rays confirmed the fracture in his arm." },
  "confirmation bias": { tr: "doğrulama yanlılığı", type: "kelime/ifade", sample: "" },
  "conflict": { tr: "çatışma", type: "kelime/ifade", sample: "" },
  "conform": { tr: "uymak, itaat etmek", type: "fiil", sample: "All products must conform to safety regulations." },
  "consequence": { tr: "sonuç, netice", type: "isim", sample: "Global climate shifts will have severe consequences." },
  "consequently": { tr: "sonuç olarak", type: "kelime/ifade", sample: "" },
  "constrain": { tr: "kısıtlamak", type: "kelime/ifade", sample: "" },
  "consume": { tr: "tüketmek, harcamak", type: "fiil", sample: "The vehicle consumes less fuel on highways." },
  "consumer": { tr: "tüketici", type: "kelime/ifade", sample: "" },
  "consumption": { tr: "tüketim", type: "kelime/ifade", sample: "" },
  "continent": { tr: "kıta", type: "kelime/ifade", sample: "" },
  "contribute": { tr: "katkıda bulunmak, sebep olmak", type: "fiil", sample: "Stress contributes to high blood pressure." },
  "conventional": { tr: "geleneksel", type: "kelime/ifade", sample: "" },
  "convert into": { tr: "dönüştürmek", type: "kelime/ifade", sample: "" },
  "cope with": { tr: "başa çıkmak, üstesinden gelmek", type: "phrasal verb", sample: "It is challenging to cope with extreme stress." },
  "coral bleaching": { tr: "mercan ağarması", type: "kelime/ifade", sample: "" },
  "corporate": { tr: "kurumsal", type: "kelime/ifade", sample: "" },
  "corroborate": { tr: "doğrulamak, teyit etmek", type: "kelime/ifade", sample: "" },
  "cosmetic": { tr: "kozmetik, yüzeysel", type: "kelime/ifade", sample: "" },
  "crop": { tr: "mahsul, ekin", type: "isim", sample: "Corn is an important crop in this state." },
  "crops": { tr: "ekinler, mahsuller", type: "isim", sample: "Heavy rain damaged the autumn crops." },
  "crossbreed": { tr: "melezlemek", type: "kelime/ifade", sample: "" },
  "crucial": { tr: "can alıcı, hayati derecede önemli", type: "sıfat", sample: "Early detection is crucial in treating cancer." },
  "crucial role": { tr: "çok önemli rol", type: "kelime/ifade", sample: "" },
  "cryptography": { tr: "şifreleme bilimi", type: "kelime/ifade", sample: "" },
  "cultivar": { tr: "ekili bitki çeşidi", type: "kelime/ifade", sample: "" },
  "cultivate": { tr: "ekip biçmek, yetiştirmek, geliştirmek", type: "fiil", sample: "Farmers cultivate wheat in spring." },
  "curb": { tr: "dizginlemek, kontrol altına almak", type: "kelime/ifade", sample: "" },
  "current": { tr: "akıntı", type: "kelime/ifade", sample: "" },
  "curtail": { tr: "kısmak, kısıtlamak, azaltmak", type: "fiil", sample: "Spending was curtailed due to the recession." },
  "cut down on": { tr: "kısmak, azaltmak", type: "phrasal verb", sample: "Doctors advised him to cut down on sugar." },
  "deceleration": { tr: "yavaşlama", type: "kelime/ifade", sample: "" },
  "decline": { tr: "azalmak, gerilemek; reddetmek", type: "fiil/isim", sample: "The population began to decline in the 1990s." },
  "decoherence": { tr: "tutarlık kaybı, dekoherans", type: "kelime/ifade", sample: "" },
  "deforestation": { tr: "ormansızlaşma", type: "kelime/ifade", sample: "" },
  "degenerative": { tr: "dejeneratif, yıkıcı", type: "kelime/ifade", sample: "" },
  "degrade": { tr: "bozulmak, gücünü yitirmek", type: "kelime/ifade", sample: "" },
  "demand": { tr: "talep", type: "kelime/ifade", sample: "" },
  "democratize": { tr: "demokratikleştirmek, tabana yaymak", type: "kelime/ifade", sample: "" },
  "demonstrate": { tr: "göstermek, kanıtlamak, sergilemek", type: "fiil", sample: "The research demonstrates a link between diet and health." },
  "dense": { tr: "yoğun", type: "kelime/ifade", sample: "" },
  "dependence": { tr: "bağımlılık", type: "kelime/ifade", sample: "" },
  "depict": { tr: "tasvir etmek, betimlemek", type: "fiil", sample: "The painting depicts a tranquil mountain landscape." },
  "deplete": { tr: "tüketmek, azaltmak", type: "fiil", sample: "Overfishing depletes ocean reserves." },
  "depletion": { tr: "tükenme, incelme", type: "kelime/ifade", sample: "" },
  "deprivation": { tr: "mahrumiyet, yoksunluk", type: "isim", sample: "Sleep deprivation impairs concentration and mood." },
  "deprive": { tr: "yoksun bırakmak, mahrum etmek", type: "fiil", sample: "Prisoners were deprived of basic medical care." },
  "deprived": { tr: "yoksun, mahrum", type: "sıfat", sample: "Children in deprived areas need extra support." },
  "deskilling": { tr: "yetenek kaybı", type: "kelime/ifade", sample: "" },
  "despite": { tr: "-e rağmen", type: "edat", sample: "Despite the rain, the game continued." },
  "deteriorate": { tr: "kötüleşmek, bozulmak", type: "fiil", sample: "His health deteriorated rapidly overnight." },
  "deterioration": { tr: "kötüleşme, bozulma", type: "isim", sample: "Air pollution causes rapid deterioration of stone monuments." },
  "detrimental": { tr: "zararlı, hasar veren", type: "sıfat", sample: "Excessive stress is detrimental to heart health." },
  "devastate": { tr: "tahrip etmek, mahvetmek", type: "kelime/ifade", sample: "" },
  "devastating": { tr: "yıkıcı, tahrip edici", type: "sıfat", sample: "The earthquake had a devastating impact." },
  "developing": { tr: "gelişmekte olan", type: "kelime/ifade", sample: "" },
  "development": { tr: "kalkınma, gelişme", type: "kelime/ifade", sample: "" },
  "diagnostic": { tr: "teşhise ait", type: "kelime/ifade", sample: "" },
  "diminish": { tr: "azalmak, eksilmek, küçülmek", type: "fiil", sample: "The pain will gradually diminish over time." },
  "disaster": { tr: "felaket, afet", type: "isim", sample: "The earthquake was an unprecedented disaster." },
  "disorder": { tr: "rahatsızlık, bozukluk", type: "kelime/ifade", sample: "" },
  "displace": { tr: "yerinden etmek", type: "kelime/ifade", sample: "" },
  "disrupt": { tr: "aksatmak, kesintiye uğratmak, düzeni bozmak", type: "fiil", sample: "The storm disrupted rail and flight services." },
  "disruption": { tr: "aksama, bozulma", type: "kelime/ifade", sample: "" },
  "dissemination": { tr: "yayılma, dağıtım", type: "kelime/ifade", sample: "" },
  "distinct": { tr: "belirgin, farklı, ayrı", type: "sıfat", sample: "The twin sisters have distinct personalities." },
  "diverse": { tr: "çeşitli, türlü, farklı", type: "sıfat", sample: "The Amazon basin has a diverse ecosystem." },
  "diversity": { tr: "çeşitlilik, farklılık", type: "isim", sample: "Cultural diversity enriches our society." },
  "do away with": { tr: "yürürlükten kaldırmak, yok etmek", type: "phrasal verb", sample: "Many countries did away with capital punishment." },
  "downtime": { tr: "duraklama, atıl süre", type: "kelime/ifade", sample: "" },
  "drainage": { tr: "drenaj", type: "kelime/ifade", sample: "" },
  "dramatic": { tr: "çarpıcı, dramatik", type: "kelime/ifade", sample: "" },
  "drought": { tr: "kuraklık", type: "isim", sample: "The severe drought ruined the harvest." },
  "drought-resistant": { tr: "kuraklığa dayanıklı", type: "kelime/ifade", sample: "" },
  "due to": { tr: "-den dolayı, nedeniyle", type: "edat öbeği", sample: "Flights were cancelled due to dense fog." },
  "ecclesiastical": { tr: "kiliseye ait, ruhani", type: "kelime/ifade", sample: "" },
  "economical": { tr: "ekonomik, tasarruflu", type: "kelime/ifade", sample: "" },
  "effectiveness": { tr: "etkinlik, etkililik", type: "kelime/ifade", sample: "" },
  "efficiency": { tr: "verimlilik", type: "kelime/ifade", sample: "" },
  "elaborate": { tr: "ayrıntılı, incelikli", type: "kelime/ifade", sample: "" },
  "eligible": { tr: "uygun, nitelikli, şartları taşıyan", type: "sıfat", sample: "Only citizens over 18 are eligible to vote." },
  "eliminate": { tr: "ortadan kaldırmak, elemek, yok etmek", type: "fiil", sample: "Vaccines helped eliminate smallpox worldwide." },
  "embankment": { tr: "kıyı seti, dolgu set", type: "kelime/ifade", sample: "" },
  "emerge": { tr: "ortaya çıkmak, belirmek", type: "fiil", sample: "New evidence emerged during the investigation." },
  "emission": { tr: "salım, emisyon", type: "kelime/ifade", sample: "" },
  "emissions": { tr: "salımlar", type: "kelime/ifade", sample: "" },
  "en masse": { tr: "kitlesel olarak, topluca", type: "kelime/ifade", sample: "" },
  "encroachment": { tr: "istila, sınır aşımı", type: "kelime/ifade", sample: "" },
  "endangered": { tr: "nesli tükenmekte olan", type: "kelime/ifade", sample: "" },
  "endow": { tr: "donatmak, bahşetmek", type: "kelime/ifade", sample: "" },
  "endure": { tr: "katlanmak, dayanmak", type: "kelime/ifade", sample: "" },
  "enforce": { tr: "yürürlüğe koymak, zorunlu kılmak", type: "kelime/ifade", sample: "" },
  "enforceable": { tr: "uygulanabilir, yaptırımı olan", type: "kelime/ifade", sample: "" },
  "engage in": { tr: "ile meşgul olmak, katılmak", type: "kelime/ifade", sample: "" },
  "enhance": { tr: "artırmak, geliştirmek, zenginleştirmek", type: "fiil", sample: "Exercise can enhance both physical and mental health." },
  "entombed": { tr: "hapsolmuş, gömülmüş", type: "kelime/ifade", sample: "" },
  "entrenched": { tr: "kemikleşmiş", type: "kelime/ifade", sample: "" },
  "epidemic": { tr: "salgın hastalık", type: "isim", sample: "Health workers struggled to contain the flu epidemic." },
  "equator": { tr: "ekvator", type: "kelime/ifade", sample: "" },
  "era": { tr: "çağ, dönem", type: "kelime/ifade", sample: "" },
  "erratic": { tr: "düzensiz, kararsız", type: "kelime/ifade", sample: "" },
  "essential": { tr: "elzem, zorunlu, temel", type: "sıfat", sample: "Water is essential for all living organisms." },
  "established": { tr: "köklü, oturmuş", type: "kelime/ifade", sample: "" },
  "ethnobotanical": { tr: "etnobotanik", type: "kelime/ifade", sample: "" },
  "evaluate": { tr: "değerlendirmek, paha biçmek", type: "fiil", sample: "Teachers evaluate students' performance fairly." },
  "evaluation": { tr: "değerlendirme", type: "kelime/ifade", sample: "" },
  "even though": { tr: "-e rağmen, karşın", type: "bağlaç", sample: "Even though he was tired, he kept working." },
  "evidence": { tr: "kanıt, delil", type: "isim", sample: "There is mounting evidence of climate disruption." },
  "evident": { tr: "açık, aşikar, besbelli", type: "sıfat", sample: "It was evident that she had prepared thoroughly." },
  "exaggerate": { tr: "abartmak", type: "fiil", sample: "The media often exaggerates the danger." },
  "excavation": { tr: "arkeolojik kazı", type: "kelime/ifade", sample: "" },
  "exceed": { tr: "aşmak, sınırın üzerine çıkmak", type: "fiil", sample: "Do not exceed the recommended daily dose." },
  "exhaust": { tr: "tüketmek, bitirmek; çok yormak", type: "fiil", sample: "They exhausted all natural resources in the region." },
  "exhibit": { tr: "sergilemek, göstermek", type: "fiil", sample: "The patient exhibited symptoms of mild pneumonia." },
  "exoplanet": { tr: "ötegezegen", type: "kelime/ifade", sample: "" },
  "expand": { tr: "genişlemek, büyümek, yayılmak", type: "fiil", sample: "Metals expand when heated." },
  "expel": { tr: "dışarı atmak, kovmak", type: "kelime/ifade", sample: "" },
  "expertise": { tr: "uzmanlık", type: "kelime/ifade", sample: "" },
  "exploit": { tr: "sömürmek; faydalanmak, istifade etmek", type: "fiil", sample: "The company exploited natural mineral reserves." },
  "expose": { tr: "maruz bırakmak", type: "kelime/ifade", sample: "" },
  "exposure to": { tr: "maruz kalma", type: "kelime/ifade", sample: "" },
  "extraction": { tr: "çıkarma, çekme", type: "kelime/ifade", sample: "" },
  "extraterrestrial": { tr: "dünya dışı, uzay", type: "kelime/ifade", sample: "" },
  "extremophile": { tr: "uç koşullarda yaşayan canlı", type: "kelime/ifade", sample: "" },
  "faint": { tr: "zayıf, sönük", type: "kelime/ifade", sample: "" },
  "fall back on": { tr: "son çare başvurmak", type: "kelime/ifade", sample: "" },
  "fall behind": { tr: "geride kalmak", type: "phrasal verb", sample: "If you miss school, you might fall behind in math." },
  "famine": { tr: "kıtlık, açlık", type: "isim", sample: "Drought brought severe famine to the region." },
  "fertile": { tr: "verimli", type: "kelime/ifade", sample: "" },
  "fertility": { tr: "verimlilik, doğurganlık", type: "kelime/ifade", sample: "" },
  "fertilizer": { tr: "gübre", type: "kelime/ifade", sample: "" },
  "figure out": { tr: "anlamak, çözmek, kavramak", type: "phrasal verb", sample: "We need to figure out how this machine works." },
  "financing": { tr: "finansman, fon sağlama", type: "kelime/ifade", sample: "" },
  "flexibility": { tr: "esneklik", type: "kelime/ifade", sample: "" },
  "fluctuate": { tr: "dalgalanmak, istikrarsız olmak", type: "fiil", sample: "Oil prices fluctuate according to global demand." },
  "fluctuation": { tr: "dalgalanma, değişkenlik", type: "isim", sample: "Currency fluctuations hurt import businesses." },
  "flush out": { tr: "yıkayıp temizlemek", type: "kelime/ifade", sample: "" },
  "food": { tr: "yiyecek, gıda", type: "isim", sample: "Healthy food is essential for well-being." },
  "forebear": { tr: "ata", type: "kelime/ifade", sample: "" },
  "fortification": { tr: "tahkimat, sur", type: "kelime/ifade", sample: "" },
  "fortify": { tr: "güçlendirmek, tahkim etmek", type: "kelime/ifade", sample: "" },
  "fossil": { tr: "fosil", type: "kelime/ifade", sample: "" },
  "foster": { tr: "teşvik etmek, geliştirmek, büyütmek", type: "fiil", sample: "The program aims to foster international cooperation." },
  "frost": { tr: "don, ayaz", type: "kelime/ifade", sample: "" },
  "fruit": { tr: "meyve, ürün", type: "isim", sample: "Citrus fruits are rich in vitamin C." },
  "fundamental": { tr: "temel, asli", type: "kelime/ifade", sample: "" },
  "fundamentally": { tr: "kökten, esaslı biçimde", type: "kelime/ifade", sample: "" },
  "fungal": { tr: "mantara ait", type: "kelime/ifade", sample: "" },
  "furthermore": { tr: "dahası, ayrıca, üstelik", type: "zarf", sample: "Furthermore, new evidence has surfaced." },
  "future generations": { tr: "gelecek nesiller", type: "kelime/ifade", sample: "" },
  "galaxy": { tr: "galaksi, gök ada", type: "kelime/ifade", sample: "" },
  "generate": { tr: "üretmek, oluşturmak, meydana getirmek", type: "fiil", sample: "Wind turbines generate clean electrical power." },
  "geneticist": { tr: "genetikçi", type: "kelime/ifade", sample: "" },
  "geothermal": { tr: "jeotermal", type: "kelime/ifade", sample: "" },
  "get over": { tr: "atlatmak, üstesinden gelmek", type: "kelime/ifade", sample: "" },
  "get rid of": { tr: "kurtulmak, elden çıkarmak", type: "phrasal verb", sample: "He wants to get rid of his old furniture." },
  "give in": { tr: "teslim olmak, boyun eğmek", type: "phrasal verb", sample: "The rebels finally gave in after prolonged siege." },
  "give up": { tr: "bırakmak, vazgeçmek, pes etmek", type: "phrasal verb", sample: "Never give up on your dreams." },
  "given that": { tr: "-dığı göz önüne alınırsa", type: "bağlaç", sample: "Given that it's late, we should leave." },
  "glacial": { tr: "buzul", type: "kelime/ifade", sample: "" },
  "grasp": { tr: "kavramak", type: "kelime/ifade", sample: "" },
  "greenhouse gas": { tr: "sera gazı", type: "kelime/ifade", sample: "" },
  "groundbreaking": { tr: "çığır açan", type: "kelime/ifade", sample: "" },
  "gypsum": { tr: "alçı taşı, jips", type: "kelime/ifade", sample: "" },
  "habitability": { tr: "yaşanabilirlik", type: "kelime/ifade", sample: "" },
  "habitat": { tr: "yaşam alanı", type: "kelime/ifade", sample: "" },
  "halt": { tr: "durdurmak", type: "kelime/ifade", sample: "" },
  "harsh": { tr: "sert, çetin", type: "kelime/ifade", sample: "" },
  "harvest": { tr: "hasat, hasat etmek", type: "isim/fiil", sample: "Farmers expect a bountiful harvest this year." },
  "hazard": { tr: "tehlike, risk", type: "isim", sample: "Smoking is a major health hazard." },
  "hence": { tr: "bundan dolayı, bu yüzden", type: "geçiş kelimesi", sample: "The roads were icy; hence, many accidents occurred." },
  "herd immunity": { tr: "sürü bağışıklığı", type: "kelime/ifade", sample: "" },
  "heritage": { tr: "miras, kültürel kalıt", type: "isim", sample: "Historical ruins are part of our world heritage." },
  "hesitancy": { tr: "tereddüt, çekinme", type: "kelime/ifade", sample: "" },
  "hierarchy": { tr: "hiyerarşi, derece sıralaması", type: "isim", sample: "There is a rigid hierarchy in military units." },
  "hinder": { tr: "engellemek, aksatmak, mani olmak", type: "fiil", sample: "Dense fog hindered the rescue operations." },
  "horticultural": { tr: "bahçe ziraati", type: "kelime/ifade", sample: "" },
  "however": { tr: "ancak, yine de, oysa", type: "zarf/bağlaç", sample: "He wanted to go; however, he was sick." },
  "hub": { tr: "merkez, odak noktası", type: "kelime/ifade", sample: "" },
  "hunter-gatherer": { tr: "avcı-toplayıcı", type: "kelime/ifade", sample: "" },
  "hydrothermal": { tr: "hidrotermal, sıcak su", type: "kelime/ifade", sample: "" },
  "immense": { tr: "muazzam, muazzam büyüklükte", type: "kelime/ifade", sample: "" },
  "immune system": { tr: "bağışıklık sistemi", type: "kelime/ifade", sample: "" },
  "impact": { tr: "etki, darbe; etkilemek", type: "isim/fiil", sample: "The pandemic had a lasting impact on education." },
  "impede": { tr: "engellemek", type: "kelime/ifade", sample: "" },
  "implement": { tr: "uygulamaya koymak, yürürlüğe sokmak", type: "fiil", sample: "They plan to implement new educational reforms." },
  "in addition": { tr: "ayrıca, ek olarak", type: "bağlaç", sample: "In addition to English, she speaks fluent Spanish." },
  "in addition to": { tr: "-e ek olarak, yanı sıra", type: "edat öbeği", sample: "In addition to teaching, she writes novels." },
  "in advance": { tr: "önceden", type: "kelime/ifade", sample: "" },
  "in order to": { tr: "-mek için, amacıyla", type: "edat öbeği", sample: "She saved money in order to travel to Japan." },
  "in place of": { tr: "yerine", type: "kelime/ifade", sample: "" },
  "in spite of": { tr: "-e rağmen", type: "edat", sample: "In spite of his age, he runs marathons." },
  "in terms of": { tr: "açısından, bakımından", type: "edat öbeği", sample: "In terms of sales, this year was best." },
  "incentive": { tr: "teşvik, özendirici etken", type: "isim", sample: "Tax reductions act as an incentive for investments." },
  "indigenous": { tr: "yerli, otokton", type: "sıfat", sample: "Indigenous flora must be protected." },
  "indispensable": { tr: "vazgeçilmez, olmazsa olmaz", type: "sıfat", sample: "Smartphones have become indispensable in modern life." },
  "industrial": { tr: "sanayiye ait", type: "kelime/ifade", sample: "" },
  "inevitable": { tr: "kaçınılmaz, çaresiz", type: "sıfat", sample: "Aging is an inevitable part of human life." },
  "inevitably": { tr: "kaçınılmaz olarak", type: "zarf", sample: "Neglect inevitably leads to failure." },
  "infection": { tr: "enfeksiyon, bulaşma", type: "kelime/ifade", sample: "" },
  "infectious": { tr: "bulaşıcı", type: "kelime/ifade", sample: "" },
  "infestation": { tr: "istila, sarma", type: "kelime/ifade", sample: "" },
  "inflict": { tr: "yol açmak, yüklemek", type: "kelime/ifade", sample: "" },
  "influence": { tr: "etkilemek", type: "kelime/ifade", sample: "" },
  "infrastructure": { tr: "altyapı", type: "isim", sample: "Cities need modern water infrastructure." },
  "inherent": { tr: "doğuştan gelen, özünde olan, tabiatında bulunan", type: "sıfat", sample: "Every business venture carries inherent risks." },
  "inhibit": { tr: "engellemek, dizginlemek, yavaşlatmak", type: "fiil", sample: "Cold temperatures inhibit bacterial growth." },
  "initiate": { tr: "başlatmak, önayak olmak", type: "fiil", sample: "The government initiated peace negotiations." },
  "innovate": { tr: "yenilik yapmak", type: "fiil", sample: "Companies must innovate constantly to remain competitive." },
  "innovation": { tr: "yenilik, inovasyon", type: "kelime/ifade", sample: "" },
  "insight": { tr: "içgörü, kavrayış, derin anlayış", type: "isim", sample: "The book provides deep insight into psychology." },
  "insomnia": { tr: "uykusuzluk", type: "kelime/ifade", sample: "" },
  "installation": { tr: "kurulum", type: "kelime/ifade", sample: "" },
  "intercropping": { tr: "ara ziraat, karışık ekim", type: "kelime/ifade", sample: "" },
  "interfere with": { tr: "sekteye uğratmak, engellemek", type: "kelime/ifade", sample: "" },
  "intervention": { tr: "müdahale", type: "kelime/ifade", sample: "" },
  "intricate": { tr: "karmaşık, girift, ince ayrıntılı", type: "sıfat", sample: "The human brain has an intricate neural network." },
  "intrusion": { tr: "izinsiz giriş, işgal", type: "kelime/ifade", sample: "" },
  "intuition": { tr: "sezgi", type: "kelime/ifade", sample: "" },
  "invest": { tr: "yatırım yapmak", type: "kelime/ifade", sample: "" },
  "investment": { tr: "yatırım", type: "kelime/ifade", sample: "" },
  "irreplaceable": { tr: "yeri doldurulamaz", type: "kelime/ifade", sample: "" },
  "irrigation": { tr: "sulama", type: "kelime/ifade", sample: "" },
  "jeopardize": { tr: "tehlikeye atmak", type: "kelime/ifade", sample: "" },
  "keep up with": { tr: "ayak uydurmak, gerisinde kalmamak", type: "phrasal verb", sample: "It is hard to keep up with rapid technological changes." },
  "landscape": { tr: "coğrafya, manzara", type: "kelime/ifade", sample: "" },
  "latitude": { tr: "enlem", type: "kelime/ifade", sample: "" },
  "legislation": { tr: "mevzuat, kanun yapma, yasalar", type: "isim", sample: "New environmental legislation was passed today." },
  "lexicon": { tr: "söz varlığı, sözlük", type: "kelime/ifade", sample: "" },
  "liberate": { tr: "özgür kılmak", type: "kelime/ifade", sample: "" },
  "life-threatening": { tr: "hayati tehlike yaratan", type: "kelime/ifade", sample: "" },
  "liquidity": { tr: "likidite, nakit akışı", type: "kelime/ifade", sample: "" },
  "livestock": { tr: "çiftlik hayvanları", type: "kelime/ifade", sample: "" },
  "local government": { tr: "yerel yönetim", type: "kelime/ifade", sample: "" },
  "logic": { tr: "mantık", type: "kelime/ifade", sample: "" },
  "look down on": { tr: "küçümsemek, hor görmek", type: "phrasal verb", sample: "Never look down on someone with less education." },
  "look forward to": { tr: "dört gözle beklemek", type: "phrasal verb", sample: "I look forward to meeting you next week." },
  "machinery": { tr: "makine donanımı", type: "kelime/ifade", sample: "" },
  "maintain": { tr: "sürdürmek, korumak; iddia etmek", type: "fiil", sample: "He struggled to maintain his composure." },
  "make up for": { tr: "telafi etmek, telafi yoluna gitmek", type: "phrasal verb", sample: "Hard work can make up for lack of innate talent." },
  "malnutrition": { tr: "yetersiz beslenme", type: "kelime/ifade", sample: "" },
  "manufacturing": { tr: "üretim, imalat", type: "kelime/ifade", sample: "" },
  "marine": { tr: "denize ait", type: "kelime/ifade", sample: "" },
  "mark": { tr: "işaret etmek, damga vurmak", type: "kelime/ifade", sample: "" },
  "matrix": { tr: "matris, doku", type: "kelime/ifade", sample: "" },
  "measure": { tr: "tedbir, önlem", type: "kelime/ifade", sample: "" },
  "merchant": { tr: "tüccar", type: "kelime/ifade", sample: "" },
  "merger": { tr: "birleşme", type: "kelime/ifade", sample: "" },
  "metabolic": { tr: "metabolik", type: "kelime/ifade", sample: "" },
  "meteorological": { tr: "meteorolojik, hava durumuyla ilgili", type: "kelime/ifade", sample: "" },
  "meticulously": { tr: "titizlikle", type: "kelime/ifade", sample: "" },
  "mitigate": { tr: "hafifletmek, yatıştırmak, azaltmak", type: "fiil", sample: "Forests help mitigate the impact of global warming." },
  "monitor": { tr: "izlemek, takip etmek", type: "kelime/ifade", sample: "" },
  "monolingual": { tr: "tek dilli", type: "kelime/ifade", sample: "" },
  "monsoon": { tr: "muson rüzgarları/yağmuru", type: "kelime/ifade", sample: "" },
  "monumental": { tr: "anıtsal", type: "kelime/ifade", sample: "" },
  "moreover": { tr: "dahası, üstelik", type: "zarf", sample: "The rent is high; moreover, the location is poor." },
  "mosaic": { tr: "mozaik", type: "kelime/ifade", sample: "" },
  "mundane": { tr: "sıradan, tekdüze", type: "kelime/ifade", sample: "" },
  "municipal": { tr: "belediyeye ait, kentsel", type: "sıfat", sample: "Municipal services keep streets clean." },
  "mutate": { tr: "mutasyona uğramak", type: "kelime/ifade", sample: "" },
  "necessity": { tr: "zorunluluk, gereklilik", type: "kelime/ifade", sample: "" },
  "neglect": { tr: "ihmal etmek, savsaklamak", type: "fiil", sample: "Never neglect safety procedures in laboratories." },
  "neurodegenerative": { tr: "sinir yıkıcı", type: "kelime/ifade", sample: "" },
  "neuroprotective": { tr: "sinir koruyucu", type: "kelime/ifade", sample: "" },
  "neutralize": { tr: "etkisiz hale getirmek", type: "kelime/ifade", sample: "" },
  "nevertheless": { tr: "yine de, buna rağmen", type: "zarf/bağlaç", sample: "It was difficult; nevertheless, she persevered." },
  "nocturnal": { tr: "geceye ait", type: "kelime/ifade", sample: "" },
  "nonetheless": { tr: "buna karşın, yine de", type: "geçiş kelimesi", sample: "The risk was high; nonetheless, they proceeded." },
  "noticeably": { tr: "belirgin biçimde", type: "kelime/ifade", sample: "" },
  "nuance": { tr: "nüans, ince ayrım", type: "kelime/ifade", sample: "" },
  "observatory": { tr: "gözlemevi", type: "kelime/ifade", sample: "" },
  "obstacle": { tr: "engel, mani", type: "isim", sample: "Lack of funding is the main obstacle to research." },
  "obtain": { tr: "elde etmek, edinmek, temin etmek", type: "fiil", sample: "You must obtain written permission before entering." },
  "occupation": { tr: "meslek, iş kolu", type: "kelime/ifade", sample: "" },
  "on behalf of": { tr: "adına, namına", type: "edat öbeği", sample: "I speak on behalf of all colleagues." },
  "on the other hand": { tr: "diğer taraftan, öte yandan", type: "geçiş kelimesi", sample: "City life is exciting; on the other hand, it is noisy." },
  "orbit": { tr: "yörüngesinde dönmek", type: "kelime/ifade", sample: "" },
  "orchard": { tr: "meyve bahçesi", type: "kelime/ifade", sample: "" },
  "organically": { tr: "organik olarak", type: "kelime/ifade", sample: "" },
  "outbreak": { tr: "salgın, patlak verme", type: "kelime/ifade", sample: "" },
  "overcome": { tr: "üstesinden gelmek, yenmek", type: "fiil", sample: "She overcame immense difficulties to graduate." },
  "overwhelm": { tr: "aşırı yüklenmek, zorlamak", type: "kelime/ifade", sample: "" },
  "owing to": { tr: "-den dolayı, yüzünden", type: "edat öbeği", sample: "Owing to his injuries, he retired." },
  "oxidative": { tr: "oksidatif", type: "kelime/ifade", sample: "" },
  "paramount": { tr: "en önemli, hayati, birincil", type: "sıfat", sample: "Safety is of paramount importance." },
  "pathogen": { tr: "hastalık yapıcı mikrop", type: "kelime/ifade", sample: "" },
  "pathogenic": { tr: "hastalık yapıcı", type: "kelime/ifade", sample: "" },
  "pathway": { tr: "yol, güzergah", type: "kelime/ifade", sample: "" },
  "peer": { tr: "akran, denk", type: "kelime/ifade", sample: "" },
  "penetrate": { tr: "nüfuz etmek, içine girmek", type: "kelime/ifade", sample: "" },
  "perceive": { tr: "algılamak, farkına varmak", type: "fiil", sample: "Children perceive the world differently from adults." },
  "permeable": { tr: "geçirgen", type: "kelime/ifade", sample: "" },
  "perspective": { tr: "bakış açısı", type: "kelime/ifade", sample: "" },
  "perturbation": { tr: "sapma, düzensizlik", type: "kelime/ifade", sample: "" },
  "pervasive": { tr: "her yere yayılmış, nüfuz eden", type: "kelime/ifade", sample: "" },
  "pesticide": { tr: "tarım ilacı", type: "kelime/ifade", sample: "" },
  "phenomenon": { tr: "olgu, fenomen, doğa olayı", type: "isim", sample: "Aurora borealis is a stunning natural phenomenon." },
  "photosynthesis": { tr: "fotosentez", type: "kelime/ifade", sample: "" },
  "physician": { tr: "hekim, doktor", type: "kelime/ifade", sample: "" },
  "pigment": { tr: "boya maddesi, pigment", type: "kelime/ifade", sample: "" },
  "plausible": { tr: "makul, akla yatkın, olası", type: "sıfat", sample: "His explanation for being late sounded plausible." },
  "polar": { tr: "kutupsal", type: "kelime/ifade", sample: "" },
  "pollinate": { tr: "tozlaştırmak", type: "kelime/ifade", sample: "" },
  "pollinating": { tr: "tozlaşmayı sağlayan", type: "kelime/ifade", sample: "" },
  "pollution": { tr: "kirlilik", type: "kelime/ifade", sample: "" },
  "pose a barrier": { tr: "engel teşkil etmek", type: "kelime/ifade", sample: "" },
  "posterity": { tr: "gelecek nesiller", type: "kelime/ifade", sample: "" },
  "precaution": { tr: "önlem, tedbir", type: "isim", sample: "Take extra precautions when working with chemicals." },
  "precision": { tr: "hassasiyet, kesinlik", type: "kelime/ifade", sample: "" },
  "predatory": { tr: "avcı, yırtıcı", type: "kelime/ifade", sample: "" },
  "predict": { tr: "öngörmek, tahmin etmek", type: "fiil", sample: "It is difficult to predict earthquakes accurately." },
  "predominant": { tr: "baskın, en büyük", type: "kelime/ifade", sample: "" },
  "prejudice": { tr: "ön yargı", type: "isim", sample: "Education is the best weapon against prejudice." },
  "preservation": { tr: "koruma, muhafaza", type: "isim", sample: "Preservation of wildlife is vital." },
  "preserve": { tr: "korumak", type: "kelime/ifade", sample: "" },
  "prevalent": { tr: "yaygın, hakim", type: "sıfat", sample: "Flu viruses are prevalent during cold winter months." },
  "prevent": { tr: "önlemek, engel olmak", type: "fiil", sample: "Clean drinking water prevents waterborne diseases." },
  "profound": { tr: "derin, köklü, çok büyük", type: "sıfat", sample: "Einstein's theory had a profound impact on physics." },
  "proliferate": { tr: "hızla çoğalmak", type: "kelime/ifade", sample: "" },
  "prolonged": { tr: "uzun süreli, uzatılmış", type: "sıfat", sample: "Prolonged exposure to sun causes burns." },
  "prominent": { tr: "önde gelen, belirgin, tanınmış", type: "sıfat", sample: "She is a prominent researcher in genetics." },
  "promote": { tr: "teşvik etmek, desteklemek; terfi ettirmek", type: "fiil", sample: "The campaign promotes healthy eating habits." },
  "promptly": { tr: "derhal, zamanında", type: "kelime/ifade", sample: "" },
  "proponent": { tr: "savunucu", type: "kelime/ifade", sample: "" },
  "prosperity": { tr: "refah, zenginlik, bayındırlık", type: "isim", sample: "Peace brought unprecedented prosperity to the city." },
  "prove": { tr: "kanıtlamak", type: "kelime/ifade", sample: "" },
  "provide": { tr: "sağlamak, temin etmek", type: "fiil", sample: "The sun provides warmth and energy." },
  "provided": { tr: "şartıyla, koşuluyla; sağlanan", type: "bağlaç/sıfat", sample: "Provided that you study, you will succeed." },
  "provided that": { tr: "şartıyla, koşuluyla", type: "bağlaç", sample: "You can go out provided that you finish your homework." },
  "providing": { tr: "şartıyla, koşuluyla", type: "bağlaç", sample: "Providing you finish on time, you can leave." },
  "purchasing": { tr: "satın alma", type: "kelime/ifade", sample: "" },
  "pursue": { tr: "kovalamak, takip etmek, sürdürmek", type: "fiil", sample: "She decided to pursue a medical career." },
  "put off": { tr: "ertelemek", type: "phrasal verb", sample: "Don't put off until tomorrow what you can do today." },
  "put up with": { tr: "katlanmak, tahammül etmek", type: "phrasal verb", sample: "I cannot put up with this unbearable noise anymore." },
  "quality of life": { tr: "yaşam kalitesi", type: "kelime/ifade", sample: "" },
  "quantum": { tr: "kuantum", type: "kelime/ifade", sample: "" },
  "quota": { tr: "kota", type: "kelime/ifade", sample: "" },
  "rainforest": { tr: "yağmur ormanı", type: "kelime/ifade", sample: "" },
  "rapidly": { tr: "hızla", type: "kelime/ifade", sample: "" },
  "ratify": { tr: "onaylamak, yürürlüğe koymak", type: "kelime/ifade", sample: "" },
  "rational": { tr: "mantıklı, rasyonel", type: "kelime/ifade", sample: "" },
  "recession": { tr: "durgunluk, ekonomik gerileme", type: "isim", sample: "The country entered a protracted economic recession." },
  "reconcile": { tr: "uzlaştırmak, arayı bulmak", type: "fiil", sample: "It is hard to reconcile these opposing opinions." },
  "recurring": { tr: "tekrarlayan", type: "kelime/ifade", sample: "" },
  "redistribute": { tr: "yeniden dağıtmak", type: "kelime/ifade", sample: "" },
  "reduce": { tr: "azaltmak", type: "kelime/ifade", sample: "" },
  "reduction": { tr: "düşüş, azalma", type: "kelime/ifade", sample: "" },
  "regardless of": { tr: "-e bakılmaksızın, -den bağımsız olarak", type: "kelime/ifade", sample: "" },
  "regular": { tr: "düzenli", type: "kelime/ifade", sample: "" },
  "reinforce": { tr: "güçlendirmek, pekiştirmek", type: "fiil", sample: "The results reinforce our initial hypothesis." },
  "rejection": { tr: "ret, geri çevirme, kabul etmeme", type: "isim", sample: "His proposal met with immediate rejection." },
  "relative": { tr: "akraba", type: "kelime/ifade", sample: "" },
  "relentless": { tr: "dur durak bilmeyen, amansız", type: "kelime/ifade", sample: "" },
  "reliable": { tr: "güvenilir", type: "kelime/ifade", sample: "" },
  "reliance on": { tr: "bağımlılık, güven", type: "kelime/ifade", sample: "" },
  "reliant": { tr: "bağımlı", type: "kelime/ifade", sample: "" },
  "relieve": { tr: "rahatlatmak, dindirmek", type: "fiil", sample: "The medication quickly relieved his headache." },
  "reluctance": { tr: "isteksizlik, gönülsüzlük", type: "isim", sample: "She showed reluctance to answer questions." },
  "reluctant": { tr: "isteksiz, gönülsüz", type: "sıfat", sample: "He was reluctant to admit his obvious mistake." },
  "rely on": { tr: "bel bağlamak, güvenmek", type: "kelime/ifade", sample: "" },
  "remarkable": { tr: "dikkat çekici", type: "kelime/ifade", sample: "" },
  "replace": { tr: "yerini almak", type: "kelime/ifade", sample: "" },
  "reserve": { tr: "ihtiyat, rezerv", type: "kelime/ifade", sample: "" },
  "reservoir": { tr: "hazne, depo", type: "kelime/ifade", sample: "" },
  "resilience": { tr: "dayanıklılık, toparlanma gücü", type: "kelime/ifade", sample: "" },
  "restrict": { tr: "sınırlandırmak", type: "kelime/ifade", sample: "" },
  "retain": { tr: "muhafaza etmek, elde tutmak", type: "fiil", sample: "The soil retains moisture exceptionally well." },
  "reveal": { tr: "açığa çıkarmak, gözler önüne sermek", type: "fiil", sample: "The study revealed unexpected facts about ocean depths." },
  "revitalization": { tr: "yeniden canlandırma", type: "kelime/ifade", sample: "" },
  "revolutionize": { tr: "devrim yaratmak", type: "kelime/ifade", sample: "" },
  "rigorous": { tr: "sıkı, zorlu", type: "kelime/ifade", sample: "" },
  "rooftop": { tr: "çatı", type: "kelime/ifade", sample: "" },
  "routine": { tr: "rutin", type: "kelime/ifade", sample: "" },
  "rule out": { tr: "elemek, hariç tutmak", type: "kelime/ifade", sample: "" },
  "run out of": { tr: "tükenmek, bitirmek", type: "phrasal verb", sample: "The hikers ran out of clean water in the desert." },
  "safeguard": { tr: "koruma önlemi", type: "kelime/ifade", sample: "" },
  "safety": { tr: "güvenlik", type: "kelime/ifade", sample: "" },
  "salinity": { tr: "tuzluluk", type: "kelime/ifade", sample: "" },
  "sanction": { tr: "yaptırım", type: "kelime/ifade", sample: "" },
  "sanitation": { tr: "hıfzıssıhha, hijyen, sıhhi tesisat", type: "isim", sample: "Good sanitation prevents infections." },
  "saturation": { tr: "doygunluk", type: "kelime/ifade", sample: "" },
  "scab": { tr: "kabuk bağlama, bitki uyuzu", type: "kelime/ifade", sample: "" },
  "scaffolding": { tr: "destek, iskele", type: "kelime/ifade", sample: "" },
  "scarce": { tr: "kıt, az, nadir", type: "sıfat", sample: "Fresh water is scarce in arid regions." },
  "scarcity": { tr: "kıtlık, yetersizlik", type: "isim", sample: "Water scarcity is an acute issue in desert zones." },
  "scatter": { tr: "saçmak, dağıtmak", type: "kelime/ifade", sample: "" },
  "sediment": { tr: "tortu, çökelti", type: "kelime/ifade", sample: "" },
  "sensor": { tr: "algılayıcı", type: "kelime/ifade", sample: "" },
  "sequence": { tr: "dizilim, sıra", type: "kelime/ifade", sample: "" },
  "set up": { tr: "kurmak, tesis etmek", type: "phrasal verb", sample: "They set up a new scientific laboratory." },
  "settle on": { tr: "üzerinde karar kılmak", type: "kelime/ifade", sample: "" },
  "settlement": { tr: "yerleşim", type: "kelime/ifade", sample: "" },
  "severe": { tr: "şiddetli, ağır, ciddi", type: "sıfat", sample: "A severe storm hit the coastline." },
  "sharply": { tr: "keskin bir biçimde", type: "kelime/ifade", sample: "" },
  "shift": { tr: "kayma, değişim; vardiye", type: "isim/fiil", sample: "A notable shift towards renewable energy is under way." },
  "shorten": { tr: "kısaltmak", type: "kelime/ifade", sample: "" },
  "significantly": { tr: "önemli ölçüde", type: "kelime/ifade", sample: "" },
  "simultaneous": { tr: "eş zamanlı, aynı andaki", type: "sıfat", sample: "There were simultaneous explosions in three cities." },
  "since": { tr: "-den beri; -dığı için, çünkü", type: "bağlaç/edat", sample: "Since you are here, let's begin." },
  "slowing down": { tr: "yavaşlama", type: "kelime/ifade", sample: "" },
  "so that": { tr: "-sın diye, amacıyla", type: "bağlaç", sample: "Speak clearly so that everyone understands." },
  "sole means": { tr: "tek yol, yegane araç", type: "kelime/ifade", sample: "" },
  "source": { tr: "kaynak", type: "kelime/ifade", sample: "" },
  "species": { tr: "tür (biyolojik)", type: "isim", sample: "Thousands of species face the danger of extinction." },
  "spread": { tr: "yayılma", type: "kelime/ifade", sample: "" },
  "stability": { tr: "istikrar", type: "kelime/ifade", sample: "" },
  "staple": { tr: "temel gıda", type: "kelime/ifade", sample: "" },
  "stimulate": { tr: "uyarmak, canlandırmak, harekete geçirmek", type: "fiil", sample: "Coffee can stimulate mental alertness." },
  "stimulation": { tr: "uyarım", type: "kelime/ifade", sample: "" },
  "storm surge": { tr: "fırtına kabarması/dalgası", type: "kelime/ifade", sample: "" },
  "strain": { tr: "baskı, gerginlik, yük", type: "kelime/ifade", sample: "" },
  "stratosphere": { tr: "stratosfer", type: "kelime/ifade", sample: "" },
  "strengthen": { tr: "güçlendirmek", type: "kelime/ifade", sample: "" },
  "substantial": { tr: "önemli, hatırı sayılır, büyük miktarda", type: "sıfat", sample: "The project received a substantial financial grant." },
  "substantially": { tr: "önemli ölçüde", type: "kelime/ifade", sample: "" },
  "substitute": { tr: "yerini tutmak", type: "kelime/ifade", sample: "" },
  "subterranean": { tr: "yer altı", type: "kelime/ifade", sample: "" },
  "subtle": { tr: "ince, hemen fark edilmeyen, ustalıklı", type: "sıfat", sample: "There is a subtle difference between the two concepts." },
  "subtlety": { tr: "incelik", type: "kelime/ifade", sample: "" },
  "successive": { tr: "ardışık, birbirini izleyen", type: "kelime/ifade", sample: "" },
  "sufficient": { tr: "yeterli", type: "kelime/ifade", sample: "" },
  "superbug": { tr: "dirençli mikrop", type: "kelime/ifade", sample: "" },
  "superior": { tr: "üstün", type: "kelime/ifade", sample: "" },
  "supply chain": { tr: "tedarik zinciri", type: "kelime/ifade", sample: "" },
  "suppress": { tr: "baskılamak", type: "kelime/ifade", sample: "" },
  "surveillance": { tr: "gözetim, izleme", type: "kelime/ifade", sample: "" },
  "susceptible": { tr: "duyarlı, hassas, yatkın", type: "kelime/ifade", sample: "" },
  "sustain": { tr: "sürdürmek, devam ettirmek, ayakta tutmak", type: "fiil", sample: "The ecosystem cannot sustain such high pollution." },
  "sustainable": { tr: "sürdürülebilir, devam ettirilebilir", type: "sıfat", sample: "Solar energy is an eco-friendly, sustainable resource." },
  "symbiotic": { tr: "simbiyotik, ortak yaşayan", type: "kelime/ifade", sample: "" },
  "synaptic": { tr: "sinaptik", type: "kelime/ifade", sample: "" },
  "synthetic": { tr: "yapay, sentetik", type: "kelime/ifade", sample: "" },
  "take after": { tr: "benzemek (ebeveyne/akrabaya)", type: "phrasal verb", sample: "He takes after his father in temperament." },
  "tedious": { tr: "sıkıcı, bıktırıcı, can sıkıcı", type: "sıfat", sample: "Data entry can be a tedious and repetitive job." },
  "telescope": { tr: "teleskop", type: "kelime/ifade", sample: "" },
  "temperate": { tr: "ılıman", type: "kelime/ifade", sample: "" },
  "tendency": { tr: "eğilim, meyil", type: "isim", sample: "There is an increasing tendency towards remote work." },
  "terminate": { tr: "sonlandırmak, bitirmek", type: "fiil", sample: "The contract was terminated due to breach of terms." },
  "thanks to": { tr: "sayesinde", type: "edat öbeği", sample: "Thanks to your help, we finished early." },
  "therapeutic": { tr: "tedavi edici, iyileştirici", type: "sıfat", sample: "Thermal waters have therapeutic power." },
  "therefore": { tr: "bu nedenle, dolayısıyla, bundan ötürü", type: "geçiş kelimesi", sample: "He broke the rules; therefore, he was disqualified." },
  "threat": { tr: "tehdit, tehlike", type: "isim", sample: "Cyberattacks are a modern threat to infrastructure." },
  "thrive": { tr: "gelişmek, serpilmek", type: "kelime/ifade", sample: "" },
  "thus": { tr: "böylece, bu doğrultuda, nitekim", type: "geçiş kelimesi", sample: "He worked day and night, thus achieving his goal." },
  "timeline": { tr: "zaman çizelgesi", type: "kelime/ifade", sample: "" },
  "tissue": { tr: "doku", type: "kelime/ifade", sample: "" },
  "trafficker": { tr: "kaçakçı", type: "kelime/ifade", sample: "" },
  "transcribe": { tr: "yazarak kopyalamak", type: "kelime/ifade", sample: "" },
  "transform": { tr: "dönüştürmek", type: "kelime/ifade", sample: "" },
  "transmission": { tr: "bulaşma, aktarım", type: "kelime/ifade", sample: "" },
  "transmit": { tr: "iletmek, aktarmak", type: "kelime/ifade", sample: "" },
  "transparency": { tr: "şeffaflık", type: "kelime/ifade", sample: "" },
  "treatise": { tr: "bilimsel risale, tez", type: "kelime/ifade", sample: "" },
  "trench": { tr: "çukur, hendek", type: "kelime/ifade", sample: "" },
  "trigger": { tr: "tetiklemek, başlatmak, yol açmak", type: "fiil", sample: "Allergies can trigger severe asthma attacks." },
  "trust": { tr: "güvenmek", type: "kelime/ifade", sample: "" },
  "turn down": { tr: "reddetmek; kısmak (ses, ısı)", type: "phrasal verb", sample: "She turned down the prestigious job offer in Paris." },
  "ubiquitous": { tr: "her yerde bulunan, yaygın", type: "sıfat", sample: "Plastic pollution is now ubiquitous in the oceans." },
  "unauthorized": { tr: "izinsiz, yetkisiz", type: "kelime/ifade", sample: "" },
  "uncharted": { tr: "haritası çıkarılmamış, bilinmeyen", type: "kelime/ifade", sample: "" },
  "undermine": { tr: "baltalamak, zayıflatmak, sarsmak", type: "fiil", sample: "Corruption undermines public confidence in institutions." },
  "undiscovered": { tr: "keşfedilmemiş", type: "kelime/ifade", sample: "" },
  "unearthed": { tr: "toprak altından çıkarılmış", type: "kelime/ifade", sample: "" },
  "unforeseen": { tr: "öngörülemeyen", type: "kelime/ifade", sample: "" },
  "uniform": { tr: "tekdüze, standart", type: "kelime/ifade", sample: "" },
  "uninterrupted": { tr: "kesintisiz", type: "kelime/ifade", sample: "" },
  "unless": { tr: "-medikçe, -mezse, meğer ki", type: "bağlaç", sample: "Do not go unless you are invited." },
  "unmitigated": { tr: "hafifletilmemiş, kesintisiz", type: "kelime/ifade", sample: "" },
  "unprecedented": { tr: "eşi benzeri görülmemiş", type: "kelime/ifade", sample: "" },
  "urban": { tr: "kentsel", type: "kelime/ifade", sample: "" },
  "urban planner": { tr: "şehir planlamacısı", type: "kelime/ifade", sample: "" },
  "utilize": { tr: "kullanmak, yararlanmak, istifade etmek", type: "fiil", sample: "Solar panels utilize sunlight to create electricity." },
  "validity": { tr: "geçerlilik, geçerlik", type: "isim", sample: "Scientists questioned the validity of his findings." },
  "variability": { tr: "çeşitlilik", type: "kelime/ifade", sample: "" },
  "vital importance": { tr: "hayati önem", type: "kelime/ifade", sample: "" },
  "volatility": { tr: "oynaklık, dalgalanma", type: "kelime/ifade", sample: "" },
  "vulnerability": { tr: "savunmasızlık", type: "kelime/ifade", sample: "" },
  "vulnerable": { tr: "savunmasız, hassas, incinebilir", type: "sıfat", sample: "Elderly people are especially vulnerable to influenza." },
  "waste sorting": { tr: "atık ayrıştırma", type: "kelime/ifade", sample: "" },
  "wetland": { tr: "sulak alan", type: "kelime/ifade", sample: "" },
  "wheat": { tr: "buğday", type: "kelime/ifade", sample: "" },
  "whereas": { tr: "oysa, halbuki, -e karşın", type: "bağlaç", sample: "Some like tea, whereas others prefer coffee." },
  "while": { tr: "-iken, -e rağmen", type: "bağlaç", sample: "While I agree in part, I have doubts." },
  "wholesale": { tr: "toptan", type: "kelime/ifade", sample: "" },
  "wipe out": { tr: "yok etmek, kökünü kazımak", type: "phrasal verb", sample: "An epidemic wiped out nearly half the village." },
  "with regard to": { tr: "ilişkin olarak, hakkında", type: "edat öbeği", sample: "With regard to your inquiry, we will reply soon." },
  "withstand": { tr: "dayanmak, direnmek", type: "kelime/ifade", sample: "" },
  "work on": { tr: "üzerinde çalışmak", type: "kelime/ifade", sample: "" },
  "yield": { tr: "ürün vermek; teslim olmak; getiri", type: "fiil/isim", sample: "This field yields high quality crops." }
};

// Çeviri Motoru:
// 1. Önbellek
// 2. 600+ Doğrulanmış Dahili YDS Sözlüğü
// 3. Soru Bankası (wordAnalysis) Doğrudan Eşleştirme
// 4. Kök Bulma & Lemmatization (provide/provided, -ed, -s, -ing, -ly)
// 5. Yüksek Doğruluklu Google Translate GTX API
// 6. Güvenlik ve çöp çeviri filtresi
class YDSDictionaryEngine {
  constructor() {
    this.cache = new Map();
    this.dynamicHarvested = new Map();
    this.initDynamicHarvest();
  }

  // Sorulardaki doğrulanmış YDS kelime analizlerini otomatik indeksle
  initDynamicHarvest() {
    try {
      const qList = (window.INITIAL_YDS_QUESTIONS || []).concat(window.PRACTICE_YDS_QUESTIONS || []);
      qList.forEach(q => {
        if (q.wordAnalysis && typeof q.wordAnalysis === 'object') {
          Object.entries(q.wordAnalysis).forEach(([word, tr]) => {
            const clean = this.cleanWord(word);
            if (clean && tr) {
              this.dynamicHarvested.set(clean, tr);
            }
          });
        }
      });
    } catch (_) {}
  }

  cleanWord(rawWord) {
    if (!rawWord) return "";
    return rawWord
      .toLowerCase()
      .replace(/^[.,/#!$%^&*;:{}=\-_`~()?"'“”—\[\]]+|[.,/#!$%^&*;:{}=\-_`~()?"'“”—\[\]]+$/g, "")
      .trim();
  }

  async lookup(word) {
    const cleaned = this.cleanWord(word);
    if (!cleaned) return null;

    // 1. Bellek içi (In-Memory) önbellek kontrolü
    if (this.cache.has(cleaned)) {
      return this.cache.get(cleaned);
    }

    // 2. localStorage önbellek kontrolü (önceden çevrilmiş kelimeler anında gelir)
    try {
      if (typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem(`yds_dict_${cleaned}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.cache.set(cleaned, parsed);
          return parsed;
        }
      }
    } catch (_) {}

    // 3. Dahili zengin sözlük (Tam eşleşme) - YDS için doğrulanmış akademik sözlük
    if (BUILTIN_DICTIONARY[cleaned]) {
      const res = {
        word: cleaned,
        ...BUILTIN_DICTIONARY[cleaned],
        source: "yerel_sozluk"
      };
      this.saveToCache(cleaned, res);
      return res;
    }

    // 4. Sorulardan hasat edilen doğrulanmış ÖSYM analizi
    if (this.dynamicHarvested.has(cleaned)) {
      const tr = this.dynamicHarvested.get(cleaned);
      const res = {
        word: cleaned,
        tr: tr,
        type: "YDS Analizi",
        sample: "",
        source: "soru_analizi"
      };
      this.saveToCache(cleaned, res);
      return res;
    }

    // 5. Morfolojik Kök Türetme (Lemmatization)
    const variations = [];
    if (cleaned.endsWith("ies")) variations.push(cleaned.slice(0, -3) + "y");
    if (cleaned.endsWith("es")) variations.push(cleaned.slice(0, -2));
    if (cleaned.endsWith("s") && !cleaned.endsWith("ss")) variations.push(cleaned.slice(0, -1));
    if (cleaned.endsWith("ed")) {
      variations.push(cleaned.slice(0, -2)); // e.g. played -> play
      variations.push(cleaned.slice(0, -1)); // e.g. provided -> provide, altered -> alter
    }
    if (cleaned.endsWith("ing")) {
      variations.push(cleaned.slice(0, -3));
      variations.push(cleaned.slice(0, -3) + "e"); // e.g. making -> make, providing -> provide
    }
    if (cleaned.endsWith("ly")) {
      variations.push(cleaned.slice(0, -2)); // e.g. significantly -> significant
    }

    for (const v of variations) {
      if (BUILTIN_DICTIONARY[v]) {
        const base = BUILTIN_DICTIONARY[v];
        const res = {
          word: cleaned,
          baseWord: v,
          tr: base.tr,
          type: base.type,
          sample: base.sample,
          source: "kok_turetme"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
      if (this.dynamicHarvested.has(v)) {
        const tr = this.dynamicHarvested.get(v);
        const res = {
          word: cleaned,
          baseWord: v,
          tr: tr,
          type: "YDS Analizi",
          sample: "",
          source: "kok_turetme"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
    }

    // 6. Online Çeviri Motorları (Kademeli ve Kesintisiz)
    // Seviye 1: Google Translate API (Zengin sözlük modu)
    try {
      const gResult = await this.fetchGoogleTranslation(cleaned);
      if (gResult && this.isValidTranslation(gResult.tr, cleaned)) {
        const res = {
          word: cleaned,
          tr: gResult.tr,
          type: gResult.type || "çeviri",
          sample: gResult.sample || "",
          source: "google_translate"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
    } catch (e) {
      console.warn("Google Çeviri Servisi yanıt vermedi:", e);
    }

    // Seviye 2: Alternatif Google Single GTX Endpoint'i
    try {
      const gtxAlt = await this.fetchGoogleAltTranslation(cleaned);
      if (gtxAlt && this.isValidTranslation(gtxAlt, cleaned)) {
        const res = {
          word: cleaned,
          tr: gtxAlt,
          type: "çeviri",
          sample: "",
          source: "google_gtx_alt"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
    } catch (e) {
      console.warn("Google Alt Çeviri başarısız:", e);
    }

    // Seviye 3: MyMemory Translation API
    try {
      const mmResult = await this.fetchMyMemoryTranslation(cleaned);
      if (mmResult && this.isValidTranslation(mmResult, cleaned)) {
        const res = {
          word: cleaned,
          tr: mmResult,
          type: "çeviri",
          sample: "",
          source: "mymemory"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
    } catch (e) {
      console.warn("MyMemory Servisi yanıt vermedi:", e);
    }

    // Seviye 4: Lingva / Açık Çeviri API
    try {
      const lingvaResult = await this.fetchLingvaTranslation(cleaned);
      if (lingvaResult && this.isValidTranslation(lingvaResult, cleaned)) {
        const res = {
          word: cleaned,
          tr: lingvaResult,
          type: "çeviri",
          sample: "",
          source: "lingva"
        };
        this.saveToCache(cleaned, res);
        return res;
      }
    } catch (_) {}

    // 7. Çeviri tamamen bulunamadıysa kullanıcı dostu temiz mesaj
    return {
      word: cleaned,
      tr: "Çeviri şu anda alınamadı (İnternet bağlantınızı kontrol edin)",
      type: "kelime",
      source: "varsayilan"
    };
  }

  saveToCache(key, data) {
    this.cache.set(key, data);
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`yds_dict_${key}`, JSON.stringify(data));
      }
    } catch (_) {}
  }

  // 1. Google Translate GTX Servisi (Gelişmiş & Hataları Giderilmiş)
  async fetchGoogleTranslation(word) {
    const lowerWord = word.toLowerCase().trim();
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=tr&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(lowerWord)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (!data) return null;

      let meanings = [];
      let wordType = "çeviri";

      // dict verisi: data[1] sözlük detaylarını içerir [ [ "noun", ["anlam1", "anlam2"] ], ... ]
      if (data[1] && Array.isArray(data[1])) {
        data[1].forEach(part => {
          if (part[0] && typeof part[0] === 'string' && !wordType) {
            wordType = part[0];
          }
          if (part[1] && Array.isArray(part[1])) {
            part[1].forEach(m => {
              if (m && typeof m === 'string' && !meanings.includes(m.trim())) {
                meanings.push(m.trim());
              }
            });
          }
        });
      }

      let translation = "";
      if (meanings.length > 0) {
        // En yaygın ilk 3 anlamı virgülle birleştir
        translation = meanings.slice(0, 3).join(", ");
      } else if (data[0] && Array.isArray(data[0])) {
        // Doğrudan cümle/kelime çevirisi
        translation = data[0].map(item => item[0]).filter(Boolean).join(" ").trim();
      }

      if (translation) {
        return {
          tr: translation,
          type: wordType || "çeviri"
        };
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  // 2. Google Translate Alternatif Endpoint (client=dict-chrome-ex)
  async fetchGoogleAltTranslation(word) {
    const lowerWord = word.toLowerCase().trim();
    const url = `https://translate.googleapis.com/translate_a/single?client=dict-chrome-ex&sl=en&tl=tr&dt=t&q=${encodeURIComponent(lowerWord)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (data && data[0] && data[0][0] && data[0][0][0]) {
        return data[0][0][0].trim();
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  // 3. MyMemory Çeviri Servisi
  async fetchMyMemoryTranslation(word) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(word)}&langpair=en|tr`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();

      if (data && data.responseData && data.responseData.translatedText) {
        const text = data.responseData.translatedText.trim();
        // MyMemory bazen çeviri bulamadığında eşleşen metin yerine orijinalini döner
        if (text.toLowerCase() === word.toLowerCase()) return null;
        return text;
      }
      return null;
    } catch (err) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  // 4. Lingva / Public Translate API (Yedek)
  async fetchLingvaTranslation(word) {
    const url = `https://lingva.ml/api/v1/en/tr/${encodeURIComponent(word)}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) return null;
      const data = await response.json();
      if (data && data.translation) {
        return data.translation.trim();
      }
      return null;
    } catch (_) {
      clearTimeout(timeoutId);
      return null;
    }
  }

  // Çöp Çeviri Filtresi (Örn: 'tara l  e he', tek harfli saçmalıklar veya noktalama işaretlerini engeller)
  isValidTranslation(trText, originalWord) {
    if (!trText || typeof trText !== 'string') return false;
    const lower = trText.toLowerCase().trim();
    if (lower === originalWord.toLowerCase().trim()) return false;
    if (lower.length <= 1) return false;
    // Harfler arasında tek tek boşluklar varsa (çöp OCR verisi: 't a r a')
    if (/ [a-zA-ZçğıöşüÇĞİÖŞÜ]\s+[a-zA-ZçğıöşüÇĞİÖŞÜ]\s+[a-zA-ZçğıöşüÇĞİÖŞÜ] /.test(lower)) {
      return false;
    }
    // "MYMEMORY WARNING" gibi hata loglarını engelle
    if (lower.includes("mymemory warning") || lower.includes("quota exceeded")) {
      return false;
    }
    return true;
  }
}

// Global nesneler
if (typeof window !== 'undefined') {
  window.ydsDictionary = new YDSDictionaryEngine();
  window.BUILTIN_DICTIONARY = BUILTIN_DICTIONARY;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BUILTIN_DICTIONARY, YDSDictionaryEngine };
}
