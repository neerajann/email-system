import { useCallback, useState } from 'react'

const useBulkSelection = () => {
  const [selected, setSelected] = useState(new Set([]))

  const toggle = useCallback((id) => {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])
  const clear = () => setSelected(new Set([]))
  const selectAll = (ids) => setSelected(new Set(ids))
  return {
    selectedIds: selected,
    isBulkMode: selected.size > 0,
    toggle,
    clear,
    selectAll,
  }
}

export default useBulkSelection
