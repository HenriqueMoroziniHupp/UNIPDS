import { AIMessage } from "langchain";
import type { GraphState } from "../graph.ts";

export function fallbackNode(state: GraphState): GraphState {
  const message = "I'm sorry, I didn't understand that command. Try including 'upper' or 'lower' in your message to transform the text accordingly.";
  const outputFallback = new AIMessage(message).content.toString()

  return {
    ...state,
    output: outputFallback,
    messages: [...state.messages],
  }
}
