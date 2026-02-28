---
name: add-to-sources
description: Use when saving URLs, papers, or references discussed in conversation to the project sources
---

# Add to Sources Skill

Use this skill when the user wants to add information discussed in the conversation to the project sources.

## When to Use

- User asks to save/add/register sources from conversation
- After research or discussion, user wants to persist findings
- User says things like "add to sources", "save this", "register this"

## Workflow

### Step 1: Identify Sources from Conversation

Review the conversation to find:
- URLs mentioned or visited (WebFetch, WebSearch results)
- Papers discussed
- Documentation referenced
- Any information the user wants to save

List what you found:
```
Found in conversation:
1. [URL/Source] - [Brief description]
2. [URL/Source] - [Brief description]
...
```

### Step 2: Confirm with User (if ambiguous)

If unclear which sources to add, ask:
"I found these sources in our conversation. Which would you like to add?"

### Step 3: Read Current Sources

```bash
cat .clover/sources.json
```

**File format (IMPORTANT):**

The file MUST be a JSON object with a `sources` array:
```json
{
  "sources": [
    { ... source 1 ... },
    { ... source 2 ... }
  ]
}
```

**NOT a bare array** like `[{...}, {...}]` - this will break the UI.

### Step 4: Add Sources with Rich Tags

**CRITICAL: Each source MUST have at least 10 tags.**

For each source, create entry:

```json
{
  "id": "unique-id",
  "name": "Descriptive name",
  "path": "URL or path",
  "type": "paper|website|documentation|article|report|tool",
  "tags": ["tag1", "tag2", "...", "tag10+"],
  "citation": "BibTeX if paper",
  "url": "Original URL",
  "enabled": true
}
```

Note: The `enabled` field controls whether the source is active. Sources with `enabled: false` are disabled by the user and should be ignored when reading sources.

**Tag Categories (use multiple from each):**
- **Domain**: research field, subfield, application area
- **Method**: technique, algorithm, approach
- **Concept**: key ideas, theories, frameworks
- **Relation**: related-to-[source-id], builds-on-[id], compares-[id]
- **Author**: author names (for papers)
- **Venue**: conference, journal, publisher
- **Year**: publication year
- **Format**: paper, tutorial, documentation, tool, dataset
- **Quality**: peer-reviewed, preprint, official, community
- **Relevance**: core, background, tangential, foundational

### Step 5: Update sources.json

Use Edit tool to add sources to `.clover/sources.json`:

```
Edit .clover/sources.json:
  old: "sources": [existing...]
  new: "sources": [existing..., new-source]
```

### Step 6: Confirm Addition

Report what was added:
```
Added to sources:
- [Name] (id: [id])
  Tags: [list key tags]
```

## Example

User: "Add that documentation we looked at to sources"

Response:
1. Review conversation - found: https://example.com/docs
2. Read config.json
3. Add source:
```json
{
  "id": "example-docs-001",
  "name": "Example Framework Documentation",
  "path": "https://example.com/docs",
  "type": "documentation",
  "tags": [
    "framework-name",
    "web-development",
    "api-reference",
    "official-docs",
    "tutorial",
    "getting-started",
    "configuration",
    "best-practices",
    "documentation",
    "foundational"
  ],
  "url": "https://example.com/docs"
}
```
4. Edit sources.json
5. Confirm: "Added 'Example Framework Documentation' to sources."

## Important Rules

1. **Always check conversation context** - Don't ask user to repeat URLs
2. **Minimum 10 tags** - Enable graph-based discovery
3. **Use relation tags** - Connect to existing sources when relevant
4. **Verify URLs** - Ensure they're valid before adding
5. **Don't duplicate** - Check if source already exists
