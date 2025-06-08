package com.edulycee.repository;

import com.edulycee.entity.QuizHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface QuizHistoryRepository extends JpaRepository<QuizHistory, Long> {
    List<QuizHistory> findByUserIdOrderByCompletedAtDesc(Long userId);

    List<QuizHistory> findByUserIdAndPdfIdOrderByCompletedAtDesc(Long userId, Long pdfId);
}
