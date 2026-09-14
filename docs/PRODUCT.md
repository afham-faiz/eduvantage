# Product

Eduvantage is a Maldives-wide student discount platform and digital
student verification/redemption system.

## Launch objective

Web-first: get real merchants and real students using deal discovery and
redemption on the web/PWA. Native apps follow once the web product proves
out — they are not launch blockers.

## Student product

Browse deals without an account, then create one to get verified (via an
approved institution email domain, or manual document/student-card review),
receive a Digital Student ID with a rotating QR credential and fallback
code, and redeem at participating merchants. Favourites, notifications,
redemption history, and account management round it out.

## Merchant product

Self-service or Eduvantage-assisted onboarding for a merchant organisation
with one or more locations. Owner/Manager/Cashier roles. Deal creation
(subject to moderation), a redemption/scanner flow, basic analytics, and
subscription management with manual bank-transfer payment initially.

## Admin product

Internal tooling for student verification review, institution/domain
management, merchant applications, deal moderation, subscriptions and
payment verification, redemption troubleshooting, and basic operations
visibility.

## Cross-platform future

The architecture (contract-first API, generated client) is built so the
same backend serves `student-web`/`merchant-web`/`admin-web` today and
`student-mobile`/`merchant-mobile` (Expo/React Native) later, without a
rewrite.

None of the above is implemented yet — see the root `README.md` and
`docs/ARCHITECTURE.md` for what Foundation 001 actually contains.
