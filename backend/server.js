import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

const chatList = [
  {
    name: "Ike",
    text: "Hello there",
  },
  {
    name: "Maria",
    text: "Hi there",
  }
];

function displayChat(){
  return chatList.map((item) => ({
    name: item.name,
    text: item.text
  }))
}

app.get("/", (req, res) => {
  res.send("Hello, from the server!");
});

// ===Get request====
app.get("/chat",(req, res) =>{
  console.error("Received a request from a chat")
  const chat = displayChat();
  res.json(chat);
})

app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
