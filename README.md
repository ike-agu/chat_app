# Chattiamo

Chattiamo is a simple full-stack chat application built with Node.js, Express, and vanilla JavaScript. It allows users to send messages, view existing messages, and see new messages appear automatically.

---

## Features
- View existing chat messages
- Send new chat messages
- Automatic message updates using polling (near real-time)
- Input validation and user feedback
- Simple and clean UI


## Tech Stack
* Backend: Node.js, Express
* Frontend: HTML, CSS, JavaScript
* Data Storage: In-memory array (temporary)
* Communication: REST API (JSON over HTTP)

## How It Works

### Backend
 * An Express server exposes two endpoints:
  - GET /chat – retrieves all chat messages
  - POST /chat – validates and stores new chat messages
* Messages are stored in memory while the server is running.
* CORS and JSON body parsing are enabled.

### Frontend
* A form allows users to enter their name and message.
* Messages are fetched from the server and rendered dynamically.
* New messages are sent using a POST request.
* Polling refreshes messages every 2 seconds to simulate real-time updates.

## Installation & Setup
### Prerequisites
* Node.js (v16+ recommended)
* npm

---

1. ### Clone the repository
git clone <git@github.com>:ike-agu/chat_app.git

cd chat_app

2. ### Install server dependencies
npm install

3. ### Start the server
node server.js

The server will run on: <http://localhost:3000>

4. ### Run the frontend
From the project root:
npx serve
Open the URL shown in the terminal (usually <http://localhost:3000> or <http://localhost:5000>) in your browser.
Make sure the backend server is running before loading the frontend.

---

## Usage

1. Open the app in your browser.
2. Enter a name and message.
3. Click Send.
4. Messages appear instantly for the sender and within 2 seconds for other users.
5. Open multiple browser tabs to see polling-based updates in action.

## Future Improvements
 coming soon....
