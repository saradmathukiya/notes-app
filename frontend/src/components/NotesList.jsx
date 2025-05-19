import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Pencil, Trash2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const { logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/notes');
            setNotes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch notes');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/notes/${id}`);
            setNotes(notes.filter(note => note._id !== id));
            setSelectedNote(null);
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    const handleEdit = (id) => {
        navigate(`/notes/edit/${id}`);
    };

    // Filter notes based on search query
    const filteredNotes = useMemo(() => {
        if (!searchQuery.trim()) return notes;
        
        const query = searchQuery.toLowerCase();
        return notes.filter(note => 
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query)
        );
    }, [notes, searchQuery]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">My Notes</h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => navigate('/notes/create')}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            Create Note
                        </button>
                        <button
                            onClick={logout}
                            className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                            Logout
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {/* Search Bar */}
                <div className="mb-6">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search notes by title or content..."
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>

                {/* Notes Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredNotes.map((note) => (
                        <div
                            key={note._id}
                            className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 h-[150px] flex flex-col"
                        >
                            <div className="p-4 flex flex-col h-full">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                                    {note.title}
                                </h3>
                                <p className="text-gray-600 text-sm line-clamp-3">
                                    {note.content}
                                </p>
                                <div className="flex items-center justify-end gap-2 pt-2 mt-auto border-t">
                                    <button
                                        onClick={() => setSelectedNote(note)}
                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="View Note"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleEdit(note._id)}
                                        className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Edit Note"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleDelete(note._id)}
                                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                        title="Delete Note"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filteredNotes.length === 0 && (
                        <div className="col-span-full text-center py-8 text-gray-500">
                            {notes.length === 0 
                                ? "No notes yet. Create your first note!"
                                : "No notes found matching your search."}
                        </div>
                    )}
                </div>
            </div>

            {/* View Note Modal */}
            {selectedNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-2xl font-bold text-gray-900 break-words">{selectedNote.title}</h2>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="text-gray-500 hover:text-gray-700 flex-shrink-0 ml-4"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto overflow-x-hidden flex-grow whitespace-pre-wrap break-words">
                            {selectedNote.content}
                        </div>
                        <div className="p-6 border-t flex justify-end space-x-4">
                            <button
                                onClick={() => handleEdit(selectedNote._id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Note
                            </button>
                            <button
                                onClick={() => handleDelete(selectedNote._id)}
                                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Note
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotesList; 