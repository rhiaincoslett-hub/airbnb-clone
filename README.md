# Airbnb Clone

Full-stack Airbnb-style app: Node/Express + MongoDB backend, React (Vite) frontend.

## Setup

### Server

```bash
cd server
cp .env.example .env
# Set MONGO_URI in .env (e.g. your MongoDB connection string)
npm install
npm start
```

Server runs on **port 5001** (or `PORT` from env). You should see: `Server running on port 5001`.

Create a user (e.g. for admin/host):

```bash
curl -X POST http://localhost:5001/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"host1","password":"password123","role":"host"}'
```

Then log in at `/login` with that username and password.

### Client (local dev)

```bash
cd client
npm install
npm run dev
```

The dev server uses `http://localhost:5001` for the API by default. Set `VITE_API_URL` in `client/.env` if your API runs elsewhere.

### Running the full app (server serves frontend)

1. Build the client: `cd client && npm run build`
2. Start the server: `cd server && npm start`
3. Open **http://localhost:5001** in the browser.

The server serves the built frontend and the API on the same origin, so locations and all API calls work without extra config.

### Deploying (frontend and API on the same server)

1. Set `MONGO_URI` and any other env vars on your host.
2. Build the client: `cd client && npm run build`
3. Start the server (e.g. `node server/server.js` or `npm start` from `server/`).
4. Open the app at your server’s URL (e.g. `https://your-app.herokuapp.com`).

The built client uses the **same origin** for the API when `VITE_API_URL` is not set, so `/api/accommodations` etc. are requested from the same host and return JSON, not HTML.

### Deploying (frontend and API on different hosts)

If you host the frontend (e.g. Vercel/Netlify) and the API (e.g. Railway/Render) separately:

1. When **building** the client, set the API URL:  
   `VITE_API_URL=https://your-api-host.com npm run build`  
   (or add `VITE_API_URL` to your build env in the dashboard.)
2. Deploy the built client and the server to their respective hosts.
3. Ensure the API host allows CORS from your frontend origin (the server already uses `cors()`).

## Routes

- **Backend:** `/api/users` (login, register), `/api/accommodations`, `/api/reservations`
- **Frontend:** `/`, `/locations`, `/locations/:id`, `/login`, `/admin`, `/admin/create`, `/admin/update/:id`

## Structure

- `server/`: Express, Mongoose, JWT auth, CRUD for accommodations and reservations.
- `client/src/`: React components, pages, AuthContext, design tokens in `style/variables.css` and `style/global.css`.
