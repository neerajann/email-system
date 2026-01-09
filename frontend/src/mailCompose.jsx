import { useRef } from 'react'

export default function MailComposer() {
  const fileInputRef = useRef(null)

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    console.log(files)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    handleFiles({ target: { files: e.dataTransfer.files } })
  }

  return (
    <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      <input
        type='file'
        ref={fileInputRef}
        multiple
        className='hidden'
        onChange={handleFiles}
      />

      <div className='flex items-center justify-between'>
        <button
          type='button'
          onClick={() => fileInputRef.current.click()}
          className='flex items-center  '
        >
          📎 Attach files
        </button>
      </div>
    </div>
  )
}
