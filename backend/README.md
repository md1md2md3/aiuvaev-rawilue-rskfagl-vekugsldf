# EduLycée Backend

A comprehensive educational platform backend built with Spring Boot 3.x, featuring AI-powered PDF processing, MCQ generation, and progress tracking.

## Features

- **User Management**: Registration, authentication with JWT
- **PDF Management**: Category-based organization, content extraction
- **AI Integration**: Chat with PDFs, MCQ generation using Google Gemini AI
- **Assessment System**: Smart evaluation with detailed explanations
- **Progress Tracking**: User progress analytics and recommendations

## Technology Stack

- **Backend**: Spring Boot 3.x
- **Database**: SQLite with JPA/Hibernate
- **AI**: Google Gemini AI
- **Security**: JWT Authentication
- **PDF Processing**: Apache PDFBox

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd edulycee-backend
   ```

2. **Set up environment variables**
   ```bash
   export GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Run the application**
   ```bash
   ./gradlew bootRun
   ```

4. **Access the API**
   - Base URL: `http://localhost:8080`
   - Swagger UI: `http://localhost:8080/swagger-ui.html`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### PDF Management
- `GET /api/categories` - List all categories
- `GET /api/pdfs?category={category}` - List PDFs by category
- `GET /api/pdfs/{id}/content` - Extract PDF content

### AI Features
- `POST /api/ai/chat` - Chat with PDF content
- `POST /api/ai/generate-mcq` - Generate MCQ questions

### Assessment
- `POST /api/pdfs/{id}/mcq/submit` - Submit MCQ answers

### Progress
- `GET /api/progress/{userId}` - Get user progress statistics

## Configuration

Key configuration in `application.yml`:

```yaml
gemini:
  api:
    key: ${GEMINI_API_KEY}

spring:
  datasource:
    url: jdbc:sqlite:edulycee.db
```

## Database Schema

The application uses SQLite with the following main tables:
- `users` - User management
- `pdfs` - PDF metadata
- `mcq_questions` - Generated questions
- `user_progress` - Progress tracking
- `ai_interactions` - AI interaction history

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.