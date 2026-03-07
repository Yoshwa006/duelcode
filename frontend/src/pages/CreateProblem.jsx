import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { createQuestion } from '../service/api';

function CreateProblem() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        difficulty: 'EASY',
        tags: '',
        stdIn: '',
        expectedOutput: ''
    });

    const [testCases, setTestCases] = useState([
        { stdin: '', expectedOutput: '' }
    ]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, field, value) => {
        const updated = [...testCases];
        updated[index][field] = value;
        setTestCases(updated);
    };

    const addTestCase = () => {
        setTestCases([...testCases, { stdin: '', expectedOutput: '' }]);
    };

    const removeTestCase = (index) => {
        if (testCases.length > 1) {
            const updated = [...testCases];
            updated.splice(index, 1);
            setTestCases(updated);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const payload = {
            ...formData,
            testCases: testCases.filter(tc => tc.stdin.trim() || tc.expectedOutput.trim())
        };

        try {
            await createQuestion(payload);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 w-full max-w-4xl mx-auto p-6">
                <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-800">Create New Problem</h2>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    placeholder="e.g. Two Sum"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                <select
                                    name="difficulty"
                                    value={formData.difficulty}
                                    onChange={handleChange}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                            <input
                                type="text"
                                name="tags"
                                value={formData.tags}
                                onChange={handleChange}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g. array, hash-table, math"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={4}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Describe the problem in detail..."
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Input Format (StdIn)</label>
                                <textarea
                                    name="stdIn"
                                    value={formData.stdIn}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                    placeholder="Explain how the input is structured"
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Expected Output Format</label>
                                <textarea
                                    name="expectedOutput"
                                    value={formData.expectedOutput}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                                    placeholder="Explain how the output should be structured"
                                ></textarea>
                            </div>
                        </div>

                        <hr className="my-2" />

                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-medium text-gray-800">Test Cases</h3>
                                <button
                                    type="button"
                                    onClick={addTestCase}
                                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-md transition"
                                >
                                    + Add Test Case
                                </button>
                            </div>

                            <div className="flex flex-col gap-4">
                                {testCases.map((tc, idx) => (
                                    <div key={idx} className="p-4 border rounded-md bg-gray-50 relative">
                                        <div className="absolute top-2 right-2 text-xs font-bold text-gray-400">
                                            #{idx + 1}
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Standard Input</label>
                                                <textarea
                                                    value={tc.stdin}
                                                    onChange={(e) => handleTestCaseChange(idx, 'stdin', e.target.value)}
                                                    rows={2}
                                                    className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 font-mono"
                                                ></textarea>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1">Expected Output</label>
                                                <textarea
                                                    value={tc.expectedOutput}
                                                    onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                                    rows={2}
                                                    className="w-full border rounded px-2 py-1 text-sm focus:ring-1 focus:ring-blue-500 font-mono"
                                                ></textarea>
                                            </div>
                                        </div>
                                        {testCases.length > 1 && (
                                            <div className="mt-2 text-right">
                                                <button
                                                    type="button"
                                                    onClick={() => removeTestCase(idx)}
                                                    className="text-xs text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-50 mr-3"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`px-6 py-2 rounded-md text-sm font-medium text-white ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {loading ? 'Creating...' : 'Create Problem'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default CreateProblem;
