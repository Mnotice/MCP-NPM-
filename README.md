# Weather MCP Server

This project is a foundational template for developing a Model Context Protocol (MCP) server designed to integrate with Claude Desktop. It enables the creation of custom prompts and search functions, using Claude as an interface for executing custom functionalities.

## Features
- **Weather Alerts**: Retrieve active weather alerts for a specified state.
- **Weather Forecast**: Get detailed weather forecasts for a specific location based on latitude and longitude.

## Technologies Used
- **Node.js**: Server runtime.
- **TypeScript**: Type-safe development.
- **Model Context Protocol SDK**: For MCP server implementation.
- **Zod**: Schema validation.

## Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/username/repository.git
   ```
2. Navigate to the root project directory:
   ```bash
   cd ./MCPNODE/
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the project:
   ```bash
   npm run build
   ```
5. Start the MCP server:
   ```bash
   npm start [project_name]
   ```

## Usage
- **Claude Desktop Integration**: Configure Claude Desktop to use this MCP server by specifying the server command and arguments in the `claude_desktop_config.json` file. Add Path ./build/index.js
- **Custom Prompts**: Extend the server's tools to create custom prompts and search functionalities.

## Example Configuration
```json
{
    "mcpServers": {
        "weather": {
            "command": "node",
            "args": [
              "C:/Users/Gaming PC-01/Desktop/MCPNODE/weather/build/index.js"
            ]
        }
    }
}
```

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing
Feel free to submit issues or pull requests to improve this template and add new features.
