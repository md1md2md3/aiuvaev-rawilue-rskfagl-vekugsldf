package com.edulycee.repository;

import com.edulycee.entity.AIInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AIInteractionRepository extends JpaRepository<AIInteraction, Long> {
    List<AIInteraction> findByUserIdAndPdfId(Long userId, Long pdfId);
    List<AIInteraction> findByUserId(Long userId);
}