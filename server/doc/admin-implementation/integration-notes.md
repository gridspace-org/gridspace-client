# Admin Integration Notes

## Frontend Coordination
- **Dashboard Ownership:** Existing admin dashboard (frontend teammate) consumes backend `/api/admin/v1` endpoints. Share updated endpoint specs before release.
- **Auth Flow:** Frontend should retrieve admin JWT via login route and store tokens securely (short-lived access token + refresh token recommended). Align on error codes for expired sessions and re-auth prompts.
- **State Management:** Encourage frontend to consume pagination metadata, filtering options, and status enums defined in API responses to avoid hard-coded strings.

## API Contract Alignment
- Publish OpenAPI snippets or TypeScript interfaces for:
  - `AdminUserListResponse`
  - `AdminSpaceModerationPayload`
  - `AdminBookingActionResult`
- Provide sample responses and error formats within this repository's existing API docs folder for reference.
- **Current endpoints (read-only):**
  - `GET /api/admin/users?page=&limit=&role=&status=`
  - `GET /api/admin/spaces?page=&limit=&status=`
  - `GET /api/admin/bookings?page=&limit=&status=`
  - Responses include `{ success, data: { <resource>, pagination } }`.
- **Moderation endpoints:**
  - `POST /api/admin/users/:id/suspend` `{ reason: 'fraud' | 'policy_violation' | 'chargeback_dispute' | 'abuse' | 'other', details?, resumeAt? }`
  - `POST /api/admin/users/:id/reactivate` `{ reason? }`
  - `POST /api/admin/spaces/:id/approve` `{ notes? }`
  - `POST /api/admin/spaces/:id/reject` `{ reason }`
  - All mutations return `{ success, message, data }` and are logged via `AdminActionLog` for traceability.
  - See `../ADMIN_API_DOCUMENTATION.md` for full schemas, sample responses, and curl snippets.

## Notification & Messaging
- When admins perform actions (suspension, booking cancellation), ensure backend triggers existing notification services (email/SMS) with consistent templates. Document payload fields required by those services.
- Coordinate with frontend so UI displays confirmation states only after receiving backend success responses.

## Versioning Strategy
- Version admin endpoints under `/api/admin/v1`. When introducing breaking changes, add `/v2` endpoints and maintain `/v1` until frontend migrates.

## Testing & QA
- Share admin staging credentials with QA team.
- Maintain Postman or Thunder Client collection covering admin routes.
- Align on acceptance criteria for frontend regression tests (e.g., deactivate host -> UI refresh -> status badge updates).

## Future Enhancements
- Webhooks from backend to frontend/third-party analytics for admin actions.
- GraphQL read-only admin queries if dashboard needs complex aggregation.
- Consider integrating RBAC policy definitions into shared config package consumed by both backend and frontend.
