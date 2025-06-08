package com.edulycee.dto;

import java.util.List;

public class MCQSubmissionResult {
    private double score;
    private List<MCQExplanation> explanations;
    private List<PDFRecommendation> recommendations;

    // Constructors
    public MCQSubmissionResult() {}

    public MCQSubmissionResult(double score, List<MCQExplanation> explanations, List<PDFRecommendation> recommendations) {
        this.score = score;
        this.explanations = explanations;
        this.recommendations = recommendations;
    }

    // Getters and Setters
    public double getScore() { return score; }
    public void setScore(double score) { this.score = score; }

    public List<MCQExplanation> getExplanations() { return explanations; }
    public void setExplanations(List<MCQExplanation> explanations) { this.explanations = explanations; }

    public List<PDFRecommendation> getRecommendations() { return recommendations; }
    public void setRecommendations(List<PDFRecommendation> recommendations) { this.recommendations = recommendations; }

    public static class MCQExplanation {
        private Long questionId;
        private String explanation;

        // Constructors
        public MCQExplanation() {}

        public MCQExplanation(Long questionId, String explanation) {
            this.questionId = questionId;
            this.explanation = explanation;
        }

        // Getters and Setters
        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }

    public static class PDFRecommendation {
        private Long pdfId;
        private String title;
        private String reason;

        // Constructors
        public PDFRecommendation() {}

        public PDFRecommendation(Long pdfId, String title, String reason) {
            this.pdfId = pdfId;
            this.title = title;
            this.reason = reason;
        }

        // Getters and Setters
        public Long getPdfId() { return pdfId; }
        public void setPdfId(Long pdfId) { this.pdfId = pdfId; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}