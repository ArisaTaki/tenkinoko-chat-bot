import { predefinedRules } from "./rules";
import logger from "../utils/logger";

interface Rule {
  pattern: RegExp;
  response: string;
  priority: number;
}

export const ruleBasedResponse = (question: string) => {
  // 匹配所有规则
  const matchedRules: Rule[] = [];

  for (const rule of predefinedRules) {
    if (rule.pattern.test(question)) {
      matchedRules.push(rule);
    }
  }

  // 如果有匹配规则，按优先级排序并返回最高优先级的回答
  if (matchedRules.length > 0) {
    // 按优先级降序排序
    matchedRules.sort((a, b) => b.priority - a.priority);
    const topRule = matchedRules[0];

    logger.info(
      `规则引擎匹配成功: "${question}" -> 使用规则: ${topRule.pattern}`
    );
    return topRule.response;
  }

  logger.debug(`规则引擎没有匹配: "${question}"`);
  return null; // 如果没有匹配规则，返回 null
};
