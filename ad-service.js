// YDS Soru Filtreleme - Google AdMob Reklam Yönetim Servisi (ad-service.js)

class YDSAdService {
  constructor() {
    this.isNative = typeof window.Capacitor !== 'undefined' && window.Capacitor.isNativePlatform();
    this.platform = this.isNative ? window.Capacitor.getPlatform() : 'web'; // 'android', 'ios', 'web'
    this.isInitialized = false;
    this.interstitialLoaded = false;
    this.rewardedLoaded = false;
    this.bannerVisible = false;

    // Google AdMob Reklam Kimlikleri (Android Canlı / iOS Test)
    this.adUnits = {
      android: {
        banner: 'ca-app-pub-4561261731825506/3794853851',
        interstitial: 'ca-app-pub-4561261731825506/3950037571',
        rewarded: 'ca-app-pub-4561261731825506/7328728589'
      },
      ios: {
        banner: 'ca-app-pub-3940256099942544/2934735716',
        interstitial: 'ca-app-pub-3940256099942544/4411468910',
        rewarded: 'ca-app-pub-3940256099942544/1712485313'
      }
    };

    // Soru sayaci (her 20 soruda bir gecis reklami tetiklemek icin)
    this.practiceAnswerCount = 0;
    this.interstitialInterval = 20;

    this.init();
  }

  isTestAd(adUnitId) {
    return !adUnitId || adUnitId.includes('3940256099942544');
  }

  async init() {
    if (!this.isNative) {
      console.log('ℹ️ [YDSAdService] Web/Safari ortamında çalışıyor. Reklamlar simülasyon modunda.');
      this.isInitialized = true;
      return;
    }

    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) {
        console.warn('⚠️ [YDSAdService] AdMob eklentisi bulunamadı.');
        return;
      }

      // iOS ATT (App Tracking Transparency) İzni İsteme
      if (this.platform === 'ios') {
        try {
          await AdMob.requestTrackingAuthorization();
        } catch (e) {
          console.log('ATT authorization request:', e);
        }
      }

      // AdMob SDK'sını Başlat (Canlı Android ID ile initializeForTesting: false)
      const isTestEnv = this.platform === 'ios';
      await AdMob.initialize({
        testingDevices: isTestEnv ? ['EMULATOR'] : [],
        initializeForTesting: isTestEnv
      });

      this.isInitialized = true;
      console.log('✅ [YDSAdService] AdMob başarıyla başlatıldı. Platform:', this.platform, 'Canlı Mod:', !isTestEnv);

