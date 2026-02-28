---
name: subagent-driven-development
description: Use when executing writing plans with independent tasks in the current session - dispatches fresh subagent per task with review.
---

# Subagent-Driven Development

Execute plan by dispatching fresh subagent per task, with two-stage review after each: spec compliance review first, then content quality review.

**Core principle:** Fresh subagent per task + two-stage review (spec then quality) = high quality, fast iteration

**Source-first writing:** Before writing any section, sources MUST be collected and read. Never write without sources.

## When to Use

```dot
digraph when_to_use {
    "Have implementation plan?" [shape=diamond];
    "Tasks mostly independent?" [shape=diamond];
    "Stay in this session?" [shape=diamond];
    "subagent-driven-development" [shape=box];
    "executing-plans" [shape=box];
    "Manual execution or brainstorm first" [shape=box];

    "Have implementation plan?" -> "Tasks mostly independent?" [label="yes"];
    "Have implementation plan?" -> "Manual execution or brainstorm first" [label="no"];
    "Tasks mostly independent?" -> "Stay in this session?" [label="yes"];
    "Tasks mostly independent?" -> "Manual execution or brainstorm first" [label="no - tightly coupled"];
    "Stay in this session?" -> "subagent-driven-development" [label="yes"];
    "Stay in this session?" -> "Manual execution or brainstorm first" [label="no - parallel session"];
}
```

**Characteristics:**
- Same session (no context switch)
- Fresh subagent per task (no context pollution)
- Two-stage review after each task: spec compliance first, then content quality
- Faster iteration (no human-in-loop between tasks)

## The Process

```dot
digraph process {
    rankdir=TB;

    subgraph cluster_per_task {
        label="Per Task";
        "Check source collection method from design" [shape=box];
        "Source method?" [shape=diamond];
        "Research and add sources (add-to-sources skill)" [shape=box];
        "Ask user to add sources via Clover UI" [shape=box];
        "Both: research + ask user" [shape=box];
        "Read sources.json for this section" [shape=box];
        "Dispatch implementer subagent (./implementer-prompt.md)" [shape=box];
        "Implementer subagent asks questions?" [shape=diamond];
        "Answer questions, provide context" [shape=box];
        "Implementer subagent writes based on sources, self-reviews" [shape=box];
        "Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)" [shape=box];
        "Spec reviewer subagent confirms content matches spec?" [shape=diamond];
        "Implementer subagent fixes spec gaps" [shape=box];
        "Dispatch content quality reviewer subagent (./content-quality-reviewer-prompt.md)" [shape=box];
        "Content quality reviewer subagent approves?" [shape=diamond];
        "Implementer subagent fixes quality issues" [shape=box];
        "Mark task complete in TodoWrite" [shape=box];
    }

    "Read plan, extract all tasks with full text, note source collection method, create TodoWrite" [shape=box];
    "More tasks remain?" [shape=diamond];
    "Dispatch final content reviewer subagent for entire document" [shape=box];
    "Complete development work" [shape=box style=filled fillcolor=lightgreen];

    "Read plan, extract all tasks with full text, note source collection method, create TodoWrite" -> "Check source collection method from design";
    "Check source collection method from design" -> "Source method?";
    "Source method?" -> "Research and add sources (add-to-sources skill)" [label="agent"];
    "Source method?" -> "Ask user to add sources via Clover UI" [label="user"];
    "Source method?" -> "Both: research + ask user" [label="both"];
    "Research and add sources (add-to-sources skill)" -> "Read sources.json for this section";
    "Ask user to add sources via Clover UI" -> "Read sources.json for this section";
    "Both: research + ask user" -> "Read sources.json for this section";
    "Read sources.json for this section" -> "Dispatch implementer subagent (./implementer-prompt.md)";
    "Dispatch implementer subagent (./implementer-prompt.md)" -> "Implementer subagent asks questions?";
    "Implementer subagent asks questions?" -> "Answer questions, provide context" [label="yes"];
    "Answer questions, provide context" -> "Dispatch implementer subagent (./implementer-prompt.md)";
    "Implementer subagent asks questions?" -> "Implementer subagent writes based on sources, self-reviews" [label="no"];
    "Implementer subagent writes based on sources, self-reviews" -> "Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)";
    "Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)" -> "Spec reviewer subagent confirms content matches spec?";
    "Spec reviewer subagent confirms content matches spec?" -> "Implementer subagent fixes spec gaps" [label="no"];
    "Implementer subagent fixes spec gaps" -> "Dispatch spec reviewer subagent (./spec-reviewer-prompt.md)" [label="re-review"];
    "Spec reviewer subagent confirms content matches spec?" -> "Dispatch content quality reviewer subagent (./content-quality-reviewer-prompt.md)" [label="yes"];
    "Dispatch content quality reviewer subagent (./content-quality-reviewer-prompt.md)" -> "Content quality reviewer subagent approves?";
    "Content quality reviewer subagent approves?" -> "Implementer subagent fixes quality issues" [label="no"];
    "Implementer subagent fixes quality issues" -> "Dispatch content quality reviewer subagent (./content-quality-reviewer-prompt.md)" [label="re-review"];
    "Content quality reviewer subagent approves?" -> "Mark task complete in TodoWrite" [label="yes"];
    "Mark task complete in TodoWrite" -> "More tasks remain?";
    "More tasks remain?" -> "Check source collection method from design" [label="yes"];
    "More tasks remain?" -> "Dispatch final content reviewer subagent for entire document" [label="no"];
    "Dispatch final content reviewer subagent for entire document" -> "Complete development work";
}
```

