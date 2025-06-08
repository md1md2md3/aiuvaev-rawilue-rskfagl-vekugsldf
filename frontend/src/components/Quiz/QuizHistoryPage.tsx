import React, { useState, useEffect } from 'react';
import {  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { MCQQuestion } from '../../types';

interface QuizHistory {
  id: number;
  pdfId: number;
  pdfTitle: string;
  score: number;
  questionCount: number;
  completedAt: string;
  difficulty: string;
  timeTakenSeconds: number;
  correctAnswers: number;
}

const QuizHistoryPage: React.FC = () => {
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedQuizId, setSelectedQuizId] = useState<number | null>(null);
  const [quizQuestions, setQuizQuestions] = useState<MCQQuestion[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizHistory();
  }, []);

  const fetchQuizHistory = async () => {
    try {
      const history = await apiService.getQuizHistory();
      setQuizHistory(history);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique des quiz');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Chargement de l'historique...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  const handleViewQuiz = async (quizId: number) => {
    try {
      const questions = await apiService.getQuizQuestions(quizId);
      setQuizQuestions(questions);
      setSelectedQuizId(quizId);
      setDialogOpen(true);
    } catch (err) {
      setError('Erreur lors du chargement des questions du quiz');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setQuizQuestions([]);
    setSelectedQuizId(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Historique des Quiz
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quiz Complétés
              </Typography>
              <Typography variant="h3">
                {quizHistory.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score Moyen
              </Typography>
              <Typography variant="h3">
                {quizHistory.length > 0 
                  ? Math.round(quizHistory.reduce((acc, quiz) => acc + quiz.score, 0) / quizHistory.length)
                  : 0}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Temps Total
              </Typography>
              <Typography variant="h3">
                {formatTime(quizHistory.reduce((acc, quiz) => acc + quiz.timeTakenSeconds, 0))}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>          <TableHead>
            <TableRow>
              <TableCell>Document</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Difficulté</TableCell>
              <TableCell>Questions</TableCell>
              <TableCell>Score</TableCell>
              <TableCell>Temps</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {quizHistory.map((quiz) => (
              <TableRow key={quiz.id}>                <TableCell>                  
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Link
                      component="button"
                      variant="body2"
                      onClick={() => handleViewQuiz(quiz.id)}
                      sx={{ 
                        maxWidth: 300, 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        textAlign: 'left',
                        '&:hover': {
                          textDecoration: 'underline'
                        }
                      }}
                    >
                      {quiz.pdfTitle}
                    </Link>
                  </Box>
                </TableCell>
                <TableCell>{formatDate(quiz.completedAt)}</TableCell>
                <TableCell>
                  <Chip
                    label={quiz.difficulty}
                    color={
                      quiz.difficulty === 'EASY' ? 'success' :
                      quiz.difficulty === 'MEDIUM' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {quiz.correctAnswers}/{quiz.questionCount}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${Math.round(quiz.score)}%`}
                    color={getScoreColor(quiz.score)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{formatTime(quiz.timeTakenSeconds)}</TableCell>              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Quiz Questions Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Questions du Quiz
          {selectedQuizId && quizHistory.find(q => q.id === selectedQuizId) && (
            <Typography variant="subtitle1" color="text.secondary">
              Complété le {formatDate(quizHistory.find(q => q.id === selectedQuizId)!.completedAt)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent>
          {quizQuestions.map((question, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" gutterBottom>
                {index + 1}. {question.text}
              </Typography>
              {question.options.map((option, optionIndex) => (
                <Box 
                  key={optionIndex} 
                  sx={{ 
                    p: 1,
                    mb: 1,
                    borderRadius: 1,
                    bgcolor: optionIndex === question.correctOption ? 'success.light' : 'background.default',
                  }}
                >
                  <Typography>
                    {option}
                    {optionIndex === question.correctOption && ' ✓'}
                  </Typography>
                </Box>
              ))}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {question.explanation}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Fermer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default QuizHistoryPage;
