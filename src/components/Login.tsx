import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { useLocation } from 'react-router-dom';

interface LoginProps {
  onLogin: (username: string) => void;
}

export const Login = ({ onLogin }: LoginProps) => {
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);  // Effect to detect recovery mode from URL hash - let Supabase handle session automatically
  useEffect(() => {
    // Check for explicit errors in the URL hash first
    if (location.hash.includes('error_description=')) {
      const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove '#'
      const errorDescription = hashParams.get('error_description');
      setError('Error: ' + (errorDescription?.replace(/\+/g, ' ') || 'An unknown error occurred. Please try again.'));
      setIsPasswordReset(false); // Ensure reset form is not shown
      // Clear the hash to prevent re-processing and remove error from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return; // Stop further processing if there's an error in the hash
    }    // Check if this is a password recovery URL
    const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove '#'
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token');

    if (type === 'recovery' && accessToken) {
      console.log('Recovery type detected in URL hash. Showing password reset form immediately.');
      console.log('Hash params:', { type, accessTokenLength: accessToken.length });
      
      // Show the password reset form immediately when we detect recovery tokens
      setIsPasswordReset(true);
      setError('');
      
      // Let Supabase handle the session in the background
      // If it fails, the form will still be shown and user will get an error when trying to submit
    }
  }, [location.hash]); // Re-run this effect if the URL hash changes.

  // Effect to handle auth state changes, specifically for password recovery
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('onAuthStateChange event:', event, 'session:', session);

      if (event === 'PASSWORD_RECOVERY') {
        console.log('PASSWORD_RECOVERY event detected. Raw session object from Supabase:', session); // More detailed log
        if (session) {
          // Supabase has processed the recovery token and established a session.
          setIsPasswordReset(true); // Ensure form is shown
          setError(''); // Clear any errors
          console.log('PASSWORD_RECOVERY event processed by Supabase, session established:', session);
        
          // Now it's safe to clear the hash from the URL.
          // Check if the hash still contains recovery info before clearing, to avoid clearing unrelated hashes.
          if (window.location.hash.includes('type=recovery')) {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            console.log('URL hash cleared after PASSWORD_RECOVERY.');
          }
        } else {
          console.error('PASSWORD_RECOVERY event occurred, but no session was provided by Supabase. This might indicate an issue with the recovery token (e.g., expired, invalid) or Supabase client processing.');
          setError('Could not verify password recovery link. It might be invalid or expired. Please try requesting a new password reset link.');
          // Optionally, you might want to set isPasswordReset(false) here or guide the user differently.
        }
      } else if (event === 'SIGNED_IN' && isPasswordReset && session) {
        // Fallback: if a general SIGNED_IN event occurs while in password reset mode
        console.log('SIGNED_IN event during password reset, session:', session);
        if (window.location.hash.includes('type=recovery')) {
           window.history.replaceState(null, '', window.location.pathname + window.location.search);
           console.log('URL hash cleared after SIGNED_IN during password reset.');
        }
      }
      // USER_UPDATED event might occur after a successful password update.
      // if (event === 'USER_UPDATED') {
      //   console.log('USER_UPDATED event:', session);
      // }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [isPasswordReset]); // Rerun if isPasswordReset changes, to ensure logic inside onAuthStateChange is current.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isPasswordReset) {
      // Handle password reset
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      
      if (newPassword.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }

      // Log session before attempting to update user
      const { data: { session: currentSessionBeforeUpdate }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session before updateUser call:', currentSessionBeforeUpdate);

      if (sessionError || !currentSessionBeforeUpdate) {
        setError('Failed to update password: No active session found. ' + (sessionError?.message || 'This might be due to an expired link or session issue. Please try requesting a new password reset link if the problem persists.'));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError('Failed to update password: ' + updateError.message);
      } else {
        // Password updated successfully. 
        setError('Password updated successfully! You can now log in with your new password.');
        setNewPassword('');
        setConfirmPassword('');
        setIsPasswordReset(false); // Return to the login form
        // Consider navigating the user or automatically logging them in if desired.
        // For now, user will see the success message and then the login form.
      }
    } else {
      // Regular login
      console.log('Attempting login with:', { email: username, password }); // Temporary log
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: username,
        password,
      });
      if (signInError) {
        setError(`Login failed: ${signInError.message}`); // Display Supabase error
      } else if (data.user && data.user.email) {
        onLogin(data.user.email);
      } else {
        // This case implies data.user or data.user.email is null/undefined even if no error was thrown.
        setError('Login attempt resulted in an unexpected state. Please try again.');
      }
    }
  };

  const handlePasswordReset = async () => {
    if (!username) {
      setError('Please enter your email address first');
      return;
    }

    setIsResettingPassword(true);
    setError('');

    // Clear any existing sessions first
    await supabase.auth.signOut();
    console.log('Cleared any existing sessions before password reset');

    const { error } = await supabase.auth.resetPasswordForEmail(username, {
      redirectTo: 'https://chicken-farm-management.vercel.app', // Explicitly set redirectTo
    });

    if (error) {
      setError('Failed to send reset email: ' + error.message);
    } else {
      setError('Password reset email sent! Check your inbox and use the latest email.');
    }
    setIsResettingPassword(false);
  };

  if (isPasswordReset) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-xs sm:max-w-sm space-y-6">
          <h2 className="text-2xl font-bold text-center">Set New Password</h2>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
              required
              minLength={6}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-xs sm:max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        {error && <div className={`text-sm text-center ${error.includes('sent') ? 'text-green-600' : 'text-red-500'}`}>{error}</div>}
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="username">Email</label>
          <input
            id="username"
            type="email"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          Login
        </button>
        <button
          type="button"
          onClick={handlePasswordReset}
          disabled={isResettingPassword}
          className="w-full text-indigo-600 hover:text-indigo-700 transition-colors text-sm"
        >
          {isResettingPassword ? 'Sending...' : 'Forgot Password?'}
        </button>
      </form>
    </div>
  );
};

// Remember to wrap <App /> with <Router> in main.tsx
// import { BrowserRouter as Router } from 'react-router-dom';
// ReactDOM.createRoot(document.getElementById('root')).render(
//   <Router>
//     <App />
//   </Router>
// );