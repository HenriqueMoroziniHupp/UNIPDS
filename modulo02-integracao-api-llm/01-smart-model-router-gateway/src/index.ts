import { createServer } from "./server.ts";
import { config } from "./config.ts";
import { OpenRouterService } from "./openRouterService.ts";

const routerService = new OpenRouterService(config);
const app = createServer(routerService);

await app.listen({ port: 3000, host: "0.0.0.0" });

app.inject({
  method: "POST",
  url: "/chat",
  body: { question: "What is the capital of France?" }
}).then(response => {
  console.log('🎉Response status', response.statusCode)
  console.log('🚀Response body', response.body)
  // console.log("Response from /chat route:", response.json());
}).catch(error => {
  console.error("👹Error during test request to /chat route:", error);
});