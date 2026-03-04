# Design Document: Clover Overview Book

## Document Type
Technical book (~20 pages), LaTeX format, compiled to PDF.

## Target Audience
General audience interested in AI-powered tools for academic writing. No assumption of deep technical background.

## Purpose
Dual purpose: (1) introduce Clover's vision and value proposition to newcomers, and (2) explain the technical architecture and features for those who want deeper understanding.

## Key Themes
- AI + LaTeX integration (Claude Code seamlessly embedded in LaTeX editing)
- Source management (NotebookLM-like local source management)
- Local-file-based approach (data ownership, privacy, Git integration)
- Comparison with existing products (Overleaf, Typst, NotebookLM, etc.)

## Approach
Problem-Solution Narrative: Open with the challenges of academic writing today, then show how Clover addresses each challenge. This builds reader empathy before introducing technical details.

## Chapter Structure

### Chapter 1: Introduction — The State of Academic Writing (~3 pages)
The current landscape of academic writing tools. Fragmentation across editors, reference managers, AI assistants, and collaboration platforms. Specific comparison with existing products:
- **Overleaf**: Cloud-based LaTeX editor — collaborative but lacks AI integration and local control
- **Typst**: Modern typesetting — simpler syntax but immature ecosystem
- **NotebookLM**: AI-powered source analysis — powerful but not a writing tool
- **ChatGPT/Claude web**: General AI assistants — no LaTeX awareness, no source management
- **Other tools**: Zotero, Mendeley, etc.

**Source requirement**: Research actual products and cite them. Agent researches and adds to sources.json; user supplements.

### Chapter 2: Clover's Design Philosophy (~3 pages)
Why Clover takes a local-file-based approach. Key arguments:
- **Data ownership**: Your files stay on your machine. No vendor lock-in.
- **Privacy**: Research data, unpublished manuscripts never leave your control.
- **Git integration**: Natural version control. Every change tracked. Diffs visible.
- **Offline capability**: Work without internet dependency.
- **Extensibility**: Local files work with any tool in your existing workflow.

Contrast with cloud-dependent tools (Overleaf, Google Docs). Articulate why local-first matters for researchers.

### Chapter 3: What is Clover? (~3 pages)
High-level overview of Clover's architecture:
- Electron desktop app + web app
- Three integrated panels: LaTeX editor, PDF preview, terminal (Claude Code)
- Source management panel
- Git diff view
- How these components work together in a unified experience

### Chapter 4: The Integrated LaTeX Editor (~3 pages)
Deep dive into the LaTeX editing experience:
- Monaco editor with LaTeX support
- Claude Code integration in the terminal panel
- AI-assisted writing: Claude reads your LaTeX, understands context, writes sections
- Git diff view to review AI-generated changes
- PDF compilation and preview (Cmd+B)
- How AI + human collaboration works in practice

### Chapter 5: Source Management — Your Research Hub (~3 pages)
How Clover manages research sources:
- Adding local files: PDFs, CSVs, notes, images
- Adding web sources: papers, articles, documentation
- Tag system for organizing and discovering sources
- How Claude Code reads and references sources during writing
- Comparison with NotebookLM's approach, emphasizing local-first advantage

### Chapter 6: Clover Skills — Smart Writing Assistance (~2 pages)
How Clover's built-in skills make writing efficient (NOT about customization, but about built-in convenience):
- **brainstorming**: Automatically guides you through design and planning before writing
- **paper-research**: Searches academic databases, finds papers, adds citations
- **add-to-sources**: Streamlines adding references to your project
- **paper-translation**: Assists with multilingual academic writing
- Real-world usage examples showing how skills save time

### Chapter 7: Getting Started & Future Directions (~3 pages)
- Installation requirements (Node.js, TeX environment, Claude Code)
- Creating your first Clover project
- Basic workflow walkthrough
- Future directions and vision

## Source Collection Method
- Agent researches and adds sources to sources.json (especially for Chapter 1-2 existing product comparisons)
- User supplements with additional sources via Clover UI
- Sources are collected BEFORE writing each section

## Writing Style
- Professional, persuasive, and dense
- No bullet points in the actual book — use well-structured paragraphs
- English language throughout

## Git Version Control
- Enabled. Commit after each major writing milestone.

## LaTeX Setup
- Main file: main.tex
- Compiler: pdflatex
- BibTeX for references
