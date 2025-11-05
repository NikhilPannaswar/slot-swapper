import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Notifications = () => {
  const { token } = useContext(AuthContext);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const [incomingResponse, outgoingResponse] = await Promise.all([
          fetch('http://localhost:5000/api/swap-requests/incoming', {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch('http://localhost:5000/api/swap-requests/outgoing', {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (incomingResponse.ok) {
          const incomingData = await incomingResponse.json();
          setIncomingRequests(incomingData);
        }
        
        if (outgoingResponse.ok) {
          const outgoingData = await outgoingResponse.json();
          setOutgoingRequests(outgoingData);
        }
      } catch (error) {
        setError('Failed to fetch requests');
      }
    };
    
    if (token) {
      fetchRequests();
    }
  }, [token]);

  const handleResponse = async (requestId, accepted) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/swap-response/${requestId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ accepted }),
      });
      
      if (response.ok) {
        setIncomingRequests((prev) => prev.filter((req) => req._id !== requestId));
        setError(null);
        alert(accepted ? 'Swap accepted successfully!' : 'Swap rejected successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to respond to swap request');
      }
    } catch (error) {
      setError('Failed to respond to swap request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Notifications</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Incoming Requests */}
        <div className="bg-white rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold p-6 border-b">Incoming Swap Requests</h2>
          {incomingRequests.length === 0 ? (
            <p className="p-6 text-gray-500">No incoming requests.</p>
          ) : (
            <div className="divide-y">
              {incomingRequests.map((req) => (
                <div key={req._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        Swap Request from {req.requester?.name || 'Unknown User'}
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Their Slot:</p>
                          <p className="font-medium">{req.requesterSlot?.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(req.requesterSlot?.startTime).toLocaleString()} - 
                            {new Date(req.requesterSlot?.endTime).toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Your Slot:</p>
                          <p className="font-medium">{req.receiverSlot?.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(req.receiverSlot?.startTime).toLocaleString()} - 
                            {new Date(req.receiverSlot?.endTime).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button
                        onClick={() => handleResponse(req._id, true)}
                        disabled={loading}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleResponse(req._id, false)}
                        disabled={loading}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Outgoing Swap Requests</h2>
          {outgoingRequests.length === 0 ? (
            <p className="p-6 text-gray-500">No outgoing requests.</p>
          ) : (
            <div className="divide-y">
              {outgoingRequests.map((req) => (
                <div key={req._id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">
                        Request to {req.receiver?.name || 'Unknown User'}
                      </h3>
                      <div className="mt-2 space-y-2">
                        <div>
                          <p className="text-sm text-gray-600">Your Slot:</p>
                          <p className="font-medium">{req.requesterSlot?.title}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Their Slot:</p>
                          <p className="font-medium">{req.receiverSlot?.title}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      req.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      req.status === 'ACCEPTED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;