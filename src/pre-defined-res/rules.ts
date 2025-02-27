/**
 * 预定义回答规则
 *
 * 每条规则包括：
 * - pattern: 匹配问题的正则表达式
 * - response: 对应的回答内容
 * - priority: 优先级，数字越大优先级越高
 */
export const predefinedRules = [
  {
    pattern: /《天气之子》是关于什么的/i,
    response:
      "《天气之子》是一部由新海诚执导的电影，讲述了少年帆高和拥有天气操控能力的少女阳菜之间的故事。",
    priority: 10,
  },
  {
    pattern: /导演是谁/i,
    response: "《天气之子》的导演是新海诚。",
    priority: 8,
  },
  {
    pattern: /你好|早上好|晚上好|你是谁/i,
    response: "你好！我是《天气之子》专家，可以回答你关于这部作品的任何问题。",
    priority: 5,
  },
  {
    pattern: /谢谢|感谢/i,
    response: "不客气，很高兴能帮到你！如果还有其他问题，随时可以问我。",
    priority: 5,
  },
];
