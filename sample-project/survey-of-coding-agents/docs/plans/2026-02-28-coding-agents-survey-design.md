# Design Document: Survey of Coding Agents

**Date:** 2026-02-28
**Type:** Academic Survey Paper
**Audience:** Software Engineering Researchers
**Language:** English
**Target Venue:** Flexible (adaptable to conference or journal)

---

## Overview

A comprehensive survey of AI-powered coding agents covering the LLM era (2022-present). The paper uses a taxonomy-based organization to categorize systems by capability and autonomy level.

---

## Working Title

"Coding Agents: A Survey of AI-Powered Software Development Tools"

**Alternatives:**
- "From Code Completion to Autonomous Agents: A Survey of AI-Assisted Software Development"
- "The Rise of Coding Agents: A Comprehensive Survey"

---

## Abstract Structure (~200 words)

1. Context: LLMs have transformed software development
2. Gap: Rapid proliferation makes it hard to understand the landscape
3. Contribution: Comprehensive taxonomy and analysis
4. Scope: Code completion tools, conversational assistants, autonomous agents, IDE integrations (2022-present)
5. Method: Systematic analysis of capabilities, architectures, and evaluation benchmarks
6. Findings: Key insights about current state and trends
7. Implications: Open challenges and future research directions

---

## Paper Structure

### Section 1: Introduction (~1.5-2 pages)

1. **Opening hook** — Transformation of software development by AI (GitHub reports 46%+ code AI-assisted, rise of "vibe coding")

2. **Problem statement** — Rapid evolution creates gaps in understanding:
   - What capabilities exist across different tools
   - How systems compare architecturally
   - What benchmarks measure and what they miss
   - Where the field is heading

3. **Contribution statement:**
   - Taxonomy categorizing coding agents by capability and autonomy level
   - Systematic coverage of major systems (2022-present)
   - Analysis of evaluation benchmarks and their limitations
   - Identification of open challenges for SE research

4. **Scope boundaries:**
   - In scope: Tools that assist with code writing/modification, LLM-era systems (2022-present), publicly documented systems
   - Out of scope: General program synthesis, formal verification, non-LLM static analysis

5. **Paper organization** — Roadmap of sections

---

### Section 2: Background & Foundations (~2-3 pages)

1. **Large Language Models for Code**
   - Transformer-based code models (Codex, CodeGen, StarCoder, Code Llama)
   - Key capabilities: code understanding, generation, infilling
   - Training data considerations

2. **From Models to Tools**
   - Gap between model and usable tool
   - Key components: context management, prompt engineering, tool use
   - Shift from single-turn to multi-turn interaction

3. **Agent Paradigm**
   - What makes "agent" vs. "tool"
   - Core concepts: planning, tool use, memory, feedback loops
   - ReAct pattern influence

4. **Terminology & Definitions**
   - Code completion: Single-point suggestions during editing
   - Code generation: Creating code from natural language
   - Coding assistant: Interactive, conversational help
   - Coding agent: Autonomous multi-step task execution
   - Agentic coding: Human-AI collaborative workflows

---

### Section 3: Taxonomy of Coding Agents (~2 pages)

**Dimension 1: Autonomy Level**
- Level 1: Reactive (responds to explicit requests)
- Level 2: Proactive (suggests actions, human executes)
- Level 3: Semi-autonomous (executes with human approval)
- Level 4: Autonomous (executes independently)

**Dimension 2: Interaction Scope**
- Single-line (code completion)
- Function/block level (code generation)
- File level (refactoring, bug fixing)
- Repository level (cross-file changes)

**Dimension 3: Integration Mode**
- IDE extension
- Chat interface
- CLI tool
- Standalone platform

**Category Definitions:**
- Code Completion Tools (Level 1-2, single-line to block)
- Conversational Assistants (Level 2-3, function to file)
- Autonomous Agents (Level 3-4, file to repository)
- Integrated Environments (span multiple levels)

---

### Section 4: Code Completion Tools (~2-3 pages)

**Systems:** GitHub Copilot, Amazon CodeWhisperer, Tabnine, Codeium, SourceGraph Cody

**Content:**
1. Capability overview (real-time inline suggestions, context window, latency)
2. Technical approaches (FIM, context retrieval, model architectures)
3. System comparison table
4. Empirical findings (productivity studies, acceptance rates, quality concerns)
5. Limitations (no broad context, cannot clarify, quality variance)

---

### Section 5: Conversational Coding Assistants (~2-3 pages)

**Systems:** ChatGPT (GPT-4), Claude, Gemini, Phind, Perplexity

**Content:**
1. Capability overview (multi-turn dialogue, no direct file access)
2. Interaction patterns (explanation, generation, debugging, review)
3. Technical considerations (context windows, system prompts, formatting)
4. Strengths (flexible, good for exploration, language agnostic)
5. Limitations (copy-paste friction, no codebase access, hallucinations)

---

### Section 6: Autonomous Coding Agents (~4-5 pages)

**Systems:** SWE-agent, Devin, OpenHands, Claude Code, Aider, Mentat, GPT Engineer, AutoCodeRover, Agentless, Factory, Poolside, Magic

**Content:**
1. Defining autonomy (operate on actual codebases, capabilities)
2. Architectural patterns
   - Agent loop: Observe → Think → Act → Observe
   - Tool use: File operations, shell, web, browser
   - Memory: History, scratchpads, retrieval
   - Planning: Explicit vs. implicit

3. System deep dives
   - **SWE-agent:** ACI design, custom commands, search/replace editing
   - **Devin:** Full dev environment, long-running tasks, planning/checkpoints
   - **OpenHands:** Open-source, modular architecture
   - **Claude Code:** CLI workflow, permission system, tool integration
   - **Aider:** Git-native, architect/editor model, repository map

4. Comparison table (open/closed source, models, capabilities, SWE-bench)
5. Common challenges (reliability, error recovery, security, cost)

---

### Section 7: Integrated Development Environments (~2 pages)

**Systems:** Cursor, Windsurf, GitHub Copilot Workspace, JetBrains AI, VS Code + Copilot Chat, Zed AI

**Content:**
1. IDE integration thesis (combined capabilities, rich context, low friction)
2. Capability tiers (completion → chat → multi-file → agentic)
3. System highlights
   - **Cursor:** Composer, @ mentions, agent mode, tab prediction
   - **Windsurf:** Cascade agent, deep indexing, flow-based
   - **Copilot Workspace:** Issue-to-PR, planning, GitHub integration
4. UX innovations (diff previews, context control, approval workflows)
5. Trade-offs (vendor lock-in, model flexibility, privacy)

---

### Section 8: Evaluation Benchmarks & Metrics (~3-4 pages)

**Benchmarks:** HumanEval/+, MBPP/+, SWE-bench/Lite/Verified, CodeContests, DS-1000, CrossCodeEval, RepoBench, DevBench, Aider benchmark

**Content:**
1. Benchmark categories
   - Function-level: HumanEval, MBPP
   - Competitive programming: CodeContests
   - Repository-level: SWE-bench variants
   - Specialized: DS-1000, CrossCodeEval, RepoBench

2. Metrics (pass@k, exact match, resolution rate, cost per task)
3. Current state of the art (results table, leaderboard highlights)
4. Limitations (contamination, narrow tasks, missing dimensions)
5. Emerging approaches (human evaluation, A/B testing, multi-dimensional)

---

### Section 9: Open Challenges & Future Directions (~2-3 pages)

**Technical Challenges:**
- Reliability & consistency (long-horizon failure, non-determinism)
- Context & scalability (large codebases, retrieval quality)
- Verification & testing (self-verification, test generation)

**Software Engineering Challenges:**
- Code quality (maintainability, style, technical debt)
- Security (vulnerabilities, secret leakage, supply chain)
- Intellectual property (license compliance, attribution, copyright)

**Human Factors:**
- Skill development (junior learning, over-reliance, new skills)
- Workflow integration (code review, collaboration, trust)

**Research Directions:**
- Better real-world benchmarks
- Human-agent collaboration models
- Explainability and transparency
- Domain-specific agents
- Multi-agent systems

---

### Section 10: Conclusion (~1 page)

1. Summary of contributions
2. Key takeaways
   - Rapid progress from completion to autonomous agents (~2 years)
   - Impressive capabilities but unreliable for complex tasks
   - Benchmarks lag system capabilities
   - Research opportunities in reliability, security, human-agent collaboration
3. Closing perspective on SE research community's role

---

## Estimated Length

| Section | Pages |
|---------|-------|
| Abstract | 0.5 |
| 1. Introduction | 1.5-2 |
| 2. Background & Foundations | 2-3 |
| 3. Taxonomy | 2 |
| 4. Code Completion Tools | 2-3 |
| 5. Conversational Assistants | 2-3 |
| 6. Autonomous Agents | 4-5 |
| 7. Integrated Environments | 2 |
| 8. Benchmarks & Evaluation | 3-4 |
| 9. Open Challenges | 2-3 |
| 10. Conclusion | 1 |
| References | 2-3 |
| **Total** | **~24-30** |

---

## Key Systems to Cover

**Code Completion:** GitHub Copilot, CodeWhisperer, Tabnine, Codeium, Cody

**Conversational:** ChatGPT/GPT-4, Claude, Gemini, Phind

**Autonomous Agents:** SWE-agent, Devin, OpenHands, Claude Code, Aider, Mentat, GPT Engineer, AutoCodeRover, Agentless

**IDEs:** Cursor, Windsurf, Copilot Workspace, JetBrains AI, Zed AI

**Benchmarks:** HumanEval, MBPP, SWE-bench, CodeContests, DS-1000

---

## Next Steps

1. Create detailed implementation plan (invoke writing-plans skill)
2. Gather and verify references for all systems
3. Write sections in order, with research and citation for each
4. Review and refine
