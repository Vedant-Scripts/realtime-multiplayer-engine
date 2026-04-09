# Realtime Multiplayer Engine

A server-authoritative real-time multiplayer system built using Nakama and TypeScript.

This project demonstrates how consistent game state, turn validation, and synchronization can be handled on the backend, using Tic-Tac-Toe as a minimal reproducible model.

> Note: Tic-Tac-Toe is intentionally used as a minimal game model to focus on backend architecture rather than UI complexity.


## Architecture Overview

This system follows a **server-authoritative architecture**, where the server is the single source of truth for all game state and decisions.

### Key Principles

- **No client trust**: Clients cannot directly mutate game state
- **Server validation**: Every move is validated on the backend
- **Deterministic state transitions**: Game state evolves only through controlled server logic

### Role of Nakama

Nakama acts as the real-time multiplayer server responsible for:

- Match lifecycle management
- Real-time communication via WebSockets
- Match state orchestration
- Player presence tracking

Custom game logic is implemented using **TypeScript runtime modules**, executed within Nakama.

### Game State & Validation

- Game state is maintained exclusively on the server
- Each move request from a client:
  1. Is received via socket message
  2. Validated against current match state
  3. Applied if valid
  4. Broadcasted to all connected players

### Client Interaction Model

Clients act as **thin consumers**:

- Send intents (e.g., "make move")
- Receive authoritative state updates
- Render UI based on server state

---

## System Design

### Match Lifecycle

1. **Create**
   - Match is created via Nakama match handler
   - Initial game state is initialized

2. **Join**
   - Players join via match ID or matchmaking
   - Presence is tracked by Nakama

3. **Play**
   - Players send moves via socket messages
   - Server validates and updates state
   - Updated state is broadcasted

4. **End**
   - Win/draw conditions are evaluated server-side
   - Match is terminated or reset

---
## 🛠 Tech Stack

*   **Backend:** Nakama (Real-time server), TypeScript (Runtime modules)
*   **Frontend:** React (Client interface), Nakama JS SDK (Websocket)
*   **Infrastructure:** Docker & Docker Compose, Node.js (>= 18)

## 🚀 Setup & Running the Project

### 1. Clone Repository
```bash
git clone https://github.com/your-username/realtime-multiplayer-engine.git
cd realtime-multiplayer-engine
```

### 2. Backend Setup (Nakama + TS)

**Install Dependencies**
```bash
    cd backend/nakama
    pnpm install
    pnpm build
    docker compose up
```
### 3. Frontend Setup (React Js)
```bash
    cd ../frontend
    pnpm install

    # Development server
    pnpm dev
    
    # Production server
    pnpm build
    pnpm preview
```
- Frontend: http://localhost:5173

### 4. Testing Multiplayer Matchmaking

- Open the app in **two browser tabs**
- In both tabs, click **"Find Match"**
- Once both players are queued, they will automatically connect to the same match thanks to nakama
- You should now be able to play in real-time

## Future Improvements
- Matchmaking: Skill-based and region-based logic.
- Persistence: Storage for match history and global leaderboards.
- Optimization: WebSocket message batching and compression.
- Resilience: Improved reconnection handling and session recover


## Contact
For support or inquiries, contact the Vedant Yadav at (https://github.com/Vedant-Scripts).