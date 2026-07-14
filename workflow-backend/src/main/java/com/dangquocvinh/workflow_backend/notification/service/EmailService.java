package com.dangquocvinh.workflow_backend.notification.service;

import com.dangquocvinh.workflow_backend.booking.entity.Appointment;
import com.dangquocvinh.workflow_backend.booking.entity.AppointmentService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    private void sendEmailAsync(String to, String subject, String htmlContent) {
        CompletableFuture.runAsync(() -> {
            try {
                MimeMessage message = mailSender.createMimeMessage();
                MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
                
                helper.setTo(to);
                helper.setSubject(subject);
                helper.setText(htmlContent, true);

                mailSender.send(message);
                log.info("Đã gửi email thành công tới: {} | Tiêu đề: {}", to, subject);
            } catch (MessagingException e) {
                log.error("Lỗi khi gửi email nhắc lịch cho {}", to, e);
            } catch (Exception e) {
                log.error("Lỗi không xác định khi gửi email: {}", e.getMessage());
            }
        });
    }

    public void sendReminderEmail(Appointment appointment) {
        if (appointment.getCustomer() == null || appointment.getCustomer().getEmail() == null) {
            log.warn("Lịch hẹn {} không có email khách hàng. Bỏ qua.", appointment.getId());
            return;
        }

        String to = appointment.getCustomer().getEmail();
        String customerName = appointment.getCustomer().getFullName();
        String dateStr = appointment.getStartAt().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
        String branchName = appointment.getBranch() != null ? appointment.getBranch().getName() : "Lumière Spa";
        String branchAddress = appointment.getBranch() != null ? appointment.getBranch().getAddress() : "";

        String subject = "Lumière Spa - Nhắc Lịch Hẹn Sắp Tới!";
        String htmlContent = buildReminderHtml(customerName, dateStr, branchName, branchAddress, appointment);

        sendEmailAsync(to, subject, htmlContent);
    }

    public void sendBookingReceivedEmail(Appointment appointment) {
        if (appointment.getCustomer() == null || appointment.getCustomer().getEmail() == null) {
            log.warn("Lịch hẹn {} không có email khách hàng. Bỏ qua.", appointment.getId());
            return;
        }

        String to = appointment.getCustomer().getEmail();
        String customerName = appointment.getCustomer().getFullName();
        String dateStr = appointment.getStartAt().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
        String branchName = appointment.getBranch() != null ? appointment.getBranch().getName() : "Lumière Spa";
        String branchAddress = appointment.getBranch() != null ? appointment.getBranch().getAddress() : "";

        String subject = "Lumière Spa - Đặt Lịch Hẹn Thành Công!";
        String htmlContent = buildReceivedHtml(customerName, dateStr, branchName, branchAddress, appointment);

        sendEmailAsync(to, subject, htmlContent);
    }

    public void sendAppointmentConfirmedEmail(Appointment appointment) {
        if (appointment.getCustomer() == null || appointment.getCustomer().getEmail() == null) {
            log.warn("Lịch hẹn {} không có email khách hàng. Bỏ qua.", appointment.getId());
            return;
        }

        String to = appointment.getCustomer().getEmail();
        String customerName = appointment.getCustomer().getFullName();
        String dateStr = appointment.getStartAt().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
        String branchName = appointment.getBranch() != null ? appointment.getBranch().getName() : "Lumière Spa";
        String branchAddress = appointment.getBranch() != null ? appointment.getBranch().getAddress() : "";

        String subject = "Lumière Spa - Lịch Hẹn Đã Được Xác Nhận!";
        String htmlContent = buildConfirmedHtml(customerName, dateStr, branchName, branchAddress, appointment);

        sendEmailAsync(to, subject, htmlContent);
    }

    public void sendAppointmentCancelledEmail(Appointment appointment) {
        if (appointment.getCustomer() == null || appointment.getCustomer().getEmail() == null) {
            log.warn("Lịch hẹn {} không có email khách hàng. Bỏ qua.", appointment.getId());
            return;
        }

        String to = appointment.getCustomer().getEmail();
        String customerName = appointment.getCustomer().getFullName();
        String dateStr = appointment.getStartAt().format(DateTimeFormatter.ofPattern("HH:mm - dd/MM/yyyy"));
        String branchName = appointment.getBranch() != null ? appointment.getBranch().getName() : "Lumière Spa";
        String branchAddress = appointment.getBranch() != null ? appointment.getBranch().getAddress() : "";

        String subject = "Lumière Spa - Thông Báo Hủy Lịch Hẹn";
        String htmlContent = buildCancelledHtml(customerName, dateStr, branchName, branchAddress, appointment);

        sendEmailAsync(to, subject, htmlContent);
    }

    private String buildServicesHtml(Appointment appointment) {
        StringBuilder servicesHtml = new StringBuilder();
        if (appointment.getServices() != null && !appointment.getServices().isEmpty()) {
            servicesHtml.append("<div style=\"border-top: 1px dashed #e2e8f0; margin-top: 15px; padding-top: 15px;\">");
            servicesHtml.append("<p style=\"margin: 5px 0; font-weight: bold; color: #064e3b;\">Dịch vụ đã chọn:</p>");
            servicesHtml.append("<ul style=\"margin: 5px 0; padding-left: 20px; font-size: 14px;\">");
            for (AppointmentService service : appointment.getServices()) {
                servicesHtml.append("<li style=\"margin-bottom: 5px;\">")
                        .append(service.getServiceName())
                        .append(" (")
                        .append(service.getPrice().intValue())
                        .append("đ - ")
                        .append(service.getDurationMinutes())
                        .append(" phút)</li>");
            }
            servicesHtml.append("</ul>");
            servicesHtml.append("</div>");
        }
        return servicesHtml.toString();
    }

    private String buildReminderHtml(String name, String date, String branch, String address, Appointment appointment) {
        String servicesBlock = buildServicesHtml(appointment);
        String totalAmountStr = appointment.getTotalAmount() != null ? appointment.getTotalAmount().intValue() + "đ" : "0đ";
        
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">" +
               "<div style=\"background-color: #064e3b; padding: 30px; text-align: center;\">" +
               "<h1 style=\"color: #d4af37; margin: 0; font-family: 'Georgia', serif;\">LUMIÈRE SPA</h1>" +
               "</div>" +
               "<div style=\"padding: 30px; background-color: #f9f8f6; color: #1f2937;\">" +
               "<p style=\"font-size: 16px;\">Xin chào <strong>" + name + "</strong>,</p>" +
               "<p style=\"font-size: 16px; line-height: 1.5;\">Lumière Spa trân trọng nhắc bạn về lịch hẹn chăm sóc sức khỏe & sắc đẹp sắp tới. Chúng tôi đã chuẩn bị sẵn sàng dịch vụ tốt nhất để tiếp đón bạn.</p>" +
               "<div style=\"background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #d4af37; box-shadow: 0 4px 6px rgba(0,0,0,0.02);\">" +
               "<p style=\"margin: 5px 0;\"><strong>Thời gian:</strong> " + date + "</p>" +
               "<p style=\"margin: 5px 0;\"><strong>Địa điểm:</strong> " + branch + "</p>" +
               "<p style=\"margin: 5px 0; font-size: 14px; color: #6b7280;\">" + address + "</p>" +
               servicesBlock +
               "<p style=\"margin: 15px 0 5px 0; border-top: 1px solid #e2e8f0; padding-top: 10px;\"><strong>Tổng chi phí:</strong> <span style=\"color: #064e3b; font-size: 16px; font-weight: bold;\">" + totalAmountStr + "</span></p>" +
               "</div>" +
               "<p style=\"font-size: 14px; color: #4b5563; line-height: 1.5;\">Vui lòng đến đúng giờ để có trải nghiệm trọn vẹn nhất. Nếu cần hỗ trợ hoặc đổi lịch, xin vui lòng liên hệ Hotline của chúng tôi.</p>" +
               "<div style=\"text-align: center; margin-top: 30px;\">" +
               "<a href=\"http://localhost:5173/my-appointments\" style=\"background-color: #064e3b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px; display: inline-block;\">XEM CHI TIẾT LỊCH HẸN</a>" +
               "</div>" +
               "</div>" +
               "<div style=\"background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">" +
               "<p style=\"margin: 0;\">© 2026 Lumière Spa. All rights reserved.</p>" +
               "</div>" +
               "</div>";
    }

    private String buildReceivedHtml(String name, String date, String branch, String address, Appointment appointment) {
        String servicesBlock = buildServicesHtml(appointment);
        String totalAmountStr = appointment.getTotalAmount() != null ? appointment.getTotalAmount().intValue() + "đ" : "0đ";
        
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">" +
               "<div style=\"background-color: #064e3b; padding: 30px; text-align: center;\">" +
               "<h1 style=\"color: #d4af37; margin: 0; font-family: 'Georgia', serif;\">LUMIÈRE SPA</h1>" +
               "</div>" +
               "<div style=\"padding: 30px; background-color: #f9f8f6; color: #1f2937;\">" +
               "<p style=\"font-size: 16px;\">Xin chào <strong>" + name + "</strong>,</p>" +
               "<p style=\"font-size: 16px; line-height: 1.5;\">Cảm ơn bạn đã tin tưởng lựa chọn Lumière Spa! Yêu cầu đặt lịch hẹn của bạn đã được tiếp nhận thành công và đang chờ nhân viên kiểm tra duyệt.</p>" +
               "<div style=\"background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #064e3b; box-shadow: 0 4px 6px rgba(0,0,0,0.02);\">" +
               "<p style=\"margin: 5px 0;\"><strong>Trạng thái:</strong> <span style=\"color: #f59e0b; font-weight: bold;\">Đang chờ xác nhận</span></p>" +
               "<p style=\"margin: 5px 0;\"><strong>Thời gian dự kiến:</strong> " + date + "</p>" +
               "<p style=\"margin: 5px 0;\"><strong>Địa điểm:</strong> " + branch + "</p>" +
               "<p style=\"margin: 5px 0; font-size: 14px; color: #6b7280;\">" + address + "</p>" +
               servicesBlock +
               "<p style=\"margin: 15px 0 5px 0; border-top: 1px solid #e2e8f0; padding-top: 10px;\"><strong>Tổng chi phí tạm tính:</strong> <span style=\"color: #064e3b; font-size: 16px; font-weight: bold;\">" + totalAmountStr + "</span></p>" +
               "</div>" +
               "<p style=\"font-size: 14px; color: #4b5563; line-height: 1.5;\">Chúng tôi sẽ gửi email thông báo xác nhận ngay khi lịch được duyệt. Cảm ơn sự kiên nhẫn của bạn!</p>" +
               "<div style=\"text-align: center; margin-top: 30px;\">" +
               "<a href=\"http://localhost:5173/my-appointments\" style=\"background-color: #064e3b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px; display: inline-block;\">XEM LỊCH HẸN CỦA TÔI</a>" +
               "</div>" +
               "</div>" +
               "<div style=\"background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">" +
               "<p style=\"margin: 0;\">© 2026 Lumière Spa. All rights reserved.</p>" +
               "</div>" +
               "</div>";
    }

    private String buildConfirmedHtml(String name, String date, String branch, String address, Appointment appointment) {
        String servicesBlock = buildServicesHtml(appointment);
        String totalAmountStr = appointment.getTotalAmount() != null ? appointment.getTotalAmount().intValue() + "đ" : "0đ";
        
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">" +
               "<div style=\"background-color: #064e3b; padding: 30px; text-align: center;\">" +
               "<h1 style=\"color: #d4af37; margin: 0; font-family: 'Georgia', serif;\">LUMIÈRE SPA</h1>" +
               "</div>" +
               "<div style=\"padding: 30px; background-color: #f9f8f6; color: #1f2937;\">" +
               "<p style=\"font-size: 16px;\">Xin chào <strong>" + name + "</strong>,</p>" +
               "<p style=\"font-size: 16px; line-height: 1.5;\">Tin vui! Lịch hẹn chăm sóc sức khỏe & sắc đẹp của bạn đã được <strong>xác nhận thành công</strong>. Hãy chuẩn bị tận hưởng trải nghiệm dịch vụ đẳng cấp tại spa của chúng tôi.</p>" +
               "<div style=\"background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; box-shadow: 0 4px 6px rgba(0,0,0,0.02);\">" +
               "<p style=\"margin: 5px 0;\"><strong>Trạng thái:</strong> <span style=\"color: #10b981; font-weight: bold;\">Đã xác nhận</span></p>" +
               "<p style=\"margin: 5px 0;\"><strong>Thời gian:</strong> " + date + "</p>" +
               "<p style=\"margin: 5px 0;\"><strong>Địa điểm:</strong> " + branch + "</p>" +
               "<p style=\"margin: 5px 0; font-size: 14px; color: #6b7280;\">" + address + "</p>" +
               servicesBlock +
               "<p style=\"margin: 15px 0 5px 0; border-top: 1px solid #e2e8f0; padding-top: 10px;\"><strong>Tổng chi phí:</strong> <span style=\"color: #064e3b; font-size: 16px; font-weight: bold;\">" + totalAmountStr + "</span></p>" +
               "</div>" +
               "<p style=\"font-size: 14px; color: #4b5563; line-height: 1.5;\">Rất mong được tiếp đón bạn đúng giờ để phục vụ chu đáo nhất. Trân trọng!</p>" +
               "<div style=\"text-align: center; margin-top: 30px;\">" +
               "<a href=\"http://localhost:5173/my-appointments\" style=\"background-color: #064e3b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px; display: inline-block;\">XEM CHI TIẾT LỊCH HẸN</a>" +
               "</div>" +
               "</div>" +
               "<div style=\"background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">" +
               "<p style=\"margin: 0;\">© 2026 Lumière Spa. All rights reserved.</p>" +
               "</div>" +
               "</div>";
    }

    private String buildCancelledHtml(String name, String date, String branch, String address, Appointment appointment) {
        String servicesBlock = buildServicesHtml(appointment);
        
        return "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;\">" +
               "<div style=\"background-color: #7f1d1d; padding: 30px; text-align: center;\">" +
               "<h1 style=\"color: #ffffff; margin: 0; font-family: 'Georgia', serif;\">LUMIÈRE SPA</h1>" +
               "</div>" +
               "<div style=\"padding: 30px; background-color: #f9f8f6; color: #1f2937;\">" +
               "<p style=\"font-size: 16px;\">Xin chào <strong>" + name + "</strong>,</p>" +
               "<p style=\"font-size: 16px; line-height: 1.5;\">Lumière Spa xin thông báo lịch hẹn của bạn đã được hủy bỏ thành công theo yêu cầu của bạn hoặc do chính sách hệ thống.</p>" +
               "<div style=\"background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444; box-shadow: 0 4px 6px rgba(0,0,0,0.02);\">" +
               "<p style=\"margin: 5px 0;\"><strong>Trạng thái:</strong> <span style=\"color: #ef4444; font-weight: bold;\">Đã Hủy</span></p>" +
               "<p style=\"margin: 5px 0;\"><strong>Lịch hẹn dự kiến ban đầu:</strong> " + date + "</p>" +
               "<p style=\"margin: 5px 0;\"><strong>Chi nhánh:</strong> " + branch + "</p>" +
               servicesBlock +
               "</div>" +
               "<p style=\"font-size: 14px; color: #4b5563; line-height: 1.5;\">Chúng tôi rất tiếc khi chưa có cơ hội được phục vụ bạn vào khung giờ này. Hy vọng sẽ được đồng hành cùng bạn chăm sóc sức khỏe và sắc đẹp ở những lịch hẹn tiếp theo.</p>" +
               "<div style=\"text-align: center; margin-top: 30px;\">" +
               "<a href=\"http://localhost:5173/\" style=\"background-color: #064e3b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; letter-spacing: 1px; display: inline-block;\">ĐẶT LỊCH HẸN MỚI</a>" +
               "</div>" +
               "</div>" +
               "<div style=\"background-color: #e2e8f0; padding: 15px; text-align: center; font-size: 12px; color: #64748b;\">" +
               "<p style=\"margin: 0;\">© 2026 Lumière Spa. All rights reserved.</p>" +
               "</div>" +
               "</div>";
    }
}
