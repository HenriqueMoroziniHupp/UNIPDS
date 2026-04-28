import test from "node:test";
import assert from "node:assert/strict";
import { createServer } from "../src/server.ts";


console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not set in env variables",
);

test("command upper transform message into UPPERCASE", async () => {
  const app = createServer();
  const msg = 'make this message UPPER plese!';
  const expected = msg.toLocaleUpperCase();

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    body: { question: msg },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);

});

test("command lower transform message into lowercase", async () => {
  const app = createServer();
  const msg = 'MAKE THIS MESSAGE LOWER PLESE!';
  const expected = msg.toLocaleLowerCase();

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    body: { question: msg },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);

});

test("unknown command returns fallback message", async () => {
  const app = createServer();
  const msg = 'make this message something else!';
  const expected = "I'm sorry, I didn't understand that command. Try including 'upper' or 'lower' in your message to transform the text accordingly.";

  const response = await app.inject({
    method: "POST",
    url: "/chat",
    body: { question: msg },
  });
  assert.equal(response.statusCode, 200);
  assert.equal(response.body, expected);

});
