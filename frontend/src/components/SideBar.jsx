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
import { useAppContext } from '../AppContext'

const SideBar = () => {
  const { showSideBar, darkMode, setDarkMode } = useAppContext()

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
    <div
      className={`
    h-screen
    w-62
    shrink-0
    bg-background
    border-r 
    p-5
    border-border
    transition-transform
    duration-300
    ease-in-out
    fixed
    flex
    flex-col
    top-10
    left-0
    z-20
    lg:static
    ${showSideBar ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
  `}
    >
      <button
        className=' flex items-center  text-sm mt-5 border rounded w-full p-2 border-border  bg-input shadow-xs'
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
                ` flex items-center text-sm rounded mb-5 border border-border p-2 ${
                  isActive ? 'bg-input font-medium' : ''
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? item.activeIcon : item.icon}

                  <div className='ml-4'>{item.name}</div>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
      <div className='mb-25 w-full flex justify-center'>
        <button
          className='bg-background border border-border px-4 py-2 rounded w-full font-medium text-sm flex items-center justify-center'
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
  )
}
export default SideBar
