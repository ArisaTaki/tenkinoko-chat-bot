// loadMemoryFromQdrant.ts
import { createMemoryFromQdrant } from "../create";

export const loadMemoryFromQdrant = async (prompt: string, uuidv4: string) => {
  const memory = await createMemoryFromQdrant(uuidv4);
  const res = await memory.loadMemoryVariables({ prompt });

  return res["ten_ki_no_ko_history"];
};
