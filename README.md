# Minik — Claude Code proje paketi (okuma kılavuzu)

Bu paket, bebek besleme/bakım takip uygulamasını (React Native) Claude Code ile **ajan ekibiyle ve düşük token
harcayarak** kurman için hazırlandı. Teknik dosyalar Claude Code'un okuyacağı şekilde İngilizce yazıldı (Türkçe daha çok
token yer). Bu dosya ise sadece senin için.

## İçindekiler
| Dosya | Ne işe yarar |
|---|---|
| `CLAUDE.md` | Claude Code'un her oturumda okuduğu kısa kurallar ve doküman dizini |
| `docs/PRODUCT.md` | Ürün kapsamı, kullanıcılar, senaryolar, metin/sağlık kuralları |
| `docs/ARCHITECTURE.md` | Clean architecture, klasör yapısı, bağımlılık kuralları, lint korkulukları |
| `docs/DESIGN_SYSTEM.md` | Token sistemi, tema, headless bileşen deseni, bileşen "bitti" kriterleri |
| `docs/DOMAIN.md` | Varlıklar, sayaç durum makinesi, use-case ve repository arayüzleri |
| `docs/TIMER_AND_PRESENCE.md` | Ekran kapalıyken sayaç/bildirim, Live Activity, hatırlatıcılar, cihaz test listesi |
| `docs/TESTING.md` | Hangi testi nerede yazacağız |
| `docs/WORKFLOW.md` | Ajan döngüsü, rapor formatları, token tasarruf kuralları |
| `docs/ROADMAP.md` | S00–S18 dilimleri (her dilim = küçük, tek iş) |
| `docs/DECISIONS.md` | Teknoloji kararları ve **doğrulanması gerekenler** |
| `docs/API_CONTRACT.md` | İleride ASP.NET Core için taslak API sözleşmesi |
| `docs/PRIVACY_SECURITY.md` | Bebek verisi, izinler, KVKK/GDPR kontrol listesi |
| `docs/PERFORMANCE_AND_SIZE.md` | Uygulama boyutu kuralları, ölçüm yöntemi, bütçe politikası |
| `.claude/agents/` | `analyst`, `developer`, `tester` alt ajanları |

