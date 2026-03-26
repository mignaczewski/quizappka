import { BrowserRouter, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import QuestionListPage from './pages/QuestionListPage';
import QuestionDetailPage from './pages/QuestionDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/quiz/:categoryId" element={<QuestionListPage />} />
        <Route path="/quiz/:categoryId/:questionId" element={<QuestionDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
