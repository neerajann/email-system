import { useEffect, useState } from 'react'
import api from '../../../services/api.js'
import { emailPattern } from '../../../utils/pattern.js'

const useRecipientsInput = ({ setRecipients, recipientsRef }) => {
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
            signal: controller.signal, // Abort signal
          },
        )
        if (data.length) {
          setSuggestions(data)
        }
      } catch (error) {
        if (error.name === 'CanceledError') return
      }
    }, 250) // Wait 250ms before sending request (deboucing)

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
    let current = parts.pop() // Last part is still being typed
    const valid = parts.filter((p) => emailPattern.test(p))

    // Add valid emails, using Set to prevent duplicates
    if (valid.length > 0) {
      recipientsRef.current.textContent = ''
      setRecipients((prev) => Array.from(new Set([...prev, ...valid])))
    }

    // If user typed comma but email was invalid, keep it in input for correction
    if (parts.length >= 1 && valid.length === 0) {
      setInput(parts[0])
    } else {
      setInput(current || '')
    }
  }
  const addRecipient = (emailAddress) => {
    setRecipients((prev) => Array.from(new Set([...prev, emailAddress])))
    recipientsRef.current.textContent = ''
    setInput('')
  }

  const removeRecipient = (r) => {
    setRecipients((prev) => prev.filter((x) => x !== r))
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
