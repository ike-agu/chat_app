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

function displayChat() {
  return chatList.map((item) => ({
    name: item.name,
    text: item.text,
  }));
}

app.get("/", (req, res) => {
  res.send("Hello, from the server!");
});

// ===Get request====
app.get("/chat", (req, res) => {
  console.log("Received a request from a chat");

  const since = Number(req.query.since || 0);

  if (chatList.length > since) {
    const allMessages = displayChat();
    const newMessages = allMessages.slice(since); //only chats after since
    return res.json({ messages: newMessages, latestCount: chatList.length });
  }

  const entry = { res, since, timer: null };

  entry.timer = setTimeout(() => {
    const index = callBackForNewChats.indexOf(entry);
    if (index !== -1) callBackForNewChats.splice(index, 1);
    return res.status(204).end();
  }, 25000);

  // If user closes tab or disconnects, we must clean up
  req.on("close", () => {
    clearTimeout(entry.timer);
    const index = callBackForNewChats.indexOf(entry);
    if (index !== -1) callBackForNewChats.splice(index, 1);
  });

  // Store this waiting request
  callBackForNewChats.push(entry);
});

// ==Post method ==
app.post("/chat", (req, res) => {
  const body = req.body;

  // add validations
  if (!body || typeof body !== "object" || !body.name || !body.text) {
    return res.status(400).json({ error: "Expected body to be Json Object" });
  }

  const name = String(body.name || "").trim();
  const text = String(body.text || "").trim();

  // validate name and text
  if (!name) {
    return res.status(400).json({ error: "Name cannot be empty" });
  }

  if (!text) {
    return res.status(400).json({ error: "Text cannot be empty" });
  }

  // save message
  chatList.push({ name, text });

  while (callBackForNewChats.length > 0) {
    const callBackEntry = callBackForNewChats.pop();

    clearTimeout(callBackEntry.timer);

    const allMessages = displayChat();
    const newMessages = allMessages.slice(callBackEntry.since);

    callBackEntry.res.json({
      messages: newMessages,
      latestCount: chatList.length,
    });
  }

  return res.status(201).json({ status: "OK", saved: { name, text } });
});

app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
