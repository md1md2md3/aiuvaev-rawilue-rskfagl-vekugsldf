package com.edulycee.service;

import com.edulycee.dto.ProgressResponse;
import com.edulycee.entity.PDF;
import com.edulycee.entity.UserProgress;
import com.edulycee.repository.PDFRepository;
import com.edulycee.repository.UserProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private PDFRepository pdfRepository;

    public ProgressResponse getUserProgress(Long userId) {
        // Get basic statistics
        Long quizzesTaken = progressRepository.countByUserId(userId);
        Double averageScore = progressRepository.getAverageScoreByUserId(userId);
        
        if (averageScore == null) {
            averageScore = 0.0;
        }

        // Get progress by subject (category)
        List<UserProgress> userProgresses = progressRepository.findByUserId(userId);
        Map<String, List<Integer>> scoresByCategory = new HashMap<>();

        for (UserProgress progress : userProgresses) {
            PDF pdf = pdfRepository.findById(progress.getPdfId()).orElse(null);
            if (pdf != null) {
                scoresByCategory.computeIfAbsent(pdf.getCategory(), k -> new ArrayList<>())
                    .add(progress.getScore());
            }
        }

        List<ProgressResponse.SubjectProgress> subjectProgresses = scoresByCategory.entrySet().stream()
            .map(entry -> {
                String category = entry.getKey();
                List<Integer> scores = entry.getValue();
                double avgScore = scores.stream().mapToInt(Integer::intValue).average().orElse(0.0);
                return new ProgressResponse.SubjectProgress(category, avgScore);
            })
            .collect(Collectors.toList());

        return new ProgressResponse(quizzesTaken, averageScore, subjectProgresses);
    }
}