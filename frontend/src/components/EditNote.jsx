import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateNote } from '../services/noteService';
import { summarizeNote, checkGrammar } from '../services/aiService';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { Button } from "./ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const EditNote = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [grammarIssues, setGrammarIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();

    // Quill editor modules configuration
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ],
    };

    // Quill editor formats
    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'color', 'background',
        'font', 'size',
        'align',
        'list', 'bullet',
        'link'
    ];

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await axios.get(`https://notes-backend-aq02.onrender.com/api/notes/${id}`);
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

    const fixAllIssues = () => {
        // Sort issues by offset in reverse order to avoid offset changes when applying corrections
        const sortedIssues = [...grammarIssues].sort((a, b) => b.offset - a.offset);
        
        let newContent = content;
        sortedIssues.forEach(issue => {
            if (issue.replacements.length > 0) {
                const before = newContent.substring(0, issue.offset);
                const after = newContent.substring(issue.offset + issue.length);
                newContent = before + issue.replacements[0].value + after;
            }
        });
        
        setContent(newContent);
        setGrammarIssues([]);
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
                        <div className="h-[400px]">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                className="h-[350px]"
                                placeholder="Write your note content here..."
                            />
                        </div>
                    </div>

                    {grammarIssues.length > 0 && (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-medium text-yellow-800">Grammar and Spelling Issues</h3>
                                <Button
                                    onClick={fixAllIssues}
                                    variant="outline"
                                    className="text-sm bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-300"
                                >
                                    Fix All
                                </Button>
                            </div>
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
                                                        className="px-2.5 py-1 text-xs bg-purple-100 text-purple-600 rounded-md hover:bg-purple-200 transition-colors"
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
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            Update Note
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSummarize}
                            disabled={aiLoading}
                            variant="success"
                            className="flex-1"
                        >
                            {aiLoading ? 'Processing...' : 'Summarize'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditNote; 