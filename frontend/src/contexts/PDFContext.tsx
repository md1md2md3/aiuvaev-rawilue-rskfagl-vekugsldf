import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PDF, ChatMessage, QuizSession } from '../types';

interface PDFContextType {
  currentPDF: PDF | null;
  setCurrentPDF: (pdf: PDF | null) => void;
  chatMessages: ChatMessage[];
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  quizSession: QuizSession | null;
  setQuizSession: (session: QuizSession | null) => void;
  pdfContent: string;
  setPDFContent: (content: string) => void;
}

const PDFContext = createContext<PDFContextType | undefined>(undefined);

export const usePDF = () => {
  const context = useContext(PDFContext);
  if (context === undefined) {
    throw new Error('usePDF must be used within a PDFProvider');
  }
  return context;
};

interface PDFProviderProps {
  children: ReactNode;
}

export const PDFProvider: React.FC<PDFProviderProps> = ({ children }) => {
  const [currentPDF, setCurrentPDF] = useState<PDF | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [quizSession, setQuizSession] = useState<QuizSession | null>(null);
  const [pdfContent, setPDFContent] = useState<string>('');

  const addChatMessage = (message: ChatMessage) => {
    setChatMessages(prev => [...prev, message]);
  };

  const value: PDFContextType = {
    currentPDF,
    setCurrentPDF,
    chatMessages,
    setChatMessages,
    addChatMessage,
    quizSession,
    setQuizSession,
    pdfContent,
    setPDFContent,
  };

  return <PDFContext.Provider value={value}>{children}</PDFContext.Provider>;
};