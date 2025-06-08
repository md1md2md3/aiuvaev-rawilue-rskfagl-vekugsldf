package com.edulycee.dto;

import java.util.List;

public class ProgressResponse {
    private long quizzesTaken;
    private double averageScore;
    private List<SubjectProgress> bySubject;

    // Constructors
    public ProgressResponse() {}

    public ProgressResponse(long quizzesTaken, double averageScore, List<SubjectProgress> bySubject) {
        this.quizzesTaken = quizzesTaken;
        this.averageScore = averageScore;
        this.bySubject = bySubject;
    }

    // Getters and Setters
    public long getQuizzesTaken() { return quizzesTaken; }
    public void setQuizzesTaken(long quizzesTaken) { this.quizzesTaken = quizzesTaken; }

    public double getAverageScore() { return averageScore; }
    public void setAverageScore(double averageScore) { this.averageScore = averageScore; }

    public List<SubjectProgress> getBySubject() { return bySubject; }
    public void setBySubject(List<SubjectProgress> bySubject) { this.bySubject = bySubject; }

    public static class SubjectProgress {
        private String subject;
        private double progress;

        // Constructors
        public SubjectProgress() {}

        public SubjectProgress(String subject, double progress) {
            this.subject = subject;
            this.progress = progress;
        }

        // Getters and Setters
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }

        public double getProgress() { return progress; }
        public void setProgress(double progress) { this.progress = progress; }
    }
}