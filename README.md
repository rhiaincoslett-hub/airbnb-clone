# Airbnb Clone

Full-stack Airbnb-style app: Node/Express + MongoDB backend, React (Vite) frontend.

## Setup

### Server

```bash
cd server
cp .env.example .env
npm install
npm start
```

Create a user (e.g. for admin/host):

```bash
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"host1","password":"password123","role":"host"}'
```

Then log in at `/login` with that username and password.

### Client

```bash
cd client
npm install
npm run dev
```

Set `VITE_API_URL` (e.g. `http://localhost:5000`) in `.env` if the API is not on the same origin.

## Routes

- **Backend:** `/api/users` (login, register), `/api/accommodations`, `/api/reservations`
- **Frontend:** `/`, `/locations`, `/locations/:id`, `/login`, `/admin`, `/admin/create`, `/admin/update/:id`

## Structure

- `server/`: Express, Mongoose, JWT auth, CRUD for accommodations and reservations.
- `client/src/`: React components, pages, AuthContext, design tokens in `style/variables.css` and `style/global.css`.
