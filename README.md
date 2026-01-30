# MCP Server Template

A production-ready template for building Model Context Protocol (MCP) servers. This project is configured to work seamlessly with Claude Desktop and other MCP clients.

## Features

- **TypeScript Support**: Fully typed environment for building robust tools.
- **Auto-Build**: Configured for easy compilation.
- **Extensible**: Simple pattern for adding new tools and capabilities.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1.  Clone the repository:

    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Build the project:
    ```bash
    npm run build
    ```

## Usage

### Local Usage with Claude Desktop

To use this server with Claude Desktop, you need to add it to your `claude_desktop_config.json`.

1.  Locate your `claude_desktop_config.json`:
    - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
    - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

2.  Add the server configuration. A helpful template is provided in [`claude_desktop_config.json`](./claude_desktop_config.json) in this repository.

    ```json
    {
      "mcpServers": {
        "my-server": {
          "command": "node",
          "args": ["/ABSOLUTE/PATH/TO/PROJECT/build/index.js"]
        }
      }
    }
    ```

    _Note: Make sure to replace `/ABSOLUTE/PATH/TO/PROJECT/` with the actual full path to this directory._

3.  Restart Claude Desktop.

### Adding New Skills

To add new functionality (tools) to your MCP server:

1.  Open `src/index.ts` (or the relevant file where you define tools).
2.  Use the `server.tool` method to register a new tool.

    ```typescript
    server.tool(
      'new-tool-name',
      'Description of what the tool does',
      {
        paramName: z.string().describe('Description of the parameter'),
      },
      async ({ paramName }) => {
        // Your logic here
        return {
          content: [{ type: 'text', text: `Result: ${paramName}` }],
        };
      },
    );
    ```

3.  Rebuild the project: `npm run build`.
4.  Restart your MCP client (e.g., Claude Desktop) to see the new tool.

## License

MIT
