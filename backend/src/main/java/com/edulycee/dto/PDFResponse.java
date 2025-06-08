package com.edulycee.dto;

import java.util.List;

public class PDFResponse {
    private List<PDFInfo> pdfs;
    private int totalPages;
    private int currentPage;

    // Constructors
    public PDFResponse() {}

    public PDFResponse(List<PDFInfo> pdfs, int totalPages, int currentPage) {
        this.pdfs = pdfs;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
    }

    // Getters and Setters
    public List<PDFInfo> getPdfs() { return pdfs; }
    public void setPdfs(List<PDFInfo> pdfs) { this.pdfs = pdfs; }

    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }

    public int getCurrentPage() { return currentPage; }
    public void setCurrentPage(int currentPage) { this.currentPage = currentPage; }

    public static class PDFInfo {
        private Long id;
        private String title;
        private String category;
        private String downloadLink;

        // Constructors
        public PDFInfo() {}

        public PDFInfo(Long id, String title, String category, String downloadLink) {
            this.id = id;
            this.title = title;
            this.category = category;
            this.downloadLink = downloadLink;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getDownloadLink() { return downloadLink; }
        public void setDownloadLink(String downloadLink) { this.downloadLink = downloadLink; }
    }
}