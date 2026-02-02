# FormCheck - AI Fitness Coach

**FormCheck** is a real-time computer vision application that analyzes exercise form using a hybrid Client-Server architecture. It uses a lightweight React frontend for capture and rendering, and a high-performance Python FastAPI backend for MediaPipe inference.

![Status](https://img.shields.io/badge/Status-Prototype-emerald)
![Stack](https://img.shields.io/badge/Stack-React_FastAPI_MediaPipe-blue)

## 🚀 Features

- **Real-Time Analysis**: < 100ms latency inference loop.
- **Geometric Logic**: Calculates joint angles to verify Range of Motion (ROM).
- **Rep Counting**: State-machine based repetition tracking (Eccentric/Concentric phases).
- **Tactical UI**: "Glassmorphic" dark mode interface with live HUD overlay.
- **Privacy**: Video frames are processed in-memory and never stored.

## 🛠️ Tech Stack

### Client (Frontend)

- **Framework**: React (Vite) + TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Sockets**: `react-use-websocket`
- **Capture**: `react-webcam`

### Server (Backend)

- **Framework**: FastAPI (Python 3.10+)
- **Inference**: MediaPipe Pose
- **Math**: NumPy
- **Server**: Uvicorn (WebSockets)

## 📦 Installation & Run

### Prerequisites

- Node.js 18+
- Python 3.10+

### 1. Backend Setup

```bash
cd server
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/Mac
# source venv/bin/activate

pip install -r requirements.txt
python run.py
```

_Server runs on `ws://localhost:8000`_

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```

_Client runs on `http://localhost:5173`_

## 🏗️ Architecture

1.  **Ingestion**: Client captures webcam frame (480p @ 12fps).
2.  **Transport**: Frame sent as JPEG/Base64 via WebSocket to Backend.
3.  **Inference**: Python/MediaPipe extracts 33 skeletal landmarks.
4.  **Logic**: `RepCounter` class calculates angles (e.g., Elbow) to determine state.
5.  **Feedback**: Server returns `Landmarks + Rep Count + Feedback`.
6.  **Render**: Client draws wireframe overlay on canvas atop video.

## 🤝 Contributing

Project designed as a technical showcase. Pull requests welcome.

### Commit Message Format

We follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, no logic change)
- `refactor`: Code restructuring (no behavior change)
- `perf`: Performance improvement
- `test`: Adding/updating tests

**Examples:**

```
feat(exercises): add bicep curl detection
fix(database): resolve streak calculation timezone bug
docs(api): update WebSocket protocol specification
perf(pose): optimize landmark serialization (20% faster)
```
