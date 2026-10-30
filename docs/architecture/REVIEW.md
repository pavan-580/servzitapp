# SERVZ'IT architecture review

Date: 2026-10-30

## Audit findings

The provided workspace contained no application source, package manifests, database, integrations, deployment files, Git metadata, or project history. This is therefore a greenfield implementation rather than an extension of an existing codebase. No feature or integration can be considered already working. The local environment has Node.js and npm, but Git is not available on PATH and no GitHub credential variable is configured.

Hosting cannot yet be assessed: the Bluehost subscription tier and resource limits were not provided. Shared hosting should not be assumed to support persistent Node.js, workers, Redis, or Socket.IO. If the subscription is shared hosting, host the API and database on compatible managed infrastructure while keeping the web frontend portable.

## Proposed architecture

- TypeScript workspace with independent deployable applications and shared contracts.
- Expo + React Native for customer and provider Android applications. Keep one provider app with account-type-specific experiences.
- Next.js for the owner administration and CRM portal.
- NestJS REST API with `/api/v1`, OpenAPI, validation, authorization guards, rate limits, and structured error handling.
- PostgreSQL with PostGIS as the source of truth for users, catalog, listings, bookings, and geographic queries.
- Redis for bounded caching, rate limiting, and job coordination only where required. Do not make correctness depend on cache state.
- Object storage for private verification documents and public listing media, with separate access policies and generated image variants.
- Socket.IO for authenticated chat and booking events after the durable workflows exist; persist messages and status changes before broadcasting.
- Provider adapters for maps, OTP/SMS, email, push, and payments; credentials stay in environment/secret management, never in app bundles.
- Phone sign-in currently uses the Twilio Verify HTTP API, short-lived signed access tokens, one-time rotating refresh identifiers stored as hashes, and server-side session revocation. This path remains disabled until the owner configures a Twilio Verify service and separate JWT secrets.
- Saved addresses retain the customer’s explicitly captured coordinates separately from typed address text. City/locality lookup data and map/geocoding verification are not yet configured.
- Provider profile creation is an atomic database transaction that assigns the provider role, records a real captured location/service radius, and leaves the profile pending with the storefront unpublished. KYC document storage and administrator approval are still required before provider activation.

## Data and trust principles

- UUID keys, foreign keys, database constraints, timestamps, audit records, and soft deletion where appropriate.
- Store money as integer minor units with currency; never use floating point.
- Store user-supplied and verified location distinctly. A document upload is not a verification decision.
- Use PostGIS geography and GiST indexes for radius discovery. Service coverage must be explicit and verified; distances are computed from actual coordinates.
- Enforce ownership and role checks in the API and database query layer. Admin actions require an auditable actor.
- Bootstrap the first administrator through a one-time, operator-controlled process; never ship a default credential.

## Main risks and technical debt

- No source history, existing behavior, automated checks, deployment manifests, or operational runbooks were available to assess.
- Payment collection, commissions, and provider settlement depend on merchant/legal approval and cannot be represented as active before verification.
- Location, KYC, property documentation, chat, and analytics involve sensitive data; retention, consent, access, and deletion policies must be designed before production.
- A comprehensive marketplace is too broad for one release. Build end-to-end vertical slices and keep unimplemented modules visibly unavailable.
- No service-level or latency target can be claimed until measured against agreed infrastructure and representative workloads.

## Delivery sequence

1. Foundation: workspace, design tokens, database migrations, local container stack, health endpoints, and CI baseline.
2. Identity and location: OTP adapter contract, sessions, roles, saved addresses, locality catalog, and PostGIS discovery primitives.
3. Customer services discovery and provider onboarding, including explicit admin approval.
4. Booking, quotes, availability, status history, and customer/provider communication.
5. Properties, business storefronts, and rentals as separately permissioned verticals.
6. Admin/CRM, audit trails, support, and reporting.
7. Payment provider sandbox, verified webhooks, idempotency, refunds, and reconciliation after approvals.
8. Notifications and realtime, followed by security review, performance measurement, release preparation, and operations.

## Owner decisions needed before production integrations

- Confirm Bluehost plan type/resources and target hosting budget.
- Provide owner-controlled cloud projects/accounts for maps, notifications, and approved messaging.
- Confirm initial launch cities, supported languages, provider KYC evidence and approval policy.
- Confirm commercial terms, tax treatment, merchant approval, refunds, and settlement arrangement before enabling payments.
- Provide repository ownership/access or initialize a Git remote if code is to be pushed to GitHub.
