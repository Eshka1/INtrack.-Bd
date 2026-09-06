# IN-Track Local Test Guide — Login/Register + Module 4

This integration keeps the team's existing MongoDB workflow. For local testing only, if MongoDB is not available, the backend automatically falls back to a small local JSON authentication store so you can register, log in, and test Module 4 without blocking on MongoDB.

## What was fixed

- The active CRA frontend (`src/App.js`) now includes the protected `/module4` route.
- The Dashboard has a **Module 4** link.
- Module 4 now uses the same `intrack_token` JWT key as the team's authentication flow.
- Registration/login work in local development even if MongoDB is unavailable.
- When local fallback is used, successful registration/login goes directly to `/module4` so MongoDB-only team pages do not block your Module 4 test.
- Module 4 identifies the logged-in user by first/last name and tenant.
- Audit previous/updated values use professional field/value rows instead of raw JSON typing.
- Module 4 exports now send the JWT instead of using unauthenticated links.
- Development CORS accepts localhost frontend ports (3000, 3001, etc.).
- Local auth and Module 4 data files are ignored by Git.

## 1. Backend

Open a terminal:

```powershell
cd D:\df\INTrack.-Bd\backend
Copy-Item .env.example .env -ErrorAction SilentlyContinue
npm install
npm run dev
```

Expected when MongoDB is not installed/running:

```text
MongoDB unavailable (...)
Starting in local authentication fallback mode for development.
Server running in development mode on port 5000
Database mode: local-auth-fallback
```

That is **not an error**. It is the intended local test mode.

Check in your browser:

```text
http://localhost:5000/api/health
```

You should see `success: true` and `databaseMode: local-auth-fallback` (or `mongodb` if MongoDB is available).

If port 5000 is already occupied:

```powershell
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Stop-Process -Id <PID> -Force
npm run dev
```

## 2. Frontend

Open another terminal:

```powershell
cd D:\df\INTrack.-Bd\frontend
npm install
npm start
```

This project is **Create React App**, so use `npm start`, not `npm run dev`.

Open the URL shown by React, normally:

```text
http://localhost:3000
```

## 3. Register a test account

Use a new email the first time, for example:

```text
Company Name: Farhan Demo Inventory Ltd
Company Email: company.demo@example.com
Industry: Manufacturing
Phone: 01700000000
First Name: Farhan
Last Name: Ahmed
Owner Email: farhan.demo@example.com
Password: DemoPass123!
Confirm Password: DemoPass123!
```

If MongoDB is unavailable, registration uses the local development store and automatically opens **Module 4**.

## 4. Login again

Log out, then use:

```text
Email: farhan.demo@example.com
Password: DemoPass123!
```

The local account remains in:

```text
backend/data/local-auth.json
```

That file is ignored by Git.

## 5. Test the two primary Module 4 features

### Audit Trail

1. Open **Module 4 → Audit**.
2. Entity: `Inventory`
3. Action: `UPDATE`
4. Reference: `SKU-001`
5. Reason: `Cycle count correction after warehouse verification`
6. Previous State: `quantity = 10`, `status = Available`
7. Updated State: `quantity = 15`, `status = Available`
8. Click **Save Audit Record**.
9. Confirm the record appears in Audit History.

### Company Administration / Subscription Override

1. Open **Module 4 → Companies**.
2. Add a company with a unique email.
3. Select `Basic`.
4. Create the company.
5. Change its plan to `Premium` or `Enterprise`.
6. Return to **Audit** and confirm the subscription change is recorded.
7. Open **Notifications** and confirm the change notification appears.

## 6. Automatic end-to-end smoke test

After `npm install` in the backend, run:

```powershell
npm run test:module4-local
```

It uses a temporary local test database and a temporary port, and checks:

- backend health
- company registration using email/password
- login using email/password
- authenticated `/auth/me`
- Module 4 audit creation/listing
- Module 4 company creation
- subscription change
- notifications

It cleans up its temporary files afterwards.

## Reset local demo login data

If you want to register the same email again:

```powershell
cd D:\df\INTrack.-Bd\backend
Remove-Item .\data\local-auth.json -ErrorAction SilentlyContinue
Remove-Item .\data\module4-store.json -ErrorAction SilentlyContinue
```

Then restart the backend.

## Important for team GitHub

Do not commit:

```text
node_modules/
.env
backend/data/local-auth.json
backend/data/module4-store.json
```

The normal team MongoDB flow is unchanged. Local JSON authentication is only a development fallback when MongoDB cannot connect.
