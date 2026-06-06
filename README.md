<p align="center">
  <img src="https://img.shields.io/badge/RationMitra-AI%20Powered%20PDS-blue?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0id2hpdGUiIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsOCAxMFYxMkwyIDd2MTB6Ii8+PC9zdmc+" alt="RationMitra" />
</p>

<h1 align="center">RationMitra</h1>
<h3 align="center">AI-Powered Smart Queue Optimization & Distribution Management System</h3>
<h4 align="center">for India's Public Distribution System (PDS)</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## Problem Statement

India's Public Distribution System (PDS) serves over 800 million beneficiaries, yet suffers from:

- **Long, unpredictable queues** at Fair Price Shops (FPS) causing hours of waiting
- **Manual identity verification** leading to fraud, ghost beneficiaries, and proxy collection
- **Stock mismanagement** resulting in shortages of essential commodities
- **Zero visibility** for administrators into shop-level performance and anomalies
- **No feedback mechanism** for beneficiaries to report grievances

These issues disproportionately affect daily-wage workers, elderly citizens, and women who cannot afford to spend entire days in queues.

---

## Solution Overview

**RationMitra** is a full-stack web application that modernizes the PDS experience through:

| Module | What It Does |
|--------|-------------|
| **Smart Queue & Slot Booking** | Cardholders book time slots online; real-time queue position updates via WebSocket eliminate blind waiting |
| **Face Recognition** | 128-dimensional face embeddings with AES-256 encryption and anti-spoofing checks replace manual ID verification |
| **ML Demand Prediction** | Weighted moving average model with day-of-week seasonality forecasts daily footfall so shops can staff appropriately |
| **Stock Depletion Forecasting** | Trend analysis on 30-day consumption history predicts days-until-stockout and auto-flags reorder alerts |
| **Bilingual Sentiment Analysis** | Keyword-based NLP engine processes feedback in both Hindi and English to surface systemic issues |
| **Fraud Detection** | Heuristic engine flags anomalies: duplicate collections, unusual transaction volumes, timing irregularities |
| **Push / SMS / Email Alerts** | Beneficiaries receive slot confirmations, turn-approaching alerts, and service completion notifications |
| **Admin Analytics Dashboard** | District/state administrators get real-time KPIs, shop performance rankings, and audit logs |

---

## Tech Stack

### Frontend (Client)

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.3.1 | UI library |
| TypeScript | 5.5.4 | Type safety |
| Vite | 5.4.3 | Build tool & dev server |
| Tailwind CSS | 3.4.10 | Utility-first styling |
| React Router | 6.26.2 | Client-side routing |
| Socket.io Client | 4.7.5 | Real-time WebSocket |
| Axios | 1.7.7 | HTTP client |
| React Hot Toast | 2.4.1 | Notifications |
| React Icons | 5.3.0 | Icon library |

### Backend (Server)

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20 (Alpine) | Runtime |
| Express.js | 4.21.0 | HTTP framework |
| MongoDB (Mongoose) | 8.6.0 | Database ODM |
| Socket.io | 4.7.5 | Real-time engine |
| JSON Web Token | 9.0.2 | Auth (15m access + 7d refresh) |
| bcryptjs | 2.4.3 | Password hashing (12 rounds) |
| Helmet | 7.1.0 | Security headers |
| express-rate-limit | 7.4.0 | API rate limiting |
| crypto-js | 4.2.0 | AES-256 encryption (face data) |
| Morgan | 1.10.0 | HTTP request logging |
| Jest + Supertest | 29.7 / 7.0 | Testing |

### ML Service

| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | Runtime |
| Flask | 3.0.3 | Microservice framework |
| scikit-learn | 1.5.1 | ML algorithms |
| NumPy | 1.26.4 | Numerical computing |
| pandas | 2.2.2 | Data manipulation |
| PyMongo | 4.8.0 | MongoDB driver |

### Infrastructure

| Technology | Version | Purpose |
|-----------|---------|---------|
| Docker Compose | 3.8 | Container orchestration |
| MongoDB | 7 | Document database |

