# Module 4 White-Box Testing

White-box tests exercise internal branches/methods.

- TenantContext: user tenant, header fallback, missing tenant, valid tenant.
- SuperAdminGuard: role allowed, flag allowed, normal user rejected.
- AuditService: missing company, missing entity fields, previous hash, sanitization, SHA-256 creation, insert.
- AuditController: no filter, filters, pagination, DB error.
- SuperAdminController: company list, analytics, missing subscription, company not found, successful override + audit.
- ExportService: flatten nested data, empty/nonempty collections, XLSX, PDF.
- ExportController: xlsx, pdf, invalid type, service failure.
- ActivityService: date conversion, holiday, active tenant, inactive tenant, duplicate notification.
- ZeroActivityJob: cron registration at 01:00 daily.
- NotificationController: list, read success, read 404, DB failure.
- Endpoint tests: Express route wiring, tenant guard, SuperAdmin guard, audit, export, notification.

Coverage target in `jest.config.js`: minimum 80% branches/functions/lines/statements.
Run `npm run test:coverage`.
