import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Quiz,
  Timer,
  CheckCircle,
  Cancel,
  Lightbulb,
  Refresh,
  Settings,
} from '@mui/icons-material';
import { usePDF } from '../../contexts/PDFContext';
import { apiService } from '../../services/api';
import {
  MCQGenerationRequest,
  MCQQuestion,
  MCQAnswer,
  MCQSubmissionResult,
  QuizSession
} from '../../types';

interface QuizConfigDialogProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (config: { questionCount: number; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) => void;
  loading: boolean;
}

const QuizConfigDialog: React.FC<QuizConfigDialogProps> = ({
  open,
  onClose,
  onGenerate,
  loading
}) => {
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');

  const handleGenerate = () => {
    onGenerate({ questionCount, difficulty });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Configuration du Quiz</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Nombre de questions
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            {[5, 10, 15, 20].map((count) => (
              <Button
                key={count}
                variant={questionCount === count ? 'contained' : 'outlined'}
                onClick={() => setQuestionCount(count)}
                size="small"
              >
                {count}
              </Button>
            ))}
          </Box>

          <Typography variant="h6" gutterBottom>
            Niveau de difficulté
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {[
              { value: 'EASY', label: 'Facile', color: 'success' },
              { value: 'MEDIUM', label: 'Moyen', color: 'warning' },
              { value: 'HARD', label: 'Difficile', color: 'error' },
            ].map((level) => (
              <Button
                key={level.value}
                variant={difficulty === level.value ? 'contained' : 'outlined'}
                onClick={() => setDifficulty(level.value as 'EASY' | 'MEDIUM' | 'HARD')}
                color={level.color as any}
                size="small"
              >
                {level.label}
              </Button>
            ))}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button onClick={handleGenerate} variant="contained" disabled={loading}>
          {loading ? 'Génération...' : 'Générer le Quiz'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const QuizInterface: React.FC = () => {
  const { currentPDF, quizSession, setQuizSession } = usePDF();
  
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<MCQSubmissionResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (quizSession && !quizSession.isSubmitted) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [quizSession]);

  const handleGenerateQuiz = async (config: { questionCount: number; difficulty: 'EASY' | 'MEDIUM' | 'HARD' }) => {
    if (!currentPDF) return;

    setLoading(true);
    setError('');
    setConfigDialogOpen(false);

    try {
      const request: MCQGenerationRequest = {
        pdfId: currentPDF.id,
        questionCount: config.questionCount,
        difficulty: config.difficulty,
      };

      const response = await apiService.generateMCQ(request);

      const newQuizSession: QuizSession = {
        questions: response.questions,
        currentQuestionIndex: 0,
        answers: [],
        timeStarted: new Date(),
        isSubmitted: false,
      };

      setQuizSession(newQuizSession);
      setTimeElapsed(0);
      setResult(null);
    } catch (err) {
      setError('Erreur lors de la génération du quiz. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, selectedOption: number) => {
    if (!quizSession || quizSession.isSubmitted) return;

    const existingAnswerIndex = quizSession.answers.findIndex(
      answer => answer.questionId === questionId
    );

    const newAnswer: MCQAnswer = { questionId, selectedOption };
    let newAnswers = [...quizSession.answers];

    if (existingAnswerIndex >= 0) {
      newAnswers[existingAnswerIndex] = newAnswer;
    } else {
      newAnswers.push(newAnswer);
    }

    setQuizSession({
      ...quizSession,
      answers: newAnswers,
    });
  };

  const handleSubmitQuiz = async () => {
    if (!quizSession || !currentPDF) return;

    setSubmitting(true);
    setError('');

    try {
      const submissionResult = await apiService.submitMCQAnswers(
        currentPDF.id,
        {
          answers: quizSession.answers,
          timeTakenSeconds: timeElapsed,
          questions: quizSession.questions,
        }
      );

      setResult(submissionResult);
      setQuizSession({
        ...quizSession,
        isSubmitted: true,
      });
    } catch (err) {
      setError('Erreur lors de la soumission du quiz. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetQuiz = () => {
    setQuizSession(null);
    setResult(null);
    setTimeElapsed(0);
    setError('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getAnsweredCount = () => {
    return quizSession?.answers.length || 0;
  };

  const getTotalQuestions = () => {
    return quizSession?.questions.length || 0;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  if (!currentPDF) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Quiz sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Aucun document sélectionné
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sélectionnez un document depuis la bibliothèque pour générer un quiz
        </Typography>
      </Box>
    );
  }

  // Quiz Results View
  if (result && quizSession?.isSubmitted) {
    return (
      <Box sx={{ 
        p: 3, 
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <CheckCircle 
              sx={{ 
                fontSize: 64, 
                color: getScoreColor(result.score) + '.main',
                mb: 2 
              }} 
            />
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Quiz Terminé !
            </Typography>
            <Typography variant="h2" color={getScoreColor(result.score) + '.main'}>
              {Math.round(result.score)}%
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {getAnsweredCount()} / {getTotalQuestions()} questions répondues
            </Typography>
          </Box>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Statistiques
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Temps total:</Typography>
                    <Typography fontWeight={600}>{formatTime(timeElapsed)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Questions correctes:</Typography>
                    <Typography fontWeight={600}>
                      {Math.round((result.score / 100) * getTotalQuestions())}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>Score:</Typography>
                    <Typography fontWeight={600} color={getScoreColor(result.score) + '.main'}>
                      {Math.round(result.score)}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recommandations
                  </Typography>
                  {result.recommendations.length > 0 ? (
                    result.recommendations.map((rec, index) => (
                      <Box key={index} sx={{ mb: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {rec.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {rec.reason}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography color="text.secondary">
                      Excellent travail ! Continuez ainsi.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Button
              variant="contained"
              onClick={handleResetQuiz}
              startIcon={<Refresh />}
              sx={{ mr: 2 }}
            >
              Nouveau Quiz
            </Button>
            <Button
              variant="outlined"
              onClick={() => setConfigDialogOpen(true)}
              startIcon={<Settings />}
            >
              Configurer
            </Button>
          </Box>
        </Paper>

        {/* Detailed Explanations */}
        {result.explanations.length > 0 && (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Explications détaillées
            </Typography>
            {result.explanations.map((explanation, index) => (
              <Alert key={index} severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom fontWeight={600}>
                  Question {explanation.questionId}:
                </Typography>
                <Typography variant="body2">
                  {explanation.explanation}
                </Typography>
              </Alert>
            ))}
          </Paper>
        )}
      </Box>
    );
  }

  // Quiz Taking View
  if (quizSession && !quizSession.isSubmitted) {
    const currentQuestion = quizSession.questions[quizSession.currentQuestionIndex];
    const progress = ((getAnsweredCount()) / getTotalQuestions()) * 100;

    return (
      <Box sx={{ 
        p: 3, 
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {error && (
          <Alert severity="error\" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Quiz Header */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Question {quizSession.currentQuestionIndex + 1} sur {getTotalQuestions()}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<Timer />}
                label={formatTime(timeElapsed)}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`${getAnsweredCount()}/${getTotalQuestions()}`}
                color={getAnsweredCount() === getTotalQuestions() ? 'success' : 'default'}
              />
            </Box>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 6, borderRadius: 3 }}
          />
        </Paper>

        {/* Current Question */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            {currentQuestion.text}
          </Typography>

          <FormControl component="fieldset" sx={{ width: '100%', mt: 2 }}>
            <RadioGroup
              value={
                quizSession.answers.find(a => a.questionId === currentQuestion.id)?.selectedOption ?? ''
              }
              onChange={(e) => handleAnswerChange(currentQuestion.id, parseInt(e.target.value))}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index}
                  control={<Radio />}
                  label={option}
                  sx={{ 
                    py: 1,
                    px: 2,
                    mx: 0,
                    borderRadius: 1,
                    '&:hover': {
                      backgroundColor: 'grey.50',
                    }
                  }}
                />
              ))}
            </RadioGroup>
          </FormControl>

          {currentQuestion.explanation && (
            <Box sx={{ mt: 2 }}>
              <Tooltip title="Explication disponible après soumission">
                <Chip
                  icon={<Lightbulb />}
                  label="Explication disponible"
                  size="small"
                  variant="outlined"
                />
              </Tooltip>
            </Box>
          )}
        </Paper>

        {/* Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            onClick={() => setQuizSession({
              ...quizSession,
              currentQuestionIndex: Math.max(0, quizSession.currentQuestionIndex - 1)
            })}
            disabled={quizSession.currentQuestionIndex === 0}
          >
            Précédent
          </Button>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              onClick={() => setQuizSession({
                ...quizSession,
                currentQuestionIndex: Math.min(
                  quizSession.questions.length - 1,
                  quizSession.currentQuestionIndex + 1
                )
              })}
              disabled={quizSession.currentQuestionIndex === quizSession.questions.length - 1}
            >
              Suivant
            </Button>

            <Button
              variant="contained"
              onClick={handleSubmitQuiz}
              disabled={submitting || getAnsweredCount() === 0}
              startIcon={submitting ? <Timer /> : <CheckCircle />}
            >
              {submitting ? 'Soumission...' : 'Terminer le Quiz'}
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // Initial State - No Quiz Generated
  return (
    <Box sx={{ 
      p: 3,
      height: '100%',
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {error && (
        <Alert severity="error\" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Quiz sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Générer un Quiz
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Créez un quiz personnalisé basé sur le contenu de ce document
        </Typography>
        <Typography variant="h6" gutterBottom>
          {currentPDF.title}
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          onClick={() => setConfigDialogOpen(true)}
          disabled={loading}
          startIcon={loading ? <Timer /> : <Quiz />}
          sx={{ mt: 2 }}
        >
          {loading ? 'Génération...' : 'Configurer le Quiz'}
        </Button>
      </Paper>

      <QuizConfigDialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onGenerate={handleGenerateQuiz}
        loading={loading}
      />
    </Box>
  );
};

export default QuizInterface;