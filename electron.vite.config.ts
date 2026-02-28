import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    plugins: [react()],
    server: {
      watch: {
        // Ignore project files and LaTeX output files to prevent HMR page reloads
        ignored: [
          '**/sample-project/**',
          '**/*.tex',
          '**/*.aux',
          '**/*.log',
          '**/*.pdf',
          '**/*.bib',
          '**/*.bbl',
          '**/*.blg',
          '**/*.toc',
          '**/*.out'
        ]
      }
    }
  }
})
