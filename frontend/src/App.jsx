import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import NotesList from './components/NotesList';
import CreateNote from './components/CreateNote';
import EditNote from './components/EditNote';
import Home from './pages/Home';
import { Link } from 'react-router-dom';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/notes"
              element={
                <PrivateRoute>
                  <NotesList />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/create"
              element={
                <PrivateRoute>
                  <CreateNote />
                </PrivateRoute>
              }
            />
            <Route
              path="/notes/edit/:id"
              element={
                <PrivateRoute>
                  <EditNote />
                </PrivateRoute>
              }
            />
            {/* Catch all route - 404 page */}
            <Route path="*" element={
              <div className="min-h-screen flex flex-col items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-xl text-gray-600 mb-8">Page not found</p>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Return to Home
                </Link>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
