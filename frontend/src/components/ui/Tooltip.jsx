const Tooltip = ({
  message,
  parentClassName = '',
  tooltipClassName = '',
  children,
}) => {
  return (
    <div className={`relative group/tooltip ${parentClassName}`}>
      {children}
      {message?.length > 0 && (
        <span
          className={`absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-input border border-border px-2 py-1 rounded text-xs opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 ${tooltipClassName}`}
        >
          {message}
        </span>
      )}
    </div>
  )
}
export default Tooltip
