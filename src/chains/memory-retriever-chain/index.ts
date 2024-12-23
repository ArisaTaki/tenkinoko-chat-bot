import { RunnableSequence } from "@langchain/core/runnables";
import { loadMemoryFromQdrant } from "../../memory/qdrant-memory/load";

export const getMemoryRetrieverChain = async (uuidv4: string) => {
  const memoryRetrieverChain = RunnableSequence.from([
    (input) => input,
    (input) => {
      loadMemoryFromQdrant(input, uuidv4);
    },
  ]);

  return memoryRetrieverChain;
};
