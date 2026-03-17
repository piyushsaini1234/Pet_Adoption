# Pet Adoption Management System

A MERN stack project I built for managing pet adoptions. Admins can add/edit/delete pets and handle adoption requests. Regular users can browse pets, filter by species/age/breed, and submit adoption applications. Built this mostly to practice full-stack development with JWT auth and role-based access.

---

## What's inside

- React (Vite) frontend with Tailwind CSS
- Express + Node.js backend REST API
- MongoDB with Mongoose for the database
- JWT authentication — tokens stored in localStorage
- Role-based access: `user` and `admin`
- Real-time-ish notifications (polling every 20 seconds)
- Adoption workflow with status tracking (pending → approved/rejected)

---

## Folder structure

Two separate folders — `backend` and `frontend`. Backend follows a standard MVC pattern, frontend is organized by feature.

**backend/**
- `config/` — database connection
- `models/` — Mongoose schemas (User, Pet, Adoption, Notification)
- `controllers/` — all the business logic
- `routes/` — just maps routes to controller functions
- `middleware/` — JWT auth check and role-based access
- `server.js` — entry point, sets up express + middleware + routes

**frontend/src/**
- `pages/` — one file per page (Home, Login, Register, Dashboard, AdminDashboard, PetDetails)
- `components/` — shared stuff like Navbar, PetCard, NotificationBell, Loader
- `context/` — AuthContext, handles login state across the app
- `hooks/` — useNotifications (polling + sound)
- `services/api.js` — axios instance, auto-attaches JWT to every request
- `utils/helpers.js` — small utility functions used across pages

Sound file goes in `frontend/public/notification.wav`.

---

## Setup

You'll need Node.js (v18 or above) and MongoDB running locally, or a free Atlas cluster.

### Backend

```bash
cd backend
npm install
```

Make a `.env` file inside the `backend` folder:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/pet-adoption
JWT_SECRET=some_random_secret_change_this
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Then run:

```bash
npm run dev
```

API runs on `http://localhost:5000`. You can test with the included Postman collection (`PetAdopt.postman_collection.json`) — import that + the environment file (`PetAdopt.postman_environment.json`), select the environment, and you're good.

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` in the `frontend` folder:

```
VITE_API_URL=http://localhost:5000/api
```

Then:

```bash
npm run dev
```

Opens at `http://localhost:5173`.

> **Note:** For notification sounds to work, there should be a `notification.wav` file inside `frontend/public/`. You can use any short WAV/MP3 notification sound — just rename it to `notification.wav`.

---

## API endpoints

### Auth
```
POST   /api/auth/register       register a new account
POST   /api/auth/login          login, returns JWT token
GET    /api/auth/me             get current logged-in user (requires token)
```

### Pets
```
GET    /api/pets                list all pets (supports ?search=, ?species=, ?page=)
GET    /api/pets/:id            get single pet
POST   /api/pets                create pet (admin only)
PUT    /api/pets/:id            update pet (admin only)
DELETE /api/pets/:id            delete pet (admin only)
```

### Adoptions
```
POST   /api/adoption/:petId     apply for a pet (logged-in users)
GET    /api/adoption            get my applications
GET    /api/adoption/admin      all adoption requests (admin only)
PUT    /api/adoption/:id        approve or reject (admin only)
```

### Notifications
```
GET    /api/notifications           get my notifications
PUT    /api/notifications/:id/read  mark one as read
PUT    /api/notifications/read-all  mark all as read
```

---

## How the adoption flow works

1. User browses pets on the home page and clicks on one they like
2. On the pet detail page, they fill a short message and submit the request
3. Pet status changes to `pending`
4. Admin gets a notification with the applicant's name and email
5. Admin opens the admin dashboard, reviews the request, approves or rejects
6. User gets a notification back about the decision
7. If approved → pet status becomes `adopted` and all other pending requests for that pet are auto-rejected (with notifications sent to those users too)

---

## Roles

**user** — can browse pets, apply for adoption, see their own applications and their status

**admin** — everything a user can do, plus: add/edit/delete pets, see all adoption requests, approve or reject them

To create an admin account, just select "Admin (shelter staff)" on the register page.

---

## A few things worth knowing

- Duplicate applications are blocked at both the DB level (unique index) and in the controller
- If you reject all applicants and no pending requests remain, the pet goes back to `available`
- The notification bell polls every 20 seconds — not real-time but works fine for this use case
- For the sound to play, you need to click the bell icon at least once after logging in (browser autoplay restriction — nothing I can do about that)
- Tailwind CSS linting warnings in VS Code can be suppressed — there's a `.vscode/settings.json` already configured for that

---

## Running both servers at once

Open two terminals:

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

That's it.
