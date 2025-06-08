export interface User {
  userId: number;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  userId: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}

export interface PDF {
  id: number;
  title: string;
  category: string;
  downloadLink: string;
  createdAt: string;
  lastAccessed: string;
}

export interface PDFsResponse {
  pdfs: PDF[];
  totalPages: number;
  currentPage: number;
}

export interface CategoriesResponse {
  categories: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
  suggestedFollowUp?: string[];
}

export interface ChatRequest {
  pdfId: number;
  message: string;
}

export interface ChatResponse {
  response: string;
  suggestedFollowUp: string[];
}

export interface MCQQuestion {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
  explanation: string;
}

export interface MCQGenerationRequest {
  pdfId: number;
  questionCount: number;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export interface MCQResponse {
  questions: MCQQuestion[];
}

export interface MCQAnswer {
  questionId: number;
  selectedOption: number;
}

export interface MCQExplanation {
  questionId: number;
  explanation: string;
}

export interface PDFRecommendation {
  pdfId: number;
  title: string;
  reason: string;
}

export interface MCQSubmissionResult {
  score: number;
  explanations: MCQExplanation[];
  recommendations: PDFRecommendation[];
}

export interface UserProgress {
  userId: number;
  quizzesTaken: number;
  quizzesTakenThisMonth: number;
  averageScore: number;
  scoreChangeThisMonth: number;
  bySubject: Array<{
    subject: string;
    progress: number;
  }>;
}

export interface QuizSession {
  questions: MCQQuestion[];
  currentQuestionIndex: number;
  answers: MCQAnswer[];
  timeStarted: Date;
  isSubmitted: boolean;
}

export interface Recommendation {
  pdfId: number;
  title: string;
  reason: string;
  category: string;
  timestamp: string;
}

export interface QuizHistory {
  id: number;
  pdfId: number;
  score: number;
  questionCount: number;
  completedAt: string;
  difficulty: string;
  timeTakenSeconds: number;
}