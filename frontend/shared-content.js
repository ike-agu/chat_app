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

//helper func for message liked
async function likeMessage(id) {
  await fetch(`${API_URL}/chat/${id}/like`, { method: "POST" });
}
//helper func for message disliked
async function dislikeMessage(id) {
  await fetch(`${API_URL}/chat/${id}/dislikes`, { method: "POST" });
}

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
    messageAreaDiv.dataset.id = element.id;

    const nameEl = document.createElement("div");
    nameEl.className = "chat-name";
    nameEl.textContent = element.name;

    const textEl = document.createElement("div");
    textEl.className = "chat-text";
    textEl.textContent = element.text;

    const reactionsRow = document.createElement("div");
    reactionsRow.className = "reactions-row";

    // Only show counts if non-zero
    const likes = element.likes || 0;
    const dislikes = element.dislikes || 0;

    if (likes > 0 || dislikes > 0) {
      const counts = document.createElement("span");
      counts.className = "reaction-counts";
      counts.textContent = `👍 ${likes}  👎 ${dislikes}`;
      reactionsRow.appendChild(counts);
    }

    //element for like message
    const likeBtn = document.createElement("button");
    likeBtn.type = "button";
    likeBtn.textContent = "Like";

    likeBtn.addEventListener("click", async () => {
      try {
        await likeMessage(element.id);
      } catch (err) {
        console.error(err);
        messageAlert.textContent = "Failed to like message";
      }
    });

    //element for dislike message
    const dislikeBtn = document.createElement("button");
    dislikeBtn.type = "button";
    dislikeBtn.textContent = "Dislike";

    dislikeBtn.addEventListener("click", async () => {
      try {
        await dislikeMessage(element.id);
      } catch (err) {
        console.error(err);
        messageAlert.textContent = "Failed to dislike message";
      }
    });

    reactionsRow.appendChild(likeBtn);
    reactionsRow.appendChild(dislikeBtn);
    messageAreaDiv.appendChild(nameEl);
    messageAreaDiv.appendChild(textEl);
    messageAreaDiv.appendChild(reactionsRow);
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
