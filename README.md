# Practical 7: Authentication and Middleware Pipeline

**Course:** Advanced Web Development Frameworks (ITUE301)  
**Program:** B.Tech (IT / CE / CSE / AIML) — CHAROTAR UNIVERSITY OF SCIENCE AND TECHNOLOGY (CHARUSAT)  
**Author:** 24IT037  

---

## 📌 Objectives
1. Implement secure, stateless **JWT (JSON Web Token)** authentication for user registration and login.
2. Hash user passwords using **`bcryptjs` (salt rounds: 10)** before saving to MongoDB.
3. Build a modular **Express Middleware Pipeline** consisting of:
   - **`authMiddleware`**: Validates the `Authorization: Bearer <token>` header, verifies signature and expiry, and binds `req.user`.
   - **`validationMiddleware`**: Enforces strict server-side schema and input validation to reject malformed requests before touching the database.
4. Protect all task routes so users only access and modify their own tasks (**User-Scoped CRUD**).
5. Implement supplementary endpoints (`/auth/me`) and client-side **401 Unauthorized** automatic session expiry handling.

---

## 🏗️ Architecture & Middleware Pipeline

```text
                                  CLIENT REQUEST
                                        │
                                        ▼
                   ┌─────────────────────────────────────────┐
                   │           Express Application           │
                   │        (CORS, JSON Parser, Logs)        │
                   └────────────────────┬────────────────────┘
                                        │
           ┌────────────────────────────┴────────────────────────────┐
           ▼                                                         ▼
    [Public Routes]                                           [Protected Routes]
 POST /auth/register                                           GET /auth/me
 POST /auth/login                                              GET /tasks, POST /tasks...
           │                                                         │
           ▼                                                         ▼
┌─────────────────────────┐                               ┌─────────────────────────┐
│   validationMiddleware  │                               │     authMiddleware      │
│ (Checks name, email, pw)│                               │ (Verifies Bearer Token, │
└──────────┬──────────────┘                               │  checks expiry, sets    │
           │                                              │  req.user = decoded)    │
           ▼                                              └────────────┬────────────┘
┌─────────────────────────┐                                            │
│   Controller & Model    │                                            ▼
│  (bcrypt.hash / compare │                               ┌─────────────────────────┐
│   jwt.sign token)       │                               │   validationMiddleware  │
└──────────┬──────────────┘                               │ (Validates task title & │
           │                                              │  priority before DB)    │
           ▼                                              └────────────┬────────────┘
┌─────────────────────────┐                                            │
│    MongoDB (taskdb)     │                                            ▼
│ └── users collection    │                               ┌─────────────────────────┐
└─────────────────────────┘                               │    Task Controller      │
                                                          │   (Scoped to req.user)  │
                                                          └────────────┬────────────┘
                                                                       │
                                                                       ▼
                                                          ┌─────────────────────────┐
                                                          │    MongoDB (taskdb)     │
                                                          │ └── tasks collection    │
                                                          └─────────────────────────┘
```

---

## 🚀 Step-by-Step Execution Guide (In VS Code)

### Step 1: Open Terminal in Practical 7 Folder
```bash
cd "d:\Advanced Web\practical 7"
```

---

### Step 2: Start the Backend Server (Terminal 1)
```powershell
cd backend
npm install
npm run dev
```

> **Expected Output:**
> ```
> [nodemon] starting `node server.js`
> ✅ MongoDB connected successfully to: mongodb://127.0.0.1:27017/taskdb_practical7
> 🚀 Practical 7 Express API running on http://localhost:5000
> 🔐 JWT Secret active with 1-hour token expiration.
> ```

---

### Step 3: Start the Frontend Application (Terminal 2)
Open a second terminal (`Ctrl + Shift + 5`) and run:

```powershell
cd frontend
npm install
npm run dev
```

> **Expected Output:**
> ```
>   VITE v8.x.x  ready in xxx ms
> 
>   ➜  Local:   http://localhost:5173/
> ```

---

### Step 4: Open in Web Browser
Visit **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 🧪 Postman Testing Suite & cURL Reference

### 1. Register a New User (`POST /auth/register`)
* **URL:** `http://localhost:5000/auth/register`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body:**
  ```json
  {
    "name": "Riya Kalariya",
    "email": "student@charusat.edu.in",
    "password": "Charusat@123"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "66c84b1234567890abcdef01",
      "name": "Riya Kalariya",
      "email": "student@charusat.edu.in"
    }
  }
  ```

---

### 2. Login User (`POST /auth/login`)
* **URL:** `http://localhost:5000/auth/login`
* **Method:** `POST`
* **Body:**
  ```json
  {
    "email": "student@charusat.edu.in",
    "password": "Charusat@123"
  }
  ```
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Authentication successful. Logged in.",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": { ... }
  }
  ```

---

### 3. Get Current Logged-in User Profile (`GET /auth/me`) *(Supplementary Problem)*
* **URL:** `http://localhost:5000/auth/me`
* **Method:** `GET`
* **Headers:**
  * `Authorization`: `Bearer <COPIED_JWT_TOKEN>`
* **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "id": "66c84b1234567890abcdef01",
      "name": "Riya Kalariya",
      "email": "student@charusat.edu.in"
    }
  }
  ```

---

### 4. Access Protected Route Without Token (401 Unauthorized Test)
* **URL:** `http://localhost:5000/tasks`
* **Method:** `GET`
* **Headers:** *(No Authorization header)*
* **Response (401 Unauthorized):**
  ```json
  {
    "success": false,
    "error": "Unauthorized",
    "message": "Access denied. No authorization header provided."
  }
  ```

