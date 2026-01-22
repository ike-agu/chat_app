const nameInput = document.getElementById("name-input");
const textInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const displayChatArea = document.getElementById("display-message");
const messageSent = document.getElementById("message-success");

const form = document.getElementById("message-form");


const API_URL = "http://localhost:3000";

async function loadChat(){
  try {
    const res = await fetch(`${API_URL}/chat`);
    const data = await res.json();
    
    displayChatArea.textContent = ""
    data.forEach(element => {
      let userMessage = document.createElement("p");
      userMessage.textContent = `${element.name} - ${element.text}`
      displayChatArea.appendChild(userMessage);
    });
  } catch (err) {
    displayChatArea.textContent = "Could not load any chat at the moment";
    console.error(err);
  }
}

loadChat();

// sendBtn.addEventListener("click", loadChat);
