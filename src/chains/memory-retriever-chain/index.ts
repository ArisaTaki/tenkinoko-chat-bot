import { loadMemoryFromQdrant } from "@/memory/qdrant-memory/load";
import { RunnableSequence } from "@langchain/core/runnables";

export const getMemoryRetrieverChain = async () => {
  const memoryRetrieverChain = RunnableSequence.from([
    (input) => input.question,
    loadMemoryFromQdrant,
  ]);

  return memoryRetrieverChain;
};