---

### 5. Create Task for Authenticated User (`POST /tasks`)
* **URL:** `http://localhost:5000/tasks`
* **Method:** `POST`
* **Headers:**
  * `Authorization`: `Bearer <COPIED_JWT_TOKEN>`
  * `Content-Type`: `application/json`
* **Body:**
  ```json
  {
    "title": "Complete Practical 7 Submission",
    "description": "JWT Auth & Middleware pipeline with input validation",
    "priority": "high"
  }
  ```
* **Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Task created and secured with JWT ownership.",
    "data": {
      "_id": "66c84c7890abcdef12345678",
      "user": "66c84b1234567890abcdef01",
      "title": "Complete Practical 7 Submission",
      "description": "JWT Auth & Middleware pipeline with input validation",
      "completed": false,
      "priority": "high",
      "createdAt": "2026-08-23T09:10:00.000Z"
    }
  }
  ```

---

## 📸 Screenshots Checklist for Practical File Submission

| # | Screenshot | What to Capture |
|---|---|---|
| **1** | **Backend Server Running** | Terminal 1 showing `MongoDB connected` & `Practical 7 Express API running on http://localhost:5000` |
| **2** | **Frontend Vite Server** | Terminal 2 showing `Local: http://localhost:5173/` |
| **3** | **Registration Form in UI** | User entering name, email, and password in the tabbed register card |
| **4** | **Login View & Demo Button** | Sign-In screen with password toggle and security badges |
| **5** | **Authenticated Dashboard** | Top navbar displaying logged in user name (`Riya Kalariya`), email, and **Logout** button |
| **6** | **User-Scoped Task Creation** | Adding a new task associated with the logged-in user's JWT |
| **7** | **Postman 401 Unauthorized Test** | Requesting `GET /tasks` without token returning `401 Unauthorized` |
| **8** | **Postman Register & Login Token** | Successful token generation returned in Postman response |
| **9** | **Postman GET /auth/me** | Request to `/auth/me` with `Bearer <token>` returning user details |
| **10**| **MongoDB Compass (Users & Tasks)** | `taskdb_practical7` database showing hashed password (`$2a$10$...`) in `users` and user ObjectID ref in `tasks` |

---

## ❓ Practical 7 Viva Questions & Detailed Answers

### Q1: Why must passwords be hashed before storage instead of saved as plain text, even in a lab/demo project?
**Answer:**  
1. **Confidentiality & Breach Protection:** If a database is dumped, leaked, or accessed by unauthorized administrators, plain-text passwords expose users immediately.
2. **Credential Reuse:** Users frequently reuse the same password across multiple online accounts (email, banking). Storing plain text risks compromising their external accounts.
3. **Irreversibility:** One-way hashing (via **`bcrypt`**) transforms passwords into mathematical digests that cannot be decrypted back into plain text.
4. **Defense Against Rainbow Tables:** `bcrypt` generates unique automatic **salts** for every password, ensuring that identical passwords result in completely different hashes.
5. **Slow By Design:** `bcrypt` incorporates key-stretching work factors (10 rounds) to drastically increase the computational cost of brute-force and dictionary attacks.

---

### Q2: What does the authentication middleware actually verify, and what happens if the token is missing or expired?
**Answer:**  
`authMiddleware` performs three sequential checks:
1. **Header Presence & Format:** Checks that `req.headers.authorization` exists and follows the `Bearer <token>` convention. If missing or malformed, it rejects the request with **401 Unauthorized**.
2. **Cryptographic Signature Verification:** Uses `jwt.verify(token, process.env.JWT_SECRET)` to verify that the token was signed using the server's private secret and has not been tampered with.
3. **Payload Expiration Check:** Verifies the embedded `exp` timestamp.
   - If the token has **expired** (`TokenExpiredError`), the middleware returns `401 Unauthorized` with `{ error: 'TokenExpired', message: 'Session has expired. Please log in again.' }`.
   - If verification succeeds, it binds the decoded user ID and email to `req.user` and calls `next()` to pass control to the task controller.

---

### Q3: Why should input validation happen on the server even if the frontend already validates the same fields?
**Answer:**  
1. **Frontend Can Be Easily Bypassed:** Any client can bypass browser validation using Postman, cURL, terminal scripts, or developer console manipulations.
2. **Single Source of Truth:** Server-side validation (`validationMiddleware`) serves as the definitive security perimeter protecting the database from corrupted, malicious, or malformed data.
3. **Fail-Fast Efficiency:** Rejecting requests at the middleware layer prevents unnecessary MongoDB database queries and memory allocation.
4. **Security Hardening:** Server validation sanitizes strings and enforces constraints (e.g., minimum password lengths, enum restrictions), preventing injection attacks.

---

### Q4: What is the difference between `bcrypt` and plain SHA-256 for password security?
**Answer:**  
- **SHA-256** is designed to be extremely fast for file integrity and checksums. GPUs can compute billions of SHA-256 hashes per second, making brute-forcing trivial.
- **bcrypt** is an adaptive, intentionally slow cryptographic hash algorithm with configurable work factors (salt rounds) and built-in salts, specifically engineered to withstand hardware-accelerated dictionary attacks.
