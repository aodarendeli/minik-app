# App Store / Google Play — yayın kontrol listesi

Durum: kod tarafı hazır (2026-11-14). Aşağıdaki **[SEN]** adımları hesap ve karar gerektirir; kod değiştirmeden yapılır.

## 1. Kararlar ve hesaplar [SEN]
- [ ] Apple Developer Program üyeliği (yıllık ücretli) ve Google Play Console hesabı.
- [x] **Bundle ID / paket adı**: `com.aodarendeli.minik` (app.json `ios.bundleIdentifier`, `android.package`).
      İlk yüklemeden sonra DEĞİŞTİRME: değişirse mağaza bunu yeni uygulama sayar, kullanıcı verileri taşınmaz.
- [ ] **Uygulama adı**: "Minik" (app.json `name`). App Store'da isim benzersiz olmalı; doluysa "Minik: Bebek Defteri" gibi.
- [x] **Destek e-postası**: app.json `extra.supportEmail` ayarlı.
- [ ] **Gizlilik politikası URL'si** (zorunlu): `docs/legal/index.html` dosyasını herkese açık bir yerde yayınla
      (GitHub Pages, Netlify, kendi siten). Aynı URL'yi App Store Connect ve Play Console'a gir.
- [ ] **Destek URL'si** (App Store zorunlu): aynı sayfa veya basit bir iletişim sayfası.

## 2. Derleme (EAS) [SEN, bir kez kurulum]
```bash
npm i -g eas-cli
eas login
eas init                 # projeyi Expo hesabına bağlar, app.json'a projectId ekler
eas build -p ios --profile production
eas build -p android --profile production
eas submit -p ios        # TestFlight / App Store Connect'e yükler
eas submit -p android
```
- `eas.json` hazır: `production` profili build numarasını otomatik artırır (`appVersionSource: remote`).
- Yayından önce **production build'i gerçek cihazda dene** (Android R8 küçültme açık; çökme olursa keep kuralı gerekir).

## 3. App Store Connect formları (cevaplar)
**App Privacy ("nutrition label")**: *Data Not Collected*. Gerekçe: hesap, sunucu, analiz, reklam, çökme
raporlama yok; veriler cihazda kalır. (İleride analytics/crash SDK eklenirse bu cevap değişir.)

**Privacy manifest**: app.json `ios.privacyManifests` → `PrivacyInfo.xcprivacy` (takip yok, toplanan veri yok,
gerekçeli API'ler: UserDefaults CA92.1, FileTimestamp C617.1, SystemBootTime 35F9.1, DiskSpace E174.1).

**Export compliance (şifreleme)**: `ITSAppUsesNonExemptEncryption = false` ayarlı; form sorulmaz.

**Age rating**: tüm sorulara "Yok/None"; "Medical/Treatment Information" → *Infrequent/Mild*. Beklenen: 4+ (veya 9+).
Uygulama "Made for Kids" **değil** (ebeveynler için).

**Kategori**: Birincil *Medical* veya *Health & Fitness*; ikincil *Lifestyle*. (Medical seçilirse inceleme daha
dikkatli olur; uygulama tıbbi cihaz değil, kayıt defteri — açıklamada bunu net söyle.)

**Review notes (İnceleme notu, İngilizce yaz)**:
> Minik is a logbook for parents (feeding, sleep, diapers, lab values they copy from their own lab sheet).
> No account, no server: all data stays on the device. The app does not diagnose, does not provide medical advice
> and ships no reference ranges; "below/above range" only restates the range the parent typed from their lab
> report, in neutral wording. First launch: accept the terms checkbox, enter any name and a baby to reach the app.
> Timer notifications are local only.

## 4. Google Play Console formları
- **Data safety**: "No data collected", "No data shared". Şifreleme sorusu: veri cihazdan çıkmaz.
- **Health apps declaration**: kategori *Health & fitness / Medical reference değil*; "uygulama tıbbi cihaz değildir"
  işaretle. Gizlilik politikası URL'si zorunlu.
- **Target audience**: 18+ (ebeveynler); "Çocuklara yönelik" değil.
- **Content rating (IARC)**: anketi doldur; şiddet/kumar vb. yok.
- İzinler: app.json `android.permissions: []`; gereksiz depolama/mikrofon izinleri engellendi.

## 5. Mağaza metinleri (taslak)
**Alt başlık (30 kr.)**: Beslenme, uyku ve bez defteri
**Promosyon metni**: Bebeğinin bakımını iki dokunuşla kaydet. Hesap yok, veriler yalnızca telefonunda.
**Açıklama**:
> Minik, yeni ebeveynler için sade bir bakım defteri.
> • Emzirme (sol/sağ sayacı), biberon, ek gıda, bez ve uyku kayıtları
> • Günlük özet ve geçmiş akışı
> • Tahlil sonuçlarını laboratuvar raporundaki aralıkla birlikte saklama
> • Doktora götürmek için günlük/haftalık PDF rapor
> • 5 renk paleti, açık/koyu ve göz yormayan gece teması
> • Hesap gerekmez; verilerin yalnızca cihazında saklanır
> Minik tıbbi tavsiye vermez ve teşhis koymaz; sağlıkla ilgili kararlar için çocuk doktorunuza danışın.
**Anahtar kelimeler (100 kr.)**: bebek,emzirme,anne,bez,uyku,biberon,takip,yenidoğan,sarılık,tahlil,bebek bakımı

## 6. Ekran görüntüleri [SEN]
- iPhone 6.9" (1320×2868) zorunlu set: Bugün, Emzirme sayacı, Akış, Tahliller, Rapor. iPad desteği kapalı
  (`supportsTablet: false`) → iPad görüntüsü gerekmez.
- Gerçek bebek adı/fotoğrafı kullanma; örnek veri (Ayarlar > Örnek verileri yükle, sadece geliştirme sürümünde).

## 7. Uygulama içinde hazır olanlar (kod)
- İlk açılışta **Kullanım Koşulları + Gizlilik + Tıbbi uyarı onayı** (zorunlu kutucuk, sürümlü: `LEGAL_VERSION`).
  Metin değişirse `LEGAL_VERSION`'ı artır → herkes yeniden onaylar.
- Ayarlar > Yasal: üç metin + uygulama sürümü; "Tüm verileri sil".
- Referans aralığı **gösterilmez**; tahlil aralığı yalnızca kullanıcının girdiği, nötr renklerle.
- Uygulama ikonu, adaptive ikon (Android), açık/koyu açılış ekranı.

## 8. Yayından önce önerilen (risk azaltma)
- [ ] Yasal metinleri bir avukata, tıbbi uyarı metnini bir çocuk doktoruna okut.
- [ ] Cihazda veri şifreleme / Face ID kilidi (ROADMAP S21) — zorunlu değil, güven artırır.
- [ ] TestFlight ile birkaç ebeveynle deneme.
