const useQuotedText = ({ mails, mail }) => {
  const messageIdMap = new Map()

  mails.map((e) =>
    messageIdMap.set(e.messageId, {
      receivedAt: e.receivedAt,
      body: e.body.text,
      sender: e.from,
      inReplyTo: e?.inReplyTo,
    }),
  )
  const quotedText = []

  // Recursively build chain of past reply history
  const buildChain = (mail) => {
    if (!mail?.inReplyTo) return
    const parent = messageIdMap.get(mail.inReplyTo)
    if (!parent) return
    quotedText.push(parent)
    buildChain(parent)
  }
  buildChain(mail)

  return quotedText
}
export default useQuotedText
