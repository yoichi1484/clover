import * as monaco from 'monaco-editor'

export type EditorTheme = 'vibrant' | 'monokai' | 'solarized-dark' | 'nord' | 'github-light'

interface ThemeDefinition {
  id: EditorTheme
  name: string
  theme: monaco.editor.IStandaloneThemeData
}

// Vibrant (Original) Theme
const vibrantTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'C586C0', fontStyle: 'bold' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'string.math', foreground: 'CE9178' },
    { token: 'string.math.delimiter', foreground: 'D7BA7D', fontStyle: 'bold' },
    { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
    { token: 'delimiter.curly', foreground: 'FFD700' },
    { token: 'delimiter.square', foreground: 'DA70D6' },
    { token: 'variable.parameter', foreground: '9CDCFE' },
    { token: 'keyword.special', foreground: 'FF6B6B' },
    { token: 'keyword.section', foreground: 'F44747', fontStyle: 'bold' },
    { token: 'keyword.reference', foreground: '4FC1FF' },
    { token: 'keyword.format', foreground: 'DCDCAA' },
    { token: 'keyword.symbol', foreground: 'B5CEA8' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2D2D2D',
    'editorCursor.foreground': '#FFFFFF',
    'editor.selectionBackground': '#264F78',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#C6C6C6',
  }
}

// Monokai Theme
const monokaiTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'F92672', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'F92672', fontStyle: 'bold' },
    { token: 'type', foreground: '66D9EF', fontStyle: 'italic' },
    { token: 'string.math', foreground: 'E6DB74' },
    { token: 'string.math.delimiter', foreground: 'FD971F', fontStyle: 'bold' },
    { token: 'comment', foreground: '75715E', fontStyle: 'italic' },
    { token: 'delimiter.curly', foreground: 'F8F8F2' },
    { token: 'delimiter.square', foreground: 'AE81FF' },
    { token: 'variable.parameter', foreground: 'FD971F' },
    { token: 'keyword.special', foreground: 'F92672' },
    { token: 'keyword.section', foreground: 'A6E22E', fontStyle: 'bold' },
    { token: 'keyword.reference', foreground: '66D9EF' },
    { token: 'keyword.format', foreground: 'E6DB74' },
    { token: 'keyword.symbol', foreground: 'AE81FF' },
  ],
  colors: {
    'editor.background': '#272822',
    'editor.foreground': '#F8F8F2',
    'editor.lineHighlightBackground': '#3E3D32',
    'editorCursor.foreground': '#F8F8F0',
    'editor.selectionBackground': '#49483E',
    'editorLineNumber.foreground': '#90908A',
    'editorLineNumber.activeForeground': '#C2C2BF',
  }
}

// Solarized Dark Theme
const solarizedDarkTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '859900', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'CB4B16', fontStyle: 'bold' },
    { token: 'type', foreground: '268BD2' },
    { token: 'string.math', foreground: '2AA198' },
    { token: 'string.math.delimiter', foreground: 'B58900', fontStyle: 'bold' },
    { token: 'comment', foreground: '586E75', fontStyle: 'italic' },
    { token: 'delimiter.curly', foreground: 'D33682' },
    { token: 'delimiter.square', foreground: '6C71C4' },
    { token: 'variable.parameter', foreground: '93A1A1' },
    { token: 'keyword.special', foreground: 'DC322F' },
    { token: 'keyword.section', foreground: 'CB4B16', fontStyle: 'bold' },
    { token: 'keyword.reference', foreground: '268BD2' },
    { token: 'keyword.format', foreground: 'B58900' },
    { token: 'keyword.symbol', foreground: '2AA198' },
  ],
  colors: {
    'editor.background': '#002B36',
    'editor.foreground': '#839496',
    'editor.lineHighlightBackground': '#073642',
    'editorCursor.foreground': '#D30102',
    'editor.selectionBackground': '#073642',
    'editorLineNumber.foreground': '#586E75',
    'editorLineNumber.activeForeground': '#93A1A1',
  }
}

// Nord Theme
const nordTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '81A1C1', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'B48EAD', fontStyle: 'bold' },
    { token: 'type', foreground: '8FBCBB' },
    { token: 'string.math', foreground: 'A3BE8C' },
    { token: 'string.math.delimiter', foreground: 'EBCB8B', fontStyle: 'bold' },
    { token: 'comment', foreground: '616E88', fontStyle: 'italic' },
    { token: 'delimiter.curly', foreground: 'ECEFF4' },
    { token: 'delimiter.square', foreground: 'B48EAD' },
    { token: 'variable.parameter', foreground: 'D8DEE9' },
    { token: 'keyword.special', foreground: 'BF616A' },
    { token: 'keyword.section', foreground: '88C0D0', fontStyle: 'bold' },
    { token: 'keyword.reference', foreground: '5E81AC' },
    { token: 'keyword.format', foreground: 'EBCB8B' },
    { token: 'keyword.symbol', foreground: 'A3BE8C' },
  ],
  colors: {
    'editor.background': '#2E3440',
    'editor.foreground': '#D8DEE9',
    'editor.lineHighlightBackground': '#3B4252',
    'editorCursor.foreground': '#D8DEE9',
    'editor.selectionBackground': '#434C5E',
    'editorLineNumber.foreground': '#4C566A',
    'editorLineNumber.activeForeground': '#D8DEE9',
  }
}

// GitHub Light Theme
const githubLightTheme: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    { token: 'keyword', foreground: 'D73A49', fontStyle: 'bold' },
    { token: 'keyword.control', foreground: 'D73A49', fontStyle: 'bold' },
    { token: 'type', foreground: '6F42C1' },
    { token: 'string.math', foreground: '032F62' },
    { token: 'string.math.delimiter', foreground: 'E36209', fontStyle: 'bold' },
    { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
    { token: 'delimiter.curly', foreground: '24292E' },
    { token: 'delimiter.square', foreground: '6F42C1' },
    { token: 'variable.parameter', foreground: '005CC5' },
    { token: 'keyword.special', foreground: 'D73A49' },
    { token: 'keyword.section', foreground: '22863A', fontStyle: 'bold' },
    { token: 'keyword.reference', foreground: '005CC5' },
    { token: 'keyword.format', foreground: 'E36209' },
    { token: 'keyword.symbol', foreground: '032F62' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#24292E',
    'editor.lineHighlightBackground': '#F6F8FA',
    'editorCursor.foreground': '#24292E',
    'editor.selectionBackground': '#C8C8FA',
    'editorLineNumber.foreground': '#959DA5',
    'editorLineNumber.activeForeground': '#24292E',
  }
}

export const THEMES: ThemeDefinition[] = [
  { id: 'vibrant', name: 'Vibrant Dark', theme: vibrantTheme },
  { id: 'monokai', name: 'Monokai', theme: monokaiTheme },
  { id: 'solarized-dark', name: 'Solarized Dark', theme: solarizedDarkTheme },
  { id: 'nord', name: 'Nord', theme: nordTheme },
  { id: 'github-light', name: 'GitHub Light', theme: githubLightTheme },
]

export function getTheme(id: EditorTheme): monaco.editor.IStandaloneThemeData {
  const theme = THEMES.find(t => t.id === id)
  return theme?.theme ?? vibrantTheme
}

export function getThemeName(id: EditorTheme): string {
  const theme = THEMES.find(t => t.id === id)
  return theme?.name ?? 'Vibrant Dark'
}
