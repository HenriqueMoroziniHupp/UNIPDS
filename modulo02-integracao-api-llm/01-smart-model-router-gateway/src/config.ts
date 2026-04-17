console.assert(
  process.env.OPENROUTER_API_KEY,
  "OPENROUTER_API_KEY is not defined in the environment variables.",
);

export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;
  port: number;
  models: string[];
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };
};

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: "https://your-domain.com",
  xTitle: "SmartModelRouterGateway",
  port: 3000,
  models: [
    'google/gemma-4-26b-a4b-it:free',
    'openrouter/elephant-alpha'
  ],
  temperature: 0.2,
  maxTokens: 50,
  systemPrompt: "You are a helpful assistant.",
  provider: {
    sort: {
      // by: "throughput",
      // by: 'latency',
      by: 'price',
      partition: "none",
    },
  },
};
