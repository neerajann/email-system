import { useEffect, useState } from 'react'
import api from '../../../services/api'
import { emailPattern } from '../../../utils/pattern.js'

const useRecipientsInput = ({ setEmail, recipientsRef }) => {
  const [suggestions, setSuggestions] = useState([])
  const [input, setInput] = useState('')

  useEffect(() => {
    if (!input) {
      setSuggestions([])
      return
    }
    const controller = new AbortController()

    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get(
          `/mail/recipients/suggestions?q=${input}`,
          {
            signal: controller.signal,
          },
        )
        if (data.length) {
          setSuggestions(data)
        }
      } catch (error) {
        if (error.name === 'CanceledError') return
      }
    }, 250)

    if (emailPattern.test(input)) {
      setSuggestions([
        {
          id: input,
          emailAddress: input,
        },
      ])
    }

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [input])

  const handleChange = (value) => {
    const parts = value.split(',').map((p) => p.trim())
    let current = parts.pop()
    const valid = parts.filter((p) => emailPattern.test(p))

    if (valid.length > 0) {
      recipientsRef.current.textContent = ''
      setEmail((prev) => ({
        ...prev,
        recipients: Array.from(new Set([...prev.recipients, ...valid])),
      }))
    }

    if (parts.length >= 1 && valid.length === 0) {
      setInput(parts[0])
    } else {
      setInput(current || '')
    }
  }
  const addRecipient = (emailAddress) => {
    setEmail((prev) => ({
      ...prev,
      recipients: Array.from(new Set([...prev.recipients, emailAddress])),
    }))
    recipientsRef.current.textContent = ''
    setInput('')
  }
  const removeRecipient = (r) => {
    setEmail((prev) => {
      return {
        ...prev,
        recipients: prev.recipients.filter((x) => x !== r),
      }
    })
  }
  return {
    input,
    setInput,
    suggestions,
    handleChange,
    addRecipient,
    removeRecipient,
  }
}

export default useRecipientsInput
