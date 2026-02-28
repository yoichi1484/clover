---
name: paper-research
description: Use when researching topics, finding papers, literature review, or gathering references. NEVER fabricate citations - always verify via DBLP/Scholar.
---

# Deep Research Skill

Use this skill when the user asks to research topics, find papers, or gather expert knowledge.

## Default Behavior

**Unless the user specifies otherwise, research BOTH:**
1. Academic papers (peer-reviewed sources)
2. General sources (documentation, articles, reports, tutorials, etc.)

This provides comprehensive coverage of the topic.

## Research Types

### 1. Academic Paper Research

When looking for academic papers:

**CRITICAL: Never invent papers. Always verify existence.**

1. **Search DBLP first** (for CS papers):
   - URL: `https://dblp.org/search?q=QUERY`
   - Get exact title, authors, year, venue
   - Get BibTeX entry

2. **Search Google Scholar** (for broader coverage):
   - URL: `https://scholar.google.com/scholar?q=QUERY`
   - Verify paper exists before citing

3. **Search Semantic Scholar** (alternative):
   - URL: `https://www.semanticscholar.org/search?q=QUERY`

4. **arXiv** (for preprints):
   - URL: `https://arxiv.org/search/?query=QUERY`

**Verification Process:**
```
1. Search for paper by title/author/topic
2. Find actual paper entry
3. Copy exact citation information
4. Record URL to the source
5. Only then add to sources
```

### 2. General Knowledge Research

For non-paper research (concepts, techniques, data):

**Authoritative Sources:**
- Official documentation (APIs, frameworks, tools)
- Wikipedia for overviews and definitions
- Technical blogs from reputable sources (company engineering blogs, etc.)
- Government/organization reports and white papers
- News articles from trusted sources
- Tutorials and guides from official sources
- Stack Overflow for technical solutions (with high votes)

**No DBLP verification needed for these sources.**

## Workflow

### Step 1: Understand the Request

Ask if unclear:
- What topic to research?
- Academic papers only, general sources only, or both? (default: both)
- How many sources needed?
- Any specific authors/venues to focus on?

### Step 2: Conduct Research (Both Types by Default)

**For Papers:**
```
1. WebSearch for: "[topic] site:dblp.org" or "[topic] site:scholar.google.com"
2. WebFetch the results page
3. Extract verified paper information:
   - Title (exact)
   - Authors (full names)
   - Year
   - Venue (conference/journal)
   - URL to DBLP/Scholar entry
4. If available, get BibTeX
```

**For General Sources:**
```
1. WebSearch for: "[topic] tutorial", "[topic] documentation", "[topic] guide"
2. WebSearch for: "[topic] site:github.com", "[topic] site:medium.com", "[topic] site:dev.to"
3. WebFetch relevant pages
4. Extract key information
5. Record source URLs with credibility notes
```

### Step 3: Add to Sources (MANDATORY)

**CRITICAL: You MUST add sources to `.clover/sources.json` BEFORE reporting findings.**

This step is NOT optional. Always execute these commands:

1. **Read current sources:**
```bash
cat .clover/sources.json
```

2. **File format (IMPORTANT):**

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

3. **Add each source to the `sources` array using Edit tool:**

```json
{
  "id": "unique-id",
  "name": "Short descriptive name",
  "path": "URL or local path",
  "type": "paper|website|documentation|article|report",
  "tags": ["minimum", "10", "tags", "per", "source"],
  "citation": "BibTeX or citation info (for papers)",
  "url": "Original URL where found"
}
```

**CRITICAL: Tagging Rules for Graph Structure**

Each source MUST have **at least 10 tags** to enable graph-based source discovery:

Tag categories (use multiple from each):
- **Domain**: research field, subfield, application area
- **Method**: technique, algorithm, approach used
- **Concept**: key ideas, theories, frameworks
- **Relation**: related-to-[other-source-id], builds-on-[id], compares-[id]
- **Author**: author names for co-authorship connections
- **Venue**: conference, journal, publisher
- **Year**: publication year
- **Format**: paper, tutorial, documentation, tool, dataset
- **Quality**: peer-reviewed, preprint, official, community
- **Relevance**: core, background, tangential, foundational

Example tags for a source:
```json
"tags": [
  "formal-verification",
  "model-checking",
  "probabilistic-systems",
  "markov-chains",
  "tool",
  "official-documentation",
  "foundational",
  "related-to-source-002",
  "builds-on-source-003",
  "verification-tools"
]
```

Tags create implicit edges: sources sharing tags form a graph where connections reveal:
- Topic clusters (shared domain/concept tags)
- Methodological lineage (builds-on, related-to)
- Research communities (author, venue tags)

3. **Use Edit tool to update sources.json** - Do NOT skip this step!

Example:
```
Edit .clover/sources.json:
  old: "sources": []
  new: "sources": [{"id": "source-001", "name": "Source Name", "path": "https://example.com/source", "type": "documentation", "tags": ["domain-tag", "method-tag", "concept-1", "concept-2", "format-type", "quality-level", "relevance-type", "related-to-X", "builds-on-Y", "topic-cluster"], "url": "https://example.com/source"}]
```

### Step 4: Report Findings

Present findings to user:
```
## Research Results: [Topic]

### Academic Papers:
1. **[Title]** (Author et al., Year)
   - Venue: [Conference/Journal]
   - Relevance: [Why useful]
   - URL: [DBLP/Scholar link]

### Documentation & Tutorials:
1. **[Title]**
   - Source: [Website/Organization]
   - URL: [Link]
   - Key Info: [Summary]

### Articles & Reports:
1. **[Title]**
   - Source: [Website/Organization]
   - URL: [Link]
   - Key Info: [Summary]

All sources have been added to the project.
```

## Important Rules

1. **NEVER fabricate papers** - Only cite papers you can verify exist
2. **Always provide URLs** - So user can verify and access
3. **Use DBLP/Scholar for papers** - These are authoritative databases
4. **Research both types by default** - Unless user specifies otherwise
5. **Record everything** - Add all sources to sources.json
6. **Be transparent** - If you can't find something, say so
7. **Note credibility** - Indicate source reliability (peer-reviewed vs blog, etc.)

## Example Searches

**Research "[TOPIC]" (both types):**

Papers:
```
WebSearch: "[TOPIC] site:dblp.org"
WebSearch: "[TOPIC] site:scholar.google.com"
```

General sources:
```
WebSearch: "[TOPIC] tutorial"
WebSearch: "[TOPIC] documentation"
WebSearch: "[TOPIC] guide"
```

## Current Sources

Check `.clover/sources.json` for current sources.
