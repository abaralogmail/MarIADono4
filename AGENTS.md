# AGENTS.md - MarIADono3 WhatsApp Bot System

## Commands
- **Start bot**: `npm start` (runs linting first, then starts app.js)
- **Lint**: `npx eslint . --no-ignore` (runs automatically before start)
- **Pre-copy**: `npm run pre-copy` (copies lib from parent directory)
- **Main entry**: `node app.js` (direct start without linting)

---

---

## Architecture

- **Multi-bot system**: Multiple WhatsApp bots running on different ports (6001-6015)
- **Core framework**: @bot-whatsapp/bot with Baileys provider for WhatsApp integration
- **Database**: sqlite for message storage
- **AI Integration**: OpenAI, Ollama, LangChain for intelligent responses, n8n
- **Message processing**: Flow-based conversation handling via src/flows/
- **Services**: SQLite, n8n automation, bulk messaging
- **Web dashboard**: Express server with EJS templates on multiple ports

## Code Style

- **ES modules**: Use require() syntax (CommonJS)
- **Async/await**: Preferred over promises for async operations
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Imports**: Destructure from modules: `const { createBot, createProvider } = require('@bot-whatsapp/bot')`
- **Error handling**: Use try/catch blocks, log errors to console
- **File structure**: Modular approach with separate files for flows, services, utils
- **Comments**: Minimal commenting, code should be self-explanatory
- **ESLint**: Uses bot-whatsapp plugin with recommended config

---
