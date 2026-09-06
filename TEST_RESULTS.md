# IN-Track Integration Verification

## Verified in the prepared project

- Backend source syntax: **83 JavaScript files checked, 0 syntax failures**.
- Frontend source syntax: **49 JavaScript/JSX files parsed, 0 syntax failures**.
- The active Create React App entry (`frontend/src/App.js`) includes the protected `/module4` route.
- The dashboard includes a Module 4 navigation link.
- The standalone `My Features` app is no longer needed in the integrated copy; Module 4 is mounted inside the team frontend/backend.
- Module 4 API is protected by the same bearer token used by the team authentication flow.

## Local-development smoke flow passed

The Module 4 smoke flow passed these checks in local-auth fallback mode:

- backend health
- unauthenticated Module 4 request rejected
- register company with email/password
- wrong password rejected
- login with email/password
- authenticated `/api/auth/me`
- Audit Trail create/list
- Company Administration create
- subscription Basic -> Premium update
- notification creation/list
- CSV export
- PDF export signature

Run the same smoke test on your Windows machine after installing dependencies:

```powershell
cd backend
npm install
npm run test:module4-local
```

## Sandbox dependency note

The build environment used for preparation cannot reach the npm registry reliably, so the complete third-party dependency installation could not be repeated from scratch here. Source validation and the HTTP smoke flow were still executed with locally available dependency copies. On your machine, `npm install` installs the real dependencies defined by the existing `package.json`/`package-lock.json`.
