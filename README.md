# ♧ Clover

A LaTeX editor with Claude Code integration and NotebookLM-style source management, designed for writing papers from local data.

![Clover](screenshot.png)

## Features

- From data to paper: add experiment results as sources, analyze data, generate figures, and write — all in one workflow
- Source management: manage PDFs, experiment data, and notes as references (inspired by NotebookLM)
- Claude Code integration — reads your local files and writes LaTeX directly
- Deep research: find and collect academic papers automatically
- Claude Code skills designed for paper writing
- Git diff view: see what the agent changed at a glance
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

### Create a Project

1. Click "New Project"
2. Select a directory
3. Start writing LaTeX

### Add Sources (optional)

- Add local files (PDFs, CSVs, notes) via the Sources panel — their paths become visible to Claude Code
- Or use Deep Research to find and add academic papers automatically

### Use Claude Code to Write a Paper

1. Click "Start" or press Enter in the terminal panel to start Claude Code
2. Enter instructions like "Write the introduction" or "Fix the compile error"

### Keyboard Shortcuts

- `Cmd/Ctrl+S` - Save
- `Cmd/Ctrl+B` - Compile to PDF
