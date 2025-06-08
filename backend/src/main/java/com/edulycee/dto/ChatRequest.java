package com.edulycee.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {
    @NotNull
    private Long pdfId;

    @NotBlank
    private String message;

    // Constructors
    public ChatRequest() {}

    public ChatRequest(Long pdfId, String message) {
        this.pdfId = pdfId;
        this.message = message;
    }

    // Getters and Setters
    public Long getPdfId() { return pdfId; }
    public void setPdfId(Long pdfId) { this.pdfId = pdfId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}