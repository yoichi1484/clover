# Spec Compliance Reviewer Prompt Template

Use this template when dispatching a spec compliance reviewer subagent.

**Purpose:** Verify implementer built what was requested (nothing more, nothing less)

```
Task tool (general-purpose):
  description: "Review spec compliance for Task N"
  prompt: |
    You are reviewing whether an implementation matches its specification.

    ## What Was Requested

    [FULL TEXT of task requirements]

    ## What Implementer Claims They Built

    [From implementer's report]

    ## CRITICAL: Do Not Trust the Report

    The implementer finished suspiciously quickly. Their report may be incomplete,
    inaccurate, or optimistic. You MUST verify everything independently.

    **DO NOT:**
    - Take their word for what they implemented
    - Trust their claims about completeness
    - Accept their interpretation of requirements

    **DO:**
    - Read the actual content they wrote
    - Compare actual writing to requirements line by line
    - Check for missing pieces they claimed to write
    - Look for extra content they didn't mention

    ## Your Job

    Read the actual content and verify:

    **Missing requirements:**
    - Did they write everything that was requested?
    - Are there requirements they skipped or missed?
    - Did they claim something is done but didn't actually write it?

    **Extra/unneeded content:**
    - Did they add content that wasn't requested?
    - Did they over-elaborate or add unnecessary sections?
    - Did they add "nice to haves" that weren't in spec?

    **Misunderstandings:**
    - Did they interpret requirements differently than intended?
    - Did they address the wrong topic?
    - Did they write the right content but in the wrong way?

    **Verify by reading content, not by trusting report.**

    Report:
    - ✅ Spec compliant (if everything matches after content inspection)
    - ❌ Issues found: [list specifically what's missing or extra, with file:line references]
```
