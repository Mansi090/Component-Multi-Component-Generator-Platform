import { useState } from 'react';
import { useRouter } from 'next/router';
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api } from '../lib/api';
import Head from 'next/head';
import { FaGoogle, FaSpinner } from 'react-icons/fa';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState({
    email: false,
    google: false
  });
  const router = useRouter();

  const exchangeFirebaseToken = async (firebaseUser: any) => {
    try {
      const idToken = await firebaseUser.getIdToken();
      // Use the development endpoint for testing
      const response = await api.post('/api/auth/firebase-login-dev', { 
        idToken,
        email: firebaseUser.email 
      });
      const { token } = response.data;
      localStorage.setItem('token', token);
      return true;
    } catch (err) {
      console.error('Failed to exchange Firebase token:', err);
      return false;
    }
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(prev => ({ ...prev, email: true }));
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const success = await exchangeFirebaseToken(userCredential.user);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Failed to authenticate with backend');
        setLoading(prev => ({ ...prev, email: false }));
      }
    } catch (err: any) {
      const message = err.code?.includes('auth/')
        ? err.code.replace('auth/', '').replace(/-/g, ' ')
        : 'Signup failed. Please try again.';
      setError(message);
      setLoading(prev => ({ ...prev, email: false }));
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setLoading(prev => ({ ...prev, google: true }));
    
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const success = await exchangeFirebaseToken(userCredential.user);
      
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Failed to authenticate with backend');
        setLoading(prev => ({ ...prev, google: false }));
      }
    } catch (err: any) {
      setError('Google signup failed. Please try again.');
      setLoading(prev => ({ ...prev, google: false }));
    }
  };

  return (
    <>
      <Head>
        <title>Sign Up | Component Generator</title>
        <meta name="description" content="Create your AI-powered component playground account" />
      </Head>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
        {/* Background with dark overlay */}
        <div 
          className="absolute inset-0 bg-gray-900 opacity-90"
          style={{
            backgroundImage: "url('/images/component-bg.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          aria-hidden="true"
        />
        
        <main className="relative z-10 w-full max-w-md mx-4">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl">
            <header className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Component Generator</h1>
              <p className="text-gray-600 mt-2">Create your AI-powered component playground</p>
            </header>

            {error && (
              <div 
                role="alert"
                className="bg-red-50 text-red-700 p-3 rounded-lg text-sm mb-6 flex items-center"
              >
                <svg 
                  className="w-5 h-5 mr-2 flex-shrink-0" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  required
                  autoComplete="new-password"
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading.email}
                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-medium ${
                  loading.email ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                } transition-colors`}
              >
                {loading.email ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>
            </form>

            <div className="flex items-center my-6" aria-hidden="true">
              <div className="flex-grow border-t border-gray-300" />
              <span className="mx-4 text-gray-500 text-sm">or</span>
              <div className="flex-grow border-t border-gray-300" />
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading.google}
              className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              type="button"
            >
              {loading.google ? (
                <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
              ) : (
                <>
                  <FaGoogle className="text-red-500 mr-2" aria-hidden="true" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{' '}
              <a 
                href="/login" 
                className="text-blue-600 hover:underline font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
              >
                Login
              </a>
            </p>
          </div>
        </main>
      </div>
    </>
  );
}