# AI-Driven React Component Generator Platform

## Architecture Diagram

```
Frontend (Next.js) <-> Backend (Express.js) <-> MongoDB Atlas
                           |
                    OpenRouter API (AI)
```

## State Management
- Zustand (frontend) for session/chat/code state
- MongoDB for persistent storage

## Design Decisions
- **Live Preview**: Rendered in sandboxed iframe for security
- **Auto-Save**: PUT /api/sessions/:id on every change
- **Auth**: JWT-based, stored in localStorage/cookies

## Deployment
- Frontend: Vercel
- Backend: Render/Railway
- MongoDB: Atlas
- OpenRouter API Key: .env or Render environment

## Setup
See `/frontend` and `/backend` for details.

## Live Demo
TBD 