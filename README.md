## Disaster Relief Management System

### Frontend (Vite + React)

1) Install deps:

```bash
npm install
```

2) Create `.env` in project root:

```bash
VITE_API_URL=http://localhost:4000/api
```

3) Start dev server:

```bash
npm run dev
```

### Backend (Express, in-memory demo)

1) Install deps:

```bash
cd server && npm install
```

2) Create `server/.env`:

```bash
PORT=4000
CLIENT_ORIGIN=http://localhost:5173
JWT_SECRET=change_me
```

3) Start:

```bash
npm run start
```

### Notes

- Endpoints: `/api/auth/*`, `/api/user/*` (compat), `/api/reports/*`, `/api/comments/*`, `/api/likes/*`, `/api/donations/*`, `/api/admin/*`
- File uploads served at `/uploads/*`
- Data is ephemeral (in-memory). Replace with a DB for production.
