import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { questionsApi } from '../service/api';

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
            await questionsApi.create(payload);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to create problem');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container">
            <Navbar />
            <div className="page-container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div className="panel slide-up">
                        <div className="panel-title">
                            <span>➕</span> Create New Problem
                        </div>

                        <div className="panel-content">
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {error && (
                                    <div className="alert alert-error">{error}</div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">📝 Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            required
                                            className="form-input"
                                            placeholder="e.g. Two Sum"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">📊 Difficulty</label>
                                        <select
                                            name="difficulty"
                                            value={formData.difficulty}
                                            onChange={handleChange}
                                            className="select-input"
                                        >
                                            <option value="EASY">Easy</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HARD">Hard</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">🏷️ Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        name="tags"
                                        value={formData.tags}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g. array, hash-table, math"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">📄 Description</label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        rows={5}
                                        className="form-input"
                                        style={{ minHeight: '120px', resize: 'vertical' }}
                                        placeholder="Describe the problem in detail..."
                                    ></textarea>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                    <div className="form-group">
                                        <label className="form-label">📥 Input Format (StdIn)</label>
                                        <textarea
                                            name="stdIn"
                                            value={formData.stdIn}
                                            onChange={handleChange}
                                            rows={3}
                                            className="form-input"
                                            style={{ fontFamily: 'monospace' }}
                                            placeholder="Explain how the input is structured"
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">📤 Expected Output Format</label>
                                        <textarea
                                            name="expectedOutput"
                                            value={formData.expectedOutput}
                                            onChange={handleChange}
                                            rows={3}
                                            className="form-input"
                                            style={{ fontFamily: 'monospace' }}
                                            placeholder="Explain how the output should be structured"
                                        ></textarea>
                                    </div>
                                </div>

                                <div className="divider-line"></div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fff', margin: 0 }}>
                                            🧪 Test Cases
                                        </h3>
                                        <button
                                            type="button"
                                            onClick={addTestCase}
                                            className="cf-btn"
                                        >
                                            ➕ Add Test Case
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                        {testCases.map((tc, idx) => (
                                            <div key={idx} style={{ 
                                                padding: '15px', 
                                                border: '1px solid var(--cf-border)', 
                                                borderRadius: '8px', 
                                                background: 'var(--cf-bg-tertiary)',
                                                position: 'relative'
                                            }}>
                                                <div style={{ 
                                                    position: 'absolute', 
                                                    top: '10px', 
                                                    right: '15px', 
                                                    fontSize: '12px', 
                                                    fontWeight: 'bold', 
                                                    color: '#666' 
                                                }}>
                                                    #{idx + 1}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ fontSize: '12px' }}>Standard Input</label>
                                                        <textarea
                                                            value={tc.stdin}
                                                            onChange={(e) => handleTestCaseChange(idx, 'stdin', e.target.value)}
                                                            rows={2}
                                                            className="form-input"
                                                            style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                                        ></textarea>
                                                    </div>
                                                    <div className="form-group" style={{ marginBottom: 0 }}>
                                                        <label className="form-label" style={{ fontSize: '12px' }}>Expected Output</label>
                                                        <textarea
                                                            value={tc.expectedOutput}
                                                            onChange={(e) => handleTestCaseChange(idx, 'expectedOutput', e.target.value)}
                                                            rows={2}
                                                            className="form-input"
                                                            style={{ fontFamily: 'monospace', fontSize: '13px' }}
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                {testCases.length > 1 && (
                                                    <div style={{ marginTop: '10px', textAlign: 'right' }}>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTestCase(idx)}
                                                            style={{ 
                                                                background: 'transparent', 
                                                                border: 'none', 
                                                                color: '#ff6666', 
                                                                cursor: 'pointer',
                                                                fontSize: '13px'
                                                            }}
                                                        >
                                                            🗑️ Remove
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--cf-border)' }}>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/')}
                                        className="cf-btn"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="cf-btn-primary"
                                        style={{ padding: '10px 25px' }}
                                    >
                                        {loading ? (
                                            <span>
                                                <span className="loading-dots"><span></span><span></span><span></span></span> Creating...
                                            </span>
                                        ) : 'Create Problem'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateProblem;