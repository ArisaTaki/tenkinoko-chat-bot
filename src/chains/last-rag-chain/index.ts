import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnablePassthrough,
  RunnableSequence,
} from "@langchain/core/runnables";
import { getContextRetrieverChain } from "../context-retriever-chain";
import { createAnswerTemplate } from "../../prompt-template/answer-template";
import { getMemoryRetrieverChain } from "../memory-retriever-chain";
import { getShortTermMemoryRetrieverChain } from "../short-term-memory-retriever-chain";
import { createChatModel } from "../../model/openai/chat-model";
import { getRephraseChain } from "../rephrase-chain";

export const getLastRagChain = async (uuidv4: string) => {
  const model = await createChatModel();

  const contextRetrieverChain = await getContextRetrieverChain();

  const memoryRetrieverChain = await getMemoryRetrieverChain(uuidv4);

  const shortTermMemoryChain = await getShortTermMemoryRetrieverChain(uuidv4);

  const rephraseChain = await getRephraseChain(uuidv4);

  const prompt = createAnswerTemplate();

  const ragChain = RunnableSequence.from([
    (input) => input.question,
    RunnablePassthrough.assign({
      standalone_question: rephraseChain,
      context: contextRetrieverChain,
      short_term_memory: shortTermMemoryChain,
      chat_history: memoryRetrieverChain,
    }),
    prompt,
    model,
    new StringOutputParser(),
  ]);

  return ragChain;
};
