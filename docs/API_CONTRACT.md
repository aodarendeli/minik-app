# API CONTRACT (future ASP.NET Core backend)

Draft contract so the app's DTOs/mappers and the backend converge. Not implemented in the app until S17.
Once the backend exists, generate the OpenAPI spec from ASP.NET and generate the TS client from it
(e.g. openapi-typescript/orval); this document then becomes secondary.

## Conventions
- Base: `/v1`. JSON, camelCase. Timestamps: ISO-8601 UTC strings (`2026-11-10T14:30:00Z`); app converts to/from `Instant`.
- IDs: client-generated UUID. `PUT /…/{id}` creates-or-updates (idempotent offline writes).
- Soft delete: `DELETE` sets `deletedAt`; lists exclude deleted unless `includeDeleted=true` (sync).
- Concurrency: `version` integer + `ETag`/`If-Match` (409 on conflict). Policy: last-writer-wins per field is NOT assumed;
  start with 409 + client merge for edits (rare).
- Sync: `GET /v1/sync/changes?since=<cursor>` returns changed entities and tombstones; cursor is opaque.
- Pagination: cursor-based `?cursor=&limit=`; response `{ items, nextCursor }`.
- Errors: RFC 9457 Problem Details (`application/problem+json`) with stable `code` extension mapped to `ErrorCode`.
- Auth: **Keycloak** realm, public OIDC client for the app (Authorization Code + PKCE S256; `offline_access` opt-in via `EXPO_PUBLIC_KEYCLOAK_OFFLINE_ACCESS`).
  The app sends `Authorization: Bearer <access token>` (client: `createAuthorizedFetch` in `@minik/auth`; retries once after
  a refresh on 401). The API validates JWTs against the realm (issuer `https://<kc>/realms/<realm>`, audience = API client;
  add an audience mapper in Keycloak). User id = `sub`. **Authorization is not in Keycloak roles**: table
  `baby_caregivers(baby_id, user_id, role: owner|caregiver|viewer, invited_by, created_at)`; every `/babies/{id}/…`
  request checks membership. `GET /me` returns profile + memberships.
  Only role: client role `admin` on `minik-api` (via group `minik-admins`) for `/v1/admin/*` aggregates; never grants baby data.
  Keycloak setup steps: backend `apps/backend/README.md`. Rate limits and idempotency keys on writes.
- Privacy: no PII in logs; data export and delete endpoints required (KVKK/GDPR).

## Resources
| Method | Path | Purpose |
|---|---|---|
| GET | `/babies` | list (memberships of the caller) |
| GET/PUT/DELETE | `/babies/{id}` | read / upsert (creator becomes owner) / soft delete (owner) |
| GET | `/babies/{id}/events?from=&to=` or `?cursor=` | timeline |
| PUT/DELETE | `/babies/{id}/events/{eventId}` | upsert / soft delete (any `kind`) |
| GET/PUT | `/babies/{id}/active-sessions/{kind}` | optional server mirror of running timers (for push-to-start / multi-device) |
| GET/PUT | `/babies/{id}/reminder-settings`, `/me/settings` | settings |
| GET | `/babies/{id}/lab-tests?from=&to=` | lab tests (with results) |
| PUT/DELETE | `/babies/{id}/lab-tests/{testId}` | upsert / soft delete (results replaced as a whole, `version` checked) |
| GET/POST/DELETE | `/babies/{id}/caregivers`, `/babies/{id}/invitations` | sharing with partner/caregiver (later) |
| GET | `/me` | profile from token + memberships |
| GET | `/sync/changes?since=` | delta sync |
| POST | `/me/export`, DELETE `/me` | data portability / erasure |

## Example DTO
```json
{
  "id": "0f6c…", "babyId": "b3a1…", "kind": "feeding", "method": "breast",
  "startedAt": "2026-11-10T02:10:00Z", "endedAt": "2026-11-10T02:28:30Z",
  "breast": { "segments": [
    { "side": "left",  "startedAt": "2026-11-10T02:10:00Z", "endedAt": "2026-11-10T02:19:00Z" },
    { "side": "right", "startedAt": "2026-11-10T02:19:00Z", "endedAt": "2026-11-10T02:28:30Z" } ] },
  "note": null, "createdAt": "…", "updatedAt": "…", "deletedAt": null, "version": 3
}
```
`kind` is a discriminator (`feeding|diaper|sleep|note`). Use a polymorphic converter on the .NET side.

## Implemented (backend `apps/backend`, 2026-11-14)
Done: `/me`, `/me/settings`, `/babies`, `/babies/{id}`, `/events`, `/active-sessions[/{kind}]` (+ DELETE = stop/discard),
`/lab-tests`, `/reminder-settings`, membership checks (non-member -> 404, low role -> 403), If-Match/ETag, Problem Details
`code` = `NotFound|Validation|Conflict|Permission|Unauthorized|Unknown`, per-user rate limit, OpenAPI at `/swagger/v1/swagger.json`.
Details that the app must follow:
- Lists return `{ items, nextCursor? }` (active-sessions returns a plain array). Null fields are omitted, not sent as `null`.
- Enums are camelCase strings (`breastMilk`, `breastFeeding`); timestamps are written as `…sss Z`; dates `YYYY-MM-DD`.
- PUT of an existing soft-deleted event/lab test/baby restores it (undo). PUT with If-Match on a missing id -> 409.
- Events: `?from=&to=` (max 93 days, oldest first) or `?cursor=&limit=` (<=200, newest first); optional `kind`, `includeDeleted`.
  Max event duration 48 h. Active session PUT with a different `id` than the stored one -> 409.
- Reminder/user settings GET returns defaults with `version: 0` until first PUT.
- Sync feeds: `GET /babies/{id}/events/changes?since=&limit=` and `/lab-tests/changes` -> `{ items, cursor, hasMore }`,
  oldest change first, deletes included (`deletedAt`), resume from `cursor`; changes younger than 5 s are held back.
- App conflict policy (S17 v1): record-level last-writer-wins (PUT without If-Match). Revisit with multi-caregiver (S18).
Not yet: caregivers/invitations, `POST /me/export`, `DELETE /me`, atomic "stop session + save event".

## App-side rules
DTO types live in `features/*/data/*.dto.ts`; Zod schemas parse responses; mappers convert to domain; domain never sees DTOs.
`HttpRepository`s must pass the shared repository contract tests (see TESTING.md).
