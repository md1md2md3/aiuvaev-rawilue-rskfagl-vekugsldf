package com.edulycee.service;

import com.edulycee.entity.StudiedDocument;
import com.edulycee.repository.StudiedDocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StudiedDocumentService {
    private final StudiedDocumentRepository studiedDocumentRepository;

    @Autowired
    public StudiedDocumentService(StudiedDocumentRepository studiedDocumentRepository) {
        this.studiedDocumentRepository = studiedDocumentRepository;
    }

    @Transactional
    public void trackDocumentView(Long userId, Long pdfId) {
        StudiedDocument studiedDocument = studiedDocumentRepository
                .findByUserIdAndPdfId(userId, pdfId)
                .orElse(new StudiedDocument());

        if (studiedDocument.getId() == null) {
            studiedDocument.setUserId(userId);
            studiedDocument.setPdfId(pdfId);
            studiedDocument.setViewCount(0);
        }

        studiedDocument.setLastAccessed(LocalDateTime.now());
        studiedDocument.setViewCount(studiedDocument.getViewCount() + 1);
        studiedDocumentRepository.save(studiedDocument);
    }

    public List<StudiedDocument> getUserStudiedDocuments(Long userId) {
        return studiedDocumentRepository.findByUserIdOrderByLastAccessedDesc(userId);
    }
}
