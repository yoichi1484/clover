import { useState, useCallback, useEffect, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import { ZoomIn, ZoomOut } from 'lucide-react'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { api } from '../api'

// Set up PDF.js worker - use local copy for Electron compatibility
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString()

interface PdfViewerProps {
  pdfPath: string | null
}

// A4 paper size in points (72 DPI): 595.28 x 841.89
const DEFAULT_PAGE_WIDTH = 595.28

export function PdfViewer({ pdfPath }: PdfViewerProps): JSX.Element {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [manualScale, setManualScale] = useState<number | null>(null) // null = fit-to-width
  const [pdfDataUrl, setPdfDataUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [containerWidth, setContainerWidth] = useState<number>(0) // Start at 0, will be measured
  const [pageWidth, setPageWidth] = useState<number>(DEFAULT_PAGE_WIDTH)
  const containerRef = useRef<HTMLDivElement>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Load PDF data when path changes
  useEffect(() => {
    if (!pdfPath) {
      setPdfDataUrl(null)
      setError(null)
      setPageWidth(DEFAULT_PAGE_WIDTH)
      return
    }

    const loadPdf = async () => {
      try {
        setError(null)
        const base64Data = await api.readBinaryFile(pdfPath)
        setPdfDataUrl(`data:application/pdf;base64,${base64Data}`)
      } catch (err) {
        console.error('Failed to load PDF:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }

    loadPdf()
  }, [pdfPath])

  const onDocumentLoadSuccess = useCallback(async (pdf: { numPages: number; getPage: (n: number) => Promise<{ getViewport: (options: { scale: number }) => { width: number; height: number } }> }) => {
    setNumPages(pdf.numPages)
    setCurrentPage(1)

    // Get the first page to determine the PDF's intrinsic dimensions
    try {
      const page = await pdf.getPage(1)
      const viewport = page.getViewport({ scale: 1 })
      setPageWidth(viewport.width)
    } catch {
      // Use default A4 size if we can't get actual dimensions
    }

    // Force re-measure container width after PDF loads
    if (containerRef.current) {
      const padding = 32
      const rawWidth = containerRef.current.clientWidth
      const newWidth = rawWidth - padding
      if (newWidth > 0) {
        setContainerWidth(newWidth)
      }
    }
  }, [])

  // Track container width
  useEffect(() => {
    if (!containerRef.current) return

    const updateContainerWidth = () => {
      if (containerRef.current) {
        const padding = 32 // p-4 = 16px on each side
        const rawWidth = containerRef.current.clientWidth
        const newWidth = rawWidth - padding
        if (newWidth > 0) {
          setContainerWidth(newWidth)
        }
      }
    }

    // Initial measurement
    updateContainerWidth()

    // Also measure after a short delay to catch late layout changes
    const timeoutId = setTimeout(updateContainerWidth, 100)

    const resizeObserver = new ResizeObserver(() => {
      updateContainerWidth()
    })

    resizeObserver.observe(containerRef.current)
    return () => {
      clearTimeout(timeoutId)
      resizeObserver.disconnect()
    }
  }, []) // No dependencies - runs once on mount

  // Track current page on scroll
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect()
      const containerCenter = containerRect.top + containerRect.height / 2

      let closestPage = 1
      let closestDistance = Infinity

      pageRefs.current.forEach((el, pageNum) => {
        const rect = el.getBoundingClientRect()
        const pageCenter = rect.top + rect.height / 2
        const distance = Math.abs(pageCenter - containerCenter)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPage = pageNum
        }
      })

      setCurrentPage(closestPage)
    }

    container.addEventListener('scroll', handleScroll)
    return () => container.removeEventListener('scroll', handleScroll)
  }, [numPages])

  // Calculate display width
  const getDisplayWidth = (): number => {
    if (manualScale !== null) {
      return pageWidth * manualScale
    }
    // Fit to width
    return containerWidth
  }

  // Calculate current scale for display
  const getCurrentScale = (): number => {
    if (manualScale !== null) {
      return manualScale
    }
    if (containerWidth === 0 || pageWidth === 0) {
      return 1.0
    }
    return containerWidth / pageWidth
  }

  const handleZoomIn = () => {
    const currentScale = getCurrentScale()
    setManualScale(Math.min(3.0, currentScale + 0.1))
  }

  const handleZoomOut = () => {
    const currentScale = getCurrentScale()
    setManualScale(Math.max(0.25, currentScale - 0.1))
  }

  const handleFitWidth = () => {
    setManualScale(null) // Reset to fit-to-width
  }

  if (!pdfPath) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Compile to see PDF preview
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-red-500">
        Error loading PDF: {error}
      </div>
    )
  }

  if (!pdfDataUrl) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        Loading PDF...
      </div>
    )
  }

  const displayWidth = getDisplayWidth()
  const currentScale = getCurrentScale()
  // Use at least 100px to avoid 0 width during initial render
  const roundedDisplayWidth = Math.max(100, Math.round(displayWidth))
  const isFitToWidth = manualScale === null

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="flex items-center justify-between px-3 py-3 border-b border-gray-700 bg-[#252525]">
        {/* Page indicator */}
        <span className="text-sm text-gray-400">
          {currentPage} / {numPages}
        </span>

        {/* Zoom controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleZoomOut}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            title="Zoom out"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleFitWidth}
            className={`text-sm px-2 py-1 rounded ${
              isFitToWidth
                ? 'bg-indigo-700 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
            title="Fit to width"
          >
            {Math.round(currentScale * 100)}%
          </button>
          <button
            onClick={handleZoomIn}
            className="p-1.5 bg-gray-700 hover:bg-gray-600 rounded"
            title="Zoom in"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      </div>

      {/* PDF Display */}
      <div
        ref={containerRef}
        className={`flex-1 bg-gray-800 overflow-y-auto p-4 ${
          isFitToWidth ? 'overflow-x-hidden' : 'overflow-x-auto'
        }`}
      >
        <Document
          file={pdfDataUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="text-gray-500">Loading...</div>
          }
          error={
            <div className="text-red-500">Failed to load PDF</div>
          }
          className="flex flex-col items-center gap-4"
        >
          {Array.from(new Array(numPages), (_, index) => (
            <div
              key={`page-container-${index + 1}`}
              ref={(el) => {
                if (el) pageRefs.current.set(index + 1, el)
              }}
            >
              <Page
                pageNumber={index + 1}
                width={roundedDisplayWidth}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-lg"
              />
            </div>
          ))}
        </Document>
      </div>
    </div>
  )
}
