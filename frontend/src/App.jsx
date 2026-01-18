import axios from 'axios'
import AppRoutes from './routes/AppRoutes'
import { BrowserRouter } from 'react-router-dom'

const App = () => {
  axios.defaults.withCredentials = true
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
