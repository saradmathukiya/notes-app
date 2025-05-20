# Notes Application

A full-stack notes application built with React, Node.js, Express, and MongoDB. Features include user authentication, secure note management, AI-powered text processing, and a clean, responsive UI using Tailwind CSS.

## Features

- User authentication (Register/Login)
- JWT-based authentication
- Secure password hashing with bcrypt
- CRUD operations for notes
- AI-powered features:
  - Text summarization (for content > 7 words)
  - Grammar and spelling check
- Responsive design with Tailwind CSS
- Protected routes
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn
- Hugging Face API key (for AI features)
- LanguageTool API (for grammar checking)

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd notes-app
```

2. Install backend dependencies:

```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
HUGGINGFACE_API_KEY=your_huggingface_api_key
```

4. Install frontend dependencies:

```bash
cd ../frontend
npm install
```

5. Start the backend server:

```bash
cd ../backend
npm run dev
```

6. Start the frontend development server:

```bash
cd ../frontend
npm run dev
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user

### Notes

- GET /api/notes - Get all notes for authenticated user
- POST /api/notes - Create a new note
- PUT /api/notes/:id - Update a note
- DELETE /api/notes/:id - Delete a note

### AI Features

- POST /api/ai/summarize - Summarize note content
  - Summarizes content if it has more than 7 words
  - Returns original content if 7 words or less
- POST /api/ai/check - Check grammar and spelling

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Secure password storage
- Input validation
- CORS enabled
- Environment variables for sensitive data

## Technologies Used

- Frontend:

  - React
  - React Router
  - Tailwind CSS
  - Axios
  - Context API for state management

- Backend:
  - Node.js
  - Express
  - MongoDB with Mongoose
  - JWT for authentication
  - bcrypt for password hashing
  - Hugging Face API for AI features
  - LanguageTool API for grammar checking

## AI Features Details

### Text Summarization

- Uses Hugging Face's BART model
- Automatically summarizes content longer than 7 words
- Preserves original content for shorter texts
- Configurable summary length parameters

### Grammar and Spelling Check

- Real-time grammar and spelling suggestions
- Powered by LanguageTool API
- Provides multiple correction suggestions
- Highlights errors in the text

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
