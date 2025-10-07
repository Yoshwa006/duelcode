import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { generateKey, getSingle, polling } from "../service/api.js";
import Navbar from "../components/Navbar.jsx";

function SingleProblem() {
    const [problem, setProblem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [token, setToken] = useState(null);
    const [showToken, setShowToken] = useState(false);
    const [waiting, setWaiting] = useState(false);
    const [battleStarted, setBattleStarted] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                setLoading(true);
                const problemData = await getSingle({ id });
                setProblem(problemData);
            } catch (err) {
                setError(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProblem();
        }
    }, [id]);
    //
    // useEffect(() => {
    //     const polling = async() =>{
    //         try{
    //             const res = await polling()
    //         }
    //     }
    // })
    const hnadleGenerateKey = async () => {
        try {
            setWaiting(true);

            const generated_key = await generateKey({ questionId: id });   //getting key for a user

            const key = generated_key.token || JSON.stringify(generated_key);
            localStorage.setItem("key", key);

            setToken(key);
            setShowToken(true);
            await polling();
            setWaiting(false);
            setBattleStarted(true);
            navigate(`/${id}`);
        } catch (err) {
            setError(err.message || 'Failed to generate token');
            setWaiting(false);
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty?.toLowerCase()) {
            case 'easy':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'medium':
                return 'text-orange-600 bg-orange-50 border-orange-200';
            case 'hard':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading problem...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg">
                <div className="flex items-center">
                    <strong className="font-semibold">Error:</strong>
                    <span className="ml-1">{error}</span>
                </div>
            </div>
        </div>
    );

    if (!problem) return (
        <div className="max-w-7xl mx-auto p-6">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg">
                Problem not found.
            </div>
        </div>
    );

    return (
        <div>
            <Navbar />
            <div className="min-h-screen bg-gray-100">
                <div className="max-w-7xl mx-auto py-6 px-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                    {problem.title}
                                </h1>
                                <div className="flex items-center gap-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getDifficultyColor(problem.difficulty)}`}>
                                        {problem.difficulty}
                                    </span>
                                    <span className="text-gray-500 text-sm">Problem #{id}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                    <h2 className="text-lg font-semibold text-gray-900">Problem Statement</h2>
                                </div>
                                <div className="p-6">
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-800 text-base">
                                        {problem.description}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <h3 className="font-semibold text-gray-900">Sample Input</h3>
                                    </div>
                                    <div className="p-4">
                                        <pre className="text-sm bg-gray-50 p-3 rounded font-mono text-gray-800">
                                            {problem.stdIn || "No input available."}
                                        </pre>
                                    </div>
                                </div>

                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <h3 className="font-semibold text-gray-900">Sample Output</h3>
                                    </div>
                                    <div className="p-4">
                                        <pre className="text-sm bg-gray-50 p-3 rounded font-mono text-gray-800">
                                            {problem.expectedOutput || "No output available."}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white border border-gray-200 rounded-lg">
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                    <h3 className="font-semibold text-gray-900">Actions</h3>
                                </div>
                                <div className="p-4 space-y-3">
                                    <Link to={`/${id}/edit`} className="block">
                                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-2.5 px-4 rounded-md font-medium">
                                            Start Coding
                                        </button>
                                    </Link>

                                    <button
                                        onClick={hnadleGenerateKey}
                                        className="w-full bg-green-600 hover:bg-green-700 text-white text-sm py-2.5 px-4 rounded-md font-medium"
                                    >
                                        Generate Token
                                    </button>
                                </div>
                            </div>
                            {battleStarted && (
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to quit the battle?")) {
                                            localStorage.removeItem("ctoken");
                                            localStorage.removeItem("QID");
                                            setBattleStarted(false);
                                            navigate('/');
                                        }
                                    }}
                                    className="w-full bg-red-600 hover:bg-red-700 text-white text-sm py-2.5 px-4 rounded-md font-medium"
                                >
                                    Quit Battle
                                </button>
                            )}

                            {showToken && (
                                <div className="bg-white border border-gray-200 rounded-lg">
                                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                        <h3 className="font-semibold text-gray-900">Generated Token</h3>
                                    </div>
                                    <div className="p-4">
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                            <p className="text-xs uppercase text-gray-500 font-semibold mb-2">Token</p>
                                            <div className="font-mono bg-white border border-gray-300 text-gray-900 py-3 px-3 rounded-md text-sm break-all select-all">
                                                {token}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {waiting && (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-6 py-4 rounded-lg text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-yellow-500 border-t-transparent mx-auto mb-2"></div>
                                    Waiting for User 2 to join...
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SingleProblem;
