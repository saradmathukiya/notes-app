import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { createNote } from '../services/noteService';
import { summarizeNote, checkGrammar, transformStyle } from '../services/aiService';
import debounce from 'lodash/debounce';
import { Button } from "./ui/button";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { X } from 'lucide-react';

const CreateNote = () => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [error, setError] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [grammarIssues, setGrammarIssues] = useState([]);
    const [selectedStyle, setSelectedStyle] = useState('professional');
    const [summary, setSummary] = useState('');
    const navigate = useNavigate();

    const supportedStyles = [
        { value: 'professional', label: 'Professional' },
        { value: 'casual', label: 'Casual' },
        { value: 'friendly', label: 'Friendly' },
        { value: 'creativity', label: 'Creative' }
    ];

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
            await createNote({ title, content });
            navigate('/');
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
            const { summary: newSummary } = await summarizeNote(content);
            setSummary(newSummary);
        } catch (error) {
            setError('Failed to summarize note');
        } finally {
            setAiLoading(false);
        }
    };

    const handleDeleteSummary = () => {
        setSummary('');
    };

    const handleStyleTransform = async () => {
        if (!content) {
            setError('Please add some content to transform');
            return;
        }

        setAiLoading(true);
        setError('');

        try {
            const { transformedText } = await transformStyle(content, selectedStyle);
            setContent(transformedText);
        } catch (error) {
            setError('Failed to transform text style');
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

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Create New Note</h1>
                    <button
                        onClick={() => navigate('/')}
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
                        <div className="flex items-center justify-between">
                            <label htmlFor="content" className="text-sm font-medium text-gray-700">
                                Content
                            </label>
                            <div className="flex items-center gap-4">
                                <select
                                    value={selectedStyle}
                                    onChange={(e) => setSelectedStyle(e.target.value)}
                                    className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    {supportedStyles.map((style) => (
                                        <option key={style.value} value={style.value}>
                                            {style.label}
                                        </option>
                                    ))}
                                </select>
                                <Button
                                    type="button"
                                    onClick={handleStyleTransform}
                                    disabled={aiLoading}
                                    variant="outline"
                                    className="text-sm"
                                >
                                    {aiLoading ? 'Transforming...' : 'Transform Style'}
                                </Button>
                            </div>
                        </div>
                        <div className="h-[400px]">
                            <ReactQuill
                                theme="snow"
                                value={content}
                                onChange={setContent}
                                modules={modules}
                                formats={formats}
                                className="h-[330px]"
                                placeholder="Write your note content here..."
                            />
                        </div>
                    </div>

                    {summary && (
                        <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 relative">
                            <button
                                onClick={handleDeleteSummary}
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                            >
                                <X size={18} />
                            </button>
                            <h3 className="text-lg font-medium text-blue-800 mb-2">Summary</h3>
                            <p className="text-blue-700 whitespace-pre-wrap">{summary}</p>
                        </div>
                    )}

                    {grammarIssues.length > 0 && (
                        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4 mt-14">
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

                    <div className="flex gap-4 pt-4 mt-8 sm:mt-12">
                        <Button
                            type="submit"
                            className="flex-1"
                        >
                            Save Note
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

export default CreateNote; 