import React, { useContext, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const AddDoctor = () => {
    const initialFormState = {
        name: '',
        email: '',
        password: '',
        experience: '1 Year',
        fees: '',
        about: '',
        speciality: 'General Physician',
        degree: '',
        address: { line1: '', line2: '' }
    };

    const [docImg, setDocImg] = useState(null);
    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    const { backendUrl } = useContext(AppContext);
    const { aToken } = useContext(AdminContext);

    const specialities = [
        'General Physician', 
        'Gynecologist', 
        'Dermatologist', 
        'Pediatrician', 
        'Neurologist', 
        'Gastroenterologist',
        'Cardiologist',
        'Orthopedic Surgeon',
        'Psychiatrist',
        'Ophthalmologist'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            address: {
                ...prev.address,
                [name]: value
            }
        }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.warning("Image should be less than 2MB");
                return;
            }
            setDocImg(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) newErrors.name = "Name is required";
        if (!formData.email.trim()) newErrors.email = "Email is required";
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
        
        if (!formData.password) newErrors.password = "Password is required";
        else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        
        if (!formData.fees) newErrors.fees = "Fees is required";
        if (!formData.degree.trim()) newErrors.degree = "Degree is required";
        if (!formData.address.line1.trim()) newErrors.addressLine1 = "Address is required";
        if (!docImg) newErrors.image = "Doctor image is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        
        try {
            const submitData = new FormData();
            submitData.append('image', docImg);
            
            Object.keys(formData).forEach(key => {
                if (key === 'address') {
                    submitData.append(key, JSON.stringify(formData[key]));
                } else if (key === 'fees') {
                    submitData.append(key, Number(formData[key]));
                } else {
                    submitData.append(key, formData[key]);
                }
            });

            const { data } = await axios.post(
                `${backendUrl}/api/admin/add-doctor`, 
                submitData, 
                { headers: { aToken } }
            );

            if (data.success) {
                toast.success(data.message);
                setDocImg(null);
                setFormData(initialFormState);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='max-w-5xl mx-auto p-6 bg-white shadow-lg rounded-lg'>
            <h2 className='text-2xl font-bold mb-6 text-blue-600 border-b pb-2'>Add New Doctor</h2>
            
            <form onSubmit={handleSubmit} className='bg-gray-50 p-6 rounded-lg'>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                    {/* Upload Image Section */}
                    <div className='flex flex-col items-center justify-start'>
                        <div className='w-40 h-40 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-4 border-blue-300'>
                            {docImg ? (
                                <img 
                                    src={URL.createObjectURL(docImg)} 
                                    alt="Doctor Preview" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full w-full cursor-pointer">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span className="text-sm text-center text-gray-500 mt-2">Add Photo</span>
                                </div>
                            )}
                        </div>
                        
                        <label className='mt-4 bg-blue-500 text-white py-2 px-4 rounded cursor-pointer hover:bg-blue-600 transition'>
                            {docImg ? 'Change Photo' : 'Upload Photo'}
                            <input 
                                type='file' 
                                onChange={handleImageUpload} 
                                className='hidden' 
                                accept="image/*" 
                            />
                        </label>
                        
                        {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
                        
                        <div className="text-sm text-gray-500 mt-2 text-center">
                            <p>Max size: 2MB</p>
                            <p>Recommended: Square image</p>
                        </div>
                    </div>

                    {/* Form Fields */}
                    <div className='col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Doctor Name*</label>
                            <input 
                                type='text' 
                                name="name"
                                value={formData.name} 
                                onChange={handleChange} 
                                className={`w-full border ${errors.name ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`} 
                            />
                            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Speciality*</label>
                            <select 
                                name="speciality"
                                value={formData.speciality} 
                                onChange={handleChange} 
                                className='w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none'
                            >
                                {specialities.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Email Address*</label>
                            <input 
                                type='email' 
                                name="email"
                                value={formData.email} 
                                onChange={handleChange} 
                                className={`w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`}
                            />
                            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Medical Degree*</label>
                            <input 
                                type='text' 
                                name="degree"
                                value={formData.degree} 
                                onChange={handleChange} 
                                className={`w-full border ${errors.degree ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`}
                                placeholder="MD, MBBS, etc."
                            />
                            {errors.degree && <p className="text-red-500 text-sm mt-1">{errors.degree}</p>}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Password*</label>
                            <input 
                                type='password' 
                                name="password"
                                value={formData.password} 
                                onChange={handleChange} 
                                className={`w-full border ${errors.password ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`}
                            />
                            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Years of Experience*</label>
                            <select 
                                name="experience"
                                value={formData.experience} 
                                onChange={handleChange} 
                                className='w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none'
                            >
                                {[...Array(30).keys()].map(i => (
                                    <option key={i} value={`${i + 1} ${i + 1 === 1 ? 'Year' : 'Years'}`}>
                                        {i + 1} {i + 1 === 1 ? 'Year' : 'Years'}
                                    </option>
                                ))}
                            </select>
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700'>Consultation Fee* (₹)</label>
                            <input 
                                type='number' 
                                name="fees"
                                value={formData.fees} 
                                onChange={handleChange} 
                                className={`w-full border ${errors.fees ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`}
                                min="0"
                            />
                            {errors.fees && <p className="text-red-500 text-sm mt-1">{errors.fees}</p>}
                        </div>
                        
                        <div className="md:col-span-2">
                            <label className='block text-sm font-medium text-gray-700'>Clinic Address*</label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                    <input 
                                        type='text' 
                                        name="line1"
                                        value={formData.address.line1} 
                                        onChange={handleAddressChange} 
                                        className={`w-full border ${errors.addressLine1 ? 'border-red-500' : 'border-gray-300'} p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none`}
                                        placeholder='Street Address'
                                    />
                                    {errors.addressLine1 && <p className="text-red-500 text-sm mt-1">{errors.addressLine1}</p>}
                                </div>
                                <div>
                                    <input 
                                        type='text' 
                                        name="line2"
                                        value={formData.address.line2} 
                                        onChange={handleAddressChange} 
                                        className='w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none'
                                        placeholder='City, State, Pincode'
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-6'>
                    <label className='block text-sm font-medium text-gray-700'>About Doctor</label>
                    <textarea 
                        name="about"
                        value={formData.about} 
                        onChange={handleChange} 
                        className='w-full border border-gray-300 p-2 rounded mt-1 focus:ring-2 focus:ring-blue-300 focus:border-blue-500 outline-none' 
                        rows='4' 
                        placeholder='Professional background, specializations, achievements, etc.'
                    ></textarea>
                </div>

                <div className="flex justify-between mt-6">
                    <button 
                        type="button" 
                        onClick={() => {
                            setFormData(initialFormState);
                            setDocImg(null);
                            setErrors({});
                        }}
                        className='bg-gray-300 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-400 transition'
                    >
                        Reset Form
                    </button>
                    
                    <button 
                        type='submit' 
                        disabled={isSubmitting}
                        className={`bg-blue-600 text-white py-2 px-8 rounded-lg ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} transition flex items-center`}
                    >
                        {isSubmitting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </>
                        ) : (
                            'Add Doctor'
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddDoctor;