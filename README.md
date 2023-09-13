# 🤖 React SSE OpenAI Example

![comp-demo](https://user-images.githubusercontent.com/102473837/234518800-50d67f9e-53f9-4a25-ba81-81d2ba974165.gif)

## 🚀 Quick start

1. **Clone the repo**

    ```shell
    git clone https://github.com/its-ag/react-sse-openai-example
    ```

2. **Install dependencies**

    ```shell
    npm install # or pnpm install
    ```

3. Edit ``.env.example`` file to ``.env`` and add your API keys.
4. **Start developing**

    ```shell
    npm run dev # or pnpm run dev
    ```

5. **Open the source code and start editing!**

        Your site is now running at http://localhost:5173

[Quick start using our API on RapidAPI](https://rapidapi.com/marketingbusinessblueprint/api/chatgpt-simple-api-cheapest2/)
How to set up your own Nectarjs Backend for seemless AI based website and app building

set up a backend folder with 

1. **fetch-sse.mjs**
   
    ```shell
    import { createParser } from "eventsource-parser";
import { streamAsyncIterable } from "./stream-async-iterable.mjs";
// Server-Sent Events (SSE) is a technology for sending data from a server to a web client in real time.

export async function fetchSSE(resource, options) {
  const { onMessage, ...fetchOptions } = options;
  const resp = await fetch(resource, fetchOptions);
  const parser = createParser((event) => {
    if (event.type === "event") {
      onMessage(event.data);
    }
  });
  for await (const chunk of streamAsyncIterable(resp.body)) {
    const str = new TextDecoder().decode(chunk);
    parser.feed(str);
  }
}
    ```

2. **index.mjs**

    ```shell
    import ExpiryMap from "expiry-map";
import { v4 as uuidv4 } from "uuid";
import Browser from "webextension-polyfill";
import { fetchSSE } from "./fetch-sse.mjs";

const KEY_ACCESS_TOKEN = "accessToken";

const cache = new ExpiryMap(10 * 1000);

async function getAccessToken() {
  if (cache.get(KEY_ACCESS_TOKEN)) {
    return cache.get(KEY_ACCESS_TOKEN);
  }
  const resp = await fetch("https://chat.openai.com/api/auth/session")
    .then((r) => r.json())
    .catch(() => ({}));
  if (!resp.accessToken) {
    throw new Error("UNAUTHORIZED");
  }
  console.log(resp.accessToken)
  cache.set(KEY_ACCESS_TOKEN, resp.accessToken);
  return resp.accessToken;
}

async function getAnswer(question, callback) {
  const accessToken = await getAccessToken();
  await fetchSSE("https://chat.openai.com/backend-api/conversation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      action: "next",
      messages: [
        {
          id: uuidv4(),
          role: "user",
          content: {
            content_type: "text",
            parts: [question],
          },
        },
      ],
      model: "text-davinci-002-render",
      parent_message_id: uuidv4(),
    }),
    onMessage(message) {
      console.debug("sse message", message);
      if (message === "[DONE]") {
        return;
      }
      const data = JSON.parse(message);
      const text = data.message?.content?.parts?.[0];
      if (text) {
        callback(text);
      }
    },
  });
}
Browser.runtime.onConnect.addListener((port) => {
  port.onMessage.addListener(async (msg) => {
    console.debug("received msg", msg);
    try {
      await getAnswer(msg.question, (answer) => {
        console.log("answer:" + answer);
        port.postMessage({ answer });
      });
    } catch (err) {
      console.error(err);
      port.postMessage({ error: err.message });
      cache.delete(KEY_ACCESS_TOKEN);
    }
  });
});
    ```

3. **stream-async-iterable.mjs**

    ```shell
    export async function* streamAsyncIterable(stream) {
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          return;
        }
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  }
    ```

Nectar.js aims to help you build AI based apps effortlessly 
try out some of our quick start templates above or below
