import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'
import axios from 'axios'
import { toast } from 'react-toastify'

// Calendar icon SVG component
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

// Clock icon SVG component
const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const Appointment = () => {
  const { docId } = useParams()
  const { doctors, currencySymbol, backendUrl, token, getDoctosData } = useContext(AppContext)
  const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  const [docInfo, setDocInfo] = useState(false)
  const [docSlots, setDocSlots] = useState([])
  const [slotIndex, setSlotIndex] = useState(0)
  const [slotTime, setSlotTime] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()

  // Get the doctor's info from the global doctors array
  const fetchDocInfo = async () => {
    const foundDoc = doctors.find((doc) => doc._id === docId)
    setDocInfo(foundDoc)
  }

  // Generate slots only for the current month
  const getAvailableSolts = async () => {
    if (!docInfo) return

    setDocSlots([])
    let today = new Date()
    const currentMonth = today.getMonth() // e.g., 2 for March

    // Up to 31 days from today, but stop if month changes
    for (let i = 0; i < 31; i++) {
      let currentDate = new Date(today)
      currentDate.setDate(today.getDate() + i)

      // If we move to next month, break
      if (currentDate.getMonth() !== currentMonth) break

      // End time = 9 PM on that date
      let endTime = new Date(currentDate)
      endTime.setHours(21, 0, 0, 0)

      // Start time logic
      if (today.getDate() === currentDate.getDate()) {
        // For "today", start from next hour if after 10 AM
        currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
        currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
      } else {
        currentDate.setHours(10)
        currentDate.setMinutes(0)
      }

      let timeSlots = []

      // Generate 30-min intervals from start to endTime
      while (currentDate < endTime) {
        let formattedTime = currentDate.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })

        let day = currentDate.getDate() // e.g., 28
        let month = currentDate.getMonth() + 1 // e.g., 3
        let year = currentDate.getFullYear() // e.g., 2025

        // This is the string we store in DB, "day_month_year"
        const slotDate = `${day}_${month}_${year}`

        // Check if slot is already booked
        const isSlotAvailable = !(
          docInfo.slots_booked[slotDate] &&
          docInfo.slots_booked[slotDate].includes(formattedTime)
        )

        if (isSlotAvailable) {
          timeSlots.push({
            datetime: new Date(currentDate),
            time: formattedTime
          })
        }

        currentDate.setMinutes(currentDate.getMinutes() + 30)
      }

      // Add the day's slots to docSlots
      if (timeSlots.length) {
        setDocSlots((prev) => [...prev, timeSlots])
      }
    }
  }

  const bookAppointment = async () => {
    if (!token) {
      toast.warning('Login to book appointment')
      return navigate('/login')
    }

    if (!slotTime) {
      toast.warning('Please select an appointment time')
      return
    }

    setIsLoading(true)

    // We use the date from the first slot in the selected day
    const date = docSlots[slotIndex][0].datetime

    let day = date.getDate()
    let month = date.getMonth() + 1 // Adding 1 to match the format in getAvailableSlots
    let year = date.getFullYear()

    // The same format used above: "day_month_year"
    const slotDate = `${day}_${month}_${year}`

    try {
      const { data } = await axios.post(
        backendUrl + '/api/user/book-appointment',
        { docId, slotDate, slotTime },
        { headers: { token } }
      )
      if (data.success) {
        toast.success(data.message)
        getDoctosData()
        navigate('/my-appointments')
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (doctors.length > 0) {
      fetchDocInfo()
    }
  }, [doctors, docId])

  useEffect(() => {
    if (docInfo) {
      getAvailableSolts()
    }
  }, [docInfo])

  // Current date formatting for display
  const formatCurrentDate = () => {
    if (docSlots.length === 0 || !docSlots[slotIndex] || !docSlots[slotIndex][0]) return '';
    
    const date = docSlots[slotIndex][0].datetime;
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  return docInfo ? (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Doctor Profile Card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Doctor Image Section */}
            <div className="md:flex-shrink-0">
              <img 
                className="h-64 w-full object-cover md:w-72" 
                src={docInfo.image} 
                alt={docInfo.name} 
              />
            </div>
            
            {/* Doctor Info Section */}
            <div className="p-8 flex-1">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-800">{docInfo.name}</h1>
                <img className="ml-2 w-5 h-5" src={assets.verified_icon} alt="Verified" />
              </div>
              
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className="text-gray-600">{docInfo.degree}</span>
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                <span className="text-gray-600">{docInfo.speciality}</span>
                <span className="px-3 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                  {docInfo.experience}
                </span>
              </div>
              
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-gray-700 flex items-center">
                  About
                  <img className="ml-1 w-3.5" src={assets.info_icon} alt="" />
                </h2>
                <p className="mt-2 text-gray-600 text-sm line-clamp-4">{docInfo.about}</p>
              </div>
              
              <div className="mt-6 flex items-center">
                <div className="px-4 py-2 bg-green-50 text-green-800 rounded-lg text-sm font-medium">
                  Appointment fee: {currencySymbol}{docInfo.fees}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Appointment Booking Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 overflow-hidden">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
            <CalendarIcon />
            <span className="ml-2">Select Appointment Date & Time</span>
          </h2>
          
          {/* Selected Date Display */}
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm">Selected Date</p>
            <p className="text-lg font-medium text-gray-800">{formatCurrentDate()}</p>
          </div>
          
          {/* Day Selector */}
          <div className="flex gap-3 items-center w-full overflow-x-auto pb-2 mb-6">
            {docSlots.map((item, index) => (
              <div
                onClick={() => {
                  setSlotIndex(index);
                  setSlotTime(''); // Reset time selection when date changes
                }}
                key={index}
                className={`text-center p-4 rounded-xl cursor-pointer transition-all ${
                  slotIndex === index 
                    ? 'bg-primary text-white shadow-md transform scale-105' 
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
                style={{ minWidth: '80px' }}
              >
                {item[0] && (
                  <>
                    <p className="text-xs font-medium mb-1">{daysOfWeek[item[0].datetime.getDay()]}</p>
                    <p className="text-xl font-bold">{item[0].datetime.getDate()}</p>
                  </>
                )}
              </div>
            ))}
          </div>
          
          {/* Time Slots Section */}
          <div className="mb-6">
            <h3 className="text-md font-medium text-gray-700 mb-4 flex items-center">
              <ClockIcon />
              <span className="ml-2">Available Time Slots</span>
            </h3>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {docSlots.length > 0 &&
                docSlots[slotIndex]?.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => setSlotTime(slot.time)}
                    className={`py-3 px-2 rounded-lg text-sm font-medium transition-all focus:outline-none ${
                      slot.time === slotTime
                        ? 'bg-primary text-white shadow-md transform scale-105'
                        : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {slot.time.toLowerCase()}
                  </button>
                ))}
            </div>
          </div>
          
          {/* Book Appointment Button */}
          <div className="mt-8">
            <button
              onClick={bookAppointment}
              disabled={isLoading || !slotTime}
              className={`w-full py-4 rounded-xl font-medium text-white transition-all ${
                isLoading || !slotTime 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-primary hover:bg-primary-dark shadow-lg'
              }`}
            >
              {isLoading ? 'Processing...' : slotTime ? 'Confirm Appointment' : 'Select a Time Slot'}
            </button>
          </div>
        </div>
      </div>

      {/* Related Doctors Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-pulse px-4 py-3 text-blue-700 bg-blue-100 rounded-lg">
        Loading doctor information...
      </div>
    </div>
  )
}

export default Appointment