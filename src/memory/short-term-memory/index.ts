import { RunnableSequence } from "@langchain/core/runnables";
import { Memory } from "../qdrant-memory/save";

let recentMessages: Memory[] = [];

export const saveShortTermMemory = (
  humanMessage: string,
  aiMessage: string
) => {
  if (recentMessages.length >= 5) {
    recentMessages.shift(); // 保留最近 5 条对话
  }
  recentMessages.push({ humanMessage, aiMessage });
};

const getShortTermMemory = async () => {
  return recentMessages
    .map((msg) => `Human: ${msg.humanMessage}\nAI: ${msg.aiMessage}`)
    .join("\n");
};

export const getShortTermMemoryChain = async () => {
  return RunnableSequence.from([() => {}, getShortTermMemory]);
};
