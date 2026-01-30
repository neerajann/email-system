import { MdLightMode, MdDarkMode } from 'react-icons/md'
import { RiQuillPenLine, RiInbox2Line, RiInbox2Fill } from 'react-icons/ri'
import { NavLink } from 'react-router-dom'
import {
  IoTrashOutline,
  IoTrash,
  IoStarOutline,
  IoStarSharp,
  IoPaperPlane,
  IoPaperPlaneOutline,
} from 'react-icons/io5'
import React from 'react'
import { useUI } from '../../contexts/UIContext'
import { useAuth } from '../../contexts/AuthContext'

const SideBar = React.memo(() => {
  const { showSideBar, setShowComposeMail, setShowSideBar, unreadCount } =
    useUI()
  const { darkMode, setDarkMode } = useAuth()
  const menuItems = [
    {
      name: 'Inbox',
      activeIcon: <RiInbox2Fill className='size-5' />,
      icon: <RiInbox2Line className='size-5' />,
      route: '/inbox',
    },
    {
      name: 'Starred',
      activeIcon: <IoStarSharp className='size-5' />,
      icon: <IoStarOutline className='size-5' />,
      route: '/starred',
    },
    {
      name: 'Sent',
      activeIcon: <IoPaperPlane className='size-5' />,
      icon: <IoPaperPlaneOutline className='size-5' />,
      route: '/sent',
    },
    {
      name: 'Trash',
      activeIcon: <IoTrash className='size-5' />,
      icon: <IoTrashOutline className=' size-5' />,
      route: '/trash',
    },
  ]

  return (
    <>
      {showSideBar && (
        <div
          className=' fixed inset-0 bg-transparent z-[40] xl:hidden'
          onClick={() => setShowSideBar(false)}
        ></div>
      )}
      <div
        className={`h-dvh w-62 shrink-0 bg-background  p-5  transition-transform duration-300 ease-in-out fixed flex flex-col left-0 z-[45] xl:static
    ${showSideBar ? 'translate-x-0' : '-translate-x-full xl:translate-x-0 '}
  `}
      >
        <div className='flex sm:hidden items-center gap-4 '>
          <h2 className='text-lg font-bold'>inboxify</h2>
        </div>
        <button
          className=' flex items-center  text-sm mt-5 border rounded w-full p-2 border-border  bg-input shadow-xs hover:cursor-pointer'
          onClick={() => setShowComposeMail(true)}
        >
          <RiQuillPenLine className='size-6' />

          <div className='ml-2  font-normal '>Compose</div>
        </button>
        <div className=' border-t border-border mt-3 pt-4 flex-1'>
          {menuItems.map((item) => {
            return (
              <NavLink
                key={item.name}
                to={item.route}
                className={({ isActive }) =>
                  `flex items-center text-sm rounded mb-5 border border-border p-2 hover:shadow-[0_0_15px_rgb(var(--shadow-color)/0.05)] transition-shadow ease-in ${isActive ? 'bg-input font-medium' : ''}`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive ? item.activeIcon : item.icon}

                    <div className='ml-4 flex-1'>{item.name}</div>

                    {item.name === 'Inbox' && unreadCount > 0 && (
                      <span className='ml-auto text-xs rounded-full px-2 py-0.5  text-foreground'>
                        {unreadCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
        <div className='mb-25 w-full flex justify-center'>
          <button
            className='bg-background border border-border px-4 py-2 rounded w-full font-medium text-sm flex items-center justify-center hover:cursor-pointer'
            onClick={() => {
              setDarkMode(!darkMode)
            }}
          >
            {darkMode ? (
              <>
                <MdLightMode className=' mr-3' /> Light Mode
              </>
            ) : (
              <>
                <MdDarkMode className='mr-3' /> Dark Mode
              </>
            )}
          </button>
        </div>
      </div>
    </>
  )
})
export default SideBar
