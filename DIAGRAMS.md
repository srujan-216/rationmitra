# RationMitra — Diagrams for Submission

---

## 1. SYSTEM ARCHITECTURE DIAGRAM

```
 ┌─────────────────────────────────────────────────────────────────┐
 │                         USER DEVICES                            │
 │         (Mobile Browser / Desktop Browser / Tablet)             │
 └──────────────────────────┬──────────────────────────────────────┘
                            │  HTTPS / WebSocket
                            │
 ┌──────────────────────────▼──────────────────────────────────────┐
 │                                                                  │
 │                    FRONTEND (React.js)                           │
 │                    Port: 5173                                    │
 │                                                                  │
 │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
 │   │  Login / │  │  Queue   │  │ Inventory│  │  Admin   │      │
 │   │ Register │  │ Booking  │  │ Manager  │  │Dashboard │      │
 │   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
 │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
 │   │  Face    │  │ Feedback │  │  Stock   │  │  Fraud   │      │
 │   │ Enroll   │  │  Form    │  │ Forecast │  │  Alerts  │      │
 │   └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
 │                                                                  │
 └──────────────────────────┬──────────────────────────────────────┘
                            │  REST API + Socket.io
                            │
 ┌──────────────────────────▼──────────────────────────────────────┐
 │                                                                  │
 │                 BACKEND SERVER (Node.js + Express)               │
 │                 Port: 5000                                       │
 │                                                                  │
 │   ┌────────────────────────────────────────────────────┐        │
 │   │  Middleware Layer                                    │        │
 │   │  - JWT Authentication                               │        │
 │   │  - Role-Based Access Control (RBAC)                 │        │
 │   │  - Rate Limiting (100 req/min)                      │        │
 │   │  - Input Validation                                 │        │
 │   │  - Audit Logging                                    │        │
 │   └────────────────────────────────────────────────────┘        │
 │                                                                  │
 │   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
 │   │   Auth    │ │   Queue   │ │ Inventory │ │ Feedback  │     │
 │   │  Service  │ │  Service  │ │  Service  │ │  Service  │     │
 │   └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
 │   ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐     │
 │   │   Face    │ │   Notif   │ │ Analytics │ │   Fraud   │     │
 │   │  Service  │ │  Service  │ │  Service  │ │ Detection │     │
 │   └───────────┘ └───────────┘ └───────────┘ └───────────┘     │
 │                                                                  │
 └────────────┬────────────────────────────────┬───────────────────┘
              │                                │
              │  Mongoose ODM                  │  REST API calls
              │                                │
 ┌────────────▼──────────────┐   ┌─────────────▼─────────────────┐
 │                            │   │                                │
 │    MongoDB Database        │   │   ML SERVICE (Python Flask)    │
 │    Port: 27017             │   │   Port: 5001                   │
 │                            │   │                                │
 │  Collections:              │   │  ┌────────────────────────┐   │
 │  - users                   │   │  │ Demand Prediction      │   │
 │  - shops                   │   │  │ (Moving Avg + Season)  │   │
 │  - queues                  │   │  └────────────────────────┘   │
 │  - inventories             │   │  ┌────────────────────────┐   │
 │  - feedbacks               │   │  │ Sentiment Analysis     │   │
 │  - facedatas               │   │  │ (Hindi + English NLP)  │   │
 │  - notifications           │   │  └────────────────────────┘   │
 │  - fraudalerts             │   │  ┌────────────────────────┐   │
 │  - auditlogs               │   │  │ Face Recognition       │   │
 │                            │   │  │ (128D Embeddings)      │   │
 │                            │   │  └────────────────────────┘   │
 │                            │   │  ┌────────────────────────┐   │
 │                            │   │  │ Stock Forecasting      │   │
 │                            │   │  │ (Trend Analysis)       │   │
 │                            │   │  └────────────────────────┘   │
 │                            │   │                                │
 └────────────────────────────┘   └────────────────────────────────┘
```

---

## 2. USER ROLE HIERARCHY