      // Reklamları önceden arka planda hazırla (Preload)
      await this.prepareInterstitial();
      await this.prepareRewarded();

    } catch (err) {
      console.error('❌ [YDSAdService] AdMob başlatma hatası:', err);
    }
  }

  getAdUnitId(type) {
    const p = this.platform === 'ios' ? 'ios' : 'android';
    return this.adUnits[p][type];
  }

  // --- 1. Tam Ekran Geçiş Reklamı (Interstitial) ---
  async prepareInterstitial() {
    if (!this.isNative) return;
    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) return;

      const adId = this.getAdUnitId('interstitial');
      await AdMob.prepareInterstitial({
        adId: adId,
        isTesting: this.isTestAd(adId)
      });
      this.interstitialLoaded = true;
      console.log('✅ [YDSAdService] Geçiş reklamı belleğe yüklendi.');
    } catch (e) {
      this.interstitialLoaded = false;
      console.warn('Geçiş reklamı hazırlama uyarısı:', e);
    }
  }

  async showInterstitial() {
    if (!this.isNative) {
      this.showWebMockToast('🎬 [Test Modu] Tam Ekran Geçiş Reklamı Gösterildi');
      return true;
    }

    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) return false;

      if (!this.interstitialLoaded) {
        await this.prepareInterstitial();
      }

      await AdMob.showInterstitial();
      this.interstitialLoaded = false;
      // Bir sonraki gösterim için hemen arkada yenisini hazırla
      setTimeout(() => this.prepareInterstitial(), 2000);
      return true;
    } catch (err) {
      console.warn('[YDSAdService] Geçiş reklamı gösterilemedi:', err);
      // Hata durumunda da akışı engelleme
      this.prepareInterstitial();
      return false;
    }
  }

  // Soru çözümünde sayaç artır ve gerekirse reklam göster
  onQuestionAnswered() {
    this.practiceAnswerCount++;
    if (this.practiceAnswerCount >= this.interstitialInterval) {
      this.practiceAnswerCount = 0;
      // Kullanıcı sorunun sonucunu gördükten kısa bir süre sonra
      setTimeout(() => {
        this.showInterstitial();
      }, 800);
    }
  }

  // --- 2. Ödüllü Video Reklamı (Rewarded Ads) ---
  async prepareRewarded() {
    if (!this.isNative) return;
    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) return;

      const adId = this.getAdUnitId('rewarded');
      await AdMob.prepareRewardVideoAd({
        adId: adId,
        isTesting: this.isTestAd(adId)
      });
      this.rewardedLoaded = true;
      console.log('✅ [YDSAdService] Ödüllü video belleğe yüklendi.');
    } catch (e) {
      this.rewardedLoaded = false;
      console.warn('Ödüllü reklam hazırlama uyarısı:', e);
    }
  }

  async showRewarded(onRewardCallback) {
    if (!this.isNative) {
      this.showWebMockToast('🎁 [Test Modu] 15 sn Ödüllü Video İzlendi. Ödül Açıldı!');
      if (typeof onRewardCallback === 'function') {
        onRewardCallback({ amount: 1, type: 'reward' });
      }
      return;
    }

    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) return;

      if (!this.rewardedLoaded) {
        await this.prepareRewarded();
      }

      // Ödül kazanma olayını dinle
      const rewardListener = await AdMob.addListener('onRewarded', (reward) => {
        console.log('🎉 [YDSAdService] Ödül kazanıldı:', reward);
        if (typeof onRewardCallback === 'function') {
          onRewardCallback(reward);
        }
        rewardListener.remove();
      });

      await AdMob.showRewardVideoAd();
      this.rewardedLoaded = false;
      setTimeout(() => this.prepareRewarded(), 2000);

    } catch (err) {
      console.error('[YDSAdService] Ödüllü reklam gösterilemedi:', err);
      alert('Reklam yüklenirken bir sorun oluştu. Lütfen bağlantınızı kontrol edin.');
      this.prepareRewarded();
    }
  }

  // --- 3. Alt Banner Reklamı ---
  async showBanner() {
    if (!this.isNative) {
      console.log('ℹ️ [YDSAdService] Web banner simülasyonu.');
      return;
    }

    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (!AdMob) return;

      const adId = this.getAdUnitId('banner');
      await AdMob.showBanner({
        adId: adId,
        isTesting: this.isTestAd(adId),
        position: 'BOTTOM_CENTER',
        margin: 0
      });
      this.bannerVisible = true;
    } catch (e) {
      console.warn('Banner gösterilemedi:', e);
    }
  }

  async hideBanner() {
    if (!this.isNative) return;
    try {
      const { AdMob } = window.Capacitor.Plugins;
      if (AdMob && this.bannerVisible) {
        await AdMob.hideBanner();
        this.bannerVisible = false;
      }
    } catch (e) {
      console.warn('Banner gizleme uyarısı:', e);
    }
  }

  // Web / Safari Testinde zararsız görsel bildirim
  showWebMockToast(message) {
    const existing = document.getElementById('adMockToast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'adMockToast';
    toast.innerHTML = '<span>📢</span><span>' + message + '</span>';
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
}

// Global Ad Service örneğini başlat
window.ydsAdService = new YDSAdService();
