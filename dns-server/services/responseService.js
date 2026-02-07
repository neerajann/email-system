import dnsPacket from 'dns-packet'

const buildAnswers = (questions, qtype, rrset, blocked) => {
  if (blocked) {
    return rrset.records.map((r) => ({
      name: questions.name,
      type: 'A',
      class: 'IN',
      ttl: 20,
      data: r.content,
    }))
  }
  if (qtype === 'PTR') {
    return rrset.records.map((r) => ({
      name: questions.name,
      type: 'PTR',
      class: 'IN',
      ttl: r.ttt ?? 20,
      data: r.content,
    }))
  }
  if (qtype === 'MX') {
    return rrset.records.map((r) => ({
      name: questions.name,
      type: 'MX',
      class: 'IN',
      ttl: r.ttl ?? 30,
      data: {
        preference: r.priority ?? 10,
        exchange: r.content,
      },
    }))
  }
  if (qtype === 'TXT') {
    return rrset.records.flatMap((r) => {
      let txtData = r.content
      if (!Array.isArray(txtData)) txtData = [txtData]

      const splitData = []
      for (const str of txtData) {
        if (Buffer.byteLength(str) <= 255) {
          splitData.push(str)
        } else {
          for (let i = 0; i < str.length; i += 255) {
            splitData.push(str.substring(i, i + 255))
          }
        }
      }
      return splitData.map((data) => ({
        name: questions.name,
        type: 'TXT',
        class: 'IN',
        ttl: r.ttl ?? 50,
        data,
      }))
    })
  }
  return rrset.records.map((r) => ({
    name: questions.name,
    type: qtype,
    class: 'IN',
    ttl: r.ttl ?? 50,
    data: r.content,
  }))
}

const sendResponse = ({ server, incomingMessage, rinfo, blocked, rrset }) => {
  const questions = incomingMessage.questions[0]
  const qtype = questions.type
  try {
    const answers = buildAnswers(questions, qtype, rrset, blocked)

    const response = dnsPacket.encode({
      id: incomingMessage.id,
      type: 'response',
      flags: dnsPacket.AUTHORITATIVE_ANSWER,
      questions: [questions],
      answers,
    })
    server.send(response, rinfo.port, rinfo.address)
  } catch (error) {
    console.error('Error encoding DNS response:', error)
    console.error('Question:', questions)
    console.error('RRset:', JSON.stringify(rrset, null, 2))

    const errorResponse = dnsPacket.encode({
      id: incomingMessage.id,
      type: 'response',
      flags: dnsPacket.SERVFAIL,
      questions: [questions],
      answers: [],
    })
    server.send(errorResponse, rinfo.port, rinfo.address)
  }
}

export { sendResponse }
