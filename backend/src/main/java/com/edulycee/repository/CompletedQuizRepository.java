package com.edulycee.repository;

import com.edulycee.entity.CompletedQuiz;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CompletedQuizRepository extends JpaRepository<CompletedQuiz, Long> {
    Optional<CompletedQuiz> findByQuizHistoryId(Long quizHistoryId);
}
