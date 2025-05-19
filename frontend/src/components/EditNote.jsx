import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateNote } from '../services/noteService';
import { summarizeNote, checkGrammar } from '../services/aiService';
import debounce from 'lodash/debounce';
import axios from 'axios';

const EditNote = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [grammarIssues, setGrammarIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/notes/${id}`);
                setTitle(response.data.title);
                setContent(response.data.content);
                setLoading(false);
            } catch (err) {
                setError('Failed to fetch note');
                setLoading(false);
            }
        };
        fetchNote();
    }, [id]);

    // Debounced grammar check function
    const debouncedGrammarCheck = useCallback(
        debounce(async (text) => {
            if (!text) {
                setGrammarIssues([]);
                return;
            }

            try {
                const { matches } = await checkGrammar(text);
                setGrammarIssues(matches);
            } catch (error) {
                console.error('Grammar check error:', error);
            }
        }, 1000),
        []
    );

    // Effect to trigger grammar check when content changes
    useEffect(() => {
        debouncedGrammarCheck(content);
        return () => {
            debouncedGrammarCheck.cancel();
        };
    }, [content, debouncedGrammarCheck]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateNote(id, { title, content });
            navigate('/notes');
        } catch (error) {
            setError(error.message);
        }
    };

    const handleSummarize = async () => {
        if (!content) {
            setError('Please add some content to summarize');
            return;
        }

        setAiLoading(true);
        setError('');

        try {
            const { summary } = await summarizeNote(content);
            setContent(prev => `${prev}\n\nSummary:\n${summary}`);
        } catch (error) {
            setError('Failed to summarize note');
        } finally {
            setAiLoading(false);
        }
    };

    const applyCorrection = (offset, length, replacement) => {
        const before = content.substring(0, offset);
        const after = content.substring(offset + length);
        setContent(before + replacement + after);
        setGrammarIssues(prev => prev.filter(issue => issue.offset !== offset));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Edit Note</h1>
                    <button
                        onClick={() => navigate('/notes')}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        ← Back to Notes
                    </button>
                </div>

                {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                        <div className="text-sm text-red-700">{error}</div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="title" className="text-sm font-medium text-gray-700">
                            Title
                        </label>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Enter note title"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="content" className="text-sm font-medium text-gray-700">
                            Content
                        </label>
                        <textarea
                            id="content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows="12"
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="Write your note content here..."
                            required
                        />
                    </div>

                    {grammarIssues.length > 0 && (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                            <h3 className="text-lg font-medium text-yellow-800 mb-3">Grammar and Spelling Issues</h3>
                            <ul className="space-y-3">
                                {grammarIssues.map((issue, index) => (
                                    <li key={index} className="text-sm">
                                        <p className="font-medium text-yellow-700">{issue.message}</p>
                                        <p className="text-gray-600 mt-1">{issue.context.text}</p>
                                        {issue.replacements.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                <span className="text-gray-500">Suggestions: </span>
                                                {issue.replacements.slice(0, 3).map((replacement, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => applyCorrection(issue.offset, issue.length, replacement.value)}
                                                        className="px-2.5 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                                                    >
                                                        {replacement.value}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="submit"
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                        >
                            Update Note
                        </button>
                        <button
                            type="button"
                            onClick={handleSummarize}
                            disabled={aiLoading}
                            className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {aiLoading ? 'Processing...' : 'Summarize'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNote; 