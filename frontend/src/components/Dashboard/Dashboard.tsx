import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Avatar,
  LinearProgress,
  Chip,
  Alert,
  Skeleton,
  useTheme,
} from '@mui/material';
import {
  TrendingUp,
  Quiz,
  LibraryBooks,
  Star,
  ArrowForward,
  Timer,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../services/api';
import { UserProgress, PDF, Recommendation } from '../../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [studiedDocs, setStudiedDocs] = useState<PDF[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (user?.userId) {
          const [progressData, docsData, recsData] = await Promise.all([
            apiService.getUserProgress(user.userId),
            apiService.getUserStudiedDocuments(String(user.userId)),
            apiService.getUserRecommendations(String(user.userId))
          ]);
          setProgress(progressData);
          setStudiedDocs(docsData);
          setRecommendations(recsData);
        }
      } catch (err) {
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    return 'à l\'instant';
  };

  const statsCards = [
    {
      title: 'Quiz complétés',
      value: progress?.quizzesTaken || 0,
      icon: <Quiz />,
      color: theme.palette.primary.main,
      change: `+${progress?.quizzesTakenThisMonth || 0} ce mois`,
    },
    {
      title: 'Score moyen',
      value: `${Math.round(progress?.averageScore || 0)}%`,
      icon: <TrendingUp />,
      color: theme.palette.success.main,
      change: `${progress?.scoreChangeThisMonth > 0 ? '+' : ''}${progress?.scoreChangeThisMonth || 0}% ce mois`,
    },
    {
      title: 'Documents étudiés',
      value: studiedDocs.length,
      icon: <LibraryBooks />,
      color: theme.palette.info.main,
      change: `+${studiedDocs.filter(doc => 
        new Date(doc.lastAccessed).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
      ).length} cette semaine`,
    },
    {
      title: 'Recommandations',
      value: recommendations.length,
      icon: <Star />,
      color: theme.palette.warning.main,
      change: recommendations.length > 0 ? 'Nouvelles disponibles' : 'Aucune nouvelle',
    },
  ];

  const recentActivity = [
    ...studiedDocs.slice(0, 3).map(doc => ({
      title: doc.title,
      score: null,
      time: `Il y a ${formatTimeAgo(new Date(doc.lastAccessed))}`,
      icon: <Timer color="action" />,
      type: 'document' as const,
      pdfId: doc.id
    })),
    ...recommendations.slice(0, 2).map(rec => ({
      title: rec.title,
      score: null,
      time: `Recommandé ${formatTimeAgo(new Date(rec.timestamp))}`,
      icon: <Star color="warning" />,
      type: 'recommendation' as const,
      pdfId: rec.pdfId,
      reason: rec.reason
    }))
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Skeleton height={100} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={600} gutterBottom>
          Bonjour, {user?.username || 'Étudiant'} ! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Continuez votre apprentissage avec vos cours personnalisés.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statsCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      backgroundColor: stat.color,
                      width: 56,
                      height: 56,
                      mr: 2,
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h4" fontWeight={600}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.title}
                    </Typography>
                  </Box>
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Progress by Subject */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Progression par matière
              </Typography>
              <Box sx={{ mt: 3 }}>
                {progress?.bySubject?.map((subject, index) => (
                  <Box key={index} sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {subject.subject}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {subject.progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={subject.progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                        },
                      }}
                    />
                  </Box>
                )) || null}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Activité récente
              </Typography>
              <Box sx={{ mt: 3 }}>
                {recentActivity.map((activity, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: index < recentActivity.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/pdf/${activity.pdfId}/${activity.type === 'recommendation' ? 'quiz' : 'chat'}`)}
                  >
                    <Avatar sx={{ mr: 2, backgroundColor: 'transparent' }}>
                      {activity.icon}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body1" fontWeight={500}>
                        {activity.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.time}
                      </Typography>
                      {activity.type === 'recommendation' && (
                        <Typography variant="body2" color="info.main" sx={{ mt: 0.5 }}>
                          {activity.reason}
                        </Typography>
                      )}
                    </Box>
                    {activity.score && (
                      <Chip
                        label={`${activity.score}%`}
                        color="success"
                        size="small"
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;