package com.edulycee.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_progress")
public class UserProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    private Long id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private Long userId;

    @NotNull
    @Column(name = "pdf_id", nullable = false)
    private Long pdfId;

    @NotNull
    @Column(nullable = false)
    private Integer score;

    @Column(length = 2000)
    private String recommendations; // JSON array of recommended PDF IDs

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = LocalDateTime.now();
    }

    // Constructors
    public UserProgress() {}

    public UserProgress(Long userId, Long pdfId, Integer score, String recommendations) {
        this.userId = userId;
        this.pdfId = pdfId;
        this.score = score;
        this.recommendations = recommendations;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Long getPdfId() { return pdfId; }
    public void setPdfId(Long pdfId) { this.pdfId = pdfId; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getRecommendations() { return recommendations; }
    public void setRecommendations(String recommendations) { this.recommendations = recommendations; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}