import Fastify from "fastify";
import { OpenRouterService } from "./openRouterService.ts";

export const createServer = (routerService: OpenRouterService) => {
  const app = Fastify();

  app.post("/chat", {
    schema: {
      body: {
        type: "object",
        required: ["question"],
        properties: {
          question: { type: "string", minLength: 5 },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { question } = request.body as { question: string };
      const response = await routerService.generate(question);
      console.log("🦄 response", response);
      console.log("🌮 question", question);

      // Simulate a response from an AI model
      const answer = `You asked: "${response}". This is a simulated response.`;
      return reply.send(response);
    } catch (error) {
      console.log("error on /chat route", error);
      reply.status(500).send({ error: "An error occurred while processing your request." });
    }
  });

  return app
};
