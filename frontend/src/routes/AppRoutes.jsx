import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import InboxPage from '../pages/mail/InboxPage'
import SentPage from '../pages/mail/SentPage'
import TrashPage from '../pages/mail/TrashPage'
import StarredPage from '../pages/mail/StarredPage'
import Thread from '../pages/mail/Thread'
import PublicRoute from './PublicRoute'
import MailboxLayout from '../layouts/MailboxLayout'
import EmptyMailView from '../components/mail/EmptyMailView'
import NotFound from '../pages/NotFound'
import ComposeMail from '../components/mail/ComposeMail'
import { useUI } from '../contexts/UIContext'

const AppRoutes = () => {
  const { showComposeMail } = useUI()
  return (
    <>
      {showComposeMail && <ComposeMail />}
      <Routes>
        <Route path='/' element={<ProtectedRoute />} />

        <Route
          element={
            <ProtectedRoute>
              <MailboxLayout />
            </ProtectedRoute>
          }
        >
          <Route path='/inbox' element={<InboxPage />}>
            <Route index element={<EmptyMailView />} />
            <Route path=':id' element={<Thread />} />
          </Route>
          <Route path='/sent' element={<SentPage />}>
            <Route index element={<EmptyMailView />} />
            <Route path=':id' element={<Thread />} />
          </Route>
          <Route path='/trash' element={<TrashPage />}>
            <Route index element={<EmptyMailView />} />
            <Route path=':id' element={<Thread />} />
          </Route>
          <Route path='/starred' element={<StarredPage />}>
            <Route index element={<EmptyMailView />} />
            <Route path=':id' element={<Thread />} />
          </Route>
        </Route>

        <Route
          path='/login'
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path='/register'
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </>
  )
}

export default AppRoutes
