# Project Context for AI

This is an MCP (Model Context Protocol) server project.

## Project Structure
- `src/`: Source code for the MCP server.
- `build/`: Compiled JavaScript output.
- `package.json`: Dependencies and scripts.

## Core Commands
- **Build**: `npm run build` - Compiles TypeScript to JavaScript.
- **Install**: `npm install` - Installs dependencies.

## Extending the Server
When asked to add a new tool:
1.  Read `src/index.ts` to see existing tool definitions.
2.  Use `server.tool()` to define the new tool using Zod schemas for input.
3.  Ensure you handle errors gracefully.
4.  Always run `npm run build` after modifying the source code.

## Debugging
- If the server fails to start in Claude Desktop, check the logs in Claude Desktop.
- Ensure the path in `claude_desktop_config.json` is absolute and correct.
- Verify that `node` is in the system PATH.
