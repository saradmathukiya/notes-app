import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './contexts/Register';
import NotesList from './components/NotesList';
import CreateNote from './components/CreateNote';
import EditNote from './components/EditNote';
import Home from './pages/Home';

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
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
