package com.edulycee.service;

import com.edulycee.entity.PDF;
import com.edulycee.repository.PDFRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
public class PDFImportService {

    @Autowired
    private PDFRepository pdfRepository;

    @PostConstruct
    public void importPDFs() {
        try {
            // Check if PDFs are already imported
            if (pdfRepository.count() > 0) {
                return; // Already imported
            }

            // Read JSON file from resources
            Resource resource = new ClassPathResource("alloschoolApi.json");
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(resource.getInputStream());

            // Convert JSON to PDF entities
            List<PDF> pdfs = new ArrayList<>();
            for (JsonNode node : root) {
                PDF pdf = new PDF();
                pdf.setTitle(node.get("title").asText().trim());
                pdf.setCategory(node.get("category").asText().trim());
                pdf.setDownloadLink(node.get("downloadLink").asText());
                pdfs.add(pdf);
            }

            // Save all PDFs to database
            pdfRepository.saveAll(pdfs);
            System.out.println("Successfully imported " + pdfs.size() + " PDFs");
        } catch (IOException e) {
            System.err.println("Failed to import PDFs: " + e.getMessage());
            // Don't throw exception to avoid breaking application startup
        }
    }
}