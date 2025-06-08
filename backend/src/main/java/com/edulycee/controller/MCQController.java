package com.edulycee.controller;

import com.edulycee.dto.MCQSubmissionRequest;
import com.edulycee.dto.MCQSubmissionResult;
import com.edulycee.entity.CompletedQuiz;
import com.edulycee.entity.MCQQuestion;
import com.edulycee.entity.QuizHistory;
import com.edulycee.repository.CompletedQuizRepository;
import com.edulycee.repository.QuizHistoryRepository;
import com.edulycee.service.MCQService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pdfs")
@CrossOrigin("*")
public class MCQController {

    @Autowired
    private MCQService mcqService;

    @Autowired
    private QuizHistoryRepository quizHistoryRepository;

    @Autowired
    private CompletedQuizRepository completedQuizRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @PostMapping("/{id}/mcq/submit")
    public ResponseEntity<MCQSubmissionResult> submitMCQ(
            @PathVariable Long id,
            @Valid @RequestBody MCQSubmissionRequest request) {

        // For simplicity, we'll use a mock user ID. In a real implementation,
        // you would extract the user ID from the authenticated user
        Long userId = 1L; // This should be extracted from
                          // SecurityContextHolder.getContext().getAuthentication()

        try {
            MCQSubmissionResult result = mcqService.submitAnswers(userId, id, request.getAnswers(),
                    request.getTimeTakenSeconds());

            try {
                // Find the most recent quiz history for this user and PDF
                List<QuizHistory> quizHistories = quizHistoryRepository
                        .findByUserIdAndPdfIdOrderByCompletedAtDesc(userId, id);
                if (!quizHistories.isEmpty()) {
                    QuizHistory latestQuiz = quizHistories.get(0);

                    // Create and save the completed quiz data
                    CompletedQuiz completedQuiz = new CompletedQuiz();
                    completedQuiz.setQuizHistoryId(latestQuiz.getId());
                    completedQuiz.setQuestionData(objectMapper.writeValueAsString(request.getQuestions()));
                    completedQuizRepository.save(completedQuiz);
                }
            } catch (JsonProcessingException e) {
                // Log the error but return the result anyway since the quiz submission was
                // successful
                e.printStackTrace();
            }

            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{pdfId}/quiz-history")
    public ResponseEntity<List<QuizHistory>> getQuizHistoryForPdf(@PathVariable Long pdfId) {
        // For simplicity, we'll use a mock user ID. In a real implementation,
        // you would extract the user ID from the authenticated user
        Long userId = 1L;

        List<QuizHistory> history = quizHistoryRepository.findByUserIdAndPdfIdOrderByCompletedAtDesc(userId, pdfId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/quiz-history")
    public ResponseEntity<List<QuizHistory>> getAllQuizHistory() {
        // For simplicity, we'll use a mock user ID. In a real implementation,
        // you would extract the user ID from the authenticated user
        Long userId = 1L;

        List<QuizHistory> history = quizHistoryRepository.findByUserIdOrderByCompletedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/quiz-history/{quizHistoryId}/questions")
    public ResponseEntity<?> getCompletedQuizQuestions(@PathVariable Long quizHistoryId) {
        return completedQuizRepository.findByQuizHistoryId(quizHistoryId)
                .map(quiz -> {
                    try {
                        return ResponseEntity.ok(objectMapper.readValue(quiz.getQuestionData(),
                                objectMapper.getTypeFactory().constructCollectionType(List.class, MCQQuestion.class)));
                    } catch (JsonProcessingException e) {
                        e.printStackTrace();
                        return ResponseEntity.internalServerError().build();
                    }
                })
                .orElse(ResponseEntity.notFound().build());
    }
}