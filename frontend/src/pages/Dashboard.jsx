import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import Navigation from '../components/Navigation';

const Dashboard = () => {
  const { token } = useContext(AuthContext);
  const [events, setEvents] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', startTime: '', endTime: '', status: 'BUSY' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/events', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (response.ok) {
          setEvents(data);
        } else {
          setError('Failed to fetch events');
        }
      } catch (error) {
        setError('Failed to fetch events');
      }
    };
    
    if (token) {
      fetchEvents();
    }
  }, [token]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEvent),
      });
      const data = await response.json();
      if (response.ok) {
        setEvents((prev) => [...prev, data]);
        setNewEvent({ title: '', startTime: '', endTime: '', status: 'BUSY' });
        setError(null);
      } else {
        setError(data.message || 'Failed to create event');
      }
    } catch (error) {
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeSwappable = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: 'SWAPPABLE' }),
      });
      if (response.ok) {
        setEvents((prev) =>
          prev.map((event) => (event._id === id ? { ...event, status: 'SWAPPABLE' } : event))
        );
      }
    } catch (error) {
      setError('Failed to update event');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <div className="max-w-7xl mx-auto py-6 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Create Event Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Event</h2>
          <form onSubmit={handleCreateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Event Title"
              value={newEvent.title}
              onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="datetime-local"
              value={newEvent.startTime}
              onChange={(e) => setNewEvent({ ...newEvent, startTime: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
            <input
              type="datetime-local"
              value={newEvent.endTime}
              onChange={(e) => setNewEvent({ ...newEvent, endTime: e.target.value })}
              className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-blue-500"
              required
            />
            <button 
              type="submit" 
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </form>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold p-6 border-b">Your Events</h2>
          {events.length === 0 ? (
            <p className="p-6 text-gray-500">No events created yet.</p>
          ) : (
            <div className="divide-y">
              {events.map((event) => (
                <div key={event._id} className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    <p className="text-gray-600">
                      {new Date(event.startTime).toLocaleString()} - {new Date(event.endTime).toLocaleString()}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${
                      event.status === 'BUSY' ? 'bg-red-100 text-red-800' :
                      event.status === 'SWAPPABLE' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  {event.status === 'BUSY' && (
                    <button
                      onClick={() => handleMakeSwappable(event._id)}
                      className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition duration-200"
                    >
                      Make Swappable
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;