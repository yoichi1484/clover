interface FeedbackSelectionPopupProps {
  visible: boolean
  position: { x: number; y: number } | null
  onClick: () => void
}

export function FeedbackSelectionPopup({ visible, position, onClick }: FeedbackSelectionPopupProps): JSX.Element | null {
  if (!visible || !position) return null
  return (
    <div
      style={{ position: 'fixed', left: position.x, top: position.y - 30, zIndex: 1000 }}
      className="bg-[#252525] border-b-2 border-blue-500 px-2.5 py-1 shadow-lg"
    >
      <button
        onMouseDown={(e) => { e.preventDefault(); onClick() }}
        className="text-xs text-blue-400 hover:text-blue-300 tracking-wide"
      >
        Feedback
      </button>
    </div>
  )
}
