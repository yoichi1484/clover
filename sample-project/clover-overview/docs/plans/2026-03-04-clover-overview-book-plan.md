# Clover Overview Book — Writing Plan

**Goal:** Produce a ~20-page English technical book introducing Clover to a general audience, covering its vision, design philosophy, features, and getting started guide.

**Structure:** Problem-Solution Narrative. Chapters 1-2 establish the problem (fragmented academic writing tools, cloud dependency) and Clover's design philosophy (local-first). Chapters 3-6 present Clover's solution (architecture, editor, source management, skills). Chapter 7 closes with practical onboarding and future vision.

**Format:** LaTeX (pdflatex), single main.tex with chapter sections, references.bib for bibliography, compiled to PDF.

---

## Task 0: Project Scaffolding

**Files:**
- Create: `main.tex`
- Create: `references.bib`

**Step 1: Create main.tex with document preamble and chapter stubs**

```latex
\documentclass[a4paper,11pt]{article}
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{geometry}
\usepackage{hyperref}
\usepackage{xcolor}
\usepackage{booktabs}
\usepackage{graphicx}
\usepackage{titlesec}
\usepackage[backend=biber,style=numeric,sorting=none]{biblatex}
\addbibresource{references.bib}

\geometry{margin=2.5cm}

\hypersetup{
  colorlinks=true,
  linkcolor=blue!60!black,
  urlcolor=blue!70!black,
  citecolor=blue!50!black
}

\titleformat{\section}
  {\Large\bfseries}{Chapter \thesection:}{0.5em}{}
\titleformat{\subsection}
  {\large\bfseries}{\thesubsection}{0.5em}{}

\title{\textbf{Clover: AI-Powered Academic Writing}\\[0.5em]
{\large A Local-First Approach to Intelligent Paper Authoring}}
\author{}
\date{March 2026}

\begin{document}

\maketitle

\begin{abstract}
Academic writing has long suffered from tool fragmentation---researchers juggle LaTeX editors, reference managers, AI assistants, and collaboration platforms as disconnected pieces of a broken workflow. Clover is a local-first, AI-integrated LaTeX writing environment that unifies these capabilities into a single desktop application. By embedding Claude Code directly alongside a LaTeX editor and a NotebookLM-style source manager, Clover enables researchers to write, cite, compile, and review within one coherent workspace---all while keeping their data under their own control. This book introduces Clover's design philosophy, walks through its core features, and explains why the local-first approach matters for the future of academic writing.
\end{abstract}

\tableofcontents
\newpage

% Chapter 1: Introduction
\section{Introduction: The State of Academic Writing}
\label{sec:introduction}

% TODO: Content for Chapter 1

\newpage

% Chapter 2: Design Philosophy
\section{Clover's Design Philosophy}
\label{sec:philosophy}

% TODO: Content for Chapter 2

\newpage

% Chapter 3: What is Clover?
\section{What is Clover?}
\label{sec:overview}

% TODO: Content for Chapter 3

\newpage

% Chapter 4: The Integrated LaTeX Editor
\section{The Integrated LaTeX Editor}
\label{sec:editor}

% TODO: Content for Chapter 4

\newpage

% Chapter 5: Source Management
\section{Source Management: Your Research Hub}
\label{sec:sources}

% TODO: Content for Chapter 5

\newpage

% Chapter 6: Clover Skills
\section{Clover Skills: Smart Writing Assistance}
\label{sec:skills}

% TODO: Content for Chapter 6

\newpage

% Chapter 7: Getting Started & Future
\section{Getting Started \& Future Directions}
\label{sec:getting-started}

% TODO: Content for Chapter 7

\newpage
\printbibliography

\end{document}
```

**Step 2: Create empty references.bib**

```bibtex
% References for Clover Overview Book
```

**Step 3: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: PDF generated with title page, abstract, table of contents, and chapter stubs.

**Step 4: Commit**

```bash
git add main.tex references.bib
git commit -m "Add LaTeX scaffolding with chapter stubs"
```

---

## Task 1: Research Existing Products for Chapters 1-2

**Files:**
- Modify: `.clover/sources.json`

**Step 1: Research existing academic writing tools**

Use the `paper-research` skill to find sources about:
- Overleaf (cloud LaTeX editor)
- Typst (modern typesetting)
- Google NotebookLM (AI source analysis)
- OpenAI Prism (AI scientific writing)
- Elicit, SciSpace (AI research assistants)
- AI Scientist, Agent Laboratory (automated paper generation)
- Local-first software philosophy (Martin Kleppmann et al.)
- Claude Code (Anthropic's CLI tool)

**Step 2: Add found sources to sources.json**

Use the `add-to-sources` skill. Each source needs:
- id, name, path/url, type, tags (minimum 10)

**Step 3: Verify sources are accessible**

Check that all added sources have valid URLs and correct metadata.

**Step 4: Commit**

```bash
git add .clover/sources.json
git commit -m "Add research sources for existing product comparisons"
```

---

## Task 2: Write Chapter 1 — Introduction: The State of Academic Writing

**Files:**
- Modify: `main.tex` (replace Chapter 1 TODO, approximately line 50-55)
- Modify: `references.bib`

**Step 1: Review sources for this chapter**

Check sources.json for references about existing tools: Overleaf, Typst, NotebookLM, OpenAI Prism, Elicit, SciSpace, AI Scientist, Agent Laboratory, ChatGPT/Claude web interfaces.

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 1 TODO in main.tex with content covering:

1. **Opening paragraph**: The explosion of AI tools for academic writing since 2024. Set the scene of rapid change.

2. **The fragmented landscape**: Researchers currently use multiple disconnected tools. LaTeX editors (Overleaf, local TeXShop/VS Code), reference managers (Zotero, Mendeley), AI assistants (ChatGPT, Claude), source analysis (NotebookLM, Elicit). Each tool does one thing well but forces constant context-switching.

3. **Cloud-based LaTeX editors**: Overleaf as the dominant platform. Strengths (collaboration, no local setup). Weaknesses (cloud dependency, limited AI integration, vendor lock-in, subscription costs). Cite Overleaf.

4. **Modern typesetting alternatives**: Typst as a newer alternative. Simpler syntax but immature ecosystem, limited tooling, small community compared to LaTeX.

5. **AI-powered research tools**: NotebookLM for source analysis (powerful but not a writing tool). Elicit and SciSpace for literature discovery. OpenAI Prism for scientific writing. These tools handle specific sub-tasks but do not provide an integrated writing environment.

6. **Fully automated paper generation**: AI Scientist, Agent Laboratory, data-to-paper, AgentRxiv. These pursue full automation but raise quality and verification concerns. They remove the human from the loop rather than empowering them.

7. **General AI assistants**: ChatGPT, Claude web interface. Useful for drafting and editing but have no LaTeX awareness, no source management, no project context. Copy-paste workflow is tedious and error-prone.

8. **Closing paragraph**: The gap in the market. No existing tool combines LaTeX editing, source management, and AI assistance in a single, local-first environment. This is the space Clover fills.

Write in professional, persuasive, dense paragraphs. No bullet points. Use `\cite{}` for all product references.

**Step 3: Add citations to references.bib**

Add BibTeX entries for all cited products and papers. Reference the about-clover project's `references.bib` at `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/about-clover/references.bib` for existing entries that can be reused.

**Step 4: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 1 renders correctly with citations resolved.

**Step 5: Commit**

```bash
git add main.tex references.bib
git commit -m "Write Chapter 1: Introduction — The State of Academic Writing"
```

---

## Task 3: Write Chapter 2 — Clover's Design Philosophy

**Files:**
- Modify: `main.tex` (replace Chapter 2 TODO)
- Modify: `references.bib`

**Step 1: Review sources for this chapter**

Check sources.json for references about local-first software, data ownership, privacy in research, Git-based workflows.

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 2 TODO with content covering:

1. **Opening paragraph**: Introduce Clover's core design principle — local-first. Your files, your machine, your control.

2. **Data ownership and vendor independence**: When you write in Clover, every file lives on your local filesystem as plain LaTeX. No proprietary format, no cloud sync requirement. You can open your files in any editor, move them to any machine, store them in any repository. Compare with Overleaf where your project lives on their servers and exporting is an afterthought.

3. **Privacy for sensitive research**: Unpublished manuscripts, proprietary datasets, confidential review materials — researchers handle sensitive content daily. Cloud tools require trusting a third party with this data. Clover keeps everything local. The AI component (Claude Code) processes your content through Anthropic's API with their privacy guarantees, but your source files never leave your machine's filesystem.

4. **Git as a first-class citizen**: Clover embraces Git natively. Every edit is trackable, every AI-generated change is visible in the diff view. Researchers can review exactly what the AI wrote, accept or reject changes, and maintain a complete history of their document's evolution. This transparency is impossible in tools that abstract away version control.

5. **Offline capability and resilience**: A local-first tool works without internet. Write on a plane, in a library with poor Wi-Fi, during a conference. AI features require connectivity, but the editor, compiler, and source manager work offline. Your writing session is never interrupted by a server outage.

6. **Extensibility through openness**: Because Clover works with standard files and tools, it integrates with your existing workflow. Use your preferred Git client, your favorite BibTeX manager, your existing LaTeX packages. Clover adds to your toolchain rather than replacing it.

7. **Closing paragraph**: Local-first is not a limitation — it is a deliberate architectural choice that prioritizes researcher autonomy. Clover demonstrates that an AI-powered writing tool can be both powerful and respectful of its users' data and workflow.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Add any new citations to references.bib**

Add entries for local-first software references if found during research.

**Step 4: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 2 renders correctly.

**Step 5: Commit**

```bash
git add main.tex references.bib
git commit -m "Write Chapter 2: Clover's Design Philosophy"
```

---

## Task 4: Write Chapter 3 — What is Clover?

**Files:**
- Modify: `main.tex` (replace Chapter 3 TODO)

**Step 1: Review Clover source code for architecture details**

Read the following files from clover-dev for accurate technical details:
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/package.json` (tech stack)
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/README.md` (overview)

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 3 TODO with content covering:

1. **Opening paragraph**: Clover in one sentence — a desktop application that combines a LaTeX editor, a PDF preview, an AI terminal, and a source manager into one unified workspace.

2. **The unified workspace concept**: Describe the application layout. The editor panel for writing LaTeX. The PDF preview that updates on compilation. The integrated terminal running Claude Code. The source management panel for organizing references. The Git diff view for reviewing changes. Explain how having everything in one window eliminates context-switching.

3. **Technical foundation**: Clover is built as an Electron desktop application (also available as a web app). It uses React for the interface, Monaco Editor (the same engine behind VS Code) for LaTeX editing, and xterm for terminal emulation. The web server component enables browser-based access when the desktop app is not preferred.

4. **Claude Code integration**: The terminal panel runs Claude Code, Anthropic's AI coding assistant. Claude Code has full access to the project files and can read LaTeX, understand document structure, write new sections, edit existing content, and manage references. It is not a chat widget bolted onto an editor — it is a full-featured AI agent that operates directly on your files.

5. **How the pieces connect**: When Claude Code writes LaTeX, the editor updates. When you add a source, Claude Code can reference it in the next writing session. When you compile, the PDF preview refreshes. Git tracks every change. This tight integration means the AI is not an external tool you consult — it is part of the writing environment itself.

6. **Closing paragraph**: Clover is not merely a collection of features. It is an opinionated integration of tools that, together, create a writing experience greater than the sum of its parts.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 3 renders correctly.

**Step 4: Commit**

```bash
git add main.tex
git commit -m "Write Chapter 3: What is Clover?"
```

---

## Task 5: Write Chapter 4 — The Integrated LaTeX Editor

**Files:**
- Modify: `main.tex` (replace Chapter 4 TODO)

**Step 1: Review Clover editor implementation for accurate details**

Explore editor components in clover-dev:
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/src/renderer/` (editor UI components)

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 4 TODO with content covering:

1. **Opening paragraph**: The LaTeX editor is where researchers spend most of their time. Clover's editor is designed to make that time productive by combining a powerful text editor with AI assistance and real-time feedback.

2. **Monaco Editor for LaTeX**: Clover uses the Monaco editor, the same engine that powers VS Code. This provides syntax highlighting, auto-completion, bracket matching, and all the editing features developers expect from a modern editor — applied to LaTeX authoring.

3. **AI-assisted writing through Claude Code**: The adjacent terminal panel runs Claude Code with full project context. A researcher can ask Claude to draft a section, revise a paragraph, add citations, restructure an argument, or fix compilation errors. Claude reads the current state of all project files and produces edits directly — no copy-paste required. The interaction is conversational: the researcher guides the direction while Claude handles the mechanical work of writing LaTeX.

4. **Git diff view for transparency**: Every change Claude makes is visible in the Git diff view. This is not an afterthought — it is a core design feature. When an AI writes a paragraph, the researcher can see exactly what was added, modified, or removed. They can accept changes selectively, revert specific edits, or use the diff as a starting point for further revision. This transparency builds trust in the human-AI collaboration.

5. **PDF compilation and preview**: Pressing Cmd+B (or Ctrl+B) compiles the LaTeX and updates the PDF preview in the same window. The compile-review cycle is immediate, allowing researchers to verify formatting, check citation rendering, and review the document's visual appearance without switching applications.

6. **Closing paragraph**: By combining a professional-grade editor, an AI writing assistant, transparent change tracking, and instant compilation into a single interface, Clover removes the friction that traditionally slows academic writing.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 4 renders correctly.

**Step 4: Commit**

```bash
git add main.tex
git commit -m "Write Chapter 4: The Integrated LaTeX Editor"
```

---

## Task 6: Write Chapter 5 — Source Management: Your Research Hub

**Files:**
- Modify: `main.tex` (replace Chapter 5 TODO)
- Modify: `references.bib`

**Step 1: Review Clover source management implementation**

Read source management components and the sources.json format from:
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/about-clover/.clover/sources.json` (example of real sources)
- Clover-dev source panel components

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 5 TODO with content covering:

1. **Opening paragraph**: Research is built on sources — papers, datasets, notes, documentation. Managing these sources is one of the most time-consuming aspects of academic work. Clover's source management system brings all your references into the writing environment, making them accessible to both you and the AI assistant.

2. **Adding sources**: Clover accepts a wide range of source types. Local files — PDFs, CSV datasets, text notes, images — can be added directly from your filesystem. Web sources — academic papers, documentation, articles — can be added by URL. Each source is registered in a central JSON file (sources.json) that serves as the project's knowledge base.

3. **The tag system**: Every source is tagged with descriptive metadata — domain, method, concept, author, venue, year, and more. These tags enable discovery: when working on a section about a specific topic, the tag system helps surface relevant sources you may not have immediately recalled. The tagging is granular (minimum ten tags per source) to ensure meaningful connections across your reference library.

4. **AI-powered source utilization**: When Claude Code writes or edits content, it has access to all registered sources. It can read their content, extract relevant information, and produce citations grounded in your actual reference material. This is fundamentally different from a general AI assistant that relies on training data — Clover's AI writes from your specific sources, reducing hallucination and ensuring citation accuracy.

5. **Comparison with NotebookLM**: Google's NotebookLM pioneered the concept of source-grounded AI interaction. Clover takes this idea further by embedding source management directly into the writing workflow. In NotebookLM, you analyze sources and extract insights. In Clover, the AI uses your sources to write LaTeX with proper citations, check facts against your references, and suggest additional sources from academic databases. Moreover, Clover's local-first approach means your sources never leave your machine.

6. **Closing paragraph**: Source management in Clover is not a separate activity from writing — it is an integral part of the writing process. By keeping sources close to the writing environment and making them accessible to the AI, Clover ensures that every paragraph is grounded in real evidence.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Add any new citations to references.bib**

Add NotebookLM citation if not already present.

**Step 4: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 5 renders correctly.

**Step 5: Commit**

```bash
git add main.tex references.bib
git commit -m "Write Chapter 5: Source Management — Your Research Hub"
```

---

## Task 7: Write Chapter 6 — Clover Skills: Smart Writing Assistance

**Files:**
- Modify: `main.tex` (replace Chapter 6 TODO)

**Step 1: Review Clover skills documentation**

Read the skill files from clover-dev for accurate descriptions:
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/clover-skills/skills/brainstorming/SKILL.md`
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/clover-skills/skills/paper-research/SKILL.md`
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/clover-skills/skills/add-to-sources/SKILL.md`
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/clover-skills/skills/paper-translation/SKILL.md`

**Step 2: Write chapter content (~2 pages)**

Replace the Chapter 6 TODO with content covering:

1. **Opening paragraph**: Beyond its editor and source manager, Clover ships with a set of built-in skills that automate common academic writing tasks. These are not generic AI prompts — they are carefully designed workflows that guide the AI through complex, multi-step processes.

2. **Brainstorming skill**: Before a single word of LaTeX is written, the brainstorming skill helps researchers clarify their thinking. It asks targeted questions about purpose, audience, structure, and constraints. It proposes multiple approaches with trade-offs. It produces a design document that serves as a blueprint for the writing ahead. This structured ideation process prevents the common problem of starting to write without a clear plan.

3. **Paper research skill**: The paper-research skill searches academic databases (DBLP, Google Scholar, arXiv) and the web to find relevant sources. It verifies every citation through authoritative databases — never fabricating references. Found sources are automatically added to the project's sources.json with proper metadata and tags. This turns literature review from a manual, hours-long task into an assisted, minutes-long process.

4. **Source management skill**: The add-to-sources skill streamlines the process of registering new references. Whether adding a local PDF, a web article, or an academic paper, the skill handles metadata extraction, tag generation, and proper formatting. It ensures that every source added to the project is immediately usable by the AI writing assistant.

5. **Translation skill**: For researchers working across languages, the paper-translation skill provides academic-quality translation that preserves technical terminology, LaTeX formatting, and citation structure. This is particularly valuable in multilingual academic communities where papers may need to be drafted or adapted in multiple languages.

6. **Closing paragraph**: Clover's skills represent a philosophy of AI assistance: rather than providing a blank chat interface and hoping the user knows what to ask, Clover encodes expert workflows into reusable, reliable processes. The AI does not just answer questions — it guides the researcher through proven methodologies.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Chapter 6 renders correctly.

**Step 4: Commit**

```bash
git add main.tex
git commit -m "Write Chapter 6: Clover Skills — Smart Writing Assistance"
```

---

## Task 8: Write Chapter 7 — Getting Started & Future Directions

**Files:**
- Modify: `main.tex` (replace Chapter 7 TODO)
- Modify: `references.bib`

**Step 1: Review Clover installation requirements**

Read the README from clover-dev/clover-public for accurate installation instructions:
- `/Users/ishibashiyouichi/claude-code-projects/2026-02-24-a_paper-writing/clover-dev/README.md`

**Step 2: Write chapter content (~3 pages)**

Replace the Chapter 7 TODO with content covering:

1. **Opening paragraph**: Getting started with Clover requires minimal setup. This chapter walks through installation, project creation, and the basic writing workflow.

2. **Prerequisites**: Clover requires three components: Node.js (version 18 or later) for running the application, a TeX distribution (TeX Live on Linux, MacTeX on macOS, or MiKTeX on Windows) for compiling LaTeX, and Claude Code (Anthropic's terminal-based AI assistant) for AI features. All three are freely available and well-documented.

3. **Creating a project**: Describe the project creation flow. Launch Clover, create a new project in a directory. The application generates a configuration file and prepares the workspace. The researcher can then add sources, open the editor, and begin writing.

4. **The basic workflow**: A typical Clover session follows a natural rhythm. Add or review sources in the source panel. Open the terminal and use Claude Code to draft or edit content. Review changes in the diff view. Compile with Cmd+B and check the PDF. Commit with Git to save progress. Each cycle builds on the last, with the AI maintaining context across the entire session.

5. **Future directions**: Clover is under active development. Describe the vision for future features — deeper AI integration, expanded source type support, collaboration features that preserve the local-first principle, community-contributed skills, and tighter integration with academic publishing workflows.

6. **Closing paragraph**: Clover is more than a tool — it is a statement about how academic writing should work in the age of AI. By keeping the researcher in control, grounding AI output in real sources, and providing a transparent, integrated workspace, Clover points toward a future where AI amplifies human expertise rather than replacing it.

Write in professional, persuasive, dense paragraphs. No bullet points.

**Step 3: Add any final citations to references.bib**

Ensure all referenced tools and projects have proper BibTeX entries.

**Step 4: Compile and verify**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Complete book compiles without errors. All citations resolved.

**Step 5: Commit**

```bash
git add main.tex references.bib
git commit -m "Write Chapter 7: Getting Started & Future Directions"
```

---

## Task 9: Final Review and Polish

**Files:**
- Modify: `main.tex`
- Modify: `references.bib`

**Step 1: Full read-through**

Read the complete main.tex and check for:
- Consistent tone and style across all chapters
- Smooth transitions between chapters
- No bullet points (only paragraphs)
- All citations properly referenced
- No TODO markers remaining

**Step 2: Fix any issues found**

Edit main.tex to address inconsistencies, awkward transitions, or style violations.

**Step 3: Final compile**

Run: `pdflatex main.tex && biber main && pdflatex main.tex && pdflatex main.tex`
Expected: Clean compilation with no warnings about undefined references or missing citations.

**Step 4: Final commit**

```bash
git add main.tex references.bib
git commit -m "Final polish: review and fix consistency across all chapters"
```
