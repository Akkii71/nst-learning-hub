# NST Learning Hub — Mobile Application & Backend

A syllabus-specific, community-powered learning platform designed for NST students to discover, share, review, and rate reliable academic resources.

---

## 📱 Features

- **Syllabus-Based Discovery**: Browse learning materials organized by academic subjects (Mathematics, Computer Science, Physics, Chemistry, English, Electronics) and their syllabus topics.
- **Multi-Format Resources**: Notes, YouTube educational videos, and external tutorial guides.
- **Top Video Lectures**: Automatically ranks top 3 eligible video lectures per topic based on student ratings.
- **Student Authentication**: Secure registration and login using JWT and password hashing with bcrypt (strictly role-enforced).
- **Resource Submissions**: Students can submit learning resources with subject, topic, and type categorization.
- **Reviewer Portal & Moderation**: Authorized reviewers can view pending submissions, approve them for public discovery, or reject them with feedback notes.
- **Interactive Ratings & Feedback**: Real-time database-backed 1–5 star ratings (with upsert handling) and community comment threads.
- **Expo Go Compatibility**: Configured for local simulator/emulator and physical device testing via Expo Go QR code scanning.

---

## 🛠️ Technology Stack

- **Mobile Frontend**: React Native, Expo SDK 53, React Navigation (Tabs & Stacks), AsyncStorage, Ionicons
- **Backend API**: Node.js, Express.js, RESTful architecture, JWT authentication, bcryptjs
- **Database & ORM**: PostgreSQL, Prisma ORM 6.x

---

## 📂 Project Structure

```text
nst-learning-hub/
├── mobile/                      # React Native Expo Mobile App
│   ├── App.js                   # Application entry with AuthProvider
│   ├── app.json                 # Expo configuration
│   ├── package.json
│   ├── .env.example             # Template for EXPO_PUBLIC_API_URL
│   └── src/
│       ├── context/             # React AuthContext (JWT, user state, login, register, logout)
│       ├── navigation/          # BottomTabNavigator with nested Stacks
│       ├── services/            # api.js — Centralized backend communication
│       ├── screens/
│       │   ├── HomeScreen.js              # Live search, subjects, popular & recent resources
│       │   ├── ExploreScreen.js           # Subject & topic filters, top video lecture rankings
│       │   ├── ResourceDetailsScreen.js   # Resource view, link launcher, rating & reviews
│       │   ├── SubmitScreen.js            # Student resource submission form
│       │   ├── ProfileScreen.js           # Student/Reviewer account, submission tracking
│       │   ├── AuthScreen.js              # Sign in & Student registration (with demo logins)
│       │   └── ReviewerDashboardScreen.js # Reviewer moderation portal (Approve/Reject)
│       ├── components/          # Reusable UI cards, search bar, rating stars
│       └── styles/              # Global colors & branding
└── server/                      # Express REST API & Database
    ├── server.js                # Server entry point (listens on 0.0.0.0:5001)
    ├── package.json
    ├── .env.example             # Database URL and JWT Secret template
    ├── prisma/
    │   ├── schema.prisma        # Database models (User, Subject, Topic, Resource, Submission, Review, Rating, Feedback)
    │   └── seed.js              # Database seed script for subjects, topics, and initial users
    └── src/
        ├── middleware/          # JWT auth middleware and Reviewer role guard
        ├── routes/              # Modular routes (auth, subjects, topics, resources, submissions)
        └── prisma.js            # Prisma Client singleton
```

---

## 🚀 Setup & Execution Guide

### 1. Backend & Database Setup

1. **Configure Environment Variables**:
   ```bash
   cd server
   cp .env.example .env
   ```
   Ensure your PostgreSQL connection string in `.env` is correct:
   ```env
   PORT=5001
   DATABASE_URL="postgresql://username:password@localhost:5432/nst_learning_hub?schema=public"
   JWT_SECRET="nst-learning-hub-jwt-secret-key-college-project"
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Initialize Database & Seed Data**:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

4. **Start the Express API Server**:
   ```bash
   npm start
   ```
   The server will bind to `0.0.0.0:5001` so it is accessible both locally and over the Wi-Fi network.

---

### 2. Mobile App Setup (Expo Go)

1. **Install Dependencies**:
   ```bash
   cd ../mobile
   npm install
   ```

2. **Configure API Base URL for Physical Devices**:
   - If running on **iOS Simulator**: It automatically connects to `http://localhost:5001/api`.
   - If running on **Android Emulator**: It automatically connects to `http://10.0.2.2:5001/api`.
   - If running on a **Physical Phone via Expo Go**:
     Create `mobile/.env` from `.env.example`:
     ```env
     EXPO_PUBLIC_API_URL=http://<YOUR_COMPUTER_LOCAL_IP>:5001/api
     ```
     *(Example: `http://10.7.21.130:5001/api`)*. Ensure your phone and computer are connected to the same Wi-Fi network.

3. **Start Expo Dev Server**:
   ```bash
   npm start
   ```
   - Press **`s`** to switch between LAN and Local mode.
   - Open the **Expo Go** application on your iOS or Android device.
   - Scan the QR code displayed in the terminal.

---

## 🔑 Demo Accounts

Use these pre-seeded accounts or register a new student account:

| Role | Email | Password | Features Accessible |
|---|---|---|---|
| **Student** | `student@nst.edu` | `password123` | Discover resources, submit links, rate 1–5 stars, post reviews, track submission status |
| **Reviewer** | `reviewer@nst.edu` | `password123` | Access Reviewer Portal, review pending submissions, approve or reject with feedback |

*Note: New registrations are strictly created with the `STUDENT` role. Reviewer permissions are restricted to faculty/admin accounts.*

---

## 📡 API Endpoints Overview

- **Auth**: `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- **Subjects**: `GET /api/subjects`, `GET /api/subjects/:id`
- **Topics**: `GET /api/topics/:subjectId`
- **Resources**: `GET /api/resources`, `GET /api/resources/:id`, `GET /api/resources/top-videos`
- **Ratings & Feedback**: `POST /api/resources/:id/rate`, `POST /api/resources/:id/feedback`
- **Submissions & Moderation**: `POST /api/submissions`, `GET /api/submissions/my`, `GET /api/submissions/pending`, `PUT /api/submissions/:id/approve`, `PUT /api/submissions/:id/reject`
