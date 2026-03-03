# Clover

Clover is a writing support tool built on Claude Code, with NotebookLM-style source management and a local TeX editor.

![Clover](screenshot.png)

## Features

- LaTeX editor with syntax highlighting and real-time PDF preview
- Powered by Claude Code — reads your local files directly
- Source management: add PDFs, experiment data, notes as references for writing
- From data to paper: analyze experiment results, generate figures, and write — all in one workflow
- Deep research: find and collect academic papers automatically
- Auto-fix compile errors
- Desktop app (Electron) and web app (for remote servers)

## Quick Start

### Requirements

- [Node.js](https://nodejs.org/en/download) 18+
- Your TeX environment ([TeX Live](https://www.tug.org/texlive/), MacTeX, MiKTeX, etc.)
- [Claude Code](https://claude.com/product/claude-code)

### Desktop App (Electron)

```bash
npm install
npm run dev
```

### Web App

```bash
npm install
npm run build:web
npm run start:server  # Starts on port 8080 (auto-opens browser)

# Options:
npm run start:server -- --port 3000    # Use specific port
npm run start:server -- --no-open      # Don't open browser
```

If port 8080 is in use, it automatically tries 8081, 8082, etc.

## Usage

### Creating a Project

1. Click "New Project"
2. Select a directory
3. Start writing LaTeX

### Keyboard Shortcuts

- `Cmd/Ctrl+S` - Save
- `Cmd/Ctrl+B` - Compile to PDF

### Claude Code Agent

1. Click "Start" in the terminal panel
2. Enter instructions like "Write the introduction" or "Fix the compile error"
3. Auto-fix: Enable "Auto-start agent on compile error" in Settings
