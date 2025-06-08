package com.edulycee.repository;

import com.edulycee.entity.StudiedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudiedDocumentRepository extends JpaRepository<StudiedDocument, Long> {
    List<StudiedDocument> findByUserIdOrderByLastAccessedDesc(Long userId);

    Optional<StudiedDocument> findByUserIdAndPdfId(Long userId, Long pdfId);
}
