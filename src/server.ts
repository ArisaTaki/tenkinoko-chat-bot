import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { runRAG } from "./index";

const app = express();
const port = 3000;

// 中间件
app.use(bodyParser.json());
app.use(cors());

// 定义一个 POST 路由来处理请求
app.post("/api/run-rag", async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuidv4, question } = req.body;

    // 参数校验
    if (!uuidv4 || !question) {
      res
        .status(400)
        .json({ error: "Missing uuidv4 or question in request body." });
      return;
    }

    // 调用 runRAG 方法
    const result = await runRAG(uuidv4, question);

    // 成功返回
    res.status(200).json({ message: result });
  } catch (error) {
    console.error("Error running RAG:", error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
