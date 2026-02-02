import express from "express";
import cors from "cors";

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// in memory array for chat list
const chatList = [];

//call back for new chats
const callBackForNewChats = [];

//id counter to track "latestId"
let nextId = 1;

function displayChat() {
  return chatList.map((item) => ({
    id: item.id,
    name: item.name,
    text: item.text,
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

  // If we have new messages, return them immediately
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

  // Store this waiting request
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

  const message = { id: nextId++, name, text };
  chatList.push(message);

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

app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
