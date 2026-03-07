import { useRef, useEffect } from 'react'
import Editor, { OnMount } from '@monaco-editor/react'
import * as monaco from 'monaco-editor'
import { useEditorStore } from '../store/editorStore'
import { getTheme, THEMES, type EditorTheme } from '../themes/latexThemes'

interface LatexEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
  onFeedbackSelection?: (selection: { fromLine: number; toLine: number; excerpt: string; x: number; y: number } | null) => void
}

// Comprehensive LaTeX language definition
const latexLanguage: monaco.languages.IMonarchLanguage = {
  defaultToken: '',
  tokenPostfix: '.latex',

  // Section commands
  sectionCommands: [
    'part', 'chapter', 'section', 'subsection', 'subsubsection',
    'paragraph', 'subparagraph'
  ],

  // Document structure
  structureCommands: [
    'documentclass', 'usepackage', 'begin', 'end', 'input', 'include',
    'bibliography', 'bibliographystyle', 'newcommand', 'renewcommand',
    'newenvironment', 'makeatletter', 'makeatother'
  ],

  // Reference commands
  referenceCommands: [
    'ref', 'eqref', 'pageref', 'cite', 'citep', 'citet', 'label',
    'autoref', 'nameref', 'hyperref', 'url', 'href'
  ],

  // Text formatting
  formatCommands: [
    'textbf', 'textit', 'texttt', 'textrm', 'textsf', 'textsc',
    'emph', 'underline', 'bfseries', 'itshape', 'ttfamily',
    'tiny', 'scriptsize', 'footnotesize', 'small', 'normalsize',
    'large', 'Large', 'LARGE', 'huge', 'Huge'
  ],

  // Math symbols and Greek letters
  mathSymbols: [
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
    'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'pi', 'rho', 'sigma',
    'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
    'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon',
    'Phi', 'Psi', 'Omega',
    'sum', 'prod', 'int', 'oint', 'partial', 'nabla', 'infty',
    'sqrt', 'frac', 'cdot', 'times', 'div', 'pm', 'mp', 'leq', 'geq',
    'neq', 'approx', 'equiv', 'propto', 'sim', 'subset', 'supset',
    'in', 'notin', 'cup', 'cap', 'forall', 'exists', 'neg', 'land', 'lor',
    'rightarrow', 'leftarrow', 'Rightarrow', 'Leftarrow', 'leftrightarrow',
    'uparrow', 'downarrow', 'mapsto'
  ],

  // Common environments
  environments: [
    'document', 'abstract', 'figure', 'table', 'tabular', 'array',
    'equation', 'align', 'gather', 'multline', 'split',
    'itemize', 'enumerate', 'description', 'list',
    'theorem', 'lemma', 'proof', 'definition', 'corollary', 'proposition',
    'example', 'remark', 'note', 'verbatim', 'lstlisting',
    'quote', 'quotation', 'verse', 'center', 'flushleft', 'flushright',
    'minipage', 'frame', 'block', 'columns', 'column'
  ],

  tokenizer: {
    root: [
      // Comments
      [/%.*$/, 'comment'],

      // Math mode - display
      [/\$\$/, { token: 'string.math.delimiter', next: '@mathDisplay' }],

      // Math mode - inline
      [/\$/, { token: 'string.math.delimiter', next: '@mathInline' }],

      // \[ \] math mode
      [/\\\[/, { token: 'string.math.delimiter', next: '@mathDisplay' }],

      // \( \) math mode
      [/\\\(/, { token: 'string.math.delimiter', next: '@mathInline' }],

      // Section commands
      [/\\(part|chapter|section|subsection|subsubsection|paragraph|subparagraph)\*?/, 'keyword.section'],

      // Document structure commands
      [/\\(documentclass|usepackage|begin|end|input|include|bibliography|bibliographystyle|newcommand|renewcommand|newenvironment|makeatletter|makeatother)/, 'keyword.control'],

      // Reference commands
      [/\\(ref|eqref|pageref|cite|citep|citet|label|autoref|nameref|hyperref|url|href)/, 'keyword.reference'],

      // Text formatting commands
      [/\\(textbf|textit|texttt|textrm|textsf|textsc|emph|underline|bfseries|itshape|ttfamily|tiny|scriptsize|footnotesize|small|normalsize|large|Large|LARGE|huge|Huge)/, 'keyword.format'],

      // Special characters
      [/\\[&%$#_{}~^]/, 'keyword.special'],

      // Line breaks
      [/\\\\/, 'keyword.special'],

      // Environment names after \begin{ or \end{
      [/(\{)([a-zA-Z*]+)(\})/, {
        cases: {
          '@environments': ['delimiter.curly', 'type', 'delimiter.curly'],
          '@default': ['delimiter.curly', 'variable.parameter', 'delimiter.curly']
        }
      }],

      // Other commands
      [/\\[a-zA-Z@]+\*?/, 'keyword'],

      // Curly braces
      [/\{/, 'delimiter.curly'],
      [/\}/, 'delimiter.curly'],

      // Square brackets (optional arguments)
      [/\[/, 'delimiter.square'],
      [/\]/, 'delimiter.square'],
    ],

    mathInline: [
      [/\$/, { token: 'string.math.delimiter', next: '@pop' }],
      [/\\\)/, { token: 'string.math.delimiter', next: '@pop' }],
      [/\\[a-zA-Z]+/, {
        cases: {
          '@mathSymbols': 'keyword.symbol',
          '@default': 'keyword'
        }
      }],
      [/[^$\\]+/, 'string.math'],
      [/./, 'string.math']
    ],

    mathDisplay: [
      [/\$\$/, { token: 'string.math.delimiter', next: '@pop' }],
      [/\\\]/, { token: 'string.math.delimiter', next: '@pop' }],
      [/\\[a-zA-Z]+/, {
        cases: {
          '@mathSymbols': 'keyword.symbol',
          '@default': 'keyword'
        }
      }],
      [/[^$\\\]]+/, 'string.math'],
      [/./, 'string.math']
    ]
  }
}

export function LatexEditor({ value, onChange, onSave, onFeedbackSelection }: LatexEditorProps): JSX.Element {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof monaco | null>(null)
  const editorTheme = useEditorStore(state => state.editorTheme)
  const onFeedbackSelectionRef = useRef(onFeedbackSelection)
  useEffect(() => { onFeedbackSelectionRef.current = onFeedbackSelection }, [onFeedbackSelection])

  // Apply theme when it changes
  useEffect(() => {
    if (monacoRef.current) {
      const themeName = `latex-${editorTheme}`
      monacoRef.current.editor.defineTheme(themeName, getTheme(editorTheme))
      monacoRef.current.editor.setTheme(themeName)
    }
  }, [editorTheme])

  const handleEditorDidMount: OnMount = (editor, monacoInstance) => {
    editorRef.current = editor
    monacoRef.current = monacoInstance

    // Register LaTeX language
    monacoInstance.languages.register({ id: 'latex' })

    // Set language configuration
    monacoInstance.languages.setLanguageConfiguration('latex', {
      comments: {
        lineComment: '%'
      },
      brackets: [
        ['{', '}'],
        ['[', ']'],
        ['(', ')']
      ],
      autoClosingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '$', close: '$' },
        { open: '"', close: '"' }
      ],
      surroundingPairs: [
        { open: '{', close: '}' },
        { open: '[', close: ']' },
        { open: '(', close: ')' },
        { open: '$', close: '$' },
        { open: '"', close: '"' }
      ]
    })

    // Set tokenizer
    monacoInstance.languages.setMonarchTokensProvider('latex', latexLanguage)

    // Define and apply all themes
    THEMES.forEach(t => {
      monacoInstance.editor.defineTheme(`latex-${t.id}`, t.theme)
    })

    // Apply current theme
    monacoInstance.editor.setTheme(`latex-${editorTheme}`)

    // Add save shortcut
    editor.addCommand(monacoInstance.KeyMod.CtrlCmd | monacoInstance.KeyCode.KeyS, () => {
      onSave()
    })

    // Notify parent of selection changes for feedback
    editor.onMouseUp((e) => {
      console.log('[FeedbackDebug] onMouseUp fired', e.event.posx, e.event.posy)
      const selection = editor.getSelection()
      console.log('[FeedbackDebug] selection:', selection, 'isEmpty:', selection?.isEmpty())
      if (!selection || selection.isEmpty()) {
        onFeedbackSelectionRef.current?.(null)
        return
      }
      const model = editor.getModel()
      if (!model) return
      const selectedText = model.getValueInRange(selection)
      console.log('[FeedbackDebug] selectedText:', JSON.stringify(selectedText))
      if (!selectedText.trim()) {
        onFeedbackSelectionRef.current?.(null)
        return
      }
      console.log('[FeedbackDebug] calling onFeedbackSelection with', { x: e.event.posx, y: e.event.posy })
      onFeedbackSelectionRef.current?.({
        fromLine: selection.startLineNumber,
        toLine: selection.endLineNumber,
        excerpt: selectedText.slice(0, 100),
        x: e.event.posx,
        y: e.event.posy,
      })
    })

    editor.onDidChangeCursorSelection(() => {
      const selection = editor.getSelection()
      if (!selection || selection.isEmpty()) {
        onFeedbackSelectionRef.current?.(null)
      }
    })
  }

  const handleChange = (newValue: string | undefined) => {
    if (newValue !== undefined) {
      onChange(newValue)
    }
  }

  return (
    <div className="h-full w-full">
      <Editor
        height="100%"
        defaultLanguage="latex"
        theme="vs-dark"
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          renderWhitespace: 'selection',
          bracketPairColorization: {
            enabled: true
          },
          guides: {
            bracketPairs: true,
            indentation: true
          }
        }}
      />
    </div>
  )
}
