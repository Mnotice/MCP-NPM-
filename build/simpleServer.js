import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
const server = new McpServer({
    name: 'simple-weather-server',
    version: '1.0.0',
    capabilities: {
        resources: {},
        tools: {},
    },
});
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('Simple Weather MCP Server running on stdio');
}
main().catch((error) => {
    console.error('Fatal error in main():', error);
    process.exit(1);
});
