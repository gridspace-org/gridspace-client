# Admin Operations & Deployment Guide

## Environment Setup
- **Variables:** Ensure Railway project has `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_PHONE`, and optional `ADMIN_MFA_SECRET`. Use Railway-specific secrets rather than committing defaults.
- **Seeding:** Use `npm run seed:admin` to upsert the default admin account from environment values. Script:
  1. Load environment variables.
  2. Hash password via existing bcrypt helpers.
  3. Upsert admin user (`role: 'admin'`, `isActive: true`) idempotently.
  4. Leverages existing model hooks to hash passwords and logs whether the admin was created or updated.
- **Access Control:** Restrict who can trigger the seed in production (e.g., use CI/CD pipeline or manual approvers).

## Deployment Workflow (Railway)
1. **Staging Deploy:** Merge into `develop` branch triggers Railway staging deployment. Validate admin endpoints using seeded admin credentials.
2. **Smoke Tests:** Run automated test suite (`npm test`) plus manual checks (login -> list users -> deactivate/reactivate -> view logs).
3. **Production Deploy:** Promote staging build to production once verified. Rotate admin password after each deploy.
4. **Post-Deploy Checklist:**
   - Confirm admin login works.
   - Check audit logs for seed script run.
   - Verify frontend admin dashboard can consume updated endpoints.

## Monitoring & Logging
- Capture structured logs via Winston transports. Include metadata: `{ actorId, action, entityType, entityId, statusCode }`.
- Persist detailed admin interactions in `AdminActionLog` (method, path, metadata, user agent) to support forensic reviews and compliance reporting.
- Use Railway log retention to review security-sensitive sequences (bulk deletions, repeated login failures).
- Configure alerting (Slack/webhook) for important events like failed admin logins or suspended hosts.

## Incident Response
- **Account Compromise:** Reset admin password via seed script/environment update. Force token revocation by updating secret or TTL.
- **Erroneous Deactivation:** Use audit log to identify action; perform data restoration by flipping `isSuspended` flags and notifying affected users.
- **Data Anomalies:** Create runbooks for investigating suspicious bookings or spaces (manual queries backed by documented scripts).

## Maintenance
- Schedule periodic password rotations and audit log reviews.
- Update documentation when new admin actions are introduced.
- Validate consistency between admin dashboard expectations and backend responses each sprint.

## TODOs
- Define runbook for promoting/demoting admin roles via CLI or service endpoint (controlled).
