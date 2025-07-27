import React from 'react';

interface Session {
  _id: string;
  sessionName: string;
}

interface SessionListProps {
  sessions: Session[];
  onOpen: (id: string) => void;
}

export default function SessionList({ sessions, onOpen }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow text-center text-gray-400 text-sm">
        No sessions available.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li
          key={session._id}
          className="bg-white p-4 rounded-xl shadow flex justify-between items-center hover:shadow-md transition duration-200"
        >
          <span className="text-gray-900 font-semibold truncate">{session.sessionName}</span>
          <button
            onClick={() => onOpen(session._id)}
            className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Open
          </button>
        </li>
      ))}
    </ul>
  );
}
