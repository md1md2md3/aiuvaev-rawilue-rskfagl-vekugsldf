package com.edulycee.dto;

import java.util.List;

public class MCQResponse {
    private List<MCQQuestion> questions;

    // Constructors
    public MCQResponse() {}

    public MCQResponse(List<MCQQuestion> questions) {
        this.questions = questions;
    }

    // Getters and Setters
    public List<MCQQuestion> getQuestions() { return questions; }
    public void setQuestions(List<MCQQuestion> questions) { this.questions = questions; }

    public static class MCQQuestion {
        private Long id;
        private String text;
        private List<String> options;
        private int correctOption;
        private String explanation;

        // Constructors
        public MCQQuestion() {}

        public MCQQuestion(Long id, String text, List<String> options, int correctOption, String explanation) {
            this.id = id;
            this.text = text;
            this.options = options;
            this.correctOption = correctOption;
            this.explanation = explanation;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public List<String> getOptions() { return options; }
        public void setOptions(List<String> options) { this.options = options; }

        public int getCorrectOption() { return correctOption; }
        public void setCorrectOption(int correctOption) { this.correctOption = correctOption; }

        public String getExplanation() { return explanation; }
        public void setExplanation(String explanation) { this.explanation = explanation; }
    }
}