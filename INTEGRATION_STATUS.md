# Integration status

Updated: 2026-10-30

| Integration | Provider | Configuration | Sandbox | Production | Last verification | Limitations |
|---|---|---|---|---|---|---|
| PostgreSQL/PostGIS | Self-managed or managed PostgreSQL | Local Docker Compose defined; not run | Not configured | Not configured | Not verified | Foundation, service discovery, identity, booking, and quotation migrations authored; no database available in workspace |
| REST API | NestJS 12 | Liveness and auth/location/provider route registration plus unauthorized-route behavior verified; booking/quotation endpoints compile; database readiness requires local PostGIS | Not configured | Not configured | 2026-10-30 | Database-backed auth, location, provider onboarding, catalog discovery, bookings, and quotations still require PostGIS integration checks |
| Owner administration | SERVZ'IT bootstrap + role guard | One-time first-admin command, OTP owner portal sign-in, session rotation/logout, provider review queue, and audit-backed decision API implemented | Not configured | Not configured | 2026-10-30 | Requires verified OTP owner account and explicit CLI confirmation; document upload/review and broader admin modules remain unavailable; configure portal origin in `ALLOWED_ORIGINS` |
| Phone OTP | Twilio Verify | Adapter implemented; credentials are placeholders in `.env.example` | Not configured | Not configured | 2026-10-30 | Requires owner Twilio account, Verify service, sender/region policy, and abuse limits; no OTP is simulated |
| Redis | Redis 7 (local compose) | Compose defined; not run | Not configured | Not configured | Not verified | API throttling currently uses in-memory storage; distributed Redis-backed rate limiting is not implemented |
| Maps and geocoding | Google Maps Platform (planned) | Not configured | Not configured | Not configured | Not verified | Requires owner project, billing, key restrictions, and consent review |
| Payments | Razorpay (planned) | Not configured | Not configured | Not configured | Not verified | Requires merchant onboarding and approved marketplace settlement model |
| Push notifications | Firebase Cloud Messaging (planned) | Not configured | Not configured | Not configured | Not verified | Requires Firebase project and mobile app registrations |
| Email | Owner-approved provider (TBD) | Not configured | Not configured | Not configured | Not verified | Provider and sender domain remain undecided |
| Realtime transport | Socket.IO (planned) | Not configured | Not configured | Not configured | Not verified | Authorization, persistence, and recovery not implemented |
