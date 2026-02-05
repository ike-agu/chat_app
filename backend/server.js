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
  return chatList.map((item) => ({
    id: item.id,
    name: item.name,
    text: item.text,
    likes: item.likes ?? 0,
    dislikes: item.dislikes ?? 0,
  }));
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

  const message = { id: nextId++, name, text, likes:0, dislikes:0 };
  chatList.push(message);

  //when new mex is sent via ws, broadcast it
  for (const client of wsClients) {
    if (client.connected) {
      client.sendUTF(JSON.stringify({ type: "chat", message }));
    }
  }

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
