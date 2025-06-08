package com.edulycee.controller;

import com.edulycee.entity.PDF;
import com.edulycee.dto.RecommendationResponse;
import com.edulycee.service.StudiedDocumentService;
import com.edulycee.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin("*")
public class UserController {

    @Autowired
    private StudiedDocumentService studiedDocumentService;

    @Autowired
    private RecommendationService recommendationService;

    @GetMapping("/{userId}/studied-documents")
    public ResponseEntity<List<PDF>> getStudiedDocuments(@PathVariable Long userId) {
        try {
            List<PDF> documents = studiedDocumentService.getUserStudiedDocuments(userId)
                    .stream()
                    .map(doc -> doc.getPdf())
                    .toList();
            return ResponseEntity.ok(documents);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{userId}/recommendations")
    public ResponseEntity<List<RecommendationResponse>> getRecommendations(@PathVariable Long userId) {
        try {
            List<RecommendationResponse> recommendations = recommendationService.getRecommendationsForUser(userId);
            return ResponseEntity.ok(recommendations);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
