import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  Snackbar,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { fetchCategories, fetchCategory } from '../services/quizApi';
import { getPresenterHubConnection, startPresenterHub } from '../services/presenterHub';
import QuestionList from '../components/QuestionList';
import QuestionDisplay from '../components/QuestionDisplay';
import type { CategorySummary, CategoryDetail, Question, RevealState } from '../types/quiz';
import type { StateUpdatedPayload } from '../types/mirror';
import CategoryList from '../components/CategoryList';

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

    startPresenterHub().then(() => setConnected(true)).catch(() => {});

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

  if (!connected) {
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1} sx={{ display: 'flex', justifyContent: 'center' }}>
            <CircularProgress role="progressbar" aria-label="Connecting to presenter" />
          </Grid>
        </Grid>
      </Box>
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
      <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            {reconnectingBanner}
            <Alert severity="info" role="status">
              Waiting for presenter to start…
            </Alert>
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (mirrorScreen.screen === 'category-list') {
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            {reconnectingBanner}
            <Typography variant="h3" component="h1" gutterBottom>
              QUIZ
            </Typography>
            <CategoryList categories={categories} isMirror />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (mirrorScreen.screen === 'question-list') {
    if (!category) {
      return (
        <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
          <Grid container columns={12}>
            <Grid size={10} offset={1} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress role="progressbar" />
            </Grid>
          </Grid>
        </Box>
      );
    }
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            {reconnectingBanner}
            <Typography variant="h3" component="h1" gutterBottom>
              {category.name}
            </Typography>
            <QuestionList questions={category.questions} onSelectQuestion={() => {}} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  if (mirrorScreen.screen === 'question-detail') {
    if (!category) {
      return (
        <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
          <Grid container columns={12}>
            <Grid size={10} offset={1} sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress role="progressbar" />
            </Grid>
          </Grid>
        </Box>
      );
    }
    return (
      <Box data-testid="page-layout" sx={{ width: '100%', pt: 4 }}>
        <Grid container columns={12}>
          <Grid size={10} offset={1}>
            {reconnectingBanner}
            <Typography variant="h3" component="h1" gutterBottom>
              {category.name}
            </Typography>
            {question && (
              <QuestionDisplay question={question} revealState={revealState} displayMode="mirror" />
            )}
          </Grid>
        </Grid>
      </Box>
    );
  }

  return null;
}
