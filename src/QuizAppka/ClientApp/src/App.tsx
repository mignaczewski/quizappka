import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuestionListPage from "./pages/QuestionListPage";
import QuestionDetailPage from "./pages/QuestionDetailPage";
import MirrorPage from "./pages/MirrorPage";
import {
  ThemeProvider,
  createTheme as createMuiTheme,
} from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { blue } from "@mui/material/colors";

function App() {

  const themeLight = createMuiTheme({
    palette: {
      background: {
        default: blue[100]
      },
    },
  });

  return (
    <ThemeProvider theme={themeLight}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/quiz/:categoryId" element={<QuestionListPage />} />
          <Route
            path="/quiz/:categoryId/:questionId"
            element={<QuestionDetailPage />}
          />
          <Route path="/mirror" element={<MirrorPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
