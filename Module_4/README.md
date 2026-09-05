# IN-Track Module 4 — Final Simple Standalone

This is a complete standalone frontend + backend. It does not need any previous project folder.

The UI is intentionally limited to the five Module 4 requirements:

1. Historical Batch Audit Trail
2. SaaS Super Admin / Company Management
3. Data Export
4. Notifications, including zero-activity/change notifications
5. English / বাংলা localization

## Main UI

- **Audit Trail** — enter a meaningful change and view append-only history.
- **Companies** — add a new company, list registered companies, and change subscription plan.
- **Export** — download Excel or PDF.
- **Notifications** — see who changed what and mark notifications as read.
- **Language** — English / বাংলা selector in the header.

There are no extra dashboard charts, filters, user-management screens, delete-company controls, or unrelated Module 1–3 functions.

## Run

Extract the ZIP, open this folder in VS Code, then double-click:

`RUN_WINDOWS.bat`

Or:

```powershell
npm install
npm run setup
npm run dev
```

Open:
- Frontend: http://localhost:5173
- Backend health: http://localhost:5000/api/health

## Database

It runs immediately with `backend/data/store.json`.

To use MongoDB Atlas:
1. Copy `backend/.env.example` to `backend/.env`
2. Set `USE_MONGODB=true`
3. Add your own `MONGO_URI`
4. Restart

Never commit your real `.env`.

## Audit rules

- Entity, action, reference, and reason are required.
- Reason must be at least 8 characters.
- Old/New Value must be valid JSON when supplied.
- CREATE requires New Value.
- DELETE requires Old Value.
- UPDATE / ADJUSTMENT / TRANSFER / STATUS_CHANGE require both.
- For change actions, Old Value and New Value must differ.
- There are no update/delete audit endpoints: audit records are append-only.

## Company rules

- Company name required.
- Email required and must look valid.
- Subscription plan: Basic, Premium, or Enterprise.
- Duplicate company email is rejected.
- Adding a company creates an audit record and a notification.
- Changing a subscription creates an audit record and a notification.
