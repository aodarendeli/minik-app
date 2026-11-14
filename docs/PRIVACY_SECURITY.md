# PRIVACY AND SECURITY

Baby data is sensitive in practice (child identity, health-adjacent routines). Treat it as high-care data. This is an
engineering checklist, not legal advice — get legal review before launch (Turkey KVKK, EU GDPR, store rules).

## Data handling
- Local storage encrypted at rest: MMKV with an encryption key kept in `expo-secure-store` (Keychain/Keystore).
  **Current state (interim):** expo-sqlite kv-store, NOT encrypted (OS sandbox only). Must be fixed before store release.
  "Delete all data" exists in Settings (clears babies, entries, labs, sessions; dismisses notifications). A 5 s "Undo"
  restores from an in-memory snapshot only (never written to disk). Dev builds (`__DEV__`) also show "Load sample data".
- **Lab results are health data** (special-category under KVKK/GDPR). Same encrypted store; never in logs, analytics or
  notification text. PDF reports are generated on-device and leave it only through the user's explicit share action;
  the temp PDF file lives in the app cache (purge policy: S16).
- Auth tokens: Keychain/Keystore via expo-secure-store (`AFTER_FIRST_UNLOCK`), never in logs or the SQLite store. No passwords
  in the app (hosted Keycloak page). Sign-out revokes the refresh token and ends the SSO session. Since S17 each account's
  data lives in its own local tables; after sign-out it stays on the device (offline cache, unsent changes) but is not
  shown to anyone else. Open item: wipe it on sign-out once unsent changes are flushed (shared devices).
- Minimize: only fields the product needs. Baby "name" can be a nickname; no photos in MVP.
- No third-party analytics or crash tools that capture event content. If crash reporting is added: scrub PII, no breadcrumbs with
  names/notes/timestamps tied to a person. Analytics only with explicit opt-in and aggregate events.
- Logging: never log baby names, notes, or identifiable timestamps. `core/logger` redacts.
- Exclude app storage from cloud backup unless the user opts in (iOS file protection / Android backup rules) — decide in S03.
- Notifications content: baby name may appear on lock screen — add a setting "hide details on lock screen" (default: show
  first name only; user can hide).

## Permissions (ask in context, handle denial)
Notifications (Android 13+ `POST_NOTIFICATIONS`, iOS), no location/contacts/camera/mic in MVP. Explain value before the OS prompt.

## User rights
In-app: export my data (JSON/CSV), delete all data (local) — required before store submission; with backend: server-side erasure.

## Content safety
No diagnosis, no thresholds as advice, no "normal/abnormal" labels. Tips need sources and review dates. Disclaimer wording in PRODUCT.md.

## Store and compliance checklist (S16)
Apple privacy nutrition labels; Google Play Data safety form; children's-data considerations (the app is for parents, not
children, but handles children's data); privacy policy URL; terms; age rating; KVKK aydınlatma metni (notice) and consent
flows when a backend is added; data residency decision for the backend.

## Security hygiene
Secrets never in the repo or the bundle; `.env` denied to agents; dependency vetting log; lockfile committed; `npm audit` in CI
(non-blocking at first); HTTPS only; certificate pinning optional later; biometric app lock as a later feature.
