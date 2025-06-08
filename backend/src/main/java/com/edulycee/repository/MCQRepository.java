package com.edulycee.repository;

import com.edulycee.entity.MCQQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface MCQRepository extends JpaRepository<MCQQuestion, Long> {
    List<MCQQuestion> findByPdfId(Long pdfId);
    void deleteByPdfId(Long pdfId);
}