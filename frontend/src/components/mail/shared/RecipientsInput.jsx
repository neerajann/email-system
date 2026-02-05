import { RxCross2 } from 'react-icons/rx'
import { emailPattern } from '../../../utils/pattern'
import Tooltip from '../../ui/Tooltip'

const RecipientsInput = ({
  recipients,
  input,
  suggestions,
  onChange,
  onAdd,
  onRemove,
  recipientsRef,
}) => {
  return (
    <div className='space-y-2 relative'>
      <label className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50 '>
        To:
      </label>
      <div
        tabIndex={0}
        className='relative w-full flex flex-wrap bg-input text-foreground border gap-y-1.5 gap-x-1 border-border rounded-md items-center p-2 pl-3 text-sm shadow-xs focus-within:outline-none focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/50 my-2'
      >
        {recipients.map((r) => {
          return (
            <span
              className=' border border-border  rounded p-1  flex items-center justify-center'
              key={r}
            >
              {r}
              <Tooltip message='Remove'>
                <RxCross2
                  className='inline ml-1 cursor-pointer'
                  onClick={() => onRemove(r)}
                />
              </Tooltip>
            </span>
          )
        })}
        <textarea
          autoComplete='off'
          name='recipents'
          placeholder='recipent@example.com'
          rows={1}
          className=' text-base md:text-sm  flex-1 min-w-30 bg-transparent focus:outline-none resize-none overflow-hidden leading-6 border-none active:outline-none'
          value={input}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const r = input.replace(/\n/g, '')
              if (emailPattern.test(r)) {
                onAdd(r)
              }
            }
          }}
        />
      </div>
      <div className='absolute left-0 top-full w-full z-50 text-sm bg-background'>
        {suggestions.map((s) => (
          <div
            key={s.id}
            className=' w-full cursor-pointer border rounded border-border p-2 pl-3 bg-background mt-1.5 hover:bg-muted '
            onClick={() => onAdd(s.emailAddress)}
          >
            {s.emailAddress}
          </div>
        ))}
      </div>
      <span ref={recipientsRef} className=' text-sm text-red-500 '></span>
    </div>
  )
}
export default RecipientsInput
