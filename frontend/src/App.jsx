import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import TextEditor from "./pages/TextEditor.jsx";
import SingleProblem from "./pages/SingleProblem.jsx";
import AuthPage from "./pages/Auth.jsx";
import MatchPage from "./pages/MatchPage.jsx";
import CreateProblem from "./pages/CreateProblem.jsx";
import ProfilePage from "./pages/ProfilePage.jsx";
import UsersListPage from "./pages/UsersListPage.jsx";
import FriendsPage from "./pages/FriendsPage.jsx";
import UserProfilePage from "./pages/UserProfilePage.jsx";

function App() {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/users" element={<UsersListPage />} />
            <Route path="/users/:userId" element={<UserProfilePage />} />
            <Route path="/friends" element={<FriendsPage />} />
            <Route path="/create-problem" element={<CreateProblem />} />
            <Route path="/match/:token" element={<MatchPage />} />
            <Route path="/match/create/:questionId" element={<MatchPage />} />
            <Route path="/:id/edit" element={<TextEditor />} />
            <Route path="/:id" element={<SingleProblem />} />
        </Routes>
    );
}
export default App;