import React, { useContext, useEffect, useState } from 'react';
import { AdminContext } from '../../context/AdminContext';

const DoctorsList = () => {
  const { doctors, changeAvailability, aToken, getAllDoctors } = useContext(AdminContext);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSpeciality, setFilterSpeciality] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    if (aToken) {
      getAllDoctors();
    }
  }, [aToken, getAllDoctors]);

  // Get all unique specialities for the filter dropdown
  const specialities = [...new Set(doctors.map(doctor => doctor.speciality))];

  // Filter doctors based on search term and speciality
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpeciality = filterSpeciality ? doctor.speciality === filterSpeciality : true;
    return matchesSearch && matchesSpeciality;
  });

  // Toggle doctor availability with confirmation
  const handleAvailabilityChange = (doctorId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";
    
    if (window.confirm(`Are you sure you want to ${action} this doctor's availability?`)) {
      changeAvailability(doctorId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 m-5">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Doctors Directory</h1>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 w-full"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
          
          {/* Speciality Filter */}
          <select
            value={filterSpeciality}
            onChange={(e) => setFilterSpeciality(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">All Specialities</option>
            {specialities.map((speciality, index) => (
              <option key={index} value={speciality}>
                {speciality}
              </option>
            ))}
          </select>
          
          {/* View Toggle */}
          <div className="flex border rounded-lg overflow-hidden">
            <button
              className={`px-4 py-2 ${
                viewMode === 'grid' ? 'bg-primary text-white' : 'bg-gray-50'
              }`}
              onClick={() => setViewMode('grid')}
            >
              📊 Grid
            </button>
            <button
              className={`px-4 py-2 ${
                viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-50'
              }`}
              onClick={() => setViewMode('list')}
            >
              📋 List
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-xs text-blue-600 font-medium">TOTAL DOCTORS</p>
          <p className="text-2xl font-semibold">{doctors.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-xs text-green-600 font-medium">AVAILABLE</p>
          <p className="text-2xl font-semibold">{doctors.filter(d => d.available).length}</p>
        </div>
        <div className="bg-amber-50 p-4 rounded-lg">
          <p className="text-xs text-amber-600 font-medium">UNAVAILABLE</p>
          <p className="text-2xl font-semibold">{doctors.filter(d => !d.available).length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-xs text-purple-600 font-medium">SPECIALITIES</p>
          <p className="text-2xl font-semibold">{specialities.length}</p>
        </div>
      </div>

      {/* No results message */}
      {filteredDoctors.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No doctors found matching your criteria</p>
        </div>
      )}

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDoctors.map((doctor, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl overflow-hidden border transition-all duration-300 hover:shadow-md ${
                doctor.available ? 'border-green-200' : 'border-amber-200'
              }`}
            >
              <div className="relative">
                <div className={`absolute top-0 right-0 m-2 px-2 py-1 ${
                  doctor.available ? 'bg-green-500' : 'bg-amber-500'
                } text-white text-xs font-medium rounded-full`}>
                  {doctor.available ? 'Available' : 'Unavailable'}
                </div>
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-48 object-cover"
                />
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">{doctor.name}</h3>
                <p className="text-blue-600 text-sm">{doctor.speciality}</p>
                
                <div className="mt-4 flex items-center justify-between">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={doctor.available}
                        onChange={() => handleAvailabilityChange(doctor._id, doctor.available)}
                      />
                      <div className={`block w-10 h-6 rounded-full ${
                        doctor.available ? 'bg-green-400' : 'bg-gray-300'
                      }`}></div>
                      <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                        doctor.available ? 'translate-x-4' : ''
                      }`}></div>
                    </div>
                    <span className="ml-3 text-sm font-medium text-gray-700">
                      {doctor.available ? 'Active' : 'Inactive'}
                    </span>
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Speciality</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.map((doctor, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={doctor.image}
                          alt={doctor.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-blue-600">{doctor.speciality}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      doctor.available ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {doctor.available ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={doctor.available}
                          onChange={() => handleAvailabilityChange(doctor._id, doctor.available)}
                        />
                        <div className={`block w-10 h-6 rounded-full ${
                          doctor.available ? 'bg-green-400' : 'bg-gray-300'
                        }`}></div>
                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${
                          doctor.available ? 'translate-x-4' : ''
                        }`}></div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        Toggle availability
                      </span>
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DoctorsList;