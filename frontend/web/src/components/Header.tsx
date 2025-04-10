import React from 'react';
import { Session } from '@supabase/supabase-js'; // Import Session type
import logoSrc from '../assets/tone-elevate-logo-full.png'; // Import the logo

interface HeaderProps {
  session: Session | null; // Pass session state
  isPremium: boolean; // Added isPremium prop
  onLoginClick: () => void; // Handler to open auth modal
  onLogoutClick: () => void; // Handler for logout action
  onUpgradeClick: () => void; // Added handler for upgrade action
  isUpgrading?: boolean; // Optional prop for upgrade button loading state
}

const Header: React.FC<HeaderProps> = ({ 
  session, 
  isPremium, // Destructure isPremium
  onLoginClick, 
  onLogoutClick, 
  onUpgradeClick, // Destructure onUpgradeClick
  isUpgrading = false // Default to false if not provided
}) => {
  return (
    <header className="bg-white p-4 border-b flex justify-between items-center sticky top-0 z-10 shadow-sm">
      <img 
        src={logoSrc} 
        alt="ToneElevate logo featuring tuning sliders icon - AI message generator for crafting perfectly toned communication." 
        className="h-10 w-auto"
      />
      <div>
        {session?.user ? (
          // If user is logged in, show email, status/upgrade, and Logout button
          <div className="flex items-center space-x-3 sm:space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline" title={session.user.email}> { /* Hide email on small screens */}
              {session.user.email}
            </span>
            {/* Premium Badge or Upgrade Button */} 
            {isPremium ? (
              <span className="px-2 py-0.5 text-xs font-semibold bg-yellow-100 text-yellow-800 rounded-full">Premium ✨</span>
            ) : (
              <button 
                onClick={onUpgradeClick}
                disabled={isUpgrading}
                className={`px-3 py-1 text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out shadow-sm ${isUpgrading ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isUpgrading ? 'Processing...' : 'Upgrade'}
              </button>
            )}
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