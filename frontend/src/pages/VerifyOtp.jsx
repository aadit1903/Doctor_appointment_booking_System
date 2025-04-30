import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { AppContext } from '../context/AppContext'

const VerifyOtp = () => {
  const location = useLocation()
  const initialEmail = location.state?.email || ''

  const [otp, setOtp] = useState('')
  const [email] = useState(initialEmail)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { backendUrl, setToken } = useContext(AppContext)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/verify-login-otp`, {
        email,
        otp,
      })

      if (data.success) {
        toast.success('OTP Verified Successfully!')
        localStorage.setItem('token', data.token)
        setToken(data.token)
        navigate('/my-profile') // Redirect after successful OTP verification
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      const { data } = await axios.post(`${backendUrl}/api/auth/send-otp`, {
        email,
      })

      if (data.success) {
        toast.success('OTP resent successfully!')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP')
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <form onSubmit={handleSubmit} className='bg-white shadow-lg p-8 rounded-lg w-96'>
        <h2 className='text-2xl font-bold mb-6 text-center'>Verify OTP</h2>

        <p className='text-sm text-gray-600 mb-4'>
          We've sent a verification code to <strong>{email}</strong>
        </p>

        <div className='mb-6'>
          <label className='block text-sm font-medium mb-2'>Enter Verification Code</label>
          <input
            type='text'
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className='border border-gray-300 rounded w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Enter 6-digit code'
            maxLength={6}
            required
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='bg-primary text-white w-full py-3 rounded-md font-medium hover:opacity-90 transition-opacity disabled:bg-gray-400'
        >
          {isSubmitting ? 'Verifying...' : 'Verify OTP'}
        </button>

        <div className='mt-4 text-center'>
          <button
            type='button'
            onClick={handleResendOtp}
            className='text-sm text-blue-600 hover:text-blue-800'
          >
            Didn't receive code? Resend OTP
          </button>
        </div>
      </form>
    </div>
  )
}

export default VerifyOtp
