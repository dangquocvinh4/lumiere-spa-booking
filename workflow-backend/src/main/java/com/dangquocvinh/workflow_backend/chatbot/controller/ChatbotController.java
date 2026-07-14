package com.dangquocvinh.workflow_backend.chatbot.controller;

import com.dangquocvinh.workflow_backend.chatbot.dto.ChatRequest;
import com.dangquocvinh.workflow_backend.chatbot.dto.ChatResponse;
import com.dangquocvinh.workflow_backend.chatbot.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String reply = chatbotService.getChatbotResponse(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(reply));
    }
}
