import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Button,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  ContentCopy,
  ThumbUp,
  ThumbDown,
} from '@mui/icons-material';
import { usePDF } from '../../contexts/PDFContext';
import { apiService } from '../../services/api';
import { ChatMessage, ChatRequest } from '../../types';

const ChatInterface: React.FC = () => {
  const {
    currentPDF,
    chatMessages,
    setChatMessages,
    addChatMessage,
    pdfContent,
  } = usePDF();
  
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || !currentPDF || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    addChatMessage(userMessage);
    setInputMessage('');
    setLoading(true);
    setError('');

    try {
      const request: ChatRequest = {
        pdfId: currentPDF.id,
        message: inputMessage.trim(),
      };

      const response = await apiService.chatWithPDF(request);

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        suggestedFollowUp: response.suggestedFollowUp,
      };

      addChatMessage(aiMessage);
    } catch (err) {
      setError('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedFollowUp = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" fontWeight={600}>
          Discussion avec l'IA
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {currentPDF?.title || 'Aucun document sélectionné'}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Messages */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
        {chatMessages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SmartToy sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Commencez une conversation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Posez des questions sur le contenu du document
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                'Résumez ce document',
                'Quels sont les points clés ?',
                'Expliquez le concept principal',
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  size="small"
                  onClick={() => handleSuggestedFollowUp(suggestion)}
                  sx={{ textTransform: 'none' }}
                >
                  {suggestion}
                </Button>
              ))}
            </Box>
          </Box>
        ) : (
          chatMessages.map((message) => (
            <Box key={message.id} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                  flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: message.type === 'user' ? 'primary.main' : 'secondary.main',
                    width: 32,
                    height: 32,
                  }}
                >
                  {message.type === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                
                <Paper
                  sx={{
                    p: 2,
                    maxWidth: '80%',
                    backgroundColor: message.type === 'user' ? 'primary.main' : 'grey.100',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.content}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="caption" sx={{ opacity: 0.7 }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleCopyMessage(message.content)}
                        sx={{ color: message.type === 'user' ? 'white' : 'text.secondary' }}
                      >
                        <ContentCopy fontSize="small" />
                      </IconButton>
                      {message.type === 'ai' && (
                        <>
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <IconButton size="small" sx={{ color: 'text.secondary' }}>
                            <ThumbDown fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>
                </Paper>
              </Box>

              {/* Suggested Follow-ups */}
              {message.type === 'ai' && message.suggestedFollowUp && message.suggestedFollowUp.length > 0 && (
                <Box sx={{ mt: 2, ml: 5 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Questions suggérées :
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {message.suggestedFollowUp.map((suggestion, index) => (
                      <Chip
                        key={index}
                        label={suggestion}
                        variant="outlined"
                        size="small"
                        onClick={() => handleSuggestedFollowUp(suggestion)}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ))
        )}
        
        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ backgroundColor: 'secondary.main', width: 32, height: 32 }}>
              <SmartToy />
            </Avatar>
            <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" color="text.secondary">
                L'IA réfléchit...
              </Typography>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      {/* Input */}
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Posez votre question..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || !currentPDF}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || loading || !currentPDF}
            sx={{ alignSelf: 'flex-end' }}
          >
            <Send />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default ChatInterface;