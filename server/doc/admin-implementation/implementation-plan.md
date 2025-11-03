# Admin Implementation Plan

## Objective
Deliver a maintainable, auditable admin experience for GridSpace that allows privileged operators to manage users, hosts, spaces, and bookings while keeping the codebase aligned with SOLID and DRY principles.

## Scope of Responsibilities
- **User & Host Administration:** View/filter accounts, update status, enforce suspensions, and reset credentials.
- **Space Oversight:** Approve new listings, manage availability, and moderate reported content.
- **Booking Governance:** Monitor bookings, cancel or reassign when required, and surface conflicts.
- **Operational Insights:** Provide dashboards for key metrics (growth, occupancy, disputes) and exportable reports for finance/compliance.
- **System Configuration (future):** Manage feature flags, payout settings, and automated notification rules.

## Domain Flows
1. **Admin Authentication**
   - Seed at least one admin account; no open sign-up.
   - Admin login issues a token with elevated claims.
   - Enforce MFA and short-lived sessions once infrastructure is ready.
2. **Account Moderation**
   - Admin views paginated list of users/hosts with filters (role, status, creation date).
   - Actions trigger service commands (`DeactivateUserCommand`, `PromoteHostCommand`) with audit logging.
   - Suspension reasons standardized: `fraud`, `policy_violation`, `chargeback_dispute`, `abuse`, `other`; optional notes captured for compliance.
3. **Space Approval Lifecycle**
   - Spaces created by hosts enter `pending` state.
   - Admin reviews metadata/photos, approves or rejects with reason stored in `moderationLogs`.
   - Approved spaces flip `status=approved`, `isActive=true`; rejected spaces capture explicit rationale and keep audit trail.
4. **Booking Intervention**
   - Admin can cancel bookings (e.g., policy violations) using a dedicated service that notifies involved parties and reverses payments when applicable.
5. **Reporting & Analytics**
   - Provide read-only dashboards initially; add CSV exports and scheduling later.
   - Current MVP: `/api/admin/v1` GET endpoints for users, spaces, bookings with pagination.

## Workstreams
1. **RBAC & Security**
   - Extend auth middleware to verify roles/permissions from JWT claims.
   - Implement `RequireRole('admin')` higher-order middleware used across admin routes.
2. **Service Layer Enhancements**
   - Introduce admin-specific services that orchestrate domain logic without bloating controllers (e.g., `AdminUserService`).
   - Apply Interface Segregation by exposing only the operations admins require.
3. **Persistence Adjustments**
   - Add fields where needed (e.g., `status`, `suspensionReason`, `moderationLogs`).
   - Ensure soft deletes maintain history and keep `updatedAt`, `updatedBy` fields.
4. **Audit & Observability**
   - Centralize admin actions in an `AdminActionLog` collection with metadata (actor, entity type, before/after snapshot).
   - Feed structured logs to winston transports for Railway log ingestion.
5. **API Contracts**
   - Define `/api/admin` namespace with sub-resources (`/users`, `/spaces`, `/bookings`).
   - Version endpoints (`/api/admin/v1/...`) for forward compatibility.
6. **Documentation & Change Management**
   - Keep this folder updated with decisions, diagrams, and SOPs.

## Application of SOLID & DRY
- **Single Responsibility:** Each service handles one domain concern (e.g., `AdminSpaceApprovalService`).
- **Open/Closed:** Use strategy patterns or configuration objects to extend moderation rules without rewriting existing code.
- **Liskov Substitution:** Share interfaces between base user services and admin variants where behavior is compatible.
- **Interface Segregation:** Split admin APIs for users/spaces/bookings; avoid god interfaces.
- **Dependency Inversion:** Controllers depend on service interfaces, not concrete implementations; leverage dependency injection (manual or factory based).
- **DRY:** Centralize validation schemas, response mappers, and error handling utilities; reuse existing validators by extending them with admin-specific rules.

## Deliverables Checklist
- [ ] Seed script and admin role definition
- [ ] RBAC middleware + permission matrix
- [ ] Admin services and repository methods
- [ ] Controller endpoints with OpenAPI references
- [ ] Audit logging utilities
- [ ] Integration tests covering happy/negative paths
- [ ] Updated deployment playbook and monitoring dashboards

## Validation Strategy
- Integration tests targeting `/api/admin` routes using mocked admin JWTs.
- Contract tests coordinating with frontend dashboard team.
- Manual smoke test plan executed on Railway staging before production rollout.

## Risks & Mitigation
- **Privilege Escalation:** Use defense-in-depth (RBAC + route scoping + secure storage of admin credentials).
- **Data Loss:** Favor soft deletes and ensure backups before enabling destructive commands.
- **Drift Between Teams:** Schedule weekly sync with frontend to reconcile API updates against dashboard expectations.

## Next Review
Revisit this plan after the first admin MVP deployment to Railway; update priorities and mark deliverables complete.
