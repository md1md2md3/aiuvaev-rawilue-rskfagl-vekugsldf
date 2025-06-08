package com.edulycee.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.edulycee.dto.MCQResponse;
import com.edulycee.dto.MCQSubmissionRequest;
import com.edulycee.dto.MCQSubmissionResult;
import com.edulycee.entity.MCQQuestion;
import com.edulycee.entity.PDF;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiAIService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

    public String chatWithPDF(String pdfContent, String userQuery) {
        try {
            String prompt = String.format(
                    "You are a knowledgeable educational AI assistant. Based on the following PDF content, answer the user's question accurately and educationally.your answers must be in the same language the user speaks to you with.\n\nPDF Content:\n%s\n\nUser Question: %s\n\nProvide a clear, informative answer:",
                    truncateContent(pdfContent, 8000), userQuery);

            Map<String, Object> requestBody = createGeminiRequest(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            return extractTextFromGeminiResponse(response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to get AI response: " + e.getMessage(), e);
        }
    }

    public MCQResponse generateMCQ(String pdfContent, int questionCount, String difficulty) {
        try {
            String prompt = String.format(
                    """
                            Generate exactly %d multiple choice questions based on the following content and in the same language as the content. Each question should be %s difficulty level.

                            Content: %s

                            Return a JSON response with this exact structure:
                            {
                              "questions": [
                                {
                                  "text": "Question text here",
                                  "options": ["Option A", "Option B", "Option C", "Option D"],
                                  "correctOption": 0,
                                  "explanation": "Explanation of why this is correct"
                                }
                              ]
                            }

                            Make sure:
                            - Each question has exactly 4 options
                            - correctOption is a number from 0-3 (0=first option, 1=second, etc.)
                            - Questions are relevant to the content
                            - Options are plausible but only one is correct
                            """,
                    questionCount, difficulty.toLowerCase(), truncateContent(pdfContent, 6000));

            Map<String, Object> requestBody = createGeminiRequest(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            String jsonResponse = extractTextFromGeminiResponse(response.getBody());
            return parseMCQResponse(jsonResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate MCQ: " + e.getMessage(), e);
        }
    }

    public MCQSubmissionResult evaluateAndRecommend(String pdfContent, String currentTitle,
            List<MCQSubmissionRequest.MCQAnswer> answers, List<MCQQuestion> questions, List<PDF> availablePdfs) {
        try {
            StringBuilder answersStr = new StringBuilder();
            for (int i = 0; i < answers.size(); i++) {
                MCQSubmissionRequest.MCQAnswer answer = answers.get(i);
                answersStr.append(String.format("Q%d: Selected option %d\n", i + 1, answer.getSelectedOption()));
            }

            StringBuilder questionsStr = new StringBuilder();
            for (int i = 0; i < questions.size(); i++) {
                MCQQuestion q = questions.get(i);
                questionsStr.append(
                        String.format("Q%d: %s (Correct: %d)\n", i + 1, q.getQuestionText(), q.getCorrectOption()));
            }

            StringBuilder availableStr = new StringBuilder();
            for (PDF pdf : availablePdfs.subList(0, Math.min(5, availablePdfs.size()))) {
                availableStr.append(String.format("ID: %d, Title: %s\n", pdf.getId(), pdf.getTitle()));
            }

            String prompt = String.format(
                    """
                            Evaluate the student's quiz performance and provide recommendations and what course the student should take next.
                            Current course: %s
                            Student answers: %s
                            Correct answers: %s
                            Available courses: %s

                            Return JSON with this structure:
                            {
                              "score": 85.0,
                              "explanations": [
                                {
                                  "questionId": 1,
                                  "explanation": "Brief explanation for wrong answer"
                                }
                              ],
                              "recommendations": [
                                {
                                  "pdfId": 123,
                                  "title": "Course Title",
                                  "reason": "Why this course is recommended"
                                }
                              ]
                            }

                            Calculate score as percentage correct. Only include explanations for wrong answers.
                            Recommend up to 3 courses that would help improve understanding.
                            """,
                    currentTitle, answersStr.toString(), questionsStr.toString(), availableStr.toString());

            Map<String, Object> requestBody = createGeminiRequest(prompt);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String url = GEMINI_API_URL + "?key=" + apiKey;
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);

            String jsonResponse = extractTextFromGeminiResponse(response.getBody());
            return parseEvaluationResponse(jsonResponse);
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate answers: " + e.getMessage(), e);
        }
    }

    private Map<String, Object> createGeminiRequest(String prompt) {
        Map<String, Object> content = new HashMap<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);
        content.put("parts", List.of(part));

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", List.of(content));

        // Add generation config for better responses
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7);
        generationConfig.put("topK", 40);
        generationConfig.put("topP", 0.95);
        generationConfig.put("maxOutputTokens", 2048);
        requestBody.put("generationConfig", generationConfig);

        return requestBody;
    }

    private String extractTextFromGeminiResponse(String responseBody) throws JsonProcessingException {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode candidates = rootNode.get("candidates");

        if (candidates != null && candidates.isArray() && candidates.size() > 0) {
            JsonNode firstCandidate = candidates.get(0);
            JsonNode content = firstCandidate.get("content");
            if (content != null) {
                JsonNode parts = content.get("parts");
                if (parts != null && parts.isArray() && parts.size() > 0) {
                    JsonNode firstPart = parts.get(0);
                    JsonNode text = firstPart.get("text");
                    if (text != null) {
                        return text.asText();
                    }
                }
            }
        }

        throw new RuntimeException("Invalid response format from Gemini API");
    }

    private MCQResponse parseMCQResponse(String jsonResponse) {
        try {
            // Clean up the JSON response
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode rootNode = objectMapper.readTree(cleanJson);
            JsonNode questionsNode = rootNode.get("questions");

            List<MCQResponse.MCQQuestion> questions = new ArrayList<>();

            if (questionsNode != null && questionsNode.isArray()) {
                for (JsonNode questionNode : questionsNode) {
                    MCQResponse.MCQQuestion question = new MCQResponse.MCQQuestion();
                    question.setText(questionNode.get("text").asText());

                    List<String> options = new ArrayList<>();
                    JsonNode optionsNode = questionNode.get("options");
                    if (optionsNode.isArray()) {
                        for (JsonNode option : optionsNode) {
                            options.add(option.asText());
                        }
                    }
                    question.setOptions(options);
                    question.setCorrectOption(questionNode.get("correctOption").asInt());
                    question.setExplanation(questionNode.get("explanation").asText());

                    questions.add(question);
                }
            }

            return new MCQResponse(questions);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse MCQ response: " + e.getMessage(), e);
        }
    }

    private MCQSubmissionResult parseEvaluationResponse(String jsonResponse) {
        try {
            String cleanJson = jsonResponse.trim();
            if (cleanJson.startsWith("```json")) {
                cleanJson = cleanJson.substring(7);
            }
            if (cleanJson.endsWith("```")) {
                cleanJson = cleanJson.substring(0, cleanJson.length() - 3);
            }
            cleanJson = cleanJson.trim();

            JsonNode rootNode = objectMapper.readTree(cleanJson);

            double score = rootNode.get("score").asDouble();

            List<MCQSubmissionResult.MCQExplanation> explanations = new ArrayList<>();
            JsonNode explanationsNode = rootNode.get("explanations");
            if (explanationsNode != null && explanationsNode.isArray()) {
                for (JsonNode expNode : explanationsNode) {
                    MCQSubmissionResult.MCQExplanation explanation = new MCQSubmissionResult.MCQExplanation();
                    explanation.setQuestionId(expNode.get("questionId").asLong());
                    explanation.setExplanation(expNode.get("explanation").asText());
                    explanations.add(explanation);
                }
            }

            List<MCQSubmissionResult.PDFRecommendation> recommendations = new ArrayList<>();
            JsonNode recommendationsNode = rootNode.get("recommendations");
            if (recommendationsNode != null && recommendationsNode.isArray()) {
                for (JsonNode recNode : recommendationsNode) {
                    MCQSubmissionResult.PDFRecommendation recommendation = new MCQSubmissionResult.PDFRecommendation();
                    recommendation.setPdfId(recNode.get("pdfId").asLong());
                    recommendation.setTitle(recNode.get("title").asText());
                    recommendation.setReason(recNode.get("reason").asText());
                    recommendations.add(recommendation);
                }
            }

            return new MCQSubmissionResult(score, explanations, recommendations);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse evaluation response: " + e.getMessage(), e);
        }
    }

    private String truncateContent(String content, int maxLength) {
        if (content == null)
            return "";
        return content.length() > maxLength ? content.substring(0, maxLength) + "..." : content;
    }
}