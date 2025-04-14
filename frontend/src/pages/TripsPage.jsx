import React, { useEffect, useState } from 'react';

const TripsPage = () => {
  const [drivingTrips, setDrivingTrips] = useState([]);
  const [ridingTrips, setRidingTrips] = useState([]);
  const [loadingDriving, setLoadingDriving] = useState(true);
  const [loadingRiding, setLoadingRiding] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Driving trips
  const fetchDrivingTrips = async () => {
    setLoadingDriving(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/trips/driving', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch driving trips');
      }
      const data = await response.json();
      console.log('Driving trips:', data);
      setDrivingTrips(data);
    } catch (error) {
      console.error('Error fetching driving trips:', error);
      setError('Failed to load driving trips');
    } finally {
      setLoadingDriving(false);
    }
  };

  // Fetch Riding trips
  const fetchRidingTrips = async () => {
    setLoadingRiding(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:5000/trips/riding', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch riding trips');
      }
      const data = await response.json();
      setRidingTrips(data);
    } catch (error) {
      console.error('Error fetching riding trips:', error);
      setError('Failed to load riding trips');
    } finally {
      setLoadingRiding(false);
    }
  };

  // Handle request status change
  const handleRequestStatusChange = async (requestId, status) => {
    try {
      const response = await fetch(`http://localhost:5000/requests/${requestId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update request status');
      }
      // Re-fetch trips to update the UI
      await fetchDrivingTrips();
    } catch (error) {
      console.error('Error updating request status:', error);
      setError('Failed to update request status');
    }
  };

  useEffect(() => {
    fetchDrivingTrips();
    fetchRidingTrips();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="p-6 font-sans">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Driving Section */}
      <div className="mb-8">
        <h2 className="font-bold text-xl mb-4">Driving</h2>
        {loadingDriving ? (
          <div className="text-center p-4">Loading driving trips...</div>
        ) : drivingTrips.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No driving trips found</div>
        ) : (
          <div className="grid gap-4">
            {drivingTrips.map((trip) => (
              <div key={trip.id} className="border rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold">From</h3>
                    <p>{trip.origin}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">To</h3>
                    <p>{trip.destination}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Departure Time</h3>
                  <p>{formatDate(trip.departureTime)}</p>
                </div>
                {trip.requests && trip.requests.length > 0 ? (
                  <div>
                    <h3 className="font-semibold mb-2">Ride Requests</h3>
                    <div className="space-y-2">
                      {trip.requests.map((request) => (
                        <div key={request.id} className="border-t pt-2">
                          <p className="font-medium">
                            {request.user.firstName} {request.user.lastName}
                          </p>
                          <div className="flex space-x-2 mt-2">
                            <button
                              className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                              onClick={() => handleRequestStatusChange(request.id, 'APPROVED')}
                            >
                              Accept
                            </button>
                            <button
                              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                              onClick={() => handleRequestStatusChange(request.id, 'DECLINED')}
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">No ride requests yet</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Riding Section */}
      <div>
        <h2 className="font-bold text-xl mb-4">Riding</h2>
        {loadingRiding ? (
          <div className="text-center p-4">Loading riding trips...</div>
        ) : ridingTrips.length === 0 ? (
          <div className="text-center p-4 text-gray-500">No riding trips found</div>
        ) : (
          <div className="grid gap-4">
            {ridingTrips.map((request) => (
              <div key={request.id} className="border rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold">From</h3>
                    <p>{request.share.origin}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold">To</h3>
                    <p>{request.share.destination}</p>
                  </div>
                </div>
                <div className="mb-4">
                  <h3 className="font-semibold">Departure Time</h3>
                  <p>{formatDate(request.share.departureTime)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Status</h3>
                  <p className={`inline-block px-2 py-1 rounded ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    request.status === 'DECLINED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripsPage;