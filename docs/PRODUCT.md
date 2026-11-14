# PRODUCT

## Vision
A calm, fast, trustworthy tracker for new parents: log feeding (breast/bottle/solid), diapers, sleep and growth in
two taps, see what happened today at a glance, keep lab test results (blood, urine, screening…) in one place, and
export tidy **daily/weekly PDF reports** to share with the pediatrician. Built for tired hands at 3 a.m.
Positioning: an all-in-one "my baby" companion (in the spirit of popular Turkish baby apps), with reporting as a differentiator.

## Users
- **Primary: new mother (breastfeeding)** — one-handed, in the dark, often half-asleep. Needs a running timer that
  stays visible with the screen off, and "which side last / how long ago".
- **Secondary: partner / second caregiver** — logs bottles and diapers, reads the timeline. (Shared access needs the
  backend; later phase.)
- **Tertiary: parents of twins / older babies** — multiple babies, solids, growth.

## Principles
1. Two taps to log anything common. Big targets (>=48dp), thumb-reachable controls at the bottom.
2. Night-friendly: dim theme, no pure white, no flashing, optional haptics, no sounds by default.
3. Never lose data: every action persists immediately; undo for destructive actions (5 s snackbar).
4. Honest and calm: no guilt, no streak pressure, no medical claims.
5. Works offline always. Backend sync is additive.

## Scope
**MVP (dummy data):** baby profiles; breastfeeding timer (side switch, pause, stop) with ongoing notification;
bottle and solid logging; diaper logging; sleep timer; today dashboard; timeline with edit/delete/undo;
add-past-event; next-feed reminder; basic daily stats; settings (units, theme, language, quiet hours);
curated tips (static, localized); **lab tests** (blood/urine/stool/screening/hearing/other, values + lab reference range,
value history across tests); **PDF reports** (daily or weekly; sections: feeding, sleep, diapers, lab tests, entry log;
share sheet on device, print dialog on web).
**Later:** growth charts (WHO standards), pumping, medication/vaccine log, CSV/JSON export, custom date-range reports,
monthly report, multi-caregiver sync, widgets, iOS Live Activity buttons, biometric lock.
**Out:** social features, ads, diagnosis, AI medical advice, public sharing of baby data.

## Information architecture
Tabs: **Today (Bugün)** | **Timeline (Akış)** | **Health (Sağlık)** | **Reports (Raporlar)** | **Settings (Ayarlar)**.
Baby switcher chips on Today (when >1 baby). Insights live inside Reports (on-screen preview); Tips move under Health later.
Primary action: quick-action tiles on Today (Breast, Bottle, Diaper, Sleep, Solids). Log screens open as modals.

## Key scenarios (analyst expands these into ACs)
- **S1 Start timer:** From Today, tap Breast. Side defaults to the opposite of the last session. Timer starts,
  elapsed visible. Ongoing notification appears and keeps counting with the screen off.
- **S2 Control from notification:** Switch side / Pause / Stop from the notification without opening the app; the
  event is saved correctly.
- **S3 Kill and restore:** App killed mid-session; reopening restores the session with correct elapsed time.
- **S4 Quick diaper:** Wet / Dirty / Mixed in two taps; Undo snackbar.
- **S5 Bottle:** Amount via quick chips (e.g. 60/90/120/150 ml, unit-aware) + stepper; content (breast milk / formula).
- **S6 Reminder:** After a feed ends, schedule "next feed" at the user's interval (default 3 h); respects quiet hours;
  cancelled/rescheduled when a new feed starts. Optional "timer still running?" nudge after a long session.
- **S7 Forgot to start:** Add a past feeding with start/end pickers; overlapping events warn but are allowed.
- **S8 Twins:** Two babies, independent concurrent sessions, one notification each.
- **S9 Tips:** Short curated articles, localized, each with source and last-reviewed date.
- **S10 Lab test:** Health → Add test → pick a template (e.g. CBC) or type → enter values, unit and the reference range
  printed on the lab sheet → save. Detail shows each value's position vs. *that* range; values seen in >=2 tests get a history.
- **S11 PDF report:** Reports → Daily/Weekly → step to the period → choose sections → "Create & share PDF" → OS share sheet
  (WhatsApp, Mail, Files…). The PDF has a header (baby, birth date, age, period), overview cards, per-day tables, lab
  tables, an optional chronological log and the disclaimer footer.

## Copy and safety rules
- Tone: warm, short, second person. Turkish first, English second. Avoid exclamation spam.
- Never say a baby is "healthy", "normal", "underfed" or give thresholds as advice. Statistics are descriptive
  ("avg 7 feeds/day this week").
- Growth, vaccines, medicines: logbook only. No percentiles, growth norms, vaccine schedules or dose suggestions;
  doses are free text "as your doctor wrote it". Reminders only for dates the parent enters.
- Lab values: the app never ships or suggests reference ranges (decided again 2026-11-14 after a short trial, to stay
  out of medical-device territory). It only restates the range the user typed from their lab sheet, neutrally and
  without good/bad colors: "Lab aralığının altında/üstünde/içinde" (Below/Above/Within lab range).
  Templates fill analyte names and units only.
- Any health-related content shows a footer: "Bu uygulama tıbbi tavsiye vermez. Endişeleriniz için çocuk doktorunuza
  danışın." (en: "This app does not provide medical advice. Talk to your pediatrician about any concerns.")
- Tips content needs a source (e.g. WHO, national health ministry, pediatric associations) and a reviewed date.
  Analyst proposes the source policy; a human approves content.

## Success criteria (for analyst to turn into measurable ACs)
Log a diaper in <=2 taps from cold start; start a feed timer in <=2 taps; timer accuracy drift <1 s per hour;
no data loss after force-kill; all text readable at 130% font scale; WCAG AA contrast in all themes.

## Reference apps to skim (do not copy)
Huckleberry, Glow Baby, Baby Tracker. The analyst may skim store listings to spot table-stakes features and
pain points in reviews (night use, lost timers, cluttered UI). Record insights in docs/specs, not here.

## Open questions for the analyst (resolve with defaults, log under Assumptions)
Default reminder interval; quiet-hours default; units default by locale; max session length before "forgot?" prompt;
which stats matter in MVP; tips source policy.
