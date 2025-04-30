import React, { useContext, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const ProfileField = ({ label, isEdit, editComponent, viewComponent }) => (
  <div className="flex flex-col md:flex-row md:items-center gap-2 py-2">
    <p className="font-medium w-28">{label}:</p>
    <div className="flex-1">
      {isEdit ? editComponent : viewComponent}
    </div>
  </div>
);

const MyProfile = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [image, setImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { token, backendUrl, userData, setUserData, loadUserProfileData } = useContext(AppContext);

  const updateUserProfileData = async () => {
    if (!userData) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('name', userData.name);
      formData.append('phone', userData.phone);
      formData.append('address', JSON.stringify(userData.address));
      formData.append('gender', userData.gender);
      formData.append('dob', userData.dob);

      if (image) {
        formData.append('image', image);
      }

      const { data } = await axios.post(
        `${backendUrl}/api/user/update-profile`, 
        formData, 
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message);
        await loadUserProfileData();
        setIsEdit(false);
        setImage(null);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field, value) => {
    setUserData(prev => ({
      ...prev,
      address: { ...prev.address, [field]: value }
    }));
  };

  if (!userData) return <div className="flex justify-center p-8">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-sm">
      <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-6">
        <div className="relative">
          {isEdit ? (
            <label htmlFor="image" className="group cursor-pointer block">
              <div className="relative inline-block">
                <img 
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-200" 
                  src={image ? URL.createObjectURL(image) : userData.image} 
                  alt="Profile" 
                />
                <div className="absolute inset-0 bg-black bg-opacity-20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <img className="w-10" src={assets.upload_icon} alt="Upload" />
                </div>
              </div>
              <input 
                onChange={(e) => setImage(e.target.files[0])} 
                type="file" 
                id="image" 
                accept="image/*"
                className="hidden" 
              />
            </label>
          ) : (
            <img 
              className="w-32 h-32 object-cover rounded-full border-2 border-gray-200" 
              src={userData.image} 
              alt="Profile" 
            />
          )}
        </div>
        
        <div className="flex-1">
          {isEdit ? (
            <input 
              className="bg-gray-50 text-3xl font-medium w-full p-2 border rounded" 
              type="text" 
              onChange={(e) => handleChange('name', e.target.value)} 
              value={userData.name} 
            />
          ) : (
            <h1 className="font-medium text-3xl text-gray-800">{userData.name}</h1>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-blue-600 font-medium border-b pb-2 mb-3">CONTACT INFORMATION</h2>
          
          <ProfileField 
            label="Email"
            isEdit={false}
            viewComponent={<p className="text-blue-500">{userData.email}</p>}
          />
          
          <ProfileField 
            label="Phone"
            isEdit={isEdit}
            editComponent={
              <input 
                className="bg-gray-50 p-2 border rounded w-full" 
                type="text" 
                onChange={(e) => handleChange('phone', e.target.value)} 
                value={userData.phone} 
              />
            }
            viewComponent={<p className="text-blue-500">{userData.phone}</p>}
          />
          
          <ProfileField 
            label="Address"
            isEdit={isEdit}
            editComponent={
              <div className="space-y-2">
                <input 
                  className="bg-gray-50 p-2 border rounded w-full" 
                  type="text" 
                  placeholder="Address Line 1"
                  onChange={(e) => handleAddressChange('line1', e.target.value)} 
                  value={userData.address.line1} 
                />
                <input 
                  className="bg-gray-50 p-2 border rounded w-full" 
                  type="text" 
                  placeholder="Address Line 2"
                  onChange={(e) => handleAddressChange('line2', e.target.value)} 
                  value={userData.address.line2} 
                />
              </div>
            }
            viewComponent={
              <p className="text-gray-600">
                {userData.address.line1}
                {userData.address.line2 && <><br />{userData.address.line2}</>}
              </p>
            }
          />
        </section>
        
        <section>
          <h2 className="text-blue-600 font-medium border-b pb-2 mb-3">BASIC INFORMATION</h2>
          
          <ProfileField 
            label="Gender"
            isEdit={isEdit}
            editComponent={
              <select 
                className="bg-gray-50 p-2 border rounded w-full max-w-xs" 
                onChange={(e) => handleChange('gender', e.target.value)} 
                value={userData.gender}
              >
                <option value="Not Selected">Not Selected</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            }
            viewComponent={<p className="text-gray-600">{userData.gender}</p>}
          />
          
          <ProfileField 
            label="Birthday"
            isEdit={isEdit}
            editComponent={
              <input 
                className="bg-gray-50 p-2 border rounded w-full max-w-xs" 
                type="date" 
                onChange={(e) => handleChange('dob', e.target.value)} 
                value={userData.dob} 
              />
            }
            viewComponent={<p className="text-gray-600">{userData.dob}</p>}
          />
        </section>
      </div>
      
      <div className="mt-8 flex justify-start">
        {isEdit ? (
          <div className="space-x-4">
            <button 
              onClick={updateUserProfileData} 
              disabled={isSubmitting}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              onClick={() => {
                setIsEdit(false);
                setImage(null);
              }}
              className="border border-gray-300 px-6 py-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsEdit(true)} 
            className="border border-blue-600 text-blue-600 px-6 py-2 rounded-md hover:bg-blue-50 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;