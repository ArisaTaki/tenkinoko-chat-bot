import { ChatPromptTemplate } from "@langchain/core/prompts";

export const createSummaryPrompt = () => {
  const prompt = `你是一个负责生成对话摘要的助手。
  请根据以下对话生成简短且概括的摘要，保留对话的核心信息。

  对话内容如下：
  Human: {human_message}
  AI: {ai_message}

  输出格式：
  对话摘要：<这里写摘要>`;

  return ChatPromptTemplate.fromTemplate(prompt);
};