```
                    ┌──────────────┐
                    │   SYSADMIN   │
                    │  (Full       │
                    │   Access)    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │    ADMIN     │
                    │ (Analytics,  │
                    │  Shops,      │
                    │  Fraud)      │
                    └──────┬───────┘
                           │
              ┌────────────┴────────────┐
              │                         │
       ┌──────▼───────┐         ┌──────▼───────┐
       │  SHOP OWNER  │         │  CARDHOLDER  │
       │              │         │              │
       │ - Queue Mgmt │         │ - Book Slots │
       │ - Inventory  │         │ - View Queue │
       │ - Verify Face│         │ - Enroll Face│
       │ - Forecasts  │         │ - Feedback   │
       │ - Feedback   │         │ - Notify     │
       └──────────────┘         └──────────────┘
```

---

## 3. COMPLETE APPLICATION FLOWCHART

```
                              ┌─────────┐
                              │  START  │
                              └────┬────┘
                                   │
                                   ▼
                          ┌────────────────┐
                          │  Open Website  │
                          └───────┬────────┘
                                  │
                                  ▼
                      ┌───────────────────────┐
                      │  Has Account?          │
                      └───────┬───────┬────────┘
                         No   │       │  Yes
                              │       │
                 ┌────────────▼┐  ┌───▼──────────┐
                 │  Register   │  │    Login      │
                 │  (Name,     │  │  (Email +     │
                 │  Email,     │  │   Password)   │
                 │  Phone,     │  │               │
                 │  Password,  │  └───┬───────────┘
                 │  Role)      │      │
                 └──────┬──────┘      │
                        │             │
                        └──────┬──────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  JWT Token Issued    │
                    │  (Access + Refresh)  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Check User Role    │
                    └──┬──────┬────────┬───┘
                       │      │        │
          Cardholder   │      │ Shop   │  Admin
                       │      │ Owner  │
          ┌────────────▼┐  ┌──▼────┐  ┌▼───────────┐
          │ Cardholder  │  │ Shop  │  │   Admin    │
          │ Dashboard   │  │ Owner │  │  Dashboard │
          │             │  │ Dash  │  │            │
          │ - Book Slot │  │board  │  │- KPIs      │
          │ - Bookings  │  │       │  │- Fraud     │
          │ - Face ID   │  │-Queue │  │  Alerts    │
          │ - Feedback  │  │-Stock │  │- Shop Perf │
          │ - Notify    │  │-Face  │  │- Audit Log │
          └─────────────┘  │-Pred  │  └────────────┘
                           │-Feed  │
                           └───────┘
```

---

## 4. SLOT BOOKING FLOWCHART (Cardholder)

```
                    ┌──────────────┐
                    │  Cardholder  │
                    │  Logged In   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Click "Book  │
                    │   Slot"      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Select Shop  │
                    │ from List    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Select Date  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ View Slots   │
                    │ (Green=Open, │
                    │  Red=Full)   │
                    └──────┬───────┘
                           │
                           ▼
                  ┌────────────────────┐
                  │  Slot Available?   │
                  └───┬────────────┬───┘
                  No  │            │ Yes
                      │            │
                      ▼            ▼
              ┌──────────┐  ┌──────────────┐
              │ Show     │  │ Book Slot    │
              │ "Full"   │  │              │
              │ Message  │  └──────┬───────┘
              └──────────┘         │
                                   ▼
                          ┌─────────────────┐
                          │ Already Booked? │
                          └──┬──────────┬───┘
                         Yes │          │ No
                             │          │
                             ▼          ▼
                     ┌──────────┐ ┌──────────────┐
                     │ Show     │ │ Generate     │
                     │ Error    │ │ Ticket No.   │
                     └──────────┘ └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Send SMS     │
                                  │ Notification │
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Check for    │
                                  │ Duplicate    │
                                  │ Booking      │
                                  │ (Fraud Check)│
                                  └──────┬───────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Booking      │
                                  │ Confirmed!   │
                                  └──────────────┘
```

---

## 5. QUEUE SERVICE FLOWCHART (Shop Owner)

