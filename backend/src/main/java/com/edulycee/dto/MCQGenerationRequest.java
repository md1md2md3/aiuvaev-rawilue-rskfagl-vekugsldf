package com.edulycee.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public class MCQGenerationRequest {
    @NotNull
    private Long pdfId;

    @Min(1)
    @Max(20)
    private int questionCount = 5;

    @Pattern(regexp = "EASY|MEDIUM|HARD", message = "Difficulty must be EASY, MEDIUM, or HARD")
    private String difficulty = "MEDIUM";

    // Constructors
    public MCQGenerationRequest() {}

    public MCQGenerationRequest(Long pdfId, int questionCount, String difficulty) {
        this.pdfId = pdfId;
        this.questionCount = questionCount;
        this.difficulty = difficulty;
    }

    // Getters and Setters
    public Long getPdfId() { return pdfId; }
    public void setPdfId(Long pdfId) { this.pdfId = pdfId; }

    public int getQuestionCount() { return questionCount; }
    public void setQuestionCount(int questionCount) { this.questionCount = questionCount; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }
}