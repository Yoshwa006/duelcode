import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TextEditor from "./pages/TextEditor.jsx";
import SingleProblem from "./pages/SingleProblem.jsx";
import AuthPage from "./pages/Auth.jsx";


function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/:id/edit" element={<TextEditor />} />
            <Route path="/:id" element={<SingleProblem />} />
        </Routes>
    );
}
 export default App;
