import { IoMdArchive } from 'react-icons/io'
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
  const { showSideBar } = useAppContext()
  console.log(showSideBar)
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
      className={` h-screen transition-all  ease-in-out top-15 shadow-2xl shadow-[#20121244] border-r  lg:block w-50  p-4   ${
        showSideBar ? 'block' : 'hidden '
      }`}
    >
      <button
        className=' flex items-center text-base font-medium mt-5 border rounded w-full p-2'
        onClick={() => setShowComposeMail(true)}
      >
        <RiQuillPenLine className='size-8' />

        <div className='ml-2'>Compose</div>
      </button>

      {menuItems.map((item) => {
        return (
          <NavLink
            key={item.name}
            to={item.route}
            className='side-bar show-side-bar'
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
  )
}
export default SideBar
