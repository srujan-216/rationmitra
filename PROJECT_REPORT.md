# RationMitra — Project Report

## AI-Powered Smart Queue Optimization & Distribution Management System

---

**Institution:** M.V.S.R. Engineering College, Hyderabad
**Department:** CSE (AI & ML)
**Batch:** 2025–2026 | Semester IV
**Theme:** Full Stack Development
**Domain:** Smart Governance & Civic Technology

**Team Members:**

| # | Name | Roll Number |
|---|------|-------------|
| 1 | Kondameedi Srujan Raj | 2451-24-748-031 |
| 2 | Pambi Akshaya | 2451-24-748-050 |
| 3 | Ginna Deekshith Sharma | 2451-24-748-019 |

**Guide:** Ms. Anupama Meduri, Associate Professor, CSE Allied

**Date:** March 2026

---

## Table of Contents

1. [Abstract](#1-abstract)
2. [Introduction](#2-introduction)
3. [Problem Statement](#3-problem-statement)
4. [Proposed Solution](#4-proposed-solution)
5. [System Architecture](#5-system-architecture)
6. [Technology Stack](#6-technology-stack)
7. [Module Descriptions](#7-module-descriptions)
8. [Database Design](#8-database-design)
9. [API Specification](#9-api-specification)
10. [ML Model Details](#10-ml-model-details)
11. [Security Implementation](#11-security-implementation)
12. [Testing & Results](#12-testing--results)
13. [Screenshots & UI](#13-screenshots--ui)
14. [Deployment](#14-deployment)
15. [Limitations & Future Scope](#15-limitations--future-scope)
16. [Conclusion](#16-conclusion)
17. [References](#17-references)

---

## 1. Abstract

India's Public Distribution System (PDS) serves over 80 crore citizens through 5 lakh government-run ration shops, yet operates with virtually zero digital infrastructure at the grassroots level. Beneficiaries face long unorganized queues, lack of stock visibility, and vulnerability to identity fraud. Shop owners lack tools for crowd management, demand prediction, and inventory tracking.

**RationMitra** is a full-stack, AI-powered web platform that digitizes and streamlines the PDS through intelligent queue management, real-time coordination, biometric verification, and predictive analytics. The system comprises a React frontend, Node.js backend, MongoDB database, and a Python Flask ML service — all containerized with Docker for easy deployment.

Key outcomes include: real-time queue tracking with Socket.io, ML-driven demand forecasting with day-of-week seasonality, bilingual sentiment analysis (Hindi + English), 128D face embedding verification with AES-256 encryption, automated stock depletion forecasting, and a comprehensive fraud detection system.

The system was validated with 61 automated tests (20 Jest backend + 41 pytest ML) with 100% pass rate and zero TypeScript compilation errors across 92 source files.

**Keywords:** Public Distribution System, Queue Management, Face Recognition, Demand Forecasting, Sentiment Analysis, MERN Stack, Machine Learning, Real-time Systems

---

## 2. Introduction

### 2.1 Background

The National Food Security Act (NFSA) 2013 entitles approximately two-thirds of India's population to subsidized foodgrains through the Public Distribution System. Despite being one of the largest food distribution networks in the world, the PDS suffers from systemic inefficiencies rooted in manual, paper-based processes.

The Digital India Initiative and National e-Governance Plan (NeGP) have laid the groundwork for technology-driven governance, but ration shops — the last mile of food distribution — remain largely undigitized.

### 2.2 Motivation

Our team identified the following pain points through field observation and stakeholder interviews:

1. **For beneficiaries:** Hours of waiting in unorganized queues with no visibility into wait times or stock availability.
2. **For shop owners:** No tools for crowd management, inventory tracking, or demand prediction.
3. **For administrators:** No performance metrics, feedback mechanisms, or fraud detection capabilities.

### 2.3 Objective

Design and implement a cloud-ready, AI-powered platform that:
- Eliminates queue-related hardship through time-slot booking and real-time tracking
- Prevents ration card fraud through biometric face verification
- Enables data-driven decision making through ML-powered demand and stock forecasting
- Provides transparency through feedback collection and sentiment analysis
- Requires zero hardware investment — works on basic smartphones via web browser

---

## 3. Problem Statement

India's PDS network faces the following critical challenges:

| Problem | Impact | Scale |
|---------|--------|-------|
| Unorganized queues | 2–4 hours average wait time | 80 crore beneficiaries |
| No stock visibility | Wasted trips when items unavailable | 5 lakh shops |
| Identity fraud | Duplicate/fake ration card usage | Estimated 15% leakage |
| No demand prediction | Over/under-stocking, supply disruption | Nationwide |
| No feedback mechanism | No accountability or improvement cycle | All stakeholders |
| Manual inventory | Stock shortages detected too late | All shops |
| Communication gaps | No advance notification to beneficiaries | All beneficiaries |

The core problem: **There is no integrated digital platform that connects beneficiaries, shop owners, and administrators in real-time with intelligent automation.**

---

## 4. Proposed Solution

RationMitra addresses each pain point with a corresponding technical module:

| Pain Point | Module | Technology |
|------------|--------|------------|
| Long queues | Real-time Queue Management | Socket.io, Time-slot booking |
| No stock visibility | Inventory Management | MongoDB, REST API |
| Identity fraud | Face Recognition | 128D embeddings, AES-256 |
| No demand prediction | Demand Forecasting | Weighted Moving Average, Seasonality |
| No feedback | Sentiment Analysis | Bilingual NLP (Hindi + English) |
| Manual inventory | Stock Forecasting | Trend analysis, Depletion prediction |
| Communication gaps | Notification System | SMS/Email/Push alerts |
| No oversight | Admin Analytics | KPI dashboard, Fraud detection |

### 4.1 Key Design Principles

1. **Zero hardware investment** — Cloud-based, runs on any browser
2. **Privacy-first** — No raw face images stored, only encrypted embeddings
3. **Graceful degradation** — System works even if ML service is unavailable
4. **Role-based access** — Four distinct roles with least-privilege access
5. **Real-time** — Sub-second queue updates via WebSocket

---

## 5. System Architecture

### 5.1 High-Level Architecture

```
                           +-----------------+
                           |   Web Browser   |
                           | (React + TS)    |
                           +--------+--------+
                                    |
                           HTTP / WebSocket
                                    |
                           +--------v--------+
                           |   API Gateway   |
                           | Express.js      |
                           | JWT Auth        |
                           | Rate Limiting   |
                           +----+-------+----+
                                |       |
                   +------------+       +------------+
                   |                                  |
          +--------v--------+              +----------v---------+
          |  Node.js API    |              |  Python Flask ML   |
          |  Server         |              |  Service           |
          |                 |              |                    |
          | - Auth          |   REST API   | - Demand Predict   |
          | - Queue Mgmt    +<------------>+ - Sentiment NLP    |
          | - Inventory     |              | - Face Recognition |
          | - Feedback      |              | - Stock Forecast   |
          | - Notifications |              |                    |
          | - Analytics     |              +----------+---------+
          +--------+--------+                         |
                   |                                  |
          +--------v----------------------------------v---------+
          |                   MongoDB                           |
          |  Users | Shops | Queues | Inventory | Feedback      |
          |  FaceData | Notifications | FraudAlerts | AuditLogs |
          +-----------------------------------------------------+
```

### 5.2 Data Flow

1. **Booking Flow:** Cardholder -> Login -> Select Shop -> View Predicted Demand -> Book Slot -> Receive SMS Confirmation -> Join Queue on Date -> Real-time Position Updates -> Face Verification -> Service -> Feedback
2. **Shop Owner Flow:** Login -> View Live Queue -> Call Next -> Verify Face -> Mark Served -> Update Inventory -> View Forecasts -> View Feedback Sentiment
3. **Admin Flow:** Login -> System Dashboard -> View KPIs -> Monitor Fraud Alerts -> Review Shop Performance -> Manage Users

### 5.3 Real-time Communication

```
Client A (Cardholder)                 Server                  Client B (Shop Owner)
      |                                 |                            |
      |--- join room (shop:123) ------->|                            |
      |                                 |<-- join room (shop:123) ---|
      |                                 |                            |
      |                                 |<-- mark-served ------------|
      |                                 |                            |
      |<-- queue:completed -------------|--- queue:completed ------->|
      |<-- queue:position-update -------|                            |
      |                                 |                            |
```

---

## 6. Technology Stack

### 6.1 Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI component library |
| TypeScript | 5.5.4 | Type safety |
| Vite | 5.4.3 | Build tool & dev server |
| Tailwind CSS | 3.4.10 | Utility-first CSS framework |
| React Router DOM | 6.26.2 | Client-side routing |
| Axios | 1.7.7 | HTTP client with interceptors |
| Socket.io-client | 4.7.5 | Real-time WebSocket client |
| React Hot Toast | 2.4.1 | Toast notifications |

### 6.2 Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 20.x | Runtime environment |
| Express.js | 4.21.0 | HTTP framework |
| MongoDB | 7.x | NoSQL database |
| Mongoose | 8.6.0 | MongoDB ODM |
| Socket.io | 4.7.5 | Real-time WebSocket server |
| JSON Web Token | 9.0.2 | Authentication tokens |
| bcryptjs | 2.4.3 | Password hashing (12 salt rounds) |
| CryptoJS | 4.2.0 | AES-256 encryption |
| express-rate-limit | 7.4.0 | API rate limiting |
| Helmet | 7.1.0 | HTTP security headers |
| express-validator | 7.2.0 | Input validation |

### 6.3 ML Service

| Technology | Version | Purpose |
|------------|---------|---------|
| Python | 3.11+ | ML runtime |
| Flask | 3.0.3 | ML API server |
| NumPy | 1.26.4 | Numerical computing |
| Pandas | 2.2.2 | Data manipulation |
| scikit-learn | 1.5.1 | ML algorithms |

### 6.4 DevOps & Testing

| Technology | Purpose |
|------------|---------|
| Docker + Docker Compose | Containerization |
| Jest + Supertest | Backend testing |
| pytest | ML service testing |
| Git | Version control |

---

## 7. Module Descriptions

### Module 1: User Authentication & Role Management

**Purpose:** Secure multi-role authentication with session management.

**Implementation:**
- Registration with email, phone, and password validation (Indian phone number regex: `/^[6-9]\d{9}$/`)
- Passwords hashed with bcrypt (12 salt rounds)
- JWT access tokens (15-minute expiry) + refresh tokens (7-day expiry, rotated on use)
- Four roles: `cardholder`, `shopowner`, `admin`, `sysadmin`
- RBAC middleware enforces route-level access control
- Automatic token refresh via Axios interceptor on 401 responses

**Files:**
- `server/src/controllers/authController.js` — Register, login, refresh, logout, profile
- `server/src/middleware/auth.js` — JWT verification middleware
- `server/src/middleware/rbac.js` — Role-based authorization
- `client/src/context/AuthContext.tsx` — Global auth state with React Context
- `client/src/components/ProtectedRoute.tsx` — Route guard component

### Module 2: Real-Time Queue Management

**Purpose:** Enable time-slot booking and live queue tracking.

**Implementation:**
- Dynamic slot generation based on shop operating hours and slot duration
- Booking with duplicate detection (one booking per user per slot)
- Cancellation support for `waiting` status entries
- Live queue status via Socket.io rooms (one room per shop)
- `call-next` transitions entry from `waiting` -> `in_service`
- `mark-served` transitions entry from `in_service` -> `completed` with service time calculation
- Automatic notification dispatch at each lifecycle event

**Queue Entry States:**
```
waiting -> in_service -> completed
   |
   +-> cancelled
   +-> no_show
```

**Files:**
- `server/src/controllers/queueController.js` — 7 controller methods
- `server/src/socket/index.js` — Socket.io room management and event broadcasting
- `client/src/pages/BookSlot.tsx` — Slot selection with availability indicators
- `client/src/pages/QueueManage.tsx` — Shop owner live queue dashboard

### Module 3: Intelligent Demand Prediction

**Purpose:** ML-driven footfall prediction to optimize slot recommendations.

**Algorithm: Weighted Moving Average with Seasonal Adjustment**

1. **Training:** Compute base demand (mean footfall) and day-of-week seasonal factors from historical data
2. **Prediction:** Apply exponential weights to recent 30 days of history, multiply by day-of-week factor
3. **Confidence interval:** 95% CI using ±1.96 standard deviations
4. **Slot recommendations:** Distribute predicted load across slots with time-of-day modifiers:
   - Morning (8–10 AM): 1.4x factor (rush hour)
   - Lunch (12–2 PM): 0.7x factor (low traffic)
   - Evening (4–6 PM): 1.3x factor (evening rush)
   - Other: 1.0x factor

**API:** `POST /api/ml/predict-demand` -> 7-day forecast with confidence intervals

**Files:**
- `ml-service/models/demand_predictor.py` — DemandPredictor class
- `client/src/pages/DemandPrediction.tsx` — Visual forecast with bar charts and slot cards

### Module 4: Face Recognition & Fraud Prevention

**Purpose:** Biometric verification to prevent ration card misuse.

**Implementation:**
1. **Enrollment:** User captures selfie via browser camera API -> base64 image sent to ML service -> 128D embedding generated (deterministic hash-based in dev, FaceNet in production) -> encrypted with AES-256 -> stored in MongoDB
2. **Verification:** Shop owner captures live image -> ML service generates live embedding -> cosine similarity comparison against stored embedding -> threshold check (0.6 cosine similarity = 80% match score)
3. **Security:** No raw images stored, only encrypted 128D vectors. Anti-spoofing placeholder ready for liveness detection.
4. **Fraud detection:** Every failed verification triggers fraud alert check. After 3 consecutive failures, an alert is created.

**Match Score Calculation:**
```
cosine_similarity = dot(e1, e2) / (||e1|| * ||e2||)
match_score = (cosine_similarity + 1) / 2    // Map [-1,1] to [0,1]
threshold = 0.8 (80%)
```

**Files:**
- `ml-service/models/face_recognition_service.py` — Embedding generation, cosine comparison, anti-spoofing
- `server/src/controllers/faceController.js` — Enroll, verify, status (with encryption)
- `client/src/pages/FaceEnroll.tsx` — Camera capture with face oval guide
- `client/src/pages/FaceVerify.tsx` — Counter-side verification with confidence display

### Module 5: Automated Inventory & Stock Management

**Purpose:** Real-time stock tracking with depletion forecasting.

**Implementation:**
- Stock-in (inward) and stock-out (outward) transactions with full history log
- Automatic `isLowStock` flag when current stock drops below reorder level
- ML-powered depletion forecasting:
  - Calculates average daily consumption from outward history
  - Predicts depletion date: `current_stock / avg_daily_consumption`
  - Detects consumption trends: increasing, decreasing, stable
  - Recommends reorder quantity (14-day supply)
  - Urgency levels: critical (<=3 days), high (<=7), medium (<=14), low (>14)

**Files:**
- `server/src/controllers/inventoryController.js` — CRUD + basic forecast
- `ml-service/models/stock_forecaster.py` — Advanced trend-based forecasting
- `client/src/pages/Inventory.tsx` — Stock table with update form
- `client/src/pages/StockForecast.tsx` — Depletion cards with urgency badges

### Module 6: Feedback & Sentiment Analysis

**Purpose:** NLP-driven feedback analysis for shop performance evaluation.

**Implementation:**
- Star rating (1–5) + text feedback collection
- Automatic sentiment analysis on every submission via ML service
- Bilingual keyword-based analyzer (Hindi + English):
  - Positive words: good, excellent, accha, badiya, shandar, etc.
  - Negative words: bad, terrible, kharab, bekaar, pareshani, etc.
- Topic extraction: staff behavior, queue time, product quality, hygiene, availability
- Rolling shop rating calculation
- Sentiment distribution visualization (positive/neutral/negative bars)

**Files:**
- `ml-service/models/sentiment_analyzer.py` — SentimentAnalyzer with 60+ bilingual keywords
- `server/src/controllers/feedbackController.js` — Auto-calls ML on submit
- `client/src/pages/SubmitFeedback.tsx` — Star rating + text form
- `client/src/pages/FeedbackView.tsx` — Sentiment charts and topic breakdown

### Module 7: Push Notifications & SMS Alerts

**Purpose:** Keep users informed at critical touchpoints.

**Notification Triggers:**
| Event | Channel | Recipient |
|-------|---------|-----------|
| Slot booked | SMS | Cardholder |
| Turn approaching | Push | Cardholder |
| Service completed | Push | Cardholder |
| Low stock alert | Push | Shop owner |
| Fraud alert | Push | Admin |

**Implementation:**
- Notification model with status tracking (pending/sent/failed)
- Service layer ready for Twilio (SMS), SendGrid (email), FCM (push) integration
- In-app notification history page with channel icons

**Files:**
- `server/src/services/notificationService.js` — Dispatch functions
- `server/src/routes/notification.js` — History, unread count, mark-read
- `client/src/pages/Notifications.tsx` — Notification list

### Module 8: Admin & Analytics Dashboard

**Purpose:** Comprehensive system monitoring, reporting, and fraud detection.

**Dashboard KPIs:**
- Total users, active shops, today's bookings
- Currently waiting, total served, avg service time
- Low stock alerts count, open fraud alerts
- User role distribution
- Recent feedback feed

**Fraud Detection System:**
- **Repeated verification failures:** Alert after every 3 failures per user
- **Duplicate bookings:** Alert when user books at multiple shops on same day
- **Daily scan:** Identifies users with 5+ lifetime verification failures
- Alert workflow: `open` -> `investigating` -> `resolved` / `dismissed`

**Audit Logging:**
- Middleware logs all auth events (register, login, logout, profile update)
- Captures: user ID, action, resource, IP address, user agent, timestamp

**Files:**
- `server/src/controllers/analyticsController.js` — Dashboard, fraud alerts, audit logs, shop performance
- `server/src/services/fraudDetectionService.js` — Automated fraud checks
- `server/src/middleware/auditLogger.js` — Request logging middleware
- `client/src/pages/AdminDashboard.tsx` — KPI cards and summary
- `client/src/pages/FraudAlerts.tsx` — Alert management with filters

---

## 8. Database Design

### 8.1 Collections Overview

| Collection | Documents | Purpose |
|------------|-----------|---------|
| users | User profiles | Auth, RBAC, profile management |
| shops | Shop details | Location, hours, capacity, rating |
| queues | Daily queue data | Slots, entries, service tracking |
| inventories | Stock items | Current stock, history, reorder levels |
| feedbacks | User feedback | Ratings, text, sentiment, topics |
| facedatas | Face embeddings | Encrypted 128D vectors |
| notifications | Alert log | SMS/email/push history |
| fraudalerts | Security alerts | Fraud detection and resolution |
| auditlogs | Activity log | All user actions |

### 8.2 Key Schema Relationships

```
User (1) -----> (N) Queue Entries
User (1) -----> (1) FaceData
User (1) -----> (N) Feedback
User (1) -----> (N) Notifications
Shop (1) -----> (N) Queue (daily)
Shop (1) -----> (N) Inventory Items
Shop (1) -----> (N) Feedback
Shop (1) <----- (1) User (owner)
```

### 8.3 Indexes

| Collection | Index | Type |
|------------|-------|------|
| users | email, phone | Unique |
| shops | code | Unique |
| queues | shopId + date + slot.slotId | Compound unique |
| inventories | shopId + itemName | Compound unique |
| fraudalerts | status + severity | Compound |
| auditlogs | userId + createdAt | Compound |

---

## 9. API Specification

### 9.1 Authentication (6 endpoints)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | User login |
| POST | /api/auth/refresh | No | Refresh JWT token |
| POST | /api/auth/logout | Yes | User logout |
| GET | /api/auth/profile | Yes | Get user profile |
| PUT | /api/auth/profile | Yes | Update profile |

### 9.2 Queue Management (7 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | /api/queue/shops-list | All | List active shops |
| GET | /api/queue/available-slots/:shopId/:date | All | Get available slots |
| POST | /api/queue/book-slot | Cardholder | Book a time slot |
| GET | /api/queue/my-bookings | All | User's booking history |
| DELETE | /api/queue/cancel-booking/:bookingId | All | Cancel a booking |
| GET | /api/queue/live-status/:shopId | All | Live queue status |
| POST | /api/queue/mark-served | Shop/Admin | Mark user as served |
| POST | /api/queue/call-next | Shop/Admin | Call next in queue |

### 9.3 Inventory (4 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /api/inventory/update-stock | Shop/Admin | Update stock (in/out) |
| POST | /api/inventory/set-reorder-level | Shop/Admin | Set reorder params |
| GET | /api/inventory/forecast/:shopId | All | Basic stock forecast |
| GET | /api/inventory/:shopId | All | Get shop inventory |

### 9.4 Face Recognition (4 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /api/face/enroll | All | Enroll face |
| POST | /api/face/verify | Shop/Admin | Verify identity |
| GET | /api/face/enrollment-status/:userId | All | Check enrollment |
| PUT | /api/face/update | All | Update face |

### 9.5 Feedback (2 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| POST | /api/feedback/submit | All | Submit feedback |
| GET | /api/feedback/shop-sentiment/:shopId | All | Shop sentiment data |

### 9.6 ML Service (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ml/predict-demand | 7-day footfall forecast |
| POST | /api/ml/recommend-slots | Slot load recommendations |
| POST | /api/ml/analyze-sentiment | Text sentiment analysis |
| POST | /api/ml/forecast-stock | Stock depletion forecast |
| GET | /api/ml/status | ML service health |

### 9.7 Analytics (5 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | /api/analytics/dashboard | Admin | System KPIs |
| GET | /api/analytics/fraud-alerts | Admin | Fraud alerts list |
| PUT | /api/analytics/fraud-alerts/:id | Admin | Update alert status |
| GET | /api/analytics/audit-logs | Sysadmin | Audit trail |
| GET | /api/analytics/shop-performance | Admin | Shop rankings |

### 9.8 Notifications (3 endpoints)

| Method | Endpoint | Roles | Description |
|--------|----------|-------|-------------|
| GET | /api/notifications/my | All | User's notifications |
| GET | /api/notifications/unread-count | All | Unread count |
| PUT | /api/notifications/mark-read/:id | All | Mark as read |

### 9.9 WebSocket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| queue:join-room | Client -> Server | Join shop's queue room |
| queue:leave-room | Client -> Server | Leave room |
| queue:position-update | Server -> Client | Queue position changed |
| queue:alert-approaching | Server -> Client | User's turn approaching |
| queue:completed | Server -> Client | Service completed |

---

## 10. ML Model Details

### 10.1 Demand Prediction Model

| Attribute | Value |
|-----------|-------|
| Algorithm | Weighted Moving Average + Day-of-Week Seasonality |
| Input Features | Historical footfall data (date, count) |
| Output | Predicted footfall, 95% confidence interval |
| Training Window | Last 30 days (exponentially weighted) |
| Seasonal Factors | 7 (one per day of week) |
| Update Frequency | On-demand (per request with historical data) |

### 10.2 Sentiment Analysis Model

| Attribute | Value |
|-----------|-------|
| Algorithm | Rule-based keyword matching (bilingual) |
| Languages | English + Hindi (transliterated) |
| Vocabulary | 60+ positive/negative keywords |
| Topic Categories | 5 (staff, queue, quality, hygiene, availability) |
| Output | Sentiment label, score (-1 to 1), topics, confidence |
| Upgrade Path | BERT/DistilBERT fine-tuned on collected feedback data |

### 10.3 Face Recognition

| Attribute | Value |
|-----------|-------|
| Embedding Size | 128 dimensions |
| Similarity Metric | Cosine similarity |
| Match Threshold | 0.6 cosine similarity (80% match score) |
| Storage | AES-256 encrypted embeddings |
| Anti-Spoofing | Placeholder (production: liveness detection) |
| Upgrade Path | OpenCV DNN / dlib / FaceNet |

### 10.4 Stock Forecasting

| Attribute | Value |
|-----------|-------|
| Algorithm | Consumption trend analysis |
| Input | Stock history (inward/outward transactions) |
| Output | Depletion date, reorder date, urgency, trend |
| Trend Detection | 7-day recent vs. older comparison (10% threshold) |
| Reorder Recommendation | 14-day supply buffer |

---

## 11. Security Implementation

### 11.1 Authentication Security

| Measure | Implementation |
|---------|---------------|
| Password Hashing | bcrypt with 12 salt rounds |
| Access Tokens | JWT, 15-minute expiry |
| Refresh Tokens | JWT, 7-day expiry, single-use rotation |
| Rate Limiting | 100 req/min (API), 20 req/15min (auth) |
| Input Validation | express-validator on all endpoints |
| HTTP Headers | Helmet.js (HSTS, XSS protection, etc.) |

### 11.2 Data Security

| Data | Protection |
|------|-----------|
| Passwords | bcrypt hash (irreversible) |
| Ration card numbers | AES-256 encryption |
| Face embeddings | AES-256 encryption |
| API communication | CORS whitelist, HTTPS (production) |

### 11.3 Fraud Prevention

| Detection | Trigger | Severity |
|-----------|---------|----------|
| Repeated verification failures | Every 3 failures | Medium -> Critical |
| Duplicate bookings across shops | Same user, same day, different shops | High |
| Suspicious activity | 5+ lifetime verification failures | High |

### 11.4 Audit Trail

All authentication events are logged with:
- User ID, action type, resource
- HTTP method, path, status code
- IP address, user agent
- Timestamp

---

## 12. Testing & Results

### 12.1 Test Summary

| Test Suite | Framework | Tests | Passed | Failed | Coverage |
|------------|-----------|-------|--------|--------|----------|
| Backend API | Jest + Supertest | 20 | 20 | 0 | Validators, encryption, RBAC, models, routes |
| ML Service | pytest | 41 | 41 | 0 | All 4 ML models + all Flask endpoints |
| TypeScript | tsc --noEmit | — | 0 errors | — | Full codebase |

### 12.2 Backend Test Breakdown

| Test Category | Count | Description |
|---------------|-------|-------------|
| Auth Route Validation | 6 | Missing fields, invalid email/phone, short password |
| Validator Exports | 2 | Registration and login validation arrays |
| Encryption Utils | 2 | Encrypt/decrypt text and JSON |
| RBAC Middleware | 3 | No user, wrong role, correct role |
| Model Exports | 7 | All 7 Mongoose models load correctly |

### 12.3 ML Test Breakdown

| Test Category | Count | Description |
|---------------|-------|-------------|
| DemandPredictor | 6 | Prediction, training, multi-day, slot recommendations |
| SentimentAnalyzer | 9 | Positive/negative/neutral, Hindi, topics, batch |
| FaceRecognitionService | 7 | Embedding generation, comparison, verification, spoofing |
| StockForecaster | 7 | No history, outward history, urgency levels, low stock |
| Flask Endpoints | 12 | All API endpoints including error cases |

### 12.4 Performance Characteristics

| Metric | Target | Status |
|--------|--------|--------|
| API response time | < 1 second | Achieved (local) |
| Socket.io latency | < 500ms | Achieved (local) |
| Sentiment analysis | < 100ms | Achieved (keyword-based) |
| Face verification | < 500ms | Achieved (embedding comparison) |
| TypeScript errors | 0 | Achieved |
| Test pass rate | 100% | Achieved (61/61) |

---

## 13. Screenshots & UI

### 13.1 Page Inventory (22 Routes)

| # | Route | Role | Description |
|---|-------|------|-------------|
| 1 | /login | Public | Login form |
| 2 | /register | Public | Registration with role selection |
| 3 | /dashboard | All | Role-specific dashboard with live stats |
| 4 | /book-slot | Cardholder | Shop/date/slot selection |
| 5 | /my-bookings | All | Booking history with status badges |
| 6 | /face-enroll | All | Camera capture for face enrollment |
| 7 | /submit-feedback | Cardholder | Star rating + text feedback |
| 8 | /queue-manage | Shop/Admin | Live queue with real-time updates |
| 9 | /inventory | Shop/Admin | Stock table with update form |
| 10 | /stock-forecast | Shop/Admin | Depletion cards with urgency badges |
| 11 | /face-verify | Shop/Admin | Counter-side face verification |
| 12 | /demand-prediction | Shop/Admin | 7-day forecast bar chart |
| 13 | /feedback-view | Shop/Admin | Sentiment distribution and recent feedback |
| 14 | /admin | Admin | System KPI dashboard |
| 15 | /fraud-alerts | Admin | Alert management with status workflow |
| 16 | /notifications | All | Notification history |

### 13.2 UI Design

- **Design System:** Tailwind CSS with custom primary (blue) and accent (amber) color palette
- **Typography:** System font stack, sans-serif
- **Components:** Consistent card-based layout with shadow-sm, rounded-xl corners
- **Responsive:** Mobile-first with hamburger navigation menu
- **Feedback:** Toast notifications for all user actions (react-hot-toast)
- **Status Indicators:** Color-coded badges (green=success, yellow=pending, red=alert)

---

## 14. Deployment

### 14.1 Docker Compose (Local Development)

```yaml
services:
  mongodb:    # MongoDB 7, port 27017
  server:     # Node.js API, port 5000
  client:     # React dev server, port 5173
  ml-service: # Flask ML API, port 5001
```

Command: `docker-compose up`

### 14.2 Manual Setup

```bash
# 1. Start MongoDB
mongod

# 2. Seed database
cd server && npm install && npm run seed

# 3. Start backend
cd server && npm run dev

# 4. Start frontend
cd client && npm install && npm run dev

# 5. Start ML service
cd ml-service && pip install -r requirements.txt && python app.py
```

### 14.3 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rationmitra.in | password123 |
| Sysadmin | sysadmin@rationmitra.in | password123 |
| Shop Owner | ramesh@rationmitra.in | password123 |
| Shop Owner | suresh@rationmitra.in | password123 |
| Cardholder | user1@rationmitra.in | password123 |

### 14.4 Production Deployment (Recommended: AWS)

| Component | AWS Service |
|-----------|------------|
| Frontend | S3 + CloudFront |
| Backend | ECS / EC2 |
| Database | MongoDB Atlas |
| ML Service | EC2 / SageMaker |
| Notifications | SNS (SMS), SES (Email) |
| File Storage | S3 (encrypted) |

---

## 15. Limitations & Future Scope

### 15.1 Current Limitations

1. **Face recognition:** Uses deterministic hash-based embeddings in development. Production requires OpenCV DNN or dlib integration.
2. **Sentiment analysis:** Rule-based keyword matching. Accuracy improves significantly with fine-tuned BERT/DistilBERT model.
3. **Demand prediction:** Weighted moving average is simple. ARIMA/Prophet would provide better forecasts with more data.
4. **Notifications:** Currently logs to database. Requires Twilio/SendGrid/FCM credentials for actual delivery.
5. **Anti-spoofing:** Placeholder. Production needs liveness detection (blink, head movement, texture analysis).
6. **No offline support:** Requires internet connectivity.

### 15.2 Future Enhancements

**Phase 2 (Short-term):**
- Mobile app (React Native)
- QR code auto-check-in
- Multilingual support (all 22 Indian languages)
- Progressive Web App (PWA) with offline support
- Aadhaar integration for auto-enrollment

**Phase 3 (Medium-term):**
- BERT/DistilBERT sentiment model trained on collected feedback
- Prophet/ARIMA demand forecasting with weather and holiday features
- OpenCV DNN face recognition with liveness detection
- Blockchain for immutable transaction records
- IoT sensors for automated stock counting

**Phase 4 (Long-term):**
- National PDS digitization platform
- Integration with Direct Benefit Transfer (DBT)
- AI-powered dynamic pricing for surplus stocks
- Supply chain optimization with logistics planning
- Predictive intervention for food inflation

---

## 16. Conclusion

RationMitra demonstrates that India's Public Distribution System can be significantly improved through thoughtful application of full-stack web development and machine learning. The platform addresses all identified pain points:

- **Queue chaos** -> Organized time-slot booking with real-time tracking
- **Identity fraud** -> Biometric face verification with encrypted storage
- **Stock blindness** -> ML-powered depletion forecasting with reorder alerts
- **Communication gaps** -> Automated notifications at every lifecycle event
- **No accountability** -> Sentiment analysis and shop performance rankings
- **No oversight** -> Admin dashboard with fraud detection and audit trails

The project successfully integrates a React frontend (22 pages), Node.js API (40+ endpoints), Python ML service (4 models, 8 endpoints), and MongoDB database (9 collections) — all validated by 61 automated tests with 100% pass rate.

With zero hardware investment required and a cloud-ready containerized architecture, RationMitra is a viable proof-of-concept for national-scale PDS digitization, with the potential to improve the lives of over 80 crore Indian beneficiaries.

---

## 17. References

1. National Food Security Act (NFSA), 2013. Ministry of Law and Justice, Government of India.
2. Digital India Programme. Ministry of Electronics & Information Technology.
3. National e-Governance Plan (NeGP). Department of Information Technology.
4. Ministry of Consumer Affairs, Food & Public Distribution. Annual Report 2024-25.
5. React Documentation. https://react.dev
6. Express.js Documentation. https://expressjs.com
7. MongoDB Documentation. https://www.mongodb.com/docs
8. Socket.io Documentation. https://socket.io/docs
9. Tailwind CSS Documentation. https://tailwindcss.com/docs
10. Flask Documentation. https://flask.palletsprojects.com
11. scikit-learn Documentation. https://scikit-learn.org
12. JSON Web Tokens (RFC 7519). https://tools.ietf.org/html/rfc7519
13. bcrypt Adaptive Hashing. Provos, N. & Mazieres, D. (1999). USENIX.
14. FaceNet: A Unified Embedding for Face Recognition. Schroff, F., Kalenichenko, D., & Philbin, J. (2015). IEEE CVPR.
15. BERT: Pre-training of Deep Bidirectional Transformers. Devlin, J., et al. (2019). NAACL.
16. Optimization of Supply Chains in Public Distribution System. IEEE Conference Proceedings.
17. Machine Learning for Queue Management Systems. ACM Digital Library.

---

**Document Version:** 1.0
**Total Source Files:** 92
**Total Test Cases:** 61 (20 Jest + 41 pytest)
**Test Pass Rate:** 100%
**TypeScript Errors:** 0

---

*This report was prepared as part of the Semester IV Full Stack Development project at M.V.S.R. Engineering College, Department of CSE (AI & ML), Batch 2025-2026.*
