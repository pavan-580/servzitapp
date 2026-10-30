# Android Play Store readiness

The current mobile apps are early UI shells. They are not ready for Play Store submission.

## Release work still required

- Complete customer and provider workflows against the production API, with authentication, authorization, persisted data, and error/loading/offline states.
- Create app icons, adaptive icons, splash assets, screenshots, privacy policy, terms, and support contact details.
- Configure production API, Maps, OTP, notifications, crash reporting, and object-storage environments without embedding secrets in the app.
- Complete data safety and permission disclosures, consent flows, account deletion, and retention behavior.
- Run device QA, security review, accessibility review, Android release builds, and staged rollout checks.
- Create owner-controlled EAS and Google Play Console projects, configure signing, and keep signing credentials under owner control.
- Verify current Play Console target API and policy requirements at release time.

## Current release configuration

`eas.json` defines internal development, preview APK, and production Android App Bundle profiles. No EAS project, signing key, Play Console credentials, production environment, or store listing is configured. A profile is configuration only; it does not mean an artifact has been built or published.
