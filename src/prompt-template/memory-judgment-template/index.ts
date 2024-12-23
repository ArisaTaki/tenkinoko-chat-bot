import { ChatPromptTemplate } from "@langchain/core/prompts";
export const createMemoryJudgmentTemplate = () => {
  const judgmentPrompt = `你是一个负责分析对话内容的重要性和价值的助手。
    请根据以下对话判断是否需要存储到长期记忆中。存储的标准如下：
    1. 如果对话包含对后续对话有帮助的信息，或包含关键的核心意图，请存入长期记忆。
    2. 如果对话是常见问题、无关的信息，或仅仅是寒暄性质的对话，请不要存入长期记忆。
    3. 请重点根据Human后面的内容进行判断，用户如果提到了需要记住的信息，也请存入长期记忆。
  
    对话内容如下：
    Human: {human_message}
    AI: {ai_message}
    
    请完成以下任务：
    1. 提取用户的核心意图。
    2. 判断这次对话是否需要存储到长期记忆，并说明原因。
  
    请使用以下格式输出：
    核心意图：<这里写核心意图>
    是否需要存入长期记忆：<是/否>
    原因：<这里写存储或不存储的原因>`;

  return ChatPromptTemplate.fromTemplate(judgmentPrompt);
};
