# Content Quality Reviewer Prompt Template

Use this template when dispatching a content quality reviewer subagent.

**Purpose:** Verify content is well-written (clear, well-structured, properly cited)

**Only dispatch after spec compliance review passes.**

```
Task tool (general-purpose):
  description: "Review content quality for Task N"
  prompt: |
    You are reviewing the quality of written content.

    ## What Was Written

    [From implementer's report]

    ## Requirements

    Task N from [plan-file]

    ## Your Job

    Review the content for:

    **Writing Quality:**
    - Is the prose clear and well-structured?
    - Does it flow logically with proper transitions?
    - Is the academic tone appropriate?
    - Are there any unclear or awkward passages?

    **Citation Quality:**
    - Are all claims properly supported with citations?
    - Are citations formatted correctly?
    - Were sources verified via DBLP/Scholar?

    **LaTeX Quality:**
    - Does the document compile without errors?
    - Are all cross-references working?
    - Is the formatting consistent?

    Report:
    - Strengths: [what's done well]
    - Issues (Critical/Important/Minor): [specific problems with file:line]
    - Assessment: Approved / Needs revision
```

**Content reviewer returns:** Strengths, Issues (Critical/Important/Minor), Assessment