---

## Project Structure

```
rationmitra/
├── docker-compose.yml              # Orchestrates all 4 services
├── .gitignore
│
├── client/                          # React + TypeScript frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── main.tsx                 # Entry point
│       ├── App.tsx                  # Router & protected routes
│       ├── index.css                # Tailwind imports
│       ├── api/
│       │   └── axios.ts             # Axios instance with interceptors
│       ├── components/
│       │   ├── Layout.tsx           # Shell layout with sidebar
│       │   ├── Navbar.tsx           # Top navigation bar
│       │   └── ProtectedRoute.tsx   # RBAC route guard
│       ├── context/
│       │   └── AuthContext.tsx       # JWT auth state management
│       ├── pages/
│       │   ├── Login.tsx            # Login form
│       │   ├── Register.tsx         # Registration form
│       │   ├── Dashboard.tsx        # Role-aware dashboard
│       │   ├── BookSlot.tsx         # Slot booking (cardholder)
│       │   ├── MyBookings.tsx       # View/cancel bookings
│       │   ├── QueueManage.tsx      # Live queue panel (shop owner)
│       │   ├── Inventory.tsx        # Stock management
│       │   ├── StockForecast.tsx    # Depletion forecast charts
│       │   ├── DemandPrediction.tsx # ML demand forecast UI
│       │   ├── FaceEnroll.tsx       # Face enrollment (cardholder)
│       │   ├── FaceVerify.tsx       # Face verification (shop owner)
│       │   ├── SubmitFeedback.tsx   # Feedback form (cardholder)
│       │   ├── FeedbackView.tsx     # Sentiment dashboard
│       │   ├── AdminDashboard.tsx   # Analytics & KPIs
│       │   ├── FraudAlerts.tsx      # Fraud alert management
│       │   ├── Notifications.tsx    # Notification center
│       │   └── NotFound.tsx         # 404 page
│       └── types/
│           └── index.ts             # TypeScript interfaces
│
├── server/                          # Node.js + Express backend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js                 # Express + Socket.io setup
│       ├── config/
│       │   ├── db.js                # MongoDB connection
│       │   └── env.js               # Environment variables
│       ├── middleware/
│       │   ├── auth.js              # JWT verification
│       │   ├── rbac.js              # Role-based access control
│       │   ├── rateLimiter.js       # Rate limiting rules
│       │   ├── errorHandler.js      # Global error handler
│       │   └── auditLogger.js       # Action audit trail
│       ├── models/
│       │   ├── User.js              # User schema (4 roles)
│       │   ├── Shop.js              # FPS shop schema
│       │   ├── Queue.js             # Queue & slot schema
│       │   ├── Inventory.js         # Stock with history
│       │   ├── Feedback.js          # Feedback + sentiment
│       │   ├── FaceData.js          # Encrypted embeddings
│       │   ├── FraudAlert.js        # Fraud detection records
│       │   ├── Notification.js      # Multi-channel alerts
│       │   └── AuditLog.js          # Audit trail records
│       ├── controllers/
│       │   ├── authController.js    # Register, login, profile
│       │   ├── queueController.js   # Slot booking & queue ops
│       │   ├── inventoryController.js
│       │   ├── feedbackController.js
│       │   ├── faceController.js    # Enroll & verify faces
│       │   └── analyticsController.js
│       ├── routes/
│       │   ├── auth.js              # /api/auth/*
│       │   ├── queue.js             # /api/queue/*
│       │   ├── inventory.js         # /api/inventory/*
│       │   ├── feedback.js          # /api/feedback/*
│       │   ├── face.js              # /api/face/*
│       │   ├── ml.js                # /api/ml/* (proxy to Flask)
│       │   ├── shop.js              # /api/shops/*
│       │   ├── analytics.js         # /api/analytics/*
│       │   └── notification.js      # /api/notifications/*
│       ├── services/
│       │   ├── mlService.js         # HTTP client to Flask ML
│       │   ├── fraudDetectionService.js
│       │   └── notificationService.js
│       ├── socket/
│       │   └── index.js             # WebSocket event handlers
│       ├── scripts/
│       │   └── seed.js              # Database seeder
│       └── utils/
│           ├── encryption.js        # AES-256 encrypt/decrypt
│           └── validators.js        # express-validator rules
│
└── ml-service/                      # Python Flask ML microservice
    ├── Dockerfile
    ├── requirements.txt
    ├── app.py                       # Flask routes (10 endpoints)
    ├── models/
    │   ├── __init__.py
    │   ├── demand_predictor.py      # Weighted moving average + seasonality
    │   ├── sentiment_analyzer.py    # Bilingual keyword-based NLP
    │   ├── face_recognition_service.py  # 128D embedding + anti-spoofing
    │   └── stock_forecaster.py      # Trend-based depletion forecast
    └── tests/
        └── test_models.py           # pytest test suite
```

