import Dashboard from './Dashboard'
import Login from './Login'
import Register from './Register'
import axios from 'axios'

function App() {
  axios.defaults.withCredentials = true

  return (
    <div className='w-full flex h-screen justify-center items-center '>
      {/* <Login /> */}
      {/* <Register /> */}
      <Dashboard />
    </div>
  )
}

export default App
