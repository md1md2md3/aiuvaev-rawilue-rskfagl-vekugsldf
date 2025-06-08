import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Tab,
  Tabs,
  IconButton,
  Typography,
  Toolbar,
  Breadcrumbs,
  Link,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  Chat,
  Quiz,
  Download,
  ArrowBack,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { usePDF } from '../../contexts/PDFContext';
import { apiService } from '../../services/api';
import ChatInterface from './ChatInterface';
import QuizInterface from '../Quiz/QuizInterface';
import { useAuth } from '../../contexts/AuthContext';

const PDFViewer: React.FC = () => {
  const { pdfId, mode } = useParams<{ pdfId: string; mode: 'chat' | 'quiz' }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentPDF,
    setCurrentPDF,
    setPDFContent,
    setChatMessages,
    setQuizSession,
  } = usePDF();
  
  const [activeTab, setActiveTab] = useState<'chat' | 'quiz'>(mode || 'chat');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    if (pdfId && (!currentPDF || currentPDF.id !== parseInt(pdfId))) {
      loadPDFContent();
    } else {
      setLoading(false);
    }
  }, [pdfId]);

  useEffect(() => {
    if (mode && mode !== activeTab) {
      setActiveTab(mode);
    }
  }, [mode]);

  const loadPDFContent = async () => {
    if (!pdfId) return;

    setLoading(true);
    setError('');

    try {
      // Load PDF content
      const content = await apiService.getPDFContent(parseInt(pdfId));
      setPDFContent(content);
      
      // Track document view
      if (user?.userId) {
        await apiService.trackDocumentView(parseInt(pdfId), user.userId);
      }
      
      // Reset chat and quiz state for new PDF
      setChatMessages([]);
      setQuizSession(null);
    } catch (err) {
      setError('Erreur lors du chargement du document');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: 'chat' | 'quiz') => {
    setActiveTab(newValue);
    navigate(`/pdf/${pdfId}/${newValue}`, { replace: true });
  };

  const handleDownload = () => {
    if (currentPDF) {
      const link = document.createElement('a');
      link.href = currentPDF.downloadLink;
      link.download = currentPDF.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const toggleFullscreen = () => {
    setFullscreen(!fullscreen);
  };

  if (loading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>
          Retour à la bibliothèque
        </Button>
      </Box>
    );
  }

  if (!currentPDF) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">Document non trouvé</Alert>
        <Button onClick={() => navigate('/library')} sx={{ mt: 2 }}>
          Retour à la bibliothèque
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        height: fullscreen ? '100vh' : 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
        position: fullscreen ? 'fixed' : 'relative',
        top: fullscreen ? 0 : 'auto',
        left: fullscreen ? 0 : 'auto',
        right: fullscreen ? 0 : 'auto',
        bottom: fullscreen ? 0 : 'auto',
        zIndex: fullscreen ? 9999 : 'auto',
        backgroundColor: 'background.default',
      }}
    >
      {/* Header */}
      <Toolbar sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
        <IconButton onClick={() => navigate('/library')} sx={{ mr: 2 }}>
          <ArrowBack />
        </IconButton>

        <Box sx={{ flex: 1 }}>
          <Breadcrumbs sx={{ mb: 0.5 }}>
            <Link color="inherit" href="/library">
              Bibliothèque
            </Link>
            <Typography color="text.primary" noWrap>
              {currentPDF.title.length > 50 
                ? `${currentPDF.title.substring(0, 50)}...` 
                : currentPDF.title
              }
            </Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleDownload} title="Télécharger">
            <Download />
          </IconButton>
          <IconButton onClick={toggleFullscreen} title={fullscreen ? "Quitter le plein écran" : "Plein écran"}>
            {fullscreen ? <FullscreenExit /> : <Fullscreen />}
          </IconButton>
        </Box>
      </Toolbar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} centered>
          <Tab
            icon={<Chat />}
            label="Discussion"
            value="chat"
            sx={{ textTransform: 'none', minHeight: 64 }}
          />
          <Tab
            icon={<Quiz />}
            label="Quiz"
            value="quiz"
            sx={{ textTransform: 'none', minHeight: 64 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        {activeTab === 'chat' && <ChatInterface />}
        {activeTab === 'quiz' && <QuizInterface />}
      </Box>
    </Box>
  );
};

export default PDFViewer;