## Şu anki durum (10 Kasım 2026)
Uygulama çalışır halde: **Bugün** (hızlı kayıt, son beslenme, günün özeti), **Akış** (gün gün kayıtlar, sil + geri al),
**Sağlık** (kan/idrar/tarama tahlilleri, şablonlar, referans aralığına göre durum, değer geçmişi grafiği),
**Raporlar** (günlük/haftalık önizleme + **PDF oluştur ve paylaş**), **Ayarlar** (bebekler, tema: sistem/açık/koyu/gece, dil).
Emzirme ve uyku sayacı var; sayaç çalışırken bildirimde görünür (Expo Go'da sabit metin, düğmeler uygulamayı açar).
Veriler yalnızca cihazda saklanır (hesap ve backend yok). İlk açılışta kısa bir kurulum ekranı gelir: dil, ebeveyn bilgisi,
bebek bilgisi, tema ve renk paleti. Geliştirmede Ayarlar > "Örnek verileri yükle" ile 14 günlük örnek veri yüklenebilir. Sayaç test listesi: `docs/TIMER_AND_PRESENCE.md` > "Testing in Expo Go".

Çalıştırma: `yarn` → `npx expo start` → telefonda Expo Go ile QR kodu okut. Kontrol: `yarn run check`.

Neyin neden seçildiği: `docs/DECISIONS.md` (karar günlüğü). Bileşen listesi: `src/design-system/CATALOG.md`.

## Kurulum (adım adım)
1. Yeni proje oluştur: `npx create-expo-app@latest minik` ve klasöre gir.
2. Bu paketin içindekileri (`CLAUDE.md`, `docs/`, `.claude/`) proje köküne kopyala.
3. Proje klasöründe `claude` komutunu aç. Oturum modeli: **Sonnet** (varsayılan).
4. İlk mesaj olarak şunu yapıştır:

```
Read CLAUDE.md, docs/WORKFLOW.md and docs/ROADMAP.md. Run slice S00 with the analyst -> developer -> tester loop.
Stop after S00 and report in <=8 lines.
```
5. S00 bitince `git commit`, sonra `/clear`, sonra aynı kalıpla sıradaki dilim (`S01`, `S02`, ...).

## Token tasarrufu — en önemli 6 alışkanlık
1. Her dilimden sonra `/clear`. Uzun oturum = pahalı oturum.
2. Dilimleri küçük tut (tek davranış, en fazla ~8 dosya). Büyükse analist böler.
3. Spec'i (`docs/specs/Sxx.md`) sen de oku: yönü düzeltmenin en ucuz yeri burası.
4. Opus'a yalnızca S00, S10, S17 gibi mimari ağırlıklı dilimlerde geç (`/model`); gerisi Sonnet.
5. Ajanlara "genel olarak iyileştir" deme. Dilim ID'si ve net kabul kriteri ver.
6. `npm run check` yalnızca dilim sonunda; iterasyonda `test:changed`.

## Bilmen gerekenler
- **Şimdilik Expo Go'da çalışır.** Bildirim, Live Activity ve MMKV eklendiğinde *dev build* gerekecek (`npx expo run:android` veya EAS Build).
- **iOS Live Activity** için Apple Developer hesabı ve cihazda test gerekir. Mac yoksa EAS Build kullan.
- **Android** sayaç bildirimi, sistemin kendi kronometresiyle çalışır: uygulama kapalıyken de saymaya devam eder, arka plan
  servisi gerekmez. Yine de gerçek cihazda `TIMER_AND_PRESENCE.md` listesiyle test edilmeli (üretici farkları olabilir).
- **Backend yok (bilinçli karar, 2026-11-14):** veriler yalnızca cihazda. Eş paylaşımı veya cihazlar arası eşitleme
  gerekirse repository portlarının arkasına senkron eklenir (S17); ekranlar değişmez.

## Doğrulanması gerekenler (araştırma notu)
Kararlar Kasım 2026 web araştırmasına dayanıyor; kütüphaneleri elle denemedim. `docs/DECISIONS.md` içindeki **VERIFY**
satırları ilgili dilimde (S00, S01, S02, S10) kontrol edilecek: Unistyles 3 API'si, `react-native-notify-kit` (arşivlenen
Notifee'nin bakımlı fork'u), `expo-widgets` (Live Activity), headless kütüphane seçimi, MMKV/Expo uyumu.

## Uygulama boyutu
- Boyut üç ayrı yerde ölçülür: JS bundle, Android indirme boyutu (AAB), iOS indirme boyutu. S00'da başlangıç değeri ölçülür,
  sonra her bağımlılık/varlık eklenişinde `npm run size` ile kontrol edilir. Rakam hedefi ölçümden sonra konur, tahmin edilmez.
- En büyük etken **native modül sayısı**dır. Bu yüzden grafik için ağır kütüphane, ikon paketi, Lottie, analitik SDK'sı gibi
  şeylerden kaçınılır; ikonlar kendi küçük SVG kayıt defterimizden gelir (S02).
- Android'de yalnızca AAB yayınlanır; R8 ve kaynak küçültme açılır. Release build'i mutlaka cihazda test et.

## Adlandırma
"Minik" çalışma adıdır. Uygulama adı/bundle id'yi S00'dan önce karar verirsen CLAUDE.md'deki başlığı güncelle.

## ASP.NET Core tarafı için
`docs/API_CONTRACT.md` ve `docs/DOMAIN.md` backend için de şartname işlevi görür: aynı varlıklar, `version` alanı,
yumuşak silme, istemci tarafı UUID. Backend'e başlarken bu iki dosyayı Claude Code'a (ayrı bir ASP.NET projesinde) ver.
