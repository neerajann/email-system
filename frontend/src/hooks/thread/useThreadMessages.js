const useThreadMessages = ({ mails }) => {
  if (mails.length <= 3) {
    return {
      oldMessage: [],
      latestMessages: mails,
      hiddenCount: 0,
    }
  }
  return {
    oldMessage: mails.slice(0, 1),
    hiddenCount: mails.length - 3,
    latestMessages: mails.slice(-2),
  }
}
export default useThreadMessages
