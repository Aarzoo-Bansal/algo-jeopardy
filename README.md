# Algo Jeopardy

A customizable, multiplayer Jeopardy-style game platform. Create custom question sets on any topic, configure game sessions, and host interactive quiz games with teams.

Built as a full-stack application with a cyberpunk-themed UI featuring floating particles, gradient animations, and glassmorphism effects.

![Game Board](https://img.shields.io/badge/Status-Phase%201%20Complete-06b6d4?style=flat-square)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![SQLite](https://img.shields.io/badge/Database-SQLite-003B57?style=flat-square&logo=sqlite)

---

## Features

### Game Configuration
- Custom game title (host any topic — algorithms, movies, history, anything)
- Select/deselect categories with question count indicators
- Choose difficulty levels ($100–$500)
- Summary dashboard showing total slots before starting

### Team Management
- Add up to 12 teams with custom names
- 60 unique emoji avatars to choose from
- Auto-selects next available avatar

### Game Board
- Dynamic grid based on selected categories and difficulties
- Category-colored cells with hover glow effects
- Staggered entrance animation on board load
- Responsive horizontal scroll for many categories
- Auto-aligned category headers (CSS Grid)

### Question Flow
- Click a cell to open the question modal
- Circular SVG countdown timer with danger zone animation
- Flip card to reveal answer
- Pause, resume, and reset timer controls

### Spin Wheel
- SVG arc-based wheel with team segments
- Accurate landing detection
- Tracks which teams have already played this round
- Auto-resets round when all teams have played

### Scoring
- +/- buttons for each difficulty level per team
- Animated score pops on point changes
- Live rank medals (🥇🥈🥉)
- Winner/tie detection with confetti celebration

### Admin Panel (`/admin`)
- Full CRUD for categories (add, edit, delete)
- Full CRUD for questions (add, edit, delete)
- Inline editing with SAVE/CANCEL buttons
- Filter questions by category
- Collapsible question groups
- Alphabetical category sorting
- Question count indicators (green/yellow/red)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | CSS animations + inline styles |
| Routing | React Router DOM |
| Backend | Node.js + Express |
| Database | SQLite (better-sqlite3) |
| API | REST (8 endpoints) |

---

## Project Structure

```
algo-jeopardy/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── JeopardyGame.jsx    # Main game (board, scoreboard, modals)
│   │   │   ├── GameConfig.jsx      # Game configuration screen
│   │   │   ├── TeamsSetup.jsx      # Team management screen
│   │   │   ├── AdminPanel.jsx      # Admin CRUD interface
│   │   │   ├── SpinWheel.jsx       # SVG spin wheel
│   │   │   ├── CircularTimer.jsx   # SVG countdown timer
│   │   │   ├── ParticlesBg.jsx     # Floating code particles
│   │   │   ├── ConfettiBurst.jsx   # Confetti celebration
│   │   │   └── ScorePop.jsx        # Score change animation
│   │   ├── data/
│   │   │   └── constants.js  # WHEEL_COLORS constant
│   │   ├── utils/
│   │   │   └── geometry.js          # SVG arc math utilities
│   │   ├── style/
│   │   │   └── animations.css       # All keyframes and CSS classes
│   │   ├── App.jsx                  # React Router setup
│   │   └── index.css                # Global styles
│   ├── .env                         # VITE_API_URL
│   └── package.json
│
├── server/                     # Express backend
│   ├── db.js                   # Database layer (schema, CRUD methods)
│   ├── server.js               # Express app (8 REST endpoints)
│   ├── seed.js                 # Sample data seeder
│   └── package.json
│
├── ROADMAP.md                  # Product roadmap (Phases 1–7)
└── README.md                   # This file
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/algo-jeopardy.git
cd algo-jeopardy
```

### 2. Set up the backend

```bash
cd server
npm install
node seed.js    # Populates database with sample questions
node server.js  # Starts API on port 3001
```

### 3. Set up the frontend

```bash
cd client
npm install
```

Create `.env` in the client folder:

```
VITE_API_URL=http://localhost:3001/api
```

Start the dev server:

```bash
npm run dev     # Starts frontend on port 5173
```

### 4. Open the app

- Game: http://localhost:5173
- Admin Panel: http://localhost:5173/admin

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | List all categories |
| POST | `/api/categories` | Create a category |
| PUT | `/api/categories/:id` | Update a category |
| DELETE | `/api/categories/:id` | Delete a category (cascades to questions) |
| GET | `/api/questions` | List all questions |
| POST | `/api/questions` | Create a question |
| PUT | `/api/questions/:id` | Update a question |
| DELETE | `/api/questions/:id` | Delete a question |

---

## Game Flow

```
Configure Game → Add Teams → Play Game
     │                │            │
     ├─ Set title     ├─ Names     ├─ Spin wheel
     ├─ Pick categories├─ Avatars  ├─ Select question
     ├─ Pick difficulties│         ├─ Timer countdown
     └─ View summary  └─ Up to 12 ├─ Flip for answer
                                   ├─ Award points
                                   └─ Winner celebration
```

---

## Game Screens

### 1. Configure Game
The host sets a custom game title, selects which categories to include, and chooses difficulty levels. Categories show question counts with color-coded indicators.

### 2. Add Teams
Add up to 12 teams with custom names and emoji avatars. Teams persist when navigating back to config.

### 3. Game Board
Dynamic grid showing only selected categories and difficulties. Click cells to open questions. The board adapts to any number of categories with horizontal scrolling on mobile.

### 4. Admin Panel
Accessible at `/admin`. Manage all categories and questions. Inline editing, collapsible groups, and category filtering.

---

## Key Design Decisions

- **SQLite over PostgreSQL** — File-based, zero configuration, portable. Perfect for single-server deployment. Migration to PostgreSQL planned for Phase 2 (multi-user).
- **Random question selection** — If a category has multiple questions at the same difficulty, one is randomly picked each game session. More questions = more replayability.
- **Component extraction** — GameConfig and TeamsSetup extracted as separate components with callback props. Game board stays in JeopardyGame due to tight coupling with modals and scoring.
- **CSS animations over JS** — All animations (particles, confetti, cell entrance, score pops) use CSS `@keyframes` for GPU-accelerated performance.
- **Flat grid layout** — Game board uses CSS Grid with `gridTemplateRows: "auto repeat(n, 1fr)"` so all category headers auto-match the tallest one.

---

## What's Next (Phase 2)

See [ROADMAP.md](./ROADMAP.md) for the full product roadmap.

- User authentication (sign up, log in, JWT)
- Multi-tenancy (each user owns their categories/questions)
- PostgreSQL migration for persistent multi-user data
- Deploy to Render

---

## License

MIT