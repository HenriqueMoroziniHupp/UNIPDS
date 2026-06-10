import { PromptTemplate } from '@langchain/core/prompts';
import { OpenRouterService } from '../../services/openrouterService.ts';
import type { GraphState } from '../state.ts';
import { getUser, prompts } from '../../config.ts';

export const createGuardrailsCheckNode = (openRouterService: OpenRouterService) => {
    return async (state: GraphState): Promise<Partial<GraphState>> => {
        try {
            // fallback to study (use on run langgraph)
            const user = state.user ?? getUser('ananeri')!;
            const guardrailsEnabled = state.user ? state.guardrailsEnabled : true;

            const userPrompt = state.messages.at(-1)?.text!
            const template = PromptTemplate.fromTemplate(prompts.system)

            const systemPrompt = await template.format({
                USER_NAME: user.displayName,
                USER_ROLE: user.role,
            });

            const message = systemPrompt.concat('\n\nUser Prompt: ', userPrompt)

            const result = await openRouterService.checkGuardRails(message, guardrailsEnabled)

            return {
                user,
                guardrailsEnabled,
                guardrailCheck: result
            };
        } catch (error) {
            console.error('Guardrails check failed:', error);

            return {
                guardrailCheck: {
                    safe: false,
                    reason: 'Guardrails check failed due to an error. Request blocked by safety.',
                }
            };
        }
    }
}
