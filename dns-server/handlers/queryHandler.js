import dnsPacket from 'dns-packet'
import { isBlocked } from '../services/blocklistService.js'
import { resolveRRset } from '../services/cacheService.js'
import { findRecord } from '../services/recordService.js'
import { sendResponse } from '../services/responseService.js'
import { forwardToUpStream } from '../services/forwardToUpstream.js'

const handleQuery = async ({
  msg,
  rinfo,
  server,
  upstream,
  pendingRequests,
}) => {
  try {
    const incomingMessage = dnsPacket.decode(msg)
    const question = incomingMessage.questions[0]
    if (isBlocked(question.name)) {
      return sendResponse({
        server,
        incomingMessage,
        rinfo,
        blocked: true,
        rrset: {
          records: [
            {
              content: '0.0.0.0',
            },
          ],
        },
      })
    }

    const recordFromDB = await findRecord({
      name: question.name,
      type: question.type,
    })

    if (recordFromDB) {
      return sendResponse({
        server,
        incomingMessage,
        rinfo,
        rrset: recordFromDB,
      })
    }

    const rrset = await resolveRRset({
      name: question.name,
      type: question.type,
    })

    if (rrset) {
      console.log('Question', question.name, question.type)
      console.log('From cache', rrset)
      return sendResponse({
        server,
        incomingMessage,
        rinfo,
        rrset,
      })
    }

    return await forwardToUpStream({ msg, rinfo, pendingRequests, upstream })
  } catch (error) {
    console.log(error)
  }
}
export { handleQuery }