## Source Collection Before Writing

<HARD-GATE>
NEVER write content without first collecting and reading sources. This prevents hallucinated content.
</HARD-GATE>

**Before each section:**

1. **Check design doc** for source collection method (set during brainstorming)
2. **Collect sources** based on method:
   - **Agent researches**: Use add-to-sources skill to find and add relevant papers/references
   - **User adds**: Ask user "Please add sources for [section] via Clover's Add button, then confirm when ready"
   - **Both**: Research first, then ask user if they have additional sources
3. **Read sources.json** and extract relevant content for this section
4. **Provide sources to implementer subagent** as part of context

## Prompt Templates

- `./implementer-prompt.md` - Dispatch implementer subagent
- `./spec-reviewer-prompt.md` - Dispatch spec compliance reviewer subagent
- `./content-quality-reviewer-prompt.md` - Dispatch content quality reviewer subagent

## Example Workflow

```
You: I'm using Subagent-Driven Development to execute this plan.

[Read plan file once: docs/plans/feature-plan.md]
[Extract all 5 tasks with full text and context]
[Create TodoWrite with all tasks]

Task 1: Hook installation script

[Get Task 1 text and context (already extracted)]
[Dispatch implementation subagent with full task text + context]

Implementer: "Before I begin - should the hook be installed at user or system level?"

You: "User level (~/.config/clover/hooks/)"

Implementer: "Got it. Implementing now..."
[Later] Implementer:
  - Implemented install-hook command
  - Added tests, 5/5 passing
  - Self-review: Found I missed --force flag, added it
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ✅ Spec compliant - all requirements met, nothing extra

[Get git SHAs, dispatch content quality reviewer]
Content reviewer: Strengths: Clear writing, well-structured. Issues: None. Approved.

[Mark Task 1 complete]

Task 2: Recovery modes

[Get Task 2 text and context (already extracted)]
[Dispatch implementation subagent with full task text + context]

Implementer: [No questions, proceeds]
Implementer:
  - Added verify/repair modes
  - 8/8 tests passing
  - Self-review: All good
  - Committed

[Dispatch spec compliance reviewer]
Spec reviewer: ❌ Issues:
  - Missing: Progress reporting (spec says "report every 100 items")
  - Extra: Added --json flag (not requested)

[Implementer fixes issues]
Implementer: Removed --json flag, added progress reporting

[Spec reviewer reviews again]
Spec reviewer: ✅ Spec compliant now

[Dispatch content quality reviewer]
Content reviewer: Strengths: Solid. Issues (Important): Missing citation for claim

[Implementer fixes]
Implementer: Added citation from sources.json

[Content reviewer reviews again]
Content reviewer: ✅ Approved

[Mark Task 2 complete]

...

[After all tasks]
[Dispatch final content reviewer]
Final reviewer: All requirements met, document complete

Done!
```

## Advantages

**vs. Manual execution:**
- Fresh context per task (no confusion)
- Parallel-safe (subagents don't interfere)
- Subagent can ask questions (before AND during work)

**Advantages:**
- Same session (no handoff)
- Continuous progress (no waiting)
- Review checkpoints automatic

**Efficiency gains:**
- No file reading overhead (controller provides full text)
- Controller curates exactly what context is needed
- Subagent gets complete information upfront
- Questions surfaced before work begins (not after)

**Quality gates:**
- Self-review catches issues before handoff
- Two-stage review: spec compliance, then content quality
- Review loops ensure fixes actually work
- Spec compliance prevents over/under-building
- Content quality ensures writing is well-structured

**Cost:**
- More subagent invocations (implementer + 2 reviewers per task)
- Controller does more prep work (extracting all tasks upfront)
- Review loops add iterations
- But catches issues early (cheaper than debugging later)

## Red Flags

**Never:**
- Start implementation on main/master branch without explicit user consent
- Skip reviews (spec compliance OR code quality)
- Proceed with unfixed issues
- Dispatch multiple implementation subagents in parallel (conflicts)
- Make subagent read plan file (provide full text instead)
- Skip scene-setting context (subagent needs to understand where task fits)
- Ignore subagent questions (answer before letting them proceed)
- Accept "close enough" on spec compliance (spec reviewer found issues = not done)
- Skip review loops (reviewer found issues = implementer fixes = review again)
- Let implementer self-review replace actual review (both are needed)
- **Start content quality review before spec compliance is ✅** (wrong order)
- Move to next task while either review has open issues
- **Write without reading sources first** (causes hallucinated content)
- **Skip source collection step** (design doc specifies how sources are gathered)

**If subagent asks questions:**
- Answer clearly and completely
- Provide additional context if needed
- Don't rush them into implementation

**If reviewer finds issues:**
- Implementer (same subagent) fixes them
- Reviewer reviews again
- Repeat until approved
- Don't skip the re-review

**If subagent fails task:**
- Dispatch fix subagent with specific instructions
- Don't try to fix manually (context pollution)

## Integration

**Related skills:**
- **clover-skills:writing-plans** - Creates the plan this skill executes
- **clover-skills:paper-research** - For finding and verifying sources
