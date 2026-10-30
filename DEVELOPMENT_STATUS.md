# Development status

Updated: 2026-10-30

## Phase 0 — repository audit and architecture

- Confirmed the workspace had no application repository or source code; this is a greenfield build.
- Selected a TypeScript workspace with separate Expo customer/provider clients, Next.js admin, NestJS API, and PostgreSQL/PostGIS migrations.
- Recorded assumptions, risks, and open decisions in `docs/architecture/REVIEW.md`.

## Phase 1 — foundation and database

- [x] Initial workspace layout and setup guidance.
- [x] Initial PostGIS migration for identity, geographic hierarchy, addresses, categories, providers, and service coverage.
- [x] Expo customer and provider UI shells and a Next.js owner portal shell.
- [x] NestJS 12 versioned API bootstrap on the Node adapter, liveness/readiness endpoints, validation, rate limiting, Helmet, and OpenAPI setup; liveness endpoint verified at runtime.
- [x] Parameterized PostGIS category search and nearby-provider query using approved providers, published businesses, explicit service coverage, real coordinates, scheduled-hour status, measured distances, and bounded pagination.
- [x] Customer app fetches categories and nearby providers from the API; location permission is requested only after a user action, with honest empty and radius-expansion states.
- [x] Versioned database migrations with an advisory-lock migration runner and a real PostGIS/Redis local stack definition.
- [x] Initial Android EAS build profiles for internal APK and production AAB (credentials and EAS project not configured).
- [x] Dependency installation and lockfile created.
- [x] Admin and API production builds; API and mobile TypeScript checks; Expo Android JS exports for customer and provider. Admin typecheck now generates Next.js types first for clean checkouts.
- [x] Nineteen automated tests covering location bounds, pagination, OTP/address/provider-profile validation, quote/booking/provider-service DTOs, admin authorization and document-gated approval, and signed session-token use.
- [ ] PostGIS migration execution and live discovery endpoint validation (no PostgreSQL/PostGIS or Docker executable is available here).
- [ ] Signed Android App Bundle production build and Play Store device/policy validation.
- [ ] Run migrations and auth/address/discovery integration checks against PostGIS (no PostgreSQL/PostGIS or Docker executable is available here).

## Phase 2 — identity and saved location

- [x] Customer phone OTP request and verification routes wired to Twilio Verify; no development OTP bypass exists.
- [x] Short-lived HS256 access tokens, rotating refresh tokens, hashed refresh-token identifiers, session revocation, and active-account/role checks.
- [x] Customer sign-in screen and token persistence through Expo SecureStore.
- [x] Authenticated saved-address create/list/soft-delete endpoints with coordinate validation and one-default-address transaction handling.
- [x] City and locality lookup endpoints; catalog data management/seeding and a usable manual map/place picker remain outstanding.
- [x] API runtime boot and HTTP checks: liveness returns 200, unauthenticated address access returns 401, and unconfigured OTP returns 503 without a success response.
- [ ] Twilio sandbox and production credentials/configuration; Google identity and password recovery.
- [ ] PostGIS-backed API integration and migration tests.
- [ ] Full provider role-specific authorization and operational workflows.

## Phase 4 — provider onboarding (initial slice)

- [x] Provider app phone sign-in uses the same verified OTP API and a separate SecureStore session.
- [x] Provider can select one of the supported account types, enter business details, capture device coordinates with permission, choose a bounded service radius, and create an owner-scoped profile.
- [x] Provider and unpublished business records are created transactionally; provider role is assigned and the review status remains pending.
- [x] Provider app displays current review status and does not imply approval or publication.
- [x] Provider can configure weekly working-hour windows and receive/accept/reject booking requests.
- [x] Provider can create/update/unlist fixed-price, inspection-price, or quote-priced service offerings from the active catalog; all remain unpublished until provider approval and publication.
- [x] Provider can view incoming quotation requests, enter a price, set expiry, and send the quote.
- [x] Provider can create/update/unlist fixed-price, inspection-price, or quote-priced service offerings from the active catalog; listings remain hidden while review is pending.
- [ ] Secure KYC upload/storage, provider service catalogue/pricing, document review, and administrator approval are not implemented.

## Phase 5 — booking and quotation workflows (initial slice)

- [x] Customer can request fixed/inspection-price appointments with saved address, schedule, duration, idempotency key, and server-side hours/overlap checks.
- [x] Customer can view and cancel future requests; provider can accept/reject requested bookings.
- [x] Customer can request a quote for quote-priced services, view provider responses, reject/cancel quotes, or accept a quote by scheduling a booking at the server-held quoted price.
- [x] Quote acceptance is transactional, tied to the originally quoted saved address, and idempotent for a repeated booking request.
- [ ] PostGIS-backed transactional workflow tests, booking completion/disputes, notifications, payments, and broader booking lifecycle remain outstanding.

## Phase 8 — owner administration (initial secure API slice)

- [x] Added a one-time first-admin bootstrap command for a phone account verified by OTP; it requires explicit confirmation, checks that no administrator exists, uses a database advisory lock, and records the grant in the audit log.
- [x] Admin-only provider review queue and approve/reject/in-review endpoint; approval is blocked until identity and business documents have explicit approved review statuses.
- [x] Owner portal has real OTP sign-in, in-memory access/refresh credentials, session rotation, logout, provider review queue, and document-gated review actions.
- [ ] Secure document upload/review workflow, user/booking/finance/CRM modules, and executive dashboard remain outstanding.

## Remaining phases

Property, business/rentals, full CRM, payments, communications, full location picker, provider document upload/review, admin web experience, security/performance, deployment, and launch preparation remain unimplemented. Booking/quotation workflows are partial; their database-backed integration behavior remains unverified.

No production readiness or performance targets are claimed.

## Publishing readiness

- Play Store profiles are present, but no signed Android App Bundle has been produced.
- EAS and Play Console projects, credentials, signing, listing assets, policy disclosures, and production integrations are not configured.
- Git is not installed/on PATH in this environment, and this workspace has no `.git` directory or GitHub credentials. No branch or push has been created.
- Latest full registry audit reports 9 low severity findings and no moderate or high findings. The API now pins patched `qs` 6.16.1. Remaining findings are in transitive Expo/Nest build tooling without a compatible upstream patch; do not claim a clean audit.
