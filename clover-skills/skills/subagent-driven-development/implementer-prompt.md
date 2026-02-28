# Implementer Subagent Prompt Template

Use this template when dispatching an implementer subagent.

```
Task tool (general-purpose):
  description: "Implement Task N: [task name]"
  prompt: |
    You are implementing Task N: [task name]

    ## Task Description

    [FULL TEXT of task from plan - paste it here, don't make subagent read file]

    ## Context

    [Scene-setting: where this fits, dependencies, architectural context]

    ## Before You Begin

    If you have questions about:
    - The requirements or acceptance criteria
    - The approach or implementation strategy
    - Dependencies or assumptions
    - Anything unclear in the task description

    **Ask them now.** Raise any concerns before starting work.

    ## Your Job

    Once you're clear on requirements:
    1. Write exactly what the task specifies
    2. Compile and verify LaTeX output
    3. Commit your work
    4. Self-review (see below)
    5. Report back

    Work from: [directory]

    **While you work:** If you encounter something unexpected or unclear, **ask questions**.
    It's always OK to pause and clarify. Don't guess or make assumptions.

    ## Before Reporting Back: Self-Review

    Review your work with fresh eyes. Ask yourself:

    **Completeness:**
    - Did I fully implement everything in the spec?
    - Did I miss any requirements?
    - Are there edge cases I didn't handle?

    **Quality:**
    - Is this my best work?
    - Is the writing clear and well-structured?
    - Does it flow logically with proper transitions?

    **Discipline:**
    - Did I avoid overbuilding (YAGNI)?
    - Did I only write what was requested?
    - Did I follow existing patterns in the document?

    **Verification:**
    - Does the LaTeX compile without errors?
    - Are all citations properly formatted?
    - Did I verify sources via DBLP/Scholar?

    If you find issues during self-review, fix them now before reporting.

    ## LaTeX Document Writing Rules

    When working on LaTeX documents, follow these rules strictly:

    ### NEVER Modify Template Files

    **CRITICAL: Do NOT edit these file types:**
    - `.sty` files (style files)
    - `.cls` files (class files)
    - `.bst` files (bibliography style files)
    - Any template-provided files

    Modifying journal/conference templates can cause desk rejection.

    ### Compile After Each Section

    After writing or editing LaTeX content:
    1. **Always compile the document** to generate the PDF
    2. Check for compilation errors
    3. If errors occur, fix them and recompile
    4. Confirm successful compilation

    ### Writing Style

    - **Avoid bullet points** - Write in flowing, connected prose
    - **Academic tone** - Maintain formal, scholarly language
    - **Logical flow** - Use clear transitions between paragraphs
    - **NEVER fabricate citations** - Only cite papers verified via DBLP/Scholar

    ## Report Format

    When done, report:
    - What you wrote
    - Compilation results (including any warnings)
    - Files changed
    - Self-review findings (if any)
    - Any issues or concerns
```
