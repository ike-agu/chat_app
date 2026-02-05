const nameInput = document.getElementById("name-input");
const textInput = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const displayChatArea = document.getElementById("display-message");
const messageAlert = document.getElementById("message-alert");

const form = document.getElementById("message-form");

const API_URL =
  location.hostname === "localhost"
    ? "http://localhost:3000"
    : "https://ike-agu-chat-app-backend.hosting.codeyourfuture.io";

//ws URL for websocket
const WS_URL =
  location.hostname === "localhost"
    ? "ws://localhost:3000"
    : "wss://ike-agu-chat-app-backend.hosting.codeyourfuture.io";

function appendMessages(messages) {
  // Check scroll position BEFORE rendering
  const isNearBottom =
    displayChatArea.scrollHeight -
      displayChatArea.scrollTop -
      displayChatArea.clientHeight <
    50;

  for (const element of messages) {
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
  }

  // Scroll ONLY if user was near bottom
  if (isNearBottom) {
    requestAnimationFrame(() => {
      displayChatArea.scrollTop = displayChatArea.scrollHeight;
    });
  }
}

//  ======SEND CHAT======
async function sendChat(event) {
  event.preventDefault();

  const name = nameInput.value.trim();
  const text = textInput.value.trim();
  // add validation
  if (!name || !text) {
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
    if (!res.ok) {
      messageAlert.textContent = data.error || "Failed to send message";
      return;
    }

    messageAlert.textContent = "";
    // clear inputs
    nameInput.value = "";
    textInput.value = "";
  } catch (err) {
    messageAlert.textContent = "Error sending chat";
    console.error(err);
  }
}

form.addEventListener("submit", sendChat);
