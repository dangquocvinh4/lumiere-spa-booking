package com.dangquocvinh.workflow_backend.chatbot.service;

import com.dangquocvinh.workflow_backend.catalog.entity.SpaService;
import com.dangquocvinh.workflow_backend.catalog.repository.SpaServiceRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ChatbotService {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final SpaServiceRepository spaServiceRepository;
    private final RestTemplate restTemplate;

    public ChatbotService(SpaServiceRepository spaServiceRepository) {
        this.spaServiceRepository = spaServiceRepository;
        this.restTemplate = new RestTemplate();
    }

    public String getChatbotResponse(String userMessage) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.equals("REPLACE_ME_WITH_YOUR_GEMINI_API_KEY")) {
            return "Xin lỗi, tính năng Chatbot đang được bảo trì do thiếu cấu hình API Key. Vui lòng liên hệ Admin.";
        }

        try {
            // 1. Prepare Context (List of Services)
            List<SpaService> services = spaServiceRepository.findAll();
            String servicesContext = services.stream()
                    .map(s -> String.format("- %s: %s VNĐ (%d phút). Thuộc loại: %s. Mô tả: %s", 
                            s.getName(), s.getPrice().toString(), s.getDurationMinutes(), s.getCategory(), s.getDescription()))
                    .collect(Collectors.joining("\n"));

            String systemPrompt = "Bạn là trợ lý ảo AI chuyên nghiệp của Lumière Spa. "
                    + "Luôn xưng hô là 'Lumière' hoặc 'em' và gọi khách là 'bạn' hoặc 'anh/chị'. "
                    + "Hãy tư vấn lịch sự, ngắn gọn và hữu ích dựa trên danh sách dịch vụ sau đây của Spa:\n"
                    + servicesContext + "\n\n"
                    + "Câu hỏi của khách hàng: " + userMessage;

            // 2. Call Gemini API
            String url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + apiKey;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", systemPrompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(parts));

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            Map<String, Object> response = restTemplate.postForObject(url, entity, Map.class);

            // 3. Parse Response
            if (response != null && response.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                    if (!resParts.isEmpty()) {
                        return (String) resParts.get(0).get("text");
                    }
                }
            }
            return "Xin lỗi, em không thể xử lý câu hỏi này lúc này. Bạn vui lòng gọi Hotline nhé!";
        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API", e);
            return "Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng thử lại sau.";
        }
    }
}
