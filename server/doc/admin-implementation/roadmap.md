# Admin Feature Roadmap

## Phase 0 – Foundation (Current Sprint)
- [x] Implement admin seeding script (idempotent upsert with hashed password).
- [x] Add `role` and `permissions` fields to user model (if not already present).
- [x] Protect `/api/admin/v1` routes with authentication + `RequireRole('admin')` middleware.
- [x] Deliver read-only endpoints for users, spaces, and bookings with pagination.
- [x] Instrument admin action logging (create baseline `AdminActionLog`).
- [x] Publish baseline Admin API documentation for internal consumers.

## Phase 1 – Moderation Controls
- [x] Enable user/host suspension and reactivation flows.
- [x] Build space approval/rejection endpoints with reason capture.
- [ ] Allow booking cancellation and refund triggers.
- [ ] Integrate notifications for admin-driven actions.

## Phase 2 – Insights & Automation
- [ ] Add aggregate metrics endpoints (active hosts, occupancy, disputes per week).
- [ ] Support CSV export for users/spaces/bookings.
- [ ] Schedule automated reports (e.g., weekly activity summary) using cron job or external worker.

## Phase 3 – Advanced Controls
- [ ] Introduce fine-grained permission sets (e.g., support vs. super admin).
- [ ] Implement audit log viewer endpoint with filters.
- [ ] Add workflow for promoting/demoting admins via approved requests.
- [ ] Integrate MFA enforcement for admin accounts.

## Continuous Improvements
- Sync with frontend dashboard team each sprint to align upcoming changes.
- Keep documentation updated in this folder as features evolve.
- Review security posture quarterly (penetration testing, dependency updates).

## Open Questions
1. Do we need region-based access restrictions for admins (e.g., EU-only data access)?
2. Should we centralize admin config in a separate admin settings service?
3. Is an external monitoring stack (e.g., Datadog) planned for long-term observability?

Track progress by ticking checkboxes as features ship; revisit and reprioritize items after each release cycle.
