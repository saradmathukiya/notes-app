# Notes Application

A full-stack notes application built with React, Node.js, Express, and MongoDB. Features include user authentication, secure note management, and a clean, responsive UI using Tailwind CSS.

## Features

- User authentication (Register/Login)
- JWT-based authentication
- Secure password hashing with bcrypt
- CRUD operations for notes
- Responsive design with Tailwind CSS
- Protected routes
- MongoDB database integration

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

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

## Security Features

- Password hashing using bcrypt
- JWT-based authentication
- Protected routes
- Secure password storage
- Input validation
- CORS enabled

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

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
