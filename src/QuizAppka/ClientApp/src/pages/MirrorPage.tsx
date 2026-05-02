import { useEffect, useState } from 'react';
import {
  Alert,
  CircularProgress,
  Container,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Typography,
} from '@mui/material';
import { fetchCategories, fetchCategory } from '../services/quizApi';
import { getPresenterHubConnection, startPresenterHub } from '../services/presenterHub';
import QuestionList from '../components/QuestionList';
import QuestionDisplay from '../components/QuestionDisplay';
import type { CategorySummary, CategoryDetail, Question, RevealState } from '../types/quiz';
import type { StateUpdatedPayload } from '../types/mirror';

type MirrorScreen =
  | { screen: 'idle' }
  | { screen: 'category-list' }
  | { screen: 'question-list'; categoryId: string }
  | { screen: 'question-detail'; categoryId: string; questionId: string };

export default function MirrorPage() {
  const [mirrorScreen, setMirrorScreen] = useState<MirrorScreen>({ screen: 'idle' });
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [category, setCategory] = useState<CategoryDetail | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [revealState, setRevealState] = useState<RevealState | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const connection = getPresenterHubConnection();

    connection.on('StateUpdated', (payload: StateUpdatedPayload) => {
      const screen = payload.screen;
      setRevealState(payload.revealState ?? null);
      if (screen === 'idle') {
        setMirrorScreen({ screen: 'idle' });
      } else if (screen === 'category-list') {
        setMirrorScreen({ screen: 'category-list' });
      } else if (screen === 'question-list' && payload.categoryId) {
        setMirrorScreen({ screen: 'question-list', categoryId: payload.categoryId });
      } else if (
        screen === 'question-detail' &&
        payload.categoryId &&
        payload.questionId
      ) {
        setMirrorScreen({
          screen: 'question-detail',
          categoryId: payload.categoryId,
          questionId: payload.questionId,
        });
      }
    });

    connection.onreconnecting(() => setReconnecting(true));
    connection.onreconnected(() => setReconnecting(false));

    startPresenterHub()
      .then(() => setConnected(true))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to connect to presenter hub');
      });

    return () => {
      connection.off('StateUpdated');
    };
  }, []);

  useEffect(() => {
    if (mirrorScreen.screen === 'category-list') {
      fetchCategories().then(setCategories).catch(() => {});
    }
  }, [mirrorScreen.screen]);

  useEffect(() => {
    if (
      mirrorScreen.screen === 'question-list' ||
      mirrorScreen.screen === 'question-detail'
    ) {
      fetchCategory(mirrorScreen.categoryId)
        .then((data) => {
          setCategory(data);
          if (mirrorScreen.screen === 'question-detail') {
            const found =
              data.questions.find((q) => q.id === mirrorScreen.questionId) ?? null;
            setQuestion(found);
          } else {
            setQuestion(null);
          }
        })
        .catch(() => {});
    } else {
      setCategory(null);
      setQuestion(null);
    }
  }, [mirrorScreen]);

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" role="alert">
          {error}
        </Alert>
      </Container>
    );
  }

  if (!connected) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress role="progressbar" aria-label="Connecting to presenter" />
      </Container>
    );
  }

  const reconnectingBanner = (
    <Snackbar open={reconnecting} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
      <Alert severity="warning" role="status" aria-label="Reconnecting">
        Reconnecting to presenter…
      </Alert>
    </Snackbar>
  );

  if (mirrorScreen.screen === 'idle') {
    return (
      <Container sx={{ mt: 4 }}>
        {reconnectingBanner}
        <Alert severity="info" role="status">
          Waiting for presenter to start…
        </Alert>
      </Container>
    );
  }

  if (mirrorScreen.screen === 'category-list') {
    return (
      <Container sx={{ mt: 4 }}>
        {reconnectingBanner}
        <Typography variant="h4" gutterBottom>
          Quiz Categories
        </Typography>
        <List>
          {categories.map((cat) => (
            <ListItem key={cat.id}>
              <ListItemText primary={cat.name} />
            </ListItem>
          ))}
        </List>
      </Container>
    );
  }

  if (mirrorScreen.screen === 'question-list') {
    if (!category) {
      return (
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress role="progressbar" />
        </Container>
      );
    }
    return (
      <Container sx={{ mt: 4 }}>
        {reconnectingBanner}
        <Typography variant="h4" gutterBottom>
          {category.name}
        </Typography>
        <QuestionList questions={category.questions} onSelectQuestion={() => {}} />
      </Container>
    );
  }

  if (mirrorScreen.screen === 'question-detail') {
    if (!category) {
      return (
        <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress role="progressbar" />
        </Container>
      );
    }
    return (
      <Container sx={{ mt: 4 }}>
        {reconnectingBanner}
        <Typography variant="h4" gutterBottom>
          {category.name}
        </Typography>
        {question && <QuestionDisplay question={question} revealState={revealState} />}
      </Container>
    );
  }

  return null;
}

