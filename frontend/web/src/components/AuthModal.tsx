import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabaseClient'; // Adjust path as needed

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4 flex justify-between items-center"
                >
                  Login or Sign Up
                   <button
                     onClick={onClose}
                     className="text-gray-400 hover:text-gray-600 focus:outline-none transition duration-150 ease-in-out"
                     aria-label="Close modal"
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                   </button>
                </Dialog.Title>
                {/* Supabase Auth UI Component */}
                <Auth
                  supabaseClient={supabase}
                  appearance={{ theme: ThemeSupa }}
                  theme="light"
                  providers={[]}
                  socialLayout="horizontal"
                  onlyThirdPartyProviders={false}
                  appearance={{
                    theme: ThemeSupa,
                    variables: {
                      default: {
                        colors: {
                          brand: '#4F46E5',
                          brandAccent: '#4338CA'
                        }
                      }
                    }
                  }}
                  localization={{
                    variables: {
                      sign_up: {
                        email_label: 'Email',
                        password_label: 'Password',
                        button_label: 'Sign up',
                        link_text: 'Don\'t have an account? Sign up'
                      },
                      sign_in: {
                        email_label: 'Email',
                        password_label: 'Password',
                        button_label: 'Sign in',
                        link_text: 'Already have an account? Sign in'
                      }
                    }
                  }}
                />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default AuthModal; 