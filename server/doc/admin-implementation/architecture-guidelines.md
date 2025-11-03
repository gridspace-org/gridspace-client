# Admin Architecture Guidelines

## Overview
This document captures the backend architecture decisions for admin functionality. It emphasizes SOLID and DRY to keep the codebase flexible as the project evolves and scales on Railway.

## Layering Strategy
- **Routing Layer:** Dedicated `/api/admin/v1` routes grouped by resource (`users`, `spaces`, `bookings`, `reports`). Each route file wires middleware (e.g., `adminOnly` wrapper that combines `authenticate` + `requireRole('admin')`) and hands off to controllers.
- **Controller Layer:** Thin controllers mapping HTTP requests to use cases. They orchestrate validation, call services, and map responses (no business logic).
- **Service Layer:** Core business logic classes implementing explicit interfaces. For example, `AdminUserService` exposes methods for suspending users and fetching lists with filters.
- **Repository/Data Access Layer:** Mongoose models or repositories handling persistence. Expose composable query helpers (`findPaginated`, `updateStatusWithAudit`) to avoid duplicated query logic.
- **Utilities:** Shared validation schemas, transformers, and response builders, reused between admin and regular APIs.
- **Audit Layer:** `AdminActionLog` model captures every admin interaction (method, path, metadata, user agent) for traceability and feeds observability dashboards.
- **State Management:** `Space` documents track `status` (`pending`, `approved`, `rejected`) plus moderation metadata (`reviewedBy`, `reviewedAt`, `reason`); user documents maintain structured `suspension` info for compliance.

## SOLID Considerations
- **S (Single Responsibility):** Each module handles one concern. Admin user services should not handle space approval logic, and vice versa.
- **O (Open/Closed):** Design service methods to accept strategy objects or callbacks for custom business rules; this avoids modifying existing methods when requirements change.
- **L (Liskov Substitution):** When extending base services, ensure admin-specific subclasses respect the contracts (e.g., return types, error semantics).
- **I (Interface Segregation):** Expose granular interfaces (`AdminSpaceModeration`, `AdminBookingIntervention`) rather than a monolithic admin API surface.
- **D (Dependency Inversion):** Higher-level services depend on abstractions (interfaces or factory functions). Consider a lightweight dependency injection container or manual wiring module to keep creation logic centralized.

## DRY Practices
- Reuse existing validation schemas (`Joi`, custom validators). Extend them with admin-only fields via schema merging.
- Share pagination and filtering utilities across user-facing and admin endpoints to keep behavior consistent.
- Centralize response formatting and error handling so admin routes use the same patterns as the rest of the API.
- Extract common policy checks (e.g., `ensureActiveHost`) into middleware or service helpers.

## Permission Model
- Define a `Role` enum (`admin`, `host`, `user`) with a permission matrix stored in code or config.
- Validate JWT claims against the matrix in middleware. Example pipeline: authenticate -> load user -> `requireRole('admin')` -> optional `requirePermission('spaces:moderate')`.
- Maintain a `PermissionRegistry` object to map feature flags to actual permissions for clean toggling.

## Railway Deployment Notes
- Configure admin environment variables (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE`, `ADMIN_MFA_SECRET`) in Railway project settings.
- Ensure Railway build hooks run seed scripts safely (idempotent) on release.
- Monitor logs via Railway dashboard; ship structured JSON logs to avoid parsing issues.
- Create separate staging environment within Railway to test admin changes before production.

## Observability & Audit
- Emit structured logs for every admin action (user ID, action type, target entity, timestamp, reason).
- Consider introducing an `AuditTrail` collection or push events to an external logging service for long-term retention.
- Capture performance metrics (latency, error rate) for admin endpoints and feed them into existing monitoring (e.g., Prometheus if adopted later).

## Reliability and Scaling
- Use rate limiting on admin endpoints to mitigate abuse, though limits can be higher vs. public APIs.
- Apply optimistic locking or version fields when multiple admins might act on the same resource.
- Design background jobs (e.g., bulk notifications) to run via queue workers (BullMQ/Redis) when requirements grow.

## Integration with Frontend/Admin Dashboard
- Align on API contracts with frontend teammate. Document payloads in OpenAPI or at least share TypeScript interfaces.
- Provide sandbox credentials and user data for dashboard testing.
- Maintain change log for admin API adjustments so frontend can adapt quickly.

## Future Enhancements
- Introduce attribute-based access control (ABAC) if roles become insufficient.
- Add analytics pipeline (BigQuery/Amplitude) to power richer dashboards.
- Integrate security scanning and automated tests in CI before deploying to Railway.
