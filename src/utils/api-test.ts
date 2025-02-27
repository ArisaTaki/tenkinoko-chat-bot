/**
 * 服务API测试工具
 * 用于检测各种外部API连接是否正常
 */

import fetch from "node-fetch";
import logger from "./logger";
import { MODEL_CONFIG, MEMORY_CONFIG } from "./config";

/**
 * 测试OpenAI API连接
 * @returns {Promise<boolean>} 连接是否成功
 */
export const testOpenAIConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${MODEL_CONFIG.OPENAI_API_URL}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${MODEL_CONFIG.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      logger.info("OpenAI API连接测试成功");
      return true;
    } else {
      const errorText = await response.text();
      logger.error(
        `OpenAI API连接失败: HTTP ${response.status} - ${errorText}`
      );
      return false;
    }
  } catch (error) {
    logger.error("OpenAI API连接测试出错:", error);
    return false;
  }
};

/**
 * 测试Qdrant连接
 * @returns {Promise<boolean>} 连接是否成功
 */
export const testQdrantConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${MEMORY_CONFIG.QDRANT_URL}`, {
      method: "GET",
    });

    if (response.ok) {
      logger.info("Qdrant API连接测试成功");
      return true;
    } else {
      const errorText = await response.text();
      logger.error(
        `Qdrant API连接失败: HTTP ${response.status} - ${errorText}`
      );
      return false;
    }
  } catch (error) {
    logger.error("Qdrant API连接测试出错:", error);
    return false;
  }
};

/**
 * 测试所有外部服务连接
 * @returns {Promise<{openai: boolean, qdrant: boolean}>} 各服务连接状态
 */
export const testAllConnections = async () => {
  const openaiStatus = await testOpenAIConnection();
  const qdrantStatus = await testQdrantConnection();

  logger.info("API连接测试结果:", {
    openai: openaiStatus ? "正常" : "异常",
    qdrant: qdrantStatus ? "正常" : "异常",
  });

  return {
    openai: openaiStatus,
    qdrant: qdrantStatus,
  };
};
