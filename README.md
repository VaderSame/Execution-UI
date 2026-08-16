# Execution UI

The official frontend for the **Execution Agent**. This React application provides a rich, real-time Human-in-the-Loop (HITL) interface to interact with autonomous AI agents running on the backend. 

It connects to the Execution Agent backend via Server-Sent Events (SSE) to display live streaming logs, terminal output, and tool invocations while agents explore, debug, and execute python repositories in a Docker sandbox.

## Features
- **Live Stream Transcript**: Watch the agent think and act in real-time, rendered with Markdown and robust syntax highlighting for code payloads.
- **Repository Explorer**: Browse files and folders of the active code repository inside the sandbox.
- **Unified Sandbox Terminal**: See the live `stdout`/`stderr` from the Docker sandbox executed by the agent.
- **Interactive File Viewer**: Click any file in the repository explorer to view its contents side-by-side with the agent transcript.
- **Responsive Layout**: Resizable panes to manage screen real-estate between the agent logs, file tree, and code viewer.

## Technology Stack
- **React 19**
- **Vite 8**
- **Tailwind CSS v4** (with Typography plugin)
- **TypeScript**
- **React Markdown** & **React Syntax Highlighter**

## Prerequisites
- Node.js (v18 or higher recommended)
- The [Execution Agent Backend](../Execution%20Agent) must be running locally on port 8000 to process jobs and stream events.

## Installation
1. Clone the repository and navigate into the `Execution UI` directory.
2. Install dependencies:
   ```bash
   npm install
   ```

## Running the Application
1. **Start the Backend**: Ensure the Execution Agent backend is running:
   ```bash
   # From the Execution Agent directory
   uvicorn server:app --port 8000 --reload
   ```
2. **Start the UI**: Run the Vite development server:
   ```bash
   npm run dev
   ```
3. Open your browser to `http://localhost:5173`.
4. Select a repository from the Repo Picker, type your instruction, and hit **Run**!
