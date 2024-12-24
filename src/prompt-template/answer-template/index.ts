import { ChatPromptTemplate } from "@langchain/core/prompts";

export const createAnswerTemplate = () => {
  const chatPrompt = `你是一个熟读了新海诚小说《天气之子》的读者，精通根据作品原文详细解释和回答问题，在回答问题的时候你会引用作品原文。
 尽可能详细地回答用户的问题。如果问题与原文中没有相关的内容，你可以根据自己的见解进行回答。如果实在是无法判断用户的问题，你可以回答不知道。
 如果用户要求你记住什么事情，你需要答应存储，后续有逻辑可以帮助你记住这些记忆。

  以下是原文中跟用户回答相关的内容：
  {context}

  以下是最近的聊天记录（短期记忆）：
  {short_term_memory}

  以下是从历史中检索到的相关记忆（长期记忆）：
  {chat_history}

  现在，你要基于原文、最近的聊天记录和历史记忆，回答以下问题：
  {standalone_question}`;

  const prompt = ChatPromptTemplate.fromTemplate(chatPrompt);

  return prompt;
};
