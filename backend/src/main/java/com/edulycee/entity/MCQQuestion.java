package com.edulycee.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "mcq_questions")
public class MCQQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long id;

    @NotNull
    @Column(name = "pdf_id", nullable = false)
    private Long pdfId;

    @NotBlank
    @Column(name = "question_text", nullable = false, length = 1000)
    private String questionText;

    @NotBlank
    @Column(nullable = false, length = 2000)
    private String options; // JSON array of 4 options

    @NotNull
    @Column(name = "correct_option", nullable = false)
    private Integer correctOption; // 0-3 index

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Constructors
    public MCQQuestion() {
    }

    public MCQQuestion(Long pdfId, String questionText, String options, Integer correctOption, String difficulty) {
        this.pdfId = pdfId;
        this.questionText = questionText;
        this.options = options;
        this.correctOption = correctOption;
        this.difficulty = difficulty;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPdfId() {
        return pdfId;
    }

    public void setPdfId(Long pdfId) {
        this.pdfId = pdfId;
    }

    public String getQuestionText() {
        return questionText;
    }

    public void setQuestionText(String questionText) {
        this.questionText = questionText;
    }

    public String getOptions() {
        return options;
    }

    public void setOptions(String options) {
        this.options = options;
    }

    public Integer getCorrectOption() {
        return correctOption;
    }

    public void setCorrectOption(Integer correctOption) {
        this.correctOption = correctOption;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}