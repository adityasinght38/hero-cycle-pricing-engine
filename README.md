# Hero Cycles – Pricing Engine

Built this for the Hero Cycles assignment. It's a simple web app where the sales team can manage cycle parts + prices, build configurations, and get an instant price breakdown. Replaces the Excel workflow they currently use.

Stack: React (frontend), Node/Express (backend), MongoDB Atlas (DB)

---

## What it does

- Add/edit/delete cycle parts (frame, tyre, gear set, etc.) with prices
- Every time a price is updated, the old price is saved to history — so you can see that a tyre was ₹200 in Jan and ₹250 now
- Build a cycle configuration by picking parts — total price updates live
- GST (18%) shown separately in the breakdown
- Saved configurations snapshot the price at the time you saved — so a quote doesn't change if parts get more expensive later
- "Recalculate" button on any saved config to refresh with current prices if needed
- Dashboard with basic stats

---

## Running locally

You'll need Node 18+ and either MongoDB Atlas (free tier) or a local MongoDB instance.

**Backend**

```bash
cd backend
npm install
cp .env.example .env
# fill in your MongoDB URI in .env
npm run dev
```

Runs on http://localhost:5000

**Frontend**

```bash
cd frontend
npm install
# create a .env file with:
# REACT_APP_API_URL=http://localhost:5000/api
npm start
```

Runs on http://localhost:3000

**Tests**

```bash
cd backend
npm test
```

**MongoDB Atlas (if you don't have local Mongo)**

1. Sign up at cloud.mongodb.com, create a free M0 cluster
2. Add a DB user with readWrite access
3. Whitelist your IP under Network Access
4. Hit Connect → Drivers → copy the URI and paste it in your `.env`

---

## Folder structure

```
hero-cycle-pricing-engine/
├── backend/
│   ├── models/
│   │   ├── Part.js
│   │   └── Configuration.js
│   ├── routes/
│   │   ├── parts.js
│   │   ├── configurations.js
│   │   └── dashboard.js
│   ├── server.js
│   ├── pricing.test.js
│   └── .env.example
├── frontend/
│   └── src/
│       ├── pages/
│       ├── context/
│       ├── utils/api.js
│       └── App.js
├── wireframes/
├── prompts-used.md
└── README.md
```

---

## API endpoints

Parts:
- `GET /api/parts` — list all (supports `?category=Tyre`)
- `POST /api/parts` — create
- `PUT /api/parts/:id` — update (price change gets auto-logged to history)
- `DELETE /api/parts/:id`
- `GET /api/parts/:id/price-history`

Configurations:
- `GET /api/configurations`
- `POST /api/configurations` — pass `partIds` array, prices are snapshotted
- `DELETE /api/configurations/:id`
- `POST /api/configurations/:id/recalculate` — updates prices to current

Dashboard: `GET /api/dashboard/stats`

---

## DB schema (rough)

Part stores `currentPrice` + a `priceHistory` array (price, date, note). Every PUT that changes the price pushes the old value into history before updating.

Configuration stores the parts with `priceAtTime` so it doesn't change when part prices change later. `totalPrice` is auto-computed before save.

---

## Questions I had while building this

- If a salesperson built a quote last month and tyres went up since then — should the quote update automatically? I decided no, snapshot at save time felt more correct for a real sales workflow. Added a manual recalculate button for when they actually want to refresh.
- Can one config have two tyres? (e.g. front and rear separately) — went with no restriction, any number of parts from any category
- Should GST be stored in the DB or just calculated in the frontend? Kept it frontend-only since the rate can change and you don't want stale values stored
- Who can edit parts vs just view — skipped auth for now since it's MVP scope, noted in assumptions

---

## Assumptions

- INR only, no multi-currency
- GST is flat 18%
- Price changes are occasional (a few times a year), so embedding history in the Part doc is fine at this scale
- No login/auth — anyone can use any part of the app. In production you'd want admin vs salesperson roles
- Free-form part selection — no validation that a config must have exactly one frame, etc.

---

## Deploying

Frontend on Vercel — just connect the GitHub repo, set `REACT_APP_API_URL` to your backend URL in env vars.

Backend on Render — root dir `backend`, build command `npm install`, start `node server.js`, add `MONGODB_URI` env var.
