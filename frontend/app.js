const nameInput = document.getElementById("name-input");
const textInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const displayChatArea = document.getElementById("display-message");
const messageAlert = document.getElementById("message-alert");

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
setInterval(loadChat, 2000);

//  ==== add chat ======
async function sendChat(event){
  event.preventDefault();

   const name = nameInput.value.trim()
   const text = textInput.value.trim()
  // ==add validation=====
  if(!name || !text){
    messageAlert.textContent = "please enter both name and text";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text }),
    });

    const data = await res.json();
    if(!res.ok){
      messageAlert.textContent = data.error || "Failed to send message";
      return;
    }

    messageAlert.textContent = "";

    // clear inputs
    nameInput.value = ""
    textInput.value = ""

    loadChat();

  } catch (err) {
    messageAlert.textContent = "Error sending chat";
    console.error(err)
  }
}

form.addEventListener("submit", sendChat);
