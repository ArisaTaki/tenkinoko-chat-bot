import express, { Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runRAG } from "./index";
import logger from "./utils/logger";
import { SERVER_CONFIG, APP_CONFIG } from "./utils/config";
import { testAllConnections } from "./utils/api-test";

// 扩展Request接口，添加id字段
declare global {
  namespace Express {
    interface Request {
      id?: string;
    }

    interface Response {
      flush?: () => void;
    }
  }
}

const app = express();
const { PORT, HOST } = SERVER_CONFIG;

// 请求跟踪中间件
app.use((req: Request, res: Response, next: NextFunction) => {
  // 为每个请求添加唯一ID用于跟踪
  req.id = Date.now().toString();
  logger.info(`收到请求: ${req.method} ${req.url}`, { requestId: req.id });
  next();
});

// 中间件
app.use(bodyParser.json());
app.use(cors());

// 健康检查端点
app.get("/health", async (req: Request, res: Response) => {
  try {
    const apiStatus = await testAllConnections();

    res.status(200).json({
      status: "OK",
      timestamp: new Date().toISOString(),
      version: APP_CONFIG.VERSION,
      apis: {
        openai: apiStatus.openai ? "正常" : "异常",
        qdrant: apiStatus.qdrant ? "正常" : "异常",
      },
    });
  } catch (error) {
    logger.error("健康检查出错:", error);
    res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// 添加API路由
app.post("/api/run-rag", (req: Request, res: Response) => {
  const requestId = req.id || "unknown";
  logger.info(`处理RAG请求 [${requestId}]`);

  const { uuidv4, question } = req.body;

  if (!uuidv4 || !question) {
    logger.warn(`API请求缺少uuidv4或question参数 [${requestId}]`);
    return res
      .status(400)
      .json({ error: "Missing uuidv4 or question in request body." });
  }

  // 设置SSE响应头
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // 禁用Nginx缓冲

  // 发送SSE开始事件
  res.write("event: start\ndata: 开始处理问题\n\n");
  // 安全地调用flush方法（如果存在）
  if (typeof res.flush === "function") {
    res.flush();
  }

  let hasError = false;

  // 使用Promise处理异步操作
  runRAG(
    uuidv4,
    question,
    (chunk: string) => {
      // 回调：每次有新数据时写入响应
      if (!hasError && !res.headersSent) {
        try {
          // 格式化为SSE数据包
          res.write(`data: ${chunk}\n\n`);
          // 如果有flush方法则调用（某些Express版本支持）
          if (typeof res.flush === "function") {
            res.flush();
          }
          logger.debug(`响应数据块已发送 [${requestId}]: ${chunk.length} 字节`);
        } catch (error) {
          logger.error(`写入响应失败 [${requestId}]:`, error);
        }
      }
    },
    () => {
      // 回调：流完成时关闭连接
      if (!hasError) {
        try {
          // 发送完成事件
          res.write("event: complete\ndata: 处理完成\n\n");
          res.end();
          logger.info(`响应已完成 [${requestId}]`);
        } catch (error) {
          logger.error(`关闭响应流失败 [${requestId}]:`, error);
        }
      }
    },
    (error: Error) => {
      // 回调：发生错误时记录错误并关闭连接
      hasError = true;
      logger.error(`RAG处理过程中出错 [${requestId}]:`, error);
      try {
        // 发送错误事件
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: error.message,
          })}\n\n`
        );
        res.end();
      } catch (sendError) {
        logger.error(`发送错误响应失败 [${requestId}]:`, sendError);
      }
    }
  ).catch((error) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`初始化RAG时出错 [${requestId}]:`, { error: errorMessage });
    if (!res.headersSent) {
      try {
        // 发送错误事件
        res.write(
          `event: error\ndata: ${JSON.stringify({
            message: "Internal server error",
          })}\n\n`
        );
        res.end();
      } catch (sendError) {
        logger.error(`发送错误响应失败 [${requestId}]:`, sendError);
      }
    }
  });
});

// 捕获 404 错误
app.use((req: Request, res: Response) => {
  logger.warn(`404: 未找到路由 - ${req.method} ${req.url}`);
  res.status(404).send("Not Found");
});

// 全局错误处理
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logger.error("服务器错误:", err);
  res.status(500).send("Internal Server Error");
});

// 启动服务器并进行API连接测试
const startServer = async () => {
  try {
    // 测试外部API连接
    logger.info("正在测试外部API连接...");
    const apiStatus = await testAllConnections();

    // 启动服务器
    app.listen(PORT, () => {
      logger.info(`服务器已在 http://${HOST}:${PORT} 启动`);
      logger.info(`健康检查: http://${HOST}:${PORT}/health`);

      // 显示API状态
      logger.info("外部API连接状态:", {
        openai: apiStatus.openai ? "正常" : "异常",
        qdrant: apiStatus.qdrant ? "正常" : "异常",
      });

      // 如果有API连接异常，记录警告
      if (!apiStatus.openai || !apiStatus.qdrant) {
        logger.warn("部分外部API连接异常，系统功能可能受限");
      }
    });
  } catch (error) {
    logger.error("启动服务器失败:", error);
    process.exit(1);
  }
};

// 启动应用
startServer();
