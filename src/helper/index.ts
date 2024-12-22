export interface JudgmentResult {
  coreIntent: string;
  important: boolean;
  reason: string;
}

export const parseJudgmentResult = (result: string): JudgmentResult => {
  const intentLine = result.match(/核心意图：(.*)/)?.[1]?.trim();
  const storageLine = result.match(/是否需要存入长期记忆：(.*)/)?.[1]?.trim();
  const reasonLine = result.match(/原因：(.*)/)?.[1]?.trim();

  return {
    coreIntent: intentLine || "",
    important: storageLine === "是", // 判断是否存储
    reason: reasonLine || "",
  };
};

export const isImportantMessage = (humanMessage: string) => {
  // 如果用户输入是打招呼或常见问题，直接判断为不重要
  const greetingKeywords = ["你好", "嗨", "您好", "早上好", "晚上好"];
  const importanceKeywords = [
    "重要",
    "关键",
    "核心",
    "记住",
    "我叫",
    "我是",
    "我要",
  ];
  if (
    greetingKeywords.some((kw) => humanMessage.includes(kw)) &&
    !importanceKeywords.some((importanceKey) =>
      humanMessage.includes(importanceKey)
    )
  ) {
    return false; // 直接排除寒暄性质的对话，除非用户提到了个人信息或者特别说明了很重要
  }

  // 如果有其他排除规则，也可以在这里添加
  return true; // 否则认为是重要的
};
