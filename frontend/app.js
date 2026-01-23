const nameInput = document.getElementById("name-input");
const textInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const displayChatArea = document.getElementById("display-message");
const messageAlert = document.getElementById("message-alert");

const form = document.getElementById("message-form");


const API_URL = "http://localhost:3000";

async function loadChat() {
  // Check scroll position BEFORE rendering
  const isNearBottom =
    displayChatArea.scrollHeight -
      displayChatArea.scrollTop -
      displayChatArea.clientHeight <
    50;

  try {
    const res = await fetch(`${API_URL}/chat`);
    const data = await res.json();

    displayChatArea.textContent = "";
    data.forEach((element) => {
      const messageAreaDiv = document.createElement("div");
      messageAreaDiv.className = "chat-message";

      const nameEl = document.createElement("div");
      nameEl.className = "chat-name";
      nameEl.textContent = element.name;

      const textEl = document.createElement("div");
      textEl.className = "chat-text";
      textEl.textContent = element.text;

      messageAreaDiv.appendChild(nameEl);
      messageAreaDiv.appendChild(textEl);
      displayChatArea.appendChild(messageAreaDiv);
    });

    // Scroll ONLY if user was near bottom
    if (isNearBottom) {
      requestAnimationFrame(() => {
        displayChatArea.scrollTop = displayChatArea.scrollHeight;
      });
    }

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
  // add validation
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
