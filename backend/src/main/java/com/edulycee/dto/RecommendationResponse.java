package com.edulycee.dto;

public class RecommendationResponse {
    private Long pdfId;
    private String title;
    private String reason;
    private String category;
    private String timestamp;

    public RecommendationResponse() {
    }

    public RecommendationResponse(Long pdfId, String title, String reason, String category, String timestamp) {
        this.pdfId = pdfId;
        this.title = title;
        this.reason = reason;
        this.category = category;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public Long getPdfId() {
        return pdfId;
    }

    public void setPdfId(Long pdfId) {
        this.pdfId = pdfId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
