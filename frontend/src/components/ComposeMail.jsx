import MailComposer from '../mailCompose'

const ComposeMail = () => {
  return (
    <div className='bg-white w-150 h-100 fixed right-0 bottom-0 shadow-2xl rounded p-6 flex flex-col'>
      <form className='flex flex-col flex-1'>
        <div className='mb-3 border-b flex'>
          <label htmlFor='to' className='font-medium text-base mr-4'>
            To:
          </label>
          <input
            type='text'
            name='to'
            placeholder='Recipients'
            className='focus:outline-0 mb-2 w-full'
          />
        </div>

        <div className='mb-3 border-b flex'>
          <label htmlFor='subject' className='font-medium text-base mr-4'>
            Subject:
          </label>
          <input
            type='text'
            name='subject'
            placeholder='Subject'
            className='focus:outline-0 mb-2 w-full'
          />
        </div>

        <div className='flex-1'>
          <textarea
            name='body'
            className='focus:outline-0  w-full h-full resize-none'
          />
        </div>

        <div className='mt- flex items-center'>
          <button
            type='submit'
            className='bg-blue-600 text-white px-4 py-2 rounded-lg'
          >
            Send
          </button>
          <MailComposer />
        </div>
      </form>
    </div>
  )
}
export default ComposeMail
