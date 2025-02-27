import * as fs from "fs";
import * as path from "path";
import { Memory } from "../qdrant-memory/save";
import { MEMORY_CONFIG } from "../../utils/config";
import logger from "../../utils/logger";

export const saveShortTermMemory = (
  humanMessage: string,
  aiMessage: string,
  uuidv4: string
) => {
  const filePath = path.resolve(__dirname, `./${uuidv4}.json`);

  let recentMessages: Memory[] = [];
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      recentMessages = JSON.parse(data);
    }

    // 保留最近N条对话
    const maxCount = MEMORY_CONFIG.SHORT_TERM_MEMORY_MAX_COUNT;
    if (recentMessages.length >= maxCount) {
      recentMessages.shift();
    }
    recentMessages.push({ humanMessage, aiMessage });
    fs.writeFileSync(
      filePath,
      JSON.stringify(recentMessages, null, 2),
      "utf-8"
    );
    logger.debug(
      `短期内存已保存: ${uuidv4}, 当前记忆条数: ${recentMessages.length}`
    );
  } catch (error) {
    logger.error(`保存短期内存失败: ${uuidv4}`, error);
  }
};

export const getShortTermMemory = async (uuidv4: string) => {
  const filePath = path.resolve(__dirname, `./${uuidv4}.json`);
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const memories = JSON.parse(data).map(
        (item: Memory) => `Human: ${item.humanMessage}\nAI: ${item.aiMessage}`
      );
      logger.debug(`已获取短期内存: ${uuidv4}, 记忆条数: ${memories.length}`);
      return memories;
    }
  } catch (error) {
    logger.error(`获取短期内存失败: ${uuidv4}`, error);
  }
  return "";
};
