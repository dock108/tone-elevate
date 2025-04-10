import React from 'react';
import { Session } from '@supabase/supabase-js'; // Import Session type
import logoSrc from '../assets/tone-elevate-logo-full.png'; // Import the logo

interface HeaderProps {
  session: Session | null; // Pass session state
  onLoginClick: () => void; // Handler to open auth modal
  onLogoutClick: () => void; // Handler for logout action
}

const Header: React.FC<HeaderProps> = ({ session, onLoginClick, onLogoutClick }) => {
  return (
    <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <img 
        src={logoSrc} 
        alt="ToneElevate logo featuring tuning sliders icon - AI message generator for crafting perfectly toned communication." 
        className="h-10 w-auto"
      />
      <div>
        {session?.user ? (
          // If user is logged in, show email and Logout button
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline" title={session.user.email}> { /* Hide email on small screens */}
              {session.user.email}
            </span>
            <button 
              onClick={onLogoutClick}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        ) : (
          // If user is not logged in, show Login/Sign Up button
          <button 
            onClick={onLoginClick} 
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
          >
            Login / Sign Up
          </button>
        )}
      </div>
    </header>
  );
};

export default Header; 