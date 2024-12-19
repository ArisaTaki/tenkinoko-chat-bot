import { ChatPromptTemplate } from "@langchain/core/prompts";

export const createTemplate = () => {
  const chatPrompt = `你是一个熟读了新海诚小说《天气之子》的读者，精通根据作品原文详细解释和回答问题，在回答问题的时候你会引用作品原文。
  并且在回答的时候仅根据原文来回答，尽可能详细地回答用户的问题。如果原文中没有相关内容，你可以根据情况自由回答，如果实在是无法判断用户的问题，你可以回答“这个问题我不知道”。

  以下是原文中跟用户回答相关的内容：
  {context}

  以下是最近的聊天记录（短期记忆）：
  {short_term_memory}

  以下是从历史中检索到的相关记忆（长期记忆）：
  {chat_history}

  现在，你要基于原文、最近的聊天记录和历史记忆，回答以下问题：
  {question}`;

  const prompt = ChatPromptTemplate.fromTemplate(chatPrompt);

  return prompt;
};
