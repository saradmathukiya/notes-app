import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, Pencil, Trash2, Search, X, LayoutGrid, Table, Plus } from 'lucide-react';

import { Button } from "./ui/button";
import {
    Table as ShadcnTable,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";

const NotesList = () => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedNote, setSelectedNote] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState(() => {
        // Initialize viewMode from localStorage or default to 'card'
        return localStorage.getItem('notesViewMode') || 'card';
    });
    const { logout } = useAuth();
    const navigate = useNavigate();

    // Update localStorage when viewMode changes
    useEffect(() => {
        localStorage.setItem('notesViewMode', viewMode);
    }, [viewMode]);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await axios.get('https://notes-backend-aq02.onrender.com/api/notes');
            setNotes(response.data);
            setLoading(false);
        } catch (err) {
            setError('Failed to fetch notes');
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`https://notes-backend-aq02.onrender.com/api/notes/${id}`);
            setNotes(notes.filter(note => note._id !== id));
            setSelectedNote(null);
        } catch (err) {
            setError('Failed to delete note');
        }
    };

    const handleEdit = (id) => {
        navigate(`/notes/edit/${id}`);
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
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
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0 mb-6 sm:mb-8">
                    <div className="flex justify-between items-center w-full sm:w-auto">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center sm:text-left">Notes App</h1>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="sm:hidden border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            Logout
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:gap-4 w-full sm:w-auto">
                        <Button
                            onClick={() => navigate('/notes/create')}
                            variant="default"
                            className="hidden sm:flex"
                        >
                            Create Note
                        </Button>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="hidden sm:flex border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-4">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                {/* Search Bar and View Toggle */}
                <div className="mb-6">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
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
                        <Button
                            onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')}
                            variant="outline"
                            className="flex items-center gap-2 whitespace-nowrap border border-gray-300 hover:border-gray-400"
                        >
                            {viewMode === 'card' ? (
                                <>
                                    <Table className="h-4 w-4" />
                                    <span className="hidden sm:inline">Table View</span>
                                </>
                            ) : (
                                <>
                                    <LayoutGrid className="h-4 w-4" />
                                    <span className="hidden sm:inline">Card View</span>
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Notes Display */}
                {viewMode === 'card' ? (
                    // Card View
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredNotes.map((note) => (
                            <div
                                key={note._id}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden border border-gray-200 h-[150px] flex flex-col"
                            >
                                <div className="p-4 flex flex-col h-full">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                        {note.title}
                                    </h3>
                                    <div 
                                        className="text-gray-600 text-sm line-clamp-3"
                                        dangerouslySetInnerHTML={{ __html: note.content }}
                                    />
                                    <div className="flex items-center justify-end gap-2 pt-2 mt-auto border-t">
                                        <button
                                            onClick={() => setSelectedNote(note)}
                                            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                            title="View Note"
                                        >
                                            <Eye className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleEdit(note._id)}
                                            className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                            title="Edit Note"
                                        >
                                            <Pencil className="h-5 w-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note._id)}
                                            className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                            title="Delete Note"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    // Table View
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
                        <ShadcnTable>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[30%]">Title</TableHead>
                                    <TableHead className="w-[50%]">Content</TableHead>
                                    <TableHead className="w-[20%] text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredNotes.map((note) => (
                                    <TableRow key={note._id}>
                                        <TableCell className="font-medium max-w-[200px] truncate">
                                            {note.title}
                                        </TableCell>
                                        <TableCell>
                                            <div 
                                                className="line-clamp-2 max-w-[400px]"
                                                dangerouslySetInnerHTML={{ __html: note.content }}
                                            />
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setSelectedNote(note)}
                                                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                    title="View Note"
                                                >
                                                    <Eye className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(note._id)}
                                                    className="p-2 text-gray-500 hover:text-purple-600 transition-colors"
                                                    title="Edit Note"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(note._id)}
                                                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                                                    title="Delete Note"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </ShadcnTable>
                    </div>
                )}

                {filteredNotes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {notes.length === 0 
                            ? "No notes yet. Create your first note!"
                            : "No notes found matching your search."}
                    </div>
                )}
            </div>

            {/* View Note Modal */}
            {selectedNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4">
                    <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-4 sm:p-6 border-b">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 break-words pr-4">
                                {selectedNote.title}
                            </h2>
                            <button
                                onClick={() => setSelectedNote(null)}
                                className="text-gray-500 hover:text-gray-700 flex-shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden flex-grow whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: selectedNote.content }}
                        />
                        <div className="p-4 sm:p-6 border-t flex flex-col sm:flex-row justify-end gap-2 sm:gap-4">
                            <Button
                                onClick={() => handleEdit(selectedNote._id)}
                                variant="default"
                                className="w-full sm:w-auto"
                            >
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit Note
                            </Button>
                            <Button
                                onClick={() => handleDelete(selectedNote._id)}
                                variant="destructive"
                                className="w-full sm:w-auto"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Note
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button for Mobile */}
            <Button
                onClick={() => navigate('/notes/create')}
                variant="default"
                className="fixed bottom-6 right-6 sm:hidden w-14 h-14 rounded-full shadow-lg flex items-center justify-center"
            >
                <Plus className="h-6 w-6" />
            </Button>
        </div>
    );
};

export default NotesList; 