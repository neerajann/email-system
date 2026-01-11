import Inbox from './pages/Inbox'
import Login from './pages/Login'
import Register from './pages/Register'
import axios from 'axios'
import { Route, Routes } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'
import NotFound from './pages/NotFound'
import Sent from './pages/Sent'
import Trash from './pages/Trash'
import Starred from './pages/Starred'
import Thread from './pages/Thread'
import PublicRoute from './PublicRoute'

function App() {
  axios.defaults.withCredentials = true

  return (
    <Routes>
      <Route path='/' element={<ProtectedRoute />} />
      <Route
        path='inbox'
        element={
          <ProtectedRoute>
            <Inbox />
          </ProtectedRoute>
        }
      >
        <Route path=':id' element={<Thread />} />
      </Route>

      <Route
        path='starred'
        element={
          <ProtectedRoute>
            <Starred />
          </ProtectedRoute>
        }
      />
      <Route
        path='sent'
        element={
          <ProtectedRoute>
            <Sent />
          </ProtectedRoute>
        }
      />

      <Route
        path='trash'
        element={
          <ProtectedRoute>
            <Trash />
          </ProtectedRoute>
        }
      />

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
