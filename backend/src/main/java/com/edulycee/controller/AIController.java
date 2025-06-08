package com.edulycee.controller;

import com.edulycee.dto.ChatRequest;
import com.edulycee.dto.ChatResponse;
import com.edulycee.dto.MCQGenerationRequest;
import com.edulycee.dto.MCQResponse;
import com.edulycee.entity.AIInteraction;
import com.edulycee.repository.AIInteractionRepository;
import com.edulycee.service.GeminiAIService;
import com.edulycee.service.MCQService;
import com.edulycee.service.PDFService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("*")
public class AIController {

    @Autowired
    private GeminiAIService aiService;

    @Autowired
    private PDFService pdfService;

    @Autowired
    private MCQService mcqService;

    @Autowired
    private AIInteractionRepository aiInteractionRepository;

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@Valid @RequestBody ChatRequest request) {
        try {
            String pdfContent = pdfService.extractContent(request.getPdfId());
            String response = aiService.chatWithPDF(pdfContent, request.getMessage());
            
            // Save interaction
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            Long userId = 1L; // Mock user ID - should be extracted from authenticated user
            
            AIInteraction interaction = new AIInteraction();
            interaction.setUserId(userId);
            interaction.setPdfId(request.getPdfId());
            interaction.setInteractionType("CHAT");
            interaction.setContent("Q: " + request.getMessage() + "\nA: " + response);
            aiInteractionRepository.save(interaction);

            // Generate suggested follow-up questions
            List<String> followUp = Arrays.asList(
                "Can you explain this in more detail?",
                "What are the key takeaways?",
                "How does this relate to other concepts?"
            );

            ChatResponse chatResponse = new ChatResponse(response, followUp);
            return ResponseEntity.ok(chatResponse);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/generate-mcq")
    public ResponseEntity<MCQResponse> generateMCQ(@Valid @RequestBody MCQGenerationRequest request) {
        try {
            MCQResponse response = mcqService.generateMCQs(
                request.getPdfId(),
                request.getQuestionCount(),
                request.getDifficulty()
            );
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}