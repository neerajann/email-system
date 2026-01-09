import { MdAllInbox } from 'react-icons/md'
import { IoMdArchive } from 'react-icons/io'
import { FaRegStar } from 'react-icons/fa'
import { LuTrash2 } from 'react-icons/lu'
import { RiQuillPenLine } from 'react-icons/ri'
import { SiMinutemailer } from 'react-icons/si'
import { GiHamburgerMenu } from 'react-icons/gi'
import { useEffect, useState, useRef } from 'react'

import axios from 'axios'
import Mails from './Mails'
import MailComposer from './mailCompose'

const Dashboard = () => {
  const [showSideBar, setShowSideBar] = useState(false)
  const [mails, setMails] = useState([])
  const fileInputRef = useRef(null)

  const fetchData = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/mail/inbox`
      )
      setMails(data.mails)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className='w-full h-full '>
      <div className=' bg-white  z-10 w-full flex justify-between items-center p-4 shadow-2xl shadow-[#20121217] border-b '>
        <div className='flex   items-center '>
          <GiHamburgerMenu
            className='mr-5 size-6'
            onClick={() => setShowSideBar(!showSideBar)}
          />
          Inboxify
        </div>
        <div>
          <input
            type='search'
            placeholder='Search in mail'
            className='border lg:w-100 p-1 rounded-2xl '
          />
        </div>
        <div>User Profile</div>
      </div>
      <div className='flex w-screen'>
        <div
          className={`bg-white h-screen transition-all ease-in-out top-15 shadow-2xl shadow-[#20121244] border-r hidden lg:block 
          ${
            showSideBar
              ? 'w-50  p-4  '
              : 'w-22  items-center lg:flex lg:flex-col '
          }
        `}
        >
          <button
            className={
              showSideBar
                ? ' flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-5 p-0 rounded-2xl'
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1 '}>
              <RiQuillPenLine className='size-8' />
            </div>
            {showSideBar && <div>Compose</div>}
          </button>
          <div
            className={
              showSideBar
                ? 'flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-8 '
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1'}>
              <MdAllInbox className='size-5' />
            </div>
            {showSideBar && <div>Inbox</div>}
          </div>
          <div
            className={
              showSideBar
                ? 'flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-8 p-0 rounded-2xl'
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1'}>
              <FaRegStar className='size-5' />
            </div>

            {showSideBar && <div>Starred</div>}
          </div>
          <div
            className={
              showSideBar
                ? 'flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-8 '
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1 '}>
              <SiMinutemailer className='size-5' />
            </div>
            {showSideBar && <div>Sent</div>}
          </div>
          <div
            className={
              showSideBar
                ? 'flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-8 p-0 rounded-2xl'
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1'}>
              <IoMdArchive className='size-5' />
            </div>
            {showSideBar && <div>Archived</div>}
          </div>
          <div
            className={
              showSideBar
                ? 'flex items-center text-medium font-medium mt-5 border rounded w-full p-2'
                : 'flex items-center mt-8 p-0 rounded-2xl'
            }
          >
            <div className={showSideBar ? '' : 'border rounded-full p-1'}>
              <LuTrash2 className='size-5' />
            </div>
            {showSideBar && <div>Trash</div>}
          </div>
        </div>
        <Mails data={mails} />
        <div className='bg-white w-150 h-100 fixed right-0 bottom-0 shadow-2xl rounded p-6 flex flex-col'>
          <form className='flex flex-col flex-1'>
            <div className='mb-3 border-b flex'>
              <label htmlFor='to' className='font-medium text-medium mr-4'>
                To:
              </label>
              <input
                type='email'
                name='to'
                placeholder='Recipients'
                className='focus:outline-0 mb-2 w-full'
              />
            </div>

            <div className='mb-3 border-b flex'>
              <label htmlFor='subject' className='font-medium text-medium mr-4'>
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
      </div>
    </div>
  )
}

export default Dashboard
