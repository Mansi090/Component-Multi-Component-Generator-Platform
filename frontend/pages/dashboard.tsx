import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { auth } from '../lib/firebase';
import Head from 'next/head';
import { FiPlus, FiArrowRight, FiLoader, FiLogOut } from 'react-icons/fi';
import { api } from '../lib/api';

interface Session {
  _id: string;
  sessionName: string;
  lastModified?: Date;
  componentCount?: number;
}

export default function Dashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      setUser(firebaseUser);
      
      // Check if we have a JWT token, if not, try to get one
      const token = localStorage.getItem('token');
      if (!token) {
        try {
          const idToken = await firebaseUser.getIdToken();
          const response = await api.post('/api/auth/firebase-login-dev', { 
            idToken,
            email: firebaseUser.email 
          });
          localStorage.setItem('token', response.data.token);
        } catch (err) {
          console.error('Failed to get JWT token:', err);
          router.push('/login');
          return;
        }
      }

      // Fetch sessions after authentication is confirmed
      fetchSessions();
    });

    return () => unsubscribe();
  }, [router]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/sessions');
      setSessions(response.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
      // Fallback mock data
      setSessions([
        {
          _id: '1',
          sessionName: 'UI Mockup Review',
          lastModified: new Date(Date.now() - 86400000),
          componentCount: 3,
        },
        {
          _id: '2',
          sessionName: 'Client Brainstorming',
          lastModified: new Date(Date.now() - 3600000),
          componentCount: 5,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const createNewSession = async () => {
    try {
      const sessionName = `New Session ${sessions.length + 1}`;
      const response = await api.post('/api/sessions', { sessionName });
      router.push(`/session/${response.data._id}`);
    } catch (err) {
      console.error('Error creating session:', err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('token');
      router.push('/login');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <Head>
        <title>Dashboard | Component Generator</title>
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-4 sm:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Your Sessions</h1>
              <p className="text-gray-300 mt-1">
                {loading ? 'Loading...' : `${sessions.length} session${sessions.length !== 1 ? 's' : ''}`}
              </p>
              {user && (
                <p className="text-gray-400 text-sm mt-1">
                  Welcome, {user.email}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                onClick={createNewSession}
              >
                <FiPlus className="text-lg" />
                <span>New Session</span>
              </button>
              <button
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all"
                onClick={handleLogout}
              >
                <FiLogOut className="text-lg" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <FiLoader className="animate-spin text-3xl text-blue-500" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-gray-700 p-8 rounded-xl shadow text-center">
              <div className="max-w-md mx-auto">
                <h3 className="text-xl font-medium text-white mb-2">No sessions yet</h3>
                <p className="text-gray-300 mb-6">
                  Start by creating your first session to generate and edit components
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg shadow"
                  onClick={createNewSession}
                >
                  Create First Session
                </button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((session) => (
                <div
                  key={session._id}
                  className="bg-gray-700 p-5 rounded-xl hover:shadow-lg transition-all border border-gray-600 hover:border-blue-500 cursor-pointer"
                  onClick={() => router.push(`/session/${session._id}`)}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-medium text-white text-lg line-clamp-2">
                      {session.sessionName}
                    </h3>
                    <FiArrowRight className="text-gray-400 mt-1" />
                  </div>
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>
                      {session.componentCount || 0} component{session.componentCount !== 1 ? 's' : ''}
                    </span>
                    <span>{formatDate(session.lastModified)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
