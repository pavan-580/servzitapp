# SERVZ'IT

Location first marketplace for local services, businesses, properties, and rentals.

## Repository status

This is a greenfield workspace under active development. Initial marketplace, booking, provider, and review APIs are implemented; integrations and production deployment are not configured.

See [the architecture review](docs/architecture/REVIEW.md), [development status](DEVELOPMENT_STATUS.md), and [integration status](INTEGRATION_STATUS.md).

## Planned workspace

- `apps/api` — versioned NestJS API
- `apps/admin-web` — Next.js owner and CRM portal
- `apps/customer-mobile` — Expo customer marketplace
- `apps/provider-mobile` — Expo provider and business app
- `packages/shared-types` — shared API contracts
- `database/migrations` — PostgreSQL and PostGIS schema

## Local setup

Requires Node.js 22 and PostgreSQL with PostGIS. Copy `.env.example` to `.env`, replace both JWT secrets with separate random values of at least 32 characters, and configure Twilio Verify credentials to enable real phone OTP. No production credentials are included and the API has no test-code bypass.

Start local PostgreSQL/PostGIS and Redis with `docker compose up -d`, then apply the SQL migrations from the API workspace using `npm run db:migrate --workspace @servzit/api`. The owner must sign in through OTP once, then can grant the first admin role by setting `BOOTSTRAP_ADMIN_PHONE` and `CONFIRM_FIRST_ADMIN=I_UNDERSTAND` in the local environment and running `npm run admin:bootstrap --workspace @servzit/api`. Bootstrap is disabled after the first admin exists. Copy `.env.example` to `.env`; its Expo API address is for the Android emulator and must be replaced with a reachable LAN address on a physical phone. The API exposes `GET /api/v1/health/live`, database readiness at `GET /api/v1/health/ready`, categories at `GET /api/v1/service-categories`, service catalogue at `GET /api/v1/services`, nearby discovery at `GET /api/v1/providers/nearby?lat=17.44&lng=78.38`, and OpenAPI docs at `/api/docs`.

Customer and provider phone sign-in use `POST /api/v1/auth/otp/request` and `/api/v1/auth/otp/verify`; authenticated requests use bearer access tokens and rotating refresh tokens stored in Expo SecureStore. Customer saved addresses are available at `/api/v1/me/addresses`; city/locality lookups are at `/api/v1/locations/cities` and `/api/v1/locations/localities?cityId=…`. Provider onboarding creates an unpublished, pending profile at `/api/v1/providers/onboarding`; the provider app shows review state from `/api/v1/providers/me`, manages services at `/api/v1/providers/me/services`, and configures weekly hours at `/api/v1/providers/me/availability`. Admin review APIs require an administrator session and approved identity plus business document review before publishing a provider.

The product is under active development; consult `DEVELOPMENT_STATUS.md` and `INTEGRATION_STATUS.md` for implemented flows and remaining work.
