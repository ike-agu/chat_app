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

// =========websocket frontend code connection============
function connectWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WS connected");
  };

  ws.onmessage = (event) => {
    console.log("📩 WS message:", event.data);

    // show it on the page
    messageAlert.textContent = `WS: ${event.data}`;
  };

  ws.onclose = (e) => {
    console.log("WS closed - reconnecting in 1s...");
    setTimeout(connectWebSocket, 1000);
  };

  ws.onerror = (e) => {
    console.error("WS error:", e);
    // close triggers reconnect
    ws.close();
  };
}

connectWebSocket();

let lastSeenMessageId = 0;
let polling = false; //prevents overlapping polls
let stopPolling = false; // optional: can be set to true when leaving page

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

async function initialChatLoad() {
  displayChatArea.textContent = "";
  lastSeenMessageId = 0;
  await pollOnce(); //  will fetch since=0 and append results
}

async function pollOnce() {
  if (polling || stopPolling) return;
  polling = true;

  try {
    const res = await fetch(`${API_URL}/chat?since=${lastSeenMessageId}`);

    //long poll timeout, no updates
    if (res.status === 204) {
      polling = false;

      return pollOnce();
    }

    if (!res.ok) {
      throw new Error(`GET /chat failed: ${res.status}`);
    }

    const data = await res.json(); // data I expect { messages, latestId }
    const messages = data.messages || [];

    if (messages.length > 0) {
      appendMessages(messages);
    }

    if (typeof data.latestId === "number") {
      lastSeenMessageId = data.latestId;
    } else if (
      messages.length > 0 &&
      typeof messages[messages.length - 1].id === "number"
    ) {
      lastSeenMessageId = messages[messages.length - 1].id;
    }

    polling = false;

    return pollOnce();
  } catch (err) {
    polling = false;
    console.error(err);

    setTimeout(() => {
      pollOnce();
    }, 1000);
  }
}

initialChatLoad();

//  ==== SEND CHAT======
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
