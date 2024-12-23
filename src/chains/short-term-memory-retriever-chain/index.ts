import { RunnableSequence } from "@langchain/core/runnables";
import { getShortTermMemory } from "../../../src/memory/short-term-memory";
export const getShortTermMemoryRetrieverChain = async (uuidv4: string) => {
  return RunnableSequence.from([
    (input) => input,
    async () => {
      const shortMemory = await getShortTermMemory(uuidv4);
      return shortMemory;
    },
  ]);
};
