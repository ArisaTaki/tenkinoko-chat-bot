import { RunnableSequence } from "@langchain/core/runnables";
import { getShortTermMemory } from "../../../src/memory/short-term-memory";
export const getShortTermMemoryRetrieverChain = async () => {
  return RunnableSequence.from([
    (input) => input,
    async () => {
      const shortMemory = await getShortTermMemory();
      return shortMemory;
    },
  ]);
};
