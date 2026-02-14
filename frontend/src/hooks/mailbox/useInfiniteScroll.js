import { useRef } from 'react'

const useInfiniteScroll = ({
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}) => {
  const observerRef = useRef(null)

  const setRef = useCallback(
    (node) => {
      // Cleanup previous observer when ref changes
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (node) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            // Fetch next page when observer becomes visible and more data is available
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          },
          {
            rootMargin: '200px', // Trigger 200px before element is visible
            root: null,
            threshold: 0,
          },
        )

        observer.observe(node)
        observerRef.current = observer
      } else {
        observerRef.current = null
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage],
  )

  return setRef
}

export default useInfiniteScroll
