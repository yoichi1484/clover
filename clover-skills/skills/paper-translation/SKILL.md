---
name: paper-translation
description: Use when translating academic papers or LaTeX documents between languages, especially English-Japanese translation.
---

# Paper Translation Skill

Use this skill when the user asks to translate paper content between languages.

## Translation Types

### 1. Japanese to English

For translating Japanese academic text to English:

**Guidelines:**
- Use formal academic English style
- Maintain technical terminology accuracy
- Follow conventions of target venue (IEEE, ACM, etc.)
- Preserve LaTeX commands and structure
- Keep citation keys unchanged

**Common Patterns:**
| Japanese Pattern | English Academic |
|------------------|------------------|
| ...wo teian suru | We propose / This paper proposes |
| ...wo shimesu | We demonstrate / We show |
| ...ga shirarete iru | It is known that / Prior work has shown |
| ...to kangaerareru | It is considered that / We consider |
| hon kenkyuu deha | In this work / This study |
| jikken kekka yori | Experimental results show |

### 2. English to Japanese

For translating English academic text to Japanese:

**Guidelines:**
- Use formal academic style (dearu-style)
- Maintain technical terms (katakana or original)
- Keep LaTeX commands intact
- Preserve citation keys

**Common Patterns:**
| English | Japanese Academic Pattern |
|---------|---------------------------|
| We propose | ...wo teian suru |
| This paper presents | honronbun deha...wo shimesu |
| Experimental results | jikken kekka |
| Related work | kanren kenkyuu |
| Conclusion | ketsuron / owarini |

## Workflow

### Step 1: Identify Translation Task

Determine:
- Source language
- Target language
- Scope: entire paper, specific section, or selected text

### Step 2: Read the Content

If translating a section from main.tex:
1. Read the current file: `cat main.tex`
2. Identify the section to translate

### Step 3: Translate

**For section-by-section translation:**
1. Translate one section at a time
2. Preserve all LaTeX formatting:
   - `\section{}`, `\subsection{}`
   - `\cite{}`, `\ref{}`
   - `\begin{...}`, `\end{...}`
   - Math environments
3. Keep figure/table references intact

**Quality checks:**
- Technical terms are consistent throughout
- Academic tone is maintained
- No LaTeX syntax broken
- Citations and references preserved

### Step 4: Apply Translation

Use the Edit tool to replace the original text with translated text.

### Step 5: Report

Show the user:
- What was translated
- Any terminology choices made
- Suggest review for domain-specific terms

## Important Rules

1. **Preserve LaTeX structure** - Never break LaTeX commands
2. **Keep citations intact** - `\cite{key}` should remain unchanged
3. **Maintain formatting** - Lists, equations, figures stay structured
4. **Technical accuracy** - Use established translations for technical terms
5. **Consistency** - Same term = same translation throughout
6. **Ask if unsure** - For domain-specific terms, confirm with user

## Technical Term Handling

For technical terms, follow this priority:
1. Use established translation if widely accepted
2. Use transliteration for newer terms
3. Keep original term in parentheses for clarity
4. For very new terms, keep original with explanation

## Example

**Japanese original:**
```latex
\section{Proposed Method}
In this work, we propose a novel approach using deep learning.
```

**English translation:**
```latex
\section{Proposed Method}
In this work, we propose a novel approach using deep learning.
```

## Current Paper

Read `main.tex` to see the current paper content.
