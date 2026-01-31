import { useEffect } from 'react'

const useInfiniteScroll = ({
  ref,
  fetchNextPage,
  isFetchingNextPage,
  hasNextPage,
}) => {
  useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      {
        rootMargin: '200px',
      },
    )
    observer.observe(ref.current)
    return () => observer.disconnect()
  }, [fetchNextPage, hasNextPage, isFetchingNextPage])
}
export default useInfiniteScroll
