import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import { toast } from 'react-toastify'
import axios from 'axios'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData } = useContext(DoctorContext)
  const { currency, backendUrl } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)

  const updateProfile = async () => {
    try {
      const updateData = {
        address: profileData.address,
        fees: profileData.fees,
        about: profileData.about,
        available: profileData.available
      }

      const { data } = await axios.post(backendUrl + '/api/doctor/update-profile', updateData, {
        headers: { dToken }
      })

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      toast.error(error.message)
      console.log(error)
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  return profileData && (
    <div className="p-4 sm:p-8 max-w-screen-md mx-auto">
      <div className="flex flex-col sm:flex-row gap-8">
        {/* Doctor Image */}
        <div className="sm:w-1/3">
          <img className="rounded-xl w-full bg-primary/10" src={profileData.image} alt="doctor" />
        </div>

        {/* Profile Info */}
        <div className="flex-1 border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
          {/* Header: Name, Degree */}
          <h2 className="text-2xl font-semibold text-gray-800">{profileData.name}</h2>
          <p className="text-gray-600 mt-1">{profileData.degree} - {profileData.speciality}</p>
          <span className="inline-block mt-1 px-2 py-0.5 border border-gray-300 text-xs rounded-full text-gray-600">
            {profileData.experience}
          </span>

          {/* About */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-700 mb-1">About</h3>
            {isEdit ? (
              <textarea
                className="w-full border rounded-md p-2 text-sm outline-primary"
                rows={5}
                value={profileData.about}
                onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))}
              />
            ) : (
              <p className="text-sm text-gray-600">{profileData.about}</p>
            )}
          </div>

          {/* Fee */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Appointment Fee</h3>
            {isEdit ? (
              <input
                type="number"
                className="border rounded-md p-2 text-sm w-32 outline-primary"
                value={profileData.fees}
                onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))}
              />
            ) : (
              <p className="text-gray-800 text-sm">{currency} {profileData.fees}</p>
            )}
          </div>

          {/* Address */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Address</h3>
            {isEdit ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  className="border rounded-md p-2 text-sm outline-primary"
                  value={profileData.address.line1}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    address: { ...prev.address, line1: e.target.value }
                  }))}
                />
                <input
                  type="text"
                  className="border rounded-md p-2 text-sm outline-primary"
                  value={profileData.address.line2}
                  onChange={(e) => setProfileData(prev => ({
                    ...prev,
                    address: { ...prev.address, line2: e.target.value }
                  }))}
                />
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                {profileData.address.line1} <br />
                {profileData.address.line2}
              </p>
            )}
          </div>

          {/* Availability */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="available"
              checked={profileData.available}
              onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))}
            />
            <label htmlFor="available" className="text-sm text-gray-700">Available</label>
          </div>

          {/* Action Buttons */}
          <div className="mt-6">
            {isEdit ? (
              <button
                onClick={updateProfile}
                className="px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all"
              >
                Save Changes
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-2 border border-primary text-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile
