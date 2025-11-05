import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navigation = () => {
  const { logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            SlotSwapper
          </Link>
          
          <div className="flex space-x-4">
            <Link 
              to="/" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200"
            >
              Dashboard
            </Link>
            <Link 
              to="/marketplace" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200"
            >
              Marketplace
            </Link>
            <Link 
              to="/notifications" 
              className="hover:bg-blue-700 px-3 py-2 rounded transition duration-200"
            >
              Notifications
            </Link>
            <button 
              onClick={logout}
              className="hover:bg-red-600 bg-red-500 px-3 py-2 rounded transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;