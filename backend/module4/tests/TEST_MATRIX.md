# Backend Test Matrix

| Component | Method | Unit test | Endpoint test |
|---|---|---:|---:|
| TenantContext | getCompanyId | Yes | Indirect |
| TenantContext | requireTenant | Yes | Yes |
| SuperAdminGuard | requireSuperAdmin | Yes | Yes |
| sanitizeAudit | sanitizeAuditValue | Yes | N/A |
| AuditService | stableStringify | Yes | N/A |
| AuditService | createHash | Yes | N/A |
| AuditService | logAudit | Yes | Integration hook |
| AuditController | list | Yes | Yes |
| SuperAdminController | listCompanies | Yes | Route present |
| SuperAdminController | analytics | Yes | Yes |
| SuperAdminController | overrideSubscription | Yes | Route present |
| ExportService | flattenObject | Yes | N/A |
| ExportService | loadTenantData | Yes | Indirect |
| ExportService | buildXlsx | Yes | Yes |
| ExportService | buildPdf | Yes | Route present |
| ExportController | download | Yes | Yes |
| ActivityService | dateKey | Yes | N/A |
| ActivityService | isConfiguredHoliday | Yes | N/A |
| ActivityService | runZeroActivityCheck | Yes | Scheduler-driven |
| ZeroActivityJob | start | Yes | N/A |
| NotificationController | list | Yes | Yes |
| NotificationController | markRead | Yes | Route present |
