package com.edulycee.repository;

import com.edulycee.entity.UserProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface UserProgressRepository extends JpaRepository<UserProgress, Long> {
    List<UserProgress> findByUserId(Long userId);
    
    @Query("SELECT COUNT(up) FROM UserProgress up WHERE up.userId = :userId")
    Long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT AVG(up.score) FROM UserProgress up WHERE up.userId = :userId")
    Double getAverageScoreByUserId(@Param("userId") Long userId);
}