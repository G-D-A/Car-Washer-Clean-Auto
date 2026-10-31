# Clean-Auto — Car Wash Landing Page

A single-page website for a car wash in Kyiv with services, prices and online booking. Booking requests are stored in MongoDB through a custom Express API. The UI is in Ukrainian, with prices in UAH and +380 phone numbers.

![Home screen](docs/screenshot.png)

## Features

- Hero section with a car photo, key highlights and booking buttons.
- Service cards with prices and duration; the "Записатися" (Book) button pre-selects the service in the form.
- Booking form with validation of name, Ukrainian phone number, date (not in the past) and time.
- User accounts: sign up and log in with email and password; logged-in users see their booking history in "Мої записи" (My bookings). Guests can still book without an account.
- The phone number opens a Telegram chat.
- Responsive layout for mobile, tablet and desktop, with a mobile menu.
- Admin panel at `/admin`: administrators see all bookings (with the client's account or a "guest" label) and can delete them.

## Tech Stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, React Router, CSS Modules |
| Backend | Node.js, Express 5, Mongoose, JWT in an httpOnly cookie, bcrypt |
| Database | MongoDB 8 in Docker |
| Code quality | oxlint, `tsc` |

## Project Structure

```
client/
  auth/            auth state: AuthProvider and the useAuth hook
  components/      components; each has its own folder: X.tsx, X.module.css, index.ts
    Header/  Hero/  Services/  BookingForm/  Footer/
    Modal/  AuthModal/  MyBookings/
  pages/           routes: HomePage (/) and AdminPage (/admin)
  data/            contacts and the list of services
  lib/             validation shared by the client and the server (booking, auth)
  assets/          images
  index.css        CSS variables and base styles
server/
  index.ts         Express startup and MongoDB connection
  auth.ts          JWT cookie helpers, requireAuth and requireAdmin middleware
  routes/          /api/auth, /api/bookings and /api/admin routes
  models/          Mongoose schemas: User, Booking
```

## Running Locally

Requires Node.js 22+ and Docker.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from the example, set your own `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD`:

   ```bash
   cp .env.example .env
   openssl rand -hex 32   # a good value for JWT_SECRET
   ```

3. Start MongoDB in Docker (first time):

   ```bash
   docker run -d --name car-wash-mongo -p 27017:27017 -v car-wash-mongo-data:/data/db mongo:8
   ```

   After that, `docker start car-wash-mongo` is enough.

4. Start the frontend and the API with one command:

   ```bash
   npm run dev:all
   ```

   Site: http://localhost:5173, API: http://localhost:3001.

5. The API creates the admin account on start. Log in with `ADMIN_EMAIL` and `ADMIN_PASSWORD`: the header then shows "Адмін-панель", which opens http://localhost:5173/admin.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | frontend only (Vite) |
| `npm run dev:server` | API only, restarts on changes |
| `npm run dev:all` | frontend and API together |
| `npm run build` | type check and build into `dist/` |
| `npm run lint` | lint the code with oxlint |
| `npm run preview` | preview the production build |

## Environment Variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | API port |
| `MONGODB_URI` | `mongodb://localhost:27017/car-wash` | database connection string |
| `JWT_SECRET` | `openssl rand -hex 32` | secret for signing login tokens |
| `ADMIN_EMAIL` | `admin@example.com` | email of the administrator account |
| `ADMIN_PASSWORD` | `openssl rand -base64 12` | admin password, 8–72 characters |

The API creates the admin account on start, so nobody can register with this email first. Changing `ADMIN_PASSWORD` resets the password on the next start. The admin role is checked against `ADMIN_EMAIL` on every request.

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | server and database status |
| `POST` | `/api/auth/register` | create an account and log in; `409` if the email is taken |
| `POST` | `/api/auth/login` | log in; sets an httpOnly `token` cookie |
| `POST` | `/api/auth/logout` | log out; clears the cookie |
| `GET` | `/api/auth/me` | the current user or `null` |
| `POST` | `/api/bookings` | create a booking (linked to the user when logged in); `201` on success, `400` with field errors |
| `GET` | `/api/bookings/my` | the logged-in user's bookings; `401` without a session |
| `GET` | `/api/admin/bookings` | all bookings, newest first; `401` without a session, `403` for non-admins |
| `DELETE` | `/api/admin/bookings/:id` | delete a booking; `204` on success, `404` if it does not exist |