```
                    ┌───────────────┐
                    │  Shop Owner   │
                    │  Logged In    │
                    └──────┬────────┘
                           │
                           ▼
                    ┌───────────────┐
                    │ Open Queue    │
                    │ Management    │
                    └──────┬────────┘
                           │
                           ▼
                    ┌───────────────┐
                    │ View Today's  │
                    │ Queue (Live)  │◄──── Socket.io
                    └──────┬────────┘      Real-time
                           │               Updates
                           ▼
                 ┌─────────────────────┐
                 │ People Waiting?     │
                 └──┬──────────────┬───┘
                 No │              │ Yes
                    │              │
                    ▼              ▼
            ┌──────────┐   ┌──────────────┐
            │ Wait for │   │ Click "Call  │
            │ Bookings │   │   Next"      │
            └──────────┘   └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ Status ->    │
                           │ "In Service" │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ Push Notif   │
                           │ Sent to User │
                           │ "Your turn!" │
                           └──────┬───────┘
                                  │
                                  ▼
                           ┌──────────────┐
                           │ Verify Face? │
                           └──┬────────┬──┘
                          Yes │        │ No (skip)
                              │        │
                              ▼        │
                      ┌──────────────┐ │
                      │ Camera Opens │ │
                      │ Compare Face │ │
                      └──────┬───────┘ │
                             │         │
                             ▼         │
                     ┌──────────────┐  │
                     │ Match > 80%? │  │
                     └──┬────────┬──┘  │
                    Yes │        │ No  │
                        │        │     │
                        │        ▼     │
                        │  ┌─────────┐ │
                        │  │ ALERT:  │ │
                        │  │ Fraud   │ │
                        │  │ Warning │ │
                        │  └─────────┘ │
                        │              │
                        ▼              │
                 ┌──────────────┐      │
                 │ Distribute   │◄─────┘
                 │ Ration       │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Click "Mark  │
                 │  Served"     │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Status ->    │
                 │ "Completed"  │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Notif Sent:  │
                 │ "Collected   │
                 │  Successfully│
                 │  Give Feedback│
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │ Update Queue │
                 │ for All      │
                 │ (Socket.io)  │
                 └──────────────┘
```

---

## 6. FACE VERIFICATION FLOWCHART

```
                    ┌──────────────┐
                    │  User at     │
                    │  Counter     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Shop Owner   │
                    │ Enters User  │
                    │ ID           │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ Face Enrolled?      │
                  └───┬─────────────┬───┘
                  No  │             │ Yes
                      │             │
                      ▼             ▼
              ┌──────────────┐ ┌──────────────┐
              │ Show Error:  │ │ Open Camera  │
              │ "Not         │ │ (Live Feed)  │
              │  Enrolled"   │ └──────┬───────┘
              └──────────────┘        │
                                      ▼
                               ┌──────────────┐
                               │ Capture Live │
                               │ Photo        │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Send to ML   │
                               │ Service      │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Generate     │
                               │ 128D         │
                               │ Embedding    │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Decrypt      │
                               │ Stored       │
                               │ Embedding    │
                               │ (AES-256)    │
                               └──────┬───────┘
                                      │
                                      ▼
                               ┌──────────────┐
                               │ Cosine       │
                               │ Similarity   │
                               │ Comparison   │
                               └──────┬───────┘
                                      │
                                      ▼
                            ┌─────────────────┐
                            │ Score >= 80% ?  │
                            └──┬───────────┬──┘
                           Yes │           │ No
                               │           │
                               ▼           ▼
                      ┌────────────┐ ┌────────────┐
                      │  VERIFIED  │ │  MISMATCH  │
                      │  (Green)   │ │  (Red)     │
                      │            │ │            │
                      │ Proceed    │ │ Failure    │
                      │ with       │ │ Count += 1 │
                      │ Service    │ │            │
                      └────────────┘ │ If count   │
                                     │ % 3 == 0:  │
                                     │ Create     │
                                     │ Fraud Alert│
                                     └────────────┘
```

---

## 7. FEEDBACK & SENTIMENT ANALYSIS FLOWCHART

