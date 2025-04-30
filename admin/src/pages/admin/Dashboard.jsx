import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { assets } from '../../assets/assets';
import { AdminContext } from '../../context/AdminContext';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { aToken, getDashData, cancelAppointment, dashData } = useContext(AdminContext);
  const { slotDateFormat } = useContext(AppContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (aToken) {
      getDashData();
    }
  }, [aToken]);

  return dashData && (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Dashboard</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Doctors" value={dashData.doctors} icon={assets.doctor_icon} />
        <StatsCard title="Appointments" value={dashData.appointments} icon={assets.appointments_icon} />
        <StatsCard title="Patients" value={dashData.patients} icon={assets.patients_icon} />
      </div>
      
      {/* Latest Appointments */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 bg-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Latest Bookings</h2>
          <button onClick={() => navigate('/all-appointments')} className="text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
        </div>
        
        <div className="divide-y divide-gray-200">
          {dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center px-6 py-4 hover:bg-gray-50 transition-all">
                <img src={item.docData.image} alt={item.docData.name} className="w-12 h-12 rounded-full object-cover mr-4" />
                <div className="flex-1">
                  <h3 className="text-md font-medium text-gray-900">{item.docData.name}</h3>
                  <p className="text-xs text-gray-500">{slotDateFormat(item.slotDate)}</p>
                </div>
                {item.cancelled ? (
                  <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-600 rounded-full">Cancelled</span>
                ) : item.isCompleted ? (
                  <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-600 rounded-full">Completed</span>
                ) : (
                  <button onClick={() => cancelAppointment(item._id)} className="p-2 rounded-full hover:bg-gray-100 transition">
                    <img src={assets.cancel_icon} alt="Cancel" className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500">No recent bookings available</div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ title, value, icon }) => (
  <div className="p-6 bg-white rounded-xl shadow-md flex items-center gap-4 hover:shadow-lg transition-all">
    <div className="p-3 bg-gray-100 rounded-lg">
      <img src={icon} alt={title} className="w-8 h-8" />
    </div>
    <div>
      <h2 className="text-2xl font-bold text-gray-800">{value}</h2>
      <p className="text-sm text-gray-500">Total {title}</p>
    </div>
  </div>
);

export default Dashboard;