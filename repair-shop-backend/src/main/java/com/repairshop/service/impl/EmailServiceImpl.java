package com.repairshop.service.impl;

import com.repairshop.exception.BadRequestException;
import com.repairshop.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

@Service
@Slf4j
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Override
    public void sendOtpEmail(String toEmail, String fullName, String otp) {
        log.info("Bắt đầu xử lý gửi email OTP tới: {}", toEmail);

        if (fromEmail == null || fromEmail.trim().isEmpty() || mailSender == null) {
            log.warn("=======================================================================");
            log.warn("[EMAIL DEV MODE] Chưa cấu hình MAIL_USERNAME / MAIL_PASSWORD trong hệ thống!");
            log.warn("Đích đến: {} ({})", toEmail, fullName);
            log.warn("Mã OTP khôi phục mật khẩu: >>> {} <<<", otp);
            log.warn("Để gửi email thực tế qua Gmail, vui lòng cấu hình MAIL_USERNAME và MAIL_PASSWORD (mật khẩu ứng dụng 16 ký tự).");
            log.warn("=======================================================================");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, StandardCharsets.UTF_8.name());

            helper.setFrom(fromEmail, "RepairShop Management");
            helper.setTo(toEmail);
            helper.setSubject("[RepairShop] Mã xác thực đặt lại mật khẩu: " + otp);

            String htmlContent = buildOtpHtmlContent(fullName, otp);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Đã gửi email OTP thành công tới {}", toEmail);
        } catch (MessagingException e) {
            log.error("Lỗi khi tạo định dạng email cho {}: {}", toEmail, e.getMessage());
            throw new BadRequestException("Không thể gửi email xác thực. Vui lòng thử lại sau.");
        } catch (Exception e) {
            log.error("Lỗi khi gửi email qua SMTP: {}", e.getMessage(), e);
            throw new BadRequestException("Lỗi gửi email: " + e.getMessage() + ". Vui lòng kiểm tra lại cấu hình tài khoản mail hoặc mật khẩu ứng dụng Gmail.");
        }
    }

    private String buildOtpHtmlContent(String fullName, String otp) {
        String displayName = (fullName != null && !fullName.trim().isEmpty()) ? fullName : "Quý khách";
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='margin:0;padding:20px;background-color:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,sans-serif;'>"
                + "  <div style='max-width:520px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 16px rgba(0,0,0,0.06);border:1px solid #e2e8f0;'>"
                + "    <div style='background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:28px 24px;text-align:center;color:#ffffff;'>"
                + "      <h1 style='margin:0;font-size:24px;font-weight:800;letter-spacing:0.5px;'>🔧 RepairShop</h1>"
                + "      <p style='margin:6px 0 0;font-size:13px;opacity:0.9;'>Hệ thống quản lý & dịch vụ sửa chữa chuyên nghiệp</p>"
                + "    </div>"
                + "    <div style='padding:28px 24px;color:#1e293b;line-height:1.6;'>"
                + "      <p style='font-size:15px;margin-top:0;'>Xin chào <strong>" + displayName + "</strong>,</p>"
                + "      <p style='font-size:14px;color:#475569;'>Chúng tôi nhận được yêu cầu khôi phục mật khẩu cho tài khoản liên kết với địa chỉ email này. Dưới đây là mã xác thực OTP của bạn:</p>"
                + "      <div style='text-align:center;margin:28px 0;'>"
                + "        <div style='display:inline-block;background:#eef2ff;border:2px dashed #6366f1;border-radius:12px;padding:14px 32px;'>"
                + "          <span style='font-size:32px;font-weight:800;letter-spacing:8px;color:#4f46e5;font-family:monospace;'>" + otp + "</span>"
                + "        </div>"
                + "      </div>"
                + "      <p style='font-size:13px;color:#64748b;margin-bottom:8px;'>⚠️ Mã xác thực có hiệu lực trong vòng <strong>15 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai để bảo vệ tài khoản của bạn.</p>"
                + "      <p style='font-size:13px;color:#64748b;margin-top:0;'>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email hoặc đổi mật khẩu để bảo đảm an toàn.</p>"
                + "    </div>"
                + "    <div style='background:#f1f5f9;padding:16px 24px;text-align:center;font-size:12px;color:#94a3b8;border-top:1px solid #e2e8f0;'>"
                + "      <p style='margin:0;'>© 2026 RepairShop Management. Email tự động, vui lòng không trả lời thư này.</p>"
                + "    </div>"
                + "  </div>"
                + "</body>"
                + "</html>";
    }
}