```
                    ┌──────────────┐
                    │ Service      │
                    │ Completed    │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ User Opens   │
                    │ "Feedback"   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Select Shop  │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Give Star    │
                    │ Rating (1-5) │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Write Text   │
                    │ Feedback     │
                    │ (Optional)   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Submit       │
                    └──────┬───────┘
                           │
                           ▼
                  ┌─────────────────────┐
                  │ Has Text Feedback?  │
                  └───┬─────────────┬───┘
                  No  │             │ Yes
                      │             │
                      │             ▼
                      │     ┌──────────────┐
                      │     │ Send to ML   │
                      │     │ Sentiment    │
                      │     │ Analyzer     │
                      │     └──────┬───────┘
                      │            │
                      │            ▼
                      │     ┌──────────────┐
                      │     │ Keyword      │
                      │     │ Matching     │
                      │     │ (Hindi +     │
                      │     │  English)    │
                      │     └──────┬───────┘
                      │            │
                      │            ▼
                      │     ┌──────────────┐
                      │     │ Result:      │
                      │     │ - Sentiment  │
                      │     │   (pos/neg/  │
                      │     │    neutral)  │
                      │     │ - Score      │
                      │     │   (-1 to +1) │
                      │     │ - Topics     │
                      │     └──────┬───────┘
                      │            │
                      └──────┬─────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ Save to DB   │
                      │ + Update     │
                      │ Shop Rating  │
                      └──────┬───────┘
                             │
                             ▼
                      ┌──────────────┐
                      │ "Thank you   │
                      │  for your    │
                      │  feedback!"  │
                      └──────────────┘
```

---

## 8. STOCK FORECASTING FLOWCHART

```
                    ┌──────────────┐
                    │ Shop Owner   │
                    │ Opens Stock  │
                    │ Forecast     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Fetch All    │
                    │ Inventory    │
                    │ Items        │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────────────────┐
                    │  For Each Item:           │
                    │                           │
                    │  1. Get stock history     │
                    │     (last 30 days)        │
                    │                           │
                    │  2. Calculate avg daily   │
                    │     consumption           │
                    │                           │
                    │  3. Detect trend          │
                    │     (increasing /         │
                    │      decreasing /         │
                    │      stable)              │
                    │                           │
                    │  4. Predict depletion     │
                    │     date = stock / avg    │
                    │                           │
                    │  5. Set urgency:          │
                    │     <= 3 days: CRITICAL   │
                    │     <= 7 days: HIGH       │
                    │     <= 14 days: MEDIUM    │
                    │     > 14 days: LOW        │
                    │                           │
                    │  6. Recommend reorder     │
                    │     qty = avg * 14 days   │
                    └──────────────┬────────────┘
                                   │
                                   ▼
                            ┌──────────────┐
                            │ Display:     │
                            │              │
                            │ - Item cards │
                            │ - Urgency    │
                            │   badges     │
                            │ - Progress   │
                            │   bars       │
                            │ - Reorder    │
                            │   dates      │
                            └──────────────┘
```

---

## 9. DATA FLOW DIAGRAM (Level 0 — Context)

```
    ┌──────────┐                                      ┌──────────┐
    │          │   Book Slot, View Queue               │          │
    │Cardholder├─────────────────────────────────────►│          │
    │          │◄─────────────────────────────────────┤          │
    │          │   Ticket, Notifications, Queue Pos    │          │
    └──────────┘                                      │          │
                                                      │          │
    ┌──────────┐                                      │          │
    │          │   Manage Queue, Update Stock          │ RATION  │
    │  Shop    ├─────────────────────────────────────►│  MITRA  │
    │  Owner   │◄─────────────────────────────────────┤ SYSTEM  │
    │          │   Forecasts, Feedback, Alerts         │          │
    └──────────┘                                      │          │
                                                      │          │
    ┌──────────┐                                      │          │
    │          │   View Reports, Manage Users          │          │
    │  Admin   ├─────────────────────────────────────►│          │
    │          │◄─────────────────────────────────────┤          │
    │          │   KPIs, Fraud Alerts, Audit Logs      │          │
    └──────────┘                                      └──────────┘
```

---

## 10. DATA FLOW DIAGRAM (Level 1 — Detailed)

