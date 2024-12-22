import { RunnableSequence } from "@langchain/core/runnables";
import { loadMemoryFromQdrant } from "../../memory/qdrant-memory/load";

export const getMemoryRetrieverChain = async () => {
  const memoryRetrieverChain = RunnableSequence.from([
    (input) => input.question,
    loadMemoryFromQdrant,
  ]);

  return memoryRetrieverChain;
};
