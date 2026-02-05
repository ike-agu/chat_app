// =========websocket frontend code============
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
