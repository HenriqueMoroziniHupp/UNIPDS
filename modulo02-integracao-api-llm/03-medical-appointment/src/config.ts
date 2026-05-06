export type ModelConfig = {
  apiKey: string;
  httpReferer: string;
  xTitle: string;

  provider: {
    sort: {
      by: string;
      partition: string;
    };
  };

  models: string[];
  temperature: number;
};

console.assert(process.env.OPENROUTER_API_KEY, 'OPENROUTER_API_KEY is not set in environment variables');

export const config: ModelConfig = {
  apiKey: process.env.OPENROUTER_API_KEY!,
  httpReferer: '',
  xTitle: 'IA Devs - Prompt Chaining Article Generator',
  models: [
    // 'minimax/minimax-m2.5:free'
    // 'inclusionai/ling-2.6-1t:free'
    // 'inclusionai/ling-2.6-1t:free'
    // 'deepseek/deepseek-v4-flash'
    'google/gemma-4-31b-it'
    // 'qwen/qwen3.5-9b'
  ],
  provider: {
    sort: {
      by: 'throughput', // Route to model with highest throughput (fastest response)
      partition: 'none',
    },
  },
  temperature: 0.7,
};
