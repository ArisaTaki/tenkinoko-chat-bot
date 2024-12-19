// loadMemoryFromQdrant.ts
import { createMemoryFromQdrant } from "../create";

export const loadMemoryFromQdrant = async (prompt: string) => {
  const memory = await createMemoryFromQdrant();
  const res = await memory.loadMemoryVariables({ prompt });
  return res["ten_ki_no_ko_history"];
};
