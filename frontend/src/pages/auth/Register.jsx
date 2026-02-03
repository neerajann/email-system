import { useEffect, useRef, useState } from 'react'
import { domainEmailPattern, passwordPattern } from '../../utils/pattern.js'
import api from '../../services/api.js'
import { Link, useNavigate } from 'react-router-dom'
import { AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai'

const Register = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const formData = useRef({
    name: '',
    emailAddress: '',
    password: '',
  })
  const [formMessage, setFormMessage] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.current.name.trim().length < 5) {
      setFormMessage({ name: 'Name must be at least 5 characters.' })
      return
    }

    if (!domainEmailPattern.test(formData.current.emailAddress)) {
      setFormMessage({
        emailAddress:
          'Sorry, only letters (a-z), numbers (0-9), and periods (.) are allowed.',
      })
      return
    }
    if (!passwordPattern.test(formData.current.password)) {
      setFormMessage({
        password:
          'Password must be at least 6 characters and include uppercase, lowercase, numbers, and symbols.',
      })
      return
    }

    try {
      const result = await api.post('/auth/register', formData.current)
      setFormMessage({ success: result.data?.success })
    } catch (error) {
      setFormMessage({
        error: error.response?.data?.error || 'Something went wrong',
      })
    }
  }

  useEffect(() => {
    if (!formMessage.success) return

    const timer = setTimeout(() => {
      navigate('/login')
    }, 2000)

    return () => clearTimeout(timer)
  }, [formMessage])

  return (
    <div className='w-screen h-dvh flex items-center justify-center'>
      <div className='bg-background border-border p-5 rounded-lg border flex-col max-w-150 w-full lg:w-1/2 py-12 lg:p-20 '>
        <div>
          <h1 className='sm:text-2xl text-xl text-foreground font-semibold text-center mb-8 '>
            Sign up for an account
          </h1>
        </div>
        <form method='post'>
          <div>
            <label
              htmlFor='name'
              className='font-medium block text-base md:text-sm '
            >
              Name
            </label>
            <input
              type='text'
              name='name'
              placeholder='Enter your name'
              className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3  shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
              onChange={(e) => (formData.current.name = e.target.value)}
            />
            {formMessage.name && (
              <span className='text-red-500 text-sm mt-3 block '>
                {formMessage.name}
              </span>
            )}
          </div>

          <div>
            <label
              htmlFor='emailAddress'
              className='font-medium block text-base md:text-sm  mt-5'
            >
              Email address
            </label>
            <div className='relative  mt-3'>
              <input
                type='email'
                name='emailAddress'
                placeholder='Create an address'
                className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) =>
                  (formData.current.emailAddress =
                    e.target.value + `@${import.meta.env.VITE_DOMAIN_NAME}`)
                }
              />
              <span className='absolute top-1/2 right-3.5 -translate-y-1/2 text-sm '>
                @{import.meta.env.VITE_DOMAIN_NAME}
              </span>
            </div>
            {formMessage.emailAddress && (
              <span className=' text-red-500 text-sm mt-3 block '>
                {formMessage.emailAddress}
              </span>
            )}
          </div>
          <div>
            <label
              htmlFor='password'
              className='font-medium block text-base md:text-sm  mt-5'
            >
              Password
            </label>
            <div className='relative'>
              <input
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='*************'
                className='text-base md:text-sm w-full bg-input text-foreground border border-border rounded-md mt-3 p-2 pl-3 shadow-xs placeholder:text-muted-foreground focus:outline-none focus:border-ring focus:ring-2 focus:ring-ring/50'
                onChange={(e) => (formData.current.password = e.target.value)}
              ></input>
              <button
                type='button'
                className=' absolute top-1/2 right-6 cursor-pointer'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
              </button>
            </div>
            {formMessage.password && (
              <span className='text-red-500 text-sm mt-3 block '>
                {formMessage.password}
              </span>
            )}
            {formMessage.error && (
              <span className=' text-red-500 text-sm mt-3 block '>
                {formMessage.error}
              </span>
            )}
            {formMessage.success && (
              <span className=' text-green-500 text-sm mt-4 block '>
                {formMessage.success}
              </span>
            )}
          </div>
          <button
            type='submit'
            className='mt-8 w-full p-2 rounded-md border border-border bg-foreground text-background font-medium shadow-xs active:scale-[1.02] transition-all ease-in-out hover:scale-[0.98] cursor-pointer focus:outline-none focus:ring-2 focus:ring-ring/50'
            onClick={(e) => handleSubmit(e)}
          >
            Register
          </button>
        </form>
        <div className=' text-sm  mt-5 text-muted-foreground '>
          Already have an account?
          <Link
            to='/login'
            className=' underline underline-offset-3 ml-1 text-foreground'
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  )
}
export default Register
