# AI Component Generator Backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the backend directory with the following variables:
```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-mongodb-connection-string

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenRouter API Key for AI generation
OPENROUTER_API_KEY=your-openrouter-api-key

# Site Configuration
SITE_URL=https://your-frontend-url.vercel.app
SITE_NAME=Multi Component Generator
```

3. Start the development server:
```bash
npm run dev
```

## Features
- Express.js API
- MongoDB/Mongoose
- JWT Auth with Firebase integration
- AI code generation via OpenRouter API
- Session management
- CORS enabled for frontend integration

## API Endpoints
- `POST /api/auth/firebase-login` - Exchange Firebase ID token for JWT
- `GET /api/sessions` - Get user sessions
- `POST /api/sessions` - Create new session
- `PUT /api/sessions/:id` - Update session
- `POST /api/generate` - Generate AI code 