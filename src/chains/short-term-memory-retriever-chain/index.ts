import { getShortTermMemory } from "@/memory/short-term-memory";
import { RunnableSequence } from "@langchain/core/runnables";
export const getShortTermMemoryRetrieverChain = async () => {
  return RunnableSequence.from([
    (input) => input,
    async () => {
      const shortMemory = await getShortTermMemory();
      return shortMemory;
    },
  ]);
};
