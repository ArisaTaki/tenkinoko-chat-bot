#!/usr/bin/env node

/**
 * 测试脚本 - 测试RAG API的流式响应
 */

// 配置
const config = {
  port: process.env.PORT || 9000,
  host: process.env.HOST || "localhost",
  timeout: 30000, // 请求超时时间（毫秒）
  question: process.argv[2] || "你是做什么的？", // 可以通过命令行参数传入问题
  uuid: process.argv[3] || "test", // 可以通过命令行参数传入UUID
};

// 添加超时控制的fetch函数
async function fetchWithTimeout(url, options, timeout = 30000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 从SSE数据中提取内容
function parseSSEData(data) {
  const lines = data.split("\n");
  const result = {};

  let currentKey = "";
  let currentValue = "";

  for (const line of lines) {
    if (line.startsWith("event:")) {
      currentKey = "event";
      currentValue = line.substring(6).trim();
      result[currentKey] = currentValue;
    } else if (line.startsWith("data:")) {
      currentKey = "data";
      currentValue = line.substring(5).trim();
      result[currentKey] = currentValue;
    } else if (line === "" && currentKey) {
      // 空行表示一个完整的消息
      currentKey = "";
    }
  }

  return result;
}

// 使用颜色格式化输出
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

// 流式获取数据
async function fetchStream() {
  const url = `http://${config.host}:${config.port}/api/run-rag`;
  console.log(
    `${colors.bright}${colors.blue}正在连接到 ${url}...${colors.reset}`
  );
  console.log(
    `${colors.cyan}使用问题: "${config.question}", UUID: "${config.uuid}"${colors.reset}`
  );

  try {
    // 首先检查健康状态
    console.log(`${colors.bright}正在检查API健康状态...${colors.reset}`);
    try {
      const healthResponse = await fetchWithTimeout(
        `http://${config.host}:${config.port}/health`,
        { method: "GET" },
        5000
      );

      if (healthResponse.ok) {
        const healthData = await healthResponse.json();
        console.log(
          `${colors.green}健康检查结果:${colors.reset}`,
          JSON.stringify(healthData, null, 2)
        );
      } else {
        console.warn(
          `${colors.yellow}健康检查失败: HTTP ${healthResponse.status}${colors.reset}`
        );
      }
    } catch (healthError) {
      console.warn(
        `${colors.yellow}健康检查请求失败:${colors.reset}`,
        healthError.message
      );
    }

    // 发送实际RAG请求
    console.log(
      `${colors.bright}${colors.blue}正在发送RAG请求...${colors.reset}`
    );
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify({
          question: config.question,
          uuidv4: config.uuid,
        }),
      },
      config.timeout
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP错误: ${response.status} - ${errorText}`);
    }

    console.log(`${colors.green}成功连接，开始接收流式响应...${colors.reset}`);

    // 获取并解码响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let totalReceived = 0;
    let contentReceived = 0;

    // 显示一个进度指示器
    const spinner = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
    let spinnerIndex = 0;
    let spinnerTimer = null;

    // 启动spinner
    if (process.stdout.isTTY) {
      spinnerTimer = setInterval(() => {
        process.stdout.write(`\r${spinner[spinnerIndex]} 接收中...`);
        spinnerIndex = (spinnerIndex + 1) % spinner.length;
      }, 100);
    }

    // 打印文本内容并更新进度
    const printContent = (content) => {
      if (spinnerTimer) {
        clearInterval(spinnerTimer);
        process.stdout.write("\r                      \r"); // 清除spinner
        spinnerTimer = null;
      }
      process.stdout.write(content);
      contentReceived += content.length;

      // 重新启动spinner
      if (process.stdout.isTTY && !spinnerTimer) {
        spinnerTimer = setInterval(() => {
          process.stdout.write(`\r${spinner[spinnerIndex]} 接收中...`);
          spinnerIndex = (spinnerIndex + 1) % spinner.length;
        }, 100);
      }
    };

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalReceived += value.length;
      buffer += decoder.decode(value, { stream: true });

      // 尝试从buffer中提取完整的SSE消息
      const messages = buffer.split("\n\n");

      // 处理所有完整的消息，保留最后一个可能不完整的消息
      if (messages.length > 1) {
        for (let i = 0; i < messages.length - 1; i++) {
          const message = messages[i];
          if (message.trim()) {
            const parsed = parseSSEData(message);

            // 根据事件类型处理
            if (parsed.event === "start") {
              console.log(`${colors.cyan}${parsed.data}${colors.reset}`);
            } else if (parsed.event === "error") {
              try {
                const errorData = JSON.parse(parsed.data);
                console.error(
                  `${colors.red}错误: ${errorData.message}${colors.reset}`
                );
              } catch (e) {
                console.error(
                  `${colors.red}错误: ${parsed.data}${colors.reset}`
                );
              }
            } else if (parsed.event === "complete") {
              console.log(`\n${colors.green}${parsed.data}${colors.reset}`);
            } else if (parsed.data) {
              // 这是实际内容
              printContent(parsed.data);
            }
          }
        }
        // 保留最后一个可能不完整的片段
        buffer = messages[messages.length - 1];
      }
    }

    // 停止spinner
    if (spinnerTimer) {
      clearInterval(spinnerTimer);
      process.stdout.write("\r                      \r"); // 清除spinner
    }

    // 处理buffer中剩余的内容
    if (buffer.trim()) {
      const parsed = parseSSEData(buffer);
      if (parsed.data) {
        console.log(parsed.data);
      }
    }

    console.log(
      `\n${colors.bright}${colors.green}✅ 流式响应结束，共接收 ${totalReceived} 字节数据，显示了 ${contentReceived} 字节内容${colors.reset}`
    );
  } catch (error) {
    console.error(
      `\n${colors.bright}${colors.red}❌ 请求错误: ${error.message}${colors.reset}`
    );
    if (error.name === "AbortError") {
      console.error(
        `${colors.red}请求超时，超时设置为 ${config.timeout / 1000} 秒${
          colors.reset
        }`
      );
    }
  }
}

fetchStream();
