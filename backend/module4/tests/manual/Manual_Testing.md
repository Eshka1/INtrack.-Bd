# Module 4 Manual Testing

Dummy values: tenant `COMP-001`, manager `MGR-001`, SuperAdmin `SA-001`, plan `SUB-PRO`.

| ID | Test | Action | Expected Result |
|---|---|---|---|
| MT-01 | Audit list | GET `/api/module4/audit-logs` as COMP-001 | 200; only COMP-001 logs; actor, timestamp, before/after visible |
| MT-02 | Audit isolation | Login as Company A and request logs | No Company B log returned |
| MT-03 | SuperAdmin guard | GET `/super-admin/analytics` as Manager | 403 |
| MT-04 | Company list | GET `/super-admin/companies` as SuperAdmin | Companies, subscription and usage visible |
| MT-05 | Override | PATCH `/super-admin/companies/COMP-001/subscription` body `{"subscription_id":"SUB-PRO"}` | 200; company plan changes; audit record added |
| MT-06 | XLSX | GET `/export?format=xlsx` | Downloadable XLSX; tenant data only |
| MT-07 | PDF | GET `/export?format=pdf` | Downloadable PDF summary |
| MT-08 | Invalid export | GET `/export?format=csv` | 400 |
| MT-09 | Zero activity | Run check for tenant with no activity in past 24h | One ZERO_ACTIVITY notification |
| MT-10 | Duplicate check | Run zero-activity check again same day | No duplicate notification |
| MT-11 | Holiday | Put today's date in `config/holidays.js`, run check | Check skipped |
| MT-12 | Notifications | GET `/notifications` | Current tenant notifications only |
| MT-13 | Mark read | PATCH `/notifications/:id/read` | `read=true` |
| MT-14 | Localization | Toggle English → বাংলা | Module 4 labels change immediately |
| MT-15 | Localization persistence | Reload after selecting Bangla | Selected language remains via localStorage |

Audit creation is triggered by meaningful update controllers in other modules. Example integration code is in `integration_examples/orderControllerAuditExample.js`.
