// =========websocket frontend code============

let lastSeenMessageId = 0;

function connectWebSocket() {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log("✅ WS connected");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "chat" && data.message) {
        const message = data.message;

        // ignore duplicates
        if (message.id <= lastSeenMessageId) return;

        appendMessages([message]);
        lastSeenMessageId = message.id;
      }
    } catch (err) {
      // not JSON (e.g. "Hello from WebSocket")
      console.log("Non-chat WS message:", event.data);
    }
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

async function loadExistingMessages() {
  try {
    displayChatArea.textContent = "";
    lastSeenMessageId = 0;

    const res = await fetch(`${API_URL}/chat?since=0`);
    if (!res.ok) throw new Error(`GET/ chat failed: ${res.status}`);

    const data = await res.json();
    const messages = data.messages || [];

    if (messages.length > 0) {
      appendMessages(messages);
    }

    if (typeof data.latestId === "number") {
      lastSeenMessageId = data.latestId;
    }
  } catch (err) {
    console.error(err);
    messageAlert.textContent = "Failed to load";
  }
}

loadExistingMessages();
connectWebSocket();
