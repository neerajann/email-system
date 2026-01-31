import { useInfiniteQuery } from '@tanstack/react-query'
const useMailboxQuery = ({ queryKey, fetchFunction }) => {
  const query = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: fetchFunction,
    staleTime: 5 * 60 * 1000,
    initialPageParam: null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const mails = query.data?.pages?.flatMap((page) => page.mails) ?? []
  return { ...query, mails }
}
export default useMailboxQuery
