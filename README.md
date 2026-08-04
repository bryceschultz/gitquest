# GitQuest 🎮
### Operation Shadow Breach — Learn Git Through Immersive Hacker Missions

GitQuest is an interactive web application that teaches Git through story-driven missions. Players take on the role of a cyber agent fighting a hacker group called **Shadow Breach**, learning real Git commands through hands-on field scenarios, progressive levels, a live leaderboard, trophies, and a coin-based reward system.

🌐 **Live at [gitquestgame.com](https://gitquestgame.com)**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Seeding the Database](#seeding-the-database)
- [Deployment](#deployment)
- [API Reference](#api-reference)
- [Game Design](#game-design)
- [Screenshots](#screenshots)
- [Team](#team)

---

## Overview

GitQuest is a Duolingo-style learning platform for Git. Agents progress through 30 missions across 3 difficulty levels — Beginner, Intermediate, and Advanced — each teaching a specific Git command through a spy-themed scenario.

Agents choose between two modes on the welcome screen:

- **New Recruit** — missions are locked and must be completed in order
- **Field Agent** — free roam with access to all missions

Progress, coins, XP, trophies, and streaks are all persisted in MongoDB so agents can pick up where they left off from any device or browser.

---

## Features

- 🎯 **30 Missions** across 3 levels — Beginner, Intermediate, Advanced
- 🔐 **Agent Authentication** — Sign up / sign in with email and password, JWT via HTTP-only cookies
- 🔄 **Session Persistence** — Automatically restores session on page refresh without re-login
- 📈 **Live Progress Tracking** — Mission completion saved to MongoDB per agent, synced across devices
- 💰 **Coin System** — Earn 10 coins per completed mission, spend them in the Collectibles store
- ⚡ **XP System** — Earn XP per mission, tracked live in the topbar and leaderboard
- 🔥 **Daily Streak** — Resets to 0 if you miss a day, tracked on every sign-in
- 🏆 **20 Trophies** — Unlocked by hitting milestones (speed, streaks, perfect attempts, level completion, etc.)
- 🎖️ **Agent Dossier** — Live stats: missions complete, battles won, perfect attempts, hints used, coins earned
- 🗺️ **Mission Map** — Visual level map with lock/unlock progression
- 🔒 **Mission Locking** — New Recruits must complete missions in order; completed missions are freely revisitable
- 🎵 **Background Music** — Plays across map and mission screens, toggle on/off
- 🛒 **Collectibles** — 18 tools, boosts, and cosmetics purchasable with coins (consumable — use to unequip and repurchase)
- 🏅 **Trophy Room** — All 20 trophies with rarity tiers (Common, Uncommon, Rare, Legendary) and agent dossier
- 📊 **Leaderboard** — Top 10 agents ranked by XP: All Time tab and Level tab (reflects agent's current level)
- 🚪 **Logout** — Clean session teardown with 2-second animated transition

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, JavaScript, Vite |
| Backend | Node.js v22, Express.js |
| Database | MongoDB Atlas, Mongoose ODM |
| Auth | JWT, bcryptjs, HTTP-only cookies (`sameSite: none`, `secure: true`) |
| Hosting — Frontend | AWS Amplify |
| Hosting — Backend | AWS Elastic Beanstalk |
| Styling | Inline React styles (monospace hacker aesthetic) |
| Dev Tools | Nodemon, ESLint, Husky |

---

## Project Structure

```
gitquest/
├── backend/                      ← Express API server
│   ├── middleware/
│   │   └── auth.js               ← JWT requireAuth middleware
│   ├── models/
│   │   ├── Agent.js              ← Agent schema (auth, coins, streak, XP)
│   │   ├── AgentArsenal.js       ← Agent ↔ Collectible junction table
│   │   ├── AgentProgress.js      ← Mission completion records per agent
│   │   ├── AgentTrophy.js        ← Trophy unlock records per agent
│   │   ├── Battle.js             ← Battle attempt records
│   │   ├── Collectible.js        ← Collectible item definitions
│   │   ├── Command.js            ← Git command + hint + regex validator
│   │   ├── Level.js              ← Level definitions (1–3)
│   │   ├── Mission.js            ← Mission definitions with sections
│   │   └── Trophy.js             ← Trophy definitions
│   ├── routes/
│   │   ├── agents.js             ← Agent profile, leaderboard (all time + per level)
│   │   ├── arsenal.js            ← Collectibles shop, unlock, unequip
│   │   ├── auth.js               ← Sign up, sign in, sign out, /me, streak logic
│   │   ├── battles.js            ← Record battle completions, history
│   │   ├── levels.js             ← Fetch all levels
│   │   ├── missions.js           ← Fetch missions + agent progress
│   │   ├── stats.js              ← Agent dossier stats (live from DB)
│   │   └── trophies.js           ← Fetch trophies + evaluate unlocks
│   ├── audio/
│   │   └── 1.7_1-consumatesurvivor.caf.wav
│   ├── seedCollectibles.js       ← Seeds 18 collectibles (6 tools, 6 boosts, 6 cosmetics)
│   ├── seedMissions.js           ← Seeds 3 levels, 30 missions, 30 commands
│   ├── seedTrophies.js           ← Seeds 20 trophy definitions
│   ├── server.js                 ← Express app entry point
│   ├── Procfile                  ← For Elastic Beanstalk: web: node server.js
│   └── package.json
│
├── gitquest-ui/                  ← React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── auth.js           ← signIn, signUp, signOut, getMe
│   │   ├── components/
│   │   │   ├── Arsenal.jsx       ← Collectibles store UI
│   │   │   ├── Leaderboard.jsx   ← All Time + Level leaderboard
│   │   │   ├── MissionMap.jsx    ← Level map with node progression
│   │   │   ├── PlacementQuiz.jsx ← Quiz screen for Field Agent
│   │   │   ├── SignInPage.jsx    ← Agent authentication
│   │   │   ├── SignUpPage.jsx    ← Agent registration
│   │   │   ├── TrainingPage.jsx  ← Mission training + battle + trophy toasts
│   │   │   ├── TrophyRoom.jsx    ← Trophy room + agent dossier
│   │   │   └── WelcomeScreen.jsx ← Mode selection + logout
│   │   ├── context/
│   │   │   └── ProgressContext.jsx ← DB-backed progress, coins, XP
│   │   ├── App.jsx               ← Root app + screen routing + audio + session restore
│   │   └── main.jsx
│   ├── public/
│   │   └── _redirects            ← SPA redirect for Amplify
│   ├── amplify.yml               ← AWS Amplify build config
│   ├── index.html
│   └── package.json
│
└── tests/                        ← Test suite
```

---

## Prerequisites

- [Node.js v18+](https://nodejs.org/) (project uses v22.19.0)
- [npm](https://www.npmjs.com/)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free M0 tier is sufficient)
- A modern browser (Chrome, Firefox, Edge)

---

## Environment Setup

### 1. Clone the repository

```bash
git clone https://github.com/anascoded/gitquest.git
cd gitquest
```

### 2. Create the backend `.env` file

```bash
cd backend
touch .env
```

Add the following variables:

```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/gitquest?appName=GitQuest
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Replace:
- `<username>` — your MongoDB Atlas username
- `<password>` — your MongoDB Atlas password (**encode `@` as `%40`** if your password contains it)
- `<cluster>` — your Atlas cluster hostname

> **Important:** Whitelist your IP in MongoDB Atlas under **Network Access**. For development, allow `0.0.0.0/0`.

---

## Running the Backend

```bash
cd backend
npm install
npm run dev
```

Expected output:
```
✔ Connected to MongoDB
✔ Server running on port 5001
```

The API will be available at `http://localhost:5001`.

---

## Running the Frontend

Open a **second terminal** — keep the backend running:

```bash
cd gitquest-ui
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

> Both servers must run simultaneously. The frontend will not function without the backend.

---

## Seeding the Database

Run all three seed scripts from the `backend/` folder after the server connects successfully.

### 1. Seed levels, missions, and commands

```bash
cd backend
node seed.js
```

```
✔ Connected to MongoDB
✔ Cleared existing levels, missions, commands
✔ Inserted 3 levels
✔ Inserted 30 missions
✔ Inserted 30 commands
✔ Database seeded successfully
```

### 2. Seed trophies

```bash
node seedTrophies.js
```

```
✔ Connected to MongoDB
✔ Seeded 20 trophies
```

### 3. Seed collectibles

```bash
node seedCollectibles.js
```

```
✔ Connected to MongoDB
✔ Seeded 18 collectibles
```

> Re-running any seed script clears and re-inserts the data cleanly. Safe to re-run at any time.

---

## Deployment

The app is live at **[gitquestgame.com](https://gitquestgame.com)**.

| Layer | Service |
|---|---|
| Frontend | AWS Amplify (auto-deploys on push to `main`) |
| Backend | AWS Elastic Beanstalk (Node.js platform, port 8080) |
| Database | MongoDB Atlas (M0 free tier) |

### Environment variables for production

Set these in the **Elastic Beanstalk** environment:

```
PORT=8080
MONGODB_URI=<your Atlas URI>
JWT_SECRET=<your secret>
CLIENT_URL=https://gitquestgame.com
```

Set these in the **Amplify** console under Environment Variables:

```
VITE_API_URL=https://<your-eb-url>/api
VITE_AUDIO_URL=https://<your-eb-url>/audio
```

### Cross-origin cookie note

Because the frontend (Amplify) and backend (Elastic Beanstalk) run on different domains, cookies must be set with:

```js
{ httpOnly: true, secure: true, sameSite: 'none' }
```

Both `secure: true` and `sameSite: 'none'` are required for cross-origin cookies to work over HTTPS.

### Audio CORS note

The audio file is served as a static asset from the backend. To prevent `ERR_BLOCKED_BY_ORB` errors, the `/audio` route includes:

```js
res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin')
```

---

## API Reference

All routes are prefixed with `/api`. Authentication uses HTTP-only JWT cookies.

### Auth — `/api/auth`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/signup` | Register a new agent | No |
| POST | `/signin` | Sign in, returns agent data + sets cookie | No |
| POST | `/signout` | Clear session cookie | No |
| GET | `/me` | Get current session agent (used for session restore on refresh) | Yes |

### Missions — `/api/missions`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all missions | No |
| GET | `/:id/command` | Get command for a mission | No |
| GET | `/progress` | Get completed mission IDs for the current agent | Yes |
| POST | `/progress` | Mark a mission as completed | Yes |

### Levels — `/api/levels`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all levels | No |

### Battles — `/api/battles`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/complete` | Record a completed battle, update agent coins + XP | Yes |
| GET | `/history` | Get agent battle history | Yes |

### Trophies — `/api/trophies`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all 20 trophies with earned status | Yes |
| POST | `/evaluate` | Evaluate and award newly unlocked trophies | Yes |

### Agents — `/api/agents`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/me` | Get current agent profile | Yes |
| GET | `/leaderboard?type=alltime` | Top 10 agents by total XP | Yes |
| GET | `/leaderboard?type=level` | Top 10 agents by XP for agent's current level | Yes |

### Stats — `/api/stats`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Live agent dossier stats | Yes |

### Arsenal (Collectibles) — `/api/arsenal`

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/` | Get all collectibles with ownership status | Yes |
| POST | `/:id/unlock` | Purchase an item (deducts coins) | Yes |
| POST | `/:id/unequip` | Remove ownership — makes item repurchasable | Yes |

---

## Game Design

### Levels

| Level | Title | Difficulty | Missions |
|---|---|---|---|
| 1 | Recruit Training | Beginner | 10 |
| 2 | Deep Infiltration | Intermediate | 10 |
| 3 | Ghost Protocol | Advanced | 10 |

### Commands by Level

| Level | Commands Covered |
|---|---|
| 1 | `git clone`, `git pull`, `git status`, `git add`, `git commit`, `git log`, `git diff`, `git restore`, `git branch`, `git checkout` |
| 2 | `git stash`, `git stash pop`, `git commit --amend`, `git push`, `git merge`, `git tag`, `git branch -a`, `git revert`, `git reset --hard`, `git branch -d` |
| 3 | `git cherry-pick`, `git rebase`, `git stash branch`, `git merge --squash`, `git bisect`, `git bisect good`, `git reflog`, `git rebase -i`, `git commit -S`, `git archive` |

### Mission Flow

1. Agent reads the **Handler Briefing** (story context)
2. Agent reads **The Command** — what it does, syntax blocks, terminal example, warnings
3. Agent enters the **Battle** — types the correct Git command into the terminal input
4. **Second wrong attempt** → hint revealed
5. **Correct answer** → +10 coins, +20 XP awarded; trophies evaluated; auto-advances after 2 seconds
6. **Level complete** → returns to mission map
7. **All 30 missions complete** → game completion screen

### Agent Modes

| Mode | Behavior |
|---|---|
| New Recruit | Missions locked — must complete in sequential order |
| Field Agent | All missions freely accessible |

### Trophy Rarity Tiers

| Rarity | Color | Examples |
|---|---|---|
| Common | Blue | First Strike, Clean Slate, Committed |
| Uncommon | Green | No Hints Required, Streak Operative, Shadow Hunter |
| Rare | Purple | Flawless, Deep Cover, Ghost Protocol |
| Legendary | Gold | Ghost Agent, Perfectionist, Shadow Breach Neutralized |

### Coin Economy

| Action | Coins |
|---|---|
| Complete a mission | +10 |
| Purchase a tool | −60 to −200 |
| Purchase a boost | −60 to −150 |
| Purchase a cosmetic | −50 to −300 |
| Unequip a collectible | Coins not refunded — item becomes repurchasable |

### Leaderboard

- **All Time** — total XP from all 30 missions, top 10 agents, tie-broken by earliest completion date
- **Level X** — XP from missions in the agent's current level only, same tie-breaking rule
- Current agent is always highlighted in green with a `YOU` badge

---

## Screenshots

---

## Team

| Name | Role |
|---|---|
| Maria Sicilia | Team Lead |
| Bryce Schultz | Full Stack Developer |
| Kevin Warner | Full Stack Developer |
| Preeti Sagar | QA / Software Tester |
| Anas Sallam | Full Stack Developer |

---

© 2026 GitQuest · v1.00 · All rights reserved
