# Work Process Tracker: Full-Stack Mission Control

The **Work Process Tracker** is an enterprise-grade task management system designed to handle complex workflows, dependencies, and team capacity. Built with high-premium aesthetics and robust operational logic.

## 🚀 Key Features

### 🛡️ Administrative Command Center
- **Dynamic Task Initiation**: Admins can define operational units with custom priorities, skill sectors, and assigned personnel.
- **Neural Link System (Real-time Flow)**:
  - **Visualization**: Interactive **React Flow** graph shows real-time unit inter-dependencies and lock states.
  - **Dependency Types**: Supports **Full** (100% completion) and **Partial** (custom percentage threshold) links.
  - **Integrity Check**: Rejects any link that creates a **Circular Dependency** using a BFS/DFS graph algorithm.
- **Personnel Overload Monitoring**: Real-time capacity indicators warn admins if an agent is overloaded (e.g., >5 active units).

### 👥 Personnel Workspace (Member View)
- **Active Deployment Grid**: Members view only relevant assignments with intuitive progress sliders (0-100%).
- **Impediment Reporting**: Instant "Blocked" flag with mandatory justification, immediately notifying the dashboard.
- **Operational Pulse**: Successor alerts notify members when a predecessor has met its threshold, unblocking their next task.

---

## 🛠️ Technical Stack

- **Frontend**: React (Vite), Tailwind CSS v4, Framer Motion, Lucide Icons.
- **Visualization**: React Flow (Interactive DAG visualization).
- **Backend**: Node.js, Express.
- **Database**: **Firebase Realtime Database** (Live JSON Cloud Tree).
- **Security**: JWT-based Authentication & Bcrypt password hashing.

---

## 📦 Project Structure

```text
/
├── frontend/               # React Project (Tailwind, React Flow)
│   ├── src/components/     # Shared UI (Modals, Protected Routes)
│   ├── src/contexts/       # Auth and State
│   └── src/pages/          # Dashboard, Flow, and User Views
└── backend/                # Express Server
    ├── config/             # Firebase Admin initialization
    ├── controllers/        # Realtime DB logic & Dependency Cascade
    ├── middleware/         # Auth and Admin role enforcement
    └── routes/             # RESTful API endpoints
```

---

## ⚡ Setup & Operational Instructions

### 1. Backend Configuration
- Ensure you have a `backend/serviceAccountKey.json` with your Firebase Admin credentials.
- Set up the environment in `backend/.env`:
  ```env
  PORT=5000
  JWT_SECRET=your_secret_key
  NODE_ENV=development
  ```
- Install and run:
  ```bash
  cd backend
  npm install
  npm start
  ```

### 2. Frontend Configuration
- Install and run:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 3. Initialization Session
The system is pre-seeded with a default Admin account for immediate access:
- **URL**: `http://localhost:5173`
- **Username**: `admin`
- **Password**: `admin123`

---

## 🧩 Dependency Handling Logic
The core "Cascade Engine" in the backend automatically re-evaluates all downstream units whenever a progress shift occurs. 
- **The Graph**: Dependencies are stored as directed edges. 
- **The Cascade**: If task A is a predecessor of task B with a 50% threshold:
  - If A.progress < 50% ➡️ B is `Blocked`.
  - If A.progress >= 50% ➡️ B evaluates other predecessors. If all are clear ➡️ B becomes `In-Progress`.
- **Circular Check**: Before establishing Task A ➡️ Task B, the engine scans all parent nodes of A to ensure B is not already an ancestor. 
