# Coding Agents Survey - Implementation Plan

**Goal:** Write a comprehensive academic survey paper on AI coding agents for software engineering researchers.

**Structure:** LaTeX paper with 10 main sections, organized by taxonomy (code completion → conversational → autonomous → IDE-integrated), covering systems from 2022-present, with evaluation benchmarks and future directions.

**Format:** LaTeX (pdflatex), ~24-30 pages, flexible venue format.

---

## Task 0: Project Setup

**Files:**
- Create: `main.tex`
- Create: `references.bib`
- Create: `sections/` directory

**Step 1: Create main LaTeX file with document structure**

```latex
\documentclass[11pt]{article}

\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage{graphicx}
\usepackage{booktabs}
\usepackage{hyperref}
\usepackage{natbib}
\usepackage{xcolor}
\usepackage{listings}
\usepackage{geometry}
\geometry{margin=1in}

\title{Coding Agents: A Survey of AI-Powered Software Development Tools}
\author{[Author Names]}
\date{\today}

\begin{document}

\maketitle

\begin{abstract}
\input{sections/abstract}
\end{abstract}

\input{sections/introduction}
\input{sections/background}
\input{sections/taxonomy}
\input{sections/code-completion}
\input{sections/conversational}
\input{sections/autonomous-agents}
\input{sections/ide-integration}
\input{sections/benchmarks}
\input{sections/challenges}
\input{sections/conclusion}

\bibliographystyle{plainnat}
\bibliography{references}

\end{document}
```

**Step 2: Create empty references.bib**

```bibtex
% References for Coding Agents Survey
% Organized by section

% === Background & Foundations ===

% === Code Completion Tools ===

% === Conversational Assistants ===

% === Autonomous Agents ===

% === IDE Integration ===

% === Benchmarks ===
```

**Step 3: Create sections directory and placeholder files**

```bash
mkdir -p sections
touch sections/abstract.tex
touch sections/introduction.tex
touch sections/background.tex
touch sections/taxonomy.tex
touch sections/code-completion.tex
touch sections/conversational.tex
touch sections/autonomous-agents.tex
touch sections/ide-integration.tex
touch sections/benchmarks.tex
touch sections/challenges.tex
touch sections/conclusion.tex
```

**Step 4: Compile and verify**

```bash
pdflatex main.tex
```

Expected: PDF generated (will have empty sections, that's OK)

**Step 5: Commit**

```bash
git add -A
git commit -m "Initial LaTeX project setup with document structure"
```

---

## Task 1: Abstract

**Files:**
- Modify: `sections/abstract.tex`

**Step 1: Write the abstract (~200 words)**

```latex
Large language models have fundamentally transformed software development, enabling a new generation of AI-powered coding tools that range from inline code completion to fully autonomous software agents. The rapid proliferation of these tools—including GitHub Copilot, ChatGPT, Claude, Cursor, Devin, and SWE-agent—has created a fragmented landscape where researchers and practitioners struggle to understand capabilities, compare systems, and identify research opportunities.

This survey provides a comprehensive overview of AI coding agents from the LLM era (2022--present). We present a taxonomy that categorizes systems along three dimensions: autonomy level (from reactive assistance to autonomous execution), interaction scope (from single-line completion to repository-wide changes), and integration mode (IDE extensions, chat interfaces, CLI tools, and standalone platforms). Using this framework, we systematically analyze four categories of tools: code completion systems, conversational coding assistants, autonomous coding agents, and AI-integrated development environments.

We examine evaluation benchmarks including HumanEval, MBPP, and SWE-bench, discussing their strengths and limitations for measuring real-world utility. Finally, we identify open challenges in reliability, security, code quality, and human-agent collaboration, outlining a research agenda for the software engineering community. Our survey aims to help researchers navigate this rapidly evolving field and identify high-impact research directions.
```

**Step 2: Compile and verify**

```bash
pdflatex main.tex
```

Expected: Abstract appears in PDF

**Step 3: Commit**

```bash
git add sections/abstract.tex
git commit -m "Add abstract"
```

---

## Task 2: Introduction

**Files:**
- Modify: `sections/introduction.tex`
- Modify: `references.bib`

**Step 1: Research statistics and citations**

Key facts to verify and cite:
- GitHub's statistics on AI-assisted coding (46%+)
- Copilot user adoption numbers
- Rise of autonomous agents timeline

**Step 2: Write introduction content**

```latex
\section{Introduction}
\label{sec:introduction}

The landscape of software development is undergoing a profound transformation. In 2024, GitHub reported that over 46\% of code across its platform is now written with AI assistance~\citep{github2024octoverse}. Tools like GitHub Copilot have surpassed one million paid subscribers, while autonomous coding agents like Devin and SWE-agent have demonstrated the ability to independently resolve real-world software issues. The emergence of ``vibe coding''---where developers describe intent and iterate with AI rather than writing code directly---signals a fundamental shift in how software is created.

Yet this rapid evolution has created significant challenges for researchers and practitioners. The field lacks a unified framework for understanding the capabilities and limitations of different systems. Questions abound: How do code completion tools differ from conversational assistants? What makes an ``agent'' autonomous? Which benchmarks meaningfully measure real-world utility? Where should research efforts focus?

\subsection{Contributions}

This survey addresses these challenges by providing:

\begin{itemize}
    \item \textbf{A comprehensive taxonomy} categorizing coding agents along three dimensions: autonomy level, interaction scope, and integration mode.
    \item \textbf{Systematic coverage} of major systems from the LLM era (2022--present), including code completion tools, conversational assistants, autonomous agents, and integrated development environments.
    \item \textbf{Critical analysis} of evaluation benchmarks, examining what they measure and what they miss.
    \item \textbf{Identification of open challenges} and a research agenda for the software engineering community.
\end{itemize}

\subsection{Scope}

We focus on tools that assist with code writing and modification, concentrating on systems from the LLM era (2022--present) that have publicly documented capabilities and evaluation data. We exclude general program synthesis, formal verification tools, and non-LLM static analysis systems.

\subsection{Organization}

The remainder of this paper is organized as follows. Section~\ref{sec:background} provides background on large language models for code and the agent paradigm. Section~\ref{sec:taxonomy} presents our taxonomy of coding agents. Sections~\ref{sec:completion}--\ref{sec:ide} survey four categories of tools in detail. Section~\ref{sec:benchmarks} examines evaluation benchmarks and metrics. Section~\ref{sec:challenges} discusses open challenges and future directions. Section~\ref{sec:conclusion} concludes.
```

**Step 3: Add initial citations to references.bib**

```bibtex
% === Introduction ===
@misc{github2024octoverse,
  title = {Octoverse 2024: The State of Open Source and AI},
  author = {{GitHub}},
  year = {2024},
  howpublished = {\url{https://github.blog/news-insights/octoverse/octoverse-2024/}},
  note = {Accessed: 2026-02-28}
}
```

**Step 4: Compile and verify**

```bash
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

Expected: Introduction renders with citation

**Step 5: Commit**

```bash
git add sections/introduction.tex references.bib
git commit -m "Add introduction section"
```

---

## Task 3: Background & Foundations

**Files:**
- Modify: `sections/background.tex`
- Modify: `references.bib`

**Step 1: Research key papers and systems to cite**

- Codex paper (Chen et al., 2021)
- CodeGen (Nijkamp et al., 2022)
- StarCoder (Li et al., 2023)
- Code Llama (Rozière et al., 2023)
- ReAct paper (Yao et al., 2022)

**Step 2: Write background content**

```latex
\section{Background and Foundations}
\label{sec:background}

This section provides the technical foundations necessary to understand modern coding agents, covering large language models for code, the transition from models to tools, and the agent paradigm.

\subsection{Large Language Models for Code}

The foundation of modern coding agents is the large language model (LLM) trained on code. The breakthrough came with OpenAI's Codex~\citep{chen2021codex}, a GPT model fine-tuned on publicly available code from GitHub. Codex demonstrated that language models could generate functionally correct code from natural language descriptions, achieving 28.8\% pass@1 on the HumanEval benchmark.

Subsequent models expanded capabilities and accessibility. CodeGen~\citep{nijkamp2022codegen} introduced multi-turn program synthesis. StarCoder~\citep{li2023starcoder} provided an open-source alternative trained on permissively licensed code. Code Llama~\citep{roziere2023codellama} brought code capabilities to the Llama model family with specialized variants for infilling and instruction following.

These models share key capabilities:
\begin{itemize}
    \item \textbf{Code understanding}: Parsing and comprehending existing code
    \item \textbf{Code generation}: Producing code from natural language or partial code
    \item \textbf{Infilling}: Completing code given surrounding context (fill-in-the-middle)
\end{itemize}

\subsection{From Models to Tools}

A raw language model is not a usable development tool. The transition requires several enabling components:

\textbf{Context management}: Real codebases exceed model context limits. Tools must select relevant context---open files, imported modules, similar code---to include in prompts.

\textbf{Prompt engineering}: The way requests are formatted significantly impacts output quality. Tools develop specialized prompts for different tasks (completion, explanation, refactoring).

\textbf{Output processing}: Model outputs must be parsed, validated, and integrated into the development environment. This includes handling code formatting, language detection, and error recovery.

\textbf{Interaction design}: Single-turn generation is limiting. Modern tools support multi-turn conversations, iterative refinement, and human-in-the-loop workflows.

\subsection{The Agent Paradigm}

The most capable coding systems employ an agent architecture. An agent, in this context, is a system that can:
\begin{itemize}
    \item \textbf{Plan}: Decompose complex tasks into steps
    \item \textbf{Use tools}: Execute actions beyond text generation (file I/O, shell commands, web search)
    \item \textbf{Observe}: Process feedback from tool execution
    \item \textbf{Iterate}: Adjust behavior based on results
\end{itemize}

The ReAct pattern~\citep{yao2022react}---Reasoning and Acting---has been particularly influential. ReAct interleaves reasoning traces (``I need to find the function definition...'') with actions (search for function) and observations (search results). This approach enables models to tackle multi-step tasks that require gathering information and adapting to intermediate results.

\subsection{Terminology}

We adopt the following definitions throughout this survey:

\begin{description}
    \item[Code completion] Real-time, inline suggestions during editing, typically single-line or block-level.
    \item[Code generation] Creating code from natural language descriptions, often function or file-level.
    \item[Coding assistant] An interactive system providing conversational help with coding tasks.
    \item[Coding agent] An autonomous system capable of planning and executing multi-step coding tasks with minimal human intervention.
    \item[Agentic coding] Human-AI collaborative workflows where agents handle implementation while humans guide and review.
\end{description}
```

**Step 3: Add citations to references.bib**

```bibtex
% === Background ===
@article{chen2021codex,
  title={Evaluating Large Language Models Trained on Code},
  author={Chen, Mark and others},
  journal={arXiv preprint arXiv:2107.03374},
  year={2021}
}

@article{nijkamp2022codegen,
  title={CodeGen: An Open Large Language Model for Code with Multi-Turn Program Synthesis},
  author={Nijkamp, Erik and others},
  journal={arXiv preprint arXiv:2203.13474},
  year={2022}
}

@article{li2023starcoder,
  title={StarCoder: May the Source Be with You!},
  author={Li, Raymond and others},
  journal={arXiv preprint arXiv:2305.06161},
  year={2023}
}

@article{roziere2023codellama,
  title={Code Llama: Open Foundation Models for Code},
  author={Rozi{\`e}re, Baptiste and others},
  journal={arXiv preprint arXiv:2308.12950},
  year={2023}
}

@article{yao2022react,
  title={ReAct: Synergizing Reasoning and Acting in Language Models},
  author={Yao, Shunyu and others},
  journal={arXiv preprint arXiv:2210.03629},
  year={2022}
}
```

**Step 4: Compile and verify**

```bash
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

**Step 5: Commit**

```bash
git add sections/background.tex references.bib
git commit -m "Add background and foundations section"
```

---

## Task 4: Taxonomy

**Files:**
- Modify: `sections/taxonomy.tex`

**Step 1: Write taxonomy section with table**

```latex
\section{A Taxonomy of Coding Agents}
\label{sec:taxonomy}

To organize the diverse landscape of coding agents, we propose a taxonomy with three dimensions: autonomy level, interaction scope, and integration mode.

\subsection{Dimension 1: Autonomy Level}

We identify four levels of autonomy:

\begin{description}
    \item[Level 1 -- Reactive] The system responds only to explicit user requests. It takes no initiative and makes no suggestions unless prompted.
    \item[Level 2 -- Proactive] The system can suggest actions or improvements, but the human must execute any changes.
    \item[Level 3 -- Semi-autonomous] The system can execute actions, but requires human approval for each step or significant action.
    \item[Level 4 -- Autonomous] The system can plan and execute multi-step tasks independently, seeking human input only for clarification or final review.
\end{description}

\subsection{Dimension 2: Interaction Scope}

The scope of code that a system can understand and modify:

\begin{description}
    \item[Single-line] Completions and suggestions at the cursor position.
    \item[Function/block] Generation or modification of complete functions or code blocks.
    \item[File] Operations spanning an entire file, including refactoring and restructuring.
    \item[Repository] Cross-file changes, feature implementation, and codebase-wide modifications.
\end{description}

\subsection{Dimension 3: Integration Mode}

How the system integrates with the developer's workflow:

\begin{description}
    \item[IDE extension] Plugins for existing editors (VS Code, JetBrains, Vim).
    \item[Chat interface] Web-based or standalone conversation interfaces.
    \item[CLI tool] Command-line interfaces for terminal-centric workflows.
    \item[Standalone platform] Complete development environments with integrated AI capabilities.
\end{description}

\subsection{System Categories}

Using this taxonomy, we identify four primary categories:

\begin{table}[h]
\centering
\caption{Taxonomy of coding agent categories}
\label{tab:taxonomy}
\begin{tabular}{lccc}
\toprule
\textbf{Category} & \textbf{Autonomy} & \textbf{Scope} & \textbf{Integration} \\
\midrule
Code Completion Tools & L1--L2 & Line--Block & IDE extension \\
Conversational Assistants & L2--L3 & Function--File & Chat interface \\
Autonomous Agents & L3--L4 & File--Repository & CLI, Platform \\
Integrated Environments & L1--L4 & Line--Repository & Standalone IDE \\
\bottomrule
\end{tabular}
\end{table}

The following sections examine each category in detail.
```

**Step 2: Compile and verify**

```bash
pdflatex main.tex && bibtex main && pdflatex main.tex
```

**Step 3: Commit**

```bash
git add sections/taxonomy.tex
git commit -m "Add taxonomy section"
```

---

## Task 5: Code Completion Tools

**Files:**
- Modify: `sections/code-completion.tex`
- Modify: `references.bib`

**Step 1: Research current data on systems**

Systems to cover:
- GitHub Copilot
- Amazon CodeWhisperer
- Tabnine
- Codeium
- Sourcegraph Cody

**Step 2: Write code completion section**

```latex
\section{Code Completion Tools}
\label{sec:completion}

Code completion tools provide real-time, inline suggestions as developers type. They represent the most widely deployed category of AI coding tools.

\subsection{Capability Overview}

Modern code completion tools operate with tight latency constraints (typically under 100ms) to provide suggestions that feel instantaneous. They analyze the current file and limited surrounding context to predict what the developer will type next.

Key capabilities include:
\begin{itemize}
    \item Single-line and multi-line completions
    \item Fill-in-the-middle (FIM) suggestions
    \item Context-aware completions using imports and recent edits
    \item Ghost text preview before acceptance
\end{itemize}

\subsection{Major Systems}

\textbf{GitHub Copilot}~\citep{github2022copilot} launched in 2022 as the first widely-available AI code completion tool, powered initially by Codex and later by custom models. It integrates with VS Code, JetBrains IDEs, and Neovim. Copilot has evolved to include chat capabilities (Copilot Chat) and workspace-level features (Copilot Workspace).

\textbf{Amazon CodeWhisperer}~\citep{aws2023codewhisperer} provides similar functionality with emphasis on AWS service integration and security scanning. It offers a free tier for individual developers.

\textbf{Tabnine} pioneered AI code completion before the LLM era and has evolved to incorporate large language models. It offers on-premise deployment options for enterprises with strict data requirements.

\textbf{Codeium} provides free AI completion for individuals with a model trained to avoid reproducing licensed code verbatim.

\textbf{Sourcegraph Cody} combines code completion with codebase-aware chat, leveraging Sourcegraph's code intelligence infrastructure.

\subsection{Technical Approaches}

\textbf{Fill-in-the-middle (FIM)}: Rather than left-to-right generation, FIM models are trained to complete code given both prefix and suffix context. This enables more accurate completions mid-function.

\textbf{Context retrieval}: Systems retrieve relevant context from open files, recent edits, and imported modules. The quality of context selection significantly impacts suggestion relevance.

\textbf{Model architectures}: Systems use various models---proprietary (Copilot), open-source fine-tuned (some Tabnine configurations), or custom-trained (Codeium).

\subsection{Comparison}

\begin{table}[h]
\centering
\caption{Comparison of code completion tools}
\label{tab:completion}
\begin{tabular}{lcccc}
\toprule
\textbf{System} & \textbf{Model} & \textbf{Free Tier} & \textbf{On-Premise} & \textbf{Chat} \\
\midrule
GitHub Copilot & Proprietary & Limited & No & Yes \\
CodeWhisperer & Proprietary & Yes & No & Yes \\
Tabnine & Various & Yes & Yes & Yes \\
Codeium & Custom & Yes & Enterprise & Yes \\
Sourcegraph Cody & Various & Yes & Enterprise & Yes \\
\bottomrule
\end{tabular}
\end{table}

\subsection{Empirical Findings}

GitHub reports that Copilot users complete tasks up to 55\% faster~\citep{peng2023impact}. Studies show typical acceptance rates of 25--35\% for suggestions. However, concerns persist about code quality---research has identified security vulnerabilities in AI-generated code~\citep{pearce2022asleep} and potential license compliance issues.

\subsection{Limitations}

Code completion tools fundamentally operate without understanding of broader project goals:
\begin{itemize}
    \item Cannot ask clarifying questions about intent
    \item Limited cross-file context
    \item Quality varies significantly by language and task type
    \item May suggest code with security vulnerabilities or license issues
\end{itemize}
```

**Step 3: Add citations**

```bibtex
% === Code Completion ===
@misc{github2022copilot,
  title = {GitHub Copilot},
  author = {{GitHub}},
  year = {2022},
  howpublished = {\url{https://github.com/features/copilot}}
}

@misc{aws2023codewhisperer,
  title = {Amazon CodeWhisperer},
  author = {{Amazon Web Services}},
  year = {2023},
  howpublished = {\url{https://aws.amazon.com/codewhisperer/}}
}

@article{peng2023impact,
  title={The Impact of AI on Developer Productivity: Evidence from GitHub Copilot},
  author={Peng, Sida and others},
  journal={arXiv preprint arXiv:2302.06590},
  year={2023}
}

@inproceedings{pearce2022asleep,
  title={Asleep at the Keyboard? Assessing the Security of GitHub Copilot's Code Contributions},
  author={Pearce, Hammond and others},
  booktitle={IEEE Symposium on Security and Privacy},
  year={2022}
}
```

**Step 4: Compile and verify**

```bash
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

**Step 5: Commit**

```bash
git add sections/code-completion.tex references.bib
git commit -m "Add code completion tools section"
```

---

## Task 6: Conversational Assistants

**Files:**
- Modify: `sections/conversational.tex`
- Modify: `references.bib`

**Step 1: Write conversational assistants section**

```latex
\section{Conversational Coding Assistants}
\label{sec:conversational}

Conversational coding assistants enable multi-turn dialogue about code. Unlike completion tools, they support open-ended interaction but typically lack direct access to the developer's environment.

\subsection{Capability Overview}

Conversational assistants can:
\begin{itemize}
    \item Explain existing code
    \item Generate functions from descriptions
    \item Debug issues when given error messages
    \item Suggest refactoring approaches
    \item Discuss architecture and design trade-offs
\end{itemize}

The interaction model requires developers to copy code into the conversation and manually apply suggestions---a significant workflow friction compared to integrated tools.

\subsection{Major Systems}

\textbf{ChatGPT} (GPT-4, GPT-4o)~\citep{openai2023gpt4} established conversational coding as a mainstream capability. Its broad training enables handling diverse languages, frameworks, and coding styles.

\textbf{Claude}~\citep{anthropic2024claude} (Claude 3, Claude 3.5 Sonnet) emphasizes longer context windows (up to 200K tokens) enabling analysis of larger codebases within a single conversation.

\textbf{Gemini}~\citep{google2024gemini} integrates with Google's ecosystem and offers multimodal capabilities for understanding code alongside documentation and diagrams.

\textbf{Phind} specializes in developer queries, combining web search with code generation for up-to-date library and API information.

\subsection{Technical Considerations}

\textbf{Context windows}: The evolution from 8K to 128K+ token contexts has dramatically expanded what can be discussed in a single conversation. Claude's 200K context enables analyzing entire small codebases.

\textbf{System prompts}: Providers tune models with system prompts that improve coding performance, specify output formatting, and establish behavioral guidelines.

\textbf{Code formatting}: Models must correctly identify programming languages, maintain consistent indentation, and produce syntactically valid code.

\subsection{Strengths}

Conversational assistants excel at:
\begin{itemize}
    \item Flexible, exploratory interactions
    \item Handling ambiguous requests through clarification
    \item Educational explanations and learning support
    \item Language and framework-agnostic assistance
    \item Discussing trade-offs and alternatives
\end{itemize}

\subsection{Limitations}

Key limitations include:
\begin{itemize}
    \item \textbf{Workflow friction}: Copy-paste interaction disrupts development flow
    \item \textbf{No environment access}: Cannot see actual file contents or run tests
    \item \textbf{Cannot verify}: Suggestions may not work in context
    \item \textbf{Hallucination}: May fabricate APIs, library functions, or syntax
    \item \textbf{Stale knowledge}: Training cutoffs mean outdated library information
\end{itemize}
```

**Step 2: Add citations**

```bibtex
% === Conversational ===
@misc{openai2023gpt4,
  title = {GPT-4 Technical Report},
  author = {{OpenAI}},
  year = {2023},
  howpublished = {\url{https://arxiv.org/abs/2303.08774}}
}

@misc{anthropic2024claude,
  title = {Claude 3 Model Card},
  author = {{Anthropic}},
  year = {2024},
  howpublished = {\url{https://www.anthropic.com/claude}}
}

@misc{google2024gemini,
  title = {Gemini: A Family of Highly Capable Multimodal Models},
  author = {{Google DeepMind}},
  year = {2024},
  howpublished = {\url{https://arxiv.org/abs/2312.11805}}
}
```

**Step 3: Compile and verify**

**Step 4: Commit**

```bash
git add sections/conversational.tex references.bib
git commit -m "Add conversational assistants section"
```

---

## Task 7: Autonomous Coding Agents

**Files:**
- Modify: `sections/autonomous-agents.tex`
- Modify: `references.bib`

**Step 1: Research agent systems**

Key systems:
- SWE-agent (Princeton)
- Devin (Cognition Labs)
- OpenHands (formerly OpenDevin)
- Claude Code (Anthropic)
- Aider
- AutoCodeRover
- Agentless

**Step 2: Write autonomous agents section**

```latex
\section{Autonomous Coding Agents}
\label{sec:agents}

Autonomous coding agents represent the frontier of AI-assisted development. Unlike assistants that require manual application of suggestions, these systems can directly read files, write code, execute commands, and iterate on their work.

\subsection{Defining Autonomy}

An autonomous coding agent has:
\begin{itemize}
    \item \textbf{Environment access}: Can read and write files in an actual codebase
    \item \textbf{Execution capability}: Can run commands, tests, and scripts
    \item \textbf{Feedback loops}: Observes results and iterates on errors
    \item \textbf{Multi-step planning}: Decomposes complex tasks into actionable steps
\end{itemize}

The key distinction from assistants is operational: agents \emph{act} on code rather than merely \emph{advising} about it.

\subsection{Architectural Patterns}

Most autonomous agents follow variations of an observe-think-act loop:

\begin{enumerate}
    \item \textbf{Observe}: Gather information (read files, search code, check test results)
    \item \textbf{Think}: Reason about the task and plan next steps
    \item \textbf{Act}: Execute an action (edit file, run command)
    \item \textbf{Repeat}: Process results and continue
\end{enumerate}

\textbf{Tool use} is central to agent capabilities. Common tools include:
\begin{itemize}
    \item File operations (read, write, search, navigate)
    \item Shell command execution
    \item Web search and documentation lookup
    \item Browser automation for testing
\end{itemize}

\textbf{Memory} mechanisms help agents maintain context across long tasks:
\begin{itemize}
    \item Conversation history
    \item Scratchpads for working notes
    \item Retrieved context from codebase search
\end{itemize}

\subsection{Major Systems}

\subsubsection{SWE-agent}

SWE-agent~\citep{yang2024sweagent} from Princeton introduces the Agent-Computer Interface (ACI)---a set of custom commands designed for LLM interaction with codebases. Rather than raw shell access, SWE-agent provides commands like \texttt{find\_file}, \texttt{search\_dir}, and \texttt{edit} with structured output formats optimized for LLM parsing.

Key innovations:
\begin{itemize}
    \item ACI reduces errors from shell command complexity
    \item Search/replace editing prevents whole-file regeneration
    \item Achieves 12.5\% on SWE-bench (original) with GPT-4
\end{itemize}

\subsubsection{Devin}

Devin~\citep{cognition2024devin} from Cognition Labs is positioned as an ``AI software engineer'' with access to a complete development environment: shell, browser, and editor. It can execute long-running tasks autonomously, maintaining state across sessions.

Key features:
\begin{itemize}
    \item Full development environment (not just file access)
    \item Planning and checkpoint system for complex tasks
    \item Browser for testing and documentation lookup
    \item Reported strong SWE-bench performance (proprietary evaluation)
\end{itemize}

\subsubsection{OpenHands}

OpenHands~\citep{wang2024opendevin} (formerly OpenDevin) provides an open-source platform for building coding agents. It offers:
\begin{itemize}
    \item Modular architecture supporting different agent implementations
    \item Sandboxed execution environment
    \item Web interface and API access
    \item Multiple agent implementations for research comparison
\end{itemize}

\subsubsection{Claude Code}

Claude Code~\citep{anthropic2024claudecode} is Anthropic's CLI-based coding agent. It emphasizes:
\begin{itemize}
    \item Terminal-native workflow for existing developer tools
    \item Permission system for controlled autonomy
    \item Integration with git workflows
    \item Extended thinking for complex reasoning
\end{itemize}

\subsubsection{Aider}

Aider~\citep{gauthier2024aider} takes a git-native approach:
\begin{itemize}
    \item Automatic commits for each change
    \item Repository map for efficient context selection
    \item Architect/editor model separation for planning vs. implementation
    \item Support for multiple LLM providers
\end{itemize}

\subsubsection{Other Notable Systems}

\textbf{AutoCodeRover}~\citep{zhang2024autocoderover} uses program structure analysis (AST) rather than text search to locate relevant code, improving precision on bug localization.

\textbf{Agentless}~\citep{xia2024agentless} challenges the complexity of agent architectures, showing that a simple two-phase approach (localization then repair) can achieve competitive results with lower cost.

\subsection{Comparison}

\begin{table}[h]
\centering
\caption{Comparison of autonomous coding agents}
\label{tab:agents}
\begin{tabular}{lccccc}
\toprule
\textbf{System} & \textbf{Open} & \textbf{Model} & \textbf{Interface} & \textbf{SWE-bench} \\
\midrule
SWE-agent & Yes & Various & CLI & 12--18\% \\
Devin & No & Proprietary & Web & Claimed high \\
OpenHands & Yes & Various & Web/CLI & 15--25\% \\
Claude Code & No & Claude & CLI & Not published \\
Aider & Yes & Various & CLI & Benchmark varies \\
AutoCodeRover & Yes & Various & CLI & 19--22\% \\
Agentless & Yes & Various & CLI & 18--27\% \\
\bottomrule
\end{tabular}
\end{table}

\subsection{Common Challenges}

Autonomous agents face several persistent challenges:

\textbf{Long-horizon reliability}: Success rates decrease dramatically on tasks requiring many steps. Error cascades are common.

\textbf{Error recovery}: Agents often struggle to recover from mistakes, sometimes entering loops of repeated failed attempts.

\textbf{Security}: Agents with shell access pose security risks. Sandboxing and permission systems are essential but imperfect.

\textbf{Cost}: Agent runs can be expensive, with complex tasks requiring many LLM calls.
```

**Step 3: Add citations**

```bibtex
% === Autonomous Agents ===
@article{yang2024sweagent,
  title={SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering},
  author={Yang, John and others},
  journal={arXiv preprint arXiv:2405.15793},
  year={2024}
}

@misc{cognition2024devin,
  title = {Introducing Devin, the First AI Software Engineer},
  author = {{Cognition Labs}},
  year = {2024},
  howpublished = {\url{https://www.cognition.ai/blog/introducing-devin}}
}

@article{wang2024opendevin,
  title={OpenDevin: An Open Platform for AI Software Developers as Generalist Agents},
  author={Wang, Xingyao and others},
  journal={arXiv preprint arXiv:2407.16741},
  year={2024}
}

@misc{anthropic2024claudecode,
  title = {Claude Code},
  author = {{Anthropic}},
  year = {2024},
  howpublished = {\url{https://claude.ai/code}}
}

@misc{gauthier2024aider,
  title = {Aider: AI Pair Programming in Your Terminal},
  author = {Gauthier, Paul},
  year = {2024},
  howpublished = {\url{https://aider.chat}}
}

@article{zhang2024autocoderover,
  title={AutoCodeRover: Autonomous Program Improvement},
  author={Zhang, Yuntao and others},
  journal={arXiv preprint arXiv:2404.05427},
  year={2024}
}

@article{xia2024agentless,
  title={Agentless: Demystifying LLM-based Software Engineering Agents},
  author={Xia, Chunqiu Steven and others},
  journal={arXiv preprint arXiv:2407.01489},
  year={2024}
}
```

**Step 4: Compile and verify**

**Step 5: Commit**

```bash
git add sections/autonomous-agents.tex references.bib
git commit -m "Add autonomous coding agents section"
```

---

## Task 8: Integrated Development Environments

**Files:**
- Modify: `sections/ide-integration.tex`
- Modify: `references.bib`

**Step 1: Write IDE integration section**

```latex
\section{AI-Integrated Development Environments}
\label{sec:ide}

A new category of development environments combines completion, chat, and agent capabilities into unified experiences. These tools aim to reduce the friction of switching between separate AI tools.

\subsection{The Integration Thesis}

Integrated AI IDEs offer several advantages:
\begin{itemize}
    \item \textbf{Rich context}: Access to project structure, open files, terminal, git state
    \item \textbf{Lower friction}: No copy-paste between tools
    \item \textbf{Unified experience}: Completion, chat, and agent modes in one interface
    \item \textbf{Workflow integration}: AI actions integrated with editing, debugging, version control
\end{itemize}

\subsection{Capability Tiers}

We observe four tiers of AI capability in modern IDEs:

\begin{description}
    \item[Tier 1] Inline completion---baseline capability all AI IDEs share
    \item[Tier 2] Chat panel with codebase awareness
    \item[Tier 3] Multi-file editing and refactoring
    \item[Tier 4] Agentic execution (run commands, iterate on tests)
\end{description}

\subsection{Major Systems}

\subsubsection{Cursor}

Cursor~\citep{cursor2024} is a VS Code fork with deep AI integration:
\begin{itemize}
    \item \textbf{Composer}: Multi-file editing with diff preview
    \item \textbf{@ mentions}: Fine-grained context control (@file, @codebase, @docs)
    \item \textbf{Agent mode}: Autonomous task execution with terminal access
    \item \textbf{Tab}: Predictive edits based on recent changes
\end{itemize}

\subsubsection{Windsurf}

Windsurf (from Codeium) introduces the ``Cascade'' agent:
\begin{itemize}
    \item Deep codebase indexing for context retrieval
    \item Flow-based interaction model
    \item Autonomous multi-step task execution
\end{itemize}

\subsubsection{GitHub Copilot Workspace}

Copilot Workspace~\citep{github2024workspace} focuses on the issue-to-pull-request workflow:
\begin{itemize}
    \item Starts from GitHub issue description
    \item Generates specification and implementation plan
    \item Proposes multi-file changes
    \item Integrates with GitHub's review and CI systems
\end{itemize}

\subsubsection{Other Systems}

\textbf{JetBrains AI Assistant} integrates AI into IntelliJ-family IDEs with completion, chat, and refactoring support.

\textbf{Zed AI} builds AI capabilities into a new high-performance editor with collaborative features.

\subsection{UX Innovations}

AI IDEs have pioneered several interface patterns:
\begin{itemize}
    \item \textbf{Diff previews}: Show proposed changes before applying
    \item \textbf{Context control}: @ mentions and file pinning for precise context
    \item \textbf{Approval workflows}: Human checkpoints before file modifications
    \item \textbf{Inline editing}: Apply AI suggestions directly in the editor
\end{itemize}

\subsection{Trade-offs}

Integrated environments involve trade-offs:
\begin{itemize}
    \item \textbf{Vendor lock-in}: Leaving means losing AI capabilities
    \item \textbf{Model flexibility}: Some lock users to specific providers
    \item \textbf{Privacy}: Codebase indexing raises data handling questions
    \item \textbf{Learning curve}: New interfaces and workflows to learn
\end{itemize}
```

**Step 2: Add citations**

```bibtex
% === IDE Integration ===
@misc{cursor2024,
  title = {Cursor: The AI-first Code Editor},
  author = {{Anysphere}},
  year = {2024},
  howpublished = {\url{https://cursor.com}}
}

@misc{github2024workspace,
  title = {GitHub Copilot Workspace},
  author = {{GitHub}},
  year = {2024},
  howpublished = {\url{https://github.blog/2024-04-29-github-copilot-workspace/}}
}
```

**Step 3: Compile and verify**

**Step 4: Commit**

```bash
git add sections/ide-integration.tex references.bib
git commit -m "Add IDE integration section"
```

---

## Task 9: Benchmarks and Evaluation

**Files:**
- Modify: `sections/benchmarks.tex`
- Modify: `references.bib`

**Step 1: Research benchmark papers**

Key benchmarks:
- HumanEval (Chen et al., 2021)
- MBPP (Austin et al., 2021)
- SWE-bench (Jimenez et al., 2024)
- CodeContests (Li et al., 2022)

**Step 2: Write benchmarks section**

```latex
\section{Evaluation Benchmarks and Metrics}
\label{sec:benchmarks}

Evaluating coding agents requires benchmarks that capture real-world utility. This section surveys major benchmarks and discusses their strengths and limitations.

\subsection{Function-Level Benchmarks}

\textbf{HumanEval}~\citep{chen2021codex} contains 164 hand-written Python programming problems. Each problem includes a function signature, docstring, and test cases. The model must generate a function body that passes all tests.

\textbf{HumanEval+}~\citep{liu2023humaneval} augments HumanEval with additional test cases to catch solutions that pass original tests through shortcuts or edge case failures.

\textbf{MBPP}~\citep{austin2021mbpp} (Mostly Basic Python Programming) contains 974 crowd-sourced Python problems designed to be solvable by entry-level programmers.

These benchmarks measure basic code generation ability but have significant limitations:
\begin{itemize}
    \item Problems are short, self-contained, and unrealistic
    \item No project context or cross-file dependencies
    \item Focus on algorithmic problems rather than software engineering
\end{itemize}

\subsection{Repository-Level Benchmarks}

\textbf{SWE-bench}~\citep{jimenez2024swebench} represents a paradigm shift in evaluation. It contains 2,294 real GitHub issues from popular Python repositories, paired with the pull requests that resolved them. An agent must:
\begin{enumerate}
    \item Understand the issue description
    \item Navigate an unfamiliar codebase
    \item Identify relevant files
    \item Generate a patch that resolves the issue
    \item Pass the repository's test suite
\end{enumerate}

Variants include:
\begin{itemize}
    \item \textbf{SWE-bench Lite}: 300-problem subset for faster evaluation
    \item \textbf{SWE-bench Verified}: 500 human-verified problems with confirmed solvability
\end{itemize}

SWE-bench has become the de facto standard for evaluating autonomous coding agents, though it has limitations:
\begin{itemize}
    \item Focuses primarily on bug fixes
    \item Python-only
    \item Test-based evaluation may miss code quality issues
\end{itemize}

\subsection{Other Benchmarks}

\textbf{CodeContests}~\citep{li2022codeforces} uses competitive programming problems, testing algorithmic reasoning rather than software engineering.

\textbf{DS-1000}~\citep{lai2022ds1000} focuses on data science tasks using pandas, numpy, and related libraries.

\textbf{CrossCodeEval}~\citep{ding2023crosscodeeval} evaluates cross-file context utilization.

\textbf{RepoBench}~\citep{liu2023repobench} measures repository-level code completion.

\subsection{Metrics}

\textbf{pass@k}: The probability that at least one of $k$ generated solutions passes all tests. Typically reported as pass@1, pass@10, pass@100.

\textbf{Resolution rate}: For SWE-bench, the percentage of issues where the generated patch passes the test suite.

\textbf{Cost per task}: Emerging metric tracking API costs, relevant for practical deployment.

\subsection{Current State of the Art}

\begin{table}[h]
\centering
\caption{Selected results on major benchmarks (as of early 2025)}
\label{tab:benchmarks}
\begin{tabular}{lcc}
\toprule
\textbf{Benchmark} & \textbf{Top Performance} & \textbf{System} \\
\midrule
HumanEval & 95\%+ pass@1 & GPT-4, Claude 3.5 \\
MBPP & 85\%+ pass@1 & Various frontier models \\
SWE-bench Verified & 40--55\% & Top agents (2024--2025) \\
\bottomrule
\end{tabular}
\end{table}

\subsection{Limitations of Current Evaluation}

Current benchmarks leave significant gaps:

\begin{itemize}
    \item \textbf{Data contamination}: Popular benchmarks may appear in training data
    \item \textbf{Narrow task types}: Most focus on bug fixes, missing feature development
    \item \textbf{Missing dimensions}: Code quality, maintainability, security not measured
    \item \textbf{Real-world gap}: Benchmark success may not predict production utility
\end{itemize}

\subsection{Emerging Approaches}

Researchers are exploring:
\begin{itemize}
    \item Human evaluation studies of AI-assisted development
    \item A/B testing in production environments
    \item Multi-dimensional quality assessment (correctness + style + security)
    \item Task diversity beyond bug fixing
\end{itemize}
```

**Step 3: Add citations**

```bibtex
% === Benchmarks ===
@article{liu2023humaneval,
  title={Is Your Code Generated by ChatGPT Really Correct? Rigorous Evaluation of Large Language Models for Code Generation},
  author={Liu, Jiawei and others},
  journal={NeurIPS},
  year={2023}
}

@article{austin2021mbpp,
  title={Program Synthesis with Large Language Models},
  author={Austin, Jacob and others},
  journal={arXiv preprint arXiv:2108.07732},
  year={2021}
}

@article{jimenez2024swebench,
  title={SWE-bench: Can Language Models Resolve Real-World GitHub Issues?},
  author={Jimenez, Carlos E and others},
  journal={ICLR},
  year={2024}
}

@article{li2022codeforces,
  title={Competition-Level Code Generation with AlphaCode},
  author={Li, Yujia and others},
  journal={Science},
  year={2022}
}

@article{lai2022ds1000,
  title={DS-1000: A Natural and Reliable Benchmark for Data Science Code Generation},
  author={Lai, Yuhang and others},
  journal={ICML},
  year={2023}
}

@article{ding2023crosscodeeval,
  title={CrossCodeEval: A Diverse and Multilingual Benchmark for Cross-File Code Completion},
  author={Ding, Yangruibo and others},
  journal={NeurIPS},
  year={2023}
}

@article{liu2023repobench,
  title={RepoBench: Benchmarking Repository-Level Code Auto-Completion Systems},
  author={Liu, Tianyang and others},
  journal={arXiv preprint arXiv:2306.03091},
  year={2023}
}
```

**Step 4: Compile and verify**

**Step 5: Commit**

```bash
git add sections/benchmarks.tex references.bib
git commit -m "Add benchmarks and evaluation section"
```

---

## Task 10: Open Challenges and Future Directions

**Files:**
- Modify: `sections/challenges.tex`

**Step 1: Write challenges section**

```latex
\section{Open Challenges and Future Directions}
\label{sec:challenges}

Despite rapid progress, significant challenges remain. We organize these into technical, software engineering, and human factors categories.

\subsection{Technical Challenges}

\subsubsection{Reliability and Consistency}

Current agents remain unreliable on complex tasks. Specific issues include:
\begin{itemize}
    \item \textbf{Long-horizon failure}: Success rates decrease dramatically with task complexity
    \item \textbf{Non-determinism}: Same inputs can produce different outputs
    \item \textbf{Error cascades}: Early mistakes compound through multi-step tasks
    \item \textbf{Debugging difficulty}: Agent reasoning is often opaque
\end{itemize}

\subsubsection{Context and Scalability}

Large codebases present fundamental challenges:
\begin{itemize}
    \item Context windows, while growing, still cannot hold entire large projects
    \item Retrieval quality varies significantly across codebases
    \item Cross-repository dependencies are poorly handled
    \item Real-time context updates during editing remain difficult
\end{itemize}

\subsubsection{Verification and Testing}

Agents struggle to verify their own work:
\begin{itemize}
    \item Test generation quality lags code generation
    \item Agents cannot reliably assess whether changes are correct
    \item Formal verification integration remains limited
\end{itemize}

\subsection{Software Engineering Challenges}

\subsubsection{Code Quality}

Generated code may be functional but problematic:
\begin{itemize}
    \item Maintainability and readability concerns
    \item Inconsistent adherence to project style guides
    \item Violation of design patterns and idioms
    \item Technical debt accumulation from AI-generated code
\end{itemize}

\subsubsection{Security}

Security risks are significant:
\begin{itemize}
    \item Vulnerability introduction (common weakness patterns in training data)
    \item Secret leakage in prompts and context
    \item Supply chain risks from suggested dependencies
    \item Insufficient sandboxing of agent execution
\end{itemize}

\subsubsection{Intellectual Property}

Legal and ethical concerns persist:
\begin{itemize}
    \item License compliance in generated code
    \item Attribution requirements
    \item Copyright status of AI-generated code
    \item Training data provenance questions
\end{itemize}

\subsection{Human Factors}

\subsubsection{Skill Development}

Impact on developer learning is unclear:
\begin{itemize}
    \item Junior developers may miss foundational learning
    \item Over-reliance risks atrophy of debugging skills
    \item New skills required (prompt engineering, agent supervision)
    \item Educational curriculum implications
\end{itemize}

\subsubsection{Workflow Integration}

Practical integration challenges:
\begin{itemize}
    \item Code review of AI-generated code requires new approaches
    \item Team collaboration patterns with AI tools
    \item Trust calibration---when to accept vs. verify suggestions
    \item Organizational policies and governance
\end{itemize}

\subsection{Research Directions}

We identify several promising research directions:

\textbf{Better benchmarks}: Evaluation that captures real-world software engineering beyond bug fixes, including feature development, refactoring, and documentation.

\textbf{Human-agent collaboration}: Understanding optimal interaction patterns, trust calibration, and division of labor between humans and agents.

\textbf{Explainability}: Making agent reasoning transparent and debuggable.

\textbf{Domain-specific agents}: Specialized agents for security, testing, DevOps, and specific frameworks.

\textbf{Multi-agent systems}: Coordinating multiple specialized agents for complex software development tasks.

\textbf{Longitudinal studies}: Understanding long-term impact on code quality, developer skills, and team dynamics.
```

**Step 2: Compile and verify**

**Step 3: Commit**

```bash
git add sections/challenges.tex
git commit -m "Add open challenges and future directions section"
```

---

## Task 11: Conclusion

**Files:**
- Modify: `sections/conclusion.tex`

**Step 1: Write conclusion**

```latex
\section{Conclusion}
\label{sec:conclusion}

This survey has examined the rapidly evolving landscape of AI coding agents, from inline code completion to fully autonomous software development systems.

\subsection{Summary of Contributions}

We have presented:
\begin{itemize}
    \item A taxonomy categorizing coding agents by autonomy level, interaction scope, and integration mode
    \item Systematic coverage of major systems across four categories: code completion tools, conversational assistants, autonomous agents, and integrated development environments
    \item Analysis of evaluation benchmarks including HumanEval, MBPP, and SWE-bench, with discussion of their limitations
    \item Identification of open challenges in reliability, security, code quality, and human-agent collaboration
\end{itemize}

\subsection{Key Takeaways}

Several themes emerge from our analysis:

\textbf{Rapid capability growth}: The field has progressed from code completion to autonomous agents in approximately two years, with systems now capable of resolving real-world software issues.

\textbf{Persistent reliability challenges}: Despite impressive demonstrations, agents remain unreliable on complex, long-horizon tasks. Error rates that seem acceptable on benchmarks compound in practice.

\textbf{Evaluation gaps}: Current benchmarks, while valuable, do not fully capture real-world utility. Code quality, security, and maintainability remain difficult to measure.

\textbf{Research opportunities}: The intersection of AI and software engineering offers rich opportunities for research in human-AI collaboration, evaluation methodology, and specialized agent development.

\subsection{Looking Forward}

Coding agents represent a fundamental shift in software development. The tools surveyed here are early steps in a trajectory toward more capable AI assistance. The software engineering research community has a critical role to play---not only in advancing these capabilities, but in ensuring they improve rather than degrade software quality, developer skills, and the craft of programming.

We hope this survey serves as a useful map of the current landscape and a foundation for future research.
```

**Step 2: Compile and verify**

**Step 3: Commit**

```bash
git add sections/conclusion.tex
git commit -m "Add conclusion section"
```

---

## Task 12: Final Compilation and Review

**Files:**
- All files

**Step 1: Full compilation**

```bash
pdflatex main.tex && bibtex main && pdflatex main.tex && pdflatex main.tex
```

**Step 2: Check for errors and warnings**

Review LaTeX output for:
- Undefined references
- Missing citations
- Overfull/underfull boxes

**Step 3: Visual review of PDF**

Check:
- Table formatting
- Section flow
- Citation rendering
- Page breaks

**Step 4: Final commit**

```bash
git add -A
git commit -m "Complete first draft of coding agents survey"
```

---

## Summary

| Task | Section | Est. Time |
|------|---------|-----------|
| 0 | Project Setup | 5 min |
| 1 | Abstract | 10 min |
| 2 | Introduction | 20 min |
| 3 | Background | 30 min |
| 4 | Taxonomy | 15 min |
| 5 | Code Completion | 30 min |
| 6 | Conversational | 25 min |
| 7 | Autonomous Agents | 45 min |
| 8 | IDE Integration | 25 min |
| 9 | Benchmarks | 35 min |
| 10 | Challenges | 30 min |
| 11 | Conclusion | 15 min |
| 12 | Final Review | 15 min |

**Total: 13 tasks**
