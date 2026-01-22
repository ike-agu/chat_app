import express from "express";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())

// in memory array for chat list
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

// ==Post method ==
app.post("/chat", (req, res) => {
  const body = req.body;
  // add validations
  if(!body || typeof body !== "object" || !body.name || !body.text){
    return res.status(400).json({error:"Expected body to be Json Object"});
  }

  const name = String(body.name || "").trim();
  const text = String(body.text || "").trim();

  // validate name and text
  if(!name){
    return res.status(400).json({error: "Name cannot be empty"})
  }

  if(!text){
    return res.status(400).json({error:"Text cannot be empty"});
  }

  chatList.push({name, text});
  return res.status(201).json({status:"OK", saved: {name, text}});
})


app.listen(port, () => {
  console.log(`server listening on port: ${port}`);
});
