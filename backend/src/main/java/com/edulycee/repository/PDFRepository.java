package com.edulycee.repository;

import com.edulycee.entity.PDF;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PDFRepository extends JpaRepository<PDF, Long> {
    Page<PDF> findByCategory(String category, Pageable pageable);

    @Query("SELECT DISTINCT p.category FROM PDF p ORDER BY p.category")
    List<String> findDistinctCategories();

    List<PDF> findByCategory(String category);

    @Query("SELECT p FROM PDF p WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) AND (:category IS NULL OR :category = '' OR p.category = :category)")
    Page<PDF> searchByTitleAndCategory(String query, String category, Pageable pageable);
}