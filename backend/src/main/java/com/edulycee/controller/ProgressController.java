package com.edulycee.controller;

import com.edulycee.dto.ProgressResponse;
import com.edulycee.service.ProgressService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/progress")
@CrossOrigin("*")
public class ProgressController {

    @Autowired
    private ProgressService progressService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProgressResponse> getUserProgress(@PathVariable Long userId) {
        try {
            ProgressResponse response = progressService.getUserProgress(userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}