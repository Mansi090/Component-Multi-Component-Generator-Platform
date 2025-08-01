import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { api, getSession, updateSession } from '../../lib/api';
import { auth } from '../../lib/firebase';
import { FaUser, FaRobot, FaDownload, FaExpand, FaCompress, FaHome } from 'react-icons/fa';
import { javascript } from '@codemirror/lang-javascript';
import { css as cssLang } from '@codemirror/lang-css';
import Link from 'next/link';

const CodeMirror = dynamic(() => import('@uiw/react-codemirror'), { ssr: false });

type ChatMessage = {
  sender: 'user' | 'ai';
  message: string;
  timestamp?: Date;
};

export default function SessionPage() {
  const router = useRouter();
  const { id } = router.query;
  const [fullscreenPreview, setFullscreenPreview] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [jsxCode, setJsxCode] = useState('');
  const [cssCode, setCssCode] = useState('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sessionName, setSessionName] = useState('');

  // Check authentication and load session data
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

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

      // Load session data after authentication is confirmed
      if (id) {
        loadSessionData();
      }
    });

    return () => unsubscribe();
  }, [id, router]);

  const loadSessionData = async () => {
    try {
      const response = await getSession(id as string);
      const session = response.data;
      
      setSessionName(session.sessionName);
      setChat(session.chatHistory || []);
      setJsxCode(session.jsxCode || '');
      setCssCode(session.cssCode || '');
    } catch (error) {
      console.error('Failed to load session:', error);
      // Set default data if session doesn't exist
      setChat([
        { sender: 'user', message: 'Make a card with image and text' },
        { sender: 'ai', message: 'Here is your card component!' },
      ]);
      setJsxCode(`<div class="card">
        <div class="card-content">
          <h3 class="card-title">Your Card Title</h3>
          <p class="card-text">Describe what you want to see</p>
        </div>
      </div>`);
      setCssCode(`
        .card {
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          overflow: hidden;
          background-color: white;
          max-width: 350px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-5px);
        }
        .card-image {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .card-content {
          padding: 16px;
        }
        .card-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
          color: #2d3748;
        }
        .card-text {
          color: #4a5568;
          font-size: 0.875rem;
        }
      `);
    } finally {
      setLoading(false);
    }
  };

  const saveSessionData = async (newChat: ChatMessage[], newJsxCode: string, newCssCode: string) => {
    try {
      await updateSession(id as string, {
        chatHistory: newChat,
        jsxCode: newJsxCode,
        cssCode: newCssCode,
      });
    } catch (error) {
      console.error('Failed to save session:', error);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = input.trim();
    if (!prompt) return;

    const userMessage = { sender: 'user' as const, message: prompt };
    setChat(prev => [...prev, userMessage]);
    setInput('');

    try {
      const res = await api.post('/api/generate', { prompt });
      const aiMessage = { sender: 'ai' as const, message: 'Here is your component!' };
      
      // Process the response to handle images properly
      let processedJsx = res.data.jsx || jsxCode;
      
      // If the response doesn't include an image but we want one
      if (!processedJsx.includes('<img') && prompt.toLowerCase().includes('image')) {
        processedJsx = processedJsx.replace(
          '<div class="card">',
          `<div class="card">
            <img 
              src="https://source.unsplash.com/random/300x200/?${encodeURIComponent(prompt)}" 
              alt="${prompt}"
              class="card-image"
            >`
        );
      }
      
      const newJsxCode = processedJsx;
      const newCssCode = res.data.css || cssCode;
      
      setChat(prev => [...prev, aiMessage]);
      setJsxCode(newJsxCode);
      setCssCode(newCssCode);
      
      // Save the updated session data
      const updatedChat = [...chat, userMessage, aiMessage];
      await saveSessionData(updatedChat, newJsxCode, newCssCode);
      
    } catch (error) {
      console.error('Generation failed:', error);
      const errorMessage = { sender: 'ai' as const, message: 'Error generating code.' };
      setChat(prev => [...prev, errorMessage]);
      
      // Save the error state too
      const updatedChat = [...chat, userMessage, errorMessage];
      await saveSessionData(updatedChat, jsxCode, cssCode);
    }
  };

  const downloadCode = () => {
    const blob = new Blob([`${jsxCode}\n\n<style>${cssCode}</style>`], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component.html';
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleFullscreenPreview = () => {
    setFullscreenPreview(!fullscreenPreview);
  };

  if (fullscreenPreview) {
    return (
      <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
        <div className="p-4 bg-gray-800 flex justify-between items-center">
          <h2 className="font-bold text-blue-400">Live Preview</h2>
          <button
            onClick={toggleFullscreenPreview}
            className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm"
          >
            <FaCompress /> Exit Fullscreen
          </button>
        </div>
        <div className="flex-1">
          <iframe
            title="Live Preview"
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts"
            srcDoc={`<html><head><style>${cssCode}</style></head><body>${jsxCode}</body></html>`}
          />
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-900 font-sans items-center justify-center">
        <div className="text-blue-400 text-xl">Loading session...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-900 font-sans">
      {/* Home Button */}
      <div className="absolute top-4 left-4 z-50">
        <Link href="/dashboard" legacyBehavior>
          <a className="flex items-center gap-2 bg-gray-800 hover:bg-blue-600 text-blue-400 hover:text-white px-4 py-2 rounded shadow transition font-bold text-lg">
            <FaHome className="text-xl" />
            Home
          </a>
        </Link>
      </div>
      {/* Chat Panel */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 p-6 flex flex-col">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-blue-400">Chat</h1>
          {sessionName && (
            <p className="text-gray-400 text-sm mt-1">Session: {sessionName}</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
          {chat.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="flex items-end gap-2 max-w-[70%]">
                {msg.sender === 'ai' && <FaRobot className="text-xl text-blue-400" />}
                <div
                  className={`px-4 py-2 rounded-xl text-sm break-words ${
                    msg.sender === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100'
                  }`}
                >
                  {msg.message}
                </div>
                {msg.sender === 'user' && <FaUser className="text-xl text-blue-400" />}
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleSend} className="flex mt-2">
          <input
            className="flex-1 p-3 rounded-l-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your component (include 'image' if you want one)..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-r-md hover:bg-blue-700 transition"
          >
            Send
          </button>
        </form>
      </div>

      {/* Code + Preview Panel */}
      <div className="w-2/3 flex flex-col bg-gray-900">
        <div className="grid grid-cols-2 gap-6 p-8">
          <div>
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-bold text-blue-400">JSX Code</h2>
              <button 
                onClick={downloadCode}
                className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm"
              >
                <FaDownload /> Download
              </button>
            </div>
            <CodeMirror
              value={jsxCode}
              height="200px"
              readOnly
              theme="dark"
              extensions={[javascript({ jsx: true })]}
            />
          </div>
          <div>
            <h2 className="font-bold mb-2 text-blue-400">CSS Code</h2>
            <CodeMirror
              value={cssCode}
              height="200px"
              readOnly
              theme="dark"
              extensions={[cssLang()]}
            />
          </div>
        </div>

        <div className="flex-1 p-8 bg-gray-800">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-blue-400">Live Preview</h2>
            <button
              onClick={toggleFullscreenPreview}
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-gray-100 px-3 py-1 rounded text-sm"
            >
              <FaExpand /> Fullscreen
            </button>
          </div>
          <div className="w-full h-64 border border-gray-700 rounded bg-gray-900 overflow-hidden">
            <iframe
              title="Live Preview"
              className="w-full h-full border-none bg-white"
              sandbox="allow-scripts"
              srcDoc={`<html><head><style>${cssCode}</style></head><body>${jsxCode}</body></html>`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}