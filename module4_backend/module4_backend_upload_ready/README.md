# IN-Track Module 4 Backend

Upload-ready backend package for Module 4.

## Included
- Historical audit trail
- SaaS Super Admin endpoints
- Excel/PDF export endpoints
- Zero-activity notification job
- Notification read/update endpoints
- Jest/Supertest dependencies and controller tests

## Not included
- `node_modules/`
- `.env`
- frontend files

## Setup
1. Copy `.env.example` to `.env`.
2. Add your MongoDB connection string and development IDs.
3. Run:

```bash
npm install
npm run dev
```

Backend: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

## Tests

```bash
npm test
```

## Security
Never commit `.env` or database passwords to GitHub.
