import React from 'react';

interface InfoCardProps {
  isLoggedIn: boolean;
  isPremium: boolean;
  onLoginClick: () => void;
  onUpgradeClick: () => void;
  onCancelSubscriptionClick: () => void;
  onFeedbackClick: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
  isLoggedIn,
  isPremium,
  onLoginClick,
  onUpgradeClick,
  onCancelSubscriptionClick,
  onFeedbackClick,
}) => {

  // --- Section Components (Internal) ---

  const WhySignUpSection = () => (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-4">
      <h4 className="text-sm font-semibold text-blue-800 mb-2">Unlock More Features!</h4>
      <ul className="list-disc list-inside text-xs text-blue-700 space-y-1">
        <li>Compare multiple tone variations side-by-side.</li>
        <li>Select desired output length (Short, Medium, Long).</li>
        {/* <li>Save your favorite prompts (Coming soon!).</li> */}
      </ul>
      <button
        onClick={onLoginClick}
        className="mt-3 w-full px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
      >
        Sign Up / Log In
      </button>
    </div>
  );

  const WhyPremiumSection = () => (
    <div className="p-4 bg-purple-50 border border-purple-200 rounded-md mb-4">
      <h4 className="text-sm font-semibold text-purple-800 mb-2">Go Premium ✨ ($4.99/month)</h4>
      <ul className="list-disc list-inside text-xs text-purple-700 space-y-1">
        <li>Refine generated messages with follow-up requests.</li>
        <li>Compare up to 5 tone variations (vs. 3 for free users).</li>
        <li>Access to future premium-only features.</li>
        <li>Support the development of ToneElevate!</li>
      </ul>
      {!isPremium && isLoggedIn && (
         <button
           onClick={onUpgradeClick}
           className="mt-3 w-full px-3 py-1.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out shadow-sm"
         >
           Upgrade to Premium
         </button>
      )}
      {!isLoggedIn && (
          <p className="text-xs text-gray-500 mt-3 text-center">Premium will be $4.99/month after the beta period.</p>
      )}
    </div>
  );

  const FeedbackButton = () => (
     <button
       onClick={onFeedbackClick}
       className="w-full px-3 py-1.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition duration-150 ease-in-out"
     >
       Provide Feedback
     </button>
  );

   const CancelSubscriptionButton = () => (
     <button
       onClick={onCancelSubscriptionClick}
       className="w-full px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
     >
       Cancel Subscription
     </button>
  );


  // --- Main Render Logic ---
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-6 pb-32">
      {!isLoggedIn && (
        <>
          <WhySignUpSection />
          <WhyPremiumSection />
          <FeedbackButton />
        </>
      )}

      {isLoggedIn && !isPremium && (
        <>
          <WhyPremiumSection /> {/* Includes upgrade button */}
          {/* Add Beta Disclaimer for Logged-in, Non-Premium Users */}
          <p className="text-xs text-gray-500 italic text-center px-2 mb-4"> 
             Note: Stripe integration is currently in sandbox (beta) mode. You can test the checkout process,
             but no real charges will occur. All test subscriptions will be cancelled after the beta period
             unless you explicitly opt-in later.
           </p>
          <FeedbackButton />
        </>
      )}

       {isLoggedIn && isPremium && (
        <>
          <div className="p-4 bg-green-50 border border-green-200 rounded-md mb-4 text-center">
             <h4 className="text-sm font-semibold text-green-800">Premium Active ✨</h4>
             <p className="text-xs text-green-700 mt-1">You have access to all features!</p>
          </div>
          {/* Updated Beta Disclaimer for Premium Users */}
          <p className="text-xs text-gray-500 italic text-center px-2 mb-4"> 
            Note: Stripe integration is currently in sandbox (beta) mode. No real charges have occurred.
            Your current subscription will be cancelled after the beta period unless you explicitly opt-in later.
          </p>
          {/* Swapped order */}
          <FeedbackButton />
          <CancelSubscriptionButton />
        </>
      )}
    </div>
  );
};

export default InfoCard; 