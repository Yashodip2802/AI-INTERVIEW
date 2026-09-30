# Interview AI 🎯

[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)](https://ai.google.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![GSAP](https://img.shields.io/badge/GSAP-3.x-88CE02?style=for-the-badge&logo=greensock)](https://greensock.com/gsap/)

> **Next-generation AI-powered interview preparation platform.** Transform any target job description and your resume into a personalized interview strategy complete with match scores, skill gap breakdowns, behavioral & technical question banks, and actionable day-by-day roadmaps.

---

## ✨ Features

- 📄 **Multi-Format Resume Ingestion**: Upload resumes in **PDF** or **DOCX** formats (up to 5 MB) with drag-and-drop validation and interactive file controls.
- ⚡ **AI Fit & Alignment Scoring**: Computes a detailed profile-to-role match score rendered via an animated circular SVG gauge and dynamic counter.
- 🎯 **Tailored Question Bank**:
  - **Technical Questions**: In-depth questions with behind-the-scenes interviewer intentions and structured model answers.
  - **Behavioral Questions**: Real-world situational scenarios with recommended STAR-method responses.
- 🔍 **Severity-Graded Skill Gap Analysis**: Categorizes skill proficiencies into `High`, `Medium`, and `Low` priority gaps to focus preparation.
- 📅 **Day-by-Day Preparation Roadmap**: Step-by-step preparation timeline featuring specific daily objectives and actionable tasks.
- 📥 **Tailored Resume PDF Generator**: Generates and downloads tailored, ATS-friendly resume PDFs powered by headless Chromium.
- 💎 **Modern Executive UI**:
  - Non-blocking in-place progress and skeleton loading states (no jarring full-page loaders).
  - Smooth GSAP micro-animations (page transitions, accordion expansions, score gauge animations).
  - Dark obsidian/indigo aesthetic with zero garish neons.
- 🛡️ **Zero-Friction Database Setup**: Embedded in-memory MongoDB server with automatic persistence fallback, or seamless connection to MongoDB Atlas.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: React 19 + Vite
- **Routing**: React Router v7
- **Styling**: SCSS with glassmorphic cards and dark executive palette
- **Animations**: GSAP (GreenSock Animation Platform)
- **HTTP Client**: Axios with credential management

### **Backend**
- **Runtime**: Node.js (ES Modules) + Express 5
- **Database**: MongoDB with Mongoose ODM (includes embedded `mongodb-memory-server` fallback)
- **AI Engine**: Google Gemini API (`@google/genai` / `gemini-3-flash-preview`)
- **Document Processing**:
  - `pdf-parse` v2 (PDF parsing)
  - `mammoth` (DOCX parsing)
  - `multer` (multipart upload handling with 5 MB limits)
- **PDF Generation**: Puppeteer (configured for native system Chrome)
- **Authentication**: JWT (JSON Web Tokens) with HTTP-only cookies + bcryptjs password hashing

---

## 🚀 Quick Start Guide

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or higher recommended)
- [npm](https://www.npmjs.com/) (bundled with Node.js)
- A [Google Gemini API Key](https://aistudio.google.com/)

---

### 1. Clone the Repository

```bash
git clone https://github.com/Yashodip2802/AI-INTERVIEW.git
cd AI-INTERVIEW
```

---

### 2. Configure Environment Variables

#### Backend Configuration
Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your_jwt_secret_key_here

# Optional: Provide your MongoDB Atlas URI. If left blank, an embedded in-memory MongoDB will be used automatically.
# MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/interview-ai

# Required: Google Gemini API Key
GOOGLE_GENAI_API_KEY=your_gemini_api_key_here
```

#### Frontend Configuration
Create a `.env` file in the `frontend/` directory:

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

---

### 3. Install Dependencies

Install dependencies for both backend and frontend:

```bash
# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

---

### 4. Run the Application

Open two terminal windows:

**Terminal 1 (Backend Server):**
```bash
cd backend
npm run dev
# Running on http://localhost:5000
```

**Terminal 2 (Frontend Dev Server):**
```bash
cd frontend
npm run dev
# Running on http://localhost:5173
```

Open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 📡 API Reference

### Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user account |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue session cookie |
| `GET` | `/api/auth/logout` | Public | Blacklist token & clear session cookie |
| `GET` | `/api/auth/get-me` | Private | Retrieve authenticated user profile |

### Interview Endpoints (`/api/interview`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/interview/` | Private | Generate new interview report (multipart/form-data) |
| `GET` | `/api/interview/` | Private | Retrieve all interview reports for current user |
| `GET` | `/api/interview/report/:interviewId` | Private | Retrieve specific interview report by ID |
| `POST` | `/api/interview/resume/pdf/:interviewReportId` | Private | Generate and download tailored resume PDF |

---

## 📂 Project Structure

```
AI-INTERVIEW/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Mongoose & in-memory MongoDB connection
│   │   ├── controllers/
│   │   │   ├── auth.controller.js   # User registration, login, session
│   │   │   └── interview.controller.js # Report generation & document parsing
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.js   # JWT authentication verification
│   │   │   └── file.middleware.js   # Multer file validation (PDF/DOCX, 5MB)
│   │   ├── models/
│   │   │   ├── blacklist.model.js   # Token blacklist schema
│   │   │   ├── interviewRepoert.model.js # Interview report & question schema
│   │   │   └── user.model.js        # User credentials schema
│   │   ├── routes/
│   │   │   ├── auth.routes.js       # Auth endpoint routes
│   │   │   └── interview.routes.js  # Interview endpoint routes
│   │   ├── services/
│   │   │   └── ai.service.js        # Google Gemini AI prompts & Puppeteer PDF
│   │   └── app.js                   # Express application setup & CORS
│   ├── server.js                    # Server bootstrap
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/                # Login, Register, AuthContext & Services
│   │   │   └── interview/           # Home, Interview Report, Context & Styles
│   │   ├── styles/                  # Global styles, variables & mixins
│   │   ├── App.jsx                  # Main router provider
│   │   ├── app.route.jsx            # Application route definitions
│   │   └── main.jsx                 # Client entry point
│   ├── index.html
│   ├── .env.example
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to check the [issues page](https://github.com/Yashodip2802/AI-INTERVIEW/issues).

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the **ISC License**. See `LICENSE` for more information.
