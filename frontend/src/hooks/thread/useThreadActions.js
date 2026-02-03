import { useQueryClient } from '@tanstack/react-query'
import useMailUpdate from '../mailbox/useMailUpdate.js'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api.js'

const useThreadActions = ({ mails, id }) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const mailUpdateMutation = useMailUpdate(['mail', id], {
    isInfiniteQuery: false,
  })

  const patchMail = (e, data) => {
    e.preventDefault()
    e.stopPropagation()

    mailUpdateMutation.mutate({
      mailboxIds: [mails[0].mailboxId],
      data,
    })

    if (data?.isDeleted) {
      navigate('..', { relative: 'path' })
    }
  }

  const deleteForever = async (mailboxId) => {
    await api.delete(`/mail/${mailboxId}`)
    queryClient.invalidateQueries(['mailboxes', 'trash'])
    navigate('..', { relative: 'path' })
  }
  return { patchMail, deleteForever }
}
export default useThreadActions
