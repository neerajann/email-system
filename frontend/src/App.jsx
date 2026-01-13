import Login from './pages/Login'
import Register from './pages/Register'
import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import NotFound from './pages/NotFound'
import Sent from './pages/SentLayout'
import Trash from './pages/TrashLayout'
import Starred from './pages/StarredLayout'
import Thread from './pages/Thread'
import PublicRoute from './PublicRoute'
import MailboxLayout from './MailboxLayout'
import InboxLayout from './pages/InboxLayout'
import EmptyMailView from './EmptyMailView'
import SentLayout from './pages/SentLayout'
import TrashLayout from './pages/TrashLayout'
import StarredLayout from './pages/StarredLayout'

function App() {
  axios.defaults.withCredentials = true

  return (
    <Routes>
      <Route path='/' element={<ProtectedRoute />} />

      <Route
        element={
          <ProtectedRoute>
            <MailboxLayout />
          </ProtectedRoute>
        }
      >
        <Route path='/inbox' element={<InboxLayout />}>
          <Route index element={<EmptyMailView />} />
          <Route path=':id' element={<Thread />} />
        </Route>
        <Route path='/sent' element={<SentLayout />}>
          <Route index element={<EmptyMailView />} />
          <Route path=':id' element={<Thread />} />
        </Route>
        <Route path='/trash' element={<TrashLayout />}>
          <Route index element={<EmptyMailView />} />
          <Route path=':id' element={<Thread />} />
        </Route>
        <Route path='/starred' element={<StarredLayout />}>
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
  )
}

export default App
