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
    // Check for password recovery in URL (Supabase magic link)
    const params = new URLSearchParams(location.search);
    const type = params.get('type');

    if (type === 'recovery') {
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken) {
        setIsPasswordReset(true); // Show the "Set New Password" form
        supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        }).then(({ error: sessionError }) => {
          if (sessionError) {
            setError('Invalid or expired password recovery link: ' + sessionError.message + '. Please request a new one.');
            setIsPasswordReset(false); // Revert to login form as recovery is not possible
          }
          // If no error, session is set, user can proceed to update password via the form.
        });
      } else {
        // type=recovery but no access_token, link is malformed.
        setError('Password recovery link is incomplete or invalid. Please request a new one.');
        setIsPasswordReset(false); // Don't show password reset form
      }
    }
  }, [location.search, supabase.auth]); // Added supabase.auth to dependency array

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