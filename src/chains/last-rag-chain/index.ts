import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { getContextRetrieverChain } from "../context-retriever-chain";
import { createTemplate } from "../../prompt-template/answer-template";
import { getMemoryRetrieverChain } from "../memory-retriever-chain";
import { getShortTermMemoryChain } from "../../memory/short-term-memory";
import { createChatModel } from "../../model/openai/chat-model";

export const getLastRagChain = async () => {
  const model = await createChatModel();

  const contextRetrieverChain = await getContextRetrieverChain();

  const memoryRetrieverChain = await getMemoryRetrieverChain();

  const shortTermMemory = await getShortTermMemoryChain();

  const prompt = createTemplate();

  const ragChain = RunnableSequence.from([
    {
      context: contextRetrieverChain,
      short_term_memory: shortTermMemory,
      chat_history: memoryRetrieverChain,
      question: (input) => input.question,
    },
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return ragChain;
};
