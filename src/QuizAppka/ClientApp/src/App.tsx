import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionListPage from './pages/QuestionListPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import MirrorPage from './pages/MirrorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:categoryId" element={<QuestionListPage />} />
        <Route path="/quiz/:categoryId/:questionId" element={<QuestionDetailPage />} />
        <Route path="/mirror" element={<MirrorPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
