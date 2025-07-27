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
      <div className="bg-white p-6 rounded shadow text-center text-gray-500">
        No sessions available.
      </div>
    );
  }

  return (
    <ul className="space-y-4">
      {sessions.map((session) => (
        <li
          key={session._id}
          className="bg-white p-5 rounded shadow hover:shadow-md flex justify-between items-center transition"
        >
          <span className="text-gray-800 font-medium">{session.sessionName}</span>
          <button
            onClick={() => onOpen(session._id)}
            className="text-blue-600 hover:text-blue-800 font-medium underline"
          >
            Open Session
          </button>
        </li>
      ))}
    </ul>
  );
}
