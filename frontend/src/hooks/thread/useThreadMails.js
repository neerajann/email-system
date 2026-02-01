import { useQuery } from '@tanstack/react-query'
import api from '../../services/api'

const useThreadMails = ({ id }) =>
  useQuery({
    queryKey: ['mail', id],
    queryFn: async () => {
      const { data } = await api.get(`/mail/${id}`)
      return data
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!id,
    retry: 1,
  })

export default useThreadMails
