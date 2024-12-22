import { createChatModel } from "@/model/openai/chat-model";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getContextRetrieverChain } from "../context-retriever-chain";
import { getMemoryRetrieverChain } from "../memory-retriever-chain";
import { getShortTermMemoryRetrieverChain } from "../short-term-memory-retriever-chain";
import { createAnswerTemplate } from "@/prompt-template/answer-template";

export const getLastRagChain = async () => {
  const model = await createChatModel();

  const contextRetrieverChain = await getContextRetrieverChain();

  const memoryRetrieverChain = await getMemoryRetrieverChain();

  const shortTermMemory = await getShortTermMemoryRetrieverChain();

  const prompt = createAnswerTemplate();

  const ragChain = RunnableSequence.from([
    {
      question: (input) => input.question,
      context: contextRetrieverChain,
      short_term_memory: shortTermMemory,
      chat_history: memoryRetrieverChain,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return ragChain;
};
