package com.edulycee.service;

import com.edulycee.dto.RecommendationResponse;
import com.edulycee.entity.UserProgress;
import com.edulycee.entity.PDF;
import com.edulycee.repository.UserProgressRepository;
import com.edulycee.repository.PDFRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.ArrayList;
import java.time.LocalDateTime;

@Service
public class RecommendationService {

    @Autowired
    private UserProgressRepository progressRepository;

    @Autowired
    private PDFRepository pdfRepository;

    @Autowired
    private ObjectMapper objectMapper;

    public List<RecommendationResponse> getRecommendationsForUser(Long userId) {
        List<UserProgress> userProgresses = progressRepository.findByUserId(userId);
        List<RecommendationResponse> recommendations = new ArrayList<>();

        for (UserProgress progress : userProgresses) {
            try {
                List<Long> recommendedPdfIds = objectMapper.readValue(
                        progress.getRecommendations(),
                        new TypeReference<List<Long>>() {
                        });

                for (Long pdfId : recommendedPdfIds) {
                    PDF pdf = pdfRepository.findById(pdfId).orElse(null);
                    if (pdf != null) {
                        RecommendationResponse recommendation = new RecommendationResponse(
                                pdf.getId(),
                                pdf.getTitle(),
                                "Based on your performance in related content",
                                pdf.getCategory(),
                                progress.getCompletedAt().toString());
                        recommendations.add(recommendation);
                    }
                }
            } catch (Exception e) {
                // Skip malformed recommendations
                continue;
            }
        }

        return recommendations;
    }
}
