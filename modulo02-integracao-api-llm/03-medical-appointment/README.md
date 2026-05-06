# Medical Appointment Agent

Projeto desenvolvido na pós-graduação **Engenharia de Software com IA Aplicada** com Erick Wendel.

Um agente de IA conversacional para agendamento e cancelamento de consultas médicas, construído com LangChain, LangGraph e OpenRouter.

---

## O que este projeto faz

O usuário escreve uma mensagem em linguagem natural — por exemplo:

> "Sou Henrique Hupp e quero cancelar uma consulta com Dr Carol amanhã às 10 da manhã"

O agente entende a intenção, executa a ação no sistema e responde também em linguagem natural:

> "Sua consulta com a Dra. Carol Gomes em 05 de maio de 2026 às 10h foi cancelada com sucesso."

---

## Conceitos aprendidos

### 1. JSON Prompt (Prompt Estruturado)
Em vez de enviar texto livre para o LLM, os prompts são enviados como **objetos JSON serializados**. Isso torna as instruções mais precisas e garante que o modelo retorne dados estruturados e validados.

```ts
// identifyIntent.ts
export const getUserPromptTemplate = (question: string) => {
  return JSON.stringify({
    question,
    instructions: [
      'Carefully analyze the question to determine the user intent',
      'Extract all relevant appointment details',
      // ...
    ]
  });
};
```

### 2. Structured Output com Zod
O retorno do LLM é validado com **Zod schemas**, garantindo type-safety de ponta a ponta. Se o modelo "alucinar" e retornar um campo errado, o Zod captura o erro antes de chegar no código de negócio.

```ts
export const IntentSchema = z.object({
  intent: z.enum(['schedule', 'cancel', 'unknown']),
  professionalId: z.number().optional(),
  datetime: z.string().optional(),
  patientName: z.string().optional(),
});
```

### 3. LangGraph (State Machine como Grafo)
O fluxo da aplicação é modelado como um **grafo de estados** com LangGraph. Cada nó do grafo é uma etapa do processamento, e as arestas definem para onde o fluxo segue com base no estado atual.

```
START
  └─► identifyIntentNode   ← LLM: entende a intenção e extrai dados
        ├─► schedulerNode  ← agenda a consulta
        ├─► cancellerNode  ← cancela a consulta
        └─► messageNode    ← LLM: gera resposta em linguagem natural
              └─► END
```

### 4. OpenRouter
O **OpenRouter** funciona como um roteador de LLMs — uma única API que dá acesso a dezenas de modelos (Gemma, DeepSeek, Minimax, etc.) com fallback automático. Aqui ele é integrado via `ChatOpenAI` do LangChain, apenas trocando a `baseURL`.

```ts
this.llmClient = new ChatOpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  modelName: 'google/gemma-4-31b-it',
  configuration: {
    baseURL: 'https://openrouter.ai/api/v1',
  },
});
```

### 5. Prompt Chaining (Duas chamadas ao LLM)
O projeto usa **duas chamadas encadeadas ao LLM** — cada uma com uma responsabilidade diferente:

| Chamada | Node | Entrada | Saída |
|---------|------|---------|-------|
| 1ª | `identifyIntentNode` | Texto do usuário | JSON estruturado com intent + dados |
| 2ª | `messageGeneratorNode` | Resultado da ação + cenário | Mensagem em linguagem natural |

Isso separa as responsabilidades: um LLM para **entender**, outro para **comunicar**.

---

## Arquitetura do projeto

```
src/
├── config.ts                        # Configuração do modelo e OpenRouter
├── server.ts                        # API HTTP com Fastify (POST /chat)
├── index.ts                         # Entry point
│
├── graph/
│   ├── graph.ts                     # Definição do grafo (StateGraph + edges)
│   ├── factory.ts                   # Instancia dependências e compila o grafo
│   └── nodes/
│       ├── identifyIntentNode.ts    # Nó 1: identifica intenção via LLM
│       ├── schedulerNode.ts         # Nó 2a: agenda consulta
│       ├── cancellerNode.ts         # Nó 2b: cancela consulta
│       └── messageGeneratorNode.ts  # Nó 3: gera resposta via LLM
│
├── prompts/v1/
│   ├── identifyIntent.ts            # System + User prompt para identificar intent
│   └── messageGenerator.ts         # System + User prompt para gerar resposta
│
└── services/
    ├── appointmentService.ts        # Regras de negócio (agendar, cancelar, verificar)
    └── openRouterService.ts         # Cliente LLM com structured output
```

---

## Fluxo completo passo a passo

```
1. POST /chat { question: "Quero cancelar minha consulta com Dr Carol amanhã às 10h" }
        ↓
2. identifyIntentNode
   - Monta prompt JSON com a pergunta + lista de profissionais
   - Chama o LLM (Gemma via OpenRouter)
   - LLM retorna JSON validado pelo Zod:
     { intent: "cancel", professionalId: 3, datetime: "2026-05-05T10:00:00Z", patientName: "Henrique Hupp" }
        ↓
3. Roteamento condicional (addConditionalEdges)
   - intent === "cancel" → vai para cancellerNode
        ↓
4. cancellerNode
   - Valida campos obrigatórios com Zod
   - Chama appointmentService.cancelAppointment(...)
   - Retorna { actionSuccess: true }
        ↓
5. messageGeneratorNode
   - Monta prompt com cenário "cancel_success" + detalhes da consulta
   - Chama o LLM novamente
   - LLM retorna: { message: "Sua consulta foi cancelada com sucesso!" }
        ↓
6. Resposta final: AIMessage com texto em linguagem natural
```

---

## Como rodar

### Pré-requisitos
- Node.js >= 24.10.0
- Conta no [OpenRouter](https://openrouter.ai) com API Key

### Instalação

```bash
npm install
```

### Variáveis de ambiente

Crie um arquivo `.env` na raiz:

```env
OPENROUTER_API_KEY=sua_chave_aqui
```

### Rodando o servidor

```bash
npm run dev
```

### Testando com curl

```bash
# Agendar consulta
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Quero agendar uma consulta com Dr. Alicio da Silva amanhã às 14h para check-up. Meu nome é João."}'

# Cancelar consulta
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "Sou Henrique Hupp e quero cancelar minha consulta com Dra Carol amanhã às 10h."}'
```

### Visualizando o grafo no LangChain Studio

```bash
npm run langgraph:serve
```

Acesse `http://localhost:2024` para ver o grafo visualmente e testar as mensagens.

### Rodando os testes

```bash
# Todos os testes
npm test

# Apenas e2e
npm run test:e2e

# Apenas unitários
npm run test:unit
```

---

## Profissionais disponíveis (dados mockados)

| ID | Nome | Especialidade |
|----|------|---------------|
| 1  | Dr. Alicio da Silva | Cardiologia |
| 2  | Dra. Ana Pereira | Dermatologia |
| 3  | Dra. Carol Gomes | Neurologia |
