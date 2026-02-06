# Chattiamo

Chattiamo is a simple full-stack chat application built with Node.js, Express, and vanilla JavaScript.
It shows **two different approaches to receiving real-time updates** from a server:

- **Polling**
- **WebSockets**

Both implementations are included **on the same branch** and share common code where possible.

---

## Features
- View existing chat messages
- Send new chat messages
- Like and dislike individual messages
- Two real-time update implementations:
  - Polling (near real-time)
  - WebSockets (real-time)
- Live updates when messages receive likes or dislikes
- Input validation and user feedback
- Simple, clean, and responsive UI

---

## Tech Stack
- **Backend:** Node.js, Express
- **Frontend:** HTML, CSS, JavaScript
- **Data Storage:** In-memory array (temporary)
- **Communication:**
  - REST API (JSON over HTTP)
  - WebSockets

---

## How It Works

### Backend
- An Express server exposes REST endpoints:
  - `GET /chat` – retrieves chat messages (supports `since` query param)
  - `POST /chat` – validates and stores new chat messages
  - `POST /chat/:id/like` – increments likes for a message
  - `POST /chat/:id/dislike` – increments dislikes for a message
- Messages are stored in memory while the server is running.
- Long polling is supported for the polling implementation.
- A WebSocket server broadcasts new chat messages and reaction updates (likes/dislikes) to connected clients.
- CORS and JSON body parsing are enabled.

### Frontend
The frontend contains **two separate pages**, showing the different approaches:

#### Polling Version
- Fetches existing messages when the page loads.
- Continuously polls the server using `/chat?since=...` to receive new messages and reaction updates.

#### WebSocket Version
- Fetches existing messages once when the page loads.
- Opens a WebSocket connection to the server.
- Receives new chat messages and reaction updates instantly via WebSocket broadcasts.

Shared frontend code is used for:
- DOM setup
- Rendering messages
- Sending messages
- Rendering and updating like/dislike counts
- Configuration values

---

## Project Structure

```

backend/
server.js

frontend/
polling.html
polling.js
ws.html
ws.js
shared-content.js
styles.css

````

---

## Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- npm

### 1) Clone the repository
```bash
git clone git@github.com:ike-agu/chat_app.git
cd chat_app
````

### 2) Install dependencies

```bash
npm install
```

### 3) Start the backend server

```bash
node backend/server.js
```

The server will run on:
`http://localhost:3000`

### 4) Serve the frontend

From the project root:

```bash
npx serve frontend
```

Open the URL shown in the terminal in your browser.

---

## Pages to Open

* **Polling implementation:**
  `/polling.html`

* **WebSocket implementation:**
  `/ws.html`

---

## Usage

1. Open either the polling or WebSocket page.
2. Enter a name and message.
3. Click **Send**.
4. Messages appear:

   * via polling on the polling page
   * instantly via WebSockets on the WebSocket page
5. Click **Like** or **Dislike** on any message to react.
6. Reaction counts update in real time across connected clients.
7. Open multiple tabs to observe real-time behaviour.

---

## Notes

* Data is stored in memory and resets when the server restarts.
* Basic responsive styling is included for smaller screens.

---

## Future Improvements

* Persistent storage (database)
* User authentication
* Message timestamps
* Typing indicators
