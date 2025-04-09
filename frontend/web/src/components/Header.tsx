import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@clerk/clerk-react';
import UserNav from './UserNav';
import ToneElevateLogo from '../assets/tone-elevate-logo-full.png'; // Import the logo

const Header: React.FC = () => {
  const { userId } = useAuth();

  return (
    <header className="bg-white shadow-sm">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Replace h1 with img */}
        <Link to="/" className="flex items-center">
          <img 
            src={ToneElevateLogo} 
            alt="ToneElevate logo - AI message generator and tone helper" 
            className="h-10 w-auto" // Adjust height/width as needed
          />
        </Link>
        
        <div>
          {userId ? (
            <UserNav />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild className="ml-2">
                <Link to="/sign-up">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header; 