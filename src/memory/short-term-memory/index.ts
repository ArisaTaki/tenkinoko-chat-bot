import * as fs from "fs";
import * as path from "path";
import { Memory } from "../qdrant-memory/save";

const filePath = path.resolve(__dirname, "./short-term-memory.json");

export const saveShortTermMemory = (
  humanMessage: string,
  aiMessage: string
) => {
  let recentMessages: Memory[] = [];
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    recentMessages = JSON.parse(data);
  }

  // 保留最近5条对话
  if (recentMessages.length > 5) {
    recentMessages.shift();
  }
  recentMessages.push({ humanMessage, aiMessage });
  fs.writeFileSync(filePath, JSON.stringify(recentMessages, null, 2), "utf-8");
};

export const getShortTermMemory = async () => {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(data).map(
      (item: Memory) => `Huamn: ${item.humanMessage}\nAI: ${item.aiMessage}`
    );
  }
  return "";
};
