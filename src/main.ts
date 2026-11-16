import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDefaultConfig, processLine } from "./transport/stdio.js";

try {
  const config = createDefaultConfig();
  const transport = new StdioServerTransport();
  transport.onmessage = (message) => {
    const out = processLine(JSON.stringify(message), config);
    if (out !== null) {
      void transport.send(JSON.parse(out)).catch(() => {});
    }
  };
  void transport.start().catch((error: unknown) => {
    console.error("ai-company-mcp: stdio transport failed:", error);
    process.exitCode = 1;
  });
} catch (error) {
  console.error("ai-company-mcp: startup failed:", error);
  process.exitCode = 1;
}
