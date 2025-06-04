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
   cd "c:\Users\Gaming PC-01\Desktop\MCPNODE\weather"
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
   node .\build\index.js
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
            "C:/Path/To/Your/Project/build/index.js"
            ]
        }
    }
}
```

## Adding Tools to the MCP Server

To extend the functionality of the MCP server, you can add custom tools. Follow these steps:

1. **Define the Tool**:
   - Use the `server.tool` method to define a new tool.
   - Provide a unique name, description, input schema, and implementation logic.

   Example:
   ```javascript
   server.tool("tool-name", "Description of the tool", {
       inputParam: z.string().describe("Description of the input parameter")
   }, async ({ inputParam }) => {
       // Tool logic here
       return {
           content: [
               {
                   type: "text",
                   text: `Processed input: ${inputParam}`,
               },
           ],
       };
   });
   ```

2. **Register the Tool**:
   - Add the tool definition to the `index.ts` file or any other relevant file where the server is initialized.

3. **Rebuild the Project**:
   - After adding the tool, rebuild the project to compile the changes:
     ```bash
     npm run build
     ```

4. **Test the Tool**:
   - Start the server and test the tool using an MCP client or the MCP Inspector.

   Example Test Command:
   ```bash
   node .\build\index.js
   ```

By following these steps, you can easily extend the MCP server with custom tools tailored to your needs.

## License
This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing
Feel free to submit issues or pull requests to improve this template and add new features.
