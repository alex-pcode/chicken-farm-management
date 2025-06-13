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
  const [isPasswordReset, setIsPasswordReset] = useState(false);

  useEffect(() => {
    // Check for explicit errors in the URL hash first
    // e.g., #error_description=Invalid+Link%3A+Token+has+expired+or+is+invalid
    if (location.hash.includes('error_description=')) {
      const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove '#'
      const errorDescription = hashParams.get('error_description');
      setError('Error: ' + (errorDescription?.replace(/\\+/g, ' ') || 'An unknown error occurred. Please try again.'));
      setIsPasswordReset(false); // Ensure reset form is not shown
      // Clear the hash to prevent re-processing and remove error from URL
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      return; // Stop further processing if there's an error in the hash
    }

    // Attempt to parse recovery parameters directly from the hash for initial UI update
    // This makes the UI responsive. Supabase client handles session internally.
    // Example hash: #access_token=xxx&expires_in=3600&refresh_token=yyy&token_type=bearer&type=recovery
    const hashParams = new URLSearchParams(location.hash.substring(1)); // Remove '#'
    const type = hashParams.get('type');
    const accessToken = hashParams.get('access_token'); // Check for access_token to confirm

    if (type === 'recovery' && accessToken) {
      // If the URL clearly indicates a recovery attempt, show the password reset form.
      // Supabase's `detectSessionInUrl: true` (configured in your supabase.ts)
      // should automatically handle setting up the necessary temporary session
      // from these URL tokens. This session is what allows `updateUser` to work later.
      setIsPasswordReset(true);
      setError(''); // Clear any previous errors (e.g., from a failed login attempt)
      
      // Log session after detecting recovery token
      supabase.auth.getSession().then(({ data: { session } }) => {
        console.log('Session after detecting recovery token:', session);
      });

      // Clear the hash from the URL after we've identified it's a recovery link.
      // This prevents re-processing if the component re-renders or if the user navigates back.
      // It also hides sensitive tokens from the address bar for security.
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    // No 'else' block to set isPasswordReset to false here, because it defaults to false.
    // It should only become true if the recovery link conditions are met.

  }, [location.hash]); // Re-run this effect if the URL hash changes.

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
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      console.log('Session before updateUser:', currentSession);
      if (sessionError || !currentSession) {
        setError('Failed to update password: No active session found before update. ' + (sessionError?.message || ''));
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        setError('Failed to update password: ' + updateError.message);
      } else {
        // Password updated successfully. Attempt to finalize session and log in.
        const { data: { user }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
          setError('Password updated, but failed to retrieve your session: ' + getUserError.message + '. Please try logging in.');
        } else if (user && user.email) {
          // Successfully updated password and retrieved user session
          onLogin(user.email);
        } else {
          setError('Password updated, but could not confirm your session. Please try logging in with your new password.');
        }
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

    const { error } = await supabase.auth.resetPasswordForEmail(username, {
      redirectTo: window.location.origin,
    });

    if (error) {
      setError('Failed to send reset email: ' + error.message);
    } else {
      setError('Password reset email sent! Check your inbox.');
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