---

## Architecture

```
                                 +---------------------+
                                 |   React Frontend    |
                                 |   :5173 (Vite)      |
                                 |  TypeScript + TW    |
                                 +----------+----------+
                                            |
                              HTTP (Axios)  |  WebSocket (Socket.io)
                                            |
                                 +----------v----------+
                                 |  Express.js Backend  |
                                 |       :5000          |
                                 |  JWT + RBAC + Audit  |
                                 +----+------+----+----+
                                      |      |    |
                            +---------+      |    +---------+
                            |                |              |
                   +--------v------+  +------v------+  +---v-----------+
                   |   MongoDB 7   |  | Socket.io   |  | Flask ML Svc  |
                   |    :27017     |  | Real-time   |  |    :5001      |
                   |               |  | Queue Mgmt  |  +-------+-------+
                   +---------------+  +-------------+          |
                                                               |
                                                    +----------v----------+
                                                    |   ML Models          |
                                                    | - Demand Predictor   |
                                                    | - Sentiment Analyzer |
                                                    | - Face Recognition   |
                                                    | - Stock Forecaster   |
                                                    +----------------------+

   Roles:  [cardholder] --> [shopowner] --> [admin] --> [sysadmin]
             Book slots     Manage queue    Analytics    Full system
             Give feedback  Verify faces    Fraud mgmt   Audit logs
             Face enroll    Inventory       Shop perf    All access
```

---

## Installation & Setup

### Prerequisites

- **Docker & Docker Compose** (recommended), OR
- Node.js 20+, Python 3.11+, MongoDB 7+

---

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/your-org/rationmitra.git
cd rationmitra

# Start all services (MongoDB, Server, Client, ML Service)
docker-compose up --build

# In a separate terminal, seed the database
docker exec -it rationmitra-server npm run seed
```

Services will be available at:

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000 |
| ML Service | http://localhost:5001 |
| MongoDB | mongodb://localhost:27017/rationmitra |

---

### Option 2: Manual Setup

**1. MongoDB**

```bash
# Ensure MongoDB 7 is running locally on port 27017
mongod --dbpath /data/db
```

**2. Backend Server**

```bash
cd server
cp .env.example .env    # Or create .env with variables below
npm install
npm run dev              # Starts on :5000
```

Required environment variables for `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/rationmitra
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_here
ML_SERVICE_URL=http://localhost:5001
ENCRYPTION_KEY=a_32_character_encryption_key!!!
```

**3. ML Service**

```bash
cd ml-service
python -m venv venv
source venv/bin/activate      # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py                 # Starts on :5001
```

**4. Frontend Client**

```bash
cd client
npm install
npm run dev                   # Starts on :5173
```

---

## Seed Data & Demo Credentials

Populate the database with realistic demo data (14 users, 3 shops, inventory, queues, feedback, notifications):

```bash
# Docker
docker exec -it rationmitra-server npm run seed

# Manual
cd server
node src/scripts/seed.js
```

### Demo Accounts

Seeded accounts follow the pattern `<role>@rationmitra.in` (e.g. `admin@rationmitra.in`, `ramesh@rationmitra.in`).
See `server/src/scripts/seed.js` for the full account list and default credentials used for local development only.

### Seeded Shops

| Shop | Code | Location | Counters | Capacity/Slot |
|------|------|----------|----------|---------------|
| FPS Kukatpally - Ward 12 | FPS-HYD-012 | KPHB Colony, Hyderabad | 2 | 30 |
| FPS Ameerpet - Ward 7 | FPS-HYD-007 | SR Nagar, Hyderabad | 3 | 40 |
| FPS Secunderabad - Ward 3 | FPS-HYD-003 | Trimulgherry, Secunderabad | 2 | 25 |

### Seeded Inventory (per shop)

Rice (kg), Wheat (kg), Sugar (kg), Kerosene Oil (liter), Toor Dal (kg) -- each with 30 days of stock history.

---

## API Endpoints

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | No | Server health check |

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/register` | No | Register new user (rate-limited) |
| POST | `/login` | No | Login, returns JWT access + refresh tokens |
| POST | `/refresh` | No | Refresh access token |
| POST | `/logout` | Yes | Logout (audit-logged) |
| GET | `/profile` | Yes | Get current user profile |
| PUT | `/profile` | Yes | Update profile |

### Queue Management (`/api/queue`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/shops-list` | Yes | All | List active shops |
| GET | `/available-slots/:shopId/:date` | Yes | All | Get available time slots |
| POST | `/book-slot` | Yes | cardholder | Book a queue slot |
| GET | `/my-bookings` | Yes | All | View own bookings |
| DELETE | `/cancel-booking/:bookingId` | Yes | All | Cancel a booking |
| GET | `/live-status/:shopId` | Yes | All | Real-time queue status |
| POST | `/mark-served` | Yes | shopowner+ | Mark beneficiary as served |
| POST | `/call-next` | Yes | shopowner+ | Call next person in queue |

### Inventory (`/api/inventory`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/:shopId` | Yes | All | Get shop inventory |
| POST | `/update-stock` | Yes | shopowner+ | Update stock levels |
| POST | `/set-reorder-level` | Yes | shopowner+ | Set reorder threshold |
| GET | `/forecast/:shopId` | Yes | All | Get stock depletion forecast |

### Feedback (`/api/feedback`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/submit` | Yes | Submit feedback with auto-sentiment |
| GET | `/shop-sentiment/:shopId` | Yes | Get aggregated shop sentiment |

### Face Recognition (`/api/face`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| POST | `/enroll` | Yes | All | Enroll face (128D embedding, AES-256 encrypted) |
| POST | `/verify` | Yes | shopowner+ | Verify beneficiary face |
| GET | `/enrollment-status/:userId` | Yes | All | Check enrollment status |
| PUT | `/update` | Yes | All | Update face enrollment |

### Shops (`/api/shops`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/list` | Yes | All | List active shops |
| GET | `/:id` | Yes | All | Get shop details |
| POST | `/` | Yes | admin+ | Create new shop |
| PUT | `/:id` | Yes | shopowner+ | Update shop |

### ML Proxy (`/api/ml`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/predict-demand` | Yes | Predict footfall (proxied to Flask) |
| POST | `/recommend-slots` | Yes | Get slot recommendations |
| POST | `/analyze-sentiment` | Yes | Analyze feedback sentiment |
| POST | `/forecast-stock` | Yes | Forecast stock depletion (single or batch) |
| GET | `/status` | Yes | Check ML service health |

### Analytics (`/api/analytics`)

| Method | Endpoint | Auth | Roles | Description |
|--------|----------|------|-------|-------------|
| GET | `/dashboard` | Yes | admin+ | Admin KPI dashboard |
| GET | `/fraud-alerts` | Yes | admin+ | List fraud alerts |
| PUT | `/fraud-alerts/:id` | Yes | admin+ | Update fraud alert status |
| GET | `/audit-logs` | Yes | sysadmin | View system audit logs |
| GET | `/shop-performance` | Yes | admin+ | Shop performance metrics |

### Notifications (`/api/notifications`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my` | Yes | Get user notifications (last 50) |
| GET | `/unread-count` | Yes | Get unread notification count |
| PUT | `/mark-read/:id` | Yes | Mark notification as read |

### ML Service Direct Endpoints (`:5001`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | ML service health |
| GET | `/api/ml/model-status` | Status of all ML models |
| POST | `/api/ml/predict-demand` | Demand prediction |
| POST | `/api/ml/recommend-slots` | Slot recommendations |
| POST | `/api/ml/analyze-sentiment` | Single text sentiment |
| POST | `/api/ml/batch-sentiment` | Batch sentiment analysis |
| POST | `/api/ml/face/generate-embedding` | Generate 128D face embedding |
| POST | `/api/ml/face/verify` | Verify face against stored embedding |
| POST | `/api/ml/forecast-stock` | Single item stock forecast |
| POST | `/api/ml/batch-forecast-stock` | Batch stock forecast |

### WebSocket Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `queue:join-room` | Client -> Server | Join a shop's live queue room |
| `queue:leave-room` | Client -> Server | Leave a shop's queue room |
| `queue:position-update` | Bidirectional | Broadcast queue position changes |
| `queue:alert-approaching` | Server -> Client | Notify user their turn is near |

---

## Screenshots

> Replace these placeholders with actual screenshots.

| Screen | Description |
|--------|-------------|
| ![Login](docs/screenshots/login.png) | Login page |
| ![Dashboard](docs/screenshots/dashboard.png) | Role-aware dashboard |
| ![Book Slot](docs/screenshots/book-slot.png) | Slot booking with shop selection |
| ![Queue Management](docs/screenshots/queue-manage.png) | Live queue panel for shop owners |
| ![Inventory](docs/screenshots/inventory.png) | Stock management with reorder alerts |
| ![Stock Forecast](docs/screenshots/stock-forecast.png) | ML-powered depletion forecast |
| ![Demand Prediction](docs/screenshots/demand-prediction.png) | Footfall prediction charts |
| ![Face Enroll](docs/screenshots/face-enroll.png) | Face enrollment with liveness check |
| ![Feedback](docs/screenshots/feedback.png) | Bilingual feedback with sentiment |
| ![Admin Dashboard](docs/screenshots/admin-dashboard.png) | Analytics & KPI dashboard |
| ![Fraud Alerts](docs/screenshots/fraud-alerts.png) | Fraud detection alerts |

---

## Testing

### Backend Tests

```bash
cd server
npm test                 # Runs Jest with coverage

# Docker
docker exec -it rationmitra-server npm test
```

### ML Service Tests

```bash
cd ml-service
pytest tests/ -v         # Runs pytest

# Docker
docker exec -it rationmitra-ml pytest tests/ -v
```

### Frontend Build Check

```bash
cd client
npm run build            # TypeScript compilation + Vite production build
```

### API Health Checks

```bash
# Server
curl http://localhost:5000/api/health

# ML Service
curl http://localhost:5001/api/health

# ML Model Status
curl http://localhost:5001/api/ml/model-status
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `5000` | Backend server port |
| `NODE_ENV` | `development` | Environment mode |
| `MONGO_URI` | `mongodb://localhost:27017/rationmitra` | MongoDB connection string |
| `JWT_SECRET` | `dev_jwt_secret` | JWT signing secret |
| `JWT_REFRESH_SECRET` | `dev_jwt_refresh_secret` | Refresh token secret |
| `ML_SERVICE_URL` | `http://localhost:5001` | ML microservice URL |
| `ENCRYPTION_KEY` | `default_32_char_encryption_key!!` | AES-256 key for face data |

---

## Team

**RationMitra** was built as a B.Tech second-year project at **M.V.S.R. Engineering College**, Department of CSE (AI & ML), Batch 2025-2026.

| Name | Role |
|------|------|
| **Kondameedi Srujan Raj** | Developer |
| **Pambi Akshaya** | Developer |
| **Ginna Deekshith Sharma** | Developer |

**Project Guide:** Ms. Anupama Meduri

---

## License

This project is licensed under the [MIT License](LICENSE).

---

<p align="center">
  Built with purpose for India's public welfare infrastructure.
</p>
