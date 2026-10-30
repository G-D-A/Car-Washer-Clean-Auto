# Clean-Auto — Car Wash Landing Page

A single-page website for a car wash in Kyiv with services, prices and online booking. Booking requests are stored in MongoDB through a custom Express API. The UI is in Ukrainian, with prices in UAH and +380 phone numbers.

![Home screen](docs/screenshot.png)

## Features

- Hero section with a car photo, key highlights and booking buttons.
- Service cards with prices and duration; the "Записатися" (Book) button pre-selects the service in the form.
- Booking form with validation of name, Ukrainian phone number, date (not in the past) and time.
- The phone number opens a Telegram chat.
- Responsive layout for mobile, tablet and desktop, with a mobile menu.
- The API saves bookings to MongoDB; the booking list is available only with a secret token.

## Tech Stack

| Part | Technologies |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, CSS Modules |
| Backend | Node.js, Express 5, Mongoose |
| Database | MongoDB 8 in Docker |
| Code quality | oxlint, `tsc` |

## Project Structure

```
client/
  components/      components; each has its own folder: X.tsx, X.module.css, index.ts
    Header/  Hero/  Services/  BookingForm/  Footer/
  data/            contacts and the list of services
  lib/booking.ts   booking validation shared by the form and the server
  assets/          images
  index.css        CSS variables and base styles
server/
  index.ts         Express startup and MongoDB connection
  routes/          /api/bookings routes
  models/          Mongoose booking schema
```

## Running Locally

Requires Node.js 22+ and Docker.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` file from the example and set your own `ADMIN_TOKEN`:

   ```bash
   cp .env.example .env
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
| `ADMIN_TOKEN` | `change-me` | secret for viewing bookings |

## API

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | server and database status |
| `POST` | `/api/bookings` | create a booking; `201` on success, `400` with field errors |
| `GET` | `/api/bookings` | latest 100 bookings; requires the `x-admin-token` header |

Example of viewing bookings:

```bash
curl -H "x-admin-token: $ADMIN_TOKEN" http://localhost:3001/api/bookings
```