```
                         ┌─────────────────────┐
    Cardholder ─────────►│ 1.0 Authentication  │
                         │    & Registration    │
                         └─────────┬───────────┘
                                   │ User Token
                                   ▼
                         ┌─────────────────────┐
    Cardholder ─────────►│ 2.0 Queue           │──────► Notification
    (date,shop,slot)     │    Management        │        to User
                         └─────────┬───────────┘
                                   │ Queue Data
                                   ▼
                         ┌─────────────────────┐
    Shop Owner ─────────►│ 3.0 Face            │──────► Fraud Alert
    (live image)         │    Verification      │        (on failure)
                         └─────────────────────┘

                         ┌─────────────────────┐
    Shop Owner ─────────►│ 4.0 Inventory       │──────► Low Stock
    (stock in/out)       │    Management        │        Alert
                         └─────────┬───────────┘
                                   │ Stock Data
                                   ▼
                         ┌─────────────────────┐
    ML Service ◄────────►│ 5.0 Prediction &    │──────► Forecasts
                         │    Analysis Engine   │        to Shop Owner
                         └─────────────────────┘

                         ┌─────────────────────┐
    Cardholder ─────────►│ 6.0 Feedback        │──────► Sentiment
    (rating, text)       │    System            │        to Admin
                         └─────────────────────┘

                         ┌─────────────────────┐
    Admin ──────────────►│ 7.0 Analytics &     │──────► Reports
                         │    Dashboard         │
                         └─────────────────────┘

                              ┌──────────┐
        All Processes ◄──────►│ MongoDB  │
                              │ Database │
                              └──────────┘
```

---

## 11. ER DIAGRAM (Entity Relationship)

```
    ┌──────────┐         ┌──────────┐         ┌──────────┐
    │   USER   │         │   SHOP   │         │  QUEUE   │
    ├──────────┤         ├──────────┤         ├──────────┤
    │ _id (PK) │    owns │ _id (PK) │   has   │ _id (PK) │
    │ name     │◄────────┤ name     ├────────►│ shopId   │
    │ email    │         │ code     │         │ date     │
    │ phone    │         │ address  │         │ slot     │
    │ password │         │ owner    │         │ entries[]│
    │ role     │         │ hours    │         └──────────┘
    │ shopId   │         │ capacity │
    └────┬─────┘         │ rating   │
         │               └────┬─────┘
         │                    │
         │ has                │ has
         │                    │
    ┌────▼─────┐         ┌────▼─────┐
    │ FACEDATA │         │INVENTORY │
    ├──────────┤         ├──────────┤
    │ _id (PK) │         │ _id (PK) │
    │ userId   │         │ shopId   │
    │ embedding│         │ itemName │
    │ (encrypted)        │ stock    │
    └──────────┘         │ history[]│
                         └──────────┘
         │
         │ gives              │ receives
         │                    │
    ┌────▼─────┐         ┌────▼──────┐
    │ FEEDBACK │         │NOTIFICATION│
    ├──────────┤         ├───────────┤
    │ _id (PK) │         │ _id (PK)  │
    │ userId   │         │ userId    │
    │ shopId   │         │ type      │
    │ rating   │         │ channel   │
    │ text     │         │ message   │
    │ sentiment│         │ status    │
    └──────────┘         └───────────┘

    ┌──────────┐         ┌──────────┐
    │FRAUDALERT│         │ AUDITLOG │
    ├──────────┤         ├──────────┤
    │ _id (PK) │         │ _id (PK) │
    │ userId   │         │ userId   │
    │ alertType│         │ action   │
    │ severity │         │ resource │
    │ status   │         │ ipAddress│
    └──────────┘         └──────────┘
```

---

## HOW TO USE THESE DIAGRAMS

These diagrams are designed to be **hand-drawn or recreated** in any tool:

**Option 1 — Hand Draw:**
Use these as reference. Copy onto A4 paper with pencil and ruler. Use colored pens for different components (blue for frontend, green for backend, orange for ML, red for database).

**Option 2 — Draw.io (free):**
Go to https://app.diagrams.net and recreate using drag-and-drop shapes. Export as PNG/PDF.

**Option 3 — PowerPoint/Google Slides:**
Use basic shapes (rectangles, arrows, diamonds) to recreate. Good for presentations.

**Option 4 — Canva:**
Use flowchart templates. Paste text labels from above.

---

*Tip: When presenting, explain each diagram verbally. Teachers value understanding over polish.*
