package com.edulycee.dto;

import java.util.List;

public class ChatResponse {
    private String response;
    private List<String> suggestedFollowUp;

    // Constructors
    public ChatResponse() {}

    public ChatResponse(String response) {
        this.response = response;
    }

    public ChatResponse(String response, List<String> suggestedFollowUp) {
        this.response = response;
        this.suggestedFollowUp = suggestedFollowUp;
    }

    // Getters and Setters
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public List<String> getSuggestedFollowUp() { return suggestedFollowUp; }
    public void setSuggestedFollowUp(List<String> suggestedFollowUp) { this.suggestedFollowUp = suggestedFollowUp; }
}