import { useInfiniteQuery } from '@tanstack/react-query'
const useMailboxQuery = ({ queryKey, fetchFunction }) => {
  const shouldAlwaysRefetch =
    queryKey[0] === 'search' ||
    (queryKey[0] === 'mailboxes' && queryKey[1] === 'inbox')

  const query = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: fetchFunction,
    staleTime: shouldAlwaysRefetch ? 0 : 5 * 60 * 1000,
    refetchOnMount: shouldAlwaysRefetch ? 'always' : true,
    initialPageParam: null,
    refetchOnWindowFocus: shouldAlwaysRefetch,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })

  const mails = query.data?.pages?.flatMap((page) => page.mails) ?? []
  return { ...query, mails }
}
export default useMailboxQuery
