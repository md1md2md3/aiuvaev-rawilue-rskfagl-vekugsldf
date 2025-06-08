package com.edulycee.controller;

import com.edulycee.dto.PDFResponse;
import com.edulycee.entity.PDF;
import com.edulycee.service.PDFService;
import com.edulycee.service.StudiedDocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pdfs")
@CrossOrigin("*")
public class PDFController {
    private final PDFService pdfService;
    private final StudiedDocumentService studiedDocumentService;

    @Autowired
    public PDFController(PDFService pdfService, StudiedDocumentService studiedDocumentService) {
        this.pdfService = pdfService;
        this.studiedDocumentService = studiedDocumentService;
    }

    @GetMapping("/categories")
    public ResponseEntity<Map<String, List<String>>> getCategories() {
        List<String> categories = pdfService.getAllCategories();
        Map<String, List<String>> response = new HashMap<>();
        response.put("categories", categories);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<PDFResponse> getPDFs(
            @RequestParam String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<PDF> pdfPage = category == null || category.trim().isEmpty() ? pdfService.getAllPDFs(pageable)
                : pdfService.getPDFsByCategory(category, pageable);

        List<PDFResponse.PDFInfo> pdfInfos = pdfPage.getContent().stream()
                .map(pdf -> new PDFResponse.PDFInfo(
                        pdf.getId(),
                        pdf.getTitle(),
                        pdf.getCategory(),
                        pdf.getDownloadLink()))
                .collect(Collectors.toList());

        PDFResponse response = new PDFResponse(
                pdfInfos,
                pdfPage.getTotalPages(),
                page);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/content")
    public ResponseEntity<Map<String, String>> getPDFContent(@PathVariable Long id) {
        try {
            String content = pdfService.extractContent(id);
            Map<String, String> response = new HashMap<>();
            response.put("content", content);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{pdfId}/viewed")
    public ResponseEntity<Void> trackDocumentView(
            @PathVariable Long pdfId,
            @RequestParam Long userId) {
        studiedDocumentService.trackDocumentView(userId, pdfId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<PDFResponse> searchPDFs(
            @RequestParam String q,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Ensure minimum page size of 1
        int validatedSize = Math.max(1, size);
        Pageable pageable = PageRequest.of(page, validatedSize);
        Page<PDF> pdfPage = pdfService.searchPDFs(q, category, pageable);

        List<PDFResponse.PDFInfo> pdfInfos = pdfPage.getContent().stream()
                .map(pdf -> new PDFResponse.PDFInfo(
                        pdf.getId(),
                        pdf.getTitle(),
                        pdf.getCategory(),
                        pdf.getDownloadLink()))
                .collect(Collectors.toList());

        PDFResponse response = new PDFResponse(
                pdfInfos,
                pdfPage.getTotalPages(),
                page);

        return ResponseEntity.ok(response);
    }
}