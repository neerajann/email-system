import { useRef } from 'react'

const useInfiniteScroll = ({
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}) => {
  const observerRef = useRef(null)

  const setRef = useCallback(
    (node) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (node) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
              fetchNextPage()
            }
          },
          {
            rootMargin: '200px',
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
