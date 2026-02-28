---
name: writing-plans
description: Use when you have a spec or requirements for a multi-step task, before starting work. Creates detailed step-by-step plans.
---

# Writing Plans

## Overview

Write comprehensive plans assuming the writer has zero context for our project. Document everything they need to know: which files to touch for each task, content to write, sources to check, how to verify. Give them the whole plan as bite-sized tasks. DRY. YAGNI. Frequent commits.

Assume they are a skilled writer, but know almost nothing about our document structure or research domain.

**Announce at start:** "I'm using the writing-plans skill to create the plan."

**Context:** This should be run after brainstorming skill completes.

**Save plans to:** `docs/plans/YYYY-MM-DD-<feature-name>.md`

## Bite-Sized Task Granularity

**Each step is one action (2-5 minutes):**
- "Write the section outline" - step
- "Draft the section content" - step
- "Add citations from sources" - step
- "Compile and verify" - step
- "Commit" - step

## Plan Document Header

**Every plan MUST start with this header:**

```markdown
# [Document Name] Writing Plan

**Goal:** [One sentence describing what this produces]

**Structure:** [2-3 sentences about approach]

**Format:** [LaTeX, Markdown, etc.]

---
```

## Task Structure

````markdown
### Task N: [Section Name]

**Files:**
- Create: `sections/new-section.tex`
- Modify: `main.tex:50-70`
- Sources: `references.bib`

**Step 1: Review sources for this section**

Check sources.json for relevant references:
- source-001: [Paper on topic]
- source-002: [Documentation]

**Step 2: Write section content**

```latex
\section{Section Title}

Introduction paragraph explaining the topic...

\subsection{Subsection}
Detailed content with citations \cite{key1, key2}.
```

**Step 3: Add citations to references.bib**

```bibtex
@article{key1,
  title={Paper Title},
  author={Author Name},
  year={2024}
}
```

**Step 4: Compile and verify**

Run: `latexmk -pdf main.tex`
Expected: PDF generated without errors

**Step 5: Commit**

```bash
git add main.tex references.bib
git commit -m "Add [section name] section"
```
````

## Remember
- Exact file paths always
- Complete content in plan (not "add more detail")
- Exact commands with expected output
- Reference relevant skills
- DRY, YAGNI, frequent commits

## Execution Handoff

After saving the plan, offer execution choice:

**"Plan complete and saved to `docs/plans/<filename>.md`. Two execution options:**

**1. Subagent-Driven (this session)** - I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** - Open new session with executing-plans, batch execution with checkpoints

**Which approach?"**

**If Subagent-Driven chosen:**
- **REQUIRED SUB-SKILL:** Use clover-skills:subagent-driven-development
- Stay in this session
- Fresh subagent per task + content review

**If Parallel Session chosen:**
- Guide them to open new session in worktree
- Execution plan should be followed task-by-task with review checkpoints
