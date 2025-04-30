import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const MyAppointments = () => {
    const { backendUrl, token } = useContext(AppContext);
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState([]);
    const [paymentId, setPaymentId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Function to format the date eg. ( 20_01_2000 => 20 Jan 2000 )
    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2];
    }

    // Getting User Appointments Data Using API
    const getUserAppointments = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } });
            setAppointments(data.appointments.reverse());
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    // Function to cancel appointment Using API
    const cancelAppointment = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/cancel-appointment', 
                { appointmentId }, 
                { headers: { token } }
            );

            if (data.success) {
                toast.success(data.message);
                getUserAppointments();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    const initPay = (order) => {
        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: order.amount,
            currency: order.currency,
            name: 'Appointment Payment',
            description: "Appointment Payment",
            order_id: order.id,
            receipt: order.receipt,
            handler: async (response) => {
                try {
                    const { data } = await axios.post(
                        backendUrl + "/api/user/verifyRazorpay", 
                        response, 
                        { headers: { token } }
                    );
                    
                    if (data.success) {
                        navigate('/my-appointments');
                        getUserAppointments();
                    }
                } catch (error) {
                    console.log(error);
                    toast.error(error.message);
                }
            }
        };
        
        const rzp = new window.Razorpay(options);
        rzp.open();
    };

    // Function to make payment using razorpay
    const appointmentRazorpay = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-razorpay', 
                { appointmentId }, 
                { headers: { token } }
            );
            
            if (data.success) {
                initPay(data.order);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    // Function to make payment using stripe
    const appointmentStripe = async (appointmentId) => {
        try {
            const { data } = await axios.post(
                backendUrl + '/api/user/payment-stripe', 
                { appointmentId }, 
                { headers: { token } }
            );
            
            if (data.success) {
                const { session_url } = data;
                window.location.replace(session_url);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    }

    useEffect(() => {
        if (token) {
            getUserAppointments();
        }
    }, [token]);

    // Get appointment status UI elements
    const getAppointmentStatus = (appointment) => {
        if (appointment.cancelled) {
            return (
                <div className="text-red-500 font-medium">
                    Cancelled
                </div>
            );
        } else if (appointment.isCompleted) {
            return (
                <div className="text-green-500 font-medium">
                    Completed
                </div>
            );
        } else if (appointment.payment) {
            return (
                <div className="text-blue-500 font-medium">
                    Paid
                </div>
            );
        } else {
            return (
                <div className="text-amber-500 font-medium">
                    Payment Due
                </div>
            );
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6 mt-12">My Appointments</h1>
            
            {isLoading ? (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : appointments.length === 0 ? (
                <div className="bg-gray-50 rounded-lg py-16 text-center">
                    <p className="text-gray-500 text-lg">You don't have any appointments yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {appointments.map((appointment, index) => (
                        <div 
                            key={index} 
                            className={`bg-white rounded-lg shadow-sm overflow-hidden border transition-all duration-300 ${
                                appointment.cancelled ? "border-red-200" : 
                                appointment.isCompleted ? "border-green-200" : 
                                "border-gray-200"
                            }`}
                        >
                            <div className="p-4 md:p-6">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Doctor Image */}
                                    <div className="flex-shrink-0">
                                        <img 
                                            className="w-full md:w-32 h-32 object-cover rounded bg-blue-50" 
                                            src={appointment.docData.image} 
                                            alt={appointment.docData.name} 
                                        />
                                    </div>
                                    
                                    {/* Appointment Details */}
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{appointment.docData.name}</h3>
                                                <p className="text-blue-600">{appointment.docData.speciality}</p>
                                            </div>
                                            <div>
                                                {getAppointmentStatus(appointment)}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-4 space-y-2 text-gray-600">
                                            <div className="flex items-center">
                                                <span className="mr-2 text-gray-400">🗓️</span>
                                                <span>{slotDateFormat(appointment.slotDate)} | {appointment.slotTime}</span>
                                            </div>
                                            
                                            <div className="flex items-start">
                                                <span className="mr-2 mt-1 flex-shrink-0 text-gray-400">📍</span>
                                                <div>
                                                    <p>{appointment.docData.address.line1}</p>
                                                    <p>{appointment.docData.address.line2}</p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="mt-6 flex flex-wrap gap-3">
                                            {!appointment.cancelled && !appointment.payment && !appointment.isCompleted && paymentId !== appointment._id && (
                                                <button 
                                                    onClick={() => setPaymentId(appointment._id)} 
                                                    className="px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-all duration-300"
                                                >
                                                    Pay Online
                                                </button>
                                            )}
                                            
                                            {!appointment.cancelled && !appointment.payment && !appointment.isCompleted && paymentId === appointment._id && (
                                                <div className="flex flex-wrap gap-3">
                                                    <button 
                                                        onClick={() => appointmentStripe(appointment._id)} 
                                                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-all duration-300"
                                                    >
                                                        <img className="h-6" src={assets.stripe_logo} alt="Stripe" />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => appointmentRazorpay(appointment._id)} 
                                                        className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-50 transition-all duration-300"
                                                    >
                                                        <img className="h-6" src={assets.razorpay_logo} alt="Razorpay" />
                                                    </button>
                                                    
                                                    <button 
                                                        onClick={() => setPaymentId(null)} 
                                                        className="px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-all duration-300"
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                            
                                            {!appointment.cancelled && !appointment.isCompleted && (
                                                <button 
                                                    onClick={() => cancelAppointment(appointment._id)} 
                                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all duration-300"
                                                >
                                                    Cancel Appointment
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyAppointments;