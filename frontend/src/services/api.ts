import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  CategoriesResponse,
  PDFsResponse,
  ChatRequest,
  ChatResponse,
  MCQGenerationRequest,
  MCQResponse,
  MCQAnswer,
  MCQSubmissionResult,
  UserProgress,
  PDF,
  QuizHistory,
  MCQQuestion
} from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      }
    });

    // Request interceptor for logging and adding auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log the request
      console.log('🚀 Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        headers: config.headers,
        data: config.data,
        params: config.params
      });
      
      return config;
    });

    // Response interceptor for logging and error handling
    this.api.interceptors.response.use(
      (response) => {
        // Log the successful response
        console.log('✅ Response:', {
          status: response.status,
          url: response.config.url,
          data: response.data
        });
        return response;
      },
      (error) => {
        // Log the error response
        console.error('❌ Error Response:', {
          status: error.response?.status,
          url: error.config?.url,
          data: error.response?.data,
          message: error.message
        });

        if (error.response?.status === 401) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          localStorage.removeItem('username');
          localStorage.removeItem('email');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', credentials);
    return response.data;
  }

  // PDF Management
  async getCategories(): Promise<string[]> {
    const response: AxiosResponse<CategoriesResponse> = await this.api.get('/pdfs/categories');
    return response.data.categories;
  }

  async getPDFs(category: string, page = 0, size = 12): Promise<PDFsResponse> {
    const response: AxiosResponse<PDFsResponse> = await this.api.get('/pdfs', {
      params: { category, page, size }
    });
    return response.data;
  }

  async getPDFContent(pdfId: number): Promise<string> {
    const response: AxiosResponse<{ content: string }> = await this.api.get(`/pdfs/${pdfId}/content`);
    return response.data.content;
  }

  async searchPDFs(query: string, category: string, page = 0, size = 12): Promise<PDFsResponse> {
    // Ensure size is at least 1
    const validatedSize = Math.max(1, size);
    const response: AxiosResponse<PDFsResponse> = await this.api.get(`/pdfs/search`, {
      params: { q: query, category, page, size: validatedSize }
    });
    return response.data;
  }

  // AI Interactions
  async chatWithPDF(request: ChatRequest): Promise<ChatResponse> {
    const response: AxiosResponse<ChatResponse> = await this.api.post('/ai/chat', request);
    return response.data;
  }

  async generateMCQ(request: MCQGenerationRequest): Promise<MCQResponse> {
    const response: AxiosResponse<MCQResponse> = await this.api.post('/ai/generate-mcq', request);
    return response.data;
  }

  // MCQ Submission  
  async submitMCQAnswers(pdfId: number, request: { answers: MCQAnswer[], timeTakenSeconds: number }): Promise<MCQSubmissionResult> {
    const response: AxiosResponse<MCQSubmissionResult> = await this.api.post(`/pdfs/${pdfId}/mcq/submit`, request);
    return response.data;
  }

  // Progress Tracking
  async getUserProgress(userId: number): Promise<UserProgress> {
    const response: AxiosResponse<UserProgress> = await this.api.get(`/progress/${userId}`);
    return response.data;
  }

  // User Document Management
  async getUserStudiedDocuments(userId: string): Promise<PDF[]> {
    const response = await this.api.get<PDF[]>(`/users/${userId}/studied-documents`);
    return response.data;
  }

  async getUserRecommendations(userId: string): Promise<{
    pdfId: number;
    title: string;
    reason: string;
    category: string;
    timestamp: string;
  }[]> {
    const response = await this.api.get(`/users/${userId}/recommendations`);
    return response.data;
  }

  async trackDocumentView(pdfId: number, userId: number): Promise<void> {
    await this.api.post(`/pdfs/${pdfId}/viewed`, { userId });
  }

  // Quiz History
  async getQuizHistory(): Promise<QuizHistory[]> {
    const response = await this.api.get<QuizHistory[]>('/quizzes/history');
    return response.data;
  }

  async getQuizHistoryForPDF(pdfId: number): Promise<QuizHistory[]> {
    const response = await this.api.get<QuizHistory[]>(`/quizzes/history/${pdfId}`);
    return response.data;
  }

  async getQuizQuestions(quizHistoryId: number): Promise<MCQQuestion[]> {
    const response = await this.api.get<MCQQuestion[]>(`/pdfs/quiz-history/${quizHistoryId}/questions`);
    return response.data;
  }
}

export const apiService = new ApiService();