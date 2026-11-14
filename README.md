# AuraStay — Hotel List & Management App (CRUD with Responsive UI)

A full-stack hotel listing and management app (AuraStay):

- **Frontend** — ReactJS + Redux (Redux Toolkit) + React Router, hand-written HTML/CSS
  in the style of the MDB e-commerce template the client shared. SEO meta tags per
  page via `react-helmet-async`. Classic single-page app (SPA).
- **Backend** — Node.js + Express + **PostgreSQL with native SQL queries**
  (no ORM, no query builder — parameterised SQL through the `pg` driver only).
- **Images** — uploaded through the API with Multer and stored on the server's own
  disk (`server/uploads`), served back as static files.

## What's implemented

| Requirement | Where |
| --- | --- |
| Add / Edit form with validation (image, title, description, latitude, longitude, price) | `client/src/pages/HotelFormPage.jsx` + `server/src/middleware/validate.js` |
| List page with pagination, search + price-range filters, edit & delete | `client/src/pages/HotelListPage.jsx`, `server/src/controllers/hotels.controller.js` |
| Details page | `client/src/pages/HotelDetailsPage.jsx` |
| `POST /api/hotels` (create) | `server/src/routes/hotels.js` |
| `PUT /api/hotels/:id` (edit) | same |
| `DELETE /api/hotels/:id` (row + stored image file) | same |
| `GET /api/hotels` with title search, price range, `offset` + `limit` paging | same |
| Native SQL only | every query in `hotels.controller.js` / `src/db/*` |
| Server-side image storage | `server/src/middleware/upload.js` → `server/uploads/` |
| SEO with React Helmet | `<Helmet>` blocks in every page component |

## Project structure

```
hotel-app/
├── server/                      # Express API
│   ├── src/
│   │   ├── index.js             # app entry: middleware, static, error handler
│   │   ├── routes/hotels.js     # route table
│   │   ├── controllers/hotels.controller.js   # the native SQL lives here
│   │   ├── middleware/upload.js # multer disk storage (5 MB, jpg/png/webp)
│   │   ├── middleware/validate.js             # server-side field validation
│   │   └── db/
│   │       ├── pool.js          # pg Pool + tiny query helper
│   │       ├── schema.sql       # CREATE TABLE + indexes (idempotent)
│   │       ├── applySchema.js   # node script that applies schema.sql
│   │       └── seed.js          # 12 demo hotels (skips if table not empty)
│   ├── uploads/                 # image storage (seed photos included)
│   ├── .env.example
│   └── package.json
└── client/                      # React SPA
    ├── index.html               # Roboto + meta description (MDB-template shell)
    ├── vite.config.js           # dev proxy: /api and /uploads → :4000
    └── src/
        ├── features/hotels/hotelsSlice.js     # Redux: list, filters, CRUD thunks
        ├── features/ui/uiSlice.js             # toast notifications
        ├── pages/                             # List / Details / Form pages
        ├── components/                        # Navbar, Footer, HotelCard, Pagination, ...
        ├── api.js                             # fetch wrapper
        └── styles.css                         # the whole MDB-style look, no CSS framework
```

## Getting started

Prerequisites: **Node 18+** and a **PostgreSQL 14+** server running locally.

```bash
# 1 — database
createdb hotels_db                 # or use any existing database
cd server
cp .env.example .env               # then edit credentials if needed

# 2 — server
npm install
npm run db:schema                  # creates the hotels table (safe to re-run)
npm run db:seed                    # optional: 12 demo hotels with photos
npm run dev                        # API on http://localhost:4000

# 3 — client (new terminal)
cd ../client
npm install
npm run dev                        # SPA on http://localhost:5173 (proxies to :4000)
```

### Production-style single port

```bash
cd client && npm run build         # outputs client/dist
cd ../server && npm start          # Express now serves the SPA + API on :4000
```

The server auto-detects `client/dist` and serves it, so the deployed app runs on
one origin — no CORS in production — and the SPA fallback (`*` → index.html)
keeps deep links like `/hotels/3/edit` working.

## API reference

Base URL: `http://localhost:4000`

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/api/hotels` | Query params: `search` (title ILIKE), `minPrice`, `maxPrice`, `limit` (default 9, max 50), `offset`. Returns `{ data, total, limit, offset }` — `total` counts all matches, for pagination. |
| GET | `/api/hotels/:id` | Single hotel or 404. |
| POST | `/api/hotels` | `multipart/form-data`: `image` (required) + `title`, `description`, `price`, `latitude`, `longitude`. 201 with the created row. |
| PUT | `/api/hotels/:id` | Same fields; `image` optional — when a new file arrives the previous one is removed from disk. |
| DELETE | `/api/hotels/:id` | Deletes the row **and** the image file stored on the server (as the brief allows). |

Field rules (enforced on **both** sides): title 3–160 chars, description
10–3000 chars, price 0–1,000,000, latitude −90…90, longitude −180…180,
image jpg/png/webp up to 5 MB. Validation failures return
`400 { "errors": { "field": "message" } }`, which the form renders inline
under each field.

Quick smoke test with curl:

```bash
# list with filter + paging
curl "http://localhost:4000/api/hotels?search=beach&minPrice=50&maxPrice=300&limit=9&offset=0"

# create
curl -X POST http://localhost:4000/api/hotels \
  -F image=@my-photo.jpg -F title="Test Stay" -F description="A decent test room." \
  -F price=99.50 -F latitude=12.34 -F longitude=56.78

# update / delete
curl -X PUT  http://localhost:4000/api/hotels/1 -F title="Renamed Stay" -F description="Updated description here." -F price=120 -F latitude=12.34 -F longitude=56.78
curl -X DELETE http://localhost:4000/api/hotels/1
```

## Design notes

- **Native SQL, injection-safe.** WHERE clauses are assembled conditionally, but
  every value is a bound parameter (`$1, $2, …`). `COUNT(*) OVER()` returns the
  pagination total in the same round trip as the page of rows, and non-numeric ids
  (`22P02`) are translated into clean 404s.
- **Why Redux Toolkit?** It is the official, recommended way to write Redux today —
  same store/actions/reducers model, far less boilerplate. Filters live in the
  store, so going back from a details page restores the exact list view you left.
- **Images** are renamed to `<timestamp>-<random>.<ext>` on upload so duplicate
  names can't clobber each other; orphan files are cleaned up when validation
  fails, when a photo is replaced, and when a hotel is deleted.
- **The UI** follows the MDB e-commerce template the client shared: white sticky
  navbar, card grid with hover lift, bold prices, uppercase buttons, MDB-style
  rounded pagination, and the light centered copyright footer. It's all in
  `client/src/styles.css` — no Bootstrap/MDB package, just that look, and it
  collapses to a single column on mobile.
