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
            log.error("Lỗi khi gọi Gemini API, chuyển sang chế độ phản hồi tự động dự phòng", e);
            return getFallbackResponse(userMessage);
        }
    }

    private String getFallbackResponse(String message) {
        if (message == null) return "Dạ, Lumière Spa có thể giúp gì cho anh/chị ạ?";
        String msg = message.toLowerCase();
        
        if (msg.contains("chào") || msg.contains("hello") || msg.contains("hi")) {
            return "Dạ em chào anh/chị! Lumière Spa có thể giúp gì cho anh/chị hôm nay ạ?";
        }
        if (msg.contains("dịch vụ") || msg.contains("liệu trình") || msg.contains("spa có gì")) {
            return "Dạ bên em có các dịch vụ nổi bật như: Massage Body Thụy Điển (350k), Chăm sóc da mặt chuyên sâu (500k), Gội đầu dưỡng sinh (150k) và Trị liệu cổ vai gáy chuyên sâu (250k) ạ. Anh/chị muốn tư vấn thêm về dịch vụ nào ạ?";
        }
        if (msg.contains("giá") || msg.contains("bao nhiêu") || msg.contains("tiền") || msg.contains("bảng giá")) {
            return "Dạ giá dịch vụ bên em rất phải chăng, chỉ từ 150.000đ đến 800.000đ. Anh/chị có thể xem chi tiết bảng giá và hình ảnh thực tế bằng cách bấm vào mục 'Dịch vụ' trên thanh điều hướng nhé!";
        }
        if (msg.contains("đặt lịch") || msg.contains("hẹn") || msg.contains("đặt phòng") || msg.contains("booking")) {
            return "Dạ anh/chị có thể tự đặt lịch hẹn online nhanh chóng bằng cách bấm vào nút 'Đặt lịch ngay' ở trang chủ, hệ thống bên em hỗ trợ chọn chi nhánh, kỹ thuật viên yêu thích và thanh toán cọc VNPay vô cùng tiện lợi ạ!";
        }
        if (msg.contains("chi nhánh") || msg.contains("địa chỉ") || msg.contains("ở đâu") || msg.contains("địa điểm")) {
            return "Dạ Lumière Spa hiện có 3 chi nhánh sang trọng tại TP.HCM:\n- CN1: 123 Lê Lợi, Quận 1\n- CN2: 456 Nguyễn Văn Linh, Quận 7\n- CN3: 789 Thảo Điền, Quận 2\nSpa mở cửa từ 9h00 đến 21h00 hàng ngày ạ.";
        }
        if (msg.contains("khuyến mãi") || msg.contains("voucher") || msg.contains("giảm giá") || msg.contains("code")) {
            return "Dạ bên em đang có chương trình tích điểm lòng trung thành đổi voucher giảm giá trực tiếp khi đặt lịch online ạ. Anh/chị có thể kiểm tra số điểm tích lũy của mình trong trang Hồ sơ cá nhân nhé!";
        }
        
        return "Dạ Lumière Spa đã ghi nhận câu hỏi của anh/chị. Anh/chị có thể tham khảo thông tin chi tiết trên menu website, hoặc nhắn trực tiếp số điện thoại để bên em gọi lại tư vấn kỹ hơn cho mình nhé!";
    }
}
