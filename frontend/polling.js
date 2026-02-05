let lastSeenMessageId = 0;
let polling = false; //prevents overlapping polls
let stopPolling = false; // optional: can be set to true when leaving page

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

    const data = await res.json(); // data I expect = { messages, latestId }
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
