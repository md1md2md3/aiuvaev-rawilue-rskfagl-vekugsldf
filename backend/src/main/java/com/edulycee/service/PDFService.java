package com.edulycee.service;

import com.edulycee.entity.PDF;
import com.edulycee.repository.PDFRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.IOException;
import java.util.List;

@Service
public class PDFService {

    @Autowired
    private PDFRepository pdfRepository;

    @Autowired
    private WebClient webClient;

    public String extractContent(Long pdfId) {
        PDF pdf = pdfRepository.findById(pdfId)
                .orElseThrow(() -> new RuntimeException("PDF not found"));

        try {
            // Download PDF from download link
            byte[] pdfBytes = webClient.get()
                    .uri(pdf.getDownloadLink())
                    .retrieve()
                    .bodyToMono(byte[].class)
                    .block();

            if (pdfBytes == null) {
                throw new RuntimeException("Failed to download PDF");
            }

            // Extract text content using PDFBox
            try (PDDocument document = PDDocument.load(pdfBytes)) {
                PDFTextStripper stripper = new PDFTextStripper();
                return stripper.getText(document);
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process PDF: " + e.getMessage(), e);
        }
    }

    public List<String> getAllCategories() {
        return pdfRepository.findDistinctCategories();
    }

    public Page<PDF> getPDFsByCategory(String category, Pageable pageable) {
        return pdfRepository.findByCategory(category, pageable);
    }

    public PDF findById(Long id) {
        return pdfRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("PDF not found"));
    }

    public List<PDF> findByCategory(String category) {
        return pdfRepository.findByCategory(category);
    }

    public Page<PDF> getAllPDFs(Pageable pageable) {
        return pdfRepository.findAll(pageable);
    }

    public Page<PDF> searchPDFs(String query, String category, Pageable pageable) {
        return pdfRepository.searchByTitleAndCategory(query, category, pageable);
    }
}