// saveMemoryToQdrant.ts
import { createMemoryFromQdrant } from "./createMemoryFromQdrant";

export interface Memory {
  humanMessage: string;
  aiMessage: string;
}

export const saveMemoryToQdrant = async (messages: Memory) => {
  const memory = await createMemoryFromQdrant();
  await memory.saveContext(
    { input: messages.humanMessage },
    { output: messages.aiMessage }
  );
};
