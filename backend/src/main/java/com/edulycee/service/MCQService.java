package com.edulycee.service;

import com.edulycee.dto.MCQResponse;
import com.edulycee.dto.MCQSubmissionRequest;
import com.edulycee.dto.MCQSubmissionResult;
import com.edulycee.entity.MCQQuestion;
import com.edulycee.entity.PDF;
import com.edulycee.entity.QuizHistory;
import com.edulycee.entity.UserProgress;
import com.edulycee.repository.MCQRepository;
import com.edulycee.repository.QuizHistoryRepository;
import com.edulycee.repository.UserProgressRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MCQService {

    @Autowired
    private GeminiAIService aiService;

    @Autowired
    private MCQRepository mcqRepository;

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private PDFService pdfService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private QuizHistoryRepository quizHistoryRepository;

    @Transactional
    public MCQResponse generateMCQs(Long pdfId, int questionCount, String difficulty) {
        // Clear existing questions for this PDF
        mcqRepository.deleteByPdfId(pdfId);

        // Get PDF content
        String pdfContent = pdfService.extractContent(pdfId);

        // Generate questions using AI
        MCQResponse response = aiService.generateMCQ(pdfContent, questionCount, difficulty);

        // Save questions to database
        List<MCQQuestion> savedQuestions = response.getQuestions().stream()
                .map(q -> {
                    MCQQuestion question = new MCQQuestion();
                    question.setPdfId(pdfId);
                    question.setQuestionText(q.getText());
                    try {
                        question.setOptions(objectMapper.writeValueAsString(q.getOptions()));
                    } catch (JsonProcessingException e) {
                        throw new RuntimeException("Failed to serialize options", e);
                    }
                    question.setCorrectOption(q.getCorrectOption());
                    question.setDifficulty(difficulty);
                    return mcqRepository.save(question);
                })
                .collect(Collectors.toList());

        // Update response with saved question IDs
        for (int i = 0; i < response.getQuestions().size(); i++) {
            response.getQuestions().get(i).setId(savedQuestions.get(i).getId());
        }

        return response;
    }

    @Transactional
    public MCQSubmissionResult submitAnswers(Long userId, Long pdfId, List<MCQSubmissionRequest.MCQAnswer> answers,
            Integer timeTakenSeconds) {
        // Get current PDF and its content
        PDF currentPdf = pdfService.findById(pdfId);
        String pdfContent = pdfService.extractContent(pdfId);

        // Get questions that were answered
        List<MCQQuestion> questions = mcqRepository.findAllById(
                answers.stream().map(MCQSubmissionRequest.MCQAnswer::getQuestionId).collect(Collectors.toList()));

        // Get other PDFs in same category for recommendations
        List<PDF> categoryPdfs = pdfService.findByCategory(currentPdf.getCategory())
                .stream()
                .filter(p -> !p.getId().equals(pdfId))
                .collect(Collectors.toList());

        // Let AI evaluate answers and make recommendations
        MCQSubmissionResult evaluation = aiService.evaluateAndRecommend(
                pdfContent,
                currentPdf.getTitle(),
                answers,
                questions,
                categoryPdfs);

        // Save progress with recommendations
        UserProgress progress = new UserProgress();
        progress.setUserId(userId);
        progress.setPdfId(pdfId);
        progress.setScore((int) Math.round(evaluation.getScore()));
        try {
            progress.setRecommendations(objectMapper.writeValueAsString(evaluation.getRecommendations()));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize recommendations", e);
        }
        progressRepository.save(progress);

        // Save quiz history
        QuizHistory quizHistory = new QuizHistory();
        quizHistory.setUserId(userId);
        quizHistory.setPdfId(pdfId);
        quizHistory.setPdfTitle(currentPdf.getTitle());
        quizHistory.setScore(evaluation.getScore());
        quizHistory.setQuestionCount(questions.size());
        quizHistory.setTimeTakenSeconds(timeTakenSeconds);
        quizHistory.setDifficulty(questions.get(0).getDifficulty()); // Get difficulty from first question
        quizHistory.setCorrectAnswers((int) Math.round((evaluation.getScore() / 100.0) * questions.size()));
        quizHistoryRepository.save(quizHistory);

        return evaluation;
    }
}