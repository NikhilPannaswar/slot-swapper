import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Marketplace = () => {
  const { token } = useContext(AuthContext);
  const [swappableSlots, setSwappableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSwappableSlots = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/swappable-slots', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setSwappableSlots(data);
        } else {
          setError('Failed to fetch swappable slots');
        }
      } catch (error) {
        setError('Failed to fetch swappable slots');
      }
    };
    
    if (token) {
      fetchSwappableSlots();
    }
  }, [token]);

  const handleRequestSwap = async (theirSlotId) => {
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const mySwappable = data.filter((event) => event.status === 'SWAPPABLE');
        if (mySwappable.length === 0) {
          setError('You need at least one SWAPPABLE slot to request a swap');
          return;
        }
        setMySwappableSlots(mySwappable);
        setSelectedSlot(theirSlotId);
        setModalOpen(true);
      }
    } catch (error) {
      setError('Failed to fetch your slots');
    }
  };

  const submitSwapRequest = async (mySlotId) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/swap-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ mySlotId, theirSlotId: selectedSlot }),
      });
      
      if (response.ok) {
        setModalOpen(false);
        setError(null);
        alert('Swap request sent successfully!');
        // Refresh the swappable slots
        window.location.reload();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to send swap request');
      }
    } catch (error) {
      setError('Failed to send swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Marketplace</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Available Swappable Slots</h2>
          {swappableSlots.length === 0 ? (
            <p className="p-6 text-gray-500">No swappable slots available at the moment.</p>
          ) : (
            <div className="divide-y">
              {swappableSlots.map((slot) => (
                <div key={slot._id} className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{slot.title}</h3>
                    <p className="text-gray-600">
                      {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                    </p>
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 bg-green-100 text-green-800">
                      SWAPPABLE
                    </span>
                  </div>
                  <button
                    onClick={() => handleRequestSwap(slot._id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition duration-200"
                  >
                    Request Swap
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-h-96 overflow-y-auto">
              <h2 className="text-xl font-bold mb-4">Select Your Slot to Swap</h2>
              {mySwappableSlots.length === 0 ? (
                <p className="text-gray-500 mb-4">You have no swappable slots.</p>
              ) : (
                <div className="space-y-3 mb-4">
                  {mySwappableSlots.map((slot) => (
                    <div key={slot._id} className="border rounded-lg p-3">
                      <h3 className="font-semibold">{slot.title}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(slot.startTime).toLocaleString()} - {new Date(slot.endTime).toLocaleString()}
                      </p>
                      <button
                        onClick={() => submitSwapRequest(slot._id)}
                        disabled={loading}
                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition duration-200 disabled:opacity-50"
                      >
                        {loading ? 'Sending...' : 'Select This Slot'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end">
                <button 
                  onClick={() => setModalOpen(false)} 
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded transition duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;