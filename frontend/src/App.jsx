import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TextEditor from "./pages/TextEditor.jsx";
import SingleProblem from "./pages/SingleProblem.jsx";
import AuthPage from "./pages/Auth.jsx";
import MatchPage from "./pages/MatchPage.jsx";
import CreateProblem from "./pages/CreateProblem.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/create-problem" element={<CreateProblem />} />
            <Route path="/match/:token" element={<MatchPage />} />
            <Route path="/:id/edit" element={<TextEditor />} />
            <Route path="/:id" element={<SingleProblem />} />
        </Routes>
    );
}
export default App;
