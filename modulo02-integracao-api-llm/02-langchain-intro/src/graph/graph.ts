import {
  END,
  MessagesZodMeta,
  START,
  StateGraph,
} from '@langchain/langgraph'
import { withLangGraph } from '@langchain/langgraph/zod'
import { BaseMessage } from 'langchain'
import { z } from 'zod/v3'
import { identifyIntent } from './nodes/identifyIntentNode.ts'
import { chatResponseNode } from './nodes/chatResponseNode.ts'
import { upperCaseNode } from './nodes/upperCaseNode.ts'
import { lowerCaseNode } from './nodes/lowerCaseNode.ts'
import { fallbackNode } from './nodes/fallbackNode.ts'

const GraphState = z.object({
  messages: withLangGraph(
    z.custom<BaseMessage[]>(),
    MessagesZodMeta
  ),
  output: z.string(),
  command: z.enum(['uppercase', 'lowercase', 'unknown'])
})

export type GraphState = z.infer<typeof GraphState>

export function buildGraph() {
  const workflow = new StateGraph({
    state: GraphState
  })

  // .addNode('identifyIntent', (state: GraphState) => {
  //   // Implementation for identifyIntent node

  //   return {
  //     ...state,
  //     output: 'ihe heeeu',
  //   }
  // })

  .addNode('identifyIntent', identifyIntent)
  .addNode('chatResponse', chatResponseNode)
  .addNode('uppercase', upperCaseNode)
  .addNode('lowercase', lowerCaseNode)
  .addNode('fallback', fallbackNode)

  .addEdge(START, 'identifyIntent')
    .addConditionalEdges(
    'identifyIntent',
    (state: GraphState) => {
      switch (state.command) {
        case 'uppercase':
          return 'uppercase'
        case 'lowercase':
          return 'lowercase'
        default:
          return 'fallback'
      }
    },
    {
      uppercase: 'uppercase',
      lowercase: 'lowercase',
      fallback: 'fallback',
    },
  )
  .addEdge('lowercase', 'chatResponse')
  .addEdge('uppercase', 'chatResponse')
  .addEdge('fallback', 'chatResponse')
  .addEdge('chatResponse', END)

  return workflow.compile()
}
