package com.dangquocvinh.workflow_backend.payment.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentStatus;
import com.dangquocvinh.workflow_backend.booking.entity.PaymentStatus;
import com.dangquocvinh.workflow_backend.booking.repository.AppointmentRepository;
import com.dangquocvinh.workflow_backend.payment.config.VNPayConfig;
import com.dangquocvinh.workflow_backend.payment.util.VNPayUtil;
import com.dangquocvinh.workflow_backend.notification.service.EmailService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final VNPayConfig vnPayConfig;
    private final AppointmentRepository appointmentRepository;
    private final EmailService emailService;

    @Transactional
    public String createPaymentUrl(UUID appointmentId, HttpServletRequest request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch hẹn"));

        if (appointment.getPaymentStatus() == PaymentStatus.PAID || appointment.getPaymentStatus() == PaymentStatus.PARTIALLY_PAID) {
            throw new IllegalStateException("Lịch hẹn này đã được thanh toán hoặc đặt cọc.");
        }

        BigDecimal amountToPay = appointment.getFinalAmount() != null ? appointment.getFinalAmount() : appointment.getTotalAmount();
        // Đặt cọc 30%
        amountToPay = amountToPay.multiply(new BigDecimal("0.3"));
        long amount = amountToPay.multiply(new BigDecimal("100")).longValue();
        String vnp_TxnRef = VNPayUtil.getRandomNumber(8) + "-" + appointmentId.toString().substring(0, 8);
        String vnp_IpAddr = VNPayUtil.getIpAddress(request);
        String vnp_TmnCode = vnPayConfig.getVnp_TmnCode();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_BankCode", "NCB"); // Can be omitted to let user choose, but usually NCB is used for sandbox testing
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan lich hen " + appointmentId);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", vnPayConfig.getVnp_ReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        formatter.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        // Build string to hash
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }

        String queryUrl = query.toString();
        String vnp_SecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;

        return vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;
    }

    @Transactional
    public Map<String, Object> verifyPayment(Map<String, String> fields) {
        Map<String, Object> result = new HashMap<>();

        try {
            String vnp_SecureHash = fields.get("vnp_SecureHash");
            fields.remove("vnp_SecureHash");
            fields.remove("vnp_SecureHashType");

            List<String> fieldNames = new ArrayList<>(fields.keySet());
            Collections.sort(fieldNames);
            StringBuilder hashData = new StringBuilder();
            Iterator<String> itr = fieldNames.iterator();
            while (itr.hasNext()) {
                String fieldName = itr.next();
                String fieldValue = fields.get(fieldName);
                if ((fieldValue != null) && (fieldValue.length() > 0)) {
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                    if (itr.hasNext()) {
                        hashData.append('&');
                    }
                }
            }

            String signValue = VNPayUtil.hmacSHA512(vnPayConfig.getVnp_HashSecret(), hashData.toString());
            
            if (signValue.equals(vnp_SecureHash)) {
                String responseCode = fields.get("vnp_ResponseCode");
                String orderInfo = fields.get("vnp_OrderInfo");
                String transactionNo = fields.get("vnp_TransactionNo");

                // Parse UUID from orderInfo "Thanh toan lich hen <UUID>"
                UUID appointmentId = UUID.fromString(orderInfo.replace("Thanh toan lich hen ", ""));
                Appointment appointment = appointmentRepository.findById(appointmentId).orElse(null);

                if (appointment != null) {
                    if ("00".equals(responseCode)) {
                        appointment.setPaymentStatus(PaymentStatus.PARTIALLY_PAID);
                        appointment.setTransactionId(transactionNo);
                        
                        boolean shouldSendConfirmedEmail = false;
                        // Optional: mark confirmed if it was pending
                        if (appointment.getStatus() == AppointmentStatus.PENDING) {
                            appointment.setStatus(AppointmentStatus.CONFIRMED);
                            shouldSendConfirmedEmail = true;
                        }
                        
                        Appointment saved = appointmentRepository.save(appointment);
                        
                        if (shouldSendConfirmedEmail) {
                            try {
                                emailService.sendAppointmentConfirmedEmail(saved);
                            } catch (Exception e) {
                                // Log and ignore
                            }
                        }
                        
                        result.put("status", "success");
                        result.put("message", "Thanh toán thành công");
                    } else {
                        appointment.setPaymentStatus(PaymentStatus.FAILED);
                        appointmentRepository.save(appointment);
                        result.put("status", "failed");
                        result.put("message", "Thanh toán thất bại, mã lỗi: " + responseCode);
                    }
                } else {
                    result.put("status", "error");
                    result.put("message", "Không tìm thấy lịch hẹn tương ứng");
                }
            } else {
                result.put("status", "error");
                result.put("message", "Chữ ký không hợp lệ");
            }
        } catch (Exception e) {
            result.put("status", "error");
            result.put("message", "Đã xảy ra lỗi trong quá trình xác thực");
        }

        return result;
    }
}
