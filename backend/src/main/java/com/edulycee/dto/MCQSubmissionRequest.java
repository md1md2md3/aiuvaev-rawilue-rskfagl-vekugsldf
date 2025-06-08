package com.edulycee.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import com.edulycee.dto.MCQResponse.MCQQuestion;

public class MCQSubmissionRequest {
    @NotNull
    private List<MCQAnswer> answers;

    private Integer timeTakenSeconds;

    private List<MCQQuestion> questions;

    // Constructors
    public MCQSubmissionRequest() {
    }

    public MCQSubmissionRequest(List<MCQAnswer> answers, Integer timeTakenSeconds, List<MCQQuestion> questions) {
        this.answers = answers;
        this.timeTakenSeconds = timeTakenSeconds;
        this.questions = questions;
    }

    // Getters and Setters
    public List<MCQAnswer> getAnswers() {
        return answers;
    }

    public void setAnswers(List<MCQAnswer> answers) {
        this.answers = answers;
    }

    public Integer getTimeTakenSeconds() {
        return timeTakenSeconds;
    }

    public void setTimeTakenSeconds(Integer timeTakenSeconds) {
        this.timeTakenSeconds = timeTakenSeconds;
    }

    public List<MCQQuestion> getQuestions() {
        return questions;
    }

    public void setQuestions(List<MCQQuestion> questions) {
        this.questions = questions;
    }

    public static class MCQAnswer {
        @NotNull
        private Long questionId;

        @NotNull
        private Integer selectedOption;

        // Constructors
        public MCQAnswer() {
        }

        public MCQAnswer(Long questionId, Integer selectedOption) {
            this.questionId = questionId;
            this.selectedOption = selectedOption;
        }

        // Getters and Setters
        public Long getQuestionId() {
            return questionId;
        }

        public void setQuestionId(Long questionId) {
            this.questionId = questionId;
        }

        public Integer getSelectedOption() {
            return selectedOption;
        }

        public void setSelectedOption(Integer selectedOption) {
            this.selectedOption = selectedOption;
        }
    }
}