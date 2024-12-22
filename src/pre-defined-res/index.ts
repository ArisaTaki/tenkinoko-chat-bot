const predefinedRules = [
  {
    pattern: /你好|您好|嗨/i,
    response: "你好！很高兴见到你，有什么我可以帮助的吗？",
  },
  {
    pattern: /《天气之子》是关于什么的/i,
    response:
      "《天气之子》是一部由新海诚执导的电影，讲述了少年帆高和拥有天气操控能力的少女阳菜之间的故事。",
  },
  {
    pattern: /导演是谁/i,
    response: "《天气之子》的导演是新海诚。",
  },
];

export const ruleBasedResponse = (question: string) => {
  for (const rule of predefinedRules) {
    if (rule.pattern.test(question)) {
      return rule.response;
    }
  }
  return null; // 如果没有匹配规则，返回 null
};
