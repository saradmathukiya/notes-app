import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Login';
import Register from './components/Register';
import NotesList from './components/NotesList';
import CreateNote from './components/CreateNote';
import EditNote from './components/EditNote';

function App() {
  return (
        <div className="min-h-screen bg-gray-50">
            <Router>
                <AuthProvider>
                    <main className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <Routes>
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
                            <Route path="/" element={<Navigate to="/notes" replace />} />
                        </Routes>
                    </main>
                </AuthProvider>
            </Router>
      </div>
    );
}

export default App;
