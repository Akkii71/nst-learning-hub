# NST Learning Hub — Live Project Demonstration Guide

This guide is designed for **college examiners, evaluators, and project presentations**. Follow these sequential steps to demonstrate every core feature of **NST Learning Hub** within 5–7 minutes.

---

## 📋 Demonstration Checklist

| # | Feature to Demonstrate | Key Verification Point | Expected Result |
|---|---|---|---|
| **1** | Automated System Health | `npm test` in `server/` | **15/15 Automated Tests Pass** |
| **2** | Syllabus Discovery | Home screen & Explore chips | Seamless filtering by Subject & Topic |
| **3** | Top 3 Video Ranking | Explore topic selection | Top-rated video lectures highlighted |
| **4** | Resource Details & URL Launcher | Tap any Resource Card | Opens Khan Academy / NPTEL link |
| **5** | Student Authentication | Sign In / Register in Profile tab | JWT issuance, password hashing with bcrypt |
| **6** | Resource Submission | Submit tab | Duplicate prevention, validation, PENDING status |
| **7** | Reviewer Moderation Queue | Profile → Reviewer Portal | Reviewer approves or rejects with reason |
| **8** | Database Ratings & Feedback | Star rating & review thread | Real-time PostgreSQL upsert & average recalculation |
| **9** | Physical Phone via Expo Go | Terminal QR code scan | Live execution on Android/iOS via Expo Go |

---

## 🚀 Pre-Demo Quickstart (2 Terminals)

### Terminal 1: Backend Server
```bash
cd server
npm start
```
*Console verifies:*
```text
NST Learning Hub API is running:
- Local:            http://localhost:5001
- On Your Network:  http://10.7.21.130:5001 (use this IP for physical phones via Expo Go)
```

### Terminal 2: Mobile Application (Expo Go)
```bash
cd mobile
npm start
```
*Press `i` for iOS Simulator, `a` for Android Emulator, or scan the QR code with **Expo Go** on a physical phone.*

---

## 🎬 Step-by-Step Demonstration Script

### Step 1: Automated Verification Test (30 seconds)
Before running the UI, demonstrate code robustness and database integrity to examiners:
```bash
cd server
npm test
```
*Result: Runs 15 end-to-end tests covering Auth, Submissions, Reviewer security (403 for students), duplicate prevention, and ratings upsert.*

---

### Step 2: Student Discovery & Navigation (1 minute)
1. Open the mobile app on the **Home** tab:
   - Point out **Branding**, **Live Search Bar**, **Academic Subject Cards**, and **Popular Resources**.
   - Type *"Calculus"* in the search bar: observe live filtering across all syllabus topics.
2. Tap the **Mathematics** card on the Home screen:
   - Notice that the app transitions smoothly to the **Explore** tab with Mathematics pre-selected!
   - Highlight the **Syllabus Topics** chips (`Calculus`, `Linear Algebra`, `Probability & Statistics`).
   - Highlight the **Resource Type** filters (`All`, `Video`, `Notes`, `Tutorial`).

---

### Step 3: Top 3 Video Lecture Rankings (30 seconds)
1. In the **Explore** tab, select the topic **Calculus**:
   - Show the red badge: **🎬 Top 3 Video Lectures · Calculus**.
   - Explain to the examiner: The backend automatically ranks and filters eligible video lectures based on student rating averages and review counts.

---

### Step 4: Resource Details & External Link Launcher (30 seconds)
1. Tap on **Introduction to Calculus — Khan Academy**:
   - Shows the resource badge, subject, topic, author, and description.
   - Tap **🔗 Open Learning Resource**: Launches the verified YouTube / MIT OpenCourseWare link in the device's browser.

---

### Step 5: Interactive 1–5 Star Rating & Community Feedback (1 minute)
1. On the Resource Details screen:
   - If not signed in: Tap a star. The app prompts: *"Sign In Required: Please sign in to rate this resource."*
   - Sign in using the one-tap **Student Demo** button (`student@nst.edu` / `password123`).
   - Tap **5 Stars**: Rating updates immediately.
   - Tap **4 Stars**: Demonstrates the database **upsert** (updates existing rating in-place without duplicate record errors).
2. Scroll to **Student Feedback & Reviews**:
   - Type a tip: *"Limits explanation at 14:20 was super helpful for midterms."*
   - Tap **Post Review**: The comment instantly appears in the feedback list with the student's name and timestamp.

---

### Step 6: Student Resource Submission & Duplicate Prevention (1 minute)
1. Tap the **Submit** tab:
   - Try tapping **Submit Resource** with empty fields: Shows clear input validation alerts.
   - Fill in:
     - Title: *"Advanced Matrix Operations"*
     - URL: *"https://youtube.com/watch?v=matrix123"*
     - Subject: **Mathematics**
     - Topic: **Linear Algebra**
     - Type: **Video**
   - Tap **Submit Resource**: Success screen confirms the resource has been submitted and is **pending faculty review**.
2. **Duplicate Prevention Test**:
   - Tap **Submit Another Resource** and try submitting the exact same URL (`https://youtube.com/watch?v=matrix123`) under the same topic.
   - The backend rejects it with: *"This resource URL has already been submitted for this topic."*

---

### Step 7: Faculty Reviewer Moderation Portal (1 minute)
1. Go to the **Profile** tab and tap **Sign Out**.
2. Sign in using the one-tap **Reviewer Demo** button (`reviewer@nst.edu` / `password123`).
3. Notice the purple **Reviewer Management Portal** banner appearing exclusively for the `REVIEWER` role.
4. Tap **Reviewer Management Portal**:
   - Shows the pending queue with the student's submission (*"Advanced Matrix Operations"*).
   - Reviewer can verify the link, then tap **✓ Approve**.
   - The submission is removed from the pending queue.
5. Switch to the **Explore** tab:
   - Navigate to Mathematics → Linear Algebra: The newly approved resource is now publicly visible to all NST students!

---

### Step 8: Physical Device Testing with Expo Go
1. In `mobile/src/services/api.js`, verify `EXPO_PUBLIC_API_URL` or default LAN IP (`http://10.7.21.130:5001/api`).
2. Express is bound to `0.0.0.0:5001`, accepting cross-device connections on the local Wi-Fi.
3. Open **Expo Go** on an iPhone or Android phone, scan the QR code from `npm start`, and run the app live.
