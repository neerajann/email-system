import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import Thread from '../pages/mail/Thread'
import PublicRoute from './PublicRoute'
import MailboxLayout from '../layouts/MailboxLayout'
import NotFound from '../pages/NotFound'
import ComposeMail from '../components/mail/compose/ComposeMail'
import { useUI } from '../contexts/UIContext'
import SearchPage from '../pages/mail/SearchPage'
import MailboxPage from '../pages/mail/MailboxPage'
import EmptyMailView from '../components/mail/shared/EmptyMailView'

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
          <Route path='search' element={<SearchPage />}>
            <Route index element={<EmptyMailView />} />
            <Route path=':id' element={<Thread />} />
          </Route>

          <Route path=':mailboxType' element={<MailboxPage />}>
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
