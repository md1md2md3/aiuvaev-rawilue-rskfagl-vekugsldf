package com.edulycee.controller;

import com.edulycee.entity.QuizHistory;
import com.edulycee.repository.QuizHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quizzes")
@CrossOrigin("*")
public class QuizHistoryController {

    @Autowired
    private QuizHistoryRepository quizHistoryRepository;

    @GetMapping("/history")
    public ResponseEntity<List<QuizHistory>> getQuizHistory() {
        // For simplicity, we'll use a mock user ID. In a real implementation,
        // you would extract the user ID from the authenticated user
        Long userId = 1L;

        List<QuizHistory> history = quizHistoryRepository.findByUserIdOrderByCompletedAtDesc(userId);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/history/{pdfId}")
    public ResponseEntity<List<QuizHistory>> getQuizHistoryForPdf(@PathVariable Long pdfId) {
        // For simplicity, we'll use a mock user ID. In a real implementation,
        // you would extract the user ID from the authenticated user
        Long userId = 1L;

        List<QuizHistory> history = quizHistoryRepository.findByUserIdAndPdfIdOrderByCompletedAtDesc(userId, pdfId);
        return ResponseEntity.ok(history);
    }
}
