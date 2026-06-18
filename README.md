# 🚲 Hero Cycles — Pricing Engine

A full-stack web application that replaces Hero Cycles' Excel-based pricing workflow. Salespersons can build cycle configurations by selecting parts, see an instant price breakdown, and save configurations. Admins can manage parts and track how prices have changed over time.

---

## Live Demo

- **Frontend (Vercel):** `https://hero-cycle-pricing-engine.vercel.app`
- **Backend (Render):** `https://hero-cycle-api.onrender.com`

---

## Features

| Feature | Description |
|---|---|
| **Parts Management** | Add, edit, delete parts with category, price, and SKU |
| **Price History** | Every price change is logged with timestamp — full audit trail |
| **Configuration Builder** | Pick parts → see live price breakdown → save with a name |
| **GST Calculation** | Automatic 18% GST shown in breakdown |
| **Price Snapshot** | Configs lock in prices at creation — unaffected by future price changes |
| **Recalculate** | One-click update to apply latest part prices to any saved config |
| **Dashboard** | Stats: parts, configs, category breakdown, top configs by price |
| **Unit Tests** | Core pricing logic tested with Jest |

---

## Tech Stack

**Frontend:** React 18, React Router v6, Recharts, react-hot-toast, Axios

**Backend:** Node.js, Express 4, Mongoose, Morgan

**Database:** MongoDB Atlas (free tier)

**Deployment:** Vercel (frontend), Render (backend)

---

## Project Structure

```
hero-cycle-pricing-engine/
├── backend/
│   ├── models/
│   │   ├── Part.js              # Part schema with embedded price history
│   │   └── Configuration.js     # Config schema with price snapshots
│   ├── routes/
│   │   ├── parts.js             # CRUD + price history endpoint
│   │   ├── configurations.js    # CRUD + recalculate endpoint
│   │   └── dashboard.js         # Aggregated stats
│   ├── server.js
│   ├── pricing.test.js          # Unit tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── pages/
│       │   ├── Dashboard.js
│       │   ├── PartsManagement.js
│       │   ├── ConfigurationBuilder.js
│       │   └── Configurations.js
│       ├── context/
│       │   └── AppContext.js
│       ├── utils/
│       │   └── api.js
│       ├── App.js
│       ├── index.js
│       └── index.css
├── wireframes/
│   └── wireframes.md
├── prompts-used.md
└── README.md
```

---

## Local Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free) **or** local MongoDB

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/hero-cycle-pricing-engine.git
cd hero-cycle-pricing-engine
```

### 2. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/hero-cycles
PORT=5000
```

**MongoDB Atlas setup:**
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free M0 cluster
3. Create a database user with read/write access
4. Whitelist your IP (or 0.0.0.0/0 for dev)
5. Click "Connect" → "Connect your application" → copy the connection string

```bash
npm run dev       # development with nodemon
npm start         # production
npm test          # run unit tests
```

Backend runs at: `http://localhost:5000`

### 3. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

```bash
npm start         # development server
npm run build     # production build
```

Frontend runs at: `http://localhost:3000`

---

## API Documentation

### Parts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/parts` | List all parts (filter: `?category=Tyre&isActive=true`) |
| GET | `/api/parts/:id` | Get single part |
| POST | `/api/parts` | Create part |
| PUT | `/api/parts/:id` | Update part (price change auto-logged) |
| DELETE | `/api/parts/:id` | Delete part |
| GET | `/api/parts/:id/price-history` | Get full price history |

**POST /api/parts — body:**
```json
{
  "name": "Mountain Tyre",
  "category": "Tyre",
  "currentPrice": 250,
  "description": "26 inch all-terrain tyre",
  "sku": "TYR-MTN-001"
}
```

### Configurations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/configurations` | List all configurations |
| GET | `/api/configurations/:id` | Get single config |
| POST | `/api/configurations` | Create config |
| PUT | `/api/configurations/:id` | Update config metadata |
| DELETE | `/api/configurations/:id` | Delete config |
| POST | `/api/configurations/:id/recalculate` | Refresh with latest prices |

**POST /api/configurations — body:**
```json
{
  "cycleName": "Mountain Pro X",
  "targetAudience": "Adult",
  "description": "High-performance mountain cycle",
  "partIds": ["partId1", "partId2", "partId3"],
  "createdBy": "Rahul Sharma"
}
```

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/stats` | Aggregated stats |

---

## Database Schema

### Part

```js
{
  name: String,              // "Mountain Tyre"
  category: String,          // "Tyre" (enum)
  description: String,
  currentPrice: Number,      // latest price
  sku: String,               // optional unique identifier
  isActive: Boolean,
  priceHistory: [{
    price: Number,
    changedAt: Date,
    changedBy: String,
    note: String
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Configuration

```js
{
  cycleName: String,         // "Mountain Pro X"
  description: String,
  targetAudience: String,    // Kids / Youth / Adult / Professional
  createdBy: String,
  status: String,            // Draft / Active / Archived
  totalPrice: Number,        // auto-computed from parts
  parts: [{
    partId: ObjectId,
    partName: String,
    category: String,
    priceAtTime: Number      // price snapshot at save time
  }],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Key Design Decisions

### 1. Price Snapshot on Configuration Save

When a salesperson saves a configuration, each part's current price is captured as `priceAtTime`. This means if a tyre goes from ₹200 to ₹250 tomorrow, the old saved config still shows ₹200. This matches how real quoting systems work — a quote should not change retroactively.

The "Recalculate" button is deliberately manual — it gives the salesperson control over when to update to new prices.

### 2. Embedded Price History

Price history is embedded inside each Part document rather than stored in a separate collection. For this use case (periodic updates, not thousands of daily changes), this avoids extra joins and keeps queries simple. If price change frequency grew significantly, a separate PriceEvent collection would make more sense.

### 3. GST Shown Separately

GST (18%) is calculated client-side and displayed as a breakdown, not stored in the database. This avoids stale GST values if the rate changes.

### 4. No Authentication (MVP Scope)

Authentication is out of scope for this MVP. In a real system: salespersons get read + config-create access; admins get full parts CRUD. JWT-based auth with role middleware would be the approach.

---

## Questions Asked While Solving This

1. Should old configurations use old prices or always update to the latest? → Chose snapshot (price at creation), with manual recalculate option.
2. Can a cycle have multiple tyres / multiple parts of the same category? → Yes, no restrictions.
3. Is GST included in the stored price, or shown separately? → Shown separately at 18%.
4. Who can update part prices — only admin, or salespersons too? → Assumed Admin only.
5. Should there be a user login system? → No for MVP.
6. What happens to saved configurations if a part is deleted? → Part data is snapshot-stored in the config, so it persists even if the part is removed from the library.
7. Should a cycle require one of each category (Frame, Tyre, etc.), or is it free-form? → Free-form for flexibility.
8. How should price history be stored — embedded or separate collection? → Embedded for this scale.
9. Should pricing support bulk/volume discounts? → Out of scope for MVP.
10. What currencies are supported? → INR only for now.

---

## Assumptions Made

- Prices are stored and displayed in Indian Rupees (₹).
- GST rate is a flat 18%.
- Only one "current price" per part at any time.
- A configuration can include any combination of parts, including multiple from the same category.
- The latest active price is used when building a new configuration.
- There is no authentication — all users can view and create; admin functions (edit/delete parts) are UI-accessible by anyone in this MVP.
- Part price changes are infrequent (a few times per year) — embedded history is appropriate.

---

## Running Unit Tests

```bash
cd backend
npm test
```

Tests cover:
- Total price calculation (single part, multiple parts, empty)
- Price history recording
- GST calculation
- Input validation (empty name, negative price, missing category)
- Recalculation difference

---

## Deployment

### Frontend → Vercel

```bash
cd frontend
npm run build
# Push to GitHub, connect repo to Vercel
# Set env var: REACT_APP_API_URL = https://your-backend.onrender.com/api
```

### Backend → Render

1. Create new Web Service on Render
2. Connect GitHub repo
3. Root directory: `backend`
4. Build command: `npm install`
5. Start command: `node server.js`
6. Add env vars: `MONGODB_URI`, `NODE_ENV=production`

---

## Screenshots

*(Add screenshots of Dashboard, Parts table, Builder, and Configurations grid here)*

---

## Contact

Built by Aditya Thakur for Hero Cycles technical assessment.
