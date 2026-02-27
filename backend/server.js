import express from "express";
import cors from "cors";
import http from "http";
import { server as WebSocketServer } from "websocket";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// in memory array for chat list
const chatList = [];

const callBackForNewChats = [];

//connected ws client list
const wsClients = [];

//id counter to track "latestId"
let nextId = 1;

function displayChat() {
  return chatList.map((item) => {
    const { likes, dislikes } = getReactionCounts(item);
    return {
      id: item.id,
      name: item.name,
      text: item.text,
      likes,
      dislikes,
    };
  });
}

//========helper func to notify websocket clients ==========
function broadcastToWsClients(payload) {
  const msg = JSON.stringify(payload);

  for (const client of wsClients) {
    if (client.connected) {
      client.sendUTF(msg);
    }
  }
}

//======helper to compute count==============
function getReactionCounts(message) {
  const reactions = message.reactions || {};
  let likes = 0;
  let dislikes = 0;

  for (const value of Object.values(reactions)) {
    if (value === "like") likes++;
    if (value === "dislike") dislikes++;
  }
  return { likes, dislikes };
}

app.get("/", (req, res) => {
  res.send("Hello, from the server!");
});

// ==============GET REQUEST=============
app.get("/chat", (req, res) => {
  console.log("Received a request from a chat");

  const since = Number(req.query.since || 0);

  // Find messages with id > since
  const allMessages = displayChat();
  const newMessages = allMessages.filter((message) => message.id > since);

  //  return new Mex immediately, if available
  if (newMessages.length > 0) {
    const latestId =
      chatList.length > 0 ? chatList[chatList.length - 1].id : since;
    return res.json({ messages: newMessages, latestId });
  }

  const entry = { res, since, timer: null };

  entry.timer = setTimeout(() => {
    const index = callBackForNewChats.indexOf(entry);
    if (index !== -1) callBackForNewChats.splice(index, 1);
    return res.status(204).end();
  }, 25000);

  // clean up if user closes tab or disconnects
  req.on("close", () => {
    clearTimeout(entry.timer);
    const index = callBackForNewChats.indexOf(entry);
    if (index !== -1) callBackForNewChats.splice(index, 1);
  });

  // Store waiting request
  callBackForNewChats.push(entry);
});

// =========POST REQUEST ================
app.post("/chat", (req, res) => {
  const body = req.body;

  // add validations
  if (!body || typeof body !== "object" || !body.name || !body.text) {
    return res.status(400).json({ error: "Expected body to be Json Object" });
  }

  const name = String(body.name || "").trim();
  const text = String(body.text || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  if (!text) {
    return res.status(400).json({ error: "Text cannot be empty" });
  }

  const message = { id: nextId++, name, text, reactions: {} };
  chatList.push(message);

  // compute reaction counts (will be 0 initially)
  const { likes, dislikes } = getReactionCounts(message);

  // broadcast message
  broadcastToWsClients({
    type: "chat",
    message: {
      id: message.id,
      name: message.name,
      text: message.text,
      likes,
      dislikes,
    },
  });

  //respond to any waiting long poll
  const allMessages = displayChat();
  const latestId = message.id;
  while (callBackForNewChats.length > 0) {
    const callBackEntry = callBackForNewChats.pop();
    clearTimeout(callBackEntry.timer);

    const newMessages = allMessages.filter((m) => m.id > callBackEntry.since);
    callBackEntry.res.json({ messages: newMessages, latestId });
  }

  return res.status(201).json({ status: "OK", saved: message });
});

//======== POST REQ Like & Dislike ======

app.post("/chat/:id/like", (req, res) => {
  const id = Number(req.params.id);
  const { clientId } = req.body || {};
  if (!clientId) return res.status(400).json({ error: "clientId is required" });
  const msg = chatList.find((m) => m.id === id);
  if (!msg) {
    return res.status(404).json({ error: "Message not found" });
  }
  msg.reactions = msg.reactions || {};
  if (msg.reactions[clientId] === "like") {
    const counts = getReactionCounts(msg);
    return res.json({ id: msg.id, ...counts });
  }
  msg.reactions[clientId] = "like";
  const counts = getReactionCounts(msg);

  //notify all ws clients
  broadcastToWsClients({ type: "reaction", id: msg.id, ...counts });
  return res.json({ id: msg.id, ...counts });
});

app.post("/chat/:id/dislikes", (req, res) => {
  const id = Number(req.params.id);
  const { clientId } = req.body || {};
  if (!clientId) return res.status(400).json({ error: "clientId is required" });

  const msg = chatList.find((m) => m.id === id);

  if (!msg) {
    return res.status(404).json({ error: "Message not found" });
  }

  msg.reactions = msg.reactions || {};

  if (msg.reactions[clientId] === "dislike") {
    const counts = getReactionCounts(msg);
    return res.json({ id: msg.id, ...counts });
  }

  msg.reactions[clientId] = "dislike";
  const counts = getReactionCounts(msg);

  // notify websocket clients
  broadcastToWsClients({ type: "reaction", id: msg.id, ...counts });
  return res.json({ id: msg.id, ...counts });
});

//================WebSocket server setup==============
const server = http.createServer(app);
const webSocketServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false,
});

webSocketServer.on("request", (request) => {
  const connection = request.accept(null, request.origin);

  wsClients.push(connection);

  connection.on("close", () => {
    console.log("WebSocket client disconnected");
    const index = wsClients.indexOf(connection);
    if (index !== -1) wsClients.splice(index, 1);
  });

  connection.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});

server.